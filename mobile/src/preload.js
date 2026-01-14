/** Préchargements dans une zone autour de celle parcourue par la carte
 *
 * Les dalles OpenHikingMap sont simplement appelées sans que le résultat ne soit utilisé,
 * elles sont mémorisées par le cache de l'explorateur le temps et l'espace permis par celui-ci
 * Seuls sont mémorisées dans localStorage.preLoadedTiles les date d'expiration,
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

/* eslint-disable no-unused-vars */
function preload(map, position) {
  //console.log('preload');

  // Preload OpenHikingMap tiles
  const preLoadedTiles = JSON.parse(localStorage.preLoadedTiles || '{}');
  let leftToFetch = maxTilesPerRequest,
    loadedTilesChanged = false;

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
            //console.log(baseTileRef);
            preLoadedTiles[baseTileRef] = Date.now();
            fetch(url); // Load the tile on the brother cache (wait for the answer)
            loadedTilesChanged = true;
          }
        }
    }
  if (loadedTilesChanged)
    localStorage.preLoadedTiles = JSON.stringify(preLoadedTiles);

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

  //if (loadedPointsChanged) localStorage.preLoadedPoints = JSON.stringify(preLoadedPoints);
}