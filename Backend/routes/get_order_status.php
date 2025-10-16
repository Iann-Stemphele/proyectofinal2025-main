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

$orderIdentifier = $_GET['order_id'] ?? '';

if (empty($orderIdentifier)) {
    echo json_encode(["error" => "No order identifier provided"]);
    exit;
}

// Try to find order by email or preference_id
$sql = "SELECT p.*, GROUP_CONCAT(
    CONCAT('{\"nombre\":\"', pr.nombre, '\",\"cantidad\":', c.cantidad, ',\"precio_unitario\":', c.precio_unitario, '}')
    SEPARATOR '|||'
) as items_json
FROM pedido p
LEFT JOIN contiene c ON p.id_pedido = c.id_pedido
LEFT JOIN producto pr ON c.id_producto = pr.id_Producto
WHERE p.email_cliente = ? OR p.preference_id = ?
GROUP BY p.id_pedido
ORDER BY p.hora_inicio DESC
LIMIT 1";

$stmt = $conn->prepare($sql);
$stmt->bind_param("ss", $orderIdentifier, $orderIdentifier);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    $row = $result->fetch_assoc();
    $order = $row;

    // Parse items JSON
    if ($row['items_json']) {
        $items = [];
        $itemStrings = explode('|||', $row['items_json']);
        foreach ($itemStrings as $itemString) {
            $items[] = json_decode($itemString, true);
        }
        $order['items'] = $items;
    } else {
        $order['items'] = [];
    }
    unset($order['items_json']);

    echo json_encode($order);
} else {
    echo json_encode(["error" => "Pedido no encontrado"]);
}

$stmt->close();
$conn->close();
?>