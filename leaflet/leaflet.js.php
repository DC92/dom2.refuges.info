<?php // Concatenate the leaflet & plugins .js files

header('content-type: application/javascript');
header('Cache-Control: max-age=86000');

$files = [
  'leaflet/leaflet-src',
  'fullscreen/Leaflet.fullscreen',
  'geocoder/Control.Geocoder',
  'gps/leaflet-gps.src enableHighAccuracy timeout:300000,enableHighAccuracy',
  'Gps.Compas/leaflet-gps-compas.src',
  'EdgeBuffer/leaflet.edgebuffer',
  'markercluster/leaflet.markercluster',
  'FeatureGroup.SubGroup/subgroup',
  'src/tileLayers',
  'src/vectorLayers',
  'src/map',
];

foreach ($files as $file_def) {
  $defs = explode (' ', $file_def);

  if(sizeof($defs) == 3)
    echo str_replace($defs[1], $defs[2], file_get_contents($defs[0].'.js'));
  else
  echo '// Fichier : '.$defs[0].'.js'.PHP_EOL.
    file_get_contents($defs[0].'.js');

  echo PHP_EOL.PHP_EOL.PHP_EOL;
}


/*foreach ($files as $file_def) {
  echo '// Fichier : '.$defs[0].'.js'.PHP_EOL.
  if(sizeof($defs) == 3)
    echo str_replace($defs[1], $defs[2], file_get_contents($defs[0].'.js'));
  else
    echo file_get_contents($defs[0].'.js');
}*/
