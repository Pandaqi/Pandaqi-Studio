/**
 * Offline service worker for the hosted build only. The single-file build needs
 * no worker: it is already one local file.
 *
 * Network first, always: a deploy replaces the assets under stable names, so
 * serving cache first would keep an old version until the cache was cleared.
 * The cache is the fallback when the network is gone, which is the case this
 * feature exists for. Bump CACHE when the caching rules change.
 */

const CACHE = 'pq-game-buddy-v1';

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      for (const key of await caches.keys()) {
        if (key !== CACHE) await caches.delete(key);
      }
      await self.clients.claim();
    })(),
  );
});

async function networkFirst(request, fallback) {
  const cache = await caches.open(CACHE);
  try {
    const response = await fetch(request);
    if (response && response.ok) cache.put(request, response.clone());
    return response;
  } catch {
    const hit = await cache.match(request);
    if (hit) return hit;
    if (fallback) {
      const page = await cache.match(fallback);
      if (page) return page;
    }
    return Response.error();
  }
}

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    event.respondWith(networkFirst(request, './index.html'));
    return;
  }
  event.respondWith(networkFirst(request));
});
