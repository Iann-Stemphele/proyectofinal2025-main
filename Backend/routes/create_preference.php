<?php
header('Content-Type: application/json');
error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);

// Log raw input for debugging
$raw = file_get_contents('php://input');
error_log("create_preference payload: " . $raw);
$input = json_decode($raw, true);

if (!$input || !isset($input['items']) || !is_array($input['items']) || empty($input['items'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid input: items required']);
    exit;
}

// customer is optional but recommended; capture if present
$customer = $input['customer'] ?? ['name'=>'', 'lastname'=>'', 'email'=>'', 'phone'=>''];

// Build MercadoPago items
$mp_items = [];
$total = 0;
foreach ($input['items'] as $it) {
    $qty = max(1, (int)($it['quantity'] ?? $it['cantidad'] ?? 1));
    $price = max(0.0, (float)($it['price'] ?? $it['precio'] ?? $it['unit_price'] ?? 0));
    $mp_items[] = [
        'title' => $it['name'] ?? $it['title'] ?? 'Producto',
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
        'name' => $customer['name'] ?? '',
        'surname' => $customer['lastname'] ?? '',
        'email' => $customer['email'] ?? ''
    ],
    'back_urls' => [
        'success' => $back_success,
        'failure' => $back_failure,
        'pending' => $back_pending
    ]
];

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

// -- Persist order in DB so employees see the customer and preference_id --
$order_id = null;
try {
    // Try to load project DB config if exists
    $dbFile = __DIR__ . '/../config/database.php';
    if (file_exists($dbFile)) {
        require_once $dbFile; // expected to define $db_host,$db_user,$db_pass,$db_name or $conn
    }

    // If $conn not provided by config, create fallback mysqli connection
    if (!isset($conn) || !($conn instanceof mysqli)) {
        $db_host = $db_host ?? 'localhost';
        $db_user = $db_user ?? 'root';
        $db_pass = $db_pass ?? '';
        $db_name = $db_name ?? 'lasdosreinas';
        $conn = new mysqli($db_host, $db_user, $db_pass, $db_name);
        if ($conn->connect_error) {
            throw new Exception('DB connect error: ' . $conn->connect_error);
        }
    }

    // Insert pedido
    $fecha = date('Y-m-d');
    $estado = 'inicializando';
    $metodo_pago = 'tarjeta';
    $stmt = $conn->prepare("INSERT INTO pedido (fecha, monto_total, estado, nombre_cliente, email_cliente, telefono_cliente, metodo_pago, preference_id, hora_inicio) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())");
    if ($stmt) {
        $nombre_cliente = trim(($customer['name'] ?? '') . ' ' . ($customer['lastname'] ?? ''));
        $email_cliente = $customer['email'] ?? '';
        $telefono_cliente = $customer['phone'] ?? '';
        $stmt->bind_param('sdssssss', $fecha, $total, $estado, $nombre_cliente, $email_cliente, $telefono_cliente, $metodo_pago, $preferenceId);
        $ok = $stmt->execute();
        if ($ok) {
            $order_id = $conn->insert_id;
            error_log("create_preference: created pedido id {$order_id}");
            // Insert contiene rows when possible (use item.id if provided)
            $insertCont = $conn->prepare("INSERT INTO contiene (id_pedido, id_producto, cantidad, precio_unitario) VALUES (?, ?, ?, ?)");
            if ($insertCont) {
                foreach ($input['items'] as $it) {
                    $id_producto = isset($it['id']) ? (int)$it['id'] : (isset($it['id_producto']) ? (int)$it['id_producto'] : null);
                    $cantidad = max(1, (int)($it['quantity'] ?? $it['cantidad'] ?? 1));
                    $precio_unitario = max(0.0, (float)($it['price'] ?? $it['precio'] ?? $it['unit_price'] ?? 0));
                    // bind_param expects types: i (int), i (int or null), i, d
                    if ($id_producto === null) {
                        // bind as NULL for id_producto
                        $insertCont->bind_param('iiid', $order_id, $id_producto, $cantidad, $precio_unitario);
                        // setting $id_producto to null will result in 0; to explicitly insert NULL use a different query
                        // we'll insert NULL explicitly if no product id
                        $q = $conn->prepare("INSERT INTO contiene (id_pedido, id_producto, cantidad, precio_unitario) VALUES (?, NULL, ?, ?)");
                        if ($q) {
                            $q->bind_param('iid', $order_id, $cantidad, $precio_unitario);
                            $q->execute();
                            $q->close();
                        }
                    } else {
                        $insertCont->bind_param('iiid', $order_id, $id_producto, $cantidad, $precio_unitario);
                        $insertCont->execute();
                    }
                }
                $insertCont->close();
            }
        } else {
            error_log("Failed insert pedido: " . $stmt->error);
        }
        $stmt->close();
    } else {
        error_log("Failed prepare pedido insert: " . $conn->error);
    }
} catch (Exception $e) {
    error_log("DB error creating pedido: " . $e->getMessage());
    // don't fail preference creation: proceed to return MP info but log error
}

// return init_point and preference_id to frontend
// Si el cliente solicita HTML o añade ?open_tab=1, devolvemos una página que abre
// una segunda pestaña con el init_point y muestra el marcado de pago en la actual.
$wantHtml = isset($_GET['open_tab']) || (isset($_SERVER['HTTP_ACCEPT']) && strpos($_SERVER['HTTP_ACCEPT'], 'text/html') !== false);

if ($wantHtml) {
    // preparar datos para incrustar de forma segura en el HTML/JS
    $init_js = json_encode($init_point);
    $pref_js = json_encode($preferenceId);
    $order_js = json_encode($order_id);
    $total_js = json_encode($total);
    $items_js = json_encode($input['items'] ?? []);

    header('Content-Type: text/html; charset=utf-8');
    echo '<!doctype html><html><head><meta charset="utf-8"><title>Pagar pedido</title>
    <style>body{font-family:Arial,Helvetica,sans-serif;margin:20px} .box{max-width:720px;margin:auto;border:1px solid #ddd;padding:16px;border-radius:6px} button{background:#28a745;color:#fff;border:none;padding:10px 14px;border-radius:4px;cursor:pointer}</style>
    </head><body>
    <div class="box">
      <h2>Pagar pedido</h2>
      <p>Pedido ID: ' . htmlspecialchars((string)$order_id) . '</p>
      <p>Total: ' . htmlspecialchars((string)$total) . '</p>
      <div id="items"><h3>Items</h3><ul>';
    // listar items simple
    if (!empty($input['items']) && is_array($input['items'])) {
        foreach ($input['items'] as $it) {
            $label = htmlspecialchars(($it['name'] ?? $it['title'] ?? 'Producto') . ' x' . (($it['quantity'] ?? $it['cantidad'] ?? 1)));
            echo "<li>{$label}</li>";
        }
    } else {
        echo '<li>Sin items</li>';
    }
    echo '</ul></div>
      <p><button id="openPayment">Abrir ventana de pago (MercadoPago)</button></p>
      <p id="note">Se abrirá una nueva pestaña con MercadoPago. Mantén esta ventana para ver el resumen del pedido.</p>
    </div>

    <script>
      const initPoint = ' . $init_js . ';
      const pref = ' . $pref_js . ';
      const orderId = ' . $order_js . ';
      const total = ' . $total_js . ';
      const items = ' . $items_js . ';

      // Abrir automáticamente en nueva pestaña
      try {
        window.open(initPoint, "_blank");
      } catch(e) {
        console.warn("No se pudo abrir la pestaña automáticamente:", e);
      }

      document.getElementById("openPayment").addEventListener("click", function(){
        window.open(initPoint, "_blank");
      });
    </script>
    </body></html>';
    exit;
}

// Respuesta JSON por defecto (para llamadas AJAX/fetch)
echo json_encode([
  'ok' => true,
  'init_point' => $init_point,
  'preference_id' => $preferenceId,
  'id' => $preferenceId,
  'total' => $total,
  'order_id' => $order_id
]);
exit;
?>