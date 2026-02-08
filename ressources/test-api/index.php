<?php /*
https://dom2.refuges.info/point/5314/cabane-non-gardee/Refugi-Baserca/
https://dom2.refuges.info/nav/5066/massif/Lleida-Lerida/
https://dom2.refuges.info/api/bbox?nb_points=all&bbox=0.75,42.55,0.8,42.6
*/

if(!is_dir('non-reg'))
    mkdir('non-reg');

$apis = [
  'bbox?bbox=0.75,42.5,0.8,42.6&format=geojson&detail=simple&format_texte=bbcode',
  'massif?massif=5066&format=geojson&detail=simple&format_texte=bbcode',
  'contributions?massif=5066&format=rss',
  'polygones?massif=5066&format=gml',
  'point?id=5314&format=geojson&detail=complet&format_texte=html',
];

$formats = ['geojson','kml','gml','gpx','csv','xml','rss'];
foreach ($formats AS $for)
  $apis[] = "point?id=5314&format=$for&detail=simple&format_texte=html";

$details = ['simple','complet'];

$format_texte = ['bbcode','texte','markdown'];
foreach ($format_texte AS $dt)
  $apis[] = "point?id=5314&format=geojson&detail=simple&format_texte=$dt";

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
  if (!str_contains($api, 'nb_points'))
    $api.='&nb_points=1';
  $url = 'http://dom2.refuges.info/api/'.$api;
  $nf = str_replace('-.', '.', str_replace(
    ['?','&','=',',',$ext.'.'],
    ['_','_','-','_','.'],
    "non-reg/$api.$ext"
  ));

  echo "<br><a href=\"$url\">$nf";

  $f = $fc = file_get_contents($url);

  if(str_contains($url, 'xml'))
    $f = str_replace("><", ">\n<", $f);

  if(str_contains($ext, 'json') || $ext == 'rss') {
    echo ' (TRI)';
    $d = json_decode($f);
    ksort_recursive($d);
    $f = json_encode($d, JSON_PRETTY_PRINT);
    $f = str_replace('    ', '  ', $f);
  }

  file_put_contents($nf, "$url\nLes données ont été triées par clés\n$f");
}

function ksort_recursive(&$struct) {
  if (is_object($struct))
    $struct=(array)$struct;

  if (is_array($struct)) {
    ksort($struct);
    array_walk($struct, 'ksort_recursive');
  }
}
