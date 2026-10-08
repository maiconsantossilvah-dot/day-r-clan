const APP_CACHE = "day-r-clan-hub-v4";
const WIKI_IMAGE_CACHE = "day-r-wiki-images-v1";
const MAX_WIKI_IMAGES = 80;
const APP_SHELL = [
  "./", "./index.html", "./404.html", "./manifest.webmanifest", "./data/wiki-items.json", "./data/wiki-sync-state.json", "./data/item-descriptions-pt-BR.json",
  "./assets/css/reset.css", "./assets/css/variables.css", "./assets/css/base.css", "./assets/css/layout.css", "./assets/css/components.css", "./assets/css/responsive.css", "./assets/css/item-picker.css", "./assets/css/polish.css",
  "./assets/icons/favicon.svg", "./assets/icons/logo.svg", "./assets/images/placeholders/item-placeholder.svg", "./assets/images/placeholders/clan-placeholder.svg",
  "./assets/js/app.js", "./assets/js/router.js", "./assets/js/config.js", "./assets/js/webmcp.js"
];

async function trimCache(cacheName, maxEntries) {
  const cache = await caches.open(cacheName); const keys = await cache.keys();
  await Promise.all(keys.slice(0, Math.max(0, keys.length - maxEntries)).map(key => cache.delete(key)));
}

self.addEventListener("install", event => { event.waitUntil(caches.open(APP_CACHE).then(cache => cache.addAll(APP_SHELL))); self.skipWaiting(); });
self.addEventListener("activate", event => { event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => ![APP_CACHE,WIKI_IMAGE_CACHE].includes(key)).map(key => caches.delete(key))))); self.clients.claim(); });
self.addEventListener("fetch", event => {
  const request = event.request; if (request.method !== "GET") return; const url = new URL(request.url);
  if (url.hostname === "dayr.wiki.gg" && request.destination === "image") {
    event.respondWith(caches.open(WIKI_IMAGE_CACHE).then(async cache => { const cached=await cache.match(request); if(cached)return cached; try{const response=await fetch(request);if(response.ok){await cache.put(request,response.clone());await trimCache(WIKI_IMAGE_CACHE,MAX_WIKI_IMAGES)}return response}catch{return new Response("",{status:503})} }));
    return;
  }
  if (url.origin !== self.location.origin) return;
  event.respondWith(fetch(request).then(response => { if (response.ok && ["document","script","style","image","manifest",""] .includes(request.destination)) caches.open(APP_CACHE).then(cache => cache.put(request,response.clone())); return response; }).catch(() => caches.match(request).then(cached => cached || (request.mode === "navigate" ? caches.match("./index.html") : Response.error()))));
});
