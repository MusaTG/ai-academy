/* Engineering Academy Service Worker — derleme sırasında scripts/postbuild.mjs tarafından doldurulur. */
const VERSION = '__VERSION__';
const SHELL = `academy-shell-${VERSION}`;
const RUNTIME = 'academy-runtime';
const PRECACHE = __PRECACHE__;

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(SHELL).then((c) => c.addAll(PRECACHE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k.startsWith('academy-shell-') && k !== SHELL).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  const url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== self.location.origin) return;
  if (url.pathname.includes('/api/')) return; // API her zaman ağdan; çevrimdışıysa uygulama bunu kendisi yönetir
  // İçerik dizini: önce ağ (güncel sürüm), olmazsa önbellek
  if (url.pathname.endsWith('/content/index.json') || req.mode === 'navigate') {
    e.respondWith(
      fetch(req).then((res) => {
        if (res.ok) { const copy = res.clone(); caches.open(RUNTIME).then((c) => c.put(req.mode === 'navigate' ? './' : req, copy)); }
        return res;
      }).catch(async () => (await caches.match(req.mode === 'navigate' ? './' : req)) || (await caches.match('./')) || Response.error()),
    );
    return;
  }
  // Uygulama kabuğu ve diğer statik dosyalar: önbellek öncelikli
  e.respondWith(caches.match(req).then((hit) => hit || fetch(req)));
});
