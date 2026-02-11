/* global L, GeoJsonAjaxCluster, appliqueDonnees, preLoadTiles, serveurAPI, defaultPermalink, idbKeyval */

//TODO mémorisation position carte
//TODO Fonctions ctrl clic + Apple suivant demande faite à wri github

/*****************
 * Carte Leaflet *
 *****************/
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

/* eslint-disable-next-line no-unused-vars */
function initCarte(containerElId) {
  const map = L.map(containerElId);

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
  const pointsLayer = new GeoJsonAjaxCluster({
    icon: {
      url: (feature) => serveurAPI + '/images/icones/' + feature.properties.type.icone + '.svg',
      size: 24,
    },
    label: {
      title: (feature) => feature.properties.nom,
      permanent: true,
      direction: 'center',
    },
    click: (feature) => {
      // Affiche les donnés d'entête de la fiche qui sont disponibles dans l'API bbox
      appliqueDonnees('point', feature.properties);

      // Affiche la page point
      window.location.hash = 'point=' + feature.properties.id;
    },
  }).addTo(map);

  // Recover last position
  idbKeyval.get('permalink')
    .then((permalink) => {
      const position = permalink || defaultPermalink;
      map.setView(position, position[2]);
    });

  // Display the memorised data if available
  idbKeyval.get('points')
    .then((json) => pointsLayer.display(json));

  // Reload new version of the data
  //TODO Appeler ?depuis avant
  fetch(serveurAPI + '/api/points?detail=icones')
    .then((response) => response.json()).then((json) => {
      if (json) {
        //TODO preload ALL icones points
        pointsLayer.display(json);
        idbKeyval.set('points', json);
      }
    });

  map.on('moveend', () => {
    const pos = map.getCenter();

    idbKeyval.set('permalink', [pos.lat, pos.lng, map.getZoom()]);
    preLoadTiles(map, pos);
    // Prè-charge les dalles OpenHikingMap, points et commentaires autour de la zone visitée
    //TODO essayer points proches
  });

  return map;
}