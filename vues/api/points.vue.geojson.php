<?php
if (empty($filename))
  $filename="points-refuges-info";

header("Content-disposition: filename=$filename.json");
header("Content-Type: application/json; UTF-8"); // rajout du charset
header("Content-Transfer-Encoding: binary");
headers_cors_par_default();
headers_cache_api();

$final = [
  "type" => "FeatureCollection",
  "generator" => "Refuges.info API",
  "copyright" => $config_wri["copyright_API"],
  "timestamp" => date(DATE_ATOM),
  "size" => count((array)$points),
  "features" => [],
];

if (isset($config_wri["debug"]))
  $final["request"] = $_SERVER["REQUEST_URI"];

foreach ($points as $id => $p)
  $final["features"][] =  [
    "type" => "Feature",
    "id" => $id,
    "geometry" => json_decode($points_geojson[$id]["geojson"]),
    "properties" => $p,
  ];

ksort_recursive($final);
echo json_encode($final, isset($config_wri["debug"]) ? JSON_PRETTY_PRINT : null);

function ksort_recursive(&$array)
{
  if (is_array($array)) {
    ksort($array);
    array_walk($array, "ksort_recursive");
  }
}
