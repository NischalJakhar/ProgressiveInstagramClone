var CACHE_STATIC_NAME = 'static-v6';
var CACHE_DYNAMIC_NAME = 'dynamic-v2';


self.addEventListener('install', function(event) {
  console.log('[Service Worker] Installing Service Worker ...', event);
  event.waitUntil(
      caches.open(CACHE_STATIC_NAME)
          .then(function (cache) {
              console.log('[Service Worker] Precaching App Shell');
              cache.addAll([
                  '/',
                  '/offline.html',
                  '/src/js/app.js',
                  '/index.html',
                  '/src/js/feed.js',
                  '/src/js/promise.js',
                  '/src/js/fetch.js',
                  '/src/js/material.min.js',
                  '/src/css/feed.css',
                  'src/css/app.css',
                  'src/images/main-image.jpg',
                  'https://fonts.googleapis.com/css?family=Roboto:400,700',
                  'https://fonts.googleapis.com/icon?family=Material+Icons',
                  'https://cdnjs.cloudflare.com/ajax/libs/material-design-lite/1.3.0/material.indigo-pink.min.css'

              ]);
          })
  )
});


self.addEventListener('activate', function(event) {
    console.log('[Service Worker] Activating Service Worker ....', event);
    //we do cleanup here
    event.waitUntil(
        caches.keys()
            .then(function (KeyList) {
                return Promise.all(KeyList.map(function (key) {
                    if(key !== CACHE_STATIC_NAME && key !== CACHE_DYNAMIC_NAME)
                    {
                        console.log('[Service Worker] Removing old Cache' , key);
                       return caches.delete(key);
                    }
                }));
            })
    );

  return self.clients.claim();
});

self.addEventListener('fetch', function(event) {
  event.respondWith(
      caches.match(event.request)
          .then(function (response) {
              if(response){
                return response;
              }else{
                return fetch(event.request)
                    .then(function (res) {
                       return caches.open(CACHE_DYNAMIC_NAME)
                            .then(function (cache) {
                                cache.put(event.request.url,res.clone());
                                return res;
                            })
                    })
                    .catch(function (err) {
                        return caches.open(CACHE_STATIC_NAME)
                            .then(function (cache) {
                               return cache.match('/offline.html');
                            });
                    });
              }
          })
);
});