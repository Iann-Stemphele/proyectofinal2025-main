<?php
require_once __DIR__ . '/../models/comida.php';

$productoModel = new Producto($pdo);

function obtenerComidas() {
    global $productoModel;
    echo json_encode($productoModel->obtenerTodos());
}
?>