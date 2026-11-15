/* global GeoJsonAjaxBboxLayer, IGNTileLayer, MarkerCompass */
/* eslint-disable-next-line no-unused-vars */
/* global positionMemoryArray:writable */

/*************************************************
 * Ce fichier contient les paramètrages et       *
 * fonctions communes aux cartes de refuges.info *
 *************************************************/

/**********************************
 * POSITION ET COUCHES PAR DÉFAUT *
 **********************************/
const positionParDefaut = '5/46/5',
  typesPointsParDefaut = '7,9,10',
  polygonesParDefaut = '1,10'; //DCMM

sessionStorage.positionMemory ||= // Mémoire en cours de session
  localStorage.positionMemory || // En début de session, on repart de la position de la dernière session
  positionParDefaut; // S'il n'y a aucune donnée enregistrée
positionMemoryArray = sessionStorage.positionMemory.split('/'); // Pour usage au cours de la durée de vie de la page.

sessionStorage.points ||= localStorage.points || typesPointsParDefaut;
sessionStorage.polygones ||= localStorage.polygones || polygonesParDefaut;

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
// Couches de points définies par /controleurs/*.php / $types_points
// Couches de points définies par /controleurs/*.php / $types_polygones

/* eslint-disable-next-line no-unused-vars */
const couchesOverpass = {
  'hôtel': '["tourism"~"hotel|guest_house|chalet|hostel|apartment"]',
  'camping': '["tourism"="camp_site"]',
  'point d\'eau': '["natural"="spring"]({{bbox}});nwr["amenity"="drinking_water"]',
  'ravitaillement': '["shop"~"supermarket|convenience"]',
  'parking': '["amenity"="parking"]["access"!="private"]',
  'bus': '["highway"="bus_stop"]',
};

/***********************************************************
 * FONCTIONS COMMUNES AUX CARTES DES PAGES DE REFUGES.INFO *
 ***********************************************************/

/***************************************************************
 * couche vectorielle de points refuges.info                   *
 * à partir de l'API, en mode BBOX et regroupement en clusters *
 * Options de l'API : serveurAPI, typePoints, massif, version  *
 *   etiquette: affiche le nom du point                        *
 *   clic: clic redirige vers la page du point                 *
 *   ...options de GeoJsonAjaxBboxLayer                        *
 ***************************************************************/
/* eslint-disable-next-line no-unused-vars */
class ClusterPointsWri extends GeoJsonAjaxBboxLayer {
  // On en fait une classe car on doit étendre une classe Leaflet
  //DCMM TODO ne pas appeler l'API si &type_points=&bbox

