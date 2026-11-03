/* global couchesIconesWRI, CouchePointsWri, CouchePolygonesWri, couchesDeFond, couchesOverpass, coucheItineraires, controlesComuns */

// Libellés affichés des couches (traduits par le serveur). L'identité d'une couche reste son nom français :
// c'est lui qui est mémorisé dans sessionStorage et cherché dans couchesIconesWRI ;
// on repasse donc du libellé affiché à ce nom (identite).
const libelles = <?=json_encode($vue->libelles_couches)?>,
  identite = Object.fromEntries(Object.entries(libelles).map(([fr, traduit]) => [traduit, fr])),
  libelle = (nom) => libelles[nom] || nom;
 //DCMM TODO mémoriser le n° de type de point

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

// Récupération de la mémorisation du sélecteur de couches
if (typeof sessionStorage.checkedLayers !== 'string')
  sessionStorage.checkedLayers = localStorage.checkedLayers || typesPointsParDefaut;

// Cas de la carte d'une zone
if (polygoneAAfficher && polygoneAAfficher.id_polygone_type === 11) {
  new CouchePolygonesWri({ // On affiche les massifs
    ...argumentsApiWri,
    typeId: 1, // Les polygones de massifs
    intersection: polygoneAAfficher.id_polygone, // Les massifs concernés et c'est tout
    featureStyle: {
      fillOpacity: 0.5, // Un peu plus visibles que sur les autres cartes car il n'y a que ça
    },
  }).addTo(map);
}

// Carte normale ou page d'un massif
else {
  // Couches points refuges.info (clustérisées ensembles)
  const clusterPoints = new ClusterPointsWri({
      ...argumentsApiWri,
      couchesIcones: couchesIconesWRI,
      massif: polygoneAAfficher ? polygoneAAfficher.id_polygone : 0,
    }).addTo(map),
    // Liste de toutes les couches du sélecteur d'overlays
    overlays = clusterPoints.overlays;

  // Polygones (seulement pour la page d'accueil)
  if (!polygoneAAfficher) {
    overlays[libelle('Régions')] = new CouchePolygonesWri({
      ...argumentsApiWri,
      typeId: 11,
    });

    overlays[libelle('Massifs')] = new CouchePolygonesWri({
      ...argumentsApiWri,
      typeId: 1,
    });
  }

  //DCMM TODO BUG overpass ne fonctionne plus sur WRI

  // Sélecteur de couches en surimpression
  L.control.layers(null, overlays).addTo(map);
}

/////////////////////////////////////////////////DCMM TODO
/*
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
*/

/*****************
 * LIEN D'EXPORT *
 *****************/
const exportCarteEl = document.getElementById('export-carte');

// Réponse au bouton "exporter"
/* eslint-disable-next-line no-unused-vars */
function copyExportLink() {
  //TODO BUG affiche les ""
  //TODO traiter les pages /nav massifs
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
/*
map.on('overlayadd', () => mapMoved(map)); // For init
map.on('moveend', () => mapMoved(map)); // For zoom & shifts
*/