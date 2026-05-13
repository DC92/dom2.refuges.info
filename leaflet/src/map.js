/* global L, GpsCompas, tileLayers, vectorLayers, vectorCluster */

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
//TODO recherche de points

/******************************
 * Initialisation de la carte *
 ******************************/
const map = L.map('map');

new L.Control.Fullscreen().addTo(map);

L.control.scale({
  imperial: false,
}).addTo(map);

new GpsCompas({
  autoCenter: true,
}).addTo(map);

new L.Control.Geocoder({
  position: 'topleft',
}).addTo(map);

console.info('MAP init');

Object.values(tileLayers)[0].addTo(map); // Fond de carte par défaut

// Couches vectorielle contrôlées par le sélecteur
vectorCluster.addTo(map);

// Layer switcher
L.control.layers(tileLayers, vectorLayers).addTo(map);

// Mémorisation des couches sélectionnées
const memCheckedLayers = (localStorage.checkedLayers || Object.keys(vectorLayers)[0]).split(',');

['load', 'baselayerchange', 'overlayadd', 'overlayremove'].forEach((type) => {
  map.on(type, (evt) => {
    console.log(evt); //DCMM

    const lsControls = evt.target.getContainer().getElementsByClassName('leaflet-control-layers-selector'),
      checkedLayers = [];

    for (const lsInputEl of lsControls) {
      const titre = lsInputEl.parentElement.lastChild.innerText;

      // Restaure les couches précédentes
      //TODO n'affiche pas les couches dans le cluster
      if (evt.type === 'load' && memCheckedLayers.includes(titre))
        lsInputEl.click();

      // Mémorise les couches actuelles
      if (lsInputEl.checked)
        checkedLayers.push(titre);
    }

    localStorage.checkedLayers = checkedLayers.join(',');
  });
})

// Permalink
//TODO permalink baseLayer
map.on('moveend', () => {
  const pos = map.getCenter();

  console.info('MAP moveend');

  // Le permalink est mémorisé dans la mémoire permanente de l'explorateur localStorage
  localStorage.permalink = [map.getZoom(), pos.lat, pos.lng].map(f => Math.round(f * 10000) / 10000).join('/');

  // Le permalink est un #hash ajouté à la page carte uniquement
  if (document.body.className === 'carte')
    location.hash = localStorage.permalink;
});