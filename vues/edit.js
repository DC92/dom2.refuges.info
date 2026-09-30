// Initialisation de la carte
const map = L.map('carte-edit', {
    editable: true,
  }),
   tileLayers = couchesDeFond('<?=json_encode($config_wri["mapKeys"])?>'),
  overlays = {
    'Massifs': new WriPolygonLayer('https://<?=$_SERVER["SERVER_NAME"]?>', 1, '<?=$vue->version_features?>'),
    'Régions': new WriPolygonLayer('https://<?=$_SERVER["SERVER_NAME"]?>', 11, '<?=$vue->version_features?>'),
  };

//TODO bouton upload
//TODO bouton download

// Chargement du fond de carte actif
positionMemoryControl(map);
(tileLayers[decodeURI(positionMemoryArray[3])] || Object.values(tileLayers)[0]).addTo(map);

// Contrôles
controlesComuns(map).forEach((control) => control.addTo(map));
L.control.layers(tileLayers, overlays).addTo(map);
map.addControl(new NewPolygonControl());
map.addControl(new DownloadPolygonControl());
map.doubleClickZoom.disable();

// Alt + clic dans le corps du polygone le supprime
function deleteShape(evt) {
  if (evt.originalEvent.altKey)
    this.editor.deleteShapeAt(evt.latlng);
}
map.on('layeradd', (evt) => {
  if (evt.layer instanceof L.Path){
    evt.layer.on('click', deleteShape, evt.layer);
  
   //       evt.layer.snapediting = new L.Handler.PolylineSnap(map, evt.layer);
   //     evt.layer.snapediting.addGuideLayer(Object.values(overlays));
   //     evt.layer.snapediting.enable();


//console.log( (overlays));//DCMM
//console.log(Array.from(overlays));//DCMM
console.log(Object.values(overlays));//DCMM
console.log(Object.values(overlays)[0]);//DCMM
/*
console.log(Object.values(overlays)[0].getLayers());//DCMM
//console.log(Object.values(overlays)[0].getLatLngs());//DCMM
Object.values(overlays)[0].eachLayer((l)=>{
console.log(l);//DCMM
});
*/



  }});

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











