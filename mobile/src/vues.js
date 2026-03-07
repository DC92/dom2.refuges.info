/* global serveurAPI, map */

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

const apiFicheUrl = serveurAPI + '/api/point?detail=fiche&format_texte=html&id='; // + idFiche

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
  window[vue + 'Affiche'](ancre);
}

// Exécute à l'init
afficheVue();

// Changement externe de l'ancre
window.addEventListener('popstate', afficheVue);

/*************
 * Vue carte *
 *************/
/* eslint-disable-next-line no-unused-vars */
function carteAffiche() {
  const pos = localStorage.permalink.split('/');

  map.setView([pos[1], pos[2]], pos[0]);
  map.invalidateSize();
}

/*************
 * Vue fiche *
 *************/
/* eslint-disable-next-line no-unused-vars */
function ficheAffiche(idFiche) {
  //TODO get point from DB dans une zone
  fetch(apiFicheUrl + idFiche)
    .then((response) => response.json())
    .then((json) => {
      if (json && json.features.length) {
        const coord = json.features[0].geometry.coordinates,
          properties = json.features[0].properties,
          commentEl = document.getElementById('fiche-commentaires');

        // Positionne la carte et les coordonnées
        map.setView([coord[1], coord[0]], 15);
        map.invalidateSize();

        // Affiche les données
        const donnees = {
          lat: coord[0],
          lng: coord[1],
          'coord-alt': properties.coord.alt,
          rubriques: properties,
          //TODO masquer "Informations complémentaires": si pas d'info_comp
          complements: properties.info_comp,
        };

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
    })
    .catch(er => console.error(er + ' fetching ' + apiFicheUrl));
}

/*****************
 * Vue nouvelles *
 *****************/
/* eslint-disable-next-line no-unused-vars */
function nouvellesAffiche() {}
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