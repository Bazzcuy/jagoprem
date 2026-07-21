<?php
$index = __DIR__ . '/public/index.html';
if (is_file($index)) {
    readfile($index);
    exit;
}
http_response_code(500);
echo 'Index file not found.';
