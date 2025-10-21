<?php
header('Content-Type: application/json');
error_reporting(E_ERROR | E_PARSE);
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);

// Database connection
$servername = "sql306.infinityfree.com";
$username = "if0_40194248";
$password = "LasDosReinas";
$dbname = "if0_40194248_lasdosreinas";

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    die(json_encode(["error" => "Connection failed: " . $conn->connect_error]));
}

// Get JSON input
$input = json_decode(file_get_contents('php://input'), true);

if (isset($input['orderId']) && isset($input['estimatedTime'])) {
    $stmt = $conn->prepare("UPDATE pedido SET tiempo_estimado = ? WHERE id_pedido = ?");
    $estimatedTime = $input['estimatedTime'] ? intval($input['estimatedTime']) : null;
    $stmt->bind_param("ii", $estimatedTime, $input['orderId']);

    if ($stmt->execute()) {
        echo json_encode(["success" => true]);
    } else {
        echo json_encode(["error" => "Error updating estimated time"]);
    }

    $stmt->close();
} else {
    echo json_encode(["error" => "Missing orderId or estimatedTime"]);
}

$conn->close();
?>