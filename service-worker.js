/*************************************************
 * Service worker avec stratégie réseau puis cache
 *
 * Une fois installé, permet d'utiliser hors réseau les pages mises en cache
 * y compris le html des pages et les fichiers de max-age écoulés en attendant de pouvoir les recharger
 *
 * Il rafraichi son cache si les sources sont modifiées ou les dates expirées.
 * Seules sont mises en cache les url du domaine qui ne font pas appel 
 * à des fonctions d'identification, recherche ou modification du site.
 *
 * https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Caching
 */

const nomCache = 'myWRICache',
  cacheConditions = [
    'accueil', 'nouvelles', 'nav', 'point/', 'wiki',
    'forum/accueil', 'forum/viewforum', 'forum/viewtopic',
  ];

// Exécuté au changement de source du service worker
self.addEventListener('install', (evt) => {
  console.info('Service worker installed');

  evt.waitUntil(
    caches.open(nomCache)
    .catch((erreur) => console.error('Open cache ' + nomCache + ' ' + erreur))
    .then((cache) => {
      console.info('Open cache ' + nomCache);

      // Les fichiers utilisés par le service worker sont mis en cache
      // au moment de l'install car ils ne sont pas appelés par le navigateur
      cache.addAll([
          '/', // Le point d'entrée
          '/manifest.json',
          '/service-worker.js',
          '/images/icones/favicon.svg',
        ])
        .catch((erreur) => console.error('Add PWA files to cache ' + erreur))
        .then(console.info('PWA files added to cache'));
    })
  );
});

// Recherche d'un fichier sur le réseau ou dans le cache
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);

    /* if(evt.request.redirect === 'manual' &&
      evt.request.url.includes('refuges.info'))*/

    if (networkResponse.ok) {
      const cache = await caches.open(nomCache);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  }
  /* Échec de la récupération réseau */
  /* eslint-disable-next-line no-unused-vars */
  catch (code) {
    const cachedResponse = await caches.match(request);
    return cachedResponse;
  }
}

// Interception des appels au réseau
self.addEventListener('fetch', (evt) => {
  /*if(evt.request.redirect === 'manual' ){
  const input = (evt.request.url + '/accueil/').replaceAll('//', '/');
//  const input = evt.request.url ;
//console.log(input);//DCMM

//console.log(rr);//DCMM 
const rr = cacheConditions.some(el =>  input.includes(  'refuges.info/' + el  ) );
console.log(rr);//DCMM 
  }*/

  /*const rr = cacheConditions.some(el => {
  //console.log('refuges.info/' + el + '/');//DCMM
    return input.includes(  'refuges.info/' + el  );
  });*/
  //console.log( evt.request.url +!!evt.request.url.includes('refuges.info'));//DCMM

  /* if (evt.request.redirect !== 'manual' || // Ressource appelée dans une une page (clic)
     cacheConditions.some(el => input.includes(location.host + '/' + el + '.'))) // url de refuges.info et autorisée en ligne */

  const okHorsReseau = cacheConditions.some(el =>
    (evt.request.url + '/accueil/').replaceAll('//', '/')
    .includes('refuges.info/' + el));

  if (evt.request.redirect === 'manual' && okHorsReseau)
    evt.respondWith(networkFirst(evt.request));
});