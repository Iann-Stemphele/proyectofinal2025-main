<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

require_once __DIR__ . '/../controllers/comidas.php';

$requestMethod = $_SERVER["REQUEST_METHOD"];
header('Content-Type: application/json');
$solicitud = $_GET["url"] ?? null;

if ($requestMethod == "GET") {
    if ($solicitud == "comidas") {
        obtenerComidas();
    } else {
        echo json_encode(["error" => "Solicitud no válida o no especificada."]);
    }
} else {
    echo json_encode(["error" => "Método no permitido"]);
}
?>