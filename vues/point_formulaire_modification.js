// Utilitaire de saisie des boutons du formulaire
function affiche_et_set(el, affiche, valeur) {
  document.getElementById(el).style.visibility = affiche;
  document.getElementById(el).value = valeur;
  return false;
}

// Positionne la carte à l'emplacement du point à modifier
<?php if(!empty($vue->point->id_point)) { ?>
  sessionStorage.permalink = '15/<?=$vue->point->latitude?>/<?=$vue->point->longitude?>/' + sessionStorage.permalink.split('/')[3];
<? } ?>

// Affichage de la carte
const map = initLeafletMap(
  'carte-saisie',
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

  // Lance le chargement de la carte
  map.setView([permalink[1], permalink[2]], permalink[0]);

  return map;
}

// Marqueur déplaçable d'édition de position de cabane
const champsPositionEls = document.querySelectorAll('#champs-position input'),
  marqueur = L.marker(
    map.getCenter(), {
      icon: L.icon({
        iconUrl: '/images/viseur.svg',
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      }),
      zIndexOffset: 1000,
      draggable: true,
    }
  ).addTo(map);

function deplacerMarqueur(ll) {
  marqueur.setLatLng(ll);

  champsPositionEls[1].value = Math.round(ll.lng * 100000) / 100000;
  champsPositionEls[2].value = Math.round(ll.lat * 100000) / 100000;

  champsPositionEls[0].value =
    '{"type":"Point","coordinates":[' +
    champsPositionEls[1].value + ',' + champsPositionEls[2].value +
    ']}"';
}

// Réponse aux changement de champs input
function champPositionChange() {
  deplacerMarqueur(L.latLng(champsPositionEls[2].value, champsPositionEls[1].value));
  map.panTo(marqueur.getLatLng());
}

// Réponse aux changement de champs input
marqueur.on('drag', () => deplacerMarqueur(marqueur.getLatLng()));

// Repositionne le marqueur sur un double clic
map.doubleClickZoom.disable();
map.on('dblclick', (evt) => deplacerMarqueur(evt.latlng));
