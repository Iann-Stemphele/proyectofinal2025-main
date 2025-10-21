<?php
// Webhook para recibir notificaciones de MercadoPago
header('Content-Type: application/json');
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Log para debug
file_put_contents('mp_webhook.log', date('Y-m-d H:i:s') . " - " . json_encode($_POST) . " - " . file_get_contents('php://input') . "\n", FILE_APPEND);

try {
    // Configuración de la base de datos
    $servername = "sql306.infinityfree.com";
    $username = "if0_40194248";
    $password = "LasDosReinas";
    $dbname = "if0_40194248_lasdosreinas";

    $conn = new mysqli($servername, $username, $password, $dbname);
    if ($conn->connect_error) {
        throw new Exception('DB connect error: ' . $conn->connect_error);
    }

    // Obtener datos de la notificación
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);

    if (!$data) {
        $data = $_POST; // Fallback a POST data
    }

    // Verificar que sea una notificación de pago
    if (isset($data['type']) && $data['type'] === 'payment') {
        $paymentId = $data['data']['id'] ?? null;
        
        if ($paymentId) {
            // Consultar el estado del pago a MercadoPago
            $access_token = 'APP_USR-3116660017260656-101416-b076654c1ec24219b73242f8f92e9c8d-2925612020';
            
            $ch = curl_init("https://api.mercadopago.com/v1/payments/$paymentId");
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_HTTPHEADER, [
                'Authorization: Bearer ' . $access_token
            ]);
            
            $response = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            curl_close($ch);
            
            if ($httpCode === 200) {
                $payment = json_decode($response, true);
                $status = $payment['status'] ?? '';
                $externalReference = $payment['external_reference'] ?? '';
                
                // Mapear estados de MercadoPago a estados del sistema
                $orderStatus = 'inicializando';
                switch ($status) {
                    case 'approved':
                        $orderStatus = 'en proceso';
                        break;
                    case 'pending':
                        $orderStatus = 'inicializando';
                        break;
                    case 'rejected':
                    case 'cancelled':
                        $orderStatus = 'cancelado';
                        break;
                }
                
                // Actualizar el pedido
                if ($externalReference) {
                    $updateSql = "UPDATE pedido SET estado = ?, preference_id = ? WHERE id_pedido = ?";
                    $stmt = $conn->prepare($updateSql);
                    $stmt->bind_param("sss", $orderStatus, $payment['preference_id'] ?? '', $externalReference);
                    
                    if ($stmt->execute()) {
                        file_put_contents('mp_webhook.log', date('Y-m-d H:i:s') . " - Order $externalReference updated to $orderStatus\n", FILE_APPEND);
                    } else {
                        file_put_contents('mp_webhook.log', date('Y-m-d H:i:s') . " - Error updating order: " . $stmt->error . "\n", FILE_APPEND);
                    }
                    $stmt->close();
                }
            }
        }
    }
    
    $conn->close();
    
    // Responder a MercadoPago
    http_response_code(200);
    echo json_encode(['status' => 'ok']);
    
} catch (Exception $e) {
    file_put_contents('mp_webhook.log', date('Y-m-d H:i:s') . " - Error: " . $e->getMessage() . "\n", FILE_APPEND);
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
?>