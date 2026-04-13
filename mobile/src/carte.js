/* global L, mapKeys */

/*******************************
 * Gestion de la carte Leaflet *
 *******************************
  L'application est constituée d'une page unique, chargée lors du lancement.
  La carte reste ouverte dans un <div id="map> pour toutes les vues de l'appli (carte, fiche, ...)
  seules sont modifiées la taille du DIV et la position lon/lat
*/

const serveurAPI = 'https://dom2.refuges.info',
  apiDepuisUrl = serveurAPI + '/api/bbox?detail=fiche&depuis=' + Date.now();

console.log(apiDepuisUrl); //DCMM

localStorage.permalink ||= '7/45/7'; // zoom/latitude/longitude Défaut : Alpes de l'Ouest

/*******************
 * Couches tuilées *
 *******************/
const baseLayers = {
  // Cartes lbres
  OpenStreetMap: L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxNativeZoom: 19,
    attribution: '&copy;<a target="_blank" href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>|' +
      '<a target="_blank" href="https://www.openstreetmap.org/panes/legend">Légende</a>'
  }),
  OpenHikingMap: L.tileLayer('https://tile.openmaps.fr/openhikingmap/{z}/{x}/{y}.png', {
    maxNativeZoom: 18,
    edgeBufferTiles: 3,
    attribution: '<a href="https://wiki.openstreetmap.org/wiki/OpenHikingMap">© OpenHikingMap</a>|' +
      '<a href="https://openmaps.fr/donate">❤️ Donation</a>|' +
      '<a href="http://www.openstreetmap.org/copyright">© OpenStreetMap</a>|' +
      '<a target="_blank" href="https://wiki.openstreetmap.org/wiki/OpenHikingMap#Map_Legend">Légende</a>',
  }),
  OpenTopoMap: L.tileLayer('https://tile.openmaps.fr/opentopomap/{z}/{x}/{y}.png', {
    maxNativeZoom: 19,
    attribution: '<a href="https://github.com/sletuffe/OpenTopoMap">&copy; OTM-R</a> ' +
      '<a href="https://openmaps.fr/donate">❤️ Donation</a> ' +
      '<a href="http://www.openstreetmap.org/copyright">&copy; OpenStreetMap</a> ' +
      '<a target="_blank" href="https://openmaps.fr/map-legend/opentopomap-legend.html">Légende</a>',
  }),

  // Thunderforest
  // https://leaflet-extras.github.io/leaflet-providers/preview/
  Outdoors: L.tileLayer('https://api.thunderforest.com/outdoors/{z}/{x}/{y}{r}.png?apikey={apikey}', {
    apikey: mapKeys.thunderforest,
    attribution: '&copy; <a href="http://www.thunderforest.com/">Thunderforest</a>, ' +
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxNativeZoom: 22,
  }),
  //ISO-Maps Topo
  OpenCycleMap: L.tileLayer('https://api.thunderforest.com/cycle/{z}/{x}/{y}{r}.png?apikey={apikey}', {
    apikey: mapKeys.thunderforest,
    maxNativeZoom: 22,
    attribution: '&copy; <a href="http://www.thunderforest.com/">Thunderforest</a>, ' +
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }),

  // IGN
  // https://geoservices.ign.fr/documentation/services/utilisation-web/extension-pour-leaflet
  // https://ignf.github.io/geoportal-extensions/leaflet-latest/jsdoc/module-Layers.html#.WMTS
  /* eslint-disable-next-line new-cap */
  TOP25: L.geoportalLayer.WMTS({
    layer: 'GEOGRAPHICALGRIDSYSTEMS.MAPS',
    apiKey: 'ign_scan_ws',
  }, {
    //TODO légendes
    attribution: '© IGN/Geoportail',
    maxNativeZoom: 18,
  }),
  /* eslint-disable-next-line new-cap */
  'IGN plan': L.geoportalLayer.WMTS({
    layer: 'GEOGRAPHICALGRIDSYSTEMS.PLANIGNV2',
  }, {
    format: 'image/png',
    attribution: '© IGN/Geoportail',
    //TODO revoir zooms & légendes //TODO BUG la légende se retrouve dans l'url !
    maxNativeZoom: 19,
  }),
  /* eslint-disable-next-line new-cap */
  'IGN photo': L.geoportalLayer.WMTS({
    layer: 'ORTHOIMAGERY.ORTHOPHOTOS',
  }, {
    attribution: '© IGN/Geoportail',
    maxNativeZoom: 19,
  }),
  /* eslint-disable-next-line new-cap */
  Cadastre: L.geoportalLayer.WMTS({
    layer: 'CADASTRALPARCELS.PARCELLAIRE_EXPRESS',
  }, {
    format: 'image/png',
    attribution: '© IGN/Geoportail',
    maxNativeZoom: 19,
    maxZoom: 21,
  }),

  SwissTopo: L.tileLayer.wms('http://wms.geo.admin.ch/?', {
    layers: 'ch.swisstopo.pixelkarte-farbe',
    //layers: 'ch.swisstopo.swissimage',
    format: 'image/jpeg',
    detectRetina: true,
  }),
  //TODO Autriche
  //TODO Espagne
  'Photo Maxar': L.tileLayer.wms(
    'https://api.mapbox.com/v4/mapbox.satellite/{z}/{x}/{y}@2x.webp?access_token=' + mapKeys.mapbox, {
      maxZoom: 20,
      attribution: '<a href="https://www.mapbox.com/">&copy; Mapbox</a>',
    }),
  //TODO Photo ArcGis, Google ?

  //TODO Couches vectorielles
  //TODO https://github.com/plepe/overpass-frontend/blob/master/example-bbox.js
};

