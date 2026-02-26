/* global serveurAPI, map, currentPermalink:writable, affichePoints, idbKeyval */

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

// Affiche la vue lorsque l'ancre change
window.addEventListener('popstate', afficheVue);

// Initialisation de la page ou de l'application
window.addEventListener('load', () => {
  // Récupère (en une seule transaction pour ne pas générer de deadlock) les infos mémorisées dans indexedDB
  idbKeyval.getMany(['currentPermalink', 'pointsJson'])
    .then(([dbCurrentPermalink, dbPointsJson]) => {

      // Affiche la vue correpondant à #ancre
      afficheVue();

      // Récupére la dernière position
      if (dbCurrentPermalink)
        currentPermalink = dbCurrentPermalink;

      // Popule la carte avec les points mémorisées
      affichePoints(dbPointsJson);

      // Demande la (re)charge des icônes depuis le serveur
      //TODO tester si présent sur le serveur et depuis
      const apiUrl = serveurAPI + '/api/points?detail=minimal';
      fetch(apiUrl)
        .then((response) => response.text())
        .then((geoJson) => {
          affichePoints(geoJson);
          idbKeyval.set('pointsJson', geoJson);
        })
        .catch(error => console.error(error + ' ' + apiUrl));
    });
});

/*************
 * Vue carte *
 *************/
/* eslint-disable-next-line no-unused-vars */
function carteAffiche() {
  const hashPermalink = location.hash.match(/[0-9.]+\/[0-9.]+\/[0-9.]+/u),
    pos = (hashPermalink ? hashPermalink[0].split('/') : currentPermalink);

  map.setView([pos[1], pos[2]], pos[0]);
  map.invalidateSize();
}

/*************
 * Vue fiche *
 *************/
/* eslint-disable-next-line no-unused-vars */
function ficheAffiche(idFiche) {
  const apiUrl = serveurAPI + '/api/point?detail=avec_commentaires&format_texte=html&id=' + idFiche;
  //TODO get point from DB dans une zone
  fetch(apiUrl)
    .then((response) => response.json())
    .then((geoJson) => {
      if (geoJson.features.length) {
        const coord = geoJson.features[0].geometry.coordinates,
          properties = geoJson.features[0].properties;

        // Positionne la carte et les coordonnées
        map.setView([coord[1], coord[0]], 15);
        map.invalidateSize();
        document.getElementById('fiche-lat').innerHTML = coord[0];
        document.getElementById('fiche-lng').innerHTML = coord[1];
        document.getElementById('fiche-coord-alt').innerHTML = properties.coord.alt;

        //TODO css des infos complémentaires
        //TODO factoriser ce code
        // Affiche les propriétés
        for (const key in properties) {
          const el = document.getElementById('fiche-' + key);

          if (el) {
            if (typeof properties[key] === 'string')
              el.innerHTML = properties[key];
            if (typeof properties[key].valeur === 'string')
              el.innerHTML = properties[key].valeur;
          }
        }

        // Affiche les zones de texte
        const zonesTexte = {
          rubriques: properties,
          complements: properties.info_comp,
        };

        for (const zt in zonesTexte) {
          const el = document.getElementById('fiche-' + zt),
            proprietes = zonesTexte[zt];

          el.innerHTML = '';
          for (const key in proprietes)
            if (proprietes[key].nom && proprietes[key].valeur) {
              el.insertAdjacentHTML('beforeend',
                '<h3>' + proprietes[key].nom + ':</h3>' +
                '<p>' + proprietes[key].valeur + '</p>');
            }
        }
      }
    })
    .catch(error => console.error(error + ' ' + apiUrl));
}

//TODO COMMENTAIRES
/*DCMM
  Object.values(properties.commentaires).forEach(c => {

    commentEl.insertAdjacentHTML('beforeend',
      '<div>' +
      '<span>' + (c.auteur || 'Inconnu') + ' - ' + (c.date || '') + '</span>' +
      (c.texte ? '<p>' +
        (c.photo ? '<img src="' + (serveurAPI + c.photo) + '"></img>' : '') +
        c.texte + '</p>' : '') +
      '</div>'
    );
  });
*/

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