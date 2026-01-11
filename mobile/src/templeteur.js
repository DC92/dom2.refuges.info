/* global serveurApi, XMLHttpRequest */

/******************
 * Appel de l'API *
 ******************/
/* eslint-disable-next-line no-unused-vars */
function requeteAPI(nom, url, donneesPost, callBack) {
  const req = new XMLHttpRequest();

  // Affiche le panneau d'attente le temps que XMLHttpRequest réponde
  document.body.classList.add('attente-api-' + nom);

  req.open(donneesPost ? 'POST' : 'GET', serveurApi + url, true);
  req.onload = () => {
    callBack(JSON.parse(req.responseText));
    document.body.classList.remove('attente-api-' + nom);
  };
  req.send(donneesPost);
}

/************************
 * Applique les données *
 ************************
value = {
  a: {
    b: 123
  }
}
à
<tag id="id-a-b">123</tag>
*/
function appliqueDonnees(id, value) {
  const el = document.getElementById(id);

  if (typeof value === 'object') {
    for (const v in value)
      appliqueDonnees(id + '-' + v, value[v]);
  } else if (el) {
    if (el.tagName === 'IMG' && value && value[0] === '/')
      el.src = value;
    if (el.tagName === 'IMG' && value)
      el.src = serveurApi + value;
    else if (el.tagName === 'A' && value[0] === '#')
      el.href = value;
    else if (el.tagName === 'A')
      el.href = serveurApi + value;
    else
      el.innerHTML = value;
  }
}

/****************************************************************************
 * Multiplie le modele de groupe jusqu'au nombre d'informations disponibles *
 ****************************************************************************
<div id="commentaires-groupe">
  <div><!-- Modèle pour un commentaire -->
    <img id="commentaires-groupe-0-photo-reduite">
    <p id="commentaires-groupe-0-texte_commentaire"></p>
  </div>
</div>
*/
/* eslint-disable-next-line no-unused-vars */
function prepareModeleGroupe(id, nb) {
  const groupEl = document.getElementById(id);

  // Nettoie les éléments de données existants
  groupEl.querySelectorAll('[id^="' + id + '"]')
    .forEach(el => appliqueDonnees(el.id, ''));

  // Ajoute autant de modeles que nécéssaire
  while (groupEl.children.length < nb)
    groupEl.insertAdjacentHTML(
      'beforeend',
      groupEl.children[0].outerHTML.replaceAll('0', groupEl.children.length)
    );

  // Masquer les modeles superflus
  for (let t = 0; t < groupEl.children.length; t++)
    groupEl.children[t].style.display = t < nb ? '' : 'none';
}