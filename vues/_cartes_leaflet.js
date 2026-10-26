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
        //DCMM FUTUR HORS RESEAU edgeBufferTiles: 3,
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
const couchesIconesWRI = {
    'Cabane non gardée': [7, 'cabane'],
    'Refuge gardé': [10, 'cabane_red'],
    'Gîte d\'étape': [9, 'cabane_green'],
    'Abri naturel': [29, 'abri-naturel'],
    'Point d\'eau': [23, 'pointdeau'],
    'Passage délicat': [3, 'triangle_a33.10'],
    'Bâtiment à investiguer': [28, 'cabane_white_black_a63'],
  },

  /* eslint-disable-next-line no-unused-vars */
  couchesOverpass = {
    'hôtel': '["tourism"~"hotel|guest_house|chalet|hostel|apartment"]',
    'camping': '["tourism"="camp_site"]',
    'point d\'eau': '["natural"="spring"]({{bbox}});nwr["amenity"="drinking_water"]',
    'ravitaillement': '["shop"~"supermarket|convenience"]',
    'parking': '["amenity"="parking"]["access"!="private"]',
    'bus': '["highway"="bus_stop"]',
  };

class CouchePointsWri extends L.geoJson {
  // On en fait une classe car on doit étendre une classe Leaflet
  //TODO extends GeoJsonUrlBbox //Pb icône
  constructor(options) {
    const iconList = [],
      url = options.serveurAPI + '/api/' + (options.massif ? 'massif' : 'bbox') +
      '?nb_points=all' +
      (options.typePoints ? '&type_points=' + options.typePoints : '') +
      (options.massif ? '&massif=' + options.massif : '') +
      '&version=' + options.versionFeatures +
      '&cache=' + (7 * 24 * 3600) +
      (document.documentElement.lang === 'fr' ? '' : '&langue=' + document.documentElement.lang);
    //TODO Délai cache api / depuis

    super(null, {
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

        if (options.clic)
          layer.on('click', () => {
            location.href = feature.properties.lien || '/point/' + feature.id;
          });

        // For icons prelaod
        iconList[feature.properties.type.icone] = true;
      },
    });

    // Fetch remote data
    fetch(url)
      .catch((error) => console.error(error + ' fetching ' + url))
      .then((response) => response.json())
      .then((json) => {
        if (json.features.length) {
          this.addData(json);
          this.fire('adddata');

          // Preload icons
          //TODO don't do it twice
          for (const name in iconList)
            document.body.insertAdjacentHTML(
              'beforeend',
              '<img style="display:none" src="/images/icones/' + name + '.svg"/>'
            );
        }

        // Trigger for who needs it
        this.fire('load');
      });
  }
}

/* eslint-disable-next-line no-unused-vars */
function clusterCouchePointsWri(options) {
  // On fait une fonction car on n'a pas à étendre une classe Leaflet
  const cluster = L.markerClusterGroup({
    spiderfyOnMaxZoom: true, // Overlapping markers will spiderfy when clicked
    maxClusterRadius: 30, // Règle le nombre de points versus clusters
  });

  for (const entry of Object.entries(couchesIconesWRI)) {
    // On crée les couches pour chaque type de point
    const layer = new CouchePointsWri({
      typePoints: entry[1][0],
      ...options,
    });

    // Attente de la fin de réception pour l'intégrer au cluster
    layer.on('load', (evt) => cluster.addLayer(evt.target));
  }

  return cluster;
}

/* eslint-disable-next-line no-unused-vars */
class CouchePolygonesWri extends GeoJsonUrlBbox {
  constructor(options) {
    super(options.serveurAPI + '/api/polygones?' +
      'type_polygon=' + options.typeId +
      '&version=' + options.versionFeatures +
      '&cache=' + (7 * 24 * 3600), {
        style: (feature) => ({
          stroke: false,
          color: feature.properties.couleur,
          ...options,
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

          if (options.clic) {
            // Survol & clic
            layer.on('mouseover mouseout', (evt) => {
              evt.target.setStyle({
                stroke: evt.type === 'mouseover',
              });
            });

            layer.on('click', (evt) => {
              location.href = '/nav/' + evt.sourceTarget.feature.id;
            });
          } else
            // Remove cursor pointer on hover
            layer.on({
              mouseover: (evt) => {
                evt.target.getElement().style.cursor = 'grab';
              },
            });
        },
        ...options,
      });
  }
}