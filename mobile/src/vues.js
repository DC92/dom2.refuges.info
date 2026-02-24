/* global serveurAPI, map, currentPosition:writable, afficheIcones, idbKeyval */

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
  idbKeyval.getMany(['currentPosition', 'iconesJson' /*, location.hash.replace('#', '')*/ ])
    .then(([dbCurrentPosition, dbIconesJson /*, ficheJson*/ ]) => {

      // Récupére la dernière position
      if (dbCurrentPosition)
        currentPosition = dbCurrentPosition;

      // Popule la carte avec les icones mémorisées
      afficheIcones(dbIconesJson);
      //TODO ?depuis & | (re)charge icones

      afficheVue();
    });
});

/*************
 * Vue carte *
 *************/
/* eslint-disable-next-line no-unused-vars */
function carteAffiche() {
  const hashPermalink = location.hash.match(/[0-9.]+\/[0-9.]+\/[0-9.]+/u),
    pos = (hashPermalink ? hashPermalink[0].split('/') : currentPosition);

  map.setView([pos[1], pos[0]], pos[2]);
  map.invalidateSize();
}

/*************
 * Vue fiche *
 *************/
/*function innerHTMLbyID(id, html) {
  const el = document.getElementById(id);

  if (el)
    el.innerHTML = html;
}*/

function champFiche(arg) {
  console.log(arg); //DCMM
  if (typeof arg === 'string')
    return arg;

  //if(typeof arg.valeur==='string')
  if (arg.nom && arg.valeur)
    return (arg.nom ? '<h3>' + arg.nom + ':</h3> ' : '') + '<p>' + champFiche(arg.valeur) + '</p>';

  //TODO itérer
  //  if(typeof arg==='object')
  //    return champFiche(arg);

  return JSON.stringify(arg);
}

/* eslint-disable-next-line no-unused-vars */
function ficheAffiche(idFiche) {
  console.log(idFiche); //DCMM

  //TODO get point from DB
  fetch(serveurAPI + '/api/point?detail=avec_commentaires&id_point=' + idFiche)
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

        // Affiche les zones de texte
        for (const key in properties) {
          const el = document.getElementById('fiche-' + key);

          if (el)
            el.innerHTML = champFiche(properties[key]);
        }

        console.log(properties); //DCMM
        /*

         innerHTMLbyID('fiche-nom', props.nom);
         innerHTMLbyID('fiche-type', props.type.valeur);
         innerHTMLbyID('fiche-lien', props.lien);
         innerHTMLbyID('fiche-lng', coords[0]);
         innerHTMLbyID('fiche-lat', coords[1]);
         innerHTMLbyID('fiche-alt', coords[2]);
       */
      }
    });
}
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