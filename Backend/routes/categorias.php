<?php
// filepath: c:\xampp\htdocs\ProyectoFinal2025\proyectofinal2025-main\Backend\routes\categorias.php
header('Content-Type: application/json');
require_once '../config/database.php';

if (!isset($_GET['categoria'])) {
    echo json_encode(['error' => 'Categoría no especificada']);
    exit;
}

$categoria = $_GET['categoria'];

try {
    $stmt = $pdo->prepare("SELECT id_Producto, nombre, descripcion, precio, stock_disponible FROM Producto WHERE categoria = ?");
    $stmt->execute([$categoria]);
    $productos = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($productos);
} catch (Exception $e) {
    echo json_encode(['error' => $e->getMessage()]);
}