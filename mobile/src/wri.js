/* global requeteAPI, initCarte, prepareModeleGroupe, appliqueDonnees, preLoad, preLoadPoints, serveurAPI, idbKeyval */

const nomPages = ['carte', 'point', 'nouvelles'],
  map = initCarte('map');

// Prè-charge les dalles OpenHikingMap, points et commentaires autour de la zone visitée
map.on('moveend', () => preLoad(map, map.getCenter()));

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
function affichePageCarte() {
  map.setView([45, 5.5], 10); // Puits des Ravières
}

/******************
 * Page nouvelles *
 ******************/
/* eslint-disable-next-line no-unused-vars */
function affichePageNouvelles() {
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
  const infoEl = document.getElementById('infos-point'),
    commentEl = document.getElementById('commentaires'),
    properties =
    //DCMM await idbKeyval.get(parseInt(idPoint, 10)) || // Si le point est préchargé
    await preLoadPoints(serveurAPI + '/api/point?detail=complet&format_texte=html&id=' + idPoint); // Essaye de le charger

  map.setView([properties.coord.lat, properties.coord.long], 15);

  Object.entries(properties.fiche).forEach(e => {
    infoEl.insertAdjacentHTML('beforeend', '<dt>' + e[0] + ':</dt>');
    infoEl.insertAdjacentHTML('beforeend', '<dl>' + e[1] + '</dl>');
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

    /*
     commentEl.insertAdjacentHTML('beforeend', '<dt>' +(c.auteur||'Inconnu') + ' ' +(c.date||'') + '</dt>');
    commentEl.insertAdjacentHTML('beforeend', '<dl>' +c.texte + '</dl>');
    */
  });
}