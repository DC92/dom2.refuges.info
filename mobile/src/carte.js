/* global L, serveurAPI, currentPosition:writable, idbKeyval */

/*******************************
 * Gestion de la carte Leaflet *
 *******************************
  L'application étant constituée d'une page unique, chargée lors du lancement de l'applacation,
  la carte reste ouverte dans un élément <div id="map> pour toutes les variantes d'affichage de l'appli (carte, fiche, ...)
  seules sont modifiées la visibilité et la taille du DIV et la position de la vue de la carte
*/

/*******************
 * Couches tuilées *
 *******************/
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

/************************
 * Couches vectorielles *
 ************************/
// Icônes
const iconesLayer = L.geoJson(null, {
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
        // Positionne la carte sur le point
        map.setView([feature.geometry.coordinates[1], feature.geometry.coordinates[0]], 15);
        //TODO BUG doit realculer la vue quand change les dimensions css

        // Affiche la vue fiche
        location.hash = feature.id;
        //TODO Montre les donnés d'entête de la fiche qui sont disponibles dans l'API bbox
      },
    });
  },
});

// Affichage des clusters et des icones
const clustersLayer = new L.MarkerClusterGroup();

/* eslint-disable-next-line no-unused-vars */
function afficheIcones(geoJson) {
  if (geoJson) {
    clustersLayer.removeLayer(iconesLayer);
    iconesLayer.clearLayers();
    iconesLayer.addData(JSON.parse(geoJson));
    clustersLayer.addLayer(iconesLayer);
  }
}

/******************************
 * Initialisation de la carte *
 ******************************/
const // hash = location.hash.replace('#', ''),
  //hashs =  hash.split('/').map((v)=>parseFloat (v)),
  map = L.map('map');

console.info('MAP init');

// Ajout de controles et couches à la carte
[
  Object.values(baseLayers)[0], // Fond de carte par défaut
  clustersLayer, // Couche vectorielle
  L.control.layers(baseLayers), // Layer switcher

  L.control.scale({
    imperial: false,
  }),
  new L.Control.Gps({
    autoCenter: true,
  }),
  new L.Control.Geocoder({
    position: 'topleft',
  }),
].map(e => e.addTo(map));

// Mémorise la position de la carte
map.on('moveend', () => {
  const pos = map.getCenter();

  console.info('MAP moveend');

  // Mémorisation de la position
  currentPosition = [pos.lng, pos.lat, map.getZoom()].map(f => Math.round(f * 1000) / 1000);
  idbKeyval.set('currentPosition', currentPosition);

  // Le permalink est un #hash ajouté à la page carte uniquement et mémorisé dans indexedDB
  if (document.body.className === 'carte')
    location.hash = currentPosition.join('/');
});

// Memorise les fiches autour de la position
map.on('moveend', () => {
  // Coordonnées de la dalle bbox contenant la position
  const fichesTileSize = 0.25, // ° lon / lat
    xy = Object.values(map.getCenter()).map(a => Math.round(a / fichesTileSize));

  for (let x = 0; x < 2; x++)
    for (let y = 0; y < 2; y++) {
      const url = serveurAPI +
        '/api/bbox?detail=avec_commentaires&format_texte=html&nb_points=all&bbox=' + [xy[1] + y - 1, xy[0] + x - 1, xy[1] + y, xy[0] + x]
        .map((a) => a * fichesTileSize)
        .join(',');

      console.log(url); //DCMM

      /* //TODO Si les fiches de la bbox ne sont pas déjà stockés dans IndexedDB
            //
            if (!preLoadedEntries[bboxString])
              await preLoadFiches(serveurAPI + //TODO REDO
                '/api/bbox?detail=complet&format_texte=html&nb_points=all&bbox=' + bboxString
              );
      */

      fetch(url)
        .then(response => response.json())
        .then(geoJson => {
          const fichesAMeroriser = [];

          geoJson.features.forEach(feature => {
            fichesAMeroriser[feature.id] = feature.properties;
          });
          console.log(fichesAMeroriser); //DCMM

          // Enregistre les propriétés des fiches
          if (fichesAMeroriser.length)
            idbKeyval.setMany(fichesAMeroriser.map((v, k) => [k, v]));

          //TODO marquer dans idbKeyval que cette bbox est déjà traitée
        });
    }
});