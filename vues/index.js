// Carte leaflet
localStorage.permalink ||= '7/45/7'; // zoom/latitude/longitude Défaut : Alpes de l'Ouest

const pos = localStorage.permalink.split('/'),
  map = initMap(
  'carte-accueil',
  'https://<?=$_SERVER["SERVER_NAME"]?>',
  <?=json_encode($config_wri['mapKeys'])?>
);

map.setView([pos[1], pos[2]], pos[0]);
