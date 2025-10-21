<?php
header('Content-Type: application/json');
error_reporting(E_ALL);
ini_set('display_errors', 1);

try {
    $raw = file_get_contents('php://input');
    $input = json_decode($raw, true);
    if (!is_array($input)) throw new Exception('Payload JSON inválido.');

    // mínimo requerido
    $name = trim($input['customer']['name'] ?? '');
    $email = trim($input['customer']['email'] ?? '');
    $address = trim($input['customer']['address'] ?? '');
    $items = $input['items'] ?? [];

    if (strlen($name) < 3) throw new Exception('Nombre demasiado corto.');
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) throw new Exception('Email inválido.');
    if (strlen($address) < 5) throw new Exception('Dirección demasiado corta.');
    if (!is_array($items) || empty($items)) throw new Exception('No hay items en el pedido.');

    // load DB config if available
    $dbFile = __DIR__ . '/../config/database.php';
    if (file_exists($dbFile)) require_once $dbFile;

    $db_host = $host ?? 'sql306.infinityfree.com';
    $db_user = $user ?? 'if0_40194248';
    $db_pass = $pass ?? 'LasDosReinas';
    $db_name = $db ?? 'if0_40194248_lasdosreinas';

    $conn = new mysqli($db_host, $db_user, $db_pass, $db_name);
    if ($conn->connect_error) throw new Exception('DB connect error: ' . $conn->connect_error);

    // validar y obtener precios de los productos
    $ids = [];
    foreach ($items as $it) {
        $ids[] = (int)($it['id'] ?? 0);
    }
    $ids = array_values(array_filter($ids));
    if (empty($ids)) throw new Exception('Items inválidos.');

    $in = implode(',', array_map('intval', $ids));
    $res = $conn->query("SELECT id_Producto, precio, nombre FROM producto WHERE id_Producto IN ($in)");
    if ($res === false) throw new Exception('Error al obtener productos: ' . $conn->error);

    $products = [];
    while ($r = $res->fetch_assoc()) {
        $products[(int)$r['id_Producto']] = $r;
    }
    if (count($products) === 0) throw new Exception('No se encontraron productos pedidos.');

    // calcular total y preparar items para DB y MercadoPago
    $total = 0;
    $mp_items = [];
    foreach ($items as $it) {
        $pid = (int)($it['id'] ?? 0);
        $qty = max(1, (int)($it['qty'] ?? 1));
        if (!isset($products[$pid])) continue;
        $price = (float)$products[$pid]['precio'];
        $nameProd = $products[$pid]['nombre'] ?? 'Producto';
        $line_total = $price * $qty;
        $total += $line_total;

        $mp_items[] = [
            'title' => $nameProd,
            'quantity' => $qty,
            'unit_price' => (float)$price
        ];
    }
    if (empty($mp_items)) throw new Exception('Items inválidos después de validar.');

    // Begin transaction: insertar pedido y items
    $conn->begin_transaction();

    $stmt = $conn->prepare("INSERT INTO pedido (nombre, email, direccion, total, estado, fecha_creacion) VALUES (?, ?, ?, ?, 'pending', NOW())");
    if (!$stmt) throw new Exception('Prepare failed: ' . $conn->error);
    $stmt->bind_param('sssd', $name, $email, $address, $total);
    if (!$stmt->execute()) throw new Exception('Insert pedido failed: ' . $stmt->error);
    $order_id = $stmt->insert_id;
    $stmt->close();

    $stmtItem = $conn->prepare("INSERT INTO pedido_item (pedido_id, producto_id, cantidad, precio_unitario) VALUES (?, ?, ?, ?)");
    if (!$stmtItem) throw new Exception('Prepare item failed: ' . $conn->error);
    foreach ($items as $it) {
        $pid = (int)($it['id'] ?? 0);
        $qty = max(1, (int)($it['qty'] ?? 1));
        if (!isset($products[$pid])) continue;
        $price = (float)$products[$pid]['precio'];
        $stmtItem->bind_param('iiid', $order_id, $pid, $qty, $price);
        if (!$stmtItem->execute()) throw new Exception('Insert pedido_item failed: ' . $stmtItem->error);
    }
    $stmtItem->close();

    // Crear preferencia Mercado Pago (usa token desde config o define aquí)
    $mp_token_file = __DIR__ . '/../config/mercadopago.php';
    if (file_exists($mp_token_file)) require_once $mp_token_file;
    $MP_ACCESS_TOKEN = $MP_ACCESS_TOKEN ?? getenv('MP_ACCESS_TOKEN') ?: 'YOUR_ACCESS_TOKEN';

    $preference = [
        "items" => $mp_items,
        "external_reference" => (string)$order_id,
        "back_urls" => [
            "success" => "https://tu-sitio.infinityfreeapp.com/Frontend/order_status.html?order_id=$order_id",
            "failure" => "https://tu-sitio.infinityfreeapp.com/Frontend/order_status.html?order_id=$order_id&status=failure",
            "pending" => "https://tu-sitio.infinityfreeapp.com/Frontend/order_status.html?order_id=$order_id&status=pending"
        ],
        "auto_return" => "approved"
    ];

    // llamar API MercadoPago
    $ch = curl_init("https://api.mercadopago.com/checkout/preferences");
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        "Authorization: Bearer $MP_ACCESS_TOKEN",
        "Content-Type: application/json"
    ]);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($preference));
    $mp_res = curl_exec($ch);
    $httpcode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    if ($mp_res === false) {
        $c_err = curl_error($ch);
        curl_close($ch);
        throw new Exception('MP request failed: ' . $c_err);
    }
    curl_close($ch);
    $mp_data = json_decode($mp_res, true);
    if ($httpcode < 200 || $httpcode >= 300 || !isset($mp_data['id'])) {
        // puedes guardar el response para debug
        throw new Exception('Error al crear preferencia MP: ' . ($mp_res ?: 'no response'));
    }

    // guardar preference id en pedido (si tienes columna)
    $mp_pref_id = $mp_data['id'];
    $init_point = $mp_data['init_point'] ?? ($mp_data['sandbox_init_point'] ?? null);
    if ($init_point) {
        $upd = $conn->prepare("UPDATE pedido SET mp_pref_id = ? WHERE id_Pedido = ?");
        if ($upd) {
            $upd->bind_param('si', $mp_pref_id, $order_id);
            $upd->execute();
            $upd->close();
        }
    }

    $conn->commit();
    $conn->close();

    echo json_encode(['ok' => true, 'order_id' => $order_id, 'init_point' => $init_point]);
    exit;
} catch (Exception $e) {
    if (isset($conn) && $conn->connect_error === false) {
        @$conn->rollback();
        @$conn->close();
    }
    http_response_code(400);
    echo json_encode(['error' => $e->getMessage()]);
    error_log('create_order error: ' . $e->getMessage());
}
?>