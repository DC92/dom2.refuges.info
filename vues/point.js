/* global couchesDeFond, coucheItineraires, positionMemoryArray, positionMemoryControl, controlesComuns */

// Initialisation de la carte
const map = L.map('carte-point');

// Couches tuilées
const tileLayers = couchesDeFond(<?=json_encode($config_wri["mapKeys"])?>),
  fondDecarteActif = tileLayers[decodeURI(positionMemoryArray[3])] || // Dernière couche affichée
  Object.values(tileLayers)[0]; // Par défaut, première couche déclarée

fondDecarteActif.addTo(map);

// Contrôles
controlesComuns(map).forEach((control) => control.addTo(map));
L.control.layers(tileLayers, {
  '<?=_("Itinéraires")?>': coucheItineraires,
}).addTo(map); // Sélecteur de couches
positionMemoryControl(map); // Mémorise lon, lat zoom & baselayer

// Marqueur de position de cabane
const marqueur = L.marker(
  ['<?=$vue->point->latitude?>', '<?=$vue->point->longitude?>'], {
    icon: L.icon({
      iconUrl: '/images/cadre.svg',
      iconSize: [32, 44],
      iconAnchor: [16, 22],
    }),
  }
).addTo(map);

// Lance le chargement de la carte
map.setView(marqueur.getLatLng(), 15);

// Couche des points de tous les types
const cluster = new L.MarkerClusterGroup({
    spiderfyOnMaxZoom: true, // Overlapping markers will spiderfy when clicked
    showCoverageOnHover: false, // Hides the cluster bounds polygon
    maxClusterRadius: 30, // Règle le nombre de points versus clusters
  }),
  coucheVectoriellePoints = new CouchePointsWri({
    serveurAPI: 'https://<?=$_SERVER["SERVER_NAME"]?>',
    version: '<?=$vue->version_features?>',
    bbox: true,
    etiquette: true,
    clic: true,
  });

coucheVectoriellePoints.on('load', () => {
  cluster.addLayer(coucheVectoriellePoints);
});
coucheVectoriellePoints.beginFetchData(map);
cluster.addTo(map);