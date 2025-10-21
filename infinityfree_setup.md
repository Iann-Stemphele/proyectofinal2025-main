# Configuración para InfinityFree

## 1. Preparar archivos antes de subir

### Actualizar database.php
```php
<?php
$host = 'sql200.infinityfree.com'; // Cambiar por tu host real
$db   = 'if0_40194248_LasDosReinas'; // Cambiar por tu DB real
$user = 'if0_40194248'; // Tu usuario real
$pass = 'TU_PASSWORD_REAL'; // Tu contraseña real
$charset = 'utf8mb4';

$dsn = "mysql:host=$host;dbname=$db;charset=$charset";
$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
];

try {
    $pdo = new PDO($dsn, $user, $pass, $options);
} catch (\PDOException $e) {
    throw new \PDOException($e->getMessage(), (int)$e->getCode());
}
?>
```

### Actualizar URLs en create_preference.php
```php
// Líneas 40-42, cambiar localhost por tu dominio real:
$back_success = 'https://tu-sitio.infinityfreeapp.com/orders.html?status=success';
$back_failure = 'https://tu-sitio.infinityfreeapp.com/orders.html?status=failure';
$back_pending = 'https://tu-sitio.infinityfreeapp.com/orders.html?status=pending';
```

## 2. Subir archivos

1. Usar el File Manager de cPanel o FTP
2. Subir todo a la carpeta `htdocs/`
3. Asegurarse de que `vendor/` esté completo

## 3. Configurar base de datos

1. Ir a "MySQL Databases" en cPanel
2. Crear base de datos: `LasDosReinas`
3. Importar el archivo `LasDosReinas.sql`
4. Verificar que se crearon las tablas

## 4. Probar la conexión

Crear archivo `test_db.php`:
```php
<?php
include 'Backend/config/database.php';
try {
    echo "Conexión exitosa a la base de datos!";
    $stmt = $pdo->query("SHOW TABLES");
    while ($row = $stmt->fetch()) {
        echo "<br>Tabla: " . implode(', ', $row);
    }
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
?>
```

## 5. Configurar MercadoPago para producción

- Cambiar ACCESS_TOKEN por el de producción
- Verificar que las URLs de callback sean accesibles
- Probar con pagos de prueba primero

## 6. .htaccess recomendado

```apache
# Protección de archivos
<Files composer.json>
    Deny from all
</Files>

<Files *.sql>
    Deny from all
</Files>

# Habilitar HTTPS
RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# Headers de seguridad
Header always set X-Content-Type-Options nosniff
Header always set X-Frame-Options DENY
```

## 7. Checklist final

- [ ] Database.php actualizado con credenciales reales
- [ ] URLs de MercadoPago actualizadas
- [ ] Vendor/ subido completamente
- [ ] Base de datos importada
- [ ] SSL configurado
- [ ] Test de conexión funcionando
- [ ] Pagos de prueba funcionando