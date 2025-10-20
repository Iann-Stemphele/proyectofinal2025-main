<?php
header('Content-Type: application/json');
error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);

// Get JSON input
$input = json_decode(file_get_contents('php://input'), true);

if (!$input || !isset($input['preference_id'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid input: preference_id required']);
    exit;
}

$preference_id = $input['preference_id'];

// Database connection
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "LasDosReinas";

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(["error" => "Connection failed: " . $conn->connect_error]);
    exit;
}

// Get temp preference data
$stmt = $conn->prepare("SELECT customer_json, items_json, total FROM temp_preference WHERE preference_id = ?");
if ($stmt) {
    $stmt->bind_param("s", $preference_id);
    $stmt->execute();
    $result = $stmt->get_result();
    if ($result->num_rows === 0) {
        http_response_code(404);
        echo json_encode(['error' => 'Temp preference not found']);
        $stmt->close();
        $conn->close();
        exit;
    }
    $row = $result->fetch_assoc();
    $customer = json_decode($row['customer_json'], true);
    $items = json_decode($row['items_json'], true);
    $total = $row['total'];
    $stmt->close();
} else {
    http_response_code(500);
    echo json_encode(['error' => 'Prepare failed: ' . $conn->error]);
    $conn->close();
    exit;
}

// Now create the actual order in pedido table
$conn->begin_transaction();
try {
    // Insert order
    $name = trim(($customer['name'] ?? '') . ' ' . ($customer['lastname'] ?? ''));
    $email = $customer['email'] ?? '';
    $phone = $customer['phone'] ?? '';

    $insertOrderSql = "INSERT INTO pedido (fecha, monto_total, estado, nombre_cliente, email_cliente, telefono_cliente, metodo_pago) VALUES (CURDATE(), ?, 'inicializando', ?, ?, ?, 'tarjeta')";
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

    // Insert order items
    $checkStmt = $conn->prepare("SELECT id_Producto FROM producto WHERE id_Producto = ?");
    if ($checkStmt === false) {
        throw new Exception("Prepare failed: " . $conn->error);
    }
    $insertItemStmt = $conn->prepare("INSERT INTO contiene (id_pedido, id_producto, cantidad, precio_unitario) VALUES (?, ?, ?, ?)");
    if ($insertItemStmt === false) {
        throw new Exception("Prepare failed: " . $conn->error);
    }

    foreach ($items as $item) {
        $prodId = isset($item['id']) ? (int)$item['id'] : 0;
        $quantity = isset($item['quantity']) ? (int)$item['quantity'] : 0;
        $price = isset($item['price']) ? (float)$item['price'] : 0.0;

        if ($prodId <= 0 || $quantity <= 0) {
            throw new Exception("Invalid product id or quantity in items");
        }

        $checkStmt->bind_param("i", $prodId);
        if (!$checkStmt->execute()) {
            throw new Exception("Error checking product: " . $checkStmt->error);
        }

        $checkStmt->store_result();
        if ($checkStmt->num_rows == 0) {
            throw new Exception("Product with ID {$prodId} does not exist");
        }

        $insertItemStmt->bind_param("iiid", $orderId, $prodId, $quantity, $price);
        if (!$insertItemStmt->execute()) {
            throw new Exception("Error inserting order item: " . $insertItemStmt->error);
        }
    }

    $checkStmt->close();
    $insertItemStmt->close();

    // Delete temp preference
    $deleteStmt = $conn->prepare("DELETE FROM temp_preference WHERE preference_id = ?");
    if ($deleteStmt) {
        $deleteStmt->bind_param("s", $preference_id);
        $deleteStmt->execute();
        $deleteStmt->close();
    }

    $conn->commit();

    echo json_encode(["success" => true, "orderId" => $orderId]);
} catch (Exception $e) {
    $conn->rollback();
    http_response_code(500);
    error_log("confirm_temp_preference error: " . $e->getMessage() . " -- Trace: " . $e->getTraceAsString());
    echo json_encode(["error" => $e->getMessage()]);
}

$conn->close();
?>