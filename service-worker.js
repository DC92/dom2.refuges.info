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
 * https://developer.mozilla.org/fr/docs/Web/Progressive_web_apps/Tutorials/js13kGames/Offline_Service_workers
 */

const nomCache = 'refuges.info';

// Le service-worker est démarré avant toiute action
// Si un nouveau service-worker est disponible, il ne sera mis en service lors du prochain démarrage
// L'event suivant sera alors déclenché
self.addEventListener('install', (evt) => {
  console.info('New service worker installed');

  self.skipWaiting(); // Nécéssaire pour mettre en service les modifs du service-worker

  evt.waitUntil(
    caches.open(nomCache)
    .catch((erreur) => console.error('Open cache ' + nomCache + ' ' + erreur))
    .then((cache) => {
      //console.info('Open cache ' + nomCache);

      // Les fichiers utilisés par le service worker sont rechargés en cache
      // car ils ne sont pas appelés par le navigateur
      cache.addAll([
          '/', // Le point d'entrée
          '/manifest.json',
          '/service-worker.js',
          '/images/icones/favicon.svg',
        ])
        //.then(console.info('PWA files added to cache'))
        .catch((erreur) => console.error('Add PWA files to cache ' + erreur));
    })
  );
});

// Est-ce un fichier autorisée hors réseau ?
function archivable(url) {
  return [
    '$', '/$', '/nouvelles', '/nav', '/point/', '/wiki', // Pages du site
    '/forum/$', '/forum/viewforum', '/forum/viewtopic', // Pages du forum
    '/images', '/leaflet', // Fichiers appelés par fetch et non inclus dans html
  ].some(el => (url + '$').includes(location.host + el));
}

// Intercepte les appels réseau, stratégie réseau puis cache
self.addEventListener('fetch', (evt) => {
  //console.log('addEventListener fetch');//DCMM  
  if (!evt.request.url.includes(location.host)) return;
  if (evt.request.redirect === 'manual' && !archivable(evt.request.url)) return;

  //if((evt.request.redirect === 'manual' && archivable(evt.request.url)) || // Fichier .html d'une page chargeable
  //(evt.request.redirect !== 'manual' && archivable(evt.request.referrer))) // Fichier inclus dans une page chargeable

  evt.respondWith(
    (async () => { // L'event répond tout de suite avec une promise qui délivrera la ressource plus tard

      // Fait un await pour pouvoir retourner la réponse au fetch
      const reponseReseau = await fetch(evt.request)
        /* eslint-disable-next-line no-unused-vars */
        .catch((erreur) => null); // Nécéssaire pour ne pas déclencher d'erreur mais la suite du traitement

      // Délivre la réponse du réseau en priorité
      if (reponseReseau && reponseReseau.ok) {
        // Met à jour le cache en parallèle
        const cloneReponseReseau = reponseReseau.clone(); // En garde une copie pour pouvoir la mettre en cache

        caches.open(nomCache)
          .catch((erreur) => console.error('Open cache ' + nomCache + ' ' + erreur))
          .then((cache) => {
            cache.put(evt.request, cloneReponseReseau)
              .catch((erreur) => console.error('Add file ' + evt.request.url + ' to cache ' + erreur));
          });

        return reponseReseau;
      }

      // Retourne la version cache si pas de réseau          
      return await caches.match(evt.request);
    })(),
  );
});