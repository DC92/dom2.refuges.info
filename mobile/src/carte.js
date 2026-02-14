/* global L, appliqueDonnees, serveurAPI, defaultPermalink */

/*******************************
 * Gestion de la carte Leaflet *
 *******************************
  L'application étant constituée d'une page unique, chargée lors du lancement de l'applacation,
  la carte reste ouverte dans un élément <div id="map> pour toutes les varianted d'affichage de l'appli (carte, point, ...)
  seules sont modifiées la taille du DIV et la position de la vue de la carte
*/

/*******************
 * Couches tuilées *
 *******************/
const baseLayers = {
  OpenHikingMap: L.tileLayer('https://tile.openmaps.fr/openhikingmap/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: '<a href="https://wiki.openstreetmap.org/wiki/OpenHikingMap">© OpenHikingMap</a>|' +
      '<a href="https://openmaps.fr/donate">❤️ Donation</a>|' +
      '<a href="http://www.openstreetmap.org/copyright">© OpenStreetMap</a>|' +
      '<a target="_blank" href="https://wiki.openstreetmap.org/wiki/OpenHikingMap#Map_Legend">Légende</a>',
  }),
  OpenStreetMap: L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy;<a target="_blank" href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>|' +
      '<a target="_blank" href="https://www.openstreetmap.org/panes/legend">Légende</a>'
  }),

  // https://geoservices.ign.fr/documentation/services/utilisation-web/extension-pour-leaflet
  // https://ignf.github.io/geoportal-extensions/leaflet-latest/jsdoc/module-Layers.html#.WMTS
  /* eslint-disable-next-line new-cap */
  'Ign plan': L.geoportalLayer.WMTS({
    layer: 'GEOGRAPHICALGRIDSYSTEMS.PLANIGNV2',
    format: 'image/png', //TODO BUG format non pris en compte
    'attribution': 'Orthophotos - Carte © IGN/Geoportail',
    'maxNativeZoom': 19,
    'maxZoom': 22,
  }),

  /* eslint-disable-next-line new-cap */
  'Ign photo': L.geoportalLayer.WMTS({
    layer: 'ORTHOIMAGERY.ORTHOPHOTOS',
  }),

  //TODO https://github.com/plepe/overpass-frontend/blob/master/example-bbox.js
};

/************************
 * Couches vectorielles *
 ************************/
// Icônes
const pointsLayer = L.geoJson(null, {
  // Icônes
  pointToLayer: (feature, latlng) =>
    L.marker(latlng, {
      icon: L.icon({
        iconUrl: serveurAPI + '/images/icones/' + feature.properties.type.icone + '.svg',
        size: 24,
      }),
    }),

  onEachFeature: (feature, layer) => {
    // Etiquettes
    layer.bindTooltip(
      feature.properties.nom, {
        permanent: true,
        direction: 'center',
      }
    ).openTooltip();

    // Click
    layer.on({
      click: () => {
        //BEST Fonctions ctrl clic + Apple suivant demande faite à wri github
        // Affiche les donnés d'entête de la fiche qui sont disponibles dans l'API bbox
        //appliqueDonnees('point', feature.properties); //TODO REDO !!!
        console.log(feature.geometry.coordinates); //DCMM
        map.setView([feature.geometry.coordinates[1], feature.geometry.coordinates[0]], 15);
        //TODO BUG doit realculer la vue quand change les dimensions css

        // Affiche la page point
        window.location.hash = 'point=' + feature.id;
      },
    });
  },
});

// Affichage des clusters et des points
const clustersLayer = new L.MarkerClusterGroup();

function affichePoints(geoJson) {
  if (geoJson) {
    clustersLayer.removeLayer(pointsLayer);
    pointsLayer.clearLayers();
    pointsLayer.addData(JSON.parse(geoJson));
    clustersLayer.addLayer(pointsLayer);
  }
}

/******************************
 * Initialisation de la carte *
 ******************************/
const map = L.map('map');

// Permalink.
// Le permalink est un #hash ajouté à la page carte uniquement
const hash = location.hash.replace('#', '').split('/'), //TODO ??? .map((v)=>parseFloat (v)),
  permalink = hash.length === 3 ?
  hash :
  (localStorage.getItem('permalink') ||
    defaultPermalink).split('/');

// Ajout de controles et couches à la carte
[
  Object.values(baseLayers)[0], // Fond de carte par défaut
  clustersLayer, // Couche vectorielle
  L.control.layers(baseLayers), // Layer switcher

  L.control.scale({
    imperial: false,
  }),
  new L.Control.Gps({
    autoCenter: true,
  }),
  new L.Control.Geocoder({
    position: 'topleft',
  }),
].map(e => e.addTo(map));

// Affiche les icones
affichePoints(localStorage.getItem('points'));

// Charge (ou recharge) les points à afficher
setTimeout(() => // Attends que les icônes soient chargées
  //TODO demander ?depuis
  fetch(serveurAPI + '/api/points?detail=icones')
  .then((response) => response.text())
  .then((geoJson) => {
    //TODO précharger toutes les icones
    affichePoints(geoJson);
    localStorage.setItem('points', geoJson);
  }),
  100);

function setPermalink() {
  const pos = map.getCenter(),
    newPermalink = [pos.lng, pos.lat, map.getZoom()]
    .map(f => Math.round(f * 1000) / 1000)
    .join('/');

  // Actualise le permalink
  localStorage.setItem('permalink', newPermalink);
  if (document.body.id === 'carte')
    location.hash = newPermalink;
}

map.on('moveend', () => {
  // Memorisation dans IndexedDB des infos (nom, caractéristiques, commentaires) des fiches autour de la position
  // Les fiches sont chargés par tuiles une fois pour toute
  // Elles ne sont rechargées, unitairement, que s'elles sont signalées comme ayant changé
  setPermalink();
});

// Récupére la dernière position lors du lancement de l'application
map.setView([permalink[1], permalink[0]], permalink[2]);