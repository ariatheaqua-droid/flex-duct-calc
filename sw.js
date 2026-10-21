const CACHE = 'flex-duct-v2';
const FILES = ['./', './index.html', './manifest.webmanifest', './icon-180.png', './icon-192.png', './icon-512.png'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  // 同じ github.io にある他のアプリ(a3-split など)の保存データは消さない
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith('flex-duct-') && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  // 画面は通信できれば最新版を出して保存し直す。圏外のときだけ保存済みを出す
  if (e.request.mode === 'navigate') {
    e.respondWith(fetch(e.request).then(res => {
      if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(e.request.url, copy)); }
      return res;
    }).catch(() => caches.match(e.request, {ignoreSearch: true}).then(hit => hit || caches.match('./index.html'))));
    return;
  }
  e.respondWith(caches.match(e.request, {ignoreSearch: true}).then(hit => hit || fetch(e.request)));
});
