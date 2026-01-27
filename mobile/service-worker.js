/********************
 * PWA service worker
 * S'installe avant tout autre chargement
 *
 * https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Caching
 * https://korben.info/pwa-cache-cauchemar-solution.html
 */

//TODO service-worker.php avec derniere date de modif d'un fichier /mobile/...

const cacheName = 'refuges.info';

console.info('Service worker loaded');

// Active immédiatement le service worker et déclenche le changement de contrôleur s'il y a un update
self.skipWaiting();

// Le service worker se réinstalle s'il y a des modifs dans sa source (un marqueur de version par exemple)
self.addEventListener('install', () => {
  console.info('PWA ' + cacheName + ' install');

  // Alors on supprime le cache de l'appli pour recharger tous les autres fichiers (code, icônes, ...)
  caches.delete(cacheName)
    .then(console.info('Cache ' + cacheName + ' deleted'));
});

// Intercepte les requêtes d'url
self.addEventListener('fetch', interceptedFetch => {
  // Empêche la gestion par défaut des requêtes et fournit une promise en réponse
  interceptedFetch.respondWith(
    // Créer le cache si nécéssaire
    caches.open(cacheName).then(cache =>
      // Cherche l'url dans le cache
      cache.match(interceptedFetch.request).then(responseCache =>
        // On l'a trouvé dans le cache
        responseCache ||

        // Sinon, on le cherche via le réseau
        fetch(interceptedFetch.request).then(externFetch => {
          // On met en cache uniquement les resources du même serveur
          if (interceptedFetch.request.url.includes(location.host))
            cache.put(interceptedFetch.request, externFetch.clone());

          return externFetch;
        })
      )
    )
  );
});