  constructor(options) {
    const url = options.serveurAPI + '/api/' + (options.massif ? 'massif' : 'bbox') +
      '?nb_points=all' + //TODO masquage de la couche si limite de points atteinte
      (options.typePoints ? '&type_points=' + options.typePoints : '') +
      (options.massif ? '&massif=' + options.massif : '') +
      (options.version ? '&version=' + options.version : '') +
      (document.documentElement.lang === 'fr' ? '' : '&langue=' + document.documentElement.lang);

    super(url, {
      onEachFeature: (feature, layer) => {
        // Etiquettes
        if (options.etiquette)
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
            iconUrl: options.serveurAPI + '/images/icones/' + feature.properties.type.icone + '.svg',
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
 * Options de l'API : serveurAPI, typePoints, massif, version     *
 *   etiquette: affiche le nom du point                           *
 *   clic: clic redirige vers la page du point                    *
 *   layer : {options de GeoJsonAjaxBboxLayer }                   *
 ******************************************************************/
/* eslint-disable-next-line no-unused-vars */
class CouchePolygonesWri extends GeoJsonAjaxBboxLayer {
  //TODO ?? option etiquette
  constructor(options) {
    const url = options.serveurAPI + '/api/polygones?' +
      'type_polygon=' + options.typeId + //TODO typeId => typePolygon ??
      (options.massif ? '&massif=' + options.massif : '') +
      (options.intersection ? '&intersection=' + options.intersection : '');

    super(url, {
      onEachFeature: (feature, layer) => {
        // Etiquettes
        if (options.etiquettes)
          layer.bindTooltip(
            feature.properties.nom
            .replaceAll(/ ([a-z]?[a-z]?[a-z]) /gui, ' $1&nbsp;')
            .replaceAll(/ /gu, '<br/>'), {
              //TODO BUG affiche les étiquettes à l'init et pas aprés
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

/******************************************************************
 *                           *
 ***************************************************************/
/* eslint-disable-next-line no-unused-vars */
class ControlOverlaysLayers extends L.control.layers {
  constructor(overlaysCategories, argumentsApiWri, idPolygoneFiltre) {
    const overlays = {};
    console.log(overlaysCategories); //DCMM

    for (const [cat, ovl] of Object.entries(overlaysCategories))
      //{
      //console.log(cat);//DCMM
      //console.log(ovl);//DCMM
      for (const [i, type] of Object.entries(ovl)) {
        //console.log(i);//DCMM
        //console.log(type);//DCMM

        const titre = (type.icone ?
            '<img src="/images/icones/' + type.icone + '.svg"> ' :
            '') +
          type.nom_traduit;

        overlays[titre] = type.layer ||
          // Couche invisible sélectionnée pour récupérer l'état de la coche
          L.circle([0, 0], {
            stroke: false,
          });
      }
    /* switch(cat){
       case'points':
            // Couche invisible sélectionnée pour récupérer l'état de la coche
     overlays[titre]=        L.circle([0, 0], {          stroke: false,         });
       break;
       
       case'polygones':
     overlays[titre]=   new CouchePolygonesWri({
          ...argumentsApiWri,
          typeId: type.id,
        })        ; }  */
    // }

    // Déclare le contrôle
    super(null, overlays);

    // Intercepte la méthode pour attendre que les éléments du sélecteur soient créés
    this.addTo = function(map) {
      L.Control.Layers.prototype.addTo.call(this, map);

      // Cluster des points sélectionnés
      const pointsWri = new ClusterPointsWri({
        ...argumentsApiWri,
        massif: idPolygoneFiltre,
        optionalParameter: '&type_points=' + sessionStorage.points, // A mofifier dynamiquement
      }).addTo(map);

      /*
console.log(overlaysCategories.polygones);//DCMM
console.log(sessionStorage.polygones.split(','));//DCMMMM
// Affichage des polygones sélectionnés
for (const [i, cat] of Object.entries(overlaysCategories.polygones)){
console.log(cat.id);//DCMM
console.log(typeof cat.id);//DCMM
  if(sessionStorage.polygones.split(',').includes(cat.id.toString()))
    cat.layer.addTo(map);
console.log(cat.layer);//DCMM
                     }*/

      // Insére un listener dans tous les contrôles du sélecteur d'overlays
      const inputEls = document.querySelectorAll('.leaflet-control-layers-overlays input[type=checkbox]');

      for (const elInput of inputEls)
        elInput.addEventListener('change', () => {
          // Liste des cases cochées
          const selectedInputsHTML = Array.from(
              document.querySelectorAll('.leaflet-control-layers-overlays input[type=checkbox]')
            ).filter((el) => el.checked)
            .map((el) => el.parentElement.innerHTML);

          console.log(selectedInputsHTML); //DCMM

        });
    }
  }
}



/////////////////////
// Récupère la liste des id de types de points sélectionnés dans le sélecteur d'overlays
/*
const checkedPoints = Array.from(inputEls) // Tous les checkbox
  .filter((el) => el.checked) // qui sont sélectionnés
  .map((el) =>
    typesPoints // Reprend la liste des types de points
    .filter((type) => el.parentElement.innerHTML.includes(type.icone + '.svg')) // Celui qui a la même icône
    .map((type) => type.id) // Récupère l'id du type
    .join(',') // Ferme proprement (en principe, c'est un tableau de 1)
  ).join(','); // En fait un string

if (typeof callback === 'function')
  callback(checkedPoints);*/
/*
    for (const [i, type] of Object.entries(typeGeometrie)) {//TODO simplifier
console.log(arguments);//DCMM
    }
      const titre = (type.icone ? '<img src="/images/icones/' + type.icone + '.svg"> ' : '') +
        type.nom_traduit,
        layer = type.layer ||
        // Couche invisible sélectionnée pour récupérer l'état de a coche
        L.circle([0, 0], {
          stroke: false, 
        });
        */
/*//TODO A FAIRE PLUS TARD
      overlaysTypes[titre] = layer;
      if (checkedGeometries.split(',').includes(type.id.toString()))
        layer.addTo(map); // Affiche la couche et sélectionne l'entrée
      else
        layer.remove(); // Efface la couche et désélectionne l'entrée
      */

// Fusionne les différentes catégories pour créer le controle
/*    const overlays=Object.assign({},...Object.values(overlaysCategories));
    
  console.log(overlaysCategories);//DCMM
console.log(overlays);//DCMM
*/

/*new  ControlOverlaysLayers(  {
    points:ppppppp(typesPoints, sessionStorage.checkedPoints, map),
    polygones:ppppppp(typesPolygones, sessionStorage.checkedPolygons, map),
  }).addTo(map);*/

function ppppppp(typeGeometrie, checkedGeometries, map) {
  const overlaysTypes = {};

  for (const [i, type] of Object.entries(typeGeometrie)) { //TODO simplifier
    const titre = (type.icone ? '<img src="/images/icones/' + type.icone + '.svg"> ' : '') +
      type.nom_traduit,
      layer = type.layer ||
      // Couche invisible sélectionnée pour récupérer l'état de a coche
      L.circle([0, 0], {
        stroke: false,
      });
    /*//TODO A FAIRE PLUS TARD
          overlaysTypes[titre] = layer;
          if (checkedGeometries.split(',').includes(type.id.toString()))
            layer.addTo(map); // Affiche la couche et sélectionne l'entrée
          else
            layer.remove(); // Efface la couche et désélectionne l'entrée
          */
  }

  return overlaysTypes;
}

/***************************************************************/
/***************************************************************/
/* eslint-disable-next-line no-unused-vars */
class ControlOverlaysLayers111 extends L.control.layers {
  constructor(overlaysCategories22) {
    console.log(overlaysCategories22); //DCMM
    console.log(overlaysCategories22.points); //DCMM
    console.log(overlaysCategories22.polygones); //DCMM

    const overlaysCategories = {
      points: ppppppp(overlaysCategories22.points, sessionStorage.checkedPoints),
      polygones: ppppppp(overlaysCategories22.polygones, sessionStorage.checkedPolygons),
      //TODO polygones VS polygones
    };
    // Fusionne les différentes catégories pour créer le controle
    const overlays = Object.assign({}, ...Object.values(overlaysCategories));
    super(null, overlays);

    // Intercepte la méthode pour atendre que les éléments du sélecteur soient créés
    this.addTo = function(map) {
      L.Control.Layers.prototype.addTo.call(this, map);

      // Etablit la liste des cases cochées
      const selectedInputsHTML = Array.from(
          document.querySelectorAll('.leaflet-control-layers-overlays input[type=checkbox]')
        ).filter((el) => el.checked)
        .map((el) => el.parentElement.innerHTML);

      console.log(overlaysCategories); //DCMM

      // Parcours les catégories et les types de points de chaque catégories
      for (const [cat, ovl] of Object.entries(overlaysCategories)) {
        for (const [a, b] of Object.entries(ovl)) {
          //console.log(b);//DCMM
          //console.log(cat);//DCMM
          //console.log(ovl);//DCMM
          //console.log(selectedInputsHTML);//DCMM

          // Sélectionne la case qui correspond au type, si elle est cochée
          const checkedPoints = selectedInputsHTML
            .filter((html) => html.includes(a))
            /*
        .map((html) =>{
console.log(html);//DCMM
console.log(a);//DCMM
console.log(html.includes(a ));//DCMM
          return html;
        })
        
        <input type="checkbox" class="leaflet-control-layers-selector" checked=""><span> 
        <img src="/images/icones/cabane.svg"> cabane non gardée</span>
        <img src="/images/icones/cabane.svg"/> cabane non gardée
        
        
        .map((el) =>
          typesPoints // Reprend la liste des types de points
          .filter((type) => el.parentElement.innerHTML.includes(type.icone + '.svg')) // Celui qui a la même icône
          .map((type) => type.id) // Récupère l'id du type
          .join(',') // Ferme proprement (en principe, c'est un tableau de 1)
        )
        .join(',')
        */
            .map((e) => {
              console.log(cat); //DCMM
              console.log(ovl); //DCMM
              console.log(a); //DCMM
              console.log(b); //DCMM
              console.log(e); //DCMM
              return e;
            });

          console.log(checkedPoints); //DCMM
        }

      }
      //console.log(elInput);//DCMM

      /////////////////////////////////////////////////
      if (0)
        for (const elInput of inputEls) {
          elInput.addEventListener('change', () => {
            // Sauvegarde la sélection des couches

            // Récupère la liste des id de types de points sélectionnés dans le sélecteur d'overlays
            /*
                  const checkedPoints = Array.from(inputEls) // Tous les checkbox
                    .filter((el) => el.checked) // qui sont sélectionnés
                    .map((el) =>
                      typesPoints // Reprend la liste des types de points
                      .filter((type) => el.parentElement.innerHTML.includes(type.icone + '.svg')) // Celui qui a la même icône
                      .map((type) => type.id) // Récupère l'id du type
                      .join(',') // Ferme proprement (en principe, c'est un tableau de 1)
                    )
                    .join(',')
                    .map((e)=>{
            console.log(e);//DCMM
                    });
            */

          });
        }
    };
  }
}

// Mémorise le n° de type des point sélectionnés
//TODO remonter dans myleaflet.js
/* eslint-disable-next-line no-unused-vars 
function checklayerSelector(typesPoints, callback) {
  //TODO attendre que le sélecteur soit déclaré
  const inputEls = document.querySelectorAll('.leaflet-control-layers-overlays input[type=checkbox]');
 
  for (const elInput of inputEls)
    elInput.addEventListener('change', () => {
      // Récupère la liste des id de types de points sélectionnés dans le sélecteur d'overlays
      const checkedPoints = Array.from(inputEls) // Tous les checkbox
        .filter((el) => el.checked) // qui sont sélectionnés
        .map((el) =>
          typesPoints // Reprend la liste des types de points
          .filter((type) => el.parentElement.innerHTML.includes(type.icone + '.svg')) // Celui qui a la même icône
          .map((type) => type.id) // Récupère l'id du type
          .join(',') // Ferme proprement (en principe, c'est un tableau de 1)
        ).join(','); // En fait un string

      if (typeof callback === 'function')
        callback(checkedPoints);
    });
}*/