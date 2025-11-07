<?php
/**
 * Generador de Hash para Contraseñas
 * Ejecuta este archivo en el navegador para generar hashes seguros
 */

// Configuración
$contraseñas_para_hashear = [
    'admin123',
    'password123',
    'lasdosreinas2025',
    'administrador'
];

echo "<h2>Generador de Hashes para Las Dos Reinas</h2>";
echo "<style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    .hash-result { 
        background: #f5f5f5; 
        padding: 10px; 
        margin: 10px 0; 
        border-left: 4px solid #007cba; 
        border-radius: 4px; 
    }
    .password { font-weight: bold; color: #d32f2f; }
    .hash { font-family: monospace; color: #388e3c; word-break: break-all; }
    .sql { background: #e3f2fd; padding: 15px; margin: 15px 0; border-radius: 4px; }
</style>";

echo "<h3>Hashes Generados:</h3>";

foreach ($contraseñas_para_hashear as $password) {
    $hash = password_hash($password, PASSWORD_DEFAULT);
    
    echo "<div class='hash-result'>";
    echo "<strong>Contraseña:</strong> <span class='password'>$password</span><br>";
    echo "<strong>Hash:</strong> <span class='hash'>$hash</span>";
    echo "</div>";
}

echo "<h3>Sentencias SQL para insertar administradores:</h3>";

$admins = [
    [
        'nombre' => 'Admin',
        'apellido' => 'Principal', 
        'cargo' => 'Administrador General',
        'email' => 'admin@lasdosreinas.com',
        'telefono' => '+598123456789',
        'password' => 'admin123'
    ],
    [
        'nombre' => 'Gerente',
        'apellido' => 'Restaurant', 
        'cargo' => 'Gerente',
        'email' => 'gerente@lasdosreinas.com',
        'telefono' => '+598987654321',
        'password' => 'lasdosreinas2025'
    ]
];

echo "<div class='sql'>";
echo "<h4>1. Primero añadir la columna contraseña:</h4>";
echo "<code>ALTER TABLE `administrador` ADD COLUMN `contraseña` VARCHAR(255) NOT NULL AFTER `telefono`;</code>";

echo "<h4>2. Insertar administradores:</h4>";

foreach ($admins as $admin) {
    $hash = password_hash($admin['password'], PASSWORD_DEFAULT);
    echo "<p><strong>Usuario:</strong> {$admin['email']} | <strong>Contraseña:</strong> {$admin['password']}</p>";
    echo "<code>INSERT INTO `administrador` (`nombre`, `apellido`, `cargo`, `email`, `telefono`, `contraseña`) 
VALUES ('{$admin['nombre']}', '{$admin['apellido']}', '{$admin['cargo']}', '{$admin['email']}', '{$admin['telefono']}', '$hash');</code><br><br>";
}

echo "</div>";

// Función para generar hash personalizado
if (isset($_GET['password']) && !empty($_GET['password'])) {
    $custom_password = $_GET['password'];
    $custom_hash = password_hash($custom_password, PASSWORD_DEFAULT);
    
    echo "<div class='hash-result'>";
    echo "<h4>Hash Personalizado:</h4>";
    echo "<strong>Contraseña:</strong> <span class='password'>$custom_password</span><br>";
    echo "<strong>Hash:</strong> <span class='hash'>$custom_hash</span>";
    echo "</div>";
}

echo "<h3>Generar Hash Personalizado:</h3>";
echo "<form method='GET'>";
echo "<input type='text' name='password' placeholder='Ingresa tu contraseña' required>";
echo "<button type='submit'>Generar Hash</button>";
echo "</form>";

echo "<h3>Función PHP para verificar contraseñas:</h3>";
echo "<div class='sql'>";
echo "<pre><code>";
echo htmlentities('<?php
// Verificar contraseña
function verificarContraseña($contraseña_ingresada, $hash_bd) {
    return password_verify($contraseña_ingresada, $hash_bd);
}

// Ejemplo de uso en login
$email = $_POST["email"];
$password = $_POST["password"];

// Obtener hash de la base de datos
$stmt = $pdo->prepare("SELECT * FROM administrador WHERE email = ?");
$stmt->execute([$email]);
$admin = $stmt->fetch();

if ($admin && verificarContraseña($password, $admin["contraseña"])) {
    // Login exitoso
    session_start();
    $_SESSION["admin_id"] = $admin["id_Empleado"];
    $_SESSION["admin_nombre"] = $admin["nombre"];
    header("Location: panel_admin.php");
} else {
    // Login fallido
    echo "Credenciales incorrectas";
}
?>');
echo "</code></pre>";
echo "</div>";

echo "<p><small><strong>Nota:</strong> Este archivo es solo para desarrollo. Elimínalo en producción.</small></p>";
?>