<?php
// add_to_cart.php
header('Content-Type: application/json; charset=utf-8');
session_start();

// Leer body JSON
$body = json_decode(file_get_contents('php://input'), true) ?: $_POST;

if (empty($body['producto']) && empty($body['id'])) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'producto missing']);
    exit;
}

// Normalizar producto input
$producto = $body['producto'] ?? ['id' => $body['id'] ?? null];
$cantidad = isset($body['cantidad']) ? intval($body['cantidad']) : (isset($producto['quantity']) ? intval($producto['quantity']) : 1);
$cantidad = max(1, $cantidad);

// Si sólo viene id, intentar completar datos desde DB
$id = $producto['id'] ?? $producto['id_Producto'] ?? null;
$name = $producto['name'] ?? $producto['nombre'] ?? null;
$price = isset($producto['price']) ? floatval($producto['price']) : (isset($producto['precio']) ? floatval($producto['precio']) : null);
$description = $producto['description'] ?? $producto['descripcion'] ?? '';

// Conexión: preferir Backend/config/database.php
$dbPath = __DIR__ . '/../config/database.php';
if (file_exists($dbPath)) {
    include_once $dbPath; // debe definir $pdo
}
if (!isset($pdo) || !($pdo instanceof PDO)) {
    // Fallback seguro a XAMPP local
    try {
        $dsn = "mysql:host=localhost;dbname=if0_40194248_lasdosreinas;charset=utf8mb4";
        $pdo = new PDO($dsn, 'root', '', [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
        ]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['ok' => false, 'error' => 'DB connection failed: '.$e->getMessage()]);
        exit;
    }
}

// intentar completar datos desde DB si falta nombre/precio y existe config
if (($name === null || $price === null) && $id) {
    if (isset($pdo) && $pdo instanceof PDO) {
        $stmt = $pdo->prepare('SELECT id_Producto, nombre, descripcion, precio FROM producto WHERE id_Producto = ? LIMIT 1');
        $stmt->execute([$id]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        if ($row) {
            $name = $name ?? $row['nombre'];
            $price = $price ?? floatval($row['precio']);
            $description = $description ?: $row['descripcion'] ?? $description;
        }
    }
}

// Validación mínima
if (!$id && !$name) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'producto id o nombre requerido']);
    exit;
}

if ($price === null) $price = 0.0;

// Inicializar carrito en sesión
if (!isset($_SESSION['altCart']) || !is_array($_SESSION['altCart'])) {
    $_SESSION['altCart'] = [];
}

// Buscar item existente por id (si existe) o por nombre
$foundKey = null;
foreach ($_SESSION['altCart'] as $k => $it) {
    if (!empty($id) && isset($it['id']) && intval($it['id']) == intval($id)) { $foundKey = $k; break; }
    if (empty($id) && isset($it['name']) && $it['name'] === $name) { $foundKey = $k; break; }
}

if ($foundKey !== null) {
    // actualizar cantidad y precio por si cambió
    $_SESSION['altCart'][$foundKey]['quantity'] = intval($_SESSION['altCart'][$foundKey]['quantity']) + $cantidad;
    $_SESSION['altCart'][$foundKey]['price'] = $price;
} else {
    // agregar nuevo
    $_SESSION['altCart'][] = [
        'id' => $id,
        'name' => $name,
        'description' => $description,
        'price' => $price,
        'quantity' => $cantidad
    ];
}

// Construir response compatible
$items = array_map(function($it){
    return [
        'id' => $it['id'] ?? null,
        'id_producto' => $it['id'] ?? null,
        'name' => $it['name'] ?? ($it['nombre'] ?? ''),
        'nombre' => $it['name'] ?? ($it['nombre'] ?? ''),
        'precio' => isset($it['price']) ? floatval($it['price']) : 0,
        'price' => isset($it['price']) ? floatval($it['price']) : 0,
        'quantity' => intval($it['quantity'] ?? 1),
        'cantidad' => intval($it['quantity'] ?? 1),
        'description' => $it['description'] ?? ($it['descripcion'] ?? '')
    ];
}, $_SESSION['altCart']);

$total_items = array_reduce($items, function($sum, $it){ return $sum + intval($it['quantity']); }, 0);
$total_price = array_reduce($items, function($sum, $it){ return $sum + (floatval($it['price']) * intval($it['quantity'])); }, 0.0);

// Responder
echo json_encode([
    'ok' => true,
    'items' => $items,
    'total_items' => $total_items,
    'total_price' => round($total_price, 2)
]);
?>
