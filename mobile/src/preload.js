/* global idbKeyval, serveurAPI */

/*********************************************************************
 * Préchargements dans une zone autour de celle parcourue par la carte
 * Les données sont stockées dans la base de données explorateur indexedDB
 * via le module https://www.npmjs.com/package/idb-keyval
 */

/************************************************************************
 * Les dalles OpenHikingMap sont mémorisées par le cache de l'explorateur
 * le temps et l'espace permis par celui-ci
 * elles sont simplement appelées par preload sans que le résultat ne soit utilisé.
 * Une entrée indexedDB est créée, dont la clé est z/x/y et la valeur la date de mise en cache
 */
const tilesRefreshTime = 3600 * 1000, // Milliseconds
  minZoomPreloadedTiles = 6,
  maxZoomPreloadedTiles = 15,
  preloadedTilesAround = 5,
  maxTilesPerRequest = 30;

/******************************************************************************************
 * Les informations nécéssaires à l'affichage de la fiche d'une fiche et de ses commentaires
 * sont chargées par dalles dans indexedDB avec la clé égale à la valeur de id_point
 * Une fois chargés, ne sont rafraichis que les fiches ou commentaires récement modifiés.
 * Les photos des fiches visualisés sont sont mémorisées par le cache de l'explorateur
 * Une entrée indexedDB est créée, dont la clé est 0.5,43.5,1,44 et la valeur la date de mise en cache
 */
const fichesTileSize = 0.5; // ° lon / lat

/********************************************************************
 * Les informations nécéssaires à l'affichage des icônes sur la carte
 * sont raffraichies globalement par GeoJsonAjaxCluster
 * quand une fiche a été modifiée sur la carte.
 */

async function preLoadFiches(url) {
  const ficheaAMeroriser = [];

  // Données des fiches
  await fetch(url)
    .then(response => response.json())
    .then(geoJson =>
      geoJson.features.forEach(feature => {
        ficheaAMeroriser[feature.id] = feature.properties;
      })
    );

  if (ficheaAMeroriser.length) {
    // Enregistre les propriétés de la fiche
    await idbKeyval.setMany(ficheaAMeroriser.map((v, k) => [k, v]));

    // Retourne les propriétés de la premiere fiche
    return Object.values(ficheaAMeroriser)[0];
  }
}

/* eslint-disable no-unused-vars */
async function preLoadTiles(map, position) {
  const preLoadedEntries = [];

  // Dates de préchargement des dalles
  await idbKeyval.entries().then(entries =>
    entries.forEach(entry => {
      if (typeof entry[1] !== 'object')
        preLoadedEntries[entry[0]] = entry[1];
    })
  );

  //*******************************************
  // Memoriser les fiches autour de la position

  // Coordonnées de la dalle contenant la position
  const xy = Object.values(position).map(a => Math.round(a / fichesTileSize));

  for (let x = 0; x < 2; x++)
    for (let y = 0; y < 2; y++) {
      const bboxString = [xy[1] + y - 1, xy[0] + x - 1, xy[1] + y, xy[0] + x]
        .map((a) => a * fichesTileSize)
        .join(',');

      // Si les icones de la bbox ne sont pas déjà stockés dans IndexedDB
      if (!preLoadedEntries[bboxString])
        await preLoadFiches(serveurAPI + //TODO REDO
          '/api/bbox?detail=complet&format_texte=html&nb_points=all&bbox=' + bboxString
        );

      idbKeyval.set(bboxString, Date.now()); // Mark cache date //TODO utiliser localstorage
    }

  //**********************************************************
  // Précharger les dalles OpenHikingMap autour de la position

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