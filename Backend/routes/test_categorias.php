<?php
// Test de conexión y diagnóstico para Backend/routes/categorias.php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

echo json_encode(['debug' => 'Inicio del test']);

try {
    // 1. Verificar si el archivo database.php existe
    $dbFile = '../config/database.php';
    if (!file_exists($dbFile)) {
        echo json_encode(['error' => 'Archivo database.php no encontrado en: ' . $dbFile]);
        exit;
    }
    
    echo json_encode(['debug' => 'database.php encontrado']);
    
    // 2. Incluir el archivo de configuración
    require_once $dbFile;
    
    echo json_encode(['debug' => 'database.php incluido exitosamente']);
    
    // 3. Verificar que $pdo existe
    if (!isset($pdo)) {
        echo json_encode(['error' => 'Variable $pdo no está definida']);
        exit;
    }
    
    echo json_encode(['debug' => 'Variable $pdo está definida']);
    
    // 4. Probar la conexión
    $stmt = $pdo->query("SELECT 1 as test");
    $result = $stmt->fetch();
    
    echo json_encode(['debug' => 'Conexión a DB exitosa', 'test_result' => $result]);
    
    // 5. Verificar las tablas existentes
    $stmt = $pdo->query("SHOW TABLES");
    $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);
    
    echo json_encode(['debug' => 'Tablas en la DB', 'tables' => $tables]);
    
    // 6. Verificar tabla Producto/producto
    $productTable = null;
    foreach ($tables as $table) {
        if (strtolower($table) === 'producto') {
            $productTable = $table;
            break;
        }
    }
    
    if (!$productTable) {
        echo json_encode(['error' => 'Tabla producto no encontrada', 'available_tables' => $tables]);
        exit;
    }
    
    echo json_encode(['debug' => 'Tabla producto encontrada como: ' . $productTable]);
    
    // 7. Verificar estructura de la tabla
    $stmt = $pdo->query("DESCRIBE $productTable");
    $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode(['debug' => 'Estructura de tabla producto', 'columns' => $columns]);
    
    // 8. Contar productos
    $stmt = $pdo->query("SELECT COUNT(*) as total FROM $productTable");
    $count = $stmt->fetch();
    
    echo json_encode(['debug' => 'Total de productos', 'count' => $count]);
    
    // 9. Obtener categorías disponibles
    $stmt = $pdo->query("SELECT DISTINCT categoria FROM $productTable WHERE categoria IS NOT NULL AND categoria != ''");
    $categorias = $stmt->fetchAll(PDO::FETCH_COLUMN);
    
    echo json_encode(['debug' => 'Categorías disponibles', 'categorias' => $categorias]);
    
    // 10. Probar una consulta real
    if (!empty($categorias)) {
        $categoria = $categorias[0];
        $stmt = $pdo->prepare("SELECT id_Producto as id, nombre, descripcion, precio, stock_disponible, categoria FROM $productTable WHERE categoria = ? ORDER BY nombre ASC LIMIT 3");
        $stmt->execute([$categoria]);
        $productos = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo json_encode(['debug' => 'Productos de prueba para categoría: ' . $categoria, 'productos' => $productos]);
    }
    
    echo json_encode(['success' => 'Todas las verificaciones pasaron exitosamente']);
    
} catch (Exception $e) {
    echo json_encode(['error' => 'Error durante el test: ' . $e->getMessage(), 'trace' => $e->getTraceAsString()]);
}
?>