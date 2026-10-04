// Initialisation de la carte
const map = L.map('carte-edit' , { pmIgnore: false ,}),
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

// Massifs en fond
new WriPolygonLayer(1, 'https://<?=$_SERVER["SERVER_NAME"]?>', '<?=$vue->version_features?>', { 
  pmIgnore: true, 
}).addTo(map);

<?php if (!empty($vue->json_polygones)) { ?>
  // Affiche le polygone courant
  const geoJson = <?=$vue->json_polygones?>,
    polygon = L.polygon(flipLonLatRecursive(geoJson.coordinates), { pmIgnore: false ,
  pmRemove: false, }).addTo(map);

  map.fitBounds(polygon.getBounds());
  // Delete this polygon don't work

<?php } else { ?>
  // Position par défaut
  map.setView([positionMemoryArray[1], positionMemoryArray[2]], positionMemoryArray[0]);
<?php } ?>

/*
map.pm.enableGlobalEditMode({
});
map.pm.enableGlobalSplitMode({
  //allowSelfIntersection: true,
//  allowSelfIntersectionEdit: true,
});
map.pm.enableGlobalUnionMode();*/