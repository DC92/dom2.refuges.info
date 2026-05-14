/* global L, GpsCompas, tileLayersCollection, wriMassifsLayer, wriPOILayer */

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
/* eslint-disable-next-line no-unused-vars */
function initMap(mapId, serveurAPI, kays) {

  /******************************
   * Initialisation de la carte *
   ******************************/
  const mapObj = L.map(mapId);

  new L.Control.Fullscreen().addTo(mapObj);

  L.control.scale({
    imperial: false,
  }).addTo(mapObj);

  new GpsCompas({
    autoCenter: true,
  }).addTo(mapObj);

  new L.Control.Geocoder({
    position: 'topleft',
  }).addTo(mapObj);

  /**************************************************
  * Couches vectorielle contrôlées par le sélecteur *
  ***************************************************/
  const wriTypesPoints = {
      7: 'Cabane non gardée',
      10: 'Refuge gardé',
      9: 'Gîte d\'étape',
      29: 'Grotte',
      23: 'Point d\'eau',
      3: 'Passage délicat',
      28: 'Bâtiment en montagne',
    },
    // Tableau des couches
    vectorLayers = {
      'Massifs': wriMassifsLayer(serveurAPI),
    },
    // Groupe utilisé par le layerswitcher
    vectorCluster = L.markerClusterGroup().addTo(mapObj);

  for (const type in wriTypesPoints)
    vectorLayers[wriTypesPoints[type]] =
    L.featureGroup.subGroup(vectorCluster).addLayer(
      wriPOILayer(serveurAPI, type)
    );

  /***************************
  * Fond de carte par défaut *
  ****************************/
  const tileLayers = tileLayersCollection(kays);

  Object.values(tileLayers)[0].addTo(mapObj);

  /*****************
  * Layer switcher *
  *****************/
  L.control.layers(tileLayers, vectorLayers).addTo(mapObj);

  /*****************************************
  * Mémorisation des couches sélectionnées *
  ******************************************/
  const memCheckedLayers = (localStorage.checkedLayers || Object.keys(vectorLayers)[0]).split(',');

  ['load', 'baselayerchange', 'overlayadd', 'overlayremove']
  .forEach((type) => {
    mapObj.on(type, (evt) => {

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

  /************
  * Permalink *
  *************/
  //TODO permalink baseLayer
  mapObj.on('moveend', (evt) => {
    const pos = evt.target.getCenter();

    console.info('MAP moveend');

    // Le permalink est mémorisé dans la mémoire permanente de l'explorateur localStorage
    localStorage.permalink = [evt.target.getZoom(), pos.lat, pos.lng]
      .map(f => Math.round(f * 10000) / 10000)
      .join('/');

    // Le permalink est un #hash ajouté à la page carte uniquement
    if (document.body.className === 'carte')
      location.hash = localStorage.permalink;
  });

  console.info('MAP init');

  return mapObj;
}