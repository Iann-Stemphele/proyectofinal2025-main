<?php
// Las Dos Reinas - Categories API Endpoint
// Serves products filtered by category for the frontend menu system

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type');

try {
    // Incluir configuración de base de datos
    require_once '../config/database.php';
    
    // Verificar que se proporcionó una categoría
    if (!isset($_GET['categoria'])) {
        throw new Exception('Categoría no especificada');
    }
    
    $categoria = $_GET['categoria'];
    
    // Crear conexión PDO
    $dsn = "mysql:host=$host;dbname=$db;charset=$charset";
    $options = [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,
    ];
    
    $pdo = new PDO($dsn, $user, $pass, $options);
    
    // Query products by category with proper field mapping for frontend
    $stmt = $pdo->prepare("SELECT id_Producto as id, nombre, descripcion, precio, stock_disponible, categoria FROM producto WHERE categoria = ? ORDER BY nombre ASC");
    $stmt->execute([$categoria]);
    $productos = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Convert precio to float for proper JSON handling
    foreach ($productos as &$producto) {
        $producto['precio'] = (float) $producto['precio'];
        $producto['stock_disponible'] = (int) $producto['stock_disponible'];
    }
    
    echo json_encode($productos);
    
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Error de base de datos: ' . $e->getMessage(),
        'code' => $e->getCode()
    ]);
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'error' => $e->getMessage()
    ]);
}
?>