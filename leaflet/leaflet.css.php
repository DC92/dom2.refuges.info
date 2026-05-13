<?php // Concatenate the leaflet & plugins .css files

header('content-type: text/css');
header('Cache-Control: max-age=86000');

$files = [
  'leaflet/leaflet url(images url(leaflet/images',
  'fullscreen/Leaflet.fullscreen url( url(fullscreen/',
  'geocoder/Control.Geocoder',
  'gps/leaflet-gps.min',
  'markercluster/MarkerCluster',
  'markercluster/MarkerCluster.Default',
];

foreach ($files as $file_def) {
  $defs = explode (' ', $file_def);

  echo '/* Fichier : '.$defs[0].'.css */'.PHP_EOL;
  if(sizeof($defs) == 3)
    echo str_replace($defs[1], $defs[2], file_get_contents($defs[0].'.css'));
  else
    echo file_get_contents($defs[0].'.css');
  echo PHP_EOL.PHP_EOL.PHP_EOL;
}
