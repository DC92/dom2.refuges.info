/* global L, confirm */

// Remplace avantageusement 663 Ko de lib IGN
/* eslint-disable-next-line no-unused-vars */
function tileLayerIGN(url, paramsIGN, paramsLayer) {
  const params = {
    request: 'GetTile',
    service: 'WMTS',
    version: '1.0.0',
    tilematrixset: 'PM',
    style: 'normal',
    format: 'image/jpeg',
    tilematrix: '{z}',
    tilerow: '{y}',
    tilecol: '{x}',
    ...paramsIGN,
  };

  return L.tileLayer(
    url + Object.entries(params).map(e => e.join('=')).join('&'), {
      bounds: [
        [-75, -180],
        [81, 180]
      ],
      attribution: '<a href="https://www.geoportail.gouv.fr/">IGN Geoportail</a>',
      ...paramsLayer,
    });
}

// Bouton de préchargement des tuiles OpenHickingMap
const controlPreload = L.control({
  position: 'topright'
});
controlPreload.onAdd = () => {
  const buttonDiv = L.DomUtil.create('div', 'button-wrapper leaflet-control-preload'),
    avertissement = 'Vous ètes sur le point de télécharger les tuiles du fond de carte OpenHickingMap autour de la position médiane de la carte.\n\
Cela peut générer de forts débit réseau et consommation mémoire.\n\
Voulez-vous continuer ?';

  buttonDiv.innerHTML = '<button title="Précharger les tuiles OpenHickingMap">&#127760;</button>';
  buttonDiv.addEventListener('click', () => {
    if (confirm(avertissement)) {
      alert('Patientez jusqu\'au rechargement de cette page.')
    };
  })
  return buttonDiv;
};