/************************
 * Couches vectorielles *
 ************************
  Une icône est une image .png représentant un type de point
  Un point est défini par un position, un nom et une icône destinée à être affiché sur une carte
  Une fiche contient toutes les informations concernant un point, y compris les commentaires
*/

// json est une structure contenant des définitions de points
// geoJson sa représentation en string

//BEST générer le html des sélecteurs à partir d'une liste de type => nom_icone
//BEST séparer plusieurs layers par type de point avec un cluster global
// Couche affichant tous les points
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
    //BEST Fonctions ctrl clic + Apple suivant demande faite à wri github
    layer.on({
      click: () => {

        // Affiche la vue fiche
        location.hash = feature.id;
      },
    });
  },
});

// Couche gérant les clusters
const clustersLayer = new L.MarkerClusterGroup();

function affichePoints(geoJson) {
  const json = JSON.parse(geoJson || '{"type":"FeatureCollection","features":[]}');

  if (json.features.length) {
    // Filtre les types de points suivant le sélecteur de la carte
    const typesPointsVisibles = Array.from(
        document.querySelectorAll('#selecteur a')
      ).filter((el) =>
        el.classList.contains('selected')
      ).map((el) => parseInt(el.id, 10)),

      filteredPoints = json.features
      .filter((features) =>
        typesPointsVisibles.includes(features.properties.type.id)
      );

    // Vide la couche contenant les points, la détache et rattache à la couche gérant les clusters
    clustersLayer.removeLayer(pointsLayer);
    pointsLayer.clearLayers();
    pointsLayer.addData(filteredPoints);
    clustersLayer.addLayer(pointsLayer);
  }
}

/******************************
 * Initialisation de la carte *
 ******************************/
const map = L.map('map');

console.info('MAP init');

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

// Initialise les points s'il y en a de mémorisés
affichePoints(localStorage.pointsGeoJson);

// Mémorise la position de la carte
map.on('moveend', () => {
  const pos = map.getCenter();

  console.info('MAP moveend');

  // Le permalink est mémorisé dans la mémoire permanente de l'explorateur localStorage
  localStorage.permalink = [map.getZoom(), pos.lat, pos.lng].map(f => Math.round(f * 1000) / 1000).join('/');

  // Le permalink est un #hash ajouté à la page carte uniquement
  //BEST permalink baseLayer
  if (document.body.className === 'carte')
    location.hash = localStorage.permalink;
});