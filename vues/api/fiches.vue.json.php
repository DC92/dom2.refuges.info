<?php

header("Content-disposition: filename=fiches.json");
header("Content-Type: application/json; UTF-8"); // rajout du charset
header("Content-Transfer-Encoding: binary");
headers_cors_par_default();
headers_cache_api();

$fiches['copyright'] = $config_wri['copyright_API'];
echo json_encode($fiches);
