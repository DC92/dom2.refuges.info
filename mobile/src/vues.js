/* global serveurAPI, map, idbKeyval */

/****************************
 * Gestion de l'application *
 ****************************
 L'application est constituée d'une page HTML unique (index.html),
 chargé lors du lancement de l'application s'il est "installé' (PWA) ou comme une fichier html classique
 La carte reste ouverte dans un élément <div id="map> pour toutes les pages (carte, point, ...)
 seules sont modifiées sa taille et les coordonnées.

 Les différentes pages sont définies par l'ancre (#abcdef à la fin de l'url)
 qui évolue de façon à ce que l'url complète constitue un permalink.
 Le nom de la page est attribué à la classe de l'élémént <BODY> qui pilote les différentes variantes de .CSS
*/

/************************
 * Affichage de la page *
 ************************/
const nomPages = ['carte', 'fiche'];

// Affiche la page lorsque #ancre de l'URL change
function route() {
  const ancre = location.hash.replace('#', '');

  // Par défaut, la carte
  let page = 'carte';

  // #autre_page (à développer)
  if (nomPages.includes(ancre))
    page = ancre;
  // #1234 : fiche de la cabane 1234
  else if (ancre.match(/^[0-9]+$/u))
    page = 'fiche';

  console.info('affiche ' + page + ' ' + ancre);

  // Assigne le style de la page à montrer
  document.body.className = page;

  // Execute la fonction d'initialisation de la page
  window[page + 'Controleur'](ancre);
}

// Exécute à l'init
route();

// Changement externe de l'ancre
window.addEventListener('popstate', route);

/**************
 * Page carte *
 **************/
/* eslint-disable-next-line no-unused-vars */
function carteControleur() {
  const pos = localStorage.permalink.split('/');

  map.setView([pos[1], pos[2]], pos[0]);
  map.invalidateSize();
}

/**********
 * Fiches *
 **********/
function ficheVue(json) {
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

/* eslint-disable-next-line no-unused-vars */
function ficheControleur(idFiche) {
  const apiUneFicheUrl = serveurAPI + '/api/point?detail=fiche&format_texte=html&id=' + idFiche;

  // Récupère les infos de la fiche dans indexDB
  idbKeyval.get(parseInt(idFiche, 10))
    .catch((er) => console.error(er))
    //TODO BUG quand il n'y a pas de base keyval
    .then((jsonFiche) => {
      if (jsonFiche)
        ficheVue(jsonFiche);
      else
        // Sinon, va les chercher sur le serveur
        fetch(apiUneFicheUrl)
        .catch((er) => console.error(er + ' fetching ' + apiUneFicheUrl))
        .then((response) => response.json())
        .then((json) => {
          if (json.features.length)
            ficheVue(json.features[0]);
        });
    });
}

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

      if (!await idbKeyval.get(bbox) // Si la dalle n'est pas déjà notée chargée
        .then((v) => v) //  
        .catch((er) => console.error(er + ' idbKeyval.get nomsIcones'))
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
        await idbKeyval.setMany(blocsAMeroriser.map((v, k) => [k, v]))
          .catch((er) => console.error(er + ' idbKeyval.setMany blocsAMeroriser'));
      }
    }
});