/* global L, serveurAPI, globalCurrentPermalink:writable, idbKeyval */

/*******************************
 * Gestion de la carte Leaflet *
 *******************************
  L'application étant constituée d'une page unique, chargée lors du lancement de l'application,
  la carte reste ouverte dans un élément <div id="map> pour toutes les variantes d'affichage de l'appli (carte, fiche, ...)
  seules sont modifiées la visibilité et la taille du DIV et la position de la vue de la carte
*/

/*******************
 * Couches tuilées *
 *******************/
//TODO permalink baseLayer
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
    //BEST Fonctions ctrl clic + Apple suivant demande faite à wri github
    layer.on({
      click: () => {
        // Affiche la vue fiche
        location.hash = feature.id;
      },
    });
  },
});

/* eslint-disable-next-line no-unused-vars */
function selectionTypesPoints(el) {
  console.log(1234); //DCMM //TODO
}

// Affichage des clusters et des points
const clustersLayer = new L.MarkerClusterGroup();

/* eslint-disable-next-line no-unused-vars */
function affichePoints(geoJson) {
  if (geoJson) {
    const json = JSON.parse(geoJson),
      typesPointsVisibles = [];
    //TODO réafficher les points geoJson (les garder en mémoire !!

    for (const e of document.querySelectorAll('#selecteur a')) {
      console.log(e); //DCMM
      console.log(e.id); //DCMM
    }

    json.features = json.features.filter((point) => {
      console.log(point.properties.type.id); //DCMM
      return point.properties.type.id === 7;
    });
    //console.log(json);//DCMM

    clustersLayer.removeLayer(pointsLayer);
    pointsLayer.clearLayers();
    pointsLayer.addData(json);
    clustersLayer.addLayer(pointsLayer);
  }
}

/******************************
 * Initialisation de la carte *
 ******************************/
const // hash = location.hash.replace('#', ''),
  //hashs =  hash.split('/').map((v)=>parseFloat (v)),
  map = L.map('map');

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

// Mémorise la position de la carte
map.on('moveend', () => {
  const pos = map.getCenter();

  console.info('MAP moveend');

  // Mémorisation de la position
  globalCurrentPermalink = [map.getZoom(), pos.lat, pos.lng].map(f => Math.round(f * 1000) / 1000);
  console.info('idbKeyval.set dbCurrentPermalink'); //DCMM
  idbKeyval.set('dbCurrentPermalink', globalCurrentPermalink)
    .catch(error => console.error(error + ' idbKeyval.get dbCurrentPermalink'))
    .finally(() => console.info('END idbKeyval.set dbCurrentPermalink')); //DCMM

  // Le permalink est un #hash ajouté à la page carte uniquement et mémorisé dans indexedDB
  if (document.body.className === 'carte')
    location.hash = globalCurrentPermalink.join('/');
});