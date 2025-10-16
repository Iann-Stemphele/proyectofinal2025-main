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

// Get orders with items
$sql = "SELECT p.*, GROUP_CONCAT(
    CONCAT('{\"nombre\":\"', pr.nombre, '\",\"cantidad\":', c.cantidad, ',\"precio_unitario\":', c.precio_unitario, '}')
    SEPARATOR '|||'
) as items_json
FROM pedido p
LEFT JOIN contiene c ON p.id_pedido = c.id_pedido
LEFT JOIN producto pr ON c.id_producto = pr.id_Producto
GROUP BY p.id_pedido
ORDER BY p.hora_inicio DESC";

$result = $conn->query($sql);

$orders = [];
if ($result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
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
        $orders[] = $order;
    }
}

echo json_encode($orders);

$conn->close();
?>