/* global couchesIconesWRI, CouchePointsWri, CouchePolygonesWri, couchesDeFond, couchesOverpass, coucheItineraires, controlesComuns */

const map = L.map('carte-accueil'),
  tileLayers = couchesDeFond(<?=json_encode($config_wri["mapKeys"])?>),
  overlays = {},
  vectorCluster = L.markerClusterGroup({
    spiderfyOnMaxZoom: true, // Overlapping markers will spiderfy when clicked
    showCoverageOnHover: false, // Hides the cluster bounds polygon
    maxClusterRadius: 30, // Less clusters
  }),
  argsApiLayersWri = { // Polygones WRI
    serveurAPI: 'https://<?=$_SERVER["SERVER_NAME"]?>',
    version: <?=$vue->version_features?>,
    etiquettes: true,
    clic: true,
  };

// Libellés affichés des couches (traduits par le serveur). L'identité d'une couche reste son nom français :
// c'est lui qui est mémorisé dans sessionStorage et cherché dans couchesIconesWRI ;
// on repasse donc du libellé affiché à ce nom (identite).
const libelles = <?=json_encode($vue->libelles_couches)?>,
  identite = Object.fromEntries(Object.entries(libelles).map(([fr, traduit]) => [traduit, fr])),
  libelle = (nom) => libelles[nom] || nom;

// Récupération de la mémorisation des couches refuges.info du sélecteur de couches
if (typeof sessionStorage.checkedLayers !== 'string')
  sessionStorage.checkedLayers =
  localStorage.checkedLayers ||
  'Cabane non gardée,Refuge gardé,Gîte d\'étape';

/****************************************
 * CONSTRUCTION DU SÉLECTEUR DE COUCHES *
 ****************************************/
/* Couches vectorielles de points WRI :
 On appelle l'API avec bbox monde pour chaque type de point
 avec le numéro de version chargé avec la page et correspondant à la dernière modification de point.
 Elle seront mémorisées par le cache jusqu'à la prochaine évolution de la base.
*/
//TODO fusionner avec ClusterPointsWri
for (const [nom, args] of Object.entries(couchesIconesWRI)) {
  const icone = '<img src="/images/icones/' + args[1] + '.svg"/> ' + libelle(nom), // Libellé de la ligne sélecteur
    layer = new CouchePointsWri({ // Couche affichable
      ...argsApiLayersWri,
      typePoints: args[0],
      <?php if (!empty($vue->polygone)) { ?>
        massif: <?=$vue->polygone->id_polygone?>,
      <?php } ?>
    });

  // Il est nécéssaire de grouper les points de chaque couche pour pouvoir les sélectionner indépendament
  overlays[icone] = L.featureGroup.subGroup(vectorCluster).addLayer(layer);

  // Affiche la couche au lancement de la page au cas où sa sélection serait mémorisée
  if (sessionStorage.checkedLayers.search(nom) !== -1) {
    // On affiche la couche sur la carte pour que le L.control.layers la considère comme cochée
    overlays[icone].addTo(map);

    // Quand les données sont chargées, on rafraîchit l'affichage du cluster
    layer.on('load', (evt) => {
      vectorCluster.removeLayer(evt.target);
      vectorCluster.addLayer(evt.target);
      addRemoveOverlay(); // Mémorise les couches et recalcule le lien export
    });
  }
}

// Autres overlays :
<?php if (empty($vue->polygone)) { ?>
  overlays[libelle('Régions')] = new CouchePolygonesWri({
    ...argsApiLayersWri,
    typeId: 11,
  });

  overlays[libelle('Massifs')] = new CouchePolygonesWri({
    ...argsApiLayersWri,
    typeId: 1,
  });
<?php } ?>

<?php if (!empty($vue->polygone) && $vue->polygone->id_polygone_type == 11) { ?>
  overlays[libelle('Massifs')] = new CouchePolygonesWri({
    ...argsApiLayersWri,
    typeId: 1,
    intersection: <?=$vue->polygone->id_polygone?>,
  }).addTo(map);
<?php } ?>

// Couche externe d'itinéraires
overlays[libelle('Itinéraires')] = coucheItineraires;

// Restitution de ces 3 couches si elles sont mémorisése
for (const [affiche, layer] of Object.entries(overlays))
  if (sessionStorage.checkedLayers.search(identite[affiche] || affiche) !== -1)
    layer.addTo(map);

