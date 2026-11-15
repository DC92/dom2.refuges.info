/* global ClusterPointsWri, CouchePolygonesWri, couchesDeFond, couchesOverpass, coucheItineraires, controlesComuns */

/**********************
 * CARTE ET CONTROLES *
 **********************/
const map = L.map('carte-accueil');

controlesComuns(map).forEach((control) => control.addTo(map)); // Autres controles

/******************
 * COUCHE DE FOND *
 ******************/
const tileLayers = couchesDeFond(<?=json_encode($config_wri['mapKeys'])?>),
  fondDecarteActif = tileLayers[decodeURI(positionMemoryArray[3])] || // Dernière couche affichée
  Object.values(tileLayers)[0]; // Par défaut, première couche déclarée

fondDecarteActif.addTo(map);
L.control.layers(tileLayers).addTo(map); // Sélecteur de couche de base
positionMemoryControl(map); // Enregistre la position et la couche de base courantes

/********************************************
 * POSITION DE LA CARTE ET POLYGONE AFFICHÉ *
 ********************************************/
const polygoneAAfficher = <?=json_encode($vue->polygone ?? null)?>;

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

/************************
 * COUCHES SUPERPOSÉES  *
 ************************/
const argumentsApiWri = {
  serveurAPI: 'https://<?=$_SERVER["SERVER_NAME"]?>',
  version: <?=$vue->version_features?>,
  etiquettes: true,
  clic: true,
};

// CAS DE LA CARTE D'UNE ZONE
if (polygoneAAfficher && polygoneAAfficher.id_polygone_type === 11) {
  new CouchePolygonesWri({ // On affiche les massifs
    ...argumentsApiWri,
    typeId: 1, // Les polygones de massifs
    intersection: polygoneAAfficher.id_polygone, // Les massifs concernés et c'est tout
    featureStyle: {
      fillOpacity: 0.5, // Un peu plus visibles que sur les autres cartes car il n'y a que ça
    },
  }).addTo(map);
  //TODO recadrer le <div> carte toujours sur la largeur de la page ou mettre quelque chose à gauche
}

// CARTE NORMALE OU PAGE D'UN MASSIF
else {
  // Restaure l'affichage minimum des points du massif
  sessionStorage.checkedPoints = typesPointsParDefaut;

// Définition des entrées du sélecteur
const     categoriesCouches=  {
    points:<?=json_encode($types_points)?>,
    polygones:<?=json_encode($types_polygones)?>,
  };

// Couches de points initialisées par ControlOverlaysLayers

  // Cluster des points de tous les types
  /*const pointsWri = new ClusterPointsWri({
    ...argumentsApiWri,
    massif: polygoneAAfficher ? polygoneAAfficher.id_polygone : 0,
    optionalParameter: '&type_points=' + sessionStorage.checkedPoints,
  }).addTo(map);*/
  
  // Couches de polygones
  if(0)//DCMM
  for (const [i, type] of Object.entries( categoriesCouches.    polygones)) {
    const layer=new CouchePolygonesWri({
      ...argumentsApiWri,
      typeId: type.id,
    });
    
    categoriesCouches.    polygones[i].layer = layer;
  if(sessionStorage.polygones.split(',').includes(type.id.toString()))
    layer.addTo(map);
  }
 /*
 for (const [i, cat] of Object.entries(overlaysCategories.polygones)){
console.log(cat.id);//DCMM
console.log(typeof cat.id);//DCMM
  if(sessionStorage.polygones.split(',').includes(cat.id.toString()))
    cat.layer.addTo(map);
*/
 
    // Sélecteur de couches overlays
addControlOverlays(
map,
 argumentsApiWri,
 categoriesCouches,
  polygoneAAfficher ? polygoneAAfficher.id_polygone : 0,
  ) ;
   
/*  const typesPoints = <?=json_encode($types_points)?>,
    typesPolygones = <?=json_encode($types_polygones)?>;*/
  
/*new  ControlOverlaysLayers(  {
    points:ppppppp(typesPoints, sessionStorage.checkedPoints, map),
    polygones:ppppppp(typesPolygones, sessionStorage.checkedPolygons, map),
  }).addTo(map);

  function ppppppp(typeGeometrie, checkedGeometries, map) {
    const overlaysTypes = {};

    for (const [i, type] of Object.entries(typeGeometrie)) {//TODO simplifier
      const titre = (type.icone ? '<img src="/images/icones/' + type.icone + '.svg"> ' : '') +
        type.nom_traduit,
        layer = type.layer ||
        // Couche invisible sélectionnée pour récupérer l'état de a coche
        L.circle([0, 0], {
          stroke: false, 
        });

      overlaysTypes[titre] = layer;
      if (checkedGeometries.split(',').includes(type.id.toString()))
        layer.addTo(map); // Affiche la couche et sélectionne l'entrée
      else
        layer.remove(); // Efface la couche et désélectionne l'entrée
    }

    return overlaysTypes;
  }*/

  // Actions du sélecteur (doit être exécuté après la déclaration de control.layers)
/*  checklayerSelector(
    typesPoints,
    (checkedPoints) => {
      sessionStorage.checkedPoints = checkedPoints;
      localStorage.checkedPoints = checkedPoints;

      // Recharger les points qui correspondent
      pointsWri.fetchData({
        optionalParameter: '&type_points=' + sessionStorage.checkedPoints,
        hide: !sessionStorage.checkedPoints,
      });
    });*/

  // Couches OSM Overpass
  //DCMM TODO BUG overpass ne fonctionne plus sur WRI
}

/****************************************
 * EXTERNALISE LE SÉLECTEUR DE POINTS   *
 * pour les grandes largeurs de fenêtre *
 ****************************************/
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

// Mise à jour du bouton "exporter" quand la sélection change
map.on('layeradd moveend', (evt) => {
  const map = evt.target,
    bne = map.getBounds()._northEast,
    bsw = map.getBounds()._southWest,
    fc = (coord) => Math.floor(coord * 10000) / 10000,
    cc = (coord) => Math.ceil(coord * 10000) / 10000;

  if (exportCarteEl) {
    exportCarteEl.children[1].href = '/api/bbox' + //TODO remove *ElementChild
      '?type_points=' + sessionStorage.checkedPoints +
      '&nb_points=all' +
      (polygoneAAfficher ? '&massif=' + polygoneAAfficher.id_polygone : '') +
      '&bbox=' + fc(bsw.lng) + ',' + fc(bsw.lat) + ',' + cc(bne.lng) + ',' + cc(bne.lat) +
      '&format=' + exportCarteEl.firstElementChild.value; //TODO remove *ElementChild

    // Affiche seulement quand il y a quelque chose à exporter
    exportCarteEl.style.display = sessionStorage.checkedPoints ? 'block' : 'none';
  }
});

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