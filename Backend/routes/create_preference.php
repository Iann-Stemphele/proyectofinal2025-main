<?php
header('Content-Type: application/json');
error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);

// Log raw input for debugging
$raw = file_get_contents('php://input');
error_log("create_preference payload: " . $raw);
$input = json_decode($raw, true);

if (!$input || !isset($input['items']) || !is_array($input['items']) || empty($input['items'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid input: items required']);
    exit;
}

// customer is optional but recommended; capture if present
$customer = $input['customer'] ?? ['name'=>'', 'lastname'=>'', 'email'=>'', 'phone'=>''];

// Build MercadoPago items
$mp_items = [];
$total = 0;
foreach ($input['items'] as $it) {
    $qty = max(1, (int)($it['quantity'] ?? $it['cantidad'] ?? 1));
    $price = max(0.0, (float)($it['price'] ?? $it['precio'] ?? $it['unit_price'] ?? 0));
    $mp_items[] = [
        'title' => $it['name'] ?? $it['title'] ?? 'Producto',
        'quantity' => $qty,
        'unit_price' => $price
    ];
    $total += $price * $qty;
}

// --- CONFIG: usa aquí tu ACCESS_TOKEN PRIVADO (sandbox o prod) ---
$access_token = 'APP_USR-3116660017260656-101416-b076654c1ec24219b73242f8f92e9c8d-2925612020';
// --------------------------------------------------------------

// Primero crear el pedido en la base de datos
try {
    // Database connection
    $servername = "sql306.infinityfree.com";
    $username = "if0_40194248";
    $password = "LasDosReinas";
    $dbname = "lasdosreinas";

    $conn = new mysqli($servername, $username, $password, $dbname);
    if ($conn->connect_error) {
        throw new Exception('DB connect error: ' . $conn->connect_error);
    }

    // Crear pedido
    $name = trim(($customer['name'] ?? '') . ' ' . ($customer['lastname'] ?? ''));
    $email = $customer['email'] ?? '';
    $phone = $customer['phone'] ?? '';

    $insertOrderSql = "INSERT INTO pedido (fecha, monto_total, estado, nombre_cliente, email_cliente, telefono_cliente, metodo_pago, hora_inicio) VALUES (CURDATE(), ?, 'inicializando', ?, ?, ?, 'tarjeta', NOW())";
    $stmtOrder = $conn->prepare($insertOrderSql);
    if ($stmtOrder === false) {
        throw new Exception("Prepare failed: " . $conn->error);
    }

    $stmtOrder->bind_param("dsss", $total, $name, $email, $phone);
    if (!$stmtOrder->execute()) {
        throw new Exception("Error inserting order: " . $stmtOrder->error);
    }
    $orderId = $conn->insert_id;
    $stmtOrder->close();

    // Insertar items del pedido
    $insertItemStmt = $conn->prepare("INSERT INTO contiene (id_pedido, id_producto, cantidad, precio_unitario) VALUES (?, ?, ?, ?)");
    if ($insertItemStmt === false) {
        throw new Exception("Prepare failed: " . $conn->error);
    }

    foreach ($input['items'] as $item) {
        $prodId = isset($item['id']) ? (int)$item['id'] : 0;
        $quantity = isset($item['quantity']) ? (int)$item['quantity'] : 0;
        $price = isset($item['price']) ? (float)$item['price'] : 0.0;
        
        if ($prodId > 0 && $quantity > 0) {
            $insertItemStmt->bind_param("iiid", $orderId, $prodId, $quantity, $price);
            if (!$insertItemStmt->execute()) {
                throw new Exception("Error inserting item: " . $insertItemStmt->error);
            }
        }
    }
    $insertItemStmt->close();
    $conn->close();

} catch (Exception $e) {
    error_log("Error creating order: " . $e->getMessage());
    echo json_encode(['error' => 'Error creating order: ' . $e->getMessage()]);
    exit;
}

// back_urls apuntando a order_status.html con el ID del pedido
$back_success = 'https://lasdosreinas.wuaze.com/order_status.html?order_id=' . $orderId . '&status=success';
$back_failure = 'https://lasdosreinas.wuaze.com/order_status.html?order_id=' . $orderId . '&status=failure';
$back_pending = 'https://lasdosreinas.wuaze.com/order_status.html?order_id=' . $orderId . '&status=pending';

$payload = [
    'items' => $mp_items,
    'payer' => [
        'name' => $customer['name'] ?? '',
        'surname' => $customer['lastname'] ?? '',
        'email' => $customer['email'] ?? ''
    ],
    'back_urls' => [
        'success' => $back_success,
        'failure' => $back_failure,
        'pending' => $back_pending
    ],
    'auto_return' => 'approved',
    'external_reference' => (string)$orderId,
    'notification_url' => 'https://lasdosreinas.wuaze.com/Backend/routes/mercadopago_webhook.php'
];

error_log("create_preference -> payload to MP: " . json_encode($payload));

$ch = curl_init('https://api.mercadopago.com/checkout/preferences');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Authorization: Bearer ' . $access_token
]);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
$response = curl_exec($ch);
$httpcode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
if (curl_errno($ch)) {
    error_log("MP curl error: " . curl_error($ch));
}
curl_close($ch);

