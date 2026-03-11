/* global serveurAPI, map, affichePoints, idbKeyval */

// Redemande tous les points au serveur
//TODO le faire quand tout le reste est stable
//TODO tester si présent sur le serveur et depuis
const apiPointsUrl = serveurAPI + '/api/bbox?detail=icone&nb_points=all';

fetch(apiPointsUrl)
  .then((response) => response.text())
  .catch((er) => console.error(er + ' fetching ' + apiPointsUrl))
  .then((geoJson) => {
    //TODO précharger toutes les icônes citées
    // Affiche ou réaffiche les points reçus
    affichePoints(geoJson);

    // Les enregistre à la place des précédents
    localStorage.pointsGeoJson = geoJson;
  });


/**************************************************
 * Préchargement des fiches autour de la position *
 **************************************************
Elles sont chargées par dalles bbox dans indexedDB avec une clé égale à la valeur de id_point
sauf les photos qui sont mémorisées par le cache de l'explorateur
Une fois chargés, seules sont rafraichies les fiches ou commentaires récement modifiés (API bbox?depuis=)
Une entrée supplémentaire indexedDB est créée pour signaler que la dalle a été traités
dont la clé est la bbox (0.5,43.5,1,44) et la valeur la date epoch de mise en cache
*/
//TODO le faire quand tout le reste est stable
map.on('moveend', async () => {
  //return;//DCMM
  //TODO BUG demande avant de récupérer la fiche !
  console.info('MAP moveend préchargement fiches');

  console.log(new Error().stack); //DCMM

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

      console.log(idbKeyval); //DCMM
      if (!await idbKeyval.get(bbox) // Si la dalle n'est pas déjà notée chargée
        .then((v) => v) //  
        .catch((er) => console.error(er + ' idbKeyval get nomsIcones'))
      ) {
        // Regroupe l'enregistrement de toutes les fiches d'une bbox dans une seule transaction
        const blocsAMeroriser = [];

        // Demande les fiches dans la bbox (requêtes suspensives, donc faites une par une en attendant le retour
        await fetch(apiUrl)
          .then(response => response.json())
          .then(geoJson => {
            geoJson.features.forEach(feature => {
              blocsAMeroriser[feature.id] = feature;
            });
          })
          .catch((er) => console.error(er + ' fetching ' + apiUrl));

        blocsAMeroriser[bbox] = Date.now(); // Marque la bbox comme mémorisée, même s'il n'y avait pas de fiches
        console.log(idbKeyval); //DCMM
        await idbKeyval.setMany(blocsAMeroriser.map((v, k) => [k, v]))
          .catch((er) => console.error(er + ' idbKeyval setMany blocsAMeroriser'));
      }
    }
});