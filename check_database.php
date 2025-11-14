<?php
// Script para verificar/crear base de datos local
header('Content-Type: text/html; charset=utf-8');

echo "<h2>Verificación de Base de Datos Local</h2>";

try {
    // Conectar a MySQL en XAMPP
    $pdo = new PDO("mysql:host=localhost;charset=utf8mb4", "root", "", [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
    ]);
    
    echo "<p>✅ Conexión a MySQL (localhost) exitosa</p>";
    
    // Verificar si existe la base de datos solicitada
    $dbName = 'if0_40194248_lasdosreinas';
    $stmt = $pdo->query("SHOW DATABASES LIKE " . $pdo->quote($dbName));
    $dbExists = $stmt->rowCount() > 0;
    
    if ($dbExists) {
        echo "<p>✅ Base de datos '{$dbName}' ya existe</p>";
        
        // Conectar a la base de datos específica
        $pdo = new PDO("mysql:host=localhost;dbname={$dbName};charset=utf8mb4", "root", "");
        
        // Verificar tablas
        $stmt = $pdo->query("SHOW TABLES");
        $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);
        
        if (empty($tables)) {
            echo "<p>⚠️ Base de datos existe pero está vacía. <strong>Necesitas importar LasDosReinas.sql</strong></p>";
        } else {
            echo "<p>✅ Tablas encontradas: " . implode(', ', $tables) . "</p>";
            
            if (in_array('producto', $tables)) {
                $stmt = $pdo->query("SELECT COUNT(*) as total FROM producto");
                $count = $stmt->fetch();
                echo "<p>✅ Tabla 'producto' tiene {$count['total']} registros</p>";
            }
        }
        
    } else {
        echo "<p>❌ Base de datos '{$dbName}' no existe</p>";
        echo "<p><strong>Solución:</strong></p>";
        echo "<ol>";
        echo "<li>Ve a phpMyAdmin (http://localhost/phpmyadmin)</li>";
        echo "<li>Crea una nueva base de datos llamada '{$dbName}'</li>";
        echo "<li>Importa el archivo LasDosReinas.sql en esa base de datos</li>";
        echo "</ol>";
        
        // Mostrar snippet para Backend/config/database.php
        echo "<h3>Si quieres, crea este archivo: <code>Backend/config/database.php</code> con el siguiente contenido:</h3>";
        echo "<pre style='background:#f5f5f5;padding:12px;border-radius:6px;'>";
        echo htmlentities("<?php\n// Database config for local XAMPP\n$host = 'localhost';\n$db   = 'if0_40194248_lasdosreinas';\n$user = 'root';\n$pass = '';\n$charset = 'utf8mb4';\n\n$dsn = \"mysql:host=$host;dbname=$db;charset=$charset\";\n$options = [\n    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,\n    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,\n    PDO::ATTR_EMULATE_PREPARES => false,\n];\n\ntry {\n    $pdo = new PDO($dsn, $user, $pass, $options);\n} catch (\\PDOException $e) {\n    throw new \\PDOException($e->getMessage(), (int)$e->getCode());\n}\n?>"); 
        echo "</pre>";
    }
    
} catch (Exception $e) {
    echo "<p>❌ Error de conexión: " . $e->getMessage() . "</p>";
    echo "<p><strong>Asegúrate de que XAMPP esté funcionando y MySQL esté iniciado</strong></p>";
}
?>

<style>
body { font-family: Arial, sans-serif; margin: 20px; }
p { margin: 10px 0; }
h2 { color: #333; }
</style>