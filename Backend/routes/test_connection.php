<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Si es una petición OPTIONS, responder inmediatamente
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$response = ['success' => false, 'message' => '', 'timestamp' => date('Y-m-d H:i:s')];

try {
    // Intentar incluir la configuración de la base de datos
    require_once '../config/database.php';
    
    // Verificar que la conexión PDO existe
    if (!isset($pdo)) {
        throw new Exception('Variable $pdo no está definida en database.php');
    }
    
    // Hacer una consulta simple para verificar la conexión
    $stmt = $pdo->query('SELECT 1 as test');
    $result = $stmt->fetch();
    
    if ($result && $result['test'] == 1) {
        $response['success'] = true;
        $response['message'] = 'Conexión a la base de datos exitosa';
        
        // Verificar algunas tablas críticas
        $tables_to_check = ['producto', 'categoria', 'pedido'];
        $existing_tables = [];
        
        foreach ($tables_to_check as $table) {
            try {
                $stmt = $pdo->query("SELECT COUNT(*) FROM `$table` LIMIT 1");
                $existing_tables[] = $table;
            } catch (Exception $e) {
                // Tabla no existe, pero no es crítico para la conexión básica
                error_log("Tabla $table no encontrada: " . $e->getMessage());
            }
        }
        
        $response['tables'] = $existing_tables;
        $response['database_info'] = [
            'tables_found' => count($existing_tables),
            'tables_expected' => count($tables_to_check)
        ];
        
    } else {
        throw new Exception('La consulta de prueba falló');
    }
    
} catch (PDOException $e) {
    $response['message'] = 'Error de conexión PDO: ' . $e->getMessage();
    $response['error_code'] = $e->getCode();
    error_log('Database connection test failed: ' . $e->getMessage());
    
} catch (Exception $e) {
    $response['message'] = 'Error general: ' . $e->getMessage();
    error_log('Database test error: ' . $e->getMessage());
}

// Log para debugging
error_log('Database connection test result: ' . json_encode($response));

echo json_encode($response, JSON_UNESCAPED_UNICODE);
?>