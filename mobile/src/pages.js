/* global serveurAPI, mapKeys, initMap, idbKeyval */

//TODO supprimer le SW et le cache si debug
//TODO recherche de points

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
 * Affichage d'une page *
 ************************/
const nomPages = ['carte', 'fiche'],
  map = initMap('map', serveurAPI, mapKeys);

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
  window['controleur' + page[0].toUpperCase() + page.slice(1)](ancre);
}

// Exécute à l'init
route();

// Changement externe de l'ancre
window.addEventListener('popstate', route);

/**************
 * Page carte *
 **************/
/* eslint-disable-next-line no-unused-vars */
function controleurCarte() {
  const pos = localStorage.permalink.split('/');

  map.setView([pos[1], pos[2]], pos[0]);
  map.invalidateSize();
}

/**************
 * Page fiche *
 **************/
function vueFiche(json) {
  const properties = json.properties,
    donnees = {
      nom: properties.nom,
      lat: json.geometry.coordinates[0],
      lng: json.geometry.coordinates[1],
      alt: properties.coord.alt,
      rubriques: properties,
      //TODO masquer "Informations complémentaires": si pas d'info_comp
      //BEST format de Léo
      complements: properties.info_comp,
    };
  console.log(properties); //DCMM

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
  const commentEl = document.getElementById('fiche-commentaires');

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
function controleurFiche(idFiche) {
  const apiUneFicheUrl = serveurAPI + '/api/point?detail=fiche&format_texte=html&id=' + idFiche;

  // Récupère les infos de la fiche dans indexDB
  console.log(idbKeyval); //DCMM
  idbKeyval.get(parseInt(idFiche, 10))
    .catch((er) => console.error(er))
    //TODO BUG quand il n'y a pas de base keyval
    .then((jsonFiche) => {
      console.log(jsonFiche); //DCMM
      if (jsonFiche)
        vueFiche(jsonFiche);
      else
        // Sinon, va les chercher sur le serveur
        fetch(apiUneFicheUrl)
        .catch((er) => console.error(er + ' fetching ' + apiUneFicheUrl))
        .then((response) => response.json())
        .then((json) => {
          if (json.features.length)
            vueFiche(json.features[0]);
        });
    });
}