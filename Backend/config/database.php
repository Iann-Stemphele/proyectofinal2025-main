<?php
// Configuración de base de datos para entorno local XAMPP
$host = 'localhost';
$db   = 'if0_40194248_lasdosreinas';
$user = 'root';
$pass = '';
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
    // En desarrollo muestra error; en producción maneja/loguea apropiadamente
    throw new \PDOException($e->getMessage(), (int)$e->getCode());
}
?>