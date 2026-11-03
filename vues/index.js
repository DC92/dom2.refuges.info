/* global couchesIconesWRI, CouchePointsWri, CouchePolygonesWri, couchesDeFond, couchesOverpass, coucheItineraires, controlesComuns */

// Libellés affichés des couches (traduits par le serveur). L'identité d'une couche reste son nom français :
// c'est lui qui est mémorisé dans sessionStorage et cherché dans couchesIconesWRI ;
// on repasse donc du libellé affiché à ce nom (identite).
const libelles = <?=json_encode($vue->libelles_couches)?>,
  identite = Object.fromEntries(Object.entries(libelles).map(([fr, traduit]) => [traduit, fr])),
  libelle = (nom) => libelles[nom] || nom,
  typesPointsParDefaut = 'Cabane non gardée,Refuge gardé,Gîte d\'étape';


/*************************************
 * CARTE, COUCHE DE BASE ET POLYGONE *
 *************************************/
// Carte, couche de base et polygone si /nav
const map = L.map('carte-accueil'),
  polygoneAAfficher =<?=json_encode($vue->polygone ?? null)?>,
  tileLayers = couchesDeFond(<?=json_encode($config_wri['mapKeys'])?>),
  fondDecarteActif = tileLayers[decodeURI(positionMemoryArray[3])] || // Dernière couche affichée
  Object.values(tileLayers)[0]; // Par défaut, première couche déclarée

fondDecarteActif.addTo(map);
L.control.layers(tileLayers).addTo(map); // Sélecteur de couche de base
controlesComuns(map).forEach((control) => control.addTo(map)); // Autres controles

// Enregistre la position et la couche de base courantes
positionMemoryControl(map);

if (polygoneAAfficher) {
  // Dessine le contour du polygone et centre la carte dessus
  const polygonLayer = JSON.parse(polygoneAAfficher.geometrie_geojson),
    massifLayer = L.polygon(
      flipLonLatRecursive(polygonLayer.coordinates), {
        fill: false,
      });

  massifLayer.addTo(map);
  map.fitBounds(massifLayer.getBounds());
} else
  // Place la carte au dernier emplacement
  map.setView([positionMemoryArray[1], positionMemoryArray[2]], positionMemoryArray[0]);


/****************************
 * COUCHES EN SURIMPRESSION *
 ****************************/
const argumentsApiWri = {
  serveurAPI: 'https://<?=$_SERVER["SERVER_NAME"]?>',
  version: '<?=$vue->version_features?>',
  etiquettes: true,
  clic: true,
};

// Cas de la carte d'une zone
if (polygoneAAfficher && polygoneAAfficher.id_polygone_type === 11) {
  new CouchePolygonesWri({ // On affiche les massifs
    ...argumentsApiWri,
    typeId: 1, // Les polygones de massifs
    intersection: polygoneAAfficher.id_polygone, // inclus dans la zone
    featureStyle: {
      fillOpacity: 0.5, // Un peu plus visibles que sur les autres cartes car il n'y a que ça
    },
  }).addTo(map);
}
// Carte normale ou page d'un massif
else {
  const overlays = {}; // Liste de toutes les couches du sélecteur d'overlays

  const ccc = new ClusterPointsWri({
    ...argumentsApiWri,
    couchesIcones: couchesIconesWRI,
    massif: polygoneAAfficher ? polygoneAAfficher.id_polygone : 0,
  });

  ccc.addTo(map);
  L.control.layers(null, overlays).addTo(map);

  // Récupération de la mémorisation des couches refuges.info du sélecteur de couches
  if (typeof sessionStorage.checkedLayers !== 'string')
    sessionStorage.checkedLayers = localStorage.checkedLayers || typesPointsParDefaut;
}

/////////////////////////////////////////////////DCMM TODO
// Externalise le sélecteur de points pour les grandes largeurs de fenêtre
const conteneurSelecteurExterneEl = document.getElementById('conteneur-selecteur-points'),
  conteneurDeuxiemeSelecteurEl = document.querySelector(':has(>.leaflet-control-layers)')
  .lastChild.lastChild, //TODO remove *ElementChild
  selecteursPointsEl = document.querySelector('.leaflet-control-layers-overlays:has(img)');

if (conteneurSelecteurExterneEl && selecteursPointsEl)
  ['load', 'resize'].forEach(evtName =>
    window.addEventListener(evtName, () => {
      if (window.innerWidth < 800)
        conteneurDeuxiemeSelecteurEl.appendChild(selecteursPointsEl);
      else
        conteneurSelecteurExterneEl.insertBefore(
          selecteursPointsEl,
          conteneurSelecteurExterneEl.firstElementChild //TODO remove *ElementChild
        );
    }));


/*****************
 * LIEN D'EXPORT *
 *****************/
const exportCarteEl = document.getElementById('export-carte');

// Réponse au bouton "exporter"
/* eslint-disable-next-line no-unused-vars */
function copyExportLink() {
  //TODO BUG affiche les ""
  if (exportCarteEl)
    navigator.clipboard.writeText(exportCarteEl.lastChild.href) //TODO remove *ElementChild
    .then(() => alert('<?=json_encode(_("Lien copié dans le presse-papier"))?> :\n\n' +
      exportCarteEl.lastChild.href)); //TODO BUG undefined / remove *ElementChild
}

function mapMoved(_map) {
  const bne = _map.getBounds()._northEast,
    bsw = _map.getBounds()._southWest,
    fc = (coord) => Math.floor(coord * 10000) / 10000,
    cc = (coord) => Math.ceil(coord * 10000) / 10000;

  if (exportCarteEl) {
    exportCarteEl.children[1].href = '/api/bbox' + //TODO remove *ElementChild
      '?type_points=' + checkedLayersTypes.join(',') +
      '&nb_points=all' +
      '&bbox=' + fc(bsw.lng) + ',' + fc(bsw.lat) + ',' + cc(bne.lng) + ',' + cc(bne.lat) +
      '&format=' + exportCarteEl.firstElementChild.value; //TODO remove *ElementChild

    // Affiche seulement quand il y a quelque chose à exporter
    exportCarteEl.style.display = checkedLayersTypes.length ? 'block' : 'none';
  }
}

map.on('overlayadd', () => mapMoved(map)); // For init
map.on('moveend', () => mapMoved(map)); // For zoom & shifts