/* global L, GpsCompas, tileLayersCollection, wriMassifsLayer, wriPOILayer */

/* eslint-disable-next-line no-unused-vars */
function initMap(mapId, serveurAPI, kays) {
  console.info('MAP init');

  /******************************
   * Initialisation de la carte *
   ******************************/
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

  /****************************
   * Fond de carte par défaut *
   ****************************/
  const tileLayers = tileLayersCollection(kays);

  Object.values(tileLayers)[0].addTo(map);

  /***************************************************
   * Couches vectorielle contrôlées par le sélecteur *
   ***************************************************/
  const vectorLayers = {
      'Massifs': wriMassifsLayer(serveurAPI),
    },
    clusteredOverlays = {
      'Cabane non gardée': 7,
      'Refuge gardé': 10,
      'Gîte d\'étape': 9,
      'Grotte': 29,
      'Point d\'eau': 23,
      'Passage délicat': 3,
      'Bâtiment en montagne': 28,
    },
    memCheckedLayers = typeof localStorage.checkedLayers === 'string' ?
    localStorage.checkedLayers.split(',') : ['Cabane non gardée', 'Refuge gardé', 'Gîte d\'étape'], // Par défaut

    // Groupe utilisé par le layerswitcher
    vectorCluster = L.markerClusterGroup().addTo(map);

  for (const [titre, typeId] of Object.entries(clusteredOverlays))
    vectorLayers[titre] =
    L.featureGroup.subGroup(vectorCluster).addLayer(
      wriPOILayer(serveurAPI, typeId)
    );

  /******************
   * Layer switcher *
   ******************/
  L.control.layers(tileLayers, vectorLayers).addTo(map);

  /*****************************************
   * Mémorisation des couches sélectionnées *
   *****************************************/
  ['load', 'baselayerchange', 'overlayadd', 'overlayremove']
  .forEach((type) => {
    map.on(type, (evt) => {
      const overlaySelectors = document.querySelectorAll('.leaflet-control-layers-overlays input'),
        checkedLayers = [];

      for (const lsInputEl of overlaySelectors) {
        const titre = lsInputEl.parentElement.lastChild.innerText.substring(1);

        // Restaure les couches précédentes
        if (evt.type === 'load' && memCheckedLayers.includes(titre)) {
          if (Object.keys(clusteredOverlays).includes(titre))
            vectorLayers[titre].eachLayer((layer) => {
              layer.on('adddata', () => lsInputEl.click());
            });
          else
            lsInputEl.click();
        }

        // Mémorise les couches actuelles
        if (lsInputEl.checked)
          checkedLayers.push(titre);
      }

      localStorage.checkedLayers = checkedLayers.join(',');
    });
  })

  /*************
   * Permalink *
   *************/
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