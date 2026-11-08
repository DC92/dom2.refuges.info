/*************************************************
 * Personnal adaptations & addOns for leaflet    *
 * This file contains all the generic comon code *
 * related to leaflet functions                  *
 * © Dominique Cavailhez 2026                    *
 *************************************************/

/*****************************************************
 * GeoJson layer from url with bbox & cluster        *
 * optionalParameter : string to be added to the url *
 * ...L.geoJson options                              *
 *****************************************************/
/* eslint-disable-next-line no-unused-vars */
class GeoJsonAjaxBboxLayer extends L.MarkerClusterGroup {
  constructor(url, options) {
    super({
      spiderfyOnMaxZoom: true, // Overlapping markers will spiderfy when clicked
      showCoverageOnHover: false, // Hides the cluster bounds polygon
      maxClusterRadius: 30, // Adjust the number of points versus clusters
    });

    this._url = url;
    this._opt = options;
  }

  fetchData(options, url) {
    // Change the options & url if called from outside
    if (options)
      this._opt = {
        ...this._opt,
        ...options,
      };
    if (url)
      this._url = url;

    fetch(this._url +
        (this._opt.optionalParameter || '') +
        '&bbox=' + this._map.getBounds().toBBoxString())
      .then((response) => response.json())
      .then((json) => {
        this.clearLayers(); // Clear existing content

        // Add new vector layer with new geoJson features
        const vectorLayer = new L.GeoJSON(null, this._opt);

        if (json.features.length && !this._opt.hide) {
          vectorLayer.addData(json);
          this.addLayer(vectorLayer);
        }
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

/****************************************************************
 * Leaflet from/to geoJson & GPX lat/lng coordinates conversion *
 ****************************************************************/
function flipLonLatRecursive(data) {
  if (Array.isArray(data) && typeof data[0] === 'number')
    return [data[1], data[0]];

  return data.map(item => flipLonLatRecursive(item));
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
    const buttonDiv = L.DomUtil.create('div', 'button-wrapper leaflet-control-upload');

    buttonDiv.innerHTML = '<button title="' + this.options.title + ' .geojson, .gml, .gpx, .json, .kml, .xml">' +
      '<span>📁</span>' +
      '<input type="file" accept=".geojson,.gml,.gpx,.json,.kml,.xml" />' +
      '</button>';
    // Display the input
    buttonDiv.addEventListener('click', () => buttonDiv.classList.add('buttonSelected'));

    // A file has been selected
    buttonDiv.lastChild.addEventListener('change', (evt) => { //TODO remove *ElementChild
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
  constructor() {
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
        this.rotateIcon();
      }
    });
  }

  // Prevents zoom from affecting the marker's direction.
  _setPos(pos) {
    super._setPos(pos);

    if (this.heading)
      this.rotateIcon();
  }

  // Add or replace the icon rotation style
  rotateIcon() {
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
  ['baselayerchange', 'zoom', 'moveend'].forEach((evtName) => {
    map.on(evtName, () => {
      const baselayerSelector = document.querySelectorAll('.leaflet-control-layers-base input'),
        pos = map.getCenter();
      let baseLayerName = null;

      for (const lsInputEl of baselayerSelector)
        if (lsInputEl.checked || !baseLayerName)
          baseLayerName = lsInputEl.parentElement.lastChild.innerText.trim(); //TODO remove *ElementChild

      // To restart from this position at the next map change
      positionMemoryArray = [
        map.getZoom().toFixed(1),
        pos.lat.toFixed(5),
        pos.lng.toFixed(5),
        encodeURI(baseLayerName),
      ];
      sessionStorage.positionMemory = positionMemoryArray.join('/');

      // To resume from the last position at the start of the next session
      const pa2 = Array.from(positionMemoryArray);
      pa2[0] = Math.max(5, Math.min(10, pa2[0])); // In zoom limits
      localStorage.positionMemory = pa2.join('/');

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
  constructor(url, paramsIGN, paramsLayer) {
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

    super(url + Object.entries(params).map(e => e.join('=')).join('&'), {
      bounds: [
        [-75, -180],
        [81, 180],
      ],
      attribution: '<a href="https://www.geoportail.gouv.fr/">IGN Geoportail</a>',
      ...paramsLayer,
    });
  }
}