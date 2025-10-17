<?php
header('Content-Type: application/json');
error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);

$input = json_decode(file_get_contents('php://input'), true);
if (!$input || !isset($input['items']) || !isset($input['customer'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid input']);
    exit;
}

$mp_items = [];
$total = 0;
foreach ($input['items'] as $it) {
    $qty = (int)($it['quantity'] ?? 1);
    $price = (float)($it['price'] ?? 0);
    $mp_items[] = [
        'title' => $it['name'] ?? 'Producto',
        'quantity' => $qty,
        'unit_price' => $price
    ];
    $total += $price * $qty;
}

// ---- CONFIG: pon aquí tu ACCESS_TOKEN (server-side) ----
$access_token = 'APP_USR-3116660017260656-101416-b076654c1ec24219b73242f8f92e9c8d-2925612020';
// --------------------------------------------------------

$payload = [
    'items' => $mp_items,
    'payer' => [
        'name' => $input['customer']['name'] ?? '',
        'surname' => $input['customer']['lastname'] ?? '',
        'email' => $input['customer']['email'] ?? ''
    ],
    'back_urls' => [
        'success' => 'http://localhost/ProyectoFinal2025-main/orders.html?status=success',
        'failure' => 'http://localhost/ProyectoFinal2025-main/orders.html?status=failure',
        'pending' => 'http://localhost/ProyectoFinal2025-main/orders.html?status=pending'
    ],
    'auto_return' => 'approved'
];

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

if ($httpcode < 200 || $httpcode >= 300) {
    error_log("create_preference MP API failed ({$httpcode}): {$response}");
    http_response_code(500);
    echo json_encode(['error' => 'MP API failed', 'status' => $httpcode, 'raw' => $response]);
    exit;
}

$respJson = json_decode($response, true);
$preferenceId = $respJson['id'] ?? null;
$init_point = $respJson['init_point'] ?? ($respJson['sandbox_init_point'] ?? null);

if (!$preferenceId || !$init_point) {
    error_log("create_preference missing id/init_point: " . $response);
    http_response_code(500);
    echo json_encode(['error' => 'MP did not return preference id/init_point', 'raw' => $respJson]);
    exit;
}

// (Opcional) guardar pedido en BD aquí — mantén la transacción como antes
echo json_encode(['ok' => true, 'init_point' => $init_point, 'preference_id' => $preferenceId]);
exit;
?>