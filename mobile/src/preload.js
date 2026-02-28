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

let currentStartPreLoad = Date.now(); // Pour vérifier qu'il n'y en a qu'un à la fois

async function selectionPreLoad(el) {
  console.log(await preLoad()); //DCMM
}

/* eslint-disable-next-line no-unused-vars */
async function preLoad(load) {
  // Si load est vide, effectue seulement le calcul des volumes faits / à faire
  const thisStartPreLoad = Date.now(),
    mesure = [];
  currentStartPreLoad = thisStartPreLoad;

  console.log('PreLoad'); //DCMM

  /*********************************************
   * PRÉCHARGEMENT DE TOUTES LES ICONES UTILISEES
   */
  const pointsGeoJson = await idbKeyval.get('pointsJson');

  if (pointsGeoJson) {
    const pointsJson = JSON.parse(pointsGeoJson),
      nomsIconesMemorises = await idbKeyval.get('nomsIcones') || [],
      nomsIcones = [];

    pointsJson.features.forEach((point) => {
      nomsIcones[point.properties.type.icone] = true;
    });

    mesure['icones-fait'] = mesure['icones-total'] = Object.keys(nomsIcones).length; // 1 Kb par icône

    //TODO réellement charger les icones
    if (load && thisStartPreLoad === currentStartPreLoad)
      await idbKeyval.set('nomsIcones', nomsIcones); // Mémorise la liste des icônes mises en cache

    //console.log(nomsIconesMemorises); //DCMM
    //console.log(nomsIcones); //DCMM
  }
  return mesure;

  /*************************************************************************
   * INFORMATIONS NÉCÉSSAIRES À L'AFFICHAGE DES FICHES ET DE SES COMMENTAIRES
   * Elles sont chargées par dalles bbox dans indexedDB avec une clé égale à la valeur de id_point
   * sauf les photos dqui sont mémorisées par le cache de l'explorateur
   * Une fois chargés, seules sont rafraichies les fiches ou commentaires récement modifiés (API bbox?depuis=)
   * Une entrée supplémentaire indexedDB est créée pour signaler que la dalle a été traités
   * dont la clé est la bbox (0.5,43.5,1,44) et la valeur la date epoch de mise en cache
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
        apiUrl = serveurAPI + '/api/bbox?detail=fiche&format_texte=html&nb_points=all&bbox=' + bbox;

      console.log('await idbKeyval.get(bbox)'); //DCMM
      if (thisStartPreLoad === currentStartPreLoad &&
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
          .catch(error => console.error(error + ' in fetching ' + apiUrl));

        blocsAMeroriser[bbox] = Date.now(); // Marque la bbox comme mémorisée, même s'il n'y avait pas de fiches
        await idbKeyval.setMany(blocsAMeroriser.map((v, k) => [k, v]));
      }
    }

  return mesure; //DCMM

  /* DALLES OPENHIKINGMAP
     elles sont mémorisées par le cache du service-worker
     Une entrée indexedDB est créée dont la clé est z/x/y pour ne l'appeler qu'une fois
   */
  const tilesRefreshTime = 60 * 1000, // Milliseconds
    minZoomPreLoadedTiles = 8,
    maxZoomPreLoadedTiles = 12,
    preLoadedTilesAround = 2;

  for (let ecart = 1; ecart <= preLoadedTilesAround; ecart++)
    for (let zoom = minZoomPreLoadedTiles; zoom <= maxZoomPreLoadedTiles; zoom++) {
      const baseTileXY = Object.values(
        map.project(Object.values(map.getCenter()), zoom)
      ).map(a => Math.round(a / 256));

      for (let x = baseTileXY[0] - ecart; x < baseTileXY[0] + ecart; x++)
        for (let y = baseTileXY[1] - ecart; y < baseTileXY[1] + ecart; y++)
          if (thisStartPreLoad === currentStartPreLoad) {
            const baseTileRef = zoom + '/' + x + '/' + y,
              url = 'https://tile.openmaps.fr/openhikingmap/' + baseTileRef + '.png';

            // Si le préchargement est récent
            if (await idbKeyval.get(baseTileRef) < (Date.now() - tilesRefreshTime)) {
              await fetch(url); // Charger la dalle dans le cache de l'explorateur
              await idbKeyval.set(baseTileRef, Date.now()); // Mark cache date
            }
          }
    }

  return mesure;
};