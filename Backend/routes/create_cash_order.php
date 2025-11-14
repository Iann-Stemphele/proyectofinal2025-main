<?php
header('Content-Type: application/json; charset=utf-8');
session_start();

$body = json_decode(file_get_contents('php://input'), true);
if (!$body) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'Invalid JSON body']);
    exit;
}

$customer = $body['customer'] ?? null;
$items = $body['items'] ?? null;
$payment = $body['payment'] ?? 'efectivo';

if (!$customer || !is_array($items) || count($items) === 0) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'Missing customer or items']);
    exit;
}

// Incluir config DB local
$dbPath = __DIR__ . '/../config/database.php';
if (file_exists($dbPath)) {
    include_once $dbPath; // debe exponer $pdo
}
if (!isset($pdo) || !($pdo instanceof PDO)) {
    try {
        $dsn = "mysql:host=localhost;dbname=if0_40194248_lasdosreinas;charset=utf8mb4";
        $pdo = new PDO($dsn, 'root', '', [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
        ]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['ok' => false, 'error' => 'DB connection failed: '.$e->getMessage()]);
        exit;
    }
}

try {
    // calculate total
    $total = 0.0;
    foreach ($items as $it) {
        $price = isset($it['price']) ? floatval($it['price']) : (isset($it['precio']) ? floatval($it['precio']) : 0);
        $qty = isset($it['quantity']) ? intval($it['quantity']) : (isset($it['cantidad']) ? intval($it['cantidad']) : 1);
        $total += $price * $qty;
    }

    // transaction
    $pdo->beginTransaction();

    $stmt = $pdo->prepare("INSERT INTO pedido (fecha, monto_total, estado, nombre_cliente, email_cliente, telefono_cliente, metodo_pago, hora_inicio) VALUES (CURDATE(), ?, 'inicializando', ?, ?, ?, ?, NOW())");
    $stmt->execute([round($total,2), $customer['name'] ?? '', $customer['email'] ?? '', $customer['phone'] ?? '', $payment]);

    $orderId = $pdo->lastInsertId();
    if (!$orderId) throw new Exception('No se pudo obtener id del pedido');

    // insert contiene rows
    $ins = $pdo->prepare("INSERT INTO contiene (id_pedido, id_producto, cantidad, precio_unitario) VALUES (?, ?, ?, ?)");
    foreach ($items as $it) {
        $prodId = $it['id'] ?? $it['id_Producto'] ?? null;
        $price = isset($it['price']) ? floatval($it['price']) : (isset($it['precio']) ? floatval($it['precio']) : 0);
        $qty = isset($it['quantity']) ? intval($it['quantity']) : (isset($it['cantidad']) ? intval($it['cantidad']) : 1);
        $ins->execute([$orderId, $prodId, $qty, $price]);
    }

    $pdo->commit();

    // clear session cart if present
    if (isset($_SESSION['altCart'])) {
        unset($_SESSION['altCart']);
    }

    echo json_encode(['ok' => true, 'id_pedido' => (int)$orderId, 'total' => round($total,2)]);
    exit;

} catch (Exception $e) {
    if ($pdo && $pdo->inTransaction()) $pdo->rollBack();
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => $e->getMessage()]);
    exit;
}
?>