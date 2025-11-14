<?php
// get_cart.php
header('Content-Type: application/json; charset=utf-8');
session_start();

// Intentar incluir config de DB local
$dbPath = __DIR__ . '/../config/database.php';
if (file_exists($dbPath)) {
    include_once $dbPath; // debe definir $pdo
}
if (!isset($pdo) || !($pdo instanceof PDO)) {
    // Fallback opcional (no crítico para get_cart si carrito está en sesión)
    try {
        $dsn = "mysql:host=sql306.infinityfree.com;dbname=if0_40194248_lasdosreinas;charset=utf8mb4";
        $pdo = new PDO($dsn, 'if0_40194248', 'LasDosReinas', [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
        ]);
    } catch (Exception $e) {
        // no fatal aquí; continuamos devolviendo carrito de sesión
    }
}

// Si no hay carrito en sesión devolver vacío
if (!isset($_SESSION['altCart']) || !is_array($_SESSION['altCart'])) {
    echo json_encode(['ok' => true, 'items' => [], 'total_items' => 0, 'total_price' => 0.00]);
    exit;
}

$itemsRaw = $_SESSION['altCart'];

$items = array_map(function($it){
    return [
        'id' => $it['id'] ?? null,
        'id_Producto' => $it['id'] ?? null,
        'id_producto' => $it['id'] ?? null,
        'name' => $it['name'] ?? ($it['nombre'] ?? ''),
        'nombre' => $it['name'] ?? ($it['nombre'] ?? ''),
        'precio' => isset($it['price']) ? floatval($it['price']) : 0,
        'price' => isset($it['price']) ? floatval($it['price']) : 0,
        'quantity' => intval($it['quantity'] ?? 1),
        'cantidad' => intval($it['quantity'] ?? 1),
        'description' => $it['description'] ?? ($it['descripcion'] ?? '')
    ];
}, $itemsRaw);

$total_items = array_reduce($items, function($sum, $it){ return $sum + intval($it['quantity']); }, 0);
$total_price = array_reduce($items, function($sum, $it){ return $sum + (floatval($it['price']) * intval($it['quantity'])); }, 0.0);

echo json_encode([
    'ok' => true,
    'items' => $items,
    'total_items' => $total_items,
    'total_price' => round($total_price, 2)
]);
?>