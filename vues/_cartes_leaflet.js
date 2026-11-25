/* global ClusterPointsWri, IGNTileLayer, CouchePolygonesWri, MarkerCompass */
/* eslint-disable-next-line no-unused-vars */
/* global positionMemoryArray:writable */

/*************************************************
 * Ce fichier contient les paramètrages et       *
 * fonctions communes aux cartes de refuges.info *
 *************************************************/

/**********************************
 * POSITION ET COUCHES PAR DÉFAUT *
 **********************************/
const positionParDefaut = '5/46/5', // Zoom/lat/lon
  typesPointsParDefaut = '7,9,10', // Cabanes, ...
  typePolygonesParDefaut = '', // Massifs, ...
  typeTilesOverlaysParDefaut = ''; // Itinéraires, ...

sessionStorage.positionMemory ||= // Mémoire en cours de session
  localStorage.positionMemory || // En début de session, on repart de la position de la dernière session
  positionParDefaut; // S'il n'y a aucune donnée enregistrée

positionMemoryArray = sessionStorage.positionMemory.split('/'); // Pour usage au cours de la durée de vie de la page.

if (typeof sessionStorage.points === 'undefined') { // Mémoire de la session courante
  // Teste le type pour ne pas confondre pas de valeurs et une sélection vide
  if (typeof localStorage.points === 'string')
    sessionStorage.points = localStorage.points; // Mémoire de la session précédente
  else
    sessionStorage.points = typesPointsParDefaut;
}

if (typeof sessionStorage.polygones === 'undefined') {
  if (typeof localStorage.polygones === 'string')
    sessionStorage.polygones = localStorage.polygones;
  else
    sessionStorage.polygones = typePolygonesParDefaut;
}

if (typeof sessionStorage.tilesOverlays === 'undefined') {
  if (typeof localStorage.tilesOverlays === 'string')
    sessionStorage.tilesOverlays = localStorage.tilesOverlays;
  else
    sessionStorage.tilesOverlays = typeTilesOverlaysParDefaut;
}

// Les couches overpass sont désactivées à chaque réchargement de page
sessionStorage.couchesOverpass = '';

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
  //DCMM TODO revoir suivant les couches de www...
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
    //DCMM TODO BUG Zindex : ne s'affiche pas sur Espagne, photo maxar & photo Google
  });

/**************************************************
 * SÉLECTEUR DE COUCHES OVERLAYS                  *
 * Déclare le sélecteur et le rattache à la carte *
 * Gére la mémorisation des couches sélectionnées *
 **************************************************/
/* eslint-disable-next-line no-unused-vars */
function addControlOverlays(
  map,
  options,
  categoriesCouches,
  idPolygoneFiltre, //DCMM TODO ????
) {
  const overlays = {}, // Liste à fournir à L.control.layers
    typeDuNom = {}; // Traduction du titre de la ligne en type_id

  for (const [cat, ovl] of Object.entries(categoriesCouches))
    for (const type of Object.values(ovl)) {
      typeDuNom[type.nom_traduit] = type;
      typeDuNom[type.nom_traduit].cat = cat;

      const titre = (type.icone ?
        '<img src="/images/icones/' + type.icone + '.svg"> ' :
        '') + type.nom_traduit;

      // Lignes du sélecteur
      switch (cat) {
        case 'points':
          // Couche invisible sélectionnable permettant de récupérer l'état de la sélection
          overlays[titre] = L.circle([0, 0], {
            stroke: false,
          });
          break;

        case 'polygones':
          overlays[titre] = new CouchePolygonesWri(
            options.serveurAPI, {
              'type_polygon': type.id,
            },
            options,
          );
          break;

        default:
          overlays[titre] = type.layer;
      }

      // Affichage des lignes sélectionnées
      if (sessionStorage[cat] && sessionStorage[cat].split(',').includes(type.id.toString()))
        overlays[titre].addTo(map);
    }

  // Sélecteur de couche
  L.control.layers(null, overlays).addTo(map);

  // Cluster des points sélectionnés
  const clusterPoints = new ClusterPointsWri(
    options.serveurAPI, {
      typePoints: sessionStorage.points, // Paramètre à mofifier dynamiquement
      massif: idPolygoneFiltre, // Si /nav/<n° massif>
    }, {}, //DCMM TODO options de la couche
  ).addTo(map);

  // Les <inputs> du sélecteur d'overlays
  const inputEls = document.querySelectorAll('.leaflet-control-layers-overlays input[type=checkbox]');

  // Insére un listener dans tous les contrôles du sélecteur d'overlays
  for (const elInput of inputEls) {
    elInput.addEventListener('change', () => {
      // Code exécuté lors du changement de sélection d'un overlay
      const selectionTypesId = {
        //TODO moins bidouille SVP !
        points: [],
        polygones: [],
        tilesOverlays: [],
        couchesOverpass: [], //TODO Ne pas générer d'erreur si non déclaré
      };

      // Numéros de types de points qui correspond aux lignes cochées
      sessionStorage.points = Array.from(inputEls) // Les <inputs> du sélecteur d'overlays
        .filter((el) => el.checked) // Qui sont cochés
        .map((el) => el.parentElement.innerText.trim()) // Isole le titre
        .forEach((titreCase) => {
          selectionTypesId[typeDuNom[titreCase].cat]
            .push(typeDuNom[titreCase].id);
        });

      for (const cat in selectionTypesId)
        localStorage[cat] = // Mémorise pour la prochaine fenêtre
        sessionStorage[cat] = // Mémorise pour le prochain chargement de la page
        selectionTypesId[cat].join(','); // En fait une string

      // Recharge la couche points
      if (sessionStorage.points === '')
        clusterPoints.clearLayers();
      else
        clusterPoints.fetchData({
          typePoints: sessionStorage.points,
        });
    });
  }
}