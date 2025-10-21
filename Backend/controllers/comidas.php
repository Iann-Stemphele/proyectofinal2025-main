<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../models/comida.php';

// Crear conexión PDO
$dsn = "mysql:host=$host;dbname=$db;charset=$charset";
$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
];

$pdo = new PDO($dsn, $user, $pass, $options);
$productoModel = new Producto($pdo);

function obtenerComidas() {
    global $productoModel;
    echo json_encode($productoModel->obtenerTodos());
}
?>