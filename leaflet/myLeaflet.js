/*************************************************
 * Personnal adaptations & addOns for leaflet    *
 * This file contains all the generic comon code *
 * related to leaflet functions                  *
 * © Dominique Cavailhez 2026                    *
 *************************************************/

/***********
 * Helpers *
 ***********/
// Swap lon/lat between Leaflet to geoJson & GPX
//TODO latLngToCoords(latlng: LatLng, precision?: Number|false): Position
function flipLonLatRecursive(arrayOfLonLat) {
  if (Array.isArray(arrayOfLonLat) && typeof arrayOfLonLat[0] === 'number')
    return [arrayOfLonLat[1], arrayOfLonLat[0]];

  return arrayOfLonLat.map(item => flipLonLatRecursive(item));
}

// remove empty attributes from obejct
// Source - https://stackoverflow.com/a/38340730
function removeEmpty(obj) {
  return Object.keys(obj)
    .filter((k) => obj[k])
    .reduce((acc, k) => {
      acc[k] = obj[k];
      return acc;
    }, {});
}

function roundBounds(bounds, decimals) {
  //TODO .toFixed(decimals)
  const factor = 10 ** decimals,
    round = (num) => Math.round(num * factor) / factor,
    sw = bounds.getSouthWest(),
    ne = bounds.getNorthEast();

  return L.latLngBounds(
    [round(sw.lat), round(sw.lng)],
    [round(ne.lat), round(ne.lng)]
  );
}

/*************************************************
 * GeoJson layer from url with bbox & cluster    *
 * Cluster points, not polygons                  *
 * params : {name:'value', ...}                  *
 * options :                                     *
 *   hide: don't get the data & hide the layer   *
 *   ...L.geoJson options                        *
 *************************************************/
class GeoJsonAjaxBboxLayer extends L.MarkerClusterGroup {
  constructor(url, params = {}, options = {}) {
    super({
      spiderfyOnMaxZoom: true, // Overlapping markers will spiderfy when clicked
      showCoverageOnHover: false, // Hides the cluster bounds polygon
      maxClusterRadius: 30, // Adjust the number of points versus clusters
    });

    this._url = url;
    this._par = params;
    this._opt = options;
  }

  // Load or refresh the display
  fetchData(url, params = {}, options = {}) {
    // Update arguments
    this._url = url || this._url;
    this._par = removeEmpty({
      ...this._par,
      ...params,
      bbox: roundBounds(this._map.getBounds(), 5).toBBoxString(),
    });
    this._opt = {
      ...this._opt,
      ...options,
    };
    const uri = this._url + '?' + new URLSearchParams(this._par).toString();

    if (typeof this._opt.hide === 'function' ? this._opt.hide() : this._opt.hide)
      this.clearLayers(); // Clear existing content
    else
      fetch(uri)
      .then((response) => response.json())
      .then((json) => {
        this.clearLayers(); // Clear existing content

        // Add new vector layer with new geoJson features
        const vectorLayer = new L.GeoJSON(null, this._opt);

        vectorLayer.addData(json);
        this.addLayer(vectorLayer);
      });
  }

  // Overrides MarkerClusterGroup.onAdd to get the map
  onAdd(map) {
    super.onAdd(map);

    this._map = map;
    this.fetchData(); // Do it once at init

    map.on('dragend zoomend', () => this.fetchData()); // Refresh the layer for each map movement
  }
}

/***************************************************************
 * couche vectorielle de points refuges.info                   *
 * à partir de l'API, en mode BBOX et regroupement en clusters *
 *   Host servant l'API (https://www.refuges.info)             *
 *   Paramètres de l'API: typePoints, massif, version          *
 *   Options de la couche:                                     *
 *     labels (booléen):affiche le nom du point             *
 *     clic (booléen): edirige vers la page du point           *
 *   ...options de GeoJsonAjaxBboxLayer                        *
 ***************************************************************/
