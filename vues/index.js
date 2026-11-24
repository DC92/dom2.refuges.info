/* global ClusterPointsWri, CouchePolygonesWri, couchesDeFond, couchesOverpass, coucheItineraires, controlesComuns */

/**********************
 * CARTE ET CONTROLES *
 **********************/
const serveurAPI = 'https://<?=$_SERVER["SERVER_NAME"]?>',
  polygoneAAfficher = <?=json_encode($vue->polygone ?? null)?>,
  versionAPI = <?=$vue->version_features?>,
  map = L.map('carte-accueil');

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
// CAS DE LA CARTE D'UNE ZONE (/nav/id_de_zone)
if (polygoneAAfficher && polygoneAAfficher.id_polygone_type === 11) {
  new CouchePolygonesWri(serveurAPI, {
    'type_polygon': 1, // Les polygones de massifs
    intersection: polygoneAAfficher.id_polygone, // Les massifs concernés et c'est tout
    version: versionAPI,
  }, { // On affiche les massifs
    etiquettes: true,
    clic: true,
    featureStyle: {
      fillOpacity: 0.5, // Un peu plus visibles que sur les autres cartes car il n'y a que ça
    },
  }).addTo(map);
  //TODO recadrer le <div> carte toujours sur la largeur de la page ou mettre quelque chose à gauche
}

// CARTE NORMALE (/) OU PAGE D'UN MASSIF (/nav/id_de_massif)
else {
  // Restaure l'affichage minimum des points du massif
  if (polygoneAAfficher && polygoneAAfficher.id_polygone_type === 1)
    sessionStorage.points = typesPointsParDefaut;

  const entreeCoucheItineraires = { //TODO mettre dans _cartes_leaflet
    //TODO BUG ne se superpose pas à certaines couches
    id: 1, // Indice dans la catégorie tilesOverlays, juste pour l'identifier
    nom_traduit: 'itinéraires',
    layer: coucheItineraires,
  };

  const entreeCouchesOverpass = [];

  // Couches OSM OverPass
  for (const [nom, query] of Object.entries(couchesOverpass)) {
    entreeCouchesOverpass.push({
      id: nom, // Juste pour l'identifier
      nom_traduit: nom,
      layer: new L.OverPassLayer({
        query: '(nwr' + query + '({{bbox}}););out center;',
        markerIcon: L.icon({
          iconUrl: 'https://<?=$_SERVER["SERVER_NAME"]?>/images/icones/' + nom.replaceAll('ô', 'o').replaceAll(/[^a-z]/gu, '') + '.svg',
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        }),
        minZoom: 12,
        minZoomIndicatorEnabled: false,
      }),
    });
  }

  // Sélecteur de couches overlays
  addControlOverlays(
    map, {
      serveurAPI: serveurAPI,
      version: versionAPI,
      etiquettes: true,
      clic: true,
    }, {
      // Liste des couches
      points: <?=json_encode($types_points)?>,
      polygones: <?=json_encode($types_polygones)?>, //DCMM TODO ne s'affiche pas
      tilesOverlays: [entreeCoucheItineraires],
      couchesOverpass: entreeCouchesOverpass,
    },
    polygoneAAfficher ? polygoneAAfficher.id_polygone : 0,
  );
}

/****************************************
 * EXTERNALISE LE SÉLECTEUR DE POINTS   *
 * pour les grandes largeurs de fenêtre *
 ****************************************/
const conteneurSelecteurExterneEl = document.getElementById('conteneur-selecteur-points'),
  conteneurDeuxiemeSelecteurEl = document.querySelector(':has(>.leaflet-control-layers)')
  .lastChild.lastChild, //BEST remove *ElementChild
  selecteursPointsEl = document.querySelector('.leaflet-control-layers-overlays:has(img)');

if (conteneurSelecteurExterneEl && selecteursPointsEl)
  ['load', 'resize'].forEach(evtName =>
    window.addEventListener(evtName, () => {
      if (window.innerWidth < 800)
        conteneurDeuxiemeSelecteurEl.appendChild(selecteursPointsEl);
      else
        conteneurSelecteurExterneEl.insertBefore(
          selecteursPointsEl,
          conteneurSelecteurExterneEl.firstElementChild //BEST remove *ElementChild
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
    exportCarteEl.children[1].href = '/api/bbox' + //BEST remove *ElementChild
      '?type_points=' + sessionStorage.points +
      '&nb_points=all' +
      (polygoneAAfficher ? '&massif=' + polygoneAAfficher.id_polygone : '') +
      '&bbox=' + fc(bsw.lng) + ',' + fc(bsw.lat) + ',' + cc(bne.lng) + ',' + cc(bne.lat) +
      '&format=' + exportCarteEl.firstElementChild.value; //BEST remove *ElementChild

    // Affiche seulement quand il y a quelque chose à exporter
    exportCarteEl.style.display = sessionStorage.points ? 'block' : 'none';
  }
});

// Réponse au bouton "exporter"
/* eslint-disable-next-line no-unused-vars */
function copyExportLink() {
  //TODO BUG affiche les ""
  //TODO traiter les pages /nav massifs dans le lien export (critère polygone intersect)
  if (exportCarteEl)
    navigator.clipboard.writeText(exportCarteEl.lastChild.href) //BEST remove *ElementChild
    .then(() => alert('<?=json_encode(_("Lien copié dans le presse-papier"))?> :\n\n' +
      exportCarteEl.lastChild.href)); //TODO BUG undefined
  //BEST remove *ElementChild
}