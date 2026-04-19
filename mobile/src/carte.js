/* global L, tileLayers, clustersLayer, affichePoints */

/*******************************
 * Gestion de la carte Leaflet *
 *******************************
  L'application est constituée d'une page unique, chargée lors du lancement.
  La carte reste ouverte dans un <div id="map> pour toutes les vues de l'appli (carte, fiche, ...)
  seules sont modifiées la taille du DIV et la position lon/lat
*/

/*//TODO intégrer modif leaflet-src.js
		this._map.locate({
 			timeout: 300000, //DCMM 5 minutes
*/

const icon = L.icon({
    iconUrl: 'src/gpsmarker.svg',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  }),
  marker = L.marker([0, 0], {
    icon: icon,
  }),
  protoSetPos = L.Marker.prototype._setPos;

let angle = -40;

L.Marker.include({
  _setPos: function(pos) {
    protoSetPos.call(this, pos);
    this._icon.style.transform += ' rotateZ(100deg)';
  },
});

document.onkeypress = function() {
  angle += 30;
  marker._icon.style.transform = marker._icon.style.transform.replace(/[0-9]*deg/u, angle + 'deg');
  marker.update();
};

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
    autoCenter: true,
    //autoActive: true, //DCMM
    marker: marker,
    /*marker: L.marker([0, 0], {
      icon: L.icon({
        iconUrl: 'src/gpsmarker.svg',
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      }),
    }),*/
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
  //TODO BUG le round ne positionne pas au centre quand on bouge la carte !
  localStorage.permalink = [map.getZoom(), pos.lat, pos.lng].map(f => Math.round(f * 1000) / 1000).join('/');

  // Le permalink est un #hash ajouté à la page carte uniquement
  //BEST permalink baseLayer
  if (document.body.className === 'carte')
    location.hash = localStorage.permalink;
});