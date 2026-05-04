/* global L, serveurAPI, mapKeys */

/*******************************
 * Gestion de la carte Leaflet *
 *******************************
  L'application est constituée d'une page unique, chargée lors du lancement.
  La carte reste ouverte dans un <div id="map> pour toutes les vues de l'appli (carte, fiche, ...)
  seules sont modifiées la taille du DIV et la position lon/lat
*/

/* Modif leaflet-src.js à ajouter lors de chaque mise à jour
//TODO modif automatique ???
		this._map.locate({
 			timeout: 300000, //DCMM 5 minutes
*/
//TODO recherche de points

/******************************
 * Initialisation de la carte *
 ******************************/
const map = L.map('map');

new L.Control.Fullscreen().addTo(map);

L.control.scale({
  imperial: false,
}).addTo(map);

new L.Control.Geocoder({
  position: 'topleft',
}).addTo(map);

console.info('MAP init');

/********************************
 * GPS avec marqueur orientable *
 ********************************/
const iconMarker = L.icon({ // Icône sans orientation
    iconUrl: 'images/gpsmarker.svg',
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  }),
  iconCompas = L.icon({ // Icône orientée
    iconUrl: 'images/gpscompas.svg',
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  }),
  gpsMarker = L.marker([0, 0], {
    icon: iconMarker,
  });

let gpsAngle = 0;

window.addEventListener('deviceorientationabsolute', (evt) => {
  if (gpsMarker._icon && evt.alpha) { // If gps enabled
    gpsMarker.setIcon(iconCompas);
    gpsMarker._icon.style.transformOrigin = 'center';

    gpsAngle = 45 - parseInt(evt.alpha, 10);
    gpsMarker._icon.style.transform = gpsMarker._icon.style.transform.replace(/[0-9]*deg/u, gpsAngle + 'deg');
  }
});

// Evite à la direction du marqueur d'être perturbée par le zoom
const protoSetPos = L.Marker.prototype._setPos;
L.Marker.include({
  _setPos: function(pos) {
    protoSetPos.call(this, pos);
    this._icon.style.transform += ' rotateZ(' + gpsAngle + 'deg)';
  },
});

new L.Control.Gps({
  autoCenter: true,
  marker: gpsMarker,
}).addTo(map);

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

