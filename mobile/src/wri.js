/* global requeteAPI, initCarte, prepareModeleGroupe, appliqueDonnees, preLoad, preLoadPoints, idbKeyval */

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
  const properties =
    await idbKeyval.get(parseInt(idPoint, 10)) || // Si le point est préchargé
    await preLoadPoints('point?id=' + idPoint); // Essaye de le charger

  map.setView([properties.coord.lat, properties.coord.long], 15);

  //*DCMM*/console.log(properties);

  /*
      const properties = json.features[0].properties,
        coords = json.features[0].geometry.coordinates,
        infoComp = {};

      // Infos complémentaires
      // Filtre les infos non signifiantes
      properties.info_comp.places = properties.places;
      let ii = 0;
      for (const ic in properties.info_comp)
        if (!'§ 0 Sans'.includes(properties.info_comp[ic].valeur || '§'))
          infoComp[ii++] = properties.info_comp[ic];

      prepareModeleGroupe('point-infos-groupe', Object.keys(infoComp).length);
      appliqueDonnees('point-infos-groupe', infoComp);

      // Infos de la fiche
      //BEST enlever titre de la rubrique quand elle est vide
      /* eslint-disable-next-line camelcase * /
      properties.lien_externe = '/point/' + properties.id;
      appliqueDonnees('point', properties);
    }
  );

  // Charge les données des commentaires
  requeteAPI(
    'commentaires',
    '/api/commentaires?format=json&format_texte=html&id_point=' + idPoint,
    null,
    (json) => {
      prepareModeleGroupe('commentaires-groupe', Object.keys(json).length - 1); // -1 pour le copyright
      appliqueDonnees('commentaires-groupe', json);
    }
  );
  */
}