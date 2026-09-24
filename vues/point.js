// Initialisation de la carte
const map = L.map('carte-point');

// Couches tuilées
const tileLayers = couchesDeFond(<?=json_encode($config_wri['mapKeys'])?>),
  itineraires = L.tileLayer(
    'https://tile.waymarkedtrails.org/hiking/{z}/{x}/{y}.png', {
      maxZoom: 18,
    }),
  permalink = sessionStorage.permalink.split('/');

// Fond de carte par défaut
permalinkControl(map);
(tileLayers[decodeURI(permalink[3])] || Object.values(tileLayers)[0]).addTo(map);

// Overlays points (tous les types de points sont chargés
const clusterPOI = L.markerClusterGroup({
  spiderfyOnMaxZoom: true, // Overlapping markers will spiderfy when clicked
  maxClusterRadius: 30, // Less clusters
}).addTo(map);

for (const entry of Object.entries(couchesIconesWRI))
  // On crée les couches pour chaque type de point
  wriPOILayer('https://<?=$_SERVER["SERVER_NAME"]?>', entry[1][0], <?=$vue->version_features?>)
  // Attente de la fin de réception pour l'intégrer au cluster
  .on('load', (evt) => clusterPOI.addLayer(evt.target));

// Contrôles
controlesComuns(map).forEach((control) => control.addTo(map));

L.control.layers(tileLayers, {
  'Itinéraires': itineraires
}).addTo(map);

// Marqueur de position de cabane
L.marker(
  [<?=$vue->point->latitude?>, <?=$vue->point->longitude?>], {
    icon: L.icon({
      iconUrl: '/images/cadre.svg',
      iconSize: [32, 44],
      iconAnchor: [16, 22],
    }),
  }
).addTo(map);

// Lance le chargement de la carte
map.setView([<?=$vue->point->latitude?>, <?=$vue->point->longitude?>], 15);
