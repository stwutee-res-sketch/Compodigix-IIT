/* CompoDigix service worker — keeps the app shell available offline.
   Calculations still need the CompoDigix server; the page shows the last
   results it received when there is no connection. */
const V='cdx-1.2.0';
const SHELL=['./','index.html','manifest.webmanifest','fonts/gsf-latin.woff2','fonts/gsf-latin-ext.woff2','fonts/noto-deva.woff2','fonts/noto-beng.woff2','fonts/noto-guj.woff2','icons/icon-192.png','icons/icon-512.png'];
self.addEventListener('install',e=>{ e.waitUntil(caches.open(V).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting())); });
self.addEventListener('activate',e=>{ e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==V).map(x=>caches.delete(x)))).then(()=>self.clients.claim())); });
self.addEventListener('fetch',e=>{
  const r=e.request; if(r.method!=='GET') return;
  const u=new URL(r.url); if(u.origin!==self.location.origin) return;      // backend calls go straight to the network
  const fresh=r.mode==='navigate'||/\/(index\.html|config\.json)?$/.test(u.pathname)||u.pathname.endsWith('config.json');
  if(fresh){
    e.respondWith(fetch(r).then(res=>{ const c=res.clone(); caches.open(V).then(x=>x.put(r,c)); return res; })
      .catch(()=>caches.match(r).then(m=>m||caches.match('index.html'))));
  } else {
    e.respondWith(caches.match(r).then(m=>m||fetch(r).then(res=>{ if(res.ok){ const c=res.clone(); caches.open(V).then(x=>x.put(r,c)); } return res; })));
  }
});
