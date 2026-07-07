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

const nomCache = 'refuges.info';

// Est-ce une page utilisable hors réseau ?
function urlToMem(url) {
  return [
    '$', '/$', '/nouvelles', '/nav', '/point/', '/wiki',
    '/forum/$', '/forum/viewforum', '/forum/viewtopic',
  ].some(el => (url + '$').includes(location.host + el));
}

// Exécuté au changement de source du service worker
//TODO ne se réinstalla pas quand changement de source
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

// Chargement d'un fichier priorité réseau sinon cache
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);

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

// Intercepte le chargement d'un fichier
self.addEventListener('fetch', (evt) => {
  if ((evt.request.redirect === 'manual' && urlToMem(evt.request.url)) || // Fichier .html d'une page chargeable
    urlToMem(evt.request.referrer)) // Fichier inclus dans une page chargeable
    evt.respondWith(networkFirst(evt.request));
});