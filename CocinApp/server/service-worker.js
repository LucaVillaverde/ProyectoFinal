// const CACHE_NAME = 'CocinApp Cache';
// const urlsToCache = [
//     '../src/assets/logo1.png',
//     // Añade aquí más recursos que quieras cachear
// ];

// self.addEventListener('install', event => {
//     event.waitUntil(
//         caches.open(CACHE_NAME)
//             .then(cache => {
//                 console.log('Abriendo caché');
//                 return cache.addAll(urlsToCache);
//             })
//     );
// });

// self.addEventListener('fetch', event => {
//     event.respondWith(
//         caches.match(event.request)
//             .then(response => {
//                 // Responder con el recurso cacheado o realizar una solicitud a la red
//                 return response || fetch(event.request);
//             })
//     );
// });

// self.addEventListener('activate', event => {
//     const cacheWhitelist = [CACHE_NAME];
//     event.waitUntil(
//         caches.keys().then(cacheNames => {
//             return Promise.all(
//                 cacheNames.map(cacheName => {
//                     if (cacheWhitelist.indexOf(cacheName) === -1) {
//                         return caches.delete(cacheName);
//                     }
//                 })
//             );
//         })
//     );
// });
