<?php
// Bypass PWA cache for debug
header('Content-type: text/html');
$f = file_get_contents('index.html');
echo isset($_GET['d']) ? str_replace('navigator', '//', $f): $f;
