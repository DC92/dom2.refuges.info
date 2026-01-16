/*********************************************************************
 * Préchargements dans une zone autour de celle parcourue par la carte
 * Accès à la base de données explorateur indexedDB
 * https://www.npmjs.com/package/idb-keyval
 */

/* eslint-disable no-unused-vars */
function preLoad(map, position) {
  const preLoadedTiles = [];

  // Get aready preloaded tiles dates
  /* global idbKeyval */
  idbKeyval.entries().then((entries) => {
    entries.forEach((entry) => {
      if (entry[0].toString().includes('/'))
        preLoadedTiles[entry[0]] = entry[1];
    });


    /********************************************************************
     * Les informations nécéssaires pour afficher les icônes sur la carte
     * sont chargées globalement par GeoJsonAjaxCluster
     * à chaque modification d'un point.
     */
    //TODO : le faire ici

    /* Les informations nécéssaires à l'affichage de la fiche d'un point et de ses commentaires
     * sont chargées par dalles dans indexedDB avec la clé égale à la valeur de id_point
     * Une entrée indexedDB est créée, dont la clé est 0.5,43.5,1,44 et la valeur la date de mise en cache
     * Une fois chargés, ne sont rafraichis que les points ou commentaires récement modifiés.
     * Les photos des points visualisés sont sont mémorisées par le cache de l'explorateur
     */
    const pointsTileSize = 0.5, // ° lon / lat
      xy = Object.values(position).map(a => Math.round(a / pointsTileSize));

    for (let x = 0; x < 2; x++)
      for (let y = 0; y < 2; y++) {
        const bbox = [xy[1] + y - 1, xy[0] + x - 1, xy[1] + y, xy[0] + x].map(a => a * pointsTileSize),
          url = window.location.origin + '/api/bbox' +
          '?detail=complet&nb_points=all&bbox=' + bbox.join(',');

        //TODO fetch commentaires
        fetch(url)
          .then((response) => response.json())
          .then((json) => {
            json.features.forEach((feature) => {
              idbKeyval.set(feature.id, feature); // Cache point data
            });
          })
          .catch((error) => { //TODO ??? errors pour tout ou rien
            console.error('Error: ' + error + ' ' + url);
          });
      }


    /************************************************************************
     * Les dalles OpenHikingMap sont mémorisées par le cache de l'explorateur
     * le temps et l'espace permis par celui-ci
     * elles sont simplement appelées sans que le résultat ne soit utilisé.
     * Une entrée indexedDB est créée, dont la clé est z/x/y et la valeur la date de mise en cache
     */
    const tilesRefreshTime = 30000, // Milliseconds
      minZoomPreloadedTiles = 6,
      maxZoomPreloadedTiles = 15,
      preloadedTilesAround = 5,
      maxTilesPerRequest = 40;

    let leftToFetch = maxTilesPerRequest;

    // Preload OpenHikingMap tiles
    for (let ecart = 1; ecart <= preloadedTilesAround; ecart++)
      for (let zoom = minZoomPreloadedTiles; zoom <= maxZoomPreloadedTiles; zoom++) {
        const baseTileXY = Object.values(
          map.project(Object.values(position), zoom)
        ).map(a => Math.round(a / 256));

        for (let x = baseTileXY[0] - ecart; x < baseTileXY[0] + ecart; x++)
          for (let y = baseTileXY[1] - ecart; y < baseTileXY[1] + ecart; y++) {
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
}