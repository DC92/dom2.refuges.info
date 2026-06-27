/********************
 * PWA service worker
 * S'installe avant tout autre chargement à partir des fichiers de son cache
 *
 * https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Caching
 */

const nomCachePWA = 'myWRICache';

// En tâche de fond, le service worker raffraichi son cache si son source de service-worker.js est modifié 
// Si le code du service-worker.js  est mofifié (un marqueur de version par exemple)
// il exécute l'évènement 'install' qui permet à l'utilisateur de mettre à jour d'autres fichiers, e, tâche de fond
// Ces nouveaux codes ne seront mis en service que lors du prochain redémarrage du PWA
self.addEventListener('install', evt => {
  console.info('PWA install');

  evt.waitUntil(
    caches.open(nomCachePWA)
    .catch(erreur => console.error('PWA open cache ' + nomCachePWA + ' ' + erreur))
    .then(cache => {
      console.info('PWA open cache ' + nomCachePWA);

      // Ces fichiers sont mis en cache PWA car ils ne sont pas appelés par le navigateur, donc pas mis en cache navigateur
      cache.addAll([
          './', // Le point d'entrée
          'manifest.json',
          'service-worker.js',
          'images/icones/favicon.png',
        ])
        .catch(erreur => console.error('Add PWA files to cache ' + erreur))
        .then(console.info('PWA files added to cache'));
    })
  );
});

// Intercepte les chargements d'url 'primaires' du domaine (fichier .html constituant une page affichable) qui sont mis en cache PWA
// Les fichiers appelés par les pages (css, js, images, XMLHttpRequest, ...) sont mis en cache par l'explorateur

// Stratégie cache navigateur, puis réseau, puis cache PWA
// Toujours suivi, en tâche de fond, par le rafraichissement du cache PWA qui ne sera utilisé qu'en cas de hors réseau

async function networkFirst(evt) {
  //console.log('networkFirst '+evt.request.url);//DCMM
  try {
    const networkResponse = await fetch(evt.request);

    if (networkResponse.ok) {
      //console.log('cache.put 1111 '+evt.request.url);//DCMM

      const cache = await caches.open(nomCachePWA);
      cache.put(evt.request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    //console.log('cache.put 2222 '+evt.request.url);//DCMM

    const cachedResponse = await caches.match(evt.request);
    return cachedResponse || error;
  }
}

self.addEventListener('fetch', (evt) => {
  if (evt.request.redirect === 'manual' && // url appelé par une page (clic)
    evt.request.url.includes(location.host)) { // url appartenant au site

    //console.log('cache.put 0000 '+evt.request.url);//DCMM
    evt.respondWith(networkFirst(evt));
    //console.log('cache.put 9999 '+evt.request.url);//DCMM
  }
});