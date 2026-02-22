/* global serveurAPI, map */

/****************************
 * Gestion de l'application *
 ****************************
 L'application est constituée d'une page HTML unique (index.html),
 chargé lors du lancement de l'application s'il est "installé' (PWA) ou comme une fichier html classique
 La carte reste ouverte dans un élément <div id="map> pour toutes les vues (carte, point, ...)
 seules sont modifiées sa taille et les coordonnée de sa vue.

 Les différentes vues sont définies par l'ancre (#abcdef à la fin de l'url) qui évolue de façon à ce que l'url complète constitue un permalink.
 Le nom de la vue est attribué à la classe de l'élémént <BODY> qui pilote les différentes variantes de .CSS
*/

/***********************
 * Affichage de la vue *
 ***********************/
const nomVues = ['carte', 'nouvelles', 'fiche'];

function afficheVue(defaut) {
  const ancre = location.hash.replace('#', '') || defaut || defaultPermalink;
  let vue = 'carte';

  // Détermine la vue en fonction de l'ancre
  if (ancre.match(/^[0-9]+$/u))
    vue = 'fiche'; // #1234 affiche la fiche de la cabane 1234
  else if (nomVues.includes(ancre))
    vue = ancre; // #nouvelles affiche les nouvelles

  console.info('afficheVue ' + ancre + ' ' + vue);

  // Assigne le style de la vue à montrer
  document.body.className = vue;

  // Execute la fonction d'initialisation de la vue
  window[vue + 'Affiche'](ancre);
}

// Affiche la vue lorsque l'ancre change
window.addEventListener('popstate', afficheVue);

/*************************************************
 * Initialisation de la page ou de l'application *
 *************************************************/
window.addEventListener('load', () => {
  // Récupère en une seule transaction (pour ne pas générer de deadlock) les infos mémorisées dans indexedDB
  idbKeyval.getMany(['permalink', 'iconesJson' /*, location.hash.replace('#', '')*/ ])
    .then(([dbPermalink, dbIconesJson /*, ficheJson*/ ]) => {

      console.info('idbKeyval.getMany'); /*DCMM*/

      // Récupére la dernière position si pas d'argument
      if (location.hash)
        afficheVue(dbPermalink);
      else
        location.hash = dbPermalink;

      // Popule les icones mémorisées sur la carte
      afficheIcones(dbIconesJson);

      //TODO ?depuis & | (re)charge icones
    });
});

/**************
 * Page carte *
 **************/
/* eslint-disable-next-line no-unused-vars */
function carteAffiche() {
  const permalink = location.hash.match(/[0-9.]+\/[0-9.]+\/[0-9.]+/u)[0].split('/');

  map.setView([permalink[1], permalink[0]], permalink[2]);
  map.invalidateSize();
}

/**************
 * Page fiche *
 **************/
/*function innerHTMLbyID(id, html) {
  const el = document.getElementById(id);

  if (el)
    el.innerHTML = html;
}*/

/* eslint-disable-next-line no-unused-vars */
function ficheAffiche(idFiche) {
}

  /*  fetch(serveurAPI + '/api/point?detail=avec_commentaires&id_point=' + idFiche)
     .then((response) => response.json())
     .then((geoJson) => {
       if (geoJson.features.length) {
         const props = geoJson.features[0].properties,
           coords = geoJson.features[0].geometry.coordinates;

         innerHTMLbyID('fiche-nom', props.nom);
         innerHTMLbyID('fiche-type', props.type.valeur);
         innerHTMLbyID('fiche-lien', props.lien);
         innerHTMLbyID('fiche-lng', coords[0]);
         innerHTMLbyID('fiche-lat', coords[1]);
         innerHTMLbyID('fiche-alt', coords[2]);
       }
     });

   map.invalidateSize();*/

/*DCMM
  const //DCMM infoEl = document.getElementById('infos-fiche'),
    //DCMM commentEl = document.getElementById('commentaires'),
    url = serveurAPI + '/api/points?detail=avec_commentaires&format_texte=html&id=' + idfiche,
    properties = debugPWA ?
    //await preLoadFiches(url) :
    await idbKeyval.get(parseInt(idFiche, 10)) || // Si la fiche est préchargé
    //await preLoadFiches(url); // Essaye de le charger

  map.setView([properties.coord.lat, properties.coord.long], 15);
  //TODO BUG positionnement carte au chargement de la fiche
  //TODO charger à partir de la couche bbox icones globale.
  //TODO autres paramètres de page

  Object.entries({
      ...properties,
      ...properties.coord,
      ...properties.type,
      ...properties.etat
    })
    .forEach(entry => {
      const el = document.getElementById('fiche-' + entry[0]);

      switch (typeof entry[1]) {
        case 'string':
        case 'integer':
          if (el)
            el.innerHTML = entry[1];
          break;
        case 'object':
          entry.forEach(subEntry => {
            if (subEntry.valeur)
              console.log(subEntry); //DCMM
            //  console.log(!!subEntry.valeur); //DCMM
          });
      }
    });
  */

/*
  Object.entries(properties.fiche).forEach(entry => {
//    infoEl.insertAdjacentHTML('beforeend', '<dt>' + entry[0] + ':</dt>');
  //  infoEl.insertAdjacentHTML('beforeend', '<dl>' + entry[1] + '</dl>');
  });

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

/******************
 * Page nouvelles *
 ******************/
/* eslint-disable-next-line no-unused-vars */
function nouvellesAffiche() {
}

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
