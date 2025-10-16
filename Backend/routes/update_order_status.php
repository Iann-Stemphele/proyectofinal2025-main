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

if (isset($input['orderId']) && isset($input['status'])) {
    $stmt = $conn->prepare("UPDATE pedido SET estado = ? WHERE id_pedido = ?");
    $stmt->bind_param("si", $input['status'], $input['orderId']);

    if ($stmt->execute()) {
        echo json_encode(["success" => true]);
    } else {
        echo json_encode(["error" => "Error updating order status"]);
    }

    $stmt->close();
} else {
    echo json_encode(["error" => "Missing orderId or status"]);
}

$conn->close();
?>