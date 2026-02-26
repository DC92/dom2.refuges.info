/* global map, serveurAPI, idbKeyval */

/*********************************************************************
 * Préchargements dans une zone autour de celle parcourue par la carte
 * Les données sont stockées dans la base de données explorateur indexedDB
 * via le module https://www.npmjs.com/package/idb-keyval
 *
 * Cette fonction est lancée façon asynchrone lors de l'initialisation de la carte
 * et par chaque changement de position
 * Elle effectue pas à pas la mémorisation des icônes, fiches & fond de carte autour de la position
 * Elle s'arrête aprés chaque pas si a carte changé de position
 */

map.on('moveend', async () => {
  const currentLat = map.getCenter().lat;

  console.log('PreLoad'); //DCMM

  //TODO précharger toutes les icones

  /* INFORMATIONS NÉCÉSSAIRES À L'AFFICHAGE DES FICHES ET DE SES COMMENTAIRES
     Elles sont chargées par dalles bbox dans indexedDB avec une clé égale à la valeur de id_point
     sauf les photos dqui sont mémorisées par le cache de l'explorateur
     Une fois chargés, seules sont rafraichies les fiches ou commentaires récement modifiés (API bbox?depuis=)
     Une entrée supplémentaire indexedDB est créée pour signaler que la dalle a été traités
     dont la clé est la bbox (0.5,43.5,1,44) et la valeur la date epoch de mise en cache
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
        apiUrl = serveurAPI + '/api/bbox?detail=avec_commentaires&format_texte=html&nb_points=all&bbox=' + bbox;

      if (currentLat === map.getCenter().lat && // Si la carte n'a pas bougé
        !await idbKeyval.get(bbox).then((v) => v)) { // Si cette bbox n'est pas marquée
        // Regroupe l'enregistrement de toutes les valeurs d'une bbox dans une seule transaction
        const blocsAMeroriser = [];

        // Demande les fiches dans la bbox
        await fetch(apiUrl)
          .then(response => response.json())
          .then(geoJson => {
            geoJson.features.forEach(feature => {
              blocsAMeroriser[feature.id] = feature.properties;
            });
          })
          .catch(error => console.error(error + ' ' + apiUrl));

        blocsAMeroriser[bbox] = Date.now(); // Marque la bbox comme mémorisée, même s'il n'y avait pas de fiches
        await idbKeyval.setMany(blocsAMeroriser.map((v, k) => [k, v]));
      }
    }

  /////////////////////////////////////////////////////////////////////////////////////////////////////
  /* DALLES OPENHIKINGMAP
     elles sont mémorisées par le cache de l'explorateur le temps et l'espace permis par celui-ci
     elles sont simplement appelées par preLoad sans que le résultat ne soit utilisé
     Une entrée indexedDB est créée, dont la clé est z/x/y et la valeur la date de mise en cache
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

  async function preLoadFiches(apiUrl) {
    const blocsAMeroriser = [];

    // Données des fiches
    await fetch(apiUrl)
      .then(response => response.json())
      .then(geoJson =>
        geoJson.features.forEach(feature => {
          blocsAMeroriser[feature.id] = feature.properties;
        })
      )
            .catch(error => console.error(error + ' ' + apiUrl));

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
}); // End moveend