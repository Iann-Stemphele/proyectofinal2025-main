<?php
header('Content-Type: application/json');
error_reporting(E_ALL);
ini_set('display_errors', 1);

try {
    $raw = file_get_contents('php://input');
    $input = json_decode($raw, true);
    if (!is_array($input) || !isset($input['ids']) || !is_array($input['ids'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid payload. Send JSON: { "ids": [1,2,3] }']);
        exit;
    }
    $ids = array_values(array_map('intval', $input['ids']));

    // load DB config if available
    $dbFile = __DIR__ . '/../config/database.php';
    if (file_exists($dbFile)) require_once $dbFile;

    $db_host = $db_host ?? '127.0.0.1';
    $db_user = $db_user ?? 'root';
    $db_pass = $db_pass ?? '';
    $db_name = $db_name ?? 'lasdosreinas';

    $conn = new mysqli($db_host, $db_user, $db_pass, $db_name);
    if ($conn->connect_error) throw new Exception('DB connect error: ' . $conn->connect_error);

    // Start transaction
    $conn->begin_transaction();

    // Clear previous flags
    if ($conn->query("UPDATE producto SET plato_del_dia = 0") === false) {
        throw new Exception('Failed to clear previous platos del día: ' . $conn->error);
    }

    $set_ids = [];
    if (!empty($ids)) {
        // Build safe IN list (integers only)
        $in = implode(',', array_map('intval', $ids));

        // Check which IDs actually exist
        $res = $conn->query("SELECT id_Producto FROM producto WHERE id_Producto IN ($in)");
        if ($res === false) throw new Exception('DB select error: ' . $conn->error);

        while ($row = $res->fetch_assoc()) {
            $set_ids[] = (int)$row['id_Producto'];
        }

        if (!empty($set_ids)) {
            $in_existing = implode(',', $set_ids);
            $sql = "UPDATE producto SET plato_del_dia = 1 WHERE id_Producto IN ($in_existing)";
            if ($conn->query($sql) === false) {
                throw new Exception('Failed to set platos del día: ' . $conn->error);
            }
        } else {
            // No matching products found; decide si quieres tratarlo como error o no.
            // Aquí lo tratamos como no-error pero lo notificamos en la respuesta.
        }
    }

    $conn->commit();
    $conn->close();

    echo json_encode(['ok' => true, 'requested_ids' => $ids, 'set_ids' => $set_ids]);
} catch (Exception $e) {
    if (isset($conn) && !$conn->connect_error) {
        // intenta rollback si hay conexión
        @$conn->rollback();
        @$conn->close();
    }
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
    error_log('set_platos_dia error: ' . $e->getMessage());
}
?>