error_log("MP response code: {$httpcode} body: {$response}");

if ($httpcode < 200 || $httpcode >= 300) {
    http_response_code(500);
    echo json_encode(['error' => 'MP API failed', 'status' => $httpcode, 'raw' => $response]);
    exit;
}

$respJson = json_decode($response, true);
$preferenceId = $respJson['id'] ?? null;
$init_point = $respJson['init_point'] ?? ($respJson['sandbox_init_point'] ?? null);

if (!$preferenceId || !$init_point) {
    http_response_code(500);
    echo json_encode(['error' => 'MP did not return preference id/init_point', 'raw' => $respJson]);
    exit;
}

// -- Order was already created above --
$order_id = $orderId;

// return init_point and preference_id to frontend
// Si el cliente solicita HTML o añade ?open_tab=1, devolvemos una página que abre
// una segunda pestaña con el init_point y muestra el marcado de pago en la actual.
$wantHtml = isset($_GET['open_tab']) || (isset($_SERVER['HTTP_ACCEPT']) && strpos($_SERVER['HTTP_ACCEPT'], 'text/html') !== false);

if ($wantHtml) {
    // preparar datos para incrustar de forma segura en el HTML/JS
    $init_js = json_encode($init_point);
    $pref_js = json_encode($preferenceId);
    $order_js = json_encode($order_id);
    $total_js = json_encode($total);
    $items_js = json_encode($input['items'] ?? []);

    header('Content-Type: text/html; charset=utf-8');
    echo '<!doctype html><html><head><meta charset="utf-8"><title>Pagar pedido</title>
    <style>body{font-family:Arial,Helvetica,sans-serif;margin:20px} .box{max-width:720px;margin:auto;border:1px solid #ddd;padding:16px;border-radius:6px} button{background:#28a745;color:#fff;border:none;padding:10px 14px;border-radius:4px;cursor:pointer}</style>
    </head><body>
    <div class="box">
      <h2>Pagar pedido</h2>
      <p>Pedido ID: ' . htmlspecialchars((string)$order_id) . '</p>
      <p>Total: ' . htmlspecialchars((string)$total) . '</p>
      <div id="items"><h3>Items</h3><ul>';
    // listar items simple
    if (!empty($input['items']) && is_array($input['items'])) {
        foreach ($input['items'] as $it) {
            $label = htmlspecialchars(($it['name'] ?? $it['title'] ?? 'Producto') . ' x' . (($it['quantity'] ?? $it['cantidad'] ?? 1)));
            echo "<li>{$label}</li>";
        }
    } else {
        echo '<li>Sin items</li>';
    }
    echo '</ul></div>
      <p><button id="openPayment">Abrir ventana de pago (MercadoPago)</button></p>
      <p id="note">Se abrirá una nueva pestaña con MercadoPago. Mantén esta ventana para ver el resumen del pedido.</p>
    </div>

    <script>
      const initPoint = ' . $init_js . ';
      const pref = ' . $pref_js . ';
      const orderId = ' . $order_js . ';
      const total = ' . $total_js . ';
      const items = ' . $items_js . ';

      // Abrir automáticamente en nueva pestaña
      try {
        window.open(initPoint, "_blank");
      } catch(e) {
        console.warn("No se pudo abrir la pestaña automáticamente:", e);
      }

      document.getElementById("openPayment").addEventListener("click", function(){
        window.open(initPoint, "_blank");
      });
    </script>
    </body></html>';
    exit;
}

// Respuesta JSON por defecto (para llamadas AJAX/fetch)
echo json_encode([
  'ok' => true,
  'init_point' => $init_point,
  'preference_id' => $preferenceId,
  'id' => $preferenceId,
  'total' => $total,
  'order_id' => $order_id
]);
exit;
?>