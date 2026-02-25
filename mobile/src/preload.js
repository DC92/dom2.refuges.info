/* global currentPosition:writable, afficheVue, affichePoints, serveurAPI, idbKeyval */

// Initialisation de la page ou de l'application
window.addEventListener('load', () => {
  // Récupère (en une seule transaction pour ne pas générer de deadlock) les infos mémorisées dans indexedDB
  idbKeyval.getMany(['currentPosition', 'pointsJson'])
    .then(([dbCurrentPosition, dbPointsJson]) => {

      // Récupére la dernière position
      if (dbCurrentPosition)
        currentPosition = dbCurrentPosition;

      // Popule la carte avec les points mémorisées
      affichePoints(dbPointsJson);

      // Affiche la vue correpondant à #ancre
      afficheVue();

      // Lancer la boucle de rechargement
      preLoad();
    });
});

async function preLoad() {
  console.log('PreLoad'); //DCMM
}

// Demande la (re)charge des icônes depuis le serveur
//TODO précharger toutes les icones

/*const url = serveurAPI + '/api/bbox?detail=minimal&nb_points=all';
fetch(url)
  .then((response) => response.text())
  .then((geoJson) => {
    affichePoints(geoJson);
    idbKeyval.set('pointsJson', geoJson);
  })
  .catch((error) => console.log(error + ' ' + url));*/
// Memorise les fiches autour de la position
/*map.on('moveend', () => {
  //TODO attendre fin affichage page point
  // Coordonnées de la dalle bbox contenant la position
  const fichesTileSize = 0.25, // ° lon / lat
    xy = Object.values(map.getCenter()).map(a => Math.round(a / fichesTileSize));

  for (let x = 0; x < 2; x++)
    for (let y = 0; y < 2; y++) {
      const bbox= [xy[1] + y - 1, xy[0] + x - 1, xy[1] + y, xy[0] + x]
        .map((a) => a * fichesTileSize)
        .join(','),
      url = serveurAPI +
        '/api/bbox?detail=avec_commentaires&format_texte=html&nb_points=all&bbox=' +bbox;

      console.log(bbox); //DCMM

      //TODO Si les fiches de la bbox ne sont pas déjà stockés dans IndexedDB

      fetch(url)
        .then(response => response.json())
        .then(geoJson => {
          const fichesAMeroriser = [];

          geoJson.features.forEach(feature => {
            fichesAMeroriser[feature.id] = feature.properties;
          });
          console.log(fichesAMeroriser); //DCMM

          // Enregistre les propriétés des fiches
          if (fichesAMeroriser.length)
            idbKeyval.setMany(fichesAMeroriser.map((v, k) => [k, v]));

          //TODO marquer dans idbKeyval que cette bbox est déjà traitée
        });
    }
});*/


/////////////////////////////////////////////////////////////////////////////////////////////////////

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
const tilesRefreshTime = 3600 * 1000, // Milliseconds
  minZoomPreloadedTiles = 6,
  maxZoomPreloadedTiles = 15,
  preloadedTilesAround = 5,
  maxTilesPerRequest = 30;
 */

/******************************************************************************************
 * Les informations nécéssaires à l'affichage de la fiche d'une fiche et de ses commentaires
 * sont chargées par dalles dans indexedDB avec la clé égale à la valeur de id_point
 * Une fois chargés, ne sont rafraichis que les fiches ou commentaires récement modifiés.
 * Les photos des fiches visualisés sont sont mémorisées par le cache de l'explorateur
 * Une entrée indexedDB est créée, dont la clé est 0.5,43.5,1,44 et la valeur la date de mise en cache
 */
//const fichesTileSize = 0.5; // ° lon / lat

/********************************************************************
 * Les informations nécéssaires à l'affichage des icônes sur la carte
 * sont raffraichies globalement par GeoJsonAjaxCluster
 * quand une fiche a été modifiée sur la carte.

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