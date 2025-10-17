<?php
header('Content-Type: application/json');
error_reporting(E_ERROR | E_PARSE);
ini_set('display_errors', 0);
ini_set('display_startup_errors', 0);

// require_once __DIR__ . '/../../vendor/autoload.php';
// use MercadoPago\Client\Preference\PreferenceClient;
// use MercadoPago\MercadoPagoConfig;

// MercadoPagoConfig::setAccessToken("APP_USR-3116660017260656-101416-b076654c1ec24219b73242f8f92e9c8d-2925612020");
// $client = new PreferenceClient();

// Get JSON input
$input = json_decode(file_get_contents('php://input'), true);

$items = [];
$total = 0;

if (isset($input['items']) && is_array($input['items'])) {
    foreach ($input['items'] as $item) {
        $items[] = [
            "id" => $item['id'],
            "title" => $item['name'],
            "quantity" => $item['quantity'],
            "unit_price" => $item['price']
        ];
        $total += $item['price'] * $item['quantity'];
    }
}

try {
    // For testing/development, return a mock preference ID
    $mockPreferenceId = 'TEST_' . time() . '_' . rand(1000, 9999);

    // Save order to database with mock ID
    if (isset($input['customer'])) {
        saveOrderToDatabase($input['items'], $total, $input['customer'], $mockPreferenceId);
    }

    echo json_encode(['id' => $mockPreferenceId]);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to create MercadoPago preference: ' . $e->getMessage() . ' - Line: ' . $e->getLine() . ' - File: ' . basename($e->getFile())]);
}

function saveOrderToDatabase($items, $total, $customer, $preferenceId) {
    // Database connection
    $servername = "127.0.0.1";
    $username = "root";
    $password = "";
    $dbname = "lasdosreinas";

    $conn = new mysqli($servername, $username, $password, $dbname);

    if ($conn->connect_error) {
        throw new Exception("Connection failed: " . $conn->connect_error);
    }

    // Insert order
    $stmt = $conn->prepare("INSERT INTO pedido (fecha, monto_total, estado, nombre_cliente, email_cliente, telefono_cliente, metodo_pago, preference_id) VALUES (CURDATE(), ?, 'inicializando', ?, ?, ?, 'tarjeta', ?)");
    $name = $customer['name'] . ' ' . $customer['lastname'];
    $email = $customer['email'];
    $phone = $customer['phone'];
    $stmt->bind_param("dssss", $total, $name, $email, $phone, $preferenceId);
    $result = $stmt->execute();
    if (!$result) {
        throw new Exception("Error inserting order: " . $stmt->error);
    }
    $orderId = $conn->insert_id;

    // Insert order items
    foreach ($items as $item) {
        $stmt2 = $conn->prepare("INSERT INTO contiene (id_pedido, id_producto, cantidad, precio_unitario) VALUES (?, ?, ?, ?)");
        $stmt2->bind_param("iiid", $orderId, $item['id'], $item['quantity'], $item['price']);
        $result = $stmt2->execute();
        if (!$result) {
            throw new Exception("Error inserting order item: " . $stmt2->error);
        }
        $stmt2->close();
    }

    $stmt->close();
    $conn->close();
}
?>