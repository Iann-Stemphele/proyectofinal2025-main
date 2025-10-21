<?php
header('Content-Type: application/json');
error_reporting(E_ALL);
ini_set('display_errors', 1);

try {
    // try to load DB config if present
    $dbFile = __DIR__ . '/../config/database.php';
    if (file_exists($dbFile)) require_once $dbFile;

    $db_host = $host ?? 'sql306.infinityfree.com';
    $db_user = $user ?? 'if0_40194248';
    $db_pass = $pass ?? 'LasDosReinas';
    $db_name = $db ?? 'if0_40194248_lasdosreinas';

    $conn = new mysqli($db_host, $db_user, $db_pass, $db_name);
    if ($conn->connect_error) throw new Exception('DB connect error: ' . $conn->connect_error);

    // Primero intentamos obtener los productos marcados como plato_del_dia
    $stmt = $conn->prepare("SELECT id_Producto AS id, nombre, descripcion, precio FROM producto WHERE plato_del_dia = 1 ORDER BY id_Producto ASC LIMIT 12");
    $stmt->execute();
    $res = $stmt->get_result();
    $items = [];
    while ($row = $res->fetch_assoc()) {
        $items[] = $row;
    }
    $stmt->close();

    // Si no hay platos marcados como plato_del_dia, usamos el fallback por categoría (compatibilidad)
    if (empty($items)) {
        $category = 'desayuno-merienda';
        $stmt = $conn->prepare("SELECT id_Producto AS id, nombre, descripcion, precio FROM producto WHERE categoria = ? ORDER BY id_Producto ASC LIMIT 12");
        $stmt->bind_param('s', $category);
        $stmt->execute();
        $res = $stmt->get_result();
        while ($row = $res->fetch_assoc()) {
            $items[] = $row;
        }
        $stmt->close();
    }

    $conn->close();

    echo json_encode($items);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
    error_log('get_platos_dia error: ' . $e->getMessage());
}
?>
