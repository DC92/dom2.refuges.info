/*********************************************************************
 * Préchargements dans une zone autour de celle parcourue par la carte
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


/* global idbKeyval */
/* Accès à la base de données explorateur indexedDB
 * https://www.npmjs.com/package/idb-keyval
 */

//TODO load 1 fiche (affichage point)
//TODO preload nouveautés (depuis date / modifier l'API)

/* eslint-disable no-unused-vars */
async function preLoad(map, position) {
  const preLoadedEntries = [];

  // Dates de préchargement des dalles
  await idbKeyval.entries().then(entries =>
    entries.forEach(entry => {
      if (typeof entry[1] !== 'object')
        preLoadedEntries[entry[0]] = entry[1];
    })
  );

  //*******************************************
  // Memoriser les points autour de la position

  // Coordonnées de la dalle de points à charger
  const xy = Object.values(position).map((a) => Math.round(a / pointsTileSize));

  for (let x = 0; x < 2; x++)
    for (let y = 0; y < 2; y++) {
      const bbox = [xy[1] + y - 1, xy[0] + x - 1, xy[1] + y, xy[0] + x]
        .map((a) => a * pointsTileSize).join(','),
        memPairs = []; // Paires à mémoriser;

      idbKeyval.set([bbox, Date.now()]); // Mark cache date

      // Si les points de la bbox ne sont pas déjà stockés dans IndexedDB
      if (!preLoadedEntries[bbox]) {
        // Données des points
        await fetch(window.location.origin + '/api/bbox' +
            '?detail=complet&nb_points=all&bbox=' + bbox)
          .then(response => response.json())
          .then(geoJson => geoJson.features.forEach(feature => {
            feature.properties.commentaires = [];
            memPairs[feature.id] = [feature.id, feature.properties];
            //TODO filtrer les valeurs mémorisées
          }));

        // Données des commentaires
        if (memPairs.length) // If any point in this bbox
          await fetch(window.location.origin + '/api/commentaires' +
            '?format_texte=html&id_point=' + Object.keys(memPairs).join(','))
          .then(response => response.json())
          .then(json => Object.values(json).forEach(commentaire => {
            if (typeof commentaire === 'object')
              memPairs[commentaire.id_point][1]
              .commentaires['C' + commentaire.id_commentaire] =
              commentaire;
            //TODO filtrer les valeurs mémorisées
          }));

        // Enregistre les points
        if (memPairs.length)
          await idbKeyval.setMany(Object.values(memPairs));
      }
    }


  //*********************************************************
  // Memoriser les dalles OpenHikingMap autour de la position
  let leftToFetch = maxTilesPerRequest;

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
            idbKeyval.set(baseTileRef, Date.now()); // Mark cache date
            await fetch(url); // Charger la dalle dans le cache de l'explorateur
          }
        }
    }
}