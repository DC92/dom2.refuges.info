// Carte leaflet

const permalinkInit = (localStorage.permalink || '5/46.5/5').split('/');
// Défaut : zoom/latitude/longitude

permalinkInit[0] = Math.min(parseInt(permalinkInit[0]), 10);
localStorage.permalink = permalinkInit.join('/');

const map = initLeafletMap(
  'carte-accueil',
  'https://<?=$_SERVER["SERVER_NAME"]?>',
  <?=$vue->version_features?>,
  <?=json_encode($config_wri['mapKeys'])?>
);

controlPreload.addTo(map);

// Passe du sélecteur interne à externe en fonction de la largeur de l'écran
const selecteurExterneEl = document.getElementById('carte-selecteur'),
  containerSelecteurPoiEl = document.getElementsByClassName('leaflet-control-layers')[1],
  listeSelecteurPoiEl = containerSelecteurPoiEl.lastChild;

window.onresize = () => {
  if (window.innerWidth < 800) {
    containerSelecteurPoiEl.style.display = 'block';
    containerSelecteurPoiEl.appendChild(listeSelecteurPoiEl);
  } else {
    selecteurExterneEl.appendChild(listeSelecteurPoiEl);
    containerSelecteurPoiEl.style.display = 'none';
  }
};
