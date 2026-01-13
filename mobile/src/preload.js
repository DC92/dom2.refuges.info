/** Préchargements dans une zone autour de celle parcourue par la carte
 *
 * Les dalles OpenHikingMap sont simplement appelées sans que le résultat ne soit utilisé
 * Elles sont mémorisées par le cache de l'explorateur le temps et l'espace permis par celui-ci
 * Seuls sont mémorisées dans localStorage.preLoadedTiles les date d'expiration */
const tilesRefreshTime = 30000, // Milliseconds
  minZoomPreloadedTiles = 6,
  maxZoomPreloadedTiles = 15,
  preloadedTilesAround = 5,
  maxTilesPerRequest = 40;
/*
 * Les informations nécéssaires pour afficher les icônes sur la carte
 * sont chargées globalement par GeoJsonAjaxCluster à chaque modification d'un point
 *
 * Les informations nécéssaires à l'affichage d'un point et de ses commentaires
 * sont chargées par dalles dans localStorage.preLoadedPoints_12_34 */
const pointsTileSize = 50000; // Unités Mercator (1 mètre)
/* 12 est la dalle x, 34 la dalle y
 * Une fois chargés, ne sont rafraichis que les points ou commentaires récement modifiés
 */

/* global serveurApi */

const preLoadedTiles = JSON.parse(localStorage.preLoadedTiles || '{}'),
  preLoadedPoints = JSON.parse(localStorage.preLoadedPoints || '{}');

/* eslint-disable no-unused-vars */
async function preload(map, center) {
  console.log('preload');

  // Preload tiles of openhikingmap base layer
  let leftToFetch = maxTilesPerRequest;

  for (let ecart = 1; ecart <= preloadedTilesAround; ecart++)
    for (let zoom = minZoomPreloadedTiles; zoom <= maxZoomPreloadedTiles; zoom++) {
      const coordPX = map.project([center.lat, center.lng], zoom),
        tileX = Math.round(coordPX.x / 256),
        tileY = Math.round(coordPX.y / 256);

      for (let x = tileX - ecart; x < tileX + ecart; x++)
        for (let y = tileY - ecart; y < tileY + ecart; y++) {
          const tileRef = zoom + '/' + x + '/' + y,
            expirationDate = (preLoadedTiles[tileRef] || 0) + tilesRefreshTime,
            url = 'https://tile.openmaps.fr/openhikingmap/' + tileRef + '.png';

          if (expirationDate < Date.now() && leftToFetch-- > 0) {
            preLoadedTiles[tileRef] = Date.now();
            await fetch(url); // Load the tile on the brother cache
          }
        }
    }

  // Preload points & commentaires
  const url = serveurApi + '/api/bbox?bbox=5.5,45,5.6,45.1&nb_points=all&detail=complet';

  fetch(url)
    .then((response) => response.json())
    .then((json) => {
      json.features.forEach((feature) => {
        console.info(feature);
      });
    })
    .catch((error) => {
      console.error('Error: ' + error + ' ' + url);
    });

  // END
  localStorage.preLoadedTiles = JSON.stringify(preLoadedTiles);
  localStorage.preLoadedPoints = JSON.stringify(preLoadedPoints);
}