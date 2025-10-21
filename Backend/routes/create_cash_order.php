<?php
header('Content-Type: application/json');
error_reporting(E_ALL);
ini_set('display_errors', 1);             // changed to 1 for local debugging
ini_set('display_startup_errors', 1);     // changed to 1 for local debugging

// Database connection
$servername = "sql306.infinityfree.com";
$username = "if0_40194248";
$password = "LasDosReinas";
$dbname = "if0_40194248_lasdosreinas";

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(["error" => "Connection failed: " . $conn->connect_error]);
    exit;
}

// Get JSON input
$input = json_decode(file_get_contents('php://input'), true);

if (isset($input['items']) && isset($input['customer'])) {
    // Basic validation
    $items = $input['items'];
    $customer = $input['customer'];
    $total = isset($input['total']) ? (float)$input['total'] : null;

    if (!is_array($items) || empty($items) || !$customer || $total === null) {
        http_response_code(400);
        echo json_encode(["error" => "Invalid or missing total/items/customer"]);
        $conn->close();
        exit;
    }

    // Start transaction
    $conn->begin_transaction();
    try {
        // Insert order
        $name = trim(($customer['name'] ?? '') . ' ' . ($customer['lastname'] ?? ''));
        $email = $customer['email'] ?? '';
        $phone = $customer['phone'] ?? '';

        $insertOrderSql = "INSERT INTO pedido (fecha, monto_total, estado, nombre_cliente, email_cliente, telefono_cliente, metodo_pago) VALUES (CURDATE(), ?, 'inicializando', ?, ?, ?, 'efectivo')";
        $stmtOrder = $conn->prepare($insertOrderSql);
        if ($stmtOrder === false) {
            throw new Exception("Prepare failed: " . $conn->error);
        }

        // Correct bind types: one double and three strings
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

            // Use store_result() + num_rows for portability (avoids get_result requirement)
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

        $conn->commit();

        echo json_encode(["success" => true, "orderId" => $orderId]);
    } catch (Exception $e) {
        $conn->rollback();
        http_response_code(500);
        // Log full error to apache/php log for debugging
        error_log("create_cash_order error: " . $e->getMessage() . " -- Trace: " . $e->getTraceAsString());
        echo json_encode(["error" => $e->getMessage()]);
    }
} else {
    http_response_code(400);
    echo json_encode(["error" => "Missing items or customer data"]);
}

$conn->close();
?>