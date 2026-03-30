const CACHE_NAME = 'pannamore-assets-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/Index.css',
  '/Index.js',
  '/pannAmore.js',
  '/searchEngine2-0.js',
  '/secDi.js',
  '/Pannamore1One.png',
  '/pannamoreIconx192.png',
  '/Publisher.html'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        return response || fetch(event.request)
          .catch(() => caches.match('/offline.html'));
      })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
});
