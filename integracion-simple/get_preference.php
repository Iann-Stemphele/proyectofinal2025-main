<?php
error_reporting(E_ERROR | E_PARSE); // Solo mostrar errores graves
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);

require_once __DIR__ . '/vendor/autoload.php';
use MercadoPago\Client\Preference\PreferenceClient;
use MercadoPago\MercadoPagoConfig;

MercadoPagoConfig::setAccessToken("APP_USR-3116660017260656-101416-b076654c1ec24219b73242f8f92e9c8d-2925612020");
$client = new PreferenceClient();
$preference = $client->create([
    "items" => [
        [
            "id" => "DEP-0001",
            "title" => "Balon de Futbol",
            "quantity" => 1,
            "unit_price" => 550
        ]
    ],
    "statement_descriptor" => "MI TIENDA",
    "external_reference" => "CDP001",
]);
echo json_encode(['id' => $preference->id]);
?>