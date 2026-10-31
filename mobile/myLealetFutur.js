/* DCMM FUTUR HORS RESEAU */
/* TILE LAYERS */
/* Tile preloading */
.leaflet-control-preload button {
  margin-right: 8px;
  padding: 0;
  aspect-ratio: 1;
  font-size: 20px;
  cursor: pointer;
}

//DCMM FUTUR PERMALINK
/*****************************
 * Saving the map position   *
 * Lon, lat, zoom, baselayer *
 *****************************/
// Store lon/lat/zoom/baselayer in sessionStorage 
/* eslint-disable-next-line no-unused-vars */
function permalinkControl(map, defaut) {
  /*priorités:
    defaut
    localStorage
    sessionStorage
    hash
    forcage page (position d'une fiche)
  */
  const regex = /#?([0-9.]+)\/([0-9.]+)\/([0-9.]+)\/?(.*)/u;

  const prio2 = (localStorage.permalink || sessionStorage.permalink || defaut || '6/2/47');
  console.log(prio2); //DCMM
  const prio = prio2.match(regex);
  console.log(prio); //DCMM
  console.log(location.hash); //DCMM
  const hashmatch = location.hash.match(regex);
  console.log(hashmatch); //DCMM
  prio.fill(...hashmatch); // Écrase les index 1, 2 et 3 par 0
  console.log(prio); //DCMM

  /*****************************************
   * Position et couche de fond par défaut *
   *****************************************/
  localStorage.permalink ||= '5/46.5/5'; // S'il n'y a aucune donnée enregistrée
  sessionStorage.permalink ||= localStorage.permalink; // En début de session, on repart de la dernière position
  let permalinkArray = sessionStorage.permalink.split('/'); // Pour usage au cours de la durée de vie de la page.

  ['baselayerchange', 'zoom', 'moveend'].forEach((evtName) => {
    map.on(evtName, () => {
      const baselayerSelector = document.querySelectorAll('.leaflet-control-layers-base input'),
        pos = map.getCenter();
      let baseLayerName = null;

      for (const lsInputEl of baselayerSelector)
        if (lsInputEl.checked || !baseLayerName)
          baseLayerName = lsInputEl.parentElement.lastChild.innerText.trim();

      // To restart from this position at the next map change
      permalinkArray = [
        map.getZoom().toFixed(1),
        pos.lat.toFixed(5),
        pos.lng.toFixed(5),
        encodeURI(baseLayerName),
      ];
      sessionStorage.permalink = permalinkArray.join('/');

      // To resume from the last position at the start of the next session
      const pa2 = Array.from(permalinkArray);
      pa2[0] = Math.max(5, Math.min(10, pa2[0])); // In zoom limits
      localStorage.permalink = pa2.join('/');

      // Hides labels for large scales
      map.getContainer().classList[map.getZoom() < 8 ? 'add' : 'remove']('hide-tooltips');
    });
  });

  // Loading the active basemap
  if ((sessionStorage.permalink || '').split('/')[3])
    //TODO BUG tileLayers is not defined
    /* eslint-disable-next-line no-undef */
    (tileLayers[decodeURI((sessionStorage.permalink || '').split('/')[3])]).addTo(map);

  // Initiates the loading of the map
  map.setView([permalinkArray[1], permalinkArray[2]], permalinkArray[0]);
}

//DCMM FUTUR HORS RESEAU
/****************************************
 * OpenHikingMap tile preloading button *
 ****************************************/
/* eslint-disable-next-line no-unused-vars */
const ControlPreload = L.Control.extend({
  options: {
    position: 'topleft',
  },

  onAdd(map) {
    const minZoom = 10,
      maxZoom = 16,
      edgeBuffer = 3,
      buttonDiv = L.DomUtil.create('div', 'button-wrapper leaflet-control-preload'),
      avertissement = 'Vous êtes sur le point de précharger le fond de carte OpenHikingMap ' +
      'dans un rayon de ' + (edgeBuffer + 1) + ' largeurs de la carte autour de sa position médiane ' +
      'pour les zooms ' + minZoom + ' à ' + maxZoom + '.\n' +
      'Cela peut engendrer une consommation réseau et mémoire de l\'ordre de 15 Mo.';

    buttonDiv.innerHTML = '<button title="Précharger le fond de carte OpenHikingMap">🌐</button>';
    buttonDiv.addEventListener('click', () => {
      if (confirm(avertissement)) {
        const pos = map.getCenter(),
          loadingLayer = L.tileLayer(
            'https://tile.openmaps.fr/openhikingmap/{z}/{x}/{y}.png', {
              edgeBufferTiles: edgeBuffer,
            });

        map.setZoom(minZoom);
        loadingLayer.addTo(map);

        const timer = setInterval(() => {
          if (!loadingLayer.isLoading()) {
            map.setZoom(map.getZoom() + 1);

            if (map.getZoom() > maxZoom) {
              clearInterval(timer);
              alert('Téléchargement terminé.\nRéinitialisation de la page.');

              // On affiche la couche OpenHikingMap pour ne pas qu'il y ait confusion sur quelle couche on a chargé
              sessionStorage.positionMemory = minZoom + '/' + pos.lat + '/' + pos.lng + '/OpenHikingMap';
              location.reload();
            }
          }
        }, 100);
      };
    });

    return buttonDiv;
  }
});

//DCMM Modèle de classe
/* eslint-disable-next-line no-unused-vars */
class Newclass extends L.geoJson {
  constructor() {
    super(123);
  }
}

//DCMM FUTUR
/*******************************************
 * Display GPS distance via touch on a map *
 *******************************************/