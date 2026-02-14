/* global requeteAPI, prepareModeleGroupe, appliqueDonnees */

/*************************
 * Gestion des templates *
 *************************/
const nomPages = ['carte', 'fiche', 'nouvelles'];

// Initialisation de la page lorsque l'URL principale est appelée
idbKeyval.getMany(['permalink', 'iconesJson', location.hash.replace('#', '')])
  .then(([dbPermalink, iconesJson, ficheJson]) => {
    // Récupére la position dans l'argument ou la dernière position
    const hashPermalink = location.hash.match(/[0-9.]+\/[0-9.]+\/[0-9.]+/u) || [],
      permalink = (hashPermalink[0] || dbPermalink || defaultPermalink).split('/');

    if (permalink.length === 3)
      map.setView([permalink[1], permalink[0]], permalink[2]);

    // Affiche les icones
    if (iconesJson)
      afficheIcones(iconesJson);

    // Affiche les infos de la fiche si elles sont mémorisées
    if (ficheJson)
      afficheInfosFiche(ficheJson);
  });

function afficheInfosFiche() {} //TODO

// Initialisation de la page lorsque l'URL principale est appelée ou l'ancre change
function changePage() {
  const ancre = window.location.hash.replace('#', '').split('=');

  // Attribue le nom de la page à l'ID du body
  document.body.id = nomPages.includes(ancre[0]) ? ancre[0] : 'carte';

  // Supprime tous les états d'affichage de la page précédente
  document.body.className = '';

  // Execute la function d'initialisation de la page
  const nomFonctionAffiche = 'affichePage' + document.body.id.replace(/^[a-z]/u, (m) => m.toUpperCase());
  window[nomFonctionAffiche](ancre[1]);
}

window.addEventListener('load', changePage); // Chargement initial du html
window.addEventListener('popstate', changePage); // L'ancre change ou navigation par les boutons buttons

/**************
 * Page carte *
 **************/
/* eslint-disable-next-line no-unused-vars */
function affichePageCarte() {}

/******************
 * Page nouvelles *
 ******************/
/* eslint-disable-next-line no-unused-vars */
function affichePageNouvelles() {
  //TODO BUG ne précharge pas les nouvelles
  requeteAPI(
    'nouvelles',
    '/api/contributions?format=json&format_texte=html&massif=352&nombre=10',
    null,
    (json) => {
      // Calcule le lien pour afficher la page qui correspond
      for (const j in json)
        /* eslint-disable-next-line camelcase */
        json[j].lien_interne = '#' + json[j].id_point;

      prepareModeleGroupe('nouvelles-groupe', Object.keys(json).length - 1); // -1 pour la ligne copyright dans le json
      appliqueDonnees('nouvelles-groupe', json);
    }
  );
}

/**************
 * Page fiche *
 **************/
/* eslint-disable-next-line no-unused-vars */
async function affichePageFiche(idFiche) {
  map.invalidateSize();
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
}