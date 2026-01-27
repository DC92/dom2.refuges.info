/* PWA service worker */
//https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Caching
//https://korben.info/pwa-cache-cauchemar-solution.html
//TODO service-worker.php avec derniere date de modif d'un fichier /mobile

const cacheName = 'refuges.info';

console.info('Service worker loaded');
self.skipWaiting(); // Immediately activate the SW & trigger controllerchange

// Le service worker se réinstalle s'il y a des modifs dans sa source (un marqueur de version par exemple)
self.addEventListener('install', () => {
  console.log('PWA ' + cacheName + ' install');

  // Alors, on supprime le cache de l'appli pour recharger tous les autres fichiers (code, icônes, ...)
  caches.delete(cacheName)
    .then(console.log('Cache ' + cacheName + ' deleted'))
    .catch(error => console.error(error));
});

self.addEventListener('fetch', eventFetch => {
  // const match = eventFetch.request.url.match(/openhikingmap.*([0-9]+\/[0-9]+\/[0-9]+)/u);

  eventFetch.respondWith( // Prevents default fetch handling, and provides a promise for a response
    caches.open(cacheName).then(cache => { // Create the cache if none
      return cache.match(eventFetch.request).then(responseCache => { // A-t-on cette url en cache ?
          return responseCache || // On l'a trouvé dans le cache
            fetch(eventFetch.request).then(responseFetchFile => { // Sinon, on le cherche via le réseau
              if (eventFetch.request.url.includes(location.host)) // Iniquement les resources du même serveur
                cache.put(eventFetch.request, responseFetchFile.clone()); // On met en cache
              return responseFetchFile;
            })
            .catch(error => console.error(error + ' eventFetch ' + eventFetch.request.url));
        })
        .catch(error => console.error(error + ' cache match ' + cacheName));
    })
    .catch(error => console.error(error + ' open cache ' + cacheName))
  );
});

// Fetch any ressource, cache first with cache refresh
/*
async function cacheFirstWithRefresh(event) {
  const match = event.request.url.match(/openhikingmap.*([0-9]+\/[0-9]+\/[0-9]+)/u);

  return (await caches.match(event.request)) ||
    fetch(event.request.url)
    .then(async found => {
       if (found.ok /*&& !match* /) {
        const cachezz = await caches.open(cacheName);
        cachezz.put(event.request, found.clone());
      }  

      return found;
    })
    .catch(error => console.log(error+' '+event.request.url));
}

if(0)
self.addEventListener('fetch', event => {
  event.respondWith(// Prevents default fetch handling, and provides a promise for a response
  cacheFirstWithRefresh(event)
  );
});*/

// Serves required files
// Cache first, then browser cache, then network
/*
self.addEventListener('fetch', event => {
  console.info('PWA fetch ' + event.request.url);
 console.log(location.host);
  
  event.respondWith(// Prevents default fetch handling, and provides a promise for a response
    caches.match(event.request)// A-t-on cette url en cache ?
    .then(async found => {
if(event.request.url. includes(location.host)){
 console.log(found);
        const cachezz = await caches.open(cacheName);
  cachezz.put(event.request, found.clone());
 console.log(event.request.url. includes(location.host));
}
      return found || fetch(event.request);
    })
    .catch(error => console.error(error + ' ' + event.request.url))
  )
});*/


// Acces à indexedDB (pour futurs développements)
/* glo bal indexedDB */
/*
  let base = null;
  indexedDB.open('keyval-store', 1)
  .onsuccess = event => {
    base = event.result;
  };
*/