const CACHE_NAME = 'mm-cache-v1';
const ASSETS = [
  '/', '/index.html', '/style.css', '/script.js', '/manifest.json',
  '/assets/icon-192.png', '/assets/icon-512.png',
  // Fallback images (replace with your real assets)
  '/assets/aurora-fallback.jpg',
  '/assets/stock/table.jpg', '/assets/stock/chair.jpg', '/assets/stock/window.jpg', '/assets/stock/door.jpg', '/assets/stock/placard.jpg',
  '/assets/gallery/door-before.jpg', '/assets/gallery/door-after.jpg',
  '/assets/gallery/table-before.jpg', '/assets/gallery/table-after.jpg',
  '/assets/avatars/a1.png', '/assets/avatars/a2.png', '/assets/avatars/a3.png',
  '/assets/community/c1.jpg', '/assets/community/c2.jpg', '/assets/community/c3.jpg', '/assets/community/c4.jpg',
  '/assets/ar/table.png', '/assets/ar/door.png', '/assets/ar/chair.png',
  '/assets/qr-whatsapp.png', '/assets/qr-site.png'
];

self.addEventListener('install', (e)=>{
  e.waitUntil(caches.open(CACHE_NAME).then(cache=> cache.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', (e)=>{
  e.waitUntil(caches.keys().then(keys=> Promise.all(keys.map(k=> k!==CACHE_NAME && caches.delete(k)))));
  self.clients.claim();
});

self.addEventListener('fetch', (e)=>{
  const url = new URL(e.request.url);
  // Network-first for HTML, cache-first for assets
  if (e.request.mode === 'navigate' || (e.request.headers.get('accept')||'').includes('text/html')) {
    e.respondWith(fetch(e.request).then(res=>{
      const copy = res.clone();
      caches.open(CACHE_NAME).then(c=> c.put(e.request, copy));
      return res;
    }).catch(()=> caches.match(e.request)));
  } else {
    e.respondWith(caches.match(e.request).then(cached=> cached || fetch(e.request).then(res=>{
      const copy = res.clone();
      caches.open(CACHE_NAME).then(c=> c.put(e.request, copy));
      return res;
    }).catch(()=> cached )));
  }
});
