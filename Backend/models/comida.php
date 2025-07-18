<?php
require_once __DIR__ . '/../config/database.php';

class Producto {
    private $pdo;

    public function __construct($pdo) {
        $this->pdo = $pdo;
    }

    public function obtenerTodos() {
        $stmt = $this->pdo->prepare("SELECT id_Producto, nombre, descripcion, precio, stock_disponible FROM Producto");
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}
?>