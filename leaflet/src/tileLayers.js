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
        [81, 180]
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
  const minZoom = 11,
    maxZoom = 12,
    buttonDiv = L.DomUtil.create('div', 'button-wrapper leaflet-control-preload'),
    avertissement = 'Vous ètes sur le point de télécharger ' +
    'les tuiles du fond de carte OpenHickingMap jusqu\'à 30 km autour de la position médiane de la carte.\n' +
    'Cela peut générer une importante consommation réseau et mémoire.\n\n' +
    'Vous pouvez recommencer ou charger plusieurs zones, ne seront rechargées que celles qui manquent.\n' +
    'Elles seront conservée 30 jours, vous pouvez les supprimer en vidant le cache de votre explorateur.\n\n' +
    'Voulez-vous continuer ?';

  buttonDiv.innerHTML = '<button title="Précharger le fond de carte OpenHickingMap">&#127760;</button>';
  buttonDiv.addEventListener('click', () => {
    if (confirm(avertissement)) {
      const loadingLayer = L.tileLayer(
        'https://tile.openmaps.fr/openhikingmap/{z}/{x}/{y}.png', {
          edgeBufferTiles: Math.ceil(1000 / Math.min(map.getSize().x, map.getSize().y)),
        });

      loadingLayer.addTo(map);
      map.setZoom(minZoom);

      const timer = setInterval(() => {
        if (!loadingLayer.isLoading()) {
          map.setZoom(map.getZoom() + 1);
          if (map.getZoom() > maxZoom)
            clearInterval(timer);
        }
      }, 100);
    };
  })

  return buttonDiv;
};