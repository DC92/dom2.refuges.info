/*************************************************
 * Personnal adaptations & addOns for leaflet    *
 * This file contains all the generic comon code *
 * related to leaflet functions                  *
 * © Dominique Cavailhez 2026                    *
 *************************************************/

/*****************************************
 * GeoJson layer from url with bbox      *
 *   bbox: true / false, default = false *
 *     add &bbox= to the url             *
 *   ...L.geoJson options                *
 *****************************************/
/* eslint-disable-next-line no-unused-vars */
class GeoJsonUrlBbox extends L.geoJson {
  constructor(url, options = {}) {
    super(null, options);
    // Wait for the attachment to the map to get the map reference
    this.on('add', (evt) => {
      const map = evt.target._map;

      if (options.bbox) {
        const b = map.getBounds(),
          urlBbox = url + '&bbox=' + [b.getWest(), b.getSouth(), b.getEast(), b.getNorth()].join(',');

        // Do it once at init
        this.fetchUrlData(urlBbox);

        // Get event when the map is moved to refresh the bbox
        map.on('dragend', () => {
          this.clearLayers();
          this.fetchUrlData(urlBbox);
        });
      } else
        // If no bbox, just fetch the whole layer at init
        this.fetchUrlData(url);
    });
  }

  fetchUrlData = function(url) {
    fetch(url)
      .catch((error) => console.error(error + ' fetching ' + url))
      .then((response) => response.json())
      .then((json) => {
        if (json.features.length)
          this.addData(json);

        // Trigger for who needs it
        this.fire('load');
      });
  }
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
    buttonDiv.lastChild.addEventListener('change', (evt) => {
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
          baseLayerName = lsInputEl.parentElement.lastChild.innerText.trim();

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

//DCMM FUTUR PERMALINK
/*****************************
 * Saving the map position   *
 * Lon, lat, zoom, baselayer *
 *****************************/
// Store lon/lat/zoom/baselayer in sessionStorage 
/* eslint-disable-next-line no-unused-vars */
function permalinkControl(map, defaut) {
  /*priorités:
    defaut
    localStorage
    sessionStorage
    hash
    forcage page (position d'une fiche)
  */
  const regex = /#?([0-9.]+)\/([0-9.]+)\/([0-9.]+)\/?(.*)/u;

  const prio2 = (localStorage.permalink || sessionStorage.permalink || defaut || '6/2/47');
  console.log(prio2); //DCMM
  const prio = prio2.match(regex);
  console.log(prio); //DCMM
  console.log(location.hash); //DCMM
  const hashmatch = location.hash.match(regex);
  console.log(hashmatch); //DCMM
  prio.fill(...hashmatch); // Écrase les index 1, 2 et 3 par 0
  console.log(prio); //DCMM

  /*****************************************
   * Position et couche de fond par défaut *
   *****************************************/
  localStorage.permalink ||= '5/46.5/5'; // S'il n'y a aucune donnée enregistrée
  sessionStorage.permalink ||= localStorage.permalink; // En début de session, on repart de la dernière position
  let permalinkArray = sessionStorage.permalink.split('/'); // Pour usage au cours de la durée de vie de la page.

  ['baselayerchange', 'zoom', 'moveend'].forEach((evtName) => {
    map.on(evtName, () => {
      const baselayerSelector = document.querySelectorAll('.leaflet-control-layers-base input'),
        pos = map.getCenter();
      let baseLayerName = null;

      for (const lsInputEl of baselayerSelector)
        if (lsInputEl.checked || !baseLayerName)
          baseLayerName = lsInputEl.parentElement.lastChild.innerText.trim();

      // To restart from this position at the next map change
      permalinkArray = [
        map.getZoom().toFixed(1),
        pos.lat.toFixed(5),
        pos.lng.toFixed(5),
        encodeURI(baseLayerName),
      ];
      sessionStorage.permalink = permalinkArray.join('/');

      // To resume from the last position at the start of the next session
      const pa2 = Array.from(permalinkArray);
      pa2[0] = Math.max(5, Math.min(10, pa2[0])); // In zoom limits
      localStorage.permalink = pa2.join('/');

      // Hides labels for large scales
      map.getContainer().classList[map.getZoom() < 8 ? 'add' : 'remove']('hide-tooltips');
    });
  });

  // Loading the active basemap
  if ((sessionStorage.permalink || '').split('/')[3])
    //TODO BUG tileLayers is not defined
    /* eslint-disable-next-line no-undef */
    (tileLayers[decodeURI((sessionStorage.permalink || '').split('/')[3])]).addTo(map);

  // Initiates the loading of the map
  map.setView([permalinkArray[1], permalinkArray[2]], permalinkArray[0]);
}

//DCMM FUTUR HORS RESEAU
/****************************************
 * OpenHikingMap tile preloading button *
 ****************************************/
/* eslint-disable-next-line no-unused-vars */
const ControlPreload = L.Control.extend({
  options: {
    position: 'topleft',
  },

  onAdd(map) {
    const minZoom = 10,
      maxZoom = 16,
      edgeBuffer = 3,
      buttonDiv = L.DomUtil.create('div', 'button-wrapper leaflet-control-preload'),
      avertissement = 'Vous êtes sur le point de précharger le fond de carte OpenHikingMap ' +
      'dans un rayon de ' + (edgeBuffer + 1) + ' largeurs de la carte autour de sa position médiane ' +
      'pour les zooms ' + minZoom + ' à ' + maxZoom + '.\n' +
      'Cela peut engendrer une consommation réseau et mémoire de l\'ordre de 15 Mo.';

    buttonDiv.innerHTML = '<button title="Précharger le fond de carte OpenHikingMap">🌐</button>';
    buttonDiv.addEventListener('click', () => {
      if (confirm(avertissement)) {
        const pos = map.getCenter(),
          loadingLayer = L.tileLayer(
            'https://tile.openmaps.fr/openhikingmap/{z}/{x}/{y}.png', {
              edgeBufferTiles: edgeBuffer,
            });

        map.setZoom(minZoom);
        loadingLayer.addTo(map);

        const timer = setInterval(() => {
          if (!loadingLayer.isLoading()) {
            map.setZoom(map.getZoom() + 1);

            if (map.getZoom() > maxZoom) {
              clearInterval(timer);
              alert('Téléchargement terminé.\nRéinitialisation de la page.');

              // On affiche la couche OpenHikingMap pour ne pas qu'il y ait confusion sur quelle couche on a chargé
              sessionStorage.positionMemory = minZoom + '/' + pos.lat + '/' + pos.lng + '/OpenHikingMap';
              location.reload();
            }
          }
        }, 100);
      };
    });

    return buttonDiv;
  }
});

//DCMM Modèle de classe
/* eslint-disable-next-line no-unused-vars */
class Newclass extends L.geoJson {
  constructor() {
    super(123);
  }
}

//DCMM FUTUR
/*******************************************
 * Display GPS distance via touch on a map *
 *******************************************/