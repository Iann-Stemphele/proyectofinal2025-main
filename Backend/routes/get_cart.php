<?php
header('Content-Type: application/json');
session_start();
// Devuelve estructura mínima esperada por comprar.js y refreshCart()
$cart = $_SESSION['cart'] ?? ['items' => [], 'total' => 0.0];
echo json_encode($cart);
?>