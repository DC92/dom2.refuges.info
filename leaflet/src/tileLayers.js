/* global L, confirm, map, setInterval, clearInterval */

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
    edgeBuffer = 3,
    buttonDiv = L.DomUtil.create('div', 'button-wrapper leaflet-control-preload'),
    avertissement = 'Vous êtes sur le point de précharger le fond de carte OpenHickingMap ' +
    'dans un rayon de ' + (edgeBuffer + 1) + ' largeurs de la carte autour de sa position médiane ' +
    'pour les zooms ' + minZoom + ' à ' + maxZoom + '.\n' +
    'Cela peut engendrer une consommation réseau et mémoire de l\'ordre de 15 Mo.\n\n' +
    'Vous pourrez recommencer s\'il manque des tuiles ou charger plusieurs zones, seules seront rechargées  les manquantes.\n' +
    'Elles seront conservées 30 jours, vous pouvez les supprimer en vidant les données du site dans l\'explorateur.';

  buttonDiv.innerHTML = '<button title="Précharger le fond de carte OpenHickingMap">&#127760;</button>';
  buttonDiv.addEventListener('click', () => {
    if (confirm(avertissement)) {
      const loadingLayer = L.tileLayer(
        'https://tile.openmaps.fr/openhikingmap/{z}/{x}/{y}.png', {
          edgeBufferTiles: edgeBuffer,
        });

      map.setZoom(minZoom);
      //TODO set permalink to openhikingmap
      loadingLayer.addTo(map);

      const timer = setInterval(() => {
        if (!loadingLayer.isLoading()) {
          map.setZoom(map.getZoom() + 1);

          if (map.getZoom() > maxZoom) {
            clearInterval(timer);
            alert('Téléchargement terminé.\nRéinitialisation de la page.');
            location.reload();
          }
        }
      }, 100);
    };
  });

  return buttonDiv;
};