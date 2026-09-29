// Initialisation de la carte
const map = L.map('carte-edit', {
    editable: true,
  }),
  // Couches tuilées
  tileLayers = couchesDeFond('<?=json_encode($config_wri["mapKeys"])?>');

// Chargement du fond de carte actif
positionMemoryControl(map);
(tileLayers[decodeURI(positionMemoryArray[3])] || Object.values(tileLayers)[0]).addTo(map);

// Points refuges.info
//clusterPOI('https://<?=$_SERVER["SERVER_NAME"]?>', '<?=$vue->version_features?>').addTo(map);

// Contrôles
controlesComuns(map).forEach((control) => control.addTo(map));
map.addControl(new NewPolygonControl());
map.doubleClickZoom.disable();

// Alt + clic dans le corps du polygone le supprime
function deleteShape(evt) {
  if (evt.originalEvent.altKey)
    this.editor.deleteShapeAt(evt.latlng);
}
map.on('layeradd', (evt) => {
  if (evt.layer instanceof L.Path)
    evt.layer.on('click', deleteShape, evt.layer);
});

<?php if (!empty($vue->json_polygones)) { ?>
  // Affiche le polygone courant
  const geoJson = <?=$vue->json_polygones?>,
    polygon = L.polygon(flipLonLatRecursive(geoJson.coordinates)).addTo(map);

  map.fitBounds(polygon.getBounds());
  polygon.enableEdit();
<?php
} else { ?>
  // Position par défaut
  map.setView([positionMemoryArray[1], positionMemoryArray[2]], positionMemoryArray[0]);
<?php } ?>



 