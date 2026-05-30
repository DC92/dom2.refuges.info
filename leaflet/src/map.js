/* global L, GpsCompas, tileLayersCollection, wriMassifsLayer, wriPOILayer */

/* eslint-disable-next-line no-unused-vars */
function initMap(mapId, serveurAPI, keys) {
  console.info('MAP init');

  /******************************
   * Initialisation de la carte *
   ******************************/
  const map = L.map(mapId),
    permalink = localStorage.permalink.split('/');

  new L.Control.Fullscreen().addTo(map);

  L.control.scale({
    imperial: false,
  }).addTo(map);

  new L.Control.Geocoder({
    position: 'topleft',
  }).addTo(map);

  //new L.Control.Gps({
  new GpsCompas({
    autoCenter: true,
  }).addTo(map);

  map.addControl(new L.Control.Compass({
    //TODO n'afficher que quand le GPS et le capteur sont actifs
    autoActive: true,
    position: 'topleft',
  }));

  /*******************
   * Couches tuilées *
   *******************/
  const tileLayers = tileLayersCollection(keys),
    baselayer = tileLayers[permalink[3]] || Object.values(tileLayers)[0];

  baselayer.addTo(map); // Fond de carte par défaut

  /***********************
   * Couches vectorielle *
   ***********************/
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

    // Groupement des couches qui doivent être clustérisées ensembles
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

  /*****************************
   * Mémorisation des overlays *
   *****************************/
  ['load', 'overlayadd', 'overlayremove'].forEach((type) => {
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

      // Mémorisé dans la mémoire permanente de l'explorateur localStorage
      localStorage.checkedLayers = checkedLayers.join(',');

      // Cache les étiquettes pour les grandes échèles
      map.getContainer().classList[map.getZoom() < 8 ? 'add' : 'remove']('hide-tooltips');
    });
  });

  /*************
   * Permalink *
   *************/
  ['moveend', 'baselayerchange'].forEach((type) => {
    map.on(type, (evt) => {
      const baselayerSelector = document.querySelectorAll('.leaflet-control-layers-base input'),
        pos = evt.target.getCenter();
      let baseLayerName = Object.keys(tileLayers)[0];

      for (const lsInputEl of baselayerSelector)
        if (lsInputEl.checked)
          baseLayerName = lsInputEl.parentElement.lastChild.innerText.substring(1);

      localStorage.permalink = [evt.target.getZoom(), pos.lat, pos.lng]
        .map(f => Math.round(f * 10000) / 10000)
        .join('/') +
        '/' + encodeURI(baseLayerName);
    });
  });

  // Lance le chargement de la carte
  map.setView([permalink[1], permalink[2]], permalink[0]);

  return map;
}