// Initialisation de la carte
const map = L.map('carte-edit', {
    pmIgnore: false,
  }),
  tileLayers = couchesDeFond(<?=json_encode($config_wri["mapKeys"])?>),
  polygoneId = <?=$vue->polygone->id_polygone??0?>,
  editJsonEl = document.getElementById('edit-json'), // Champ d'édition du geoJson
  exportPolygonEl = document.getElementById('export-polygon'); // Lien d'export dans la page

// Couche de massifs en fond pour servir de base au snapping
new WriPolygonLayer(
  1, // Seulement les massifs
  'https://<?=$_SERVER["SERVER_NAME"]?>',
  '<?=$vue->version_features?>', {
    bbox: true, // Pour ne pas ralentir le snapping
    pmIgnore: true, // Pour qu'ils ne soient pas modifiables
    snapIgnore: false, // Pour que les polygones en édition puisse coller aux contours de massifs
  }
).addTo(map);

// Chargement du fond de carte actif
(tileLayers[decodeURI(positionMemoryArray[3])] ||
  Object.values(tileLayers)[0] // La première par défaut
).addTo(map);

// Affiche le polygone courant
if (editJsonEl.value) {
  const polygonesAEditer = L.geoJson(JSON.parse(editJsonEl.value)); //.addTo(map);

  // Wait an instant the end of geoman init to add it
  setInterval(() => polygonesAEditer.addTo(map), 50);

  map.fitBounds(polygonesAEditer.getBounds());
} else
  // Ou positionne la carte par défaut sur la dernière position utilisée
  map.setView([positionMemoryArray[1], positionMemoryArray[2]], positionMemoryArray[0]);

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

// Restitue le geoJson édité
function layerChanged() {
  const polygons = []; // On sépare les polygones dans des objets séparés

  L.PM.Utils.findLayers(map).forEach((layer) => {
    const layerGeometry = layer.toGeoJSON().geometry;

    switch (layerGeometry.type) {
      case 'Polygon':
        polygons.push(turf.polygon(layerGeometry.coordinates));
        break;
      case 'MultiPolygon':
        layerGeometry.coordinates.forEach((polCoods) => {
          polygons.push(turf.polygon(polCoods));
        });
    }
  });

  if (polygons.length > 1) {
    // let finalGeometryCollection = turf.featureCollection(polygons);
    const finalGeometryCollection = turf.union(turf.featureCollection(polygons));

    console.log(finalGeometryCollection); //DCMM
  }
  //TODO BUG else

  // Ecrit le résultat dans le champ d'édition pour pouvoir le remonter au serveur
  //  editJsonEl.value = JSON.stringify(finalGeometryCollection.geometry);
}
map.on('layeradd', (evt) => {
  layerChanged();
  evt.layer.on('pm:edit', layerChanged);
});
map.on('pm:remove', layerChanged);

// Changement de format d'export
function formatChange() {
  exportPolygonEl.firstElementChild.href = '/api/polygones' +
    '?massif=' + polygoneId +
    '&format=' + exportPolygonEl.lastElementChild.value;
}
if (exportPolygonEl)
  formatChange(); // Init de la page