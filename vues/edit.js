// Initialisation de la carte
const map = L.map('carte-edit', {
    pmIgnore: false,
  }),
  tileLayers = couchesDeFond(<?=json_encode($config_wri["mapKeys"])?>),
  polygoneId = <?=$vue->polygone->id_polygone??0?>,
  geoJsonAEditer = <?=$vue->json_polygones??'null'?>,
  massifsLayer = new WriPolygonLayer(
    1,
    'https://<?=$_SERVER["SERVER_NAME"]?>',
    '<?=$vue->version_features?>', {
      pmIgnore: true,
  });

if (geoJsonAEditer) {
  // Affiche le polygone courant
  const polygonesAEditer = L.geoJson(geoJsonAEditer); //.addTo(map);

  // Wait an instant the end of geoman init to add it
  setInterval(() => polygonesAEditer.addTo(map), 50);

  map.fitBounds(polygonesAEditer.getBounds());
} else {
  // Position par défaut
  map.setView([positionMemoryArray[1], positionMemoryArray[2]], positionMemoryArray[0]);
}

// Chargement du fond de carte actif
positionMemoryControl(map);
(tileLayers[decodeURI(positionMemoryArray[3])] || Object.values(tileLayers)[0]).addTo(map);

// Contrôles
controlesComuns(map).forEach((control) => control.addTo(map));
L.control.layers(tileLayers, {
  Massifs: massifsLayer,
}).addTo(map);
map.doubleClickZoom.disable();
new ControlPolygonsUpload({
  title: 'Importer un fichier',
}).addTo(map);

// Editeur
map.pm.addControls({
  oneBlock: true,
  drawMarker: false,
  drawCircleMarker: false,
  drawPolyline: false,
  drawRectangle: false,
  drawCircle: false,
  drawText: false,
  dragMode: false,
  cutPolygon: false,
  rotateMode: false,
});

map.pm.enableGlobalEditMode();
map.pm.setGlobalOptions({
  snappable: true,
  allowSelfIntersection: false,
});

/*
map.pm.enableGlobalSplitMode({
  //allowSelfIntersection: true,
//  allowSelfIntersectionEdit: true,
});
map.pm.enableGlobalUnionMode();
*/

// Changement de format d'export
function formatChange() {
  const exportPolygonEl = document.getElementById('export-polygon');

  exportPolygonEl.firstElementChild.href = '/api/polygones' +
    '?massif=' + polygoneId +
    '&format=' + exportPolygonEl.lastElementChild.value;
}
formatChange(); // Init de la page

// Restitue le geoJson édité
function layerChanged() {
  const featureCollection = {
    type: 'FeatureCollection',
    features: [],
  };

  L.PM.Utils.findLayers(map).forEach((layer) =>
    featureCollection.features.push(layer.toGeoJSON())
  );
  console.log(JSON.stringify(featureCollection)); //DCMM
}

map.on('layeradd', (evt) => {
  layerChanged();
  evt.layer.on('pm:edit', layerChanged);
});
map.on('pm:remove', layerChanged);