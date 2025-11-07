<?php
/**
 * check_session.php - Verificar si el administrador tiene una sesión activa
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Si es una petición OPTIONS, responder inmediatamente
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$response = [
    'logged_in' => false,
    'admin' => null,
    'session_expired' => false
];

try {
    session_start();
    
    // Verificar si hay una sesión activa
    if (isset($_SESSION['admin_logged_in']) && $_SESSION['admin_logged_in'] === true) {
        
        // Verificar timeout de sesión (opcional - 8 horas)
        $session_timeout = 8 * 60 * 60; // 8 horas en segundos
        
        if (isset($_SESSION['login_time']) && (time() - $_SESSION['login_time']) > $session_timeout) {
            // Sesión expirada
            session_destroy();
            $response['session_expired'] = true;
            $response['logged_in'] = false;
            
        } else {
            // Sesión válida
            $response['logged_in'] = true;
            $response['admin'] = [
                'id' => $_SESSION['admin_id'] ?? null,
                'nombre' => $_SESSION['admin_nombre'] ?? '',
                'apellido' => $_SESSION['admin_apellido'] ?? '',
                'cargo' => $_SESSION['admin_cargo'] ?? '',
                'email' => $_SESSION['admin_email'] ?? ''
            ];
            
            // Actualizar tiempo de última actividad
            $_SESSION['last_activity'] = time();
        }
    }
    
} catch (Exception $e) {
    error_log("Error verificando sesión: " . $e->getMessage());
    $response['logged_in'] = false;
}

echo json_encode($response, JSON_UNESCAPED_UNICODE);
?>