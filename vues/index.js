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

// Externalise le sélecteur de points pour les grandes largeurs de fenêtre
const conteneurSelecteurExterneEl = document.getElementById('conteneur-selecteur-points'),
  conteneurDeuxièmeSelecteurEl = document.querySelector(':has(>.leaflet-control-layers)').lastChild.lastChild,
  selecteursPointsEl = document.querySelector('.leaflet-control-layers-overlays:has(img)'),
  exportCarteEl = document.getElementById('export-carte');

['load', 'resize'].forEach(evtName =>
  window.addEventListener(evtName, () => {
    if (window.innerWidth < 800)
      conteneurDeuxièmeSelecteurEl.appendChild(selecteursPointsEl);
    else
      conteneurSelecteurExterneEl.insertBefore(selecteursPointsEl, conteneurSelecteurExterneEl.firstElementChild);
  }));

function makeExportLink() {
  const bne = map.getBounds()._northEast;
  bsw = map.getBounds()._southWest;

  exportCarteEl.firstElementChild.href = '/api/bbox' +
    '?type_points=' + localStorage.checkedLayers +
    '&nb_points=all' +
    '&bbox=' + bsw.lng + ',' + bsw.lat + ',' + bne.lng + ',' + bne.lat +
    '&format=' + exportCarteEl.lastElementChild.value;
}
makeExportLink(); // Do it once at init
