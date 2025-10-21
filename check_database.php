<?php
// Script para verificar/crear base de datos local
header('Content-Type: text/html; charset=utf-8');

echo "<h2>Verificación de Base de Datos Local</h2>";

try {
    // Conectar a MySQL sin especificar base de datos
    $pdo = new PDO("mysql:host=localhost;charset=utf8mb4", "root", "", [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
    ]);
    
    echo "<p>✅ Conexión a MySQL exitosa</p>";
    
    // Verificar si existe la base de datos
    $stmt = $pdo->query("SHOW DATABASES LIKE 'lasdosreinas'");
    $dbExists = $stmt->rowCount() > 0;
    
    if ($dbExists) {
        echo "<p>✅ Base de datos 'lasdosreinas' ya existe</p>";
        
        // Conectar a la base de datos específica
        $pdo = new PDO("mysql:host=localhost;dbname=lasdosreinas;charset=utf8mb4", "root", "");
        
        // Verificar tablas
        $stmt = $pdo->query("SHOW TABLES");
        $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);
        
        if (empty($tables)) {
            echo "<p>⚠️ Base de datos existe pero está vacía. <strong>Necesitas importar LasDosReinas.sql</strong></p>";
        } else {
            echo "<p>✅ Tablas encontradas: " . implode(', ', $tables) . "</p>";
            
            // Verificar tabla producto
            if (in_array('producto', $tables)) {
                $stmt = $pdo->query("SELECT COUNT(*) as total FROM producto");
                $count = $stmt->fetch();
                echo "<p>✅ Tabla 'producto' tiene {$count['total']} registros</p>";
                
                // Mostrar algunas categorías
                $stmt = $pdo->query("SELECT DISTINCT categoria FROM producto WHERE categoria IS NOT NULL LIMIT 5");
                $categorias = $stmt->fetchAll(PDO::FETCH_COLUMN);
                if (!empty($categorias)) {
                    echo "<p>✅ Categorías disponibles: " . implode(', ', $categorias) . "</p>";
                }
            } else {
                echo "<p>❌ Tabla 'producto' no encontrada</p>";
            }
        }
        
    } else {
        echo "<p>❌ Base de datos 'lasdosreinas' no existe</p>";
        echo "<p><strong>Solución:</strong></p>";
        echo "<ol>";
        echo "<li>Ve a phpMyAdmin (http://localhost/phpmyadmin)</li>";
        echo "<li>Crea una nueva base de datos llamada 'lasdosreinas'</li>";
        echo "<li>Importa el archivo LasDosReinas.sql en esa base de datos</li>";
        echo "</ol>";
        
        // Intentar crear la base de datos automáticamente
        try {
            $pdo->exec("CREATE DATABASE lasdosreinas CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci");
            echo "<p>✅ Base de datos 'lasdosreinas' creada automáticamente</p>";
            echo "<p><strong>Ahora necesitas importar LasDosReinas.sql</strong></p>";
        } catch (Exception $e) {
            echo "<p>❌ No se pudo crear la base de datos automáticamente: " . $e->getMessage() . "</p>";
        }
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