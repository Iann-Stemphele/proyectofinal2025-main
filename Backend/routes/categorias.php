<?php
// Las Dos Reinas - Categories API Endpoint
// Serves products filtered by category for the frontend menu system

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type');

require_once '../config/database.php';

if (!isset($_GET['categoria'])) {
    echo json_encode(['error' => 'Categoría no especificada']);
    exit;
}

$categoria = $_GET['categoria'];

try {
    // Query products by category with proper field mapping for frontend
    $stmt = $pdo->prepare("SELECT id_Producto as id, nombre, descripcion, precio, stock_disponible, categoria FROM Producto WHERE categoria = ? ORDER BY nombre ASC");
    $stmt->execute([$categoria]);
    $productos = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Convert precio to float for proper JSON handling
    foreach ($productos as &$producto) {
        $producto['precio'] = (float) $producto['precio'];
        $producto['stock_disponible'] = (int) $producto['stock_disponible'];
    }
    
    echo json_encode($productos);
} catch (Exception $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
?>