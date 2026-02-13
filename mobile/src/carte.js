/* global L, appliqueDonnees, preLoadTiles, serveurAPI, defaultPermalink */

/*******************************
 * Gestion de la carte Leaflet *
 *******************************/

/***************************
 * Déclaration des couches *
 ***************************/
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
const clustersLayer = new L.MarkerClusterGroup(),
  pointsLayer = L.geoJson(null, {
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
          appliqueDonnees('point', feature.properties);

          // Affiche la page point
          window.location.hash = 'point=' + feature.properties.id;
        },
      });
    },
  });

// Affichage d'un texte geoJson
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
/* eslint-disable-next-line no-unused-vars */
const map = L.map('map'),
  hash = location.hash.replace('#', '').split(','),
  permalink = hash.length === 3 ? hash :
  (localStorage.getItem('permalink') || defaultPermalink).split(',');

// Récupére la dernière position
map.setView(permalink, permalink[2]);

// Layer switcher
Object.values(baseLayers)[0].addTo(map); // Default layer
L.control.layers(baseLayers).addTo(map);

L.control.scale({
  imperial: false
}).addTo(map);

new L.Control.Gps({
  autoCenter: true,
}).addTo(map);

new L.Control.Geocoder({
  position: 'topleft',
}).addTo(map);

// Couches vectorielles
clustersLayer.addTo(map);
affichePoints(localStorage.getItem('points'));

// Charge (ou recharge) les points à afficher
setTimeout(() => // Attends que les icônes soient chargées
  fetch(serveurAPI + '/api/points?detail=icones')
  .then((response) => response.text())
  .then((geoJson) => {
    affichePoints(geoJson);
    localStorage.setItem('points', geoJson);
  }),
  100);

map.on('moveend', () => {
  const pos = map.getCenter(),
    newPermalink = [pos.lat, pos.lng, map.getZoom()]
    .map(f => Math.round(f * 1000) / 1000)
    .join(',');

  // Actualise le permalink
  localStorage.setItem('permalink', newPermalink);
  if (hash.length !== 1) //TODO BUG
    location.hash = newPermalink;

  // Prè-charge les dalles OpenHikingMap, points et commentaires autour de la zone visitée
  preLoadTiles(map, pos);
});