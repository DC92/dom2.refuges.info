/* global L, serveurAPI, defaultPermalink, idbKeyval */

/*******************************
 * Gestion de la carte Leaflet *
 *******************************
  L'application étant constituée d'une page unique, chargée lors du lancement de l'applacation,
  la carte reste ouverte dans un élément <div id="map> pour toutes les varianted d'affichage de l'appli (carte, fiche, ...)
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
const iconesLayer = L.geoJson(null, {
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
        //appliqueDonnees('fiche', feature.properties); //TODO REDO !!!
        console.log(feature.geometry.coordinates); //DCMM
        map.setView([feature.geometry.coordinates[1], feature.geometry.coordinates[0]], 15);
        //TODO BUG doit realculer la vue quand change les dimensions css

        // Affiche la page fiche
        window.location.hash = feature.id;
      },
    });
  },
});

// Affichage des clusters et des icones
const clustersLayer = new L.MarkerClusterGroup();

function afficheIcones(geoJson) {
  if (geoJson) {
    clustersLayer.removeLayer(iconesLayer);
    iconesLayer.clearLayers();
    iconesLayer.addData(JSON.parse(geoJson));
    clustersLayer.addLayer(iconesLayer);
  }
}

/******************************
 * Initialisation de la carte *
 ******************************/
const // hash = location.hash.replace('#', ''),
  //hashs =  hash.split('/').map((v)=>parseFloat (v)),
  map = L.map('map');

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

// Charge (ou recharge) les fiches à afficher
setTimeout(() => // Attends que les icônes soient chargées
  //TODO demander ?depuis
  fetch(serveurAPI + '/api/points?detail=icones')
  .then((response) => response.text())
  .then((geoJson) => {
    //TODO précharger toutes les icones
    afficheIcones(geoJson);
    //localStorage.setItem('iconesJson', geoJson);//TODO
    idbKeyval.set('iconesJson', geoJson);
  }),
  100);

map.on('moveend', () => {
  const pos = map.getCenter(),
    newPermalink = [pos.lng, pos.lat, map.getZoom()]
    .map(f => Math.round(f * 1000) / 1000)
    .join('/');

  // Mémorisation de la position
  idbKeyval.set('permalink', newPermalink);

  // Le permalink est un #hash ajouté à la page carte uniquement et mémorisé dans IndexedD
  if (document.body.id === 'carte')
    location.hash = newPermalink;
});