// Couches OSM OverPass
for (const [nom, query] of Object.entries(couchesOverpass))
  overlays['OSM ' + nom] = new L.OverPassLayer({
    query: '(nwr' + query + '({{bbox}}););out center;',
    markerIcon: L.icon({
      iconUrl: 'https://<?=$_SERVER["SERVER_NAME"]?>/images/icones/' +
        nom.replaceAll('ô', 'o').replaceAll(/[^a-z]/gu, '') +
        '.svg',
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    }),
    minZoom: 12,
    minZoomIndicatorEnabled: false,
  });

vectorCluster.addTo(map);


/*************
 * CONTROLES *
 *************/
controlesComuns(map).forEach((control) => control.addTo(map));
positionMemoryControl(map);
L.control.layers(tileLayers).addTo(map);
<?php if (empty($vue->polygone) || $vue->polygone->id_polygone_type == 1) { ?>
  L.control.layers(null, overlays).addTo(map);
<?php } ?>

// Chargement du fond de carte actif
(tileLayers[decodeURI(positionMemoryArray[3])] || Object.values(tileLayers)[0]).addTo(map);

/*//DCMM
<?php if (empty($vue->polygone) || $vue->polygone->id_polygone_type == 1) { ?>
  conteneurDeuxiemeSelecteurEl.style.display = 'none';
  // Cannot access 'conteneurDeuxiemeSelecteurEl' before initialization
<?php } ?>
*/

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

<?php if (!empty($vue->polygone)) { ?>
  // Surimposition du polygone
  const polygonLayer = JSON.parse('<?=$vue->polygone->geometrie_geojson??"{}"?>'),
    massifLayer = L.polygon(
      flipLonLatRecursive(polygonLayer.coordinates), {
        fill: false,
      });

  massifLayer.addTo(map);
  map.fitBounds(massifLayer.getBounds());
<?php } else { ?>
  // Place la carte au dernier emplacement
  map.setView([positionMemoryArray[1], positionMemoryArray[2]], positionMemoryArray[0]);
<?php } ?>


/***************************
 * CALCUL DU LIEN D'EXPORT *
 ***************************/
const overlaySelectors = document.querySelectorAll('.leaflet-control-layers-overlays input'), // Lien d'export de la carte
  exportCarteEl = document.getElementById('export-carte');

/* eslint-disable-next-line no-unused-vars */
function copyExportLink() {
  //TODO BUG affiche les ""
  if (exportCarteEl)
    navigator.clipboard.writeText(exportCarteEl.lastChild.href) //TODO remove *ElementChild
    .then(() => alert('<?=json_encode(_("Lien copié dans le presse-papier"))?> :\n\n' +
      exportCarteEl.lastChild.href)); //TODO BUG undefined / remove *ElementChild
}


/**************************************************
 * MÉMORISATION DES COUCHES DE POINTS ET L'EXPORT *
 **************************************************/
//DCMM TODO BUG efface la mémorisation des massifs et regions en mode /nav/massif
//TODO remonter dans myLeaflet.js
function addRemoveOverlay() {
  const bne = map.getBounds()._northEast,
    bsw = map.getBounds()._southWest,
    fc = (coord) => Math.floor(coord * 10000) / 10000,
    cc = (coord) => Math.ceil(coord * 10000) / 10000,
    checkedLayersNames = [],
    checkedLayersTypes = [];

  // Calcul des couches sélectionnées
  for (const lsInputEl of overlaySelectors) {
    const affiche = lsInputEl.parentElement.lastChild.innerText.trim(), //TODO remove *ElementChild
      nom = identite[affiche] || affiche; // identité (nom français) du libellé affiché

    if (lsInputEl.checked) {
      checkedLayersNames.push(nom);

      if (typeof couchesIconesWRI[nom] === 'object')
        checkedLayersTypes.push(couchesIconesWRI[nom][0]);
    }
  }

  // Mémorise dans la mémoire de l'explorateur
  localStorage.checkedLayers =
    sessionStorage.checkedLayers = checkedLayersNames.join(',');

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

<?php if (empty($vue->polygone) || $vue->polygone->id_polygone_type == 1) { ?>
  map.on('overlayadd', () => addRemoveOverlay()); // Also for init
  map.on('overlayremove', () => addRemoveOverlay());
  map.on('moveend', () => addRemoveOverlay()); // For zoom & shifts
<?php } ?>
