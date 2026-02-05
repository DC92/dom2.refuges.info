<?php /*
https://dom2.refuges.info/point/5314/cabane-non-gardee/Refugi-Baserca/
https://dom2.refuges.info/nav/5066/massif/Lleida-Lerida/
https://dom2.refuges.info/api/bbox?nb_points=all&bbox=0.75,42.55,0.8,42.6
*/

if(!is_dir('resultats'))
    mkdir('resultats');

$apis = [
  'bbox?bbox=0.75,42.5,0.8,42.6&format=gpx',
  'massif?massif=5066&format=geojson',
  'contributions?massif=5066&format=rss',
  'polygones?massif=5066&format=gml',
  'point?id=5314&format=geojson&format_texte=bbcode',
  'point?id=5314&format=geojson&format_texte=texte',
  'point?id=5314&format=geojson&format_texte=markdown',
  'point?depuis=1770249600,nb_points=all',
];

$formats = ['geojson','kml','gml','gpx','csv','xml','rss'];
foreach ($formats AS $for)
  $apis[] = "point?id=5314&format=$for&format_texte=html";

$details = ['minimal','simple','complet','avec_commentaires'];
foreach ($details AS $det) {
  $apis[] = "bbox?bbox=0.75,42.5,0.8,42.6&format=geojson&detail=$det";
  $apis[] = "point?id=5314&format=geojson&detail=$det";
}

$keys = [
  'bbox|massif|point|contributions|polygones',
   str_replace('rss','geojson',implode('|', $formats)),
  'bbcode|texte|markdown|html',
   str_replace('avec_','',implode('|', $details)),
  'all|cabane|refuge|gite',
];

foreach ($apis AS $api) {
  preg_match_all('/'.implode('|',$formats).'/', $api, $match);
  $ext = $match[0][0] ?? 'json';
  $url = 'http://dom2.refuges.info/api/'.$api.'&nb_points=1';
  $nf = str_replace('-.', '.', str_replace(
    ['?','&','=',',',$ext.'.'],
    ['_','_','-','_','.'],
    "resultats/$api.$ext"
  ));

  $f = $fc = file_get_contents($url);

  if(str_contains($url, 'json'))
    $f = json_encode(json_decode($f),JSON_PRETTY_PRINT);

  if(str_contains($url, 'xml'))
    $f = str_replace("><", ">\n<", $f);

  if(!$f || $f == 'null')
    $f = $fc;
  if(!$f || $f == 'null')
    $f = $url;

  file_put_contents($nf, $f);

  echo "<a href=\"$url\">$nf<br>";
}