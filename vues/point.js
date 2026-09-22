// Force la sélection du type de point concerné dans le sélecteur de couches de la carte
const nom_type="<?=$vue->point->nom_type?>";

if(sessionStorage.checkedLayers)
  sessionStorage.checkedLayers += ' ,';
else
  sessionStorage.checkedLayers = '';

sessionStorage.checkedLayers += nom_type.charAt(0).toUpperCase() + nom_type.slice(1);

// Affichage de la carte
const map = initLeafletMap(
  'carte-point',
  'https://<?=$_SERVER["SERVER_NAME"]?>',
  <?=$vue->version_features?>,
  <?=json_encode($config_wri['mapKeys'])?>
);

/******************************
 * Initialisation de la carte *
 ******************************/
function initLeafletMap(mapId, serveurAPI, versionFeatures, layerKeys, options) {
  const map = L.map(mapId, options);

  // Couches tuilées
  const tileLayers = couchesDeFond(layerKeys),
    permalink = sessionStorage.permalink.split('/');

  // Fond de carte par défaut
  (tileLayers[decodeURI(permalink[3])] || Object.values(tileLayers)[0]).addTo(map);

  //const overlayLayers =  overlaysSelectables(map,serveurAPI ,versionFeatures );//////////////////////////

  // Couches vectorielles overlays

  /*************
   * Contrôles *
   *************/
  controlesComuns(map).forEach((control) => control.addTo(map));
  L.control.layers(tileLayers).addTo(map);
//  L.control.layers(null, overlaysSelectables(map, serveurAPI, versionFeatures)).addTo(map);

  permalinkControl(map) ;

  // Lance le chargement de la carte
  map.setView([permalink[1], permalink[2]], permalink[0]);

  return map;
}

// Marqueur de position de cabane
L.marker(
  [<?=$vue->point->latitude?>, <?=$vue->point->longitude?>],
  {
    icon: L.icon({
      iconUrl: '/images/cadre.svg',
      iconSize: [32, 44],
      iconAnchor: [16, 22],
    }),
  }
).addTo(map);

map.setView([<?=$vue->point->latitude?>, <?=$vue->point->longitude?>], 15);
