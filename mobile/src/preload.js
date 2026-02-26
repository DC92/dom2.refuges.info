/* global map, affichePoints, serveurAPI, idbKeyval */

/*********************************************************************
 * Préchargements dans une zone autour de celle parcourue par la carte
 * Les données sont stockées dans la base de données explorateur indexedDB
 * via le module https://www.npmjs.com/package/idb-keyval
 */

window.addEventListener('load', () => {
  //TODO tester si présent sur le serveur et depuis
  // Demande la (re)charge des icônes depuis le serveur
  const url = serveurAPI + '/api/points?detail=minimal';
  fetch(url)
    .then((response) => response.text())
    .then((geoJson) => {
      affichePoints(geoJson);
      idbKeyval.set('iconesJson', geoJson);
    });
});

/* Préchargement des fiches (infos & commentaires mais pas photos) autour de la zone visitée
   Cette fonction est lancée façon assynchrone lors de l'initialisation de la carte
   et par chaque changement de position
   Elle effectue pas à pas la mémorisation des icônes, fiches & fond de carte autour de la position
   Elle s'arrête aprés chaque pas si a carte changé de position pour laisser se dérouler une autre instance de la même fonction
*/
async function preLoad() {
  const currentLat = map.getCenter().lat;

  console.log('PreLoad'); //DCMM

  //TODO précharger toutes les icones
  //TODO ne s'exécute pas au chargement de l'appli

  /******************************************************************************************
   * Les informations nécéssaires à l'affichage des fiches et de ses commentaires
   * sont chargées par dalles bbox dans indexedDB avec la clé égale à la valeur de id_point
   * Une fois chargés, ne sont rafraichis que les fiches ou commentaires récement modifiés (API &depuis=)
   * Les photos des fiches visualisés sont sont mémorisées par le cache de l'explorateur
   * Une entrée indexedDB est créée, dont la clé est la bbox (0.5,43.5,1,44) et la valeur la date epoch de mise en cache
   */

  // Numéro de la dalle bbox contenant la position
  const fichesTileSize = 0.25, // ° lon / lat
    xy = Object.values(map.getCenter()).map(a => Math.round(a / fichesTileSize));

  // Parcours les 4 dalles entourant la position
  for (let x = 0; x < 2; x++)
    for (let y = 0; y < 2; y++) {
      const bbox = [xy[1] + y - 1, xy[0] + x - 1, xy[1] + y, xy[0] + x]
        .map((a) => a * fichesTileSize)
        .join(','),
        apiUrl = '/api/bbox?detail=avec_commentaires&format_texte=html&nb_points=all&bbox=' + bbox;

      if (currentLat === map.getCenter().lat && // Si la carte n'a pas bougé
        !await idbKeyval.get(bbox).then((v) => v)) { // Si cette bbox n'est pas marquée
        // Regroupe l'enregistrement de toutes les valeurs d'une bbox dans une seule transaction
        const blocsAMeroriser = [];

        // Demande les fiches dans la bbox
        await fetch(serveurAPI + apiUrl)
          .then(response => response.json())
          .then(geoJson => {
            geoJson.features.forEach(feature => {
              blocsAMeroriser[feature.id] = feature.properties;
            });
          });

        blocsAMeroriser[bbox] = Date.now(); // Marque la bbox comme mémorisée, même s'il n'y avait pas de fiches
        await idbKeyval.setMany(blocsAMeroriser.map((v, k) => [k, v]));
      }
    }

  //TODO charger les dales OpenHickingMap
}
map.on('moveend', preLoad);

/////////////////////////////////////////////////////////////////////////////////////////////////////

/************************************************************************
 * Les dalles OpenHikingMap sont mémorisées par le cache de l'explorateur
 * le temps et l'espace permis par celui-ci
 * elles sont simplement appelées par preload sans que le résultat ne soit utilisé.
 * Une entrée indexedDB est créée, dont la clé est z/x/y et la valeur la date de mise en cache
const tilesRefreshTime = 3600 * 1000, // Milliseconds
  minZoomPreloadedTiles = 6,
  maxZoomPreloadedTiles = 15,
  preloadedTilesAround = 5,
  maxTilesPerRequest = 30;
 */

/********************************************************************
 * Les informations nécéssaires à l'affichage des icônes sur la carte
 * sont raffraichies globalement par GeoJsonAjaxCluster
 * quand une fiche a été modifiée sur la carte.

async function preLoadFiches(url) {
  const blocsAMeroriser = [];

  // Données des fiches
  await fetch(url)
    .then(response => response.json())
    .then(geoJson =>
      geoJson.features.forEach(feature => {
        blocsAMeroriser[feature.id] = feature.properties;
      })
    );

  if (blocsAMeroriser.length) {
    // Enregistre les propriétés de la fiche
    await idbKeyval.setMany(blocsAMeroriser.map((v, k) => [k, v]));

    // Retourne les propriétés de la premiere fiche
    return Object.values(blocsAMeroriser)[0];
  }
}

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

      // Si les points de la bbox ne sont pas déjà stockés dans IndexedDB
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
*/