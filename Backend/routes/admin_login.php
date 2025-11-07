<?php
/**
 * admin_login.php - Manejo del inicio de sesión para administradores
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

// Solo permitir POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Método no permitido']);
    exit();
}

$response = ['success' => false, 'message' => '', 'admin' => null];

try {
    // Incluir configuración de base de datos
    require_once '../config/database.php';
    
    // Obtener datos del POST
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input) {
        throw new Exception('Datos de entrada inválidos');
    }
    
    $email = trim($input['email'] ?? '');
    $password = trim($input['password'] ?? '');
    
    // Validaciones básicas
    if (empty($email) || empty($password)) {
        throw new Exception('Email y contraseña son requeridos');
    }
    
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        throw new Exception('Email inválido');
    }
    
    // Buscar administrador por email
    $stmt = $pdo->prepare("SELECT * FROM administrador WHERE email = ?");
    $stmt->execute([$email]);
    $admin = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$admin) {
        // Email no encontrado
        throw new Exception('Credenciales incorrectas');
    }
    
    // Verificar contraseña
    $password_valida = false;
    
    // Intentar diferentes métodos de verificación de contraseña
    
    // 1. Si la contraseña está hasheada con password_hash() (bcrypt)
    if (password_verify($password, $admin['contraseña'])) {
        $password_valida = true;
    }
    // 2. Si la contraseña está hasheada con SHA2
    elseif (hash('sha256', $password) === $admin['contraseña']) {
        $password_valida = true;
    }
    // 3. Si la contraseña está hasheada con MD5 (menos seguro)
    elseif (md5($password) === $admin['contraseña']) {
        $password_valida = true;
    }
    // 4. Contraseña en texto plano (solo para desarrollo)
    elseif ($password === $admin['contraseña']) {
        $password_valida = true;
    }
    
    if (!$password_valida) {
        throw new Exception('Credenciales incorrectas');
    }
    
    // Login exitoso - iniciar sesión
    session_start();
    
    // Regenerar ID de sesión por seguridad
    session_regenerate_id(true);
    
    // Guardar datos en la sesión
    $_SESSION['admin_logged_in'] = true;
    $_SESSION['admin_id'] = $admin['id_Empleado'];
    $_SESSION['admin_email'] = $admin['email'];
    $_SESSION['admin_nombre'] = $admin['nombre'];
    $_SESSION['admin_apellido'] = $admin['apellido'];
    $_SESSION['admin_cargo'] = $admin['cargo'];
    $_SESSION['login_time'] = time();
    
    // Respuesta exitosa (sin incluir la contraseña)
    unset($admin['contraseña']);
    
    $response['success'] = true;
    $response['message'] = 'Inicio de sesión exitoso';
    $response['admin'] = [
        'id' => $admin['id_Empleado'],
        'nombre' => $admin['nombre'],
        'apellido' => $admin['apellido'],
        'cargo' => $admin['cargo'],
        'email' => $admin['email'],
        'telefono' => $admin['telefono']
    ];
    
    // Log del inicio de sesión exitoso
    error_log("Login exitoso para: " . $email . " - IP: " . ($_SERVER['REMOTE_ADDR'] ?? 'unknown'));
    
} catch (PDOException $e) {
    error_log("Error de base de datos en login: " . $e->getMessage());
    $response['message'] = 'Error de base de datos';
    
} catch (Exception $e) {
    error_log("Error en login: " . $e->getMessage());
    $response['message'] = $e->getMessage();
}

// Devolver respuesta JSON
echo json_encode($response, JSON_UNESCAPED_UNICODE);
?>