// Utilitaire de saisie
function affiche_et_set(el, affiche, valeur) {
  document.getElementById(el).style.visibility = affiche;
  document.getElementById(el).value = valeur;
  return false;
}

// Affichage de la carte
const map = initLeafletMap(
  'carte-saisie',
  'https://<?=$_SERVER["SERVER_NAME"]?>',
  <?=$vue->version_features?>,
  <?=json_encode($config_wri['mapKeys'])?>
);

// Marqueur d'édition de position de cabane
const markersLLinputEls = document.querySelectorAll('#markers-lon-lat input'),
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

function centrecCarteAuxInputs() {
  const ll = L.latLng(markersLLinputEls[1].value, markersLLinputEls[0].value);

  marqueur.setLatLng(ll);
  map.panTo(ll);
}

function inputsAuCentreCarte() {
  const position =marqueur.getLatLng();

  markersLLinputEls[0].value =  position.lng.toFixed(5);
  markersLLinputEls[1].value =  position.lat.toFixed(5);
}

marqueur.on('drag', inputsAuCentreCarte);

//TODO DCMM bug quand modif point
inputsAuCentreCarte(); // Init
