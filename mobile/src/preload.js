/* eslint-disable no-unused-vars */
async function preload() {
  // this = map
  // Preload tiles of openhikingmap base layer
  /* eslint-disable no-invalid-this */
  const bounds = this.getCenter(),
    preLoadedTiles = JSON.parse(localStorage.preLoadedTiles || '{}'),
    remnantTime = 30000; // Shelf life (unix milliseconds)
  let leftToFetch = 40;

  for (let ecart = 1; ecart < 6; ecart++)
    for (let zoom = 6; zoom < 16; zoom++) {
      /* eslint-disable no-invalid-this */
      const coords = this.project([bounds.lat, bounds.lng], zoom),
        dx = Math.round(coords.x / 256),
        dy = Math.round(coords.y / 256);

      for (let x = dx - ecart; x < dx + ecart; x++)
        for (let y = dy - ecart; y < dy + ecart; y++) {
          const tileRef = zoom + '/' + x + '/' + y,
            expirationDate = (preLoadedTiles[tileRef] || 0) + remnantTime,
            url = 'https://tile.openmaps.fr/openhikingmap/' + tileRef + '.png';

          if (expirationDate < Date.now() && leftToFetch-- > 0) {
            preLoadedTiles[tileRef] = Date.now();
            await fetch(url);
          }
        }

      localStorage.preLoadedTiles = JSON.stringify(preLoadedTiles);
    }

  // Preload points & commentaires
  //TODO
}