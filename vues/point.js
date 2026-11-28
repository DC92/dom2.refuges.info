const map = L.map('carte-point');

controlesComuns(map).forEach((control) => control.addTo(map));

// Couches de fond
const tileLayers = couchesDeFond(<?=json_encode($config_wri['mapKeys'])?>),
  fondDecarteActif = tileLayers[decodeURI(positionMemoryArray[3])] || // Dernière couche affichée
  Object.values(tileLayers)[0]; // Par défaut, première couche déclarée

fondDecarteActif.addTo(map);

// Sélecteur de couches de fond
L.control.layers(
  tileLayers, {
    '<?=_("itinéraires")?>': coucheItineraires,
  },
).addTo(map);

// Enregistre la position et la couche de base courantes
positionMemoryControl(map);

// Cluster des points de tous les types
const clusterPoints = new ClusterPointsWri(
  'https://<?=$_SERVER["SERVER_NAME"]?>', {
    typePoints: 'all',
  }, {
    labels: true, //DCMM n'affiche pas
  }
).addTo(map);

// Marqueur de position du point
const marqueur = L.marker(
  [<?=$vue->point->latitude?>, '<?=$vue->point->longitude?>'], {
    icon: L.icon({
      iconUrl: '/images/cadre.svg',
      iconSize: [32, 44],
      iconAnchor: [16, 22],
    }),
  }
).addTo(map);

// Position de la carte
map.setView(marqueur.getLatLng(), 15);