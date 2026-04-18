/* global L, MyLeafletGpsCompass, tileLayers, clustersLayer, affichePoints */

/*******************************
 * Gestion de la carte Leaflet *
 *******************************
  L'application est constituée d'une page unique, chargée lors du lancement.
  La carte reste ouverte dans un <div id="map> pour toutes les vues de l'appli (carte, fiche, ...)
  seules sont modifiées la taille du DIV et la position lon/lat
*/

/******************************
 * Initialisation de la carte *
 ******************************/
const map = L.map('map');

console.info('MAP init');

// Ajout de controles et couches à la carte
[
  Object.values(tileLayers)[0], // Fond de carte par défaut
  clustersLayer, // Couche vectorielle
  L.control.layers(tileLayers), // Layer switcher

  L.control.scale({
    imperial: false,
  }),
  new L.Control.Gps({
    //TODO BUG ne positionne pas au centre !
    autoCenter: true,
    autoActive: true, //DCMM
    marker: L.marker([0, 0], {
      icon: L.icon({
        iconUrl: 'src/gpsmarker.svg',
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      }),
    }),
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