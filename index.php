<?php
declare(strict_types=1);

$index = __DIR__ . '/public/index.html';
if (is_file($index)) {
    header('Content-Type: text/html; charset=utf-8');
    readfile($index);
    exit;
}

http_response_code(500);
echo 'Index file not found.';
