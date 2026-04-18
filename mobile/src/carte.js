/* global L, MyLeafletGpsCompass, serveurAPI, baseLayers */

/*******************************
 * Gestion de la carte Leaflet *
 *******************************
  L'application est constituée d'une page unique, chargée lors du lancement.
  La carte reste ouverte dans un <div id="map> pour toutes les vues de l'appli (carte, fiche, ...)
  seules sont modifiées la taille du DIV et la position lon/lat
*/

/************************
 * Couches vectorielles *
 ************************
  Une icône est une image .png représentant un type de point
  Un point est défini par un position, un nom et une icône destinée à être affiché sur une carte
  Une fiche contient toutes les informations concernant un point, y compris les commentaires
*/

// json est une structure contenant des définitions de points
// geoJson sa représentation en string

//BEST générer le html des sélecteurs à partir d'une liste de type => nom_icone
//BEST séparer plusieurs layers par type de point avec un cluster global
// Couche affichant tous les points
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

function affichePoints(geoJson) {
  const json = JSON.parse(geoJson || '{"type":"FeatureCollection","features":[]}');

  if (json.features.length) {
    // Filtre les types de points suivant le sélecteur de la carte
    const typesPointsVisibles = Array.from(
        document.querySelectorAll('#selecteur a')
      ).filter((el) =>
        el.classList.contains('selected')
      ).map((el) => parseInt(el.id, 10)),

      filteredPoints = json.features
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
  new MyLeafletGpsCompass({
    autoCenter: true,
    autoActive: true,
    style: {
      radius: 25,
      color: 'blue',
    },
  }),
  new L.Control.Geocoder({
    position: 'topleft',
  }),
].map(e => e.addTo(map));

// Initialise les points s'il y en a de mémorisés
affichePoints(localStorage.pointsGeoJson);

// Mémorise la position de la carte
map.on('moveend', () => {
  const pos = map.getCenter();

  console.info('MAP moveend');

  // Le permalink est mémorisé dans la mémoire permanente de l'explorateur localStorage
  localStorage.permalink = [map.getZoom(), pos.lat, pos.lng].map(f => Math.round(f * 1000) / 1000).join('/');

  // Le permalink est un #hash ajouté à la page carte uniquement
  //BEST permalink baseLayer
  if (document.body.className === 'carte')
    location.hash = localStorage.permalink;
});