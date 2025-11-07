const CACHE_NAME = 'camara-pwa-v1';
const urlsToCache = [
  '.',
  'index.html',
  'app.js',
  'manifest.json',
  'icon-192.png',
  'icon-512.png'
];

// Instalación
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[SW] Archivos cacheados');
      return cache.addAll(urlsToCache);
    })
  );
});

// Activación y limpieza
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(names => {
      return Promise.all(
        names.map(name => {
          if (name !== CACHE_NAME) {
            console.log('[SW] Caché antiguo eliminado:', name);
            return caches.delete(name);
          }
        })
      );
    })
  );
});

// Interceptar peticiones
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Si encontramos una coincidencia en el cache, la retornamos
        if (response) {
          return response;
        }
        // Si no hay coincidencia, buscamos en la red
        return fetch(event.request)
          .then(response => {
            // Si la respuesta no es válida, retornamos la respuesta tal cual
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clonamos la respuesta ya que el body solo se puede usar una vez
            const responseToCache = response.clone();

            // Agregamos la respuesta al cache
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });

            return response;
          });
      })
  );
});
