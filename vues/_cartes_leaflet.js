/* global GeoJsonUrlBbox, IGNTileLayer, MarkerCompass */
/* eslint-disable-next-line no-unused-vars */
/* global positionMemoryArray:writable */

/*********************************************************************************
 * Ce fichier contient les paramètrages spécifiques et visibles sur refuges.info *
 *********************************************************************************/

/*****************************************
 * POSITION ET COUCHE DE FOND PAR DÉFAUT *
 *****************************************/
localStorage.positionMemory ||= '5/46.5/5'; // S'il n'y a aucune donnée enregistrée
sessionStorage.positionMemory ||= localStorage.positionMemory; // En début de session, on repart de la dernière position
positionMemoryArray = sessionStorage.positionMemory.split('/'); // Pour usage au cours de la durée de vie de la page.

/*****************************************
 * CONTRÔLES COMMUNS À TOUTES LES CARTES *
 *****************************************/
/* eslint-disable-next-line no-unused-vars */
function controlesComuns(map) {
  // Prevent Leaflet on Chrome from focusing the map when using a Control
  map.getContainer().focus({
    preventScroll: true,
  });

  // Réponse au contrôle GPS
  map.on('locationfound', (evt) => map.setView(evt.latlng, Math.max(15, map.getZoom()))); // Listener for GPS

  return [
    new L.Control.Fullscreen(),

    L.control.scale({
      imperial: false,
    }),

    L.control.coordinates({
      position: 'bottomleft',
    }),

    new L.Control.Geocoder({
      position: 'topleft',
    }),

    new L.Control.Gps({
      marker: new MarkerCompass(),
    }),
  ];
}

/*******************
 * COUCHES TUILÉES *
 *******************/
