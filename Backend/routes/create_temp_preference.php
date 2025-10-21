<?php
header('Content-Type: application/json');
error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);

// Get JSON input
$input = json_decode(file_get_contents('php://input'), true);

if (!$input || !isset($input['items']) || !is_array($input['items']) || empty($input['items'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid input: items required']);
    exit;
}

// customer is optional but recommended; capture if present
$customer = $input['customer'] ?? ['name'=>'', 'lastname'=>'', 'email'=>'', 'phone'=>''];

// Build items
$items = [];
$total = 0;
foreach ($input['items'] as $it) {
    $qty = max(1, (int)($it['quantity'] ?? $it['cantidad'] ?? 1));
    $price = max(0.0, (float)($it['price'] ?? $it['precio'] ?? $it['unit_price'] ?? 0));
    $items[] = [
        'id' => $it['id'] ?? null,
        'name' => $it['name'] ?? $it['title'] ?? 'Producto',
        'quantity' => $qty,
        'price' => $price
    ];
    $total += $price * $qty;
}

// Generate a temporary preference_id
$preference_id = 'temp_' . uniqid() . '_' . time();

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

// Insert into temp_preference table
$stmt = $conn->prepare("INSERT INTO temp_preference (preference_id, customer_json, items_json, total) VALUES (?, ?, ?, ?)");
if ($stmt) {
    $customer_json = json_encode($customer);
    $items_json = json_encode($items);
    $stmt->bind_param("sssd", $preference_id, $customer_json, $items_json, $total);
    if ($stmt->execute()) {
        echo json_encode([
            'ok' => true,
            'preference_id' => $preference_id,
            'total' => $total,
            'items' => $items,
            'customer' => $customer
        ]);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to save temp preference: ' . $stmt->error]);
    }
    $stmt->close();
} else {
    http_response_code(500);
    echo json_encode(['error' => 'Prepare failed: ' . $conn->error]);
}

$conn->close();
?>