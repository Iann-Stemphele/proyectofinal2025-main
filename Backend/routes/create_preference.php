<?php
header('Content-Type: application/json');
error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);

// Log raw input for debugging
$raw = file_get_contents('php://input');
error_log("create_preference payload: " . $raw);
$input = json_decode($raw, true);

if (!$input || !isset($input['items']) || !is_array($input['items']) || empty($input['items']) || !isset($input['customer'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid input: items and customer required']);
    exit;
}

$mp_items = [];
$total = 0;
foreach ($input['items'] as $it) {
    $qty = max(1, (int)($it['quantity'] ?? 1));
    $price = max(0.0, (float)($it['price'] ?? 0));
    $mp_items[] = [
        'title' => $it['name'] ?? 'Producto',
        'quantity' => $qty,
        'unit_price' => $price
    ];
    $total += $price * $qty;
}

// --- CONFIG: usa aquí tu ACCESS_TOKEN PRIVADO (sandbox o prod) ---
$access_token = 'APP_USR-3116660017260656-101416-b076654c1ec24219b73242f8f92e9c8d-2925612020';
// --------------------------------------------------------------

// back_urls (asegúrate que sean accesibles desde MercadoPago)
$back_success = 'http://localhost/proyectofinal2025-main/orders.html?status=success';
$back_failure = 'http://localhost/proyectofinal2025-main/orders.html?status=failure';
$back_pending = 'http://localhost/proyectofinal2025-main/orders.html?status=pending';

$payload = [
    'items' => $mp_items,
    'payer' => [
        'name' => $input['customer']['name'] ?? '',
        'surname' => $input['customer']['lastname'] ?? '',
        'email' => $input['customer']['email'] ?? ''
    ],
    'back_urls' => [
        'success' => $back_success,
        'failure' => $back_failure,
        'pending' => $back_pending
    ]
];

// Remove auto_return to avoid MercadoPago validation issues with localhost URLs
// $payload['auto_return'] = 'approved';

error_log("create_preference -> payload to MP: " . json_encode($payload));

$ch = curl_init('https://api.mercadopago.com/checkout/preferences');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Authorization: Bearer ' . $access_token
]);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
$response = curl_exec($ch);
$httpcode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
if (curl_errno($ch)) {
    error_log("MP curl error: " . curl_error($ch));
}
curl_close($ch);

error_log("MP response code: {$httpcode} body: {$response}");

if ($httpcode < 200 || $httpcode >= 300) {
    http_response_code(500);
    echo json_encode(['error' => 'MP API failed', 'status' => $httpcode, 'raw' => $response]);
    exit;
}

$respJson = json_decode($response, true);
$preferenceId = $respJson['id'] ?? null;
$init_point = $respJson['init_point'] ?? ($respJson['sandbox_init_point'] ?? null);

if (!$preferenceId || !$init_point) {
    http_response_code(500);
    echo json_encode(['error' => 'MP did not return preference id/init_point', 'raw' => $respJson]);
    exit;
}

// return init_point and preference_id to frontend
echo json_encode([
  'ok' => true,
  'init_point' => $init_point,
  'preference_id' => $preferenceId,
  'id' => $preferenceId,   // <-- añadir esto para Bricks (espera "id")
  'total' => $total
]);
exit;
?>