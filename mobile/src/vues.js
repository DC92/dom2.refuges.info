/* global serveurAPI, map, idbKeyval */

/****************************
 * Gestion de l'application *
 ****************************
 L'application est constituée d'une page HTML unique (index.html),
 chargé lors du lancement de l'application s'il est "installé' (PWA) ou comme une fichier html classique
 La carte reste ouverte dans un élément <div id="map> pour toutes les vues (carte, point, ...)
 seules sont modifiées sa taille et les coordonnée de sa vue.

 Les différentes vues sont définies par l'ancre (#abcdef à la fin de l'url)
 qui évolue de façon à ce que l'url complète constitue un permalink.
 Le nom de la vue est attribué à la classe de l'élémént <BODY> qui pilote les différentes variantes de .CSS
*/

/***********************
 * Affichage de la vue *
 ***********************/
const nomVues = ['carte', 'nouvelles', 'fiche'];

// Affiche la vue lorsque #ancre de l'URL change
function afficheVue() {
  const ancre = location.hash.replace('#', '');

  // Par défaut, la carte
  let vue = 'carte';

  // #nouvelles
  if (nomVues.includes(ancre))
    vue = ancre;
  // #1234 : fiche de la cabane 1234
  else if (ancre.match(/^[0-9]+$/u))
    vue = 'fiche';

  console.info('affiche ' + vue + ' ' + ancre);

  // Assigne le style de la vue à montrer
  document.body.className = vue;

  // Execute la fonction d'initialisation de la vue
  window['afficheVue' + vue](ancre);
}

// Exécute à l'init
afficheVue();

// Changement externe de l'ancre
window.addEventListener('popstate', afficheVue);

/*************
 * Vue carte *
 *************/
/* eslint-disable-next-line no-unused-vars */
function afficheVuecarte() {
  const pos = localStorage.permalink.split('/');

  map.setView([pos[1], pos[2]], pos[0]);
  map.invalidateSize();
}

/**********
 * Fiches *
 **********/
function afficheInfosFiche(json) {
  const //coordinates = json.geometry.coordinates,
    properties = json.properties,
    commentEl = document.getElementById('fiche-commentaires'),
    donnees = {
      lat: json.geometry.coordinates[0],
      lng: json.geometry.coordinates[1],
      'coord-alt': properties.coord.alt,
      rubriques: properties,
      //TODO masquer "Informations complémentaires": si pas d'info_comp
      complements: properties.info_comp,
    };

  // Positionne la carte et les coordonnées
  map.setView([donnees.lng, donnees.lat], 15);
  map.invalidateSize();

  // Affiche les données de la fiche
  for (const kd in donnees) {
    const el = document.getElementById('fiche-' + kd);

    if (el && typeof donnees[kd] === 'object') {
      el.innerHTML = '';
      for (const kdd in donnees[kd])
        if (donnees[kd][kdd].nom && donnees[kd][kdd].valeur)
          el.insertAdjacentHTML('beforeend',
            '<h3>' + donnees[kd][kdd].nom + ':</h3>' +
            '<p>' + donnees[kd][kdd].valeur + '</p>');
    } else
      el.innerHTML = donnees[kd];
  }

  // Affiche les commentaires
  if (properties.commentaires && properties.commentaires.length) {
    commentEl.innerHTML = ''; // Efface la zone commentaires

    for (const comment of properties.commentaires) {
      commentEl.insertAdjacentHTML('beforeend',
        '<div>' +
        '<span>' + (comment.auteur || 'Inconnu') + ' - ' + (comment.date || '') + '</span>' +
        (comment.texte ? '<p>' +
          (comment.photo ? '<img src="' + (serveurAPI + comment.photo) + '"></img>' : '') +
          comment.texte + '</p>' : '') +
        '</div>'
      );
    }
  }
}

/*************
 * Vue fiche *
 *************/
/* eslint-disable-next-line no-unused-vars */
function afficheVuefiche(idFiche) {
  const apiUneFicheUrl = serveurAPI + '/api/point?detail=fiche&format_texte=html&id=' + idFiche;

  // Récupère les infos de la fiche dans indexDB
  idbKeyval.get(parseInt(idFiche, 10))
    .catch((er) => console.error(er))
    //TODO BUG quand il n'y a pas de base keyval
    .then((jsonFiche) => {
      if (jsonFiche)
        afficheInfosFiche(jsonFiche);
      else
        // Sinon, va les chercher sur le serveur
        fetch(apiUneFicheUrl)
        .catch((er) => console.error(er + ' fetching ' + apiUneFicheUrl))
        .then((response) => response.json())
        .then((json) => {
          if (json.features.length)
            afficheInfosFiche(json.features[0]);
        });
    });
}

/*****************
 * Vue nouvelles *
 *****************/
/* eslint-disable-next-line no-unused-vars */
function afficheVuenouvelles() {}
//TODO BUG ne précharge pas les nouvelles
/*
requeteAPI(
  'nouvelles',
  '/api/contributions?format=json&format_texte=html&massif=352&nombre=10',
  null,
  (json) => {
    // Calcule le lien pour afficher la page qui correspond
    for (const j in json)
      /* eslint-disable-next-line camelcase * /
      json[j].lien_interne = '#' + json[j].id_point;

    prepareModeleGroupe('nouvelles-groupe', Object.keys(json).length - 1); // -1 pour la ligne copyright dans le json
    appliqueDonnees('nouvelles-groupe', json);
  }
);*/

/************************************************
 * Préchargement des fiches autour de la position
 * Elles sont chargées par dalles bbox dans indexedDB avec une clé égale à la valeur de id_point
 * sauf les photos dqui sont mémorisées par le cache de l'explorateur
 * Une fois chargés, seules sont rafraichies les fiches ou commentaires récement modifiés (API bbox?depuis=)
 * Une entrée supplémentaire indexedDB est créée pour signaler que la dalle a été traités
 * dont la clé est la bbox (0.5,43.5,1,44) et la valeur la date epoch de mise en cache
 */
map.on('moveend', async () => {
  //TODO BUG demande avant de récupérer la fiche !
  //return;/*DCMM*/
  console.info('MAP moveend préchargement fiches');

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

      //console.log('await idbKeyval.get(bbox)'); //DCMM
      if (!await idbKeyval.get(bbox) // Si la dalle n'est pas déjà notée chargée
        .then((v) => v) //  
        .catch((er) => console.error(er + ' idbKeyval.get nomsIcones'))
        //.finally(() => console.info('END idbKeyval.get nomsIcones')) //DCMM
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
        //console.info('idbKeyval.setMany blocsAMeroriser'); //DCMM
        await idbKeyval.setMany(blocsAMeroriser.map((v, k) => [k, v]))
          //.finally(() => console.info('END idbKeyval.setMany blocsAMeroriser')) //DCMM
          .catch((er) => console.error(er + ' idbKeyval.setMany blocsAMeroriser'));
      }
    }
});