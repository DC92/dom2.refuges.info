/*********************************************************************
 * Préchargements dans une zone autour de celle parcourue par la carte
 * Accès à la base de données explorateur indexedDB
 * https://www.npmjs.com/package/idb-keyval
 */

/********************************************************************
 * Les informations nécéssaires pour afficher les icônes sur la carte
 * sont chargées globalement par GeoJsonAjaxCluster
 * à chaque modification d'un point.
 */
//TODO : le faire ici

/******************************************************************************************
 * Les informations nécéssaires à l'affichage de la fiche d'un point et de ses commentaires
 * sont chargées par dalles dans indexedDB avec la clé égale à la valeur de id_point
 * Une entrée indexedDB est créée, dont la clé est 0.5,43.5,1,44 et la valeur la date de mise en cache
 * Une fois chargés, ne sont rafraichis que les points ou commentaires récement modifiés.
 * Les photos des points visualisés sont sont mémorisées par le cache de l'explorateur
 */
const pointsTileSize = 0.25; // ° lon / lat

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


async function preLoadPoints(map, position, preLoadedEntries) {
  const xy = Object.values(position).map((a) => Math.round(a / pointsTileSize));

  for (let x = 0; x < 2; x++)
    for (let y = 0; y < 2; y++) {
      const bbox = [xy[1] + y - 1, xy[0] + x - 1, xy[1] + y, xy[0] + x]
        .map((a) => a * pointsTileSize).join(','),
        memPairs = []; // Paires à mémoriser;

      // If the points in this bbox are not already stored in indexedDB
      if (!preLoadedEntries[bbox]) {
        // Get points data
        await fetch(window.location.origin + '/api/bbox' +
            '?detail=complet&nb_points=all&bbox=' + bbox)
          .then(response => response.json())
          .then(geoJson => geoJson.features.forEach(feature => {
            feature.properties.commentaires = [];
            memPairs[feature.id] = [feature.id, feature.properties];
            //TODO filtrer les valeurs mémorisées
          }));

        // Get commentaires
        if (memPairs.length) // If any point in this bbox
          await fetch(window.location.origin + '/api/commentaires' +
            '?format_texte=html&id_point=' + Object.keys(memPairs).join(','))
          .then(response => response.json())
          .then(json => Object.values(json).forEach(commentaire => {
            if (typeof commentaire === 'object')
              memPairs[commentaire.id_point][1]
              .commentaires['C' + commentaire.id_commentaire] =
              commentaire;
          }));

        // Add an entry to idbKeyval to mark this bbox as cached
        memPairs.push([bbox, Date.now()]);
        await idbKeyval.setMany(Object.values(memPairs));
      }
    }
}

/* eslint-disable no-unused-vars */
function preLoad(map, position) {
  const preLoadedEntries = [];

  // Get aready preloaded tiles dates
  /* global idbKeyval */
  idbKeyval.entries().then((entries) => {
    entries.forEach((entry) => {
      //TODO REMOVE ??? if (entry[0].toString().includes('/'))
      preLoadedEntries[entry[0]] = entry[1];
    });

    preLoadPoints(map, position, preLoadedEntries);


    //************************
    // Mem OpenHikingMap tiles
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
              cacheDate = (preLoadedEntries[baseTileRef] || 0) + tilesRefreshTime,
              url = 'https://tile.openmaps.fr/openhikingmap/' + baseTileRef + '.png';

            if (cacheDate < Date.now() && leftToFetch-- > 0) {
              //DCMM       idbKeyval.set(baseTileRef, Date.now()); // Mark cache date
              fetch(url); // Load the tile on the brother cache (wait for the answer)
            }
          }
      }
  });
}