const tileLayers = {
  // Cartes lbres
  OpenStreetMap: L.tileLayer(
    'https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxNativeZoom: 19, //TODO revoir zoomS
      attribution: '&copy;<a target="_blank" href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>|' +
        '<a target="_blank" href="https://www.openstreetmap.org/panes/legend">Légende</a>'
    }),
  //TODO remettre en première position aprés les tests
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
  /*OpenCycleMap: L.tileLayer(
    'https://api.thunderforest.com/cycle/{z}/{x}/{y}{r}.png?apikey=' + mapKeys.thunderforest, {
      maxNativeZoom: 22,
      attribution: '&copy; <a href="http://www.thunderforest.com/">Thunderforest</a>, ' +
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }),*/

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
  /*'IGN photo': tileLayerIGN(
    'https://data.geopf.fr/wmts?', {
      layer: 'ORTHOIMAGERY.ORTHOPHOTOS',
    }),
  Cadastre: tileLayerIGN(
    'https://data.geopf.fr/wmts?', {
      layer: 'CADASTRALPARCELS.PARCELLAIRE_EXPRESS',
      style: 'PCI vecteur',
      format: 'image/png',
    // }),*/

  SwissTopo: L.tileLayer.wms(
    'http://wms.geo.admin.ch/?', {
      layers: 'ch.swisstopo.pixelkarte-farbe',
      format: 'image/jpeg',
    }),
  Espagne: tileLayerIGN(
    'https://www.ign.es/wmts/mapa-raster?', {
      layer: 'MTN',
      style: 'default',
      tilematrixset: 'GoogleMapsCompatible',
    }, {
      attribution: '&Copy; <a target="_blank" href="https://www.ign.es/">Instituto Geográfico Nacional</a> | '
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
  //TODO https://github.com/plepe/overpass-frontend/blob/master/example-bbox.js
};

Object.values(tileLayers)[0].addTo(map); // Fond de carte par défaut

/************************
 * Couches vectorielles *
 ************************
  Une icône est une image .png représentant un type de point
  Un point est défini par un position, un nom et une icône destinée à être affiché sur une carte
  Une fiche contient toutes les informations concernant un point, y compris les commentaires

  json est une structure contenant des définitions de points
  geoJson sa représentation en string
*/

// Affichage des massifs
const massifsLayer = L.geoJson(null, {
  style: function(feature) {
    return {
      stroke: false,
      color: feature.properties.couleur,
    };
  },
  onEachFeature: (feature, layer) => {
    // Etiquettes
    layer.bindTooltip(
      feature.properties.nom
      .replace(/ ([a-z]?[a-z]?[a-z]) /gui, ' $1&nbsp;')
      .replace(/ /gu, '<br/>'), {
        permanent: true,
        direction: 'center',
      }).openTooltip();

    layer.on('mouseover mouseout', (evt) => {
      evt.target.setStyle({
        stroke: evt.type === 'mouseover',
      });
    });

    // Click
    //BEST Fonctions ctrl clic + Apple suivant demande faite à wri github
    layer.on({ //TODO essayer ce format switch / case:
      click: () => {
        //TODO Affiche la vue fiche
        // location.hash = feature.id;
      },
    });
  },
});

fetch(serveurAPI + '/api/polygones?type_polygon=1')
  .catch((er) => console.error(er + ' fetching ' + serveurAPI + '/api/polygones?type_polygon=1'))
  .then((response) => response.json())
  .then((json) => {
    if (json.features.length)
      massifsLayer.addData(json);
  });

// Points d'intérêt refuges.info
function geoJsonLayer(url) {
  const poiLayer = L.geoJson(null, {
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

  // Fetch remote data
  fetch(url)
    .catch((er) => console.error(er + ' fetching ' + url))
    .then((response) => response.json())
    .then((json) => {
      if (json.features.length)
        poiLayer.addData(json);
    });
  return poiLayer;
}

// Sélecteur de couches
const wriTypesPoints = {
    7: 'Cabane non gardée',
    10: 'Refuge gardé',
    9: 'Gîte d\'étape',
    29: 'Grotte',
    23: 'Point d\'eau',
    3: 'Passage délicat',
    28: 'Bâtiment en montagne',
  },
  vectorLayers = {
    'Massifs': massifsLayer,
  },
  vectorCluster = L.markerClusterGroup();

for (const type in wriTypesPoints)
  vectorLayers[wriTypesPoints[type]] =
  L.featureGroup.subGroup(vectorCluster).addLayer(
    geoJsonLayer(serveurAPI + '/api/bbox?nb_points=all&type_points=' + type)
  );

vectorCluster.addTo(map); // Couche vectorielle
L.control.layers(tileLayers, vectorLayers).addTo(map); // Layer switcher

// Mémorisation des couches sélectionnées
const memCheckedLayers = (localStorage.checkedLayers || ' Massifs').split(',');

['load', 'baselayerchange', 'overlayadd', 'overlayremove'].forEach((type) => {
  map.on(type, (evt) => {
    console.log(evt); //DCMM

    const lsControls = evt.target.getContainer().getElementsByClassName('leaflet-control-layers-selector'),
      checkedLayers = [];

    for (const lsInputEl of lsControls) {
      const titre = lsInputEl.parentElement.lastChild.innerText;

      // Restaure les couches précédentes
      //TODO n'affiche pas les couches dans le cluster
      if (evt.type === 'load' && memCheckedLayers.includes(titre))
        lsInputEl.click();

      // Mémorise les couches actuelles
      if (lsInputEl.checked)
        checkedLayers.push(titre);
    }

    localStorage.checkedLayers = checkedLayers.join(',');
  });
})

// Permalink
//TODO permalink baseLayer
map.on('moveend', () => {
  const pos = map.getCenter();

  console.info('MAP moveend');

  // Le permalink est mémorisé dans la mémoire permanente de l'explorateur localStorage
  localStorage.permalink = [map.getZoom(), pos.lat, pos.lng].map(f => Math.round(f * 10000) / 10000).join('/');

  // Le permalink est un #hash ajouté à la page carte uniquement
  if (document.body.className === 'carte')
    location.hash = localStorage.permalink;
});