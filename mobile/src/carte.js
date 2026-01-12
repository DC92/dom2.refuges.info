/* global L, GeoJsonAjaxCluster, serveurApi, appliqueDonnees, preload */
//TODO remove serveurApi

//TODO BUG mauvais placement init de la fiche
//TODO mémorisation position carte
//TODO mémorisation info fiches WRI autour de la position
//TODO Fonctions ctrl clic suivant demande faite à wri github

/*****************
 * Carte Leaflet *
 *****************/
let map = null;

const baseLayers = {
  OpenHikingMap: L.tileLayer('https://tile.openmaps.fr/openhikingmap/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: '<a href="https://wiki.openstreetmap.org/wiki/OpenHikingMap">© OpenHikingMap</a>|' +
      '<a href="https://openmaps.fr/donate">❤️ Donation</a>|' +
      '<a href="http://www.openstreetmap.org/copyright">© OpenStreetMap</a>|' +
      '<a target="_blank" href="https://wiki.openstreetmap.org/wiki/OpenHikingMap#Map_Legend">Légende</a>',
    //TODO Aspirateur dalles spirales
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

/* eslint-disable-next-line no-unused-vars */
function initCarte() {
  if (!map) {
    map = L.map('map');

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

    //L.Permalink.setup(map); //TODO BUG Interférence permalink templateur

    // WRI poi & clusters
    new GeoJsonAjaxCluster({
      url: serveurApi + '/api/bbox?&nb_points=all&detail=minimal',
      icon: {
        url: feature => serveurApi + '/images/icones/' + feature.properties.type.icone + '.svg',
        size: 24,
      },
      label: {
        title: feature => feature.properties.nom,
        permanent: true,
        direction: 'center',
      },
      click: feature => {
        // Affiche les donnés d'entête de la fiche qui sont disponibles dans l'API bbox
        appliqueDonnees('point', feature.properties);

        // Affiche la page point
        window.location.hash = 'point=' + feature.properties.id;
      },
    }).addTo(map);
  }

  map.on('moveend', preload);

  return map;
}