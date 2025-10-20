<?php
// Proxy for requests that use the capitalized project folder in the URL
// It forwards execution to the real script in the lowercase folder.
// This solves 404s caused by case-sensitive filesystem paths.

$target = $_SERVER['DOCUMENT_ROOT'] . '/proyectofinal2025-main/Backend/routes/add_to_cart.php';

if (file_exists($target)) {
    // execute the real script in-place so POST body and session behave the same
    require $target;
    exit;
}

// fallback: if target missing, return 404
http_response_code(404);
header('Content-Type: text/plain; charset=utf-8');
echo "Not Found: proxy target missing ($target)";
exit;
?>
