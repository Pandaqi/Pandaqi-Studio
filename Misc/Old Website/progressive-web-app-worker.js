// VERSION: 3

var cacheName = "pandaqi-cache";

// TO DO: Build out cache to get everything we need
// URL that shows how to do that dynamically: https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Offline_Service_workers
// URL (soon-to-be-updated rules for intallation eligibility): https://developer.chrome.com/blog/improved-pwa-offline-detection/

// URL (recipe for automatically fetching newer version of files if available): https://serviceworke.rs/strategy-cache-and-update_service-worker_doc.html
// URL (for updating service worker itself if file is not identical to current one): https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerRegistration/update
// URL (very useful/clear answer on Stack Overfloew about this shizzle): https://stackoverflow.com/questions/56972132/pwa-cache-refresh-page

//var baseUrl = "gamesites/proof-of-loch-ness/";
var contentToCache = [];

// Caching stuff upon INSTALL
self.addEventListener('install', (e) => {
  console.log('[Service Worker] Install');
  e.waitUntil((async () => {
    const cache = await caches.open(cacheName);
    console.log('[Service Worker] Caching all: app shell and content');
    await cache.addAll(contentToCache);
  })());
});

// INTERCEPT REQUESTS WHEN FETCHING, 
// if nonexistent, add to cache, then serve cache instead
self.addEventListener('fetch', (e) => {
	// ignore any non-GET requests (like PUT)
   if (e.request.method != 'GET') { return; }

   // ignore any external urls being requested
   if (!e.request.url.includes("https://pandaqi.com")) { return; }

  e.respondWith((async () => {
    const r = await caches.match(e.request);
    console.log(`[Service Worker] Fetching resource: ${e.request.url}`);
    if (r) { return r; }
    console.log(`[Service Worker] GOT TO THIS POINT`);
    const response = await fetch(e.request);
    const cache = await caches.open(cacheName);
    console.log(`[Service Worker] Caching new resource: ${e.request.url}`);
    cache.put(e.request, response.clone());
    return response;
  })());

  e.waitUntil(update(e.request));
});

function update(request) {
  return caches.open(cacheName).then(function (cache) {
    return fetch(request).then(function (response) {
      return cache.put(request, response);
    });
  });
}