/* global L, confirm, map, setInterval */

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
        [81, 180],
      ],
      attribution: '<a href="https://www.geoportail.gouv.fr/">IGN Geoportail</a>',
      ...paramsLayer,
    });
}

// Bouton de préchargement des tuiles OpenHickingMap
const controlPreload = L.control({
  position: 'topright',
});

controlPreload.onAdd = () => {
  const minZoom = 10,
    maxZoom = 16,
    edgeBuffer = 4,
    buttonDiv = L.DomUtil.create('div', 'button-wrapper leaflet-control-preload'),
    avertissement = 'Vous êtes sur le point de télécharger le fond de carte OpenHickingMap ' +
    'autour de la position médiane de la carte dans un rayon de ' + edgeBuffer + ' largeurs de la carte ' +
    'pour les zooms ' + minZoom + ' à ' + maxZoom + '.\n' +
    'Cela peut générer une importante consommation réseau et mémoire.\n\n' +
    'Vous pouvez recommencer s\'il en manque ou charger plusieurs zones, ne seront rechargées que les images manquantes.\n' +
    'Elles seront conservée 30 jours et vous pouvez les supprimer en vidant les données du site dans l\'explorateur.\n\n' +
    'Voulez-vous continuer ?';

  buttonDiv.innerHTML = '<button title="Précharger le fond de carte OpenHickingMap">&#127760;</button>';
  buttonDiv.addEventListener('click', () => {
    if (confirm(avertissement)) {
      const loadingLayer = L.tileLayer(
        'https://tile.openmaps.fr/openhikingmap/{z}/{x}/{y}.png', {
          edgeBufferTiles: edgeBuffer,
        });

      map.setZoom(minZoom);
      loadingLayer.addTo(map);

      setInterval(() => {
        if (!loadingLayer.isLoading()) {
          map.setZoom(map.getZoom() + 1);

          if (map.getZoom() > maxZoom) {
            alert('Téléchargement terminé, réinitialisation de la page.');
            location.reload();
          }
        }
      }, 100);
    };
  })

  return buttonDiv;
};