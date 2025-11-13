const CACHE_NAME = 'pib-app-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/auth.html',
  '/main.html',
  '/css/style.css',
  '/js/router.js',
  '/js/app.js',
  '/js/auth.js',
  '/js/main.js',
  '/manifest.json',
  '/media/images/icons/touch-gesture-svgrepo-com.svg'
];

// Установка
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
});

// Активация
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
});

// Fetch
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        return response || fetch(event.request);
      })
  );
});