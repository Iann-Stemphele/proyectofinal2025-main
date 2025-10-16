<?php
header('Content-Type: application/json');
error_reporting(E_ERROR | E_PARSE);
ini_set('display_errors', 0);
ini_set('display_startup_errors', 0);

require_once __DIR__ . '/../../vendor/autoload.php';
use MercadoPago\Client\Preference\PreferenceClient;
use MercadoPago\MercadoPagoConfig;

MercadoPagoConfig::setAccessToken("APP_USR-3116660017260656-101416-b076654c1ec24219b73242f8f92e9c8d-2925612020");
$client = new PreferenceClient();

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
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to create MercadoPago preference: ' . $e->getMessage()]);
}

function saveOrderToDatabase($items, $total, $customer, $preferenceId) {
    // Database connection
    $servername = "localhost";
    $username = "root";
    $password = "";
    $dbname = "lasdosreinas";

    $conn = new mysqli($servername, $username, $password, $dbname);

    if ($conn->connect_error) {
        die("Connection failed: " . $conn->connect_error);
    }

    // Insert order
    $stmt = $conn->prepare("INSERT INTO pedido (fecha, monto_total, estado, nombre_cliente, metodo_pago, preference_id) VALUES (CURDATE(), ?, 'inicializando', ?, 'tarjeta', ?)");
    $stmt->bind_param("dss", $total, $customer['name'] . ' ' . $customer['lastname'], $preferenceId);
    $stmt->execute();
    $orderId = $conn->insert_id;

    // Insert order items
    foreach ($items as $item) {
        $stmt = $conn->prepare("INSERT INTO contiene (id_pedido, id_producto, cantidad, precio_unitario) VALUES (?, ?, ?, ?)");
        $stmt->bind_param("iiid", $orderId, $item['id'], $item['quantity'], $item['price']);
        $stmt->execute();
    }

    $stmt->close();
    $conn->close();
}
?>