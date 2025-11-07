<?php
/**
 * admin_logout.php - Cerrar sesión del administrador
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Si es una petición OPTIONS, responder inmediatamente
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$response = ['success' => false, 'message' => ''];

try {
    session_start();
    
    // Log del logout
    if (isset($_SESSION['admin_email'])) {
        error_log("Logout para: " . $_SESSION['admin_email'] . " - IP: " . ($_SERVER['REMOTE_ADDR'] ?? 'unknown'));
    }
    
    // Limpiar todas las variables de sesión
    $_SESSION = [];
    
    // Destruir la sesión
    if (ini_get("session.use_cookies")) {
        $params = session_get_cookie_params();
        setcookie(session_name(), '', time() - 42000,
            $params["path"], $params["domain"],
            $params["secure"], $params["httponly"]
        );
    }
    
    session_destroy();
    
    $response['success'] = true;
    $response['message'] = 'Sesión cerrada correctamente';
    
} catch (Exception $e) {
    error_log("Error en logout: " . $e->getMessage());
    $response['message'] = 'Error al cerrar sesión';
}

echo json_encode($response, JSON_UNESCAPED_UNICODE);
?>