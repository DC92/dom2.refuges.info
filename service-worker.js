/********************
 * PWA service worker
 * S'installe avant tout autre chargement
 *
 * https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Caching
 * https://korben.info/pwa-cache-cauchemar-solution.html
 */

const nomCache = 'myWRICache';
//TODO cache séparé pour les programmes et les données

// Le service worker se réinstalle s'il y a des modifs dans son code (un marqueur de version par exemple)
self.addEventListener('install', evt => {
  console.info('PWA install');

  // Déclenche immédiatement son upgrade et le réactive
  self.skipWaiting();

  // Alors on supprime le cache de l'appli pour recharger tous les autres fichiers (code, icônes, ...)
  caches.delete(nomCache)
    .catch(erreur => console.error('PWA delete cache ' + nomCache + ' ' + erreur))
    .then(console.info('Cache ' + nomCache + ' deleted'));

  // Puis on recrée ce cache et on charge les fichiers qui ne seront pas appelés ensuite
  evt.waitUntil(
    caches.open(nomCache)
    .catch(erreur => console.error('PWA create cache ' + nomCache + ' ' + erreur))
    .then(cache => {
      console.info('PWA create cache ' + nomCache);

      cache.addAll([
          './', // Le point d'entrée
          'manifest.json',
          'service-worker.js',
        ])
        .catch(erreur => console.error('Add PWA files to cache ' + erreur))
        .then(console.info('PWA files added to cache'));
    })
  );
});

// Sert les fichiers requis
// Cache en priorité, puis cache du navigateur, puis réseau
self.addEventListener('fetch', evt => {
  console.info('PWA fetch ' + evt.request.url);
  evt.respondWith(
    caches.match(evt.request) // Cherche dans tous les caches du domaine
    .catch(erreur => console.error('Fetch ' + evt.request.url + ' ' + erreur))
    .then(trouveEnCache =>
      trouveEnCache ||
      fetch(evt.request)
    )
  )
});