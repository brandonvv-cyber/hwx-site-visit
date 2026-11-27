const CACHE = 'hwx-visit-v15';
const SHELL = ['./', 'index.html', 'manifest.webmanifest', 'icon-180.png', 'icon-192.png', 'icon-512.png', 'questions.json', 'shop.html', 'shop.webmanifest', 'spec.js', 'quote.js', 'logo.jpg', 'catdata.js', 'cat.js', 'sauna.js', 'pipe.js'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL.map(u => new Request(u, { cache: 'reload' })))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
/* Background send (Android Chrome): when signal returns while the app is shut, send the waiting answers and photos.
   Videos wait for the app to be opened. The page and this sender share the lock "hwx-sync", so nothing goes twice. */
function idb() {
  return new Promise((res, rej) => {
    const r = indexedDB.open('hwx-visit', 1);
    r.onupgradeneeded = () => { const d = r.result; if (!d.objectStoreNames.contains('kv')) d.createObjectStore('kv'); if (!d.objectStoreNames.contains('photos')) d.createObjectStore('photos', { keyPath: 'id', autoIncrement: true }); };
    r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error);
  });
}
const rq = r => new Promise((res, rej) => { r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); });
function clearDirty(d, id, sent) {   // one transaction, so an answer typed meanwhile is never overwritten
  return new Promise((res, rej) => {
    const t = d.transaction('kv', 'readwrite'), s = t.objectStore('kv'), g = s.get('job:' + id);
    g.onsuccess = () => { const rec = g.result; if (rec && rec.ans) { for (const x of sent) { const c = rec.ans[x.code]; if (c && c.ts === x.ts) c.dirty = false; } s.put(rec, 'job:' + id); } };
    t.oncomplete = () => res(); t.onerror = () => rej(t.error);
  });
}
function markSent(d, pid, driveId) {
  return new Promise((res, rej) => {
    const t = d.transaction('photos', 'readwrite'), s = t.objectStore('photos'), g = s.get(pid);
    g.onsuccess = () => { const p = g.result; if (p) { p.sent = true; p.driveId = driveId; s.put(p); } };
    t.oncomplete = () => res(); t.onerror = () => rej(t.error);
  });
}
async function toB64(blob) {
  const buf = new Uint8Array(await blob.arrayBuffer()); let s = '';
  for (let i = 0; i < buf.length; i += 0x8000) s += String.fromCharCode.apply(null, buf.subarray(i, i + 0x8000));
  return btoa(s);
}
async function bgSend() {
  const d = await idb();
  const kv = k => rq(d.transaction('kv').objectStore('kv').get(k));
  const cfg = await kv('swcfg'); if (!cfg || !cfg.api) return;
  const keys = (await kv('jobs')) || [];
  const photos = await rq(d.transaction('photos').objectStore('photos').getAll());
  let failed = false;
  for (const id of keys) {
    const j = await kv('job:' + id);
    if (!j || !j.token || j.pending) continue;
    const post = body => fetch(cfg.api, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(Object.assign({ job: j.id, t: j.token, device: cfg.device }, body)) }).then(r => r.json());
    try {
      const dirty = Object.entries(j.ans || {}).filter(([, a]) => a.dirty);
      if (dirty.length) {
        const items = dirty.map(([code, a]) => ({ code, answer: Array.isArray(a.v) ? a.v.join('; ') : a.v, other: a.o || '', tab: a.tab || '', q: a.q || '', ts: a.ts }));
        const r = await post({ action: 'answers', items });
        if (!r.ok) throw new Error(r.error || 'server said no');
        await clearDirty(d, j.id, dirty.map(([code, a]) => ({ code, ts: a.ts })));
      }
      for (const p of photos.filter(x => x.job === j.id && !x.sent && !x.video)) {
        const r = await post({ action: 'photo', code: p.code, name: p.name, mime: 'image/jpeg', b64: await toB64(p.blob), ts: p.ts });
        if (!r.ok) throw new Error(r.error || 'photo failed');
        await markSent(d, p.id, r.id);
      }
    } catch (err) { failed = true; }
  }
  if (failed) throw new Error('retry');   // the browser tries again later
}
self.addEventListener('sync', e => {
  if (e.tag !== 'hwx-send') return;
  e.waitUntil(navigator.locks ? navigator.locks.request('hwx-sync', { ifAvailable: true }, l => l ? bgSend() : null) : bgSend());
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;           // Google script calls go straight to the network
  if (url.pathname.endsWith('questions.json')) {         // newest questions when online, saved copy when not
    e.respondWith(fetch(req).then(r => { const copy = r.clone(); caches.open(CACHE).then(c => c.put('questions.json', copy)); return r; })
      .catch(() => caches.match('questions.json')));
    return;
  }
  if (req.mode === 'navigate') {                         // always open the saved app first, refresh it in the background
    const page = url.pathname.endsWith('shop.html') ? 'shop.html' : 'index.html';   // shop counter page (EC-010) or the technician app
    e.respondWith(caches.match(page).then(hit => {
      const net = fetch(req).then(r => { const copy = r.clone(); caches.open(CACHE).then(c => c.put(page, copy)); return r; }).catch(() => null);
      return hit || net;
    }));
    return;
  }
  e.respondWith(caches.match(req, { ignoreSearch: true }).then(hit => hit || fetch(req)));
});
