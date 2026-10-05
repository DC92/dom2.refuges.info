// Initialisation de la carte
const map = L.map('carte-edit', {
    pmIgnore: false,
  }),
  tileLayers = couchesDeFond('<?=json_encode($config_wri["mapKeys"])?>');

//TODO bouton upload
//TODO bouton download

// Chargement du fond de carte actif
positionMemoryControl(map);
(tileLayers[decodeURI(positionMemoryArray[3])] || Object.values(tileLayers)[0]).addTo(map);

// Contrôles
controlesComuns(map).forEach((control) => control.addTo(map));
L.control.layers(tileLayers).addTo(map);
map.doubleClickZoom.disable();
new ControlUpload().addTo(map);

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

/*
map.pm.enableGlobalEditMode({
});
map.pm.enableGlobalSplitMode({
  //allowSelfIntersection: true,
//  allowSelfIntersectionEdit: true,
});
map.pm.enableGlobalUnionMode();*/

// Massifs en fond
new WriPolygonLayer(
  1,
  'https://<?=$_SERVER["SERVER_NAME"]?>',
  '<?=$vue->version_features?>', {
    pmIgnore: true,
  }).addTo(map);

<?php if (!empty($vue->json_polygones)) { ?>
  // Affiche le polygone courant
  const inpoly=L.geoJson(<?=$vue->json_polygones?>);//.addTo(map);

  // Wait an instant the end of geoman init to add it
  setInterval(() => inpoly .addTo(map) , 50);

  map.fitBounds(inpoly.getBounds());
<?php } else { ?>
  // Position par défaut
  map.setView([positionMemoryArray[1], positionMemoryArray[2]], positionMemoryArray[0]);
<?php } ?>

// Pour le bouton importer un fichier
function uploadFile(evt) {
  const file = event.target.files[0], //TODO DCMM BUG c'est quoi, event ?
    reader = new FileReader();

  reader.readAsText(file);
  if (file)
    reader.onload = () => {
      L.geoJson(JSON.parse(reader.result)).addTo(map);
    };
}