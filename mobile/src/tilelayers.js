/* global L, mapKeys */

/*******************
 * Couches tuilées *
 *******************/
// Remplace avantageusement 663 Ko de lib IGN
function tileLayerIGN(url, paramsIGN, paramsLayer) {
  const params = {
    request: 'GetTile',
    service: 'WMTS',
    version: '1.0.0',
    tilematrixset: 'PM',
    style: 'normal',
    format: 'image/jpeg',
    tilematrix: '{z}',
    tilerow: '{y}',
    tilecol: '{x}',
    ...paramsIGN,
  };

  return L.tileLayer(
    url + Object.entries(params).map(e => e.join('=')).join('&'), {
      bounds: [
        [-75, -180],
        [81, 180]
      ],
      attribution: '<a target="_blank" href="https://www.geoportail.gouv.fr/">IGN Geoportail</a>',
      maxNativeZoom: 19,
      maxZoom: 21,
      ...paramsLayer,
    });
}

/* eslint-disable-next-line no-unused-vars */
const tileLayers = {
  // Cartes lbres
  OpenStreetMap: L.tileLayer(
    'https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxNativeZoom: 19, //TODO revoir zoomS
      attribution: '&copy;<a target="_blank" href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>|' +
        '<a target="_blank" href="https://www.openstreetmap.org/panes/legend">Légende</a>'
    }),
  OpenHikingMap: L.tileLayer(
    'https://tile.openmaps.fr/openhikingmap/{z}/{x}/{y}.png', {
      maxNativeZoom: 18,
      edgeBufferTiles: 3,
      attribution: '<a href="https://wiki.openstreetmap.org/wiki/OpenHikingMap">© OpenHikingMap</a>|' +
        '<a href="https://openmaps.fr/donate">❤️ Donation</a>|' +
        '<a href="http://www.openstreetmap.org/copyright">© OpenStreetMap</a>|' +
        '<a target="_blank" href="https://wiki.openstreetmap.org/wiki/OpenHikingMap#Map_Legend">Légende</a>',
    }),
  OpenTopoMap: L.tileLayer(
    'https://tile.openmaps.fr/opentopomap/{z}/{x}/{y}.png', {
      maxNativeZoom: 19,
      attribution: '<a href="https://github.com/sletuffe/OpenTopoMap">&copy; OTM-R</a> ' +
        '<a href="https://openmaps.fr/donate">❤️ Donation</a> ' +
        '<a href="http://www.openstreetmap.org/copyright">&copy; OpenStreetMap</a> ' +
        '<a target="_blank" href="https://openmaps.fr/map-legend/opentopomap-legend.html">Légende</a>',
    }),
  'ISO-Maps Topo': L.tileLayer(
    'https://api.iso-maps.com/v1/tiles/{z}/{x}/{y}.webp?api_key=' + mapKeys.isomaps, {
      maxZoom: 20,
      attribution: '©<a target="_blank" href="https://www.iso-maps.com/">Isomaps</a> | ' +
        '©<a target="_blank" href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }),

  // Thunderforest
  // https://leaflet-extras.github.io/leaflet-providers/preview/
  Outdoors: L.tileLayer(
    'https://api.thunderforest.com/outdoors/{z}/{x}/{y}{r}.png?apikey=' + mapKeys.thunderforest, {
      attribution: '&copy; <a href="http://www.thunderforest.com/">Thunderforest</a>, ' +
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxNativeZoom: 22,
    }),
  OpenCycleMap: L.tileLayer(
    'https://api.thunderforest.com/cycle/{z}/{x}/{y}{r}.png?apikey=' + mapKeys.thunderforest, {
      maxNativeZoom: 22,
      attribution: '&copy; <a href="http://www.thunderforest.com/">Thunderforest</a>, ' +
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }),

  // IGN
  // https://geoservices.ign.fr/documentation/services/utilisation-web/extension-pour-leaflet
  // https://ignf.github.io/geoportal-extensions/leaflet-latest/jsdoc/module-Layers.html#.WMTS
  TOP25: tileLayerIGN(
    'https://data.geopf.fr/private/wmts?', {
      layer: 'GEOGRAPHICALGRIDSYSTEMS.MAPS',
      apikey: 'ign_scan_ws',
    }, {
      maxNativeZoom: 18,
    }),
  'IGN plan': tileLayerIGN(
    'https://data.geopf.fr/wmts?', {
      layer: 'GEOGRAPHICALGRIDSYSTEMS.PLANIGNV2',
      format: 'image/png',
    }),
  'IGN photo': tileLayerIGN(
    'https://data.geopf.fr/wmts?', {
      layer: 'ORTHOIMAGERY.ORTHOPHOTOS',
    }),
  Cadastre: tileLayerIGN(
    'https://data.geopf.fr/wmts?', {
      layer: 'CADASTRALPARCELS.PARCELLAIRE_EXPRESS',
      style: 'PCI vecteur',
      format: 'image/png',
    }),
  Espagne: tileLayerIGN(
    'https://www.ign.es/wmts/mapa-raster?', {
      layer: 'MTN',
      style: 'default',
      tilematrixset: 'GoogleMapsCompatible',
    }, {
      attribution: '&Copy; <a target="_blank" href="https://www.ign.es/">Instituto Geográfico Nacional</a> | '
    }),

  SwissTopo: L.tileLayer.wms(
    'http://wms.geo.admin.ch/?', {
      layers: 'ch.swisstopo.pixelkarte-farbe',
      //layers: 'ch.swisstopo.swissimage',
      format: 'image/jpeg',
      //TODO DELETE detectRetina: true,
    }),

  //TODO Autriche

  'Photo Maxar': L.tileLayer.wms(
    'https://api.mapbox.com/v4/mapbox.satellite/{z}/{x}/{y}@2x.webp?access_token=' + mapKeys.mapbox, {
      maxZoom: 20,
      attribution: '<a href="https://www.mapbox.com/">&copy; Mapbox</a>',
    }),
  'Photo Google': L.tileLayer(
    'http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
      maxZoom: 22,
      attribution: '<a href="https://www.google.com/maps">&copy; Google</a>',
    }),
  //TODO Couches vectorielles
  //TODO https://github.com/plepe/overpass-frontend/blob/master/example-bbox.js
};