// Utilitaire de saisie
function affiche_et_set(el, affiche, valeur) {
  document.getElementById(el).style.visibility = affiche;
  document.getElementById(el).value = valeur;
  return false;
}

// Affichage de la cartes
const map = initLeafletMap(
  'carte-saisie',
  'https://<?=$_SERVER["SERVER_NAME"]?>',
  <?=$vue->version_features?>,
  <?=json_encode($config_wri['mapKeys'])?>
);

// Marqueur d'édition de position de cabane
L.marker(
  [<?=$vue->point->latitude?>,<?=$vue->point->longitude?>],
  {
    icon: L.icon({
      iconUrl: '/images/viseur.svg',
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    }),
    zIndexOffset: 1000,
    draggable: true,
  }
).on('drag', (evt) => {
  const position = evt.target.getLatLng();
  console.log(position); //DCMM
}).addTo(map);