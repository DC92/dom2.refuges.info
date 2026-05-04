<?php // Concatanate the leaflet & plugins .js files

header('content-type: application/javascript');
header('Cache-Control: max-age=86000');

$files = [
  'leaflet/leaflet-src',
  'fullscreen/Leaflet.fullscreen',
  'geocoder/Control.Geocoder',
  'gps/leaflet-gps.src',
  'EdgeBuffer/leaflet.edgebuffer',
  'markercluster/leaflet.markercluster',
  'FeatureGroup.SubGroup/subgroup',
];

foreach ($files as $file_name)
  echo '// Fichier : '.$file_name.PHP_EOL.
    file_get_contents($file_name.'.js').
    PHP_EOL.PHP_EOL.PHP_EOL;
