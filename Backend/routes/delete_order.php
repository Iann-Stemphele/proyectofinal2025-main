<?php
header('Content-Type: application/json');
error_reporting(E_ALL);
ini_set('display_errors', 1);

$input = json_decode(file_get_contents('php://input'), true);
if (!$input || !isset($input['orderId'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid input']);
    exit;
}

$orderId = (int)$input['orderId'];
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "LasDosReinas";

$conn = new mysqli($servername, $username, $password, $dbname);
if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(['error' => 'DB connection failed: ' . $conn->connect_error]);
    exit;
}

$conn->begin_transaction();
try {
    // delete contiene rows
    $stmt1 = $conn->prepare("DELETE FROM contiene WHERE id_pedido = ?");
    if ($stmt1 === false) throw new Exception("Prepare failed: " . $conn->error);
    $stmt1->bind_param("i", $orderId);
    $stmt1->execute();
    $stmt1->close();

    // delete pedido
    $stmt2 = $conn->prepare("DELETE FROM pedido WHERE id_pedido = ?");
    if ($stmt2 === false) throw new Exception("Prepare failed: " . $conn->error);
    $stmt2->bind_param("i", $orderId);
    $stmt2->execute();
    $affected = $stmt2->affected_rows;
    $stmt2->close();

    $conn->commit();
    $conn->close();

    if ($affected > 0) {
        echo json_encode(['ok' => true]);
    } else {
        http_response_code(404);
        echo json_encode(['error' => 'Order not found']);
    }
    exit;
} catch (Exception $e) {
    $conn->rollback();
    $conn->close();
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
    exit;
}
?>