/* global L, serveurAPI, idbKeyval */

/*******************************
 * Gestion de la carte Leaflet *
 *******************************
  L'application est constituée d'une page unique, chargée lors du lancement.
  La carte reste ouverte dans un <div id="map> pour toutes les vues de l'appli (carte, fiche, ...)
  seules sont modifiées la taille du DIV et la position lon/lat
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
 ************************
  Une icône est une image .png représentant un type de point
  Un point est défini par un position, un nom et une icône destinée à être affiché sur une carte
  Une fiche contient toutes les informations concernant un point, y compris les commentaires
*/

// globalPointsJson est une variable javascript, dbPointsJson son enregistrement dans indexDB
// json est une structure contenant des définitions de points, geoJson sa représentation en string

let globalPointsJson = {};

// Couche affichant tous les points de la base refuges.info
const pointsLayer = L.geoJson(null, {
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

// Couche gérant les clusters
const clustersLayer = new L.MarkerClusterGroup();

function affichePoints() {
  if (globalPointsJson) {
    // Filtre les types de points suivant sélecteur de la carte
    const typesPointsVisibles = Array.from(
        document.querySelectorAll('#selecteur a')
      ).filter((el) =>
        el.classList.contains('selected')
      ).map((el) => parseInt(el.id, 10)),

      filteredPoints = globalPointsJson.features
      .filter((features) =>
        typesPointsVisibles.includes(features.properties.type.id)
      );

    // Vide la couche contenant les points, la détache et rattache à la couche gérant les clusters
    clustersLayer.removeLayer(pointsLayer);
    pointsLayer.clearLayers();
    pointsLayer.addData(filteredPoints);
    clustersLayer.addLayer(pointsLayer);
  }
}

/******************************
 * Initialisation de la carte *
 ******************************/
const map = L.map('map');

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

  // Le permalink est mémorisé dans la variable permanente de l'explorateur localStorage
  localStorage.permalink = [map.getZoom(), pos.lat, pos.lng].map(f => Math.round(f * 1000) / 1000).join('/');

  // Le permalink est un #hash ajouté à la page carte uniquement
  if (document.body.className === 'carte')
    location.hash = localStorage.permalink;

  //TODO permalink baseLayer
});

// Affiche les points mémorisés dans indexBD

//console.info('idbKeyval.get dbPointsJson'); //DCMM
idbKeyval.get('dbPointsJson')
  //.finally(() => console.info('END idbKeyval.get dbPointsJson')) //DCMM
  .catch(er => console.error(er))
  .then((dbPointsJson) => {
    globalPointsJson = dbPointsJson;
    affichePoints();
  });

// Redemande tous les points au serveur
//TODO tester si présent sur le serveur et depuis
const apiUrl = serveurAPI + '/api/bbox?nb_points=all&detail=icone';

fetch(apiUrl)
  .then((response) => response.text())
  .catch(er => console.error(er + ' fetching ' + apiUrl))
  .then((geoJson) => {
    globalPointsJson = JSON.parse(geoJson);

    //TODO précharger toutes les icônes citées
    // Affiche ou réaffiche les points reçus
    affichePoints();

    // Les enregistre à la place des des précédents dans indexDB
    //console.info('idbKeyval.set dbPointsJson'); //DCMM
    idbKeyval.set('dbPointsJson', globalPointsJson)
      //.finally(() => console.info('END idbKeyval.set dbPointsJson')) //DCMM
      .catch(er => console.error(er));
  });