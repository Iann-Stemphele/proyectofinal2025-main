# Configuración actualizada para InfinityFree

## Credenciales de Base de Datos Actualizadas

✅ **Configuración aplicada en todos los archivos PHP:**
- **Host**: sql306.infinityfree.com
- **Usuario**: if0_40194248  
- **Contraseña**: LasDosReinas
- **Base de datos**: if0_40194248_lasdosreinas
- **Puerto**: 3306 (por defecto)

## Archivos modificados

### Archivos con configuración PDO:
- ✅ `Backend/config/database.php` - Archivo principal de configuración

### Archivos con conexiones mysqli actualizadas:
- ✅ `Backend/routes/create_preference.php`
- ✅ `Backend/routes/confirm_temp_preference.php`
- ✅ `Backend/routes/create_temp_preference.php`
- ✅ `Backend/routes/create_temp_preference_table.php`
- ✅ `Backend/routes/update_order_status.php`
- ✅ `Backend/routes/get_orders.php`
- ✅ `Backend/routes/create_cash_order.php`
- ✅ `Backend/routes/get_order_status.php`
- ✅ `Backend/routes/delete_order.php`
- ✅ `Backend/routes/update_estimated_time.php`

### Archivos con configuración dinámica actualizados:
- ✅ `Backend/routes/create_order.php`
- ✅ `Backend/routes/get_platos_dia.php`
- ✅ `Backend/routes/set_platos_dia.php`

### URLs de callback de MercadoPago actualizadas:
- ✅ `Backend/routes/create_preference.php`
- ✅ `Backend/routes/create_order.php`

**IMPORTANTE**: Las URLs ahora apuntan a `https://tu-sitio.infinityfreeapp.com`
Debes reemplazar `tu-sitio` por el nombre real de tu sitio en InfinityFree.

## Próximos pasos

1. **Subir archivos** al hosting de InfinityFree
2. **Importar la base de datos** LasDosReinas.sql
3. **Reemplazar** `tu-sitio.infinityfreeapp.com` por tu dominio real
4. **Verificar** que todas las conexiones funcionen correctamente
5. **Probar** los pagos con MercadoPago

## Comandos de verificación

Una vez subido, puedes crear un archivo `test_connection.php` para verificar:

```php
<?php
include 'Backend/config/database.php';
try {
    echo "✅ Conexión exitosa a la base de datos!";
    $stmt = $pdo->query("SHOW TABLES");
    while ($row = $stmt->fetch()) {
        echo "<br>📁 Tabla: " . implode(', ', $row);
    }
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage();
}
?>
```