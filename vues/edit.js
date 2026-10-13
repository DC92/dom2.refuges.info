// Initialisation de la carte
const map = L.map('carte-edit', {
    pmIgnore: false,
  }),
  tileLayers = couchesDeFond(<?=json_encode($config_wri["mapKeys"])?>),
  polygoneId = <?=$vue->polygone->id_polygone??0?>,
  editJsonEl = document.getElementById('edit-json'),
  exportPolygonEl = document.getElementById('export-polygon'),
  massifsLayer = new WriPolygonLayer(
    1,
    'https://<?=$_SERVER["SERVER_NAME"]?>',
    '<?=$vue->version_features?>', {
      bbox: true,
      pmIgnore: true, // Pour qu'ils ne soient pas modifiables
      snapIgnore: false, // Pour que les polygones en édition puisse coller aux contours de massifs
    }
  ).addTo(map);


if (editJsonEl.value) {
  // Affiche le polygone courant
  const polygonesAEditer = L.geoJson(JSON.parse(editJsonEl.value)); //.addTo(map);

  // Wait an instant the end of geoman init to add it
  setInterval(() => polygonesAEditer.addTo(map), 50);

  map.fitBounds(polygonesAEditer.getBounds());
} else {
  // Position par défaut
  map.setView([positionMemoryArray[1], positionMemoryArray[2]], positionMemoryArray[0]);
}

// Chargement du fond de carte actif
(tileLayers[decodeURI(positionMemoryArray[3])] || Object.values(tileLayers)[0]).addTo(map);

// Contrôles
controlesComuns(map).forEach((control) => control.addTo(map));
L.control.layers(tileLayers, ).addTo(map);
map.doubleClickZoom.disable();
new ControlPolygonsUpload({
  title: 'Importer un fichier',
}).addTo(map);
positionMemoryControl(map);

// Editeur
map.pm.addControls({
  oneBlock: true,
  drawCircle: false,
  drawCircleMarker: false,
  drawMarker: false,
  dragMode: false,
  drawPolyline: false,
  drawRectangle: false,
  drawText: false,
  rotateMode: false,
});

map.pm.enableGlobalEditMode();
map.pm.setGlobalOptions({
  snappable: true,
});

// Changement de format d'export
function formatChange() {
  exportPolygonEl.firstElementChild.href = '/api/polygones' +
    '?massif=' + polygoneId +
    '&format=' + exportPolygonEl.lastElementChild.value;
}
if (exportPolygonEl)
  formatChange(); // Init de la page

// Restitue le geoJson édité
function layerChanged() {
  const plgs = []; // On crée un objet polygone par polygone sur le sdessin

  L.PM.Utils.findLayers(map).forEach((layer) => {
    const layerGeometry = layer.toGeoJSON().geometry;

    switch (layerGeometry.type) {
      case 'Polygon':
        plgs.push(turf.polygon(layerGeometry.coordinates));

        break;
      case 'MultiPolygon':
        layerGeometry.coordinates.forEach((polCoods) => {
          plgs.push(turf.polygon(polCoods));
        });
        break;
    }
  });

  let tfcn = turf.featureCollection(plgs);
  if (plgs.length > 1)
    tfcn = turf.union(tfcn);
  editJsonEl.value = JSON.stringify(tfcn.geometry);
}

map.on('layeradd', (evt) => {
  layerChanged();
  evt.layer.on('pm:edit', layerChanged);
});
map.on('pm:remove', layerChanged);