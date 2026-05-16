/* global L, GpsCompas, tileLayersCollection, wriMassifsLayer, wriPOILayer */

/* eslint-disable-next-line no-unused-vars */
function initMap(mapId, serveurAPI, kays) {
  console.info('MAP init');

  /*****************************
   * Initialisation de la carte *
   *****************************/
  const map = L.map(mapId);

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

  /**************************************************
   * Couches vectorielle contrôlées par le sélecteur *
   **************************************************/
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
      //TODO étiquette opaque sur page accueil WRI
      //TODO effacer les étiquettes au delà d'un certain zoom
      //TODO afficher les étiquettes au survol
      //TODO click sur un massif
    },
    // Groupe utilisé par le layerswitcher
    vectorCluster = L.markerClusterGroup().addTo(map);

  for (const type in wriTypesPoints)
    vectorLayers[wriTypesPoints[type]] =
    L.featureGroup.subGroup(vectorCluster).addLayer(
      wriPOILayer(serveurAPI, type)
    );

  /***************************
   * Fond de carte par défaut *
   ***************************/
  const tileLayers = tileLayersCollection(kays);

  Object.values(tileLayers)[0].addTo(map);

  /******************
   * Layer switcher *
   *****************/
  L.control.layers(tileLayers, vectorLayers).addTo(map);

  /*****************************************
   * Mémorisation des couches sélectionnées *
   *****************************************/
  const memCheckedLayers = (localStorage.checkedLayers || Object.keys(vectorLayers)[0]).split(',');

  ['load', 'baselayerchange', 'overlayadd', 'overlayremove']
  .forEach((type) => {
    map.on(type, (evt) => {

      const lsControls = evt.target.getContainer()
        .getElementsByClassName('leaflet-control-layers-selector'),
        checkedLayers = [];

      for (const lsInputEl of lsControls) {
        const titre = lsInputEl.parentElement.lastChild.innerText;

        // Restaure les couches précédentes
        //TODO n'affiche pas les couches dans le cluster
        if (evt.type === 'load' && memCheckedLayers.includes(titre)) {
          setTimeout(() => lsInputEl.click(), 500);

          //console.log(vectorLayers[titre.substring(1)]); //DCMM
          //vectorLayers[titre.substring(1)].onAdd
        }

        // Mémorise les couches actuelles
        if (lsInputEl.checked)
          checkedLayers.push(titre);
      }

      localStorage.checkedLayers = checkedLayers.join(',');
    });
  })

  /************
   * Permalink *
   ************/
  //TODO permalink baseLayer
  map.on('moveend', (evt) => {
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

  return map;
}