/* eslint-disable-next-line no-unused-vars */
class ClusterPointsWri extends GeoJsonAjaxBboxLayer {
  // On en fait une classe car on doit étendre une classe Leaflet
  constructor(host, params = {}, options = {}) {
    super(host + (params.massif ? '/api/massif' : '/api/bbox'), {
      'nb_points': 'all', //TODO masquage de la couche si limite de points atteinte
      'type_points': params.typePoints,
      massif: params.massif,
      version: params.version,
      langue: document.documentElement.lang === 'fr' ? '' : document.documentElement.lang,
    }, {
      hide: () => !params.typePoints, //DCMM ne marche pas en zoom et déplace

      onEachFeature: (feature, layer) => {
        // Etiquettes
        if (options.labels)
          layer.bindTooltip(
            feature.properties.nom, {
              permanent: true,
              // TODO ?? sticky: true,
              direction: 'center',
            }).openTooltip();

        // Clics et curseur
        if (options.clic)
          layer.on('click', () => {
            location.href = feature.properties.lien || '/point/' + feature.id;
          });
        else
          // Supprime le pointeur de la souris au survol
          layer.on('mouseover', (evt) => {
            evt.target.getElement().style.cursor = 'grab';
          });
      },

      // Icônes
      pointToLayer: (feature, latlng) =>
        L.marker(latlng, {
          icon: L.icon({
            iconUrl: host + '/images/icones/' + feature.properties.type.icone + '.svg',
            iconSize: [24, 24],
            iconAnchor: [12, 12],
          }),
        }),

      ...options,
    });
  }
}

/******************************************************************
 * Couche vectorielle de polygones refuges.info (massifs, zones ) *
 * à partir de l'API et en mode BBOX                              *
 * Paramètres de l'API :                                          *
 *   host: https://www.refuges.info                                             *
 *   typePolygon: 1 (massifs), 11 (régions)                       *
 *   intersection (id) : Les polygones dans une région            *
 * Options de la couche :                                         *
 *   labels: (boolean) affiche le nom du point                 *
 *   clic: (boolean) url de redirirection                         *
 *   featureStyle: {options de style d'affichage des polygones}   *
 *   layer : {options de GeoJsonAjaxBboxLayer }                   *
 ******************************************************************/
/* eslint-disable-next-line no-unused-vars */
class CouchePolygonesWri extends GeoJsonAjaxBboxLayer {
  //TODO label on hover
  constructor(host, params = {}, options = {}) {
    super(host + '/api/polygones', params, {
      onEachFeature: (feature, layer) => {
        // Etiquettes
        if (options.labels)
          layer.bindTooltip(
            feature.properties.nom
            .replaceAll(/ ([a-z]?[a-z]?[a-z]) /gui, ' $1&nbsp;')
            .replaceAll(/ /gu, '<br/>'), {
              //DCMM BUG affiche les étiquettes à l'init et pas aprés
              //TODO étiquette au survol
              permanent: true,
              direction: 'center',
            }).openTooltip();

        if (options.clic) {
          layer.on('mouseover mouseout', (evt) => {
            // Elargit le contour au survol
            evt.target.setStyle({
              stroke: evt.type === 'mouseover',
            });
          });

          layer.on('click', (evt) => {
            location.href = '/nav/' + evt.sourceTarget.feature.id;
          });
        } else
          // Remove cursor pointer on hover
          layer.on('mouseover', (evt) => {
            evt.target.getElement().style.cursor = 'grab';
          });
      },

      style: (feature) => ({
        stroke: false,
        color: feature.properties.couleur,
        ...options.featureStyle,
      }),

      ...options,
    });
  }
}

/**************************
 * Couches OSM - Overpass *
 **************************/
