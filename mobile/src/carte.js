/* global L, GeoJsonAjaxCluster, appliqueDonnees, preLoadTiles, serveurAPI, defaultPermalink, idbKeyval */

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
  const map = L.map(containerElId),
    hash = location.hash.replace('#', '').split(','),
    permalink = hash.length === 3 ? hash :
    (localStorage.getItem('permalink') || defaultPermalink).split(',');

  // Recover last position
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

  // WRI poi & clusters
  const pointsLayer = new GeoJsonAjaxCluster({
    //idbId: 'points',
    url: serveurAPI + '/api/points?detail=icones',
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

  //TODO Appeler ?depuis avant
  //TODO preload ALL icones points

  map.on('moveend', () => {
    const pos = map.getCenter(),
      newPermalink = [pos.lat, pos.lng, map.getZoom()]
      .map(f => Math.round(f * 1000) / 1000)
      .join(',');

    // Refresh permalink
    localStorage.setItem('permalink', newPermalink);
    if (hash.length !== 1) //TODO BUG
      location.hash = newPermalink;

    // Prè-charge les dalles OpenHikingMap, points et commentaires autour de la zone visitée
    preLoadTiles(map, pos);
  });

  return map;
}