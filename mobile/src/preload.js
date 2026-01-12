/* global serveurApi */

const preLoadedTiles = JSON.parse(localStorage.preLoadedTiles || '{}'),
  preLoadedPoints = JSON.parse(localStorage.preLoadedPoints || '{}');

/* eslint-disable no-unused-vars */
async function preload() {
  console.log('preload');

  // this = map
  // Preload tiles of openhikingmap base layer
  /* eslint-disable no-invalid-this */
  const center = this.getCenter(),
    remnantTime = 30000; // Shelf life (unix milliseconds)
  let leftToFetch = 40;

  for (let ecart = 1; ecart < 6; ecart++)
    for (let zoom = 6; zoom < 16; zoom++) {
      /* eslint-disable no-invalid-this */
      const coordPX = this.project([center.lat, center.lng], zoom),
        tileX = Math.round(coordPX.x / 256),
        tileY = Math.round(coordPX.y / 256);

      for (let x = tileX - ecart; x < tileX + ecart; x++)
        for (let y = tileY - ecart; y < tileY + ecart; y++) {
          const tileRef = zoom + '/' + x + '/' + y,
            expirationDate = (preLoadedTiles[tileRef] || 0) + remnantTime,
            url = 'https://tile.openmaps.fr/openhikingmap/' + tileRef + '.png';

          if (expirationDate < Date.now() && leftToFetch-- > 0) {
            preLoadedTiles[tileRef] = Date.now();
            await fetch(url); // Load the tile on the brother cache
          }
        }
    }

  // Preload points & commentaires
  const url = serveurApi + '/api/bbox?bbox=5.5,45,5.6,45.1&nb_points=all&detail=complet';

  fetch(url)
    .then((response) => response.json())
    .then((json) => {
      json.features.forEach((feature) => {
        console.info(feature);
      });
    })
    .catch((error) => {
      console.error('Error: ' + error + ' ' + url);
    });

  // END
  localStorage.preLoadedTiles = JSON.stringify(preLoadedTiles);
  localStorage.preLoadedPoints = JSON.stringify(preLoadedPoints);
}