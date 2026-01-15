/** Préchargements dans une zone autour de celle parcourue par la carte
 *
 * Les dalles OpenHikingMap sont simplement appelées sans que le résultat ne soit utilisé,
 * elles sont mémorisées par le cache de l'explorateur le temps et l'espace permis par celui-ci
 * Seuls sont mémorisées dans indexedDB les date de cache,
 * les informations nécéssaires pour afficher les icônes sur la carte
 * sont chargées globalement par GeoJsonAjaxCluster à chaque modification d'un point. */
const tilesRefreshTime = 30000, // Milliseconds
  minZoomPreloadedTiles = 6,
  maxZoomPreloadedTiles = 15,
  preloadedTilesAround = 5,
  maxTilesPerRequest = 40;

/* Les informations nécéssaires à l'affichage d'un point et de ses commentaires
 * sont chargées par dalles dans localStorage.preLoadedPoints_x_y.
 * Une fois chargés, ne sont rafraichis que les points ou commentaires récement modifiés.
 * Les photos des points visualisés sont sont mémorisées par le cache de l'explorateur */
const pointsTileSize = 0.5; // ° lon / lat

/* global idbKeyval */

/* Accès à la base de données explorateur indexedDB
   https://www.npmjs.com/package/idb-keyval
idbKeyval.set('hello', 'World');
idbKeyval.setMany([
  [123, 456],
  ['Bonjour', 'Toi'],
]);
idbKeyval.get('hello').then((val) => console.log(val));
idbKeyval.entries().then((entries) => console.log(entries));
idbKeyval.keys().then((keys) => console.log(keys));
idbKeyval.values().then((values) => console.log(values));
*/

/* eslint-disable no-unused-vars */
function preload(map, position) {
  // Preload OpenHikingMap tiles
  const preLoadedTiles = [];
  let leftToFetch = maxTilesPerRequest;

  // Get aready preloaded tiles dates
  idbKeyval.entries().then((entries) => {
    entries.forEach((entry) => {
      //if(entry[0].toString().includes('/'))
      preLoadedTiles[entry[0]] = entry[1];
    });

    // When entries are fetched from indexedDB
    for (let ecart = 1; ecart <= preloadedTilesAround; ecart++)
      for (let zoom = minZoomPreloadedTiles; zoom <= maxZoomPreloadedTiles; zoom++) {
        const coordPX = map.project([position.lat, position.lng], zoom),
          tileX = Math.round(coordPX.x / 256),
          tileY = Math.round(coordPX.y / 256);

        for (let x = tileX - ecart; x < tileX + ecart; x++)
          for (let y = tileY - ecart; y < tileY + ecart; y++) {
            const baseTileRef = zoom + '/' + x + '/' + y,
              expirationDate = (preLoadedTiles[baseTileRef] || 0) + tilesRefreshTime,
              url = 'https://tile.openmaps.fr/openhikingmap/' + baseTileRef + '.png';

            if (expirationDate < Date.now() && leftToFetch-- > 0) {
              idbKeyval.set(baseTileRef, Date.now()); // Mark expiration date
              fetch(url); // Load the tile on the brother cache (wait for the answer)
            }
          }
      }
  });

  // Preload points & commentaires
  const //preLoadedPoints = JSON.parse(localStorage.preLoadedPoints || '{}'),
    tx = Math.round(position.lng / pointsTileSize),
    ty = Math.round(position.lat / pointsTileSize),
    bbox = [tx, ty, tx + 1, ty + 1].map(a => Math.round(a * pointsTileSize * 10) / 10),
    url = window.location.origin + '/api/bbox?detail=complet&nb_points=all&bbox=' + bbox.join(',');

  let loadedPointsChanged = false;

  fetch(url)
    .then((response) => response.json())
    .then((json) => {
      json.features.forEach((feature) => {
        //console.info(feature);
        loadedPointsChanged = true;
      });
    })
    .catch((error) => {
      console.error('Error: ' + error + ' ' + url);
    });
}