/* eslint-disable-next-line no-unused-vars */
function couchesDeFond(layerKeys) {
  return {
    //DCMM Pour tests, à enlever à la fin
    'Google': L.tileLayer('https://mt0.google.com/vt/lyrs=r&x={x}&y={y}&z={z}'),
    OpenCycleMap: L.tileLayer(
      'https://api.thunderforest.com/cycle/{z}/{x}/{y}{r}.png?apikey=' + layerKeys.thunderforest, {
        maxZoom: 22,
        attribution: '<a href="https://www.thunderforest.com/">Thunderforest</a> | ' +
          '<a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }),
    Cadastre: new IGNTileLayer(
      'https://data.geopf.fr/wmts?', {
        layer: 'CADASTRALPARCELS.PARCELLAIRE_EXPRESS',
        style: 'PCI vecteur',
        format: 'image/png',
      }),
    //TODO https://leaflet-extras.github.io/leaflet-providers/preview/
    //TODO Autriche
    //DCMM FIN pour développements ultérieurs

    // Cartes libres
    OpenHikingMap: L.tileLayer(
      'https://tile.openmaps.fr/openhikingmap/{z}/{x}/{y}.png', {
        maxZoom: 18,
        attribution: '<a href="https://wiki.openstreetmap.org/wiki/OpenHikingMap"> OpenHikingMap</a> | ' +
          '<a href="https://openmaps.fr/map-legend/openhikingmap-legend.html">Légende</a>',
      }),
    'AlpineQuest Topo': L.tileLayer(
      '/proxy/aq-topo/?x={x}&y={y}&z={z}', {
        maxZoom: 16,
        attribution: '<a href="https://alpinequest.net">AlpineQuest</a> | ' +
          '<a href="https://www.openstreetmap.org/copyright">OSM</a> | ' +
          '<a href="https://www.openstreetmap.org/panes/legend">Légende</a>'
      }),
    OpenTopoMap: L.tileLayer(
      'https://tile.openmaps.fr/opentopomap/{z}/{x}/{y}.png', {
        maxZoom: 18,
        attribution: '<a href="https://github.com/sletuffe/OpenTopoMap">OTM-R</a> | ' +
          '<a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> | ' +
          '<a href="https://openmaps.fr/map-legend/opentopomap-legend.html">Légende</a>',
      }),
    'ISO-maps': L.tileLayer(
      'https://api.iso-maps.com/v1/tiles/{z}/{x}/{y}.webp?api_key=' + layerKeys.isomaps, {
        maxZoom: 16,
        attribution: '<a href="https://www.iso-maps.com/">Isomaps</a> | ' +
          '<a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }),

    // Thunderforest
    Outdoors: L.tileLayer(
      'https://api.thunderforest.com/outdoors/{z}/{x}/{y}{r}.png?apikey=' + layerKeys.thunderforest, {
        maxZoom: 22,
        attribution: '<a href="https://www.thunderforest.com/">Thunderforest</a> | ' +
          '<a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }),

    TOP25: new IGNTileLayer(
      'https://data.geopf.fr/private/wmts?', {
        layer: 'GEOGRAPHICALGRIDSYSTEMS.MAPS',
        apikey: 'ign_scan_ws',
      }),
    'IGN plan': new IGNTileLayer(
      'https://data.geopf.fr/wmts?', {
        layer: 'GEOGRAPHICALGRIDSYSTEMS.PLANIGNV2',
        format: 'image/png',
      }),

    SwissTopo: L.tileLayer.wms(
      'https://wms.geo.admin.ch/?', {
        layers: 'ch.swisstopo.pixelkarte-farbe',
        format: 'image/jpeg',
        attribution: '<a href="https://map.geo.admin.ch/">SwissTopo</a> | ' +
          '<a href="https://prod-swishop-s3.s3.eu-central-1.amazonaws.com/2022-04/symbols_fr_0.pdf">Légende</a>',
        maxZoom: 18,
      }),
    Espagne: new IGNTileLayer(
      'https://www.ign.es/wmts/mapa-raster?', {
        layer: 'MTN',
        style: 'default',
        tilematrixset: 'GoogleMapsCompatible',
      }, {
        attribution: '<a href="https://www.ign.es/">Instituto Geográfico Nacional</a>'
      }),

    'Photo Maxar': L.tileLayer.wms(
      'https://api.mapbox.com/v4/mapbox.satellite/{z}/{x}/{y}@2x.webp?access_token=' + layerKeys.mapbox, {
        maxZoom: 22,
        attribution: '<a href="https://www.mapbox.com/"> Mapbox</a>',
      }),
    'Photo IGN': new IGNTileLayer(
      'https://data.geopf.fr/wmts?', {
        layer: 'ORTHOIMAGERY.ORTHOPHOTOS',
      }),
    'Photo ArcGIS': L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 19,
        attribution: '<a href="https://www.arcgis.com/"> ArcGIS (Esri)</a>',
      }),
    'Photo Google': L.tileLayer(
      'https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
        maxZoom: 22,
        attribution: '<a href="https://www.google.com/maps"> Google</a>',
      }),
  };
}

// Couche overlay sélectionnable
/* eslint-disable-next-line no-unused-vars */
const coucheItineraires = L.tileLayer(
  'https://tile.waymarkedtrails.org/hiking/{z}/{x}/{y}.png', {
    maxZoom: 18,
    //TODO BUG Zindex : ne s'affiche pas sur Espagne, photo maxar & photo Google
  });

/************************
 * COUCHES VECTORIELLES *
 ************************/
/* eslint-disable-next-line no-unused-vars */
const couchesIconesWRI = {
    'Cabane non gardée': [7, 'cabane'],
    'Refuge gardé': [10, 'cabane_red'],
    'Gîte d\'étape': [9, 'cabane_green'],
    'Abri naturel': [29, 'abri-naturel'],
    'Point d\'eau': [23, 'pointdeau'],
    'Passage délicat': [3, 'triangle_a33.10'],
    'Bâtiment à investiguer': [28, 'cabane_white_black_a63'],
  },
  typesPointsParDefaut = '7,9,10',

  /* eslint-disable-next-line no-unused-vars */
  couchesOverpass = {
    'hôtel': '["tourism"~"hotel|guest_house|chalet|hostel|apartment"]',
    'camping': '["tourism"="camp_site"]',
    'point d\'eau': '["natural"="spring"]({{bbox}});nwr["amenity"="drinking_water"]',
    'ravitaillement': '["shop"~"supermarket|convenience"]',
    'parking': '["amenity"="parking"]["access"!="private"]',
    'bus': '["highway"="bus_stop"]',
  };

// Récupération de la mémorisation des sélecteurs de couches
if (typeof sessionStorage.checkedPoints !== 'string')
  sessionStorage.checkedPoints = localStorage.checkedPoints || // de la dernière session
  typesPointsParDefaut; // par défaut //TODO récupèrer celui de includes/config.php

if (typeof sessionStorage.checkedPolygons !== 'string')
  sessionStorage.checkedPolygons = localStorage.checkedPoints || // de la dernière session
  ''; // par défaut

// Vector layer with bbox & cluster 
class GeoJonAjaxBboxLayer extends L.MarkerClusterGroup {
  constructor(url, options) {
    super({
      spiderfyOnMaxZoom: true, // Overlapping markers will spiderfy when clicked
      showCoverageOnHover: false, // Hides the cluster bounds polygon
      maxClusterRadius: 30, // Règle le nombre de points versus clusters
    });

    this._url = url;
    this._opt = options;
  }

  fetchData(options) {
    // Change the url if called from outside
    if (options)
      this._opt = {
        ...this._opt,
        ...options,
      };

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

/* eslint-disable-next-line no-unused-vars */
class ClusterPointsWri extends GeoJonAjaxBboxLayer {
  // On en fait une classe car on doit étendre une classe Leaflet

  constructor(options) {
    const url = options.serveurAPI + '/api/' + (options.massif ? 'massif' : 'bbox') +
      '?nb_points=all' + //TODO masquage de la couche si limite de points atteinte
      (options.typePoints ? '&type_points=' + options.typePoints : '') +
      (options.massif ? '&massif=' + options.massif : '') +
      (options.version ? '&version=' + options.version : '') +
      '&cache=' + 7 * 24 * 3600 +
      (document.documentElement.lang === 'fr' ? '' : '&langue=' + document.documentElement.lang);
    //TODO Les nouvelles cartes leaflet ne font pas appel à la clusterisation serveur, trop spécifique et complexe à mettre en oeuvre. On pourait la supprimer de l'API.

    super(url, {
      ...options,

      // Icônes
      pointToLayer: (feature, latlng) =>
        L.marker(latlng, {
          icon: L.icon({
            iconUrl: options.serveurAPI + '/images/icones/' + feature.properties.type.icone + '.svg',
            iconSize: [24, 24],
            iconAnchor: [12, 12],
          }),
        }),

      onEachFeature: (feature, layer) => {
        // Etiquettes
        if (options.etiquette)
          layer.bindTooltip(
            feature.properties.nom, {
              permanent: true,
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
    });
  }
}

/* eslint-disable-next-line no-unused-vars */
class CouchePolygonesWri extends GeoJonAjaxBboxLayer {
  constructor(options) {
    super(options.serveurAPI + '/api/polygones?' +
      'type_polygon=' + options.typeId +
      (options.massif ? '&massif=' + options.massif : '') +
      (options.intersection ? '&intersection=' + options.intersection : '') +
      '&cache=' + (7 * 24 * 3600), {
        style: (feature) => ({
          stroke: false,
          color: feature.properties.couleur,
          ...options.featureStyle,
        }),

        onEachFeature: (feature, layer) => {
          // Etiquettes
          if (options.etiquettes)
            layer.bindTooltip(
              feature.properties.nom
              .replaceAll(/ ([a-z]?[a-z]?[a-z]) /gui, ' $1&nbsp;')
              .replaceAll(/ /gu, '<br/>'), {
                permanent: true,
                direction: 'center',
              }).openTooltip();
          //TODO étiquette au survol
          //TODO BUG affiche les étiquettes à l'init et pas aprés

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
        ...options,
      });
  }
}

// Mémorise le n° de type des point sélectionnés
/* eslint-disable-next-line no-unused-vars */
function checklayerSelector(typesPoints, callback) {
  const inputEls = document.querySelectorAll('.leaflet-control-layers-overlays input[type=checkbox]');

  function selecteurInputChanged() {
    // Récupère la liste des id de types de points sélectionnés dans le sélecteur d'overlays
    const checkedPoints = Array.from(inputEls) // Tous les checkbox
      .filter((el) => el.checked) // qui sont sélectionnés
      .map((el) => typesPoints // Reprend la liste des types de points
        .filter((type) => el.parentElement.innerHTML.includes(type.icone + '.svg')) // Celui qui a la même icône
        .map((type) => type.id) // Récupère l'id du type
        .join(',')) // Ferme proprement
      .filter(Boolean) // Filtre les lignes vides
      .join(','); // En fait un string

    console.log(checkedPoints); //DCMM
    if (typeof callback === 'function')
      callback(checkedPoints);
  }

  for (const el of inputEls)
    el.addEventListener('change', selecteurInputChanged);
}