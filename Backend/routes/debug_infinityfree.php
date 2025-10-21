<?php
// Diagnóstico para InfinityFree - Backend/routes/categorias.php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

$debug = [];
$debug['timestamp'] = date('Y-m-d H:i:s');
$debug['server_info'] = $_SERVER['HTTP_HOST'];

try {
    // 1. Verificar archivo database.php
    $dbFile = '../config/database.php';
    if (!file_exists($dbFile)) {
        throw new Exception('database.php no encontrado en: ' . realpath(dirname($dbFile)));
    }
    $debug['database_file'] = 'Encontrado';
    
    // 2. Incluir configuración
    require_once $dbFile;
    $debug['config_loaded'] = 'OK';
    $debug['db_host'] = $host;
    $debug['db_name'] = $db;
    $debug['db_user'] = $user;
    
    // 3. Intentar conexión
    $dsn = "mysql:host=$host;dbname=$db;charset=$charset";
    $options = [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,
    ];
    
    $pdo = new PDO($dsn, $user, $pass, $options);
    $debug['connection'] = 'Exitosa';
    
    // 4. Verificar tablas
    $stmt = $pdo->query("SHOW TABLES");
    $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);
    $debug['tables'] = $tables;
    
    // 5. Verificar tabla producto
    $productTable = null;
    foreach ($tables as $table) {
        if (strtolower($table) === 'producto') {
            $productTable = $table;
            break;
        }
    }
    
    if (!$productTable) {
        throw new Exception('Tabla producto no encontrada. Tablas disponibles: ' . implode(', ', $tables));
    }
    
    $debug['product_table'] = $productTable;
    
    // 6. Contar productos
    $stmt = $pdo->query("SELECT COUNT(*) as total FROM $productTable");
    $count = $stmt->fetch();
    $debug['total_products'] = $count['total'];
    
    // 7. Obtener categorías
    $stmt = $pdo->query("SELECT DISTINCT categoria FROM $productTable WHERE categoria IS NOT NULL AND categoria != '' ORDER BY categoria");
    $categorias = $stmt->fetchAll(PDO::FETCH_COLUMN);
    $debug['categories'] = $categorias;
    
    // 8. Probar consulta real con primera categoría
    if (!empty($categorias)) {
        $categoria = $categorias[0];
        $stmt = $pdo->prepare("SELECT id_Producto as id, nombre, descripcion, precio, stock_disponible, categoria FROM $productTable WHERE categoria = ? ORDER BY nombre ASC LIMIT 3");
        $stmt->execute([$categoria]);
        $productos = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Convertir tipos
        foreach ($productos as &$producto) {
            $producto['precio'] = (float) $producto['precio'];
            $producto['stock_disponible'] = (int) $producto['stock_disponible'];
        }
        
        $debug['sample_query'] = [
            'category' => $categoria,
            'count' => count($productos),
            'products' => $productos
        ];
    }
    
    $debug['status'] = 'SUCCESS';
    
} catch (Exception $e) {
    $debug['status'] = 'ERROR';
    $debug['error'] = $e->getMessage();
    $debug['error_file'] = $e->getFile();
    $debug['error_line'] = $e->getLine();
}

echo json_encode($debug, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
?>