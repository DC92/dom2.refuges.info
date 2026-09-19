/*const map = mapEdit({
  target: ,
  host: '/',
  mapKeys: <?=json_encode($config_wri['mapKeys'])?>,
  extent: <?=json_encode($vue->polygone->extent??null)?>,
  idPolygone: <?=$vue->polygone->id_polygone??0?>,
  idPolygoneType: <?=$vue->polygone->id_polygone_type??0?>,
});*/

  const tileLayers = couchesDeFond(   <?=json_encode($config_wri['mapKeys'])?>),
    permalink = localStorage.permalink.split('/'),
    baselayer = tileLayers[decodeURI(permalink[3])] || Object.values(tileLayers)[0],
      map = L.map('carte-edit', {editable: true});

  baselayer.addTo(map); // Fond de carte par défaut
  new L.Control.Fullscreen().addTo(map);
map.fitBounds([
    [44, 0],
    [46, 5],
]);

map.editTools.startPolyline();  // map.editTools has been created