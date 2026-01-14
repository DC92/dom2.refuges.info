// Accès à la base de données indexedDB
// https://developer.mozilla.org/en-US/docs/Web/API/IDBObjectStore/
function dbCreate(base, store, index) {
  // Create the database if it doesn't exists & open access
  const DBOpenRequest = window.indexedDB.open(base, 1);

  // Create the store the very first time
  DBOpenRequest.onupgradeneeded = (event) => {
    const db = event.target.result;

    db.createObjectStore(store, {
      keyPath: index,
    });
  };
}

function dbPut(base, store, object) {
  const DBOpenRequest = window.indexedDB.open(base, 1);

  DBOpenRequest.onsuccess = () => {
    const db = DBOpenRequest.result,
      transaction = db.transaction([store], 'readwrite'),
      objectStore = transaction.objectStore(store);

    objectStore.put(object);
  };
}

function dbGet(base, store, key) {
  const DBOpenRequest = window.indexedDB.open(base, 1);

  DBOpenRequest.onsuccess = () => {
    const db = DBOpenRequest.result,
      transaction = db.transaction([store]),
      objectStore = transaction.objectStore(store);

    objectStore.get(key)
      .onsuccess = (evt) => {
        console.log(evt.target.result);
      };
  };
}

// TESTS
dbCreate('refuges.info', 'points', 'id_point');
dbGet('refuges.info', 'points', 299);
dbPut('refuges.info', 'points', {
  'id_point': 299,
  time: Date.now(),
  cabane: 'Walk dog UPDATED 6TH',
  minutes: 30,
  day: 24,
  month: 'December',
  year: 2013,
  notified: 'no',
});