/* eslint-disable-next-line no-unused-vars */
function couchesOverpass(definitionCouchesOverpass, options = {}) {
  const layers = [];

  // Couches OSM OverPass
  for (const [nom, query] of Object.entries(definitionCouchesOverpass)) {
    layers.push({
      id: nom, // Juste pour l'identifier
      'nom_traduit': nom,
      layer: new L.OverPassLayer({ //TODO label on hover
        endPoint: options.overpassApi || 'https://overpass-api.de/api/',
        query: '(nwr' + query + '({{bbox}}););out center;',
        markerIcon: L.icon({
          iconUrl: options.iconApi + nom
            .replaceAll('ô', 'o')
            .replaceAll(/[^a-z]/gu, '') + '.svg',
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        }),
        minZoom: 12,
        minZoomIndicatorEnabled: false,
      }),
    });
  }
  return layers;
}

/**********************
 * File upload button *
 **********************/
/* eslint-disable-next-line no-unused-vars */
const ControlPolygonsUpload = L.Control.extend({
  options: {
    position: 'topleft',
    title: 'Import geometry file',
  },

  onAdd(map) {
    super.onAdd(map);

    const buttonDiv = L.DomUtil.create('div', 'button-wrapper leaflet-control-upload');

    buttonDiv.innerHTML = '<button title="' + this.options.title + ' .geojson, .gml, .gpx, .json, .kml, .xml">' +
      '<span>📁</span>' +
      '<input type="file" accept=".geojson,.gml,.gpx,.json,.kml,.xml" />' +
      '</button>';
    // Display the input
    buttonDiv.addEventListener('click', () => buttonDiv.classList.add('buttonSelected'));

    // A file has been selected
    buttonDiv.lastChild.addEventListener('change', (evt) => { //BEST remove *ElementChild
      const reader = new FileReader();

      reader.readAsText(evt.target.files[0]);
      reader.onload = () => {
        // We cannot use libraries because we want to convert lines into polygons
        const fileText = reader.result
          .replaceAll(/[\n\r\t]/gu, ' ') // Remove CR LF & tabs
          .replaceAll(/ +/gu, ' '), // Remove multiple spaces
          polygonsCoords = [];

        // Json, GeoJson
        for (const match of fileText.matchAll(/"coordinates":([^}]*)/gu)) {
          const coords = flipLonLatRecursive(JSON.parse(match[1]));
          if (typeof coords[0] === 'object') // Avoid points
            polygonsCoords.push(coords);
        }

        // XML, KML, GML
        for (const match of fileText.matchAll(/coordinates>([0-9,. ]+)/gu))
          polygonsCoords.push(flipLonLatRecursive(JSON.parse( //TODO flipLonLatRecursive -> L.polygon
            '[[' + match[1].trim().replaceAll(' ', '],[') + ']]'
          )));

        // GPX
        for (const match of fileText.replaceAll('" /> <trkpt lat="', ' ').replaceAll('" lon="', ',').matchAll(/lat="([0-9,. ]+)/gu))
          polygonsCoords.push((JSON.parse(
            '[[' + match[1].trim().replaceAll(' ', '],[') + ']]'
          )));

        if (polygonsCoords.length) {
          const polygons = L.polygon(polygonsCoords).addTo(map);
          map.fitBounds(polygons.getBounds());
          map.pm.enableGlobalEditMode();
        } else
          alert('Type de fichier non géré ou ne comportant pas de polygones ni de trace');

        buttonDiv.classList.remove('buttonSelected');
      };
    });

    return buttonDiv;
  }
});

/*********************************************************
 * Rotating marker to be used in L.Control.Gps           *
 * which indicates the direction in which we are looking *
 *********************************************************/
/* eslint-disable-next-line no-unused-vars */
class MarkerCompass extends L.Marker {
  constructor(options) {
    // Fix icon
    const iconMarker = L.divIcon({
        iconSize: [16, 16],
        iconAnchor: [8, 8],
        className: '', // To clean default class
        html: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" height="16" width="16">\
          <circle cx="8" cy="8" r="6" fill="#ff0" stroke="#f00" stroke-width="2" />\
        </svg>',
      }),

      // Direction icon
      iconCompas = L.divIcon({
        ...options,
        iconSize: [16, 16],
        iconAnchor: [8, 8],
        className: '',
        html: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" height="16" width="16">\
          <circle cx="8" cy="8" r="6" fill="#ff0" stroke="#f00" stroke-width="2" />\
          <path d="M0,0 8,1 8,8 1,8" fill="#f00" />\
        </svg>',
      });

    super([0, 0], {
      icon: iconMarker,
    });

    // Rotate the marker following the orientation sensors
    window.addEventListener('deviceorientationabsolute', (evt) => {
      this.heading = evt.alpha || evt.webkitCompassHeading; // Android || iOS

      if (this._icon && this.heading) { // If gps enabled
        // Add the direction to the icon if it is not already done.
        this.setIcon(iconCompas);
        this._icon.style.transformOrigin = 'center';
        this._rotateIcon();
      }
    });
  }

  // Prevents zoom from affecting the marker's direction.
  _setPos(pos) {
    super._setPos(pos);

    if (this.heading)
      this._rotateIcon();
  }

  // Add or replace the icon rotation style
  _rotateIcon() {
    this._icon.style.transform =
      this._icon.style.transform.replaceAll(/rotateZ\([^)]+\)/gu, '') +
      ' rotateZ(' + (45 - parseInt(this.heading, 10)) + 'deg)';
  }
}

