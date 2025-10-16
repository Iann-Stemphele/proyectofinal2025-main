<?php
header('Content-Type: application/json');
error_reporting(E_ERROR | E_PARSE);
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);

// Database connection
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "lasdosreinas";

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    die(json_encode(["error" => "Connection failed: " . $conn->connect_error]));
}

// Get JSON input
$input = json_decode(file_get_contents('php://input'), true);

if (isset($input['items']) && isset($input['customer'])) {
    $total = $input['total'];

    // Insert order
    $stmt = $conn->prepare("INSERT INTO pedido (fecha, monto_total, estado, nombre_cliente, email_cliente, telefono_cliente, metodo_pago, hora_inicio) VALUES (CURDATE(), ?, 'inicializando', ?, ?, ?, 'efectivo', NOW())");
    $stmt->bind_param("dssss", $total, $input['customer']['name'] . ' ' . $input['customer']['lastname'], $input['customer']['email'], $input['customer']['phone'], $input['customer']['phone']);
    $stmt->execute();
    $orderId = $conn->insert_id;

    // Insert order items
    foreach ($input['items'] as $item) {
        $stmt = $conn->prepare("INSERT INTO contiene (id_pedido, id_producto, cantidad, precio_unitario) VALUES (?, ?, ?, ?)");
        $stmt->bind_param("iiid", $orderId, $item['id'], $item['quantity'], $item['price']);
        $stmt->execute();
    }

    echo json_encode(["success" => true, "orderId" => $orderId]);

    $stmt->close();
} else {
    echo json_encode(["error" => "Missing items or customer data"]);
}

$conn->close();
?>