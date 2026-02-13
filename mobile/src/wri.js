/* global requeteAPI, initCarte, prepareModeleGroupe, appliqueDonnees */
/* global preLoadTiles, preLoadPoints, serveurAPI, idbKeyval, debugPWA */

const nomPages = ['carte', 'point', 'nouvelles'];

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
        json[j].lien_interne = '#point=' + json[j].id_point;

      prepareModeleGroupe('nouvelles-groupe', Object.keys(json).length - 1); // -1 pour la ligne copyright dans le json
      appliqueDonnees('nouvelles-groupe', json);
    }
  );
}

/**************
 * Page point *
 **************/
/* eslint-disable-next-line no-unused-vars */
async function affichePagePoint(idPoint) {
  /*DCMM
  const //DCMM infoEl = document.getElementById('infos-point'),
    //DCMM commentEl = document.getElementById('commentaires'),
    url = serveurAPI + '/api/points?detail=avec_commentaires&format_texte=html&id=' + idPoint,
    properties = debugPWA ?
    await preLoadPoints(url) :
    await idbKeyval.get(parseInt(idPoint, 10)) || // Si le point est préchargé
    await preLoadPoints(url); // Essaye de le charger

  map.setView([properties.coord.lat, properties.coord.long], 15);
  //TODO BUG positionnement carte au chargement de la fiche
  //TODO charger à partir de la couche bbox points globale.
  //TODO autres paramètres de page

  Object.entries({
      ...properties,
      ...properties.coord,
      ...properties.type,
      ...properties.etat
    })
    .forEach(entry => {
      const el = document.getElementById('point-' + entry[0]);

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