/*****************************
 * Saving the map position   *
 * Lon, lat, zoom, baselayer *
 *****************************/
let positionMemoryArray = []; // For use during the page lifetime.

/* eslint-disable-next-line no-unused-vars */
function positionMemoryControl(map) {
  //TODO BUG pourquoi doit elle être placée avant map.setView ?
  // TODO transform in a true control + url hack permalink
  ['baselayerchange', 'zoom', 'moveend'].forEach((evtName) => {
    map.on(evtName, () => {
      const baselayerSelector = document.querySelectorAll('.leaflet-control-layers-base input'),
        pos = map.getCenter();
      let baseLayerName = null;

      for (const lsInputEl of baselayerSelector)
        if (lsInputEl.checked || !baseLayerName)
          baseLayerName = lsInputEl.parentElement.lastChild.innerText.trim(); //BEST remove *ElementChild

      // Store the values to resume from the last position at the start of the next session (page, tab)
      positionMemoryArray = [
        Math.max(5, Math.min(10, map.getZoom())), // In zoom limits
        pos.lat.toFixed(5),
        pos.lng.toFixed(5),
        encodeURI(baseLayerName),
      ];
      sessionStorage.positionMemory = positionMemoryArray.join('/'); // Store for the session
      localStorage.positionMemory = sessionStorage.positionMemory; // Store for next sessions

      // Store the values to restart from this position at the next map change
      positionMemoryArray[0] = Math.max(5, Math.min(10, map.getZoom())).toFixed(1); // In zoom limits
      localStorage.positionMemory = positionMemoryArray.join('/');

      // Hides labels for large scales
      map.getContainer().classList[map.getZoom() < 8 ? 'add' : 'remove']('hide-tooltips');
    });
  });
}

/**********************************
 * IGN LAYERS                     *
 * Replace the 663 KB IGN library *
 **********************************/
/* eslint-disable-next-line no-unused-vars */
class IGNTileLayer extends L.tileLayer {
  constructor(url, ignQueries, options) {
    const queries = {
      request: 'GetTile',
      service: 'WMTS',
      version: '1.0.0',
      tilematrixset: 'PM',
      style: 'normal',
      format: 'image/jpeg',
      tilematrix: '{z}',
      tilerow: '{y}',
      tilecol: '{x}',
      ...ignQueries,
    };

    super(url + Object.entries(queries).map(e => e.join('=')).join('&'), {
      bounds: [
        [-75, -180],
        [81, 180],
      ],
      attribution: '<a href="https://www.geoportail.gouv.fr/">IGN Geoportail</a>',
      ...options,
    });
  }
}