// Initialisation de la carte
const map = L.map('carte-edit', {
    editable: true,
  }),
   tileLayers = couchesDeFond('<?=json_encode($config_wri["mapKeys"])?>'),
 /* overlays = {
    'Massifs': new WriPolygonLayer('https://<?=$_SERVER["SERVER_NAME"]?>', 1, '<?=$vue->version_features?>'),
    'Régions': new WriPolygonLayer('https://<?=$_SERVER["SERVER_NAME"]?>', 11, '<?=$vue->version_features?>'),
  },*/
  massifsCoordinates=[],
    massifsLayer= new WriPolygonLayer('https://<?=$_SERVER["SERVER_NAME"]?>', 1, '<?=$vue->version_features?>',{
      onEachFeature:(feature, layer)=>{
massifsCoordinates.push(feature.geometry.coordinates);
    },
    });

const massifsPolygons=L.polygon([]);

//TODO bouton upload
//TODO bouton download

// Chargement du fond de carte actif
positionMemoryControl(map);
(tileLayers[decodeURI(positionMemoryArray[3])] || Object.values(tileLayers)[0]).addTo(map);

massifsLayer.addTo(map);

// Contrôles
controlesComuns(map).forEach((control) => control.addTo(map));
L.control.layers(tileLayers).addTo(map);
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
  /*    evt.layer.snapediting = new L.Handler.PolylineSnap(map, evt.layer);
        evt.layer.snapediting.addGuideLayer(massifsPolygons);
    //    evt.layer.snapediting.enable();
    */
  }});

<?php if (!empty($vue->json_polygones)) { ?>
  // Affiche le polygone courant
  const geoJson = <?=$vue->json_polygones?>,
    polygon = L.polygon(flipLonLatRecursive(geoJson.coordinates)).addTo(map);

  map.fitBounds(polygon.getBounds());
  polygon.enableEdit();
 

  massifsLayer.on('load', (evt) => {
 massifsPolygons.setLatLngs([].concat(...massifsCoordinates));
 
            polygon.snapediting = new L.Handler.PolylineSnap(map, polygon);
        polygon.snapediting.addGuideLayer(massifsPolygons);
        polygon.snapediting.enable();
   });
  
<?php
} else { ?>
  // Position par défaut
  map.setView([positionMemoryArray[1], positionMemoryArray[2]], positionMemoryArray[0]);
<?php } ?>
