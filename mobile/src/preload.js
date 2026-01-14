/** Préchargements dans une zone autour de celle parcourue par la carte
 *
 * Les dalles OpenHikingMap sont simplement appelées sans que le résultat ne soit utilisé,
 * elles sont mémorisées par le cache de l'explorateur le temps et l'espace permis par celui-ci
 * Seuls sont mémorisées dans localStorage.preLoadedTiles les date d'expiration,
 * les informations nécéssaires pour afficher les icônes sur la carte
 * sont chargées globalement par GeoJsonAjaxCluster à chaque modification d'un point. */
const tilesRefreshTime = 30000, // Milliseconds
  minZoomPreloadedTiles = 6,
  maxZoomPreloadedTiles = 15,
  preloadedTilesAround = 5,
  maxTilesPerRequest = 40;

/* Les informations nécéssaires à l'affichage d'un point et de ses commentaires
 * sont chargées par dalles dans localStorage.preLoadedPoints_x_y.
 * Une fois chargés, ne sont rafraichis que les points ou commentaires récement modifiés.
 * Les photos des points visualisés sont sont mémorisées par le cache de l'explorateur */
const pointsTileSize = 0.5; // ° lon / lat

/* eslint-disable no-unused-vars */
function preload(map, position) {
  //console.log('preload');

  // Preload OpenHikingMap tiles
  const preLoadedTiles = JSON.parse(localStorage.preLoadedTiles || '{}');
  let leftToFetch = maxTilesPerRequest,
    loadedTilesChanged = false;

  for (let ecart = 1; ecart <= preloadedTilesAround; ecart++)
    for (let zoom = minZoomPreloadedTiles; zoom <= maxZoomPreloadedTiles; zoom++) {
      const coordPX = map.project([position.lat, position.lng], zoom),
        tileX = Math.round(coordPX.x / 256),
        tileY = Math.round(coordPX.y / 256);

      for (let x = tileX - ecart; x < tileX + ecart; x++)
        for (let y = tileY - ecart; y < tileY + ecart; y++) {
          const baseTileRef = zoom + '/' + x + '/' + y,
            expirationDate = (preLoadedTiles[baseTileRef] || 0) + tilesRefreshTime,
            url = 'https://tile.openmaps.fr/openhikingmap/' + baseTileRef + '.png';

          if (expirationDate < Date.now() && leftToFetch-- > 0) {
            //console.log(baseTileRef);
            preLoadedTiles[baseTileRef] = Date.now();
            fetch(url); // Load the tile on the brother cache (wait for the answer)
            loadedTilesChanged = true;
          }
        }
    }
  if (loadedTilesChanged)
    localStorage.preLoadedTiles = JSON.stringify(preLoadedTiles);

  // Preload points & commentaires
  const //preLoadedPoints = JSON.parse(localStorage.preLoadedPoints || '{}'),
    tx = Math.round(position.lng / pointsTileSize),
    ty = Math.round(position.lat / pointsTileSize),
    bbox = [tx, ty, tx + 1, ty + 1].map(a => Math.round(a * pointsTileSize * 10) / 10),
    url = window.location.origin + '/api/bbox?detail=complet&nb_points=all&bbox=' + bbox.join(',');

  let loadedPointsChanged = false;

  fetch(url)
    .then((response) => response.json())
    .then((json) => {
      json.features.forEach((feature) => {
        //console.info(feature);
        loadedPointsChanged = true;
      });
    })
    .catch((error) => {
      console.error('Error: ' + error + ' ' + url);
    });

  //if (loadedPointsChanged) localStorage.preLoadedPoints = JSON.stringify(preLoadedPoints);
}

// Accès à la base de données indexedDB
// https://developer.mozilla.org/en-US/docs/Web/API/IDBObjectStore/put
console.log('indexedDB');

dbConnect('points', 'id_point');
//dbGet('points', 299);
dbPut('points', {
  'id_point': 299,
  cabane: 'Walk dog UPDATED 4TH',
  minutes: 30,
  day: 24,
  month: 'December',
  year: 2013,
  notified: 'no',
});

function dbConnect(store, index) {
  // Open access to the database
  const DBOpenRequest = window.indexedDB.open('refuges.info', 1);

  // Create the store the very first time
  DBOpenRequest.onupgradeneeded = (event) => {
    console.log('DBOpenRequest.Create.onupgradeneeded');

    const db = event.target.result;
    const objectStore = db.createObjectStore(store, {
      keyPath: index,
    });

    objectStore.transaction.oncomplete = () => {
      console.log('ObjectStore.Create.oncomplete');
    };
  };
}

function dbPut(store, object) {
  // Open access to the database
  const DBOpenRequest = window.indexedDB.open('refuges.info', 1);

  DBOpenRequest.onsuccess = () => {
    console.log('DBOpenRequest.Put.onsuccess');

    // open a read/write db transaction, ready for adding the data
    const db = DBOpenRequest.result;
    const transaction = db.transaction([store], 'readwrite');
    // Open an object store on the transaction
    const objectStore = transaction.objectStore(store);

    // Make a request to put our object in the object store
    const objectStoreRequest = objectStore.put(object);

    objectStoreRequest.onsuccess = () => {
      console.log('objectStoreRequest.Put.onsuccess');
    };

    objectStoreRequest.onerror = () => {
      console.error("Error.Put.objectStoreRequest", objectStoreRequest.error);
    };

    transaction.onerror = () => {
      console.error("Error.Put.transaction", transaction.error);
    };

    transaction.oncomplete = () => {
      console.log('transaction.Put.oncomplete');
      dbGet('points', 299);
    };
  };
}

function dbGet(store, key) {
  // Open access to the database
  const DBOpenRequest = window.indexedDB.open('refuges.info', 1);

  DBOpenRequest.onsuccess = () => {
    console.log('DBOpenRequest.Get.onsuccess');

    // open a read/write db transaction, ready for adding the data
    const db = DBOpenRequest.result;
    const transaction = db.transaction([store]);
    // Open an object store on the transaction
    const objectStore = transaction.objectStore(store);

    // Make a request to read our object to the object store
    const objectStoreRequest = objectStore.get(key);

    transaction.oncomplete = () => {
      console.log('transaction.Get.oncomplete');
    };

    objectStoreRequest.onsuccess = (evt) => {
      console.log('objectStoreRequest.Get.onsuccess');
      console.log(evt.target.result);
    };
  };
}