<?php
$apis = [
  'bbox?bbox=5.5,45.1,6.5,45.6&format=gpx',
  'massif?massif=5066&format=geojson',
  'contributions?massif=5066&format=rss',
  'polygones?massif=5066&format=gml',
  'point?id=5314&format=geojson&format_texte=bbcode',
  'point?id=5314&format=geojson&format_texte=texte',
  'point?id=5314&format=geojson&format_texte=markdown',
  'point?id=5314&format=geojson&detail=minimal',
  'point?id=5314&format=geojson&detail=simple',
  'point?id=5314&format=geojson&detail=complet',
  'point?id=5314&format=geojson&detail=avec_commentaires',
];

$formats = ['json','kml','gml','gpx','csv','xml','rss'];
foreach ($formats AS $for)
  $apis[] = "point?id=5314&format=$for&format_texte=html";

$keys = [
  'bbox|massif|point|contributions|polygones',
   str_replace('rss','geojson',implode('|', $formats)),
  'bbcode|texte|markdown|html',
  'minimal|simple|complet|commentaires',
  'all|cabane|refuge|gite',
];

if(!is_dir('results')) mkdir('results');

foreach ($apis AS $api) {
  preg_match_all('/'.implode('|',$formats).'/', $api, $match);
  $ext = $match[0][0];
  $url = 'http://dom2.refuges.info/api/'.$api.'&nb_points=1';
  $nf = 'results/'
    .str_replace(['?','&','=',',','.',$ext], ['_','_','-','','',''], $api)
    .'.'.$ext;

  $f = file_get_contents($url);
  if(str_contains($url, 'json'))
    $f = json_encode(json_decode($f),JSON_PRETTY_PRINT);
  if(str_contains($url, 'xml'))
    $f = str_replace ("><", ">\n<", $f);
  file_put_contents($nf, $f);

  echo $nf.' ==> '.$url.PHP_EOL;
}