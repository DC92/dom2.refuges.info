/********************
 * PWA service worker
 * S'installe avant tout autre chargement
 *
 * https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Caching
 * https://korben.info/pwa-cache-cauchemar-solution.html
 */

//TODO mode debug sans cache

const nomCache = 'myWRICache';
//TODO cache séparé pour les programmes et les données

// Le service-worker intercepte toutes les demandes de fichiers
// Stratégie cache PWA, puis navigateur, puis réseau
self.addEventListener('fetch', evt => {
  //console.info('PWA fetch ' + evt.request.url);

  evt.respondWith(
    // Cherche dans tous les caches du domaine
    caches.match(evt.request)
    .catch(erreur => console.error('Fetch cache ' + evt.request.url + ' ' + erreur))
    .then(trouveEnCachePWA =>

      // Retourne le fichier est dans le cache de la PWA
      trouveEnCachePWA ||

      // Sinon, on le cherche via le cache du navigateur puis le réseau
      fetch(evt.request)
      .catch(erreur => console.error('Fetch network ' + evt.request.url + ' ' + erreur))
      .then(trouveEnCacheNavigateurOuReseau => {

        // Mémorise dans le cache PWA les urls du site pour pouvoir les appeler hors réseau
        if (evt.request.redirect === 'manual' && // url appelé par une page (clic)
          evt.request.url.includes(location.host)) { // url appartenant au site
          const trc = trouveEnCacheNavigateurOuReseau.clone();

          caches.open(nomCache)
            .catch(erreur => console.error('PWA ouvre cache ' + nomCache + ' ' + erreur))
            .then(cache => cache.put(evt.request, trc));
        }
        // Les fichiers appelés par une page (du site ou externes) resteront dans le navigateur

        // Retourne la trouvaille
        return trouveEnCacheNavigateurOuReseau;
      })
    )
  );
});

// Le service worker mémorisé en cache PWA s'initialise
// puis regarde s'il y a des modifs dans son code (un marqueur de version par exemple)
self.addEventListener('install', evt => {
  console.info('PWA install');

  // Déclenche immédiatement son upgrade et le réactive
  //TODO NECESSAIRE ? self.skipWaiting();

  // Alors supprime le cache de l'appli pour recharger tous les autres fichiers (code, icônes, ...)
  caches.delete(nomCache)
    .catch(erreur => console.error('PWA delete cache ' + nomCache + ' ' + erreur))
    .then(console.info('Cache ' + nomCache + ' deleted'));
  //TODO stratégie update if modif

  // Puis recrée ce cache
  evt.waitUntil(
    caches.open(nomCache)
    .catch(erreur => console.error('PWA create cache ' + nomCache + ' ' + erreur))
    .then(cache => {
      console.info('PWA cree cache ' + nomCache);

      // et charge les fichiers qui ne seront pas appelés par une page
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