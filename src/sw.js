'use strict';

/**
 * Service worker based on the code provided in the course
 * material about service workers (Udacity Mobile Web Nanodegree)
 */
const staticCacheName = 'restaurant-static-v1';
const contentImgsCache = 'restaurant-content-imgs';
const allCaches = [
  staticCacheName,
  contentImgsCache
];

self.addEventListener('install', function(event) {
  var urls = [
      '/index.html',
      '/restaurant.html',
      '/js/main.js',
      '/js/dbhelper.js',
      '/js/restaurant_info.js',
      '/css/styles.css',
      '/manifest.json',
      '/mstile-150x150.png',
      '/safari-pinned-tab.svg',
      '/favicon.ico',
      '/favicon-32x32.png',
      '/favicon-16x16.png',
      '/browserconfig.xml',
      '/apple-touch-icon.png',
      '/android-chrome-512x512.png',
      '/android-chrome-192x192.png'
  ];
  event.waitUntil(
    caches.open(staticCacheName).then(function(cache) {
      return cache.addAll(urls);
    })
  );
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.filter(function(cacheName) {
          return cacheName.startsWith('restaurant-') &&
                 !allCaches.includes(cacheName);
        }).map(function(cacheName) {
          return caches.delete(cacheName);
        })
      );
    })
  );
});

self.addEventListener('fetch', function(event) {
  var requestUrl = new URL(event.request.url);

  if (requestUrl.origin === location.origin) {
    if (requestUrl.pathname === '/') {
      event.respondWith(caches.match('/index.html'));
      return;
    }
    if (requestUrl.pathname.startsWith('/restaurant.html')) {
        event.respondWith(caches.match('/restaurant.html'));
        return;
    }
    if (requestUrl.pathname.startsWith('/img/')) {
      event.respondWith(serveImg(event.request));
      return;
    }
  }

  event.respondWith(
    caches.match(event.request).then(function(response) {
      return response || fetch(event.request);
    })
  );
});

function serveImg(request) {
  return caches.open(contentImgsCache).then(function(cache) {
    return cache.match(request.url).then(function(response) {
      if (response) return response;

      return fetch(request).then(function(networkResponse) {
        cache.put(request.url, networkResponse.clone());
        return networkResponse;
      });
    });
  });
}

self.addEventListener('message', function(event) {
  if (event.data.action === 'skipWaiting') {
    self.skipWaiting();
  }
});