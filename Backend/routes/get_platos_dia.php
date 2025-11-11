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

    // Obtener productos de la categoría 'platos-dia'
    $stmt = $conn->prepare("SELECT id_Producto AS id, nombre, descripcion, precio FROM producto WHERE categoria = 'platos-dia' ORDER BY id_Producto ASC");
    $stmt->execute();
    $res = $stmt->get_result();
    $items = [];
    while ($row = $res->fetch_assoc()) {
        $items[] = $row;
    }
    $stmt->close();

    // Si no hay platos en la categoría platos-dia, usar algunos productos populares
    if (empty($items)) {
        $popular_ids = [3, 6, 13, 55, 56, 51, 52, 59, 118, 122]; // Algunos productos populares
        $placeholders = str_repeat('?,', count($popular_ids) - 1) . '?';
        $stmt = $conn->prepare("SELECT id_Producto AS id, nombre, descripcion, precio FROM producto WHERE id_Producto IN ($placeholders) ORDER BY id_Producto ASC");
        $stmt->bind_param(str_repeat('i', count($popular_ids)), ...$popular_ids);
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
