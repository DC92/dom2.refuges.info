/* global L, tileLayers, clustersLayer, overlays, affichePoints */

/*******************************
 * Gestion de la carte Leaflet *
 *******************************
  L'application est constituée d'une page unique, chargée lors du lancement.
  La carte reste ouverte dans un <div id="map> pour toutes les vues de l'appli (carte, fiche, ...)
  seules sont modifiées la taille du DIV et la position lon/lat
*/

/* Modif leaflet-src.js à ajouter lors de chaque mise à jour
//TODO modif automatique ???
		this._map.locate({
 			timeout: 300000, //DCMM 5 minutes
*/

/******************************
 * Marqueur orientable du GPS *
 ******************************/
const iconMarker = L.icon({ // Icône sans orientation
    iconUrl: 'images/gpsmarker.svg',
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  }),
  iconCompas = L.icon({ // Icône orientée
    iconUrl: 'images/gpscompas.svg',
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  }),
  gpsMarker = L.marker([0, 0], {
    icon: iconMarker,
  });

window.addEventListener('deviceorientationabsolute', (evt) => {
  if (gpsMarker._icon && evt.alpha) { // If gps enabled
    const transform = gpsMarker._icon.style.transform.match(/[a-z][^)]*/gu),
      angle = 45 - parseInt(evt.alpha, 10);

    // La première fois, changement de l'icône et ajout de l'orientation
    if (transform.length === 1) {
      gpsMarker.setIcon(iconCompas);
      gpsMarker._icon.style.transformOrigin = 'center';
    }
    gpsMarker._icon.style.transform = transform[0] + ') rotateZ(' + angle + 'deg)';
    //TODO BUG compas bouge quand zoom
  }
});

/******************************
 * Initialisation de la carte *
 ******************************/
const map = L.map('map');

console.info('MAP init');

// Ajout de controles et couches à la carte
[
  Object.values(tileLayers)[0], // Fond de carte par défaut
  clustersLayer, // Couche vectorielle
  L.control.layers(tileLayers, overlays), // Layer switcher

  L.control.scale({
    imperial: false,
  }),
  new L.Control.Gps({
    autoCenter: true,
    marker: gpsMarker,
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