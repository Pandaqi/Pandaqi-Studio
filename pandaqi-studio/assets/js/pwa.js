// HTML files: try the network first, then the cache.
// Other files: try the cache first, then the network.
// Both: cache a fresh version if possible.
// (beware: the cache will grow and grow; there's no cleanup)
// @SOURCE: https://adactio.com/journal/13540
// @SOURCE (with slightly advanced functionality): https://2018.ampersandconf.com/serviceworker.js

const cacheName = 'files-v3';

addEventListener('install', (ev) => { console.log('PWA installing ... '); });

// this removes any old junk we might leave behind
// (when going to new cacheName, which I should do regularly)
addEventListener('activate', (ev) => {
  ev.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.map(key => {
        const notCurrentCache = (key != cacheName);
        if(notCurrentCache) { return caches.delete(key); }
      })
    )).then(() => {
      console.log('PWA succesfully activated ... ');
    })
  );
});

// whenever ANYTHING is requested,
// HTML => first get live, then cache
// ELSE => first get cache, but save live version for later
// NO support for if both fails, see sources at the top
addEventListener('fetch', fetchEvent => {
  const request = fetchEvent.request;

  if (request.method !== 'GET') { return; }

  fetchEvent.respondWith(async function() {
    
    const responseFromFetch = fetch(request);
    fetchEvent.waitUntil(async function() {
      const responseCopy = (await responseFromFetch).clone();
      const myCache = await caches.open(cacheName);
      await myCache.put(request, responseCopy);
    }());

    if (request.headers.get('Accept').includes('text/html')) {
      try {
        return await responseFromFetch;
      }
      catch(error) {
        return caches.match(request);
      }
    } else {
      const responseFromCache = await caches.match(request);
      return responseFromCache || responseFromFetch;
    }
  }());
});