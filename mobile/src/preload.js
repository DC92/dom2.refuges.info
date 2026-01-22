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
const tilesRefreshTime = 30000, // Milliseconds
  minZoomPreloadedTiles = 6,
  maxZoomPreloadedTiles = 15,
  preloadedTilesAround = 5,
  maxTilesPerRequest = 40;

/******************************************************************************************
 * Les informations nécéssaires à l'affichage de la fiche d'un point et de ses commentaires
 * sont chargées par dalles dans indexedDB avec la clé égale à la valeur de id_point
 * Une fois chargés, ne sont rafraichis que les points ou commentaires récement modifiés.
 * Les photos des points visualisés sont sont mémorisées par le cache de l'explorateur
 * Une entrée indexedDB est créée, dont la clé est 0.5,43.5,1,44 et la valeur la date de mise en cache
 */
const pointsTileSize = 0.25; // ° lon / lat

/********************************************************************
 * Les informations nécéssaires à l'affichage des icônes sur la carte
 * sont raffraichies globalement par GeoJsonAjaxCluster
 * quand un point a été modifié sur la carte.
 */
//TODO : le faire ici

/* global idbKeyval, serveurAPI */

//TODO load 1 fiche (affichage point)
//TODO preload nouveautés (depuis date / modifier l'API)

function purge(objet) {
  for (const k in objet)
    if (!objet[k])
      delete objet[k];
  return objet;
}

async function preLoadPoints(url) {
  const pointsProps = [];

  // Données des points
  await fetch(url)
    .then(response => response.json())
    .then(geoJson => geoJson.features.forEach(feature => {
      // Extrait les propriétés intéressantes du point
      pointsProps[feature.id] = {
        commentaires: [], // Initialise la propriété
      };
      Object.entries(feature.properties).forEach(p => {
        if ('id,nom,coord,info_comp'.includes(p[0])) {
          pointsProps[feature.id][p[0]] = p[1];
          delete pointsProps[feature.id][p[0]].precision;
        }
        if ('type,proprio,acces,remarque,description,places,etat'.includes(p[0])) {
          const v = p[1].valeur;
          if (v) pointsProps[feature.id][p[0]] = v;
        }
      });
    }));

  // Données des commentaires
  if (pointsProps.length) // If any point in this bbox
    await fetch(serveurAPI + '/api/commentaires' +
      '?format_texte=html&id_point=' + Object.keys(pointsProps).join(','))
    .then(response => response.json())
    .then(json => Object.values(json).forEach(commentaire => {
      if (typeof commentaire === 'object')
        pointsProps[commentaire.id_point]
        .commentaires['C' + commentaire.id_commentaire] =
        purge({ //TODO simplifier
          texte: commentaire.texte_commentaire,
          auteur: commentaire.auteur_commentaire,
          photo: Boolean(commentaire['photo-reduite']),
        });
    }));

  if (pointsProps.length) {
    // Enregistre les propriétés du point
    await idbKeyval.setMany(pointsProps.map((v, k) => [k, v]));

    // Retourne les propriétés du premier point
    return Object.values(pointsProps)[0];
  }
}

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

  // Coordonnées de la dalle contenant la position
  const xy = Object.values(position).map(a => Math.round(a / pointsTileSize));

  for (let x = 0; x < 2; x++)
    for (let y = 0; y < 2; y++) {
      const bbox = [xy[1] + y - 1, xy[0] + x - 1, xy[1] + y, xy[0] + x]
        .map((a) => a * pointsTileSize).join(','),
        memPairs = []; // Paires à mémoriser;

      idbKeyval.set([bbox, Date.now()]); // Mark cache date

      // Si les points de la bbox ne sont pas déjà stockés dans IndexedDB
      if (!preLoadedEntries[bbox])
        await preLoadPoints(serveurAPI + '/api/bbox?detail=complet&nb_points=all&bbox=' + bbox);
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