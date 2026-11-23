/* EduGrade service worker — app shell works offline; Firestore data is handled by the Firebase SDK's own offline cache. */
const VERSION = "edugrade-v1";
const PAGES = VERSION + "-pages";
const STATIC = VERSION + "-static";
const EXTERNAL_OK = ["cdnjs.cloudflare.com", "fonts.googleapis.com", "fonts.gstatic.com"];

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(PAGES).then((c) => c.addAll(["/", "/manifest.json", "/icon-192.png"])).catch(() => {})
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => !k.startsWith(VERSION)).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

const cacheable = (res) => res && (res.ok || res.type === "opaque");

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  const fetching = fetch(request)
    .then((res) => { if (cacheable(res)) cache.put(request, res.clone()); return res; })
    .catch(() => cached);
  return cached || fetching;
}

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;
  const res = await fetch(request);
  if (cacheable(res)) cache.put(request, res.clone());
  return res;
}

async function networkFirstPage(request) {
  const cache = await caches.open(PAGES);
  try {
    const res = await fetch(request);
    if (res.ok) cache.put("/", res.clone());
    return res;
  } catch (e) {
    return (await cache.match(request)) || (await cache.match("/")) || Response.error();
  }
}

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);

  // Never intercept Firebase / Google API traffic — the SDK manages its own offline queue.
  if (/googleapis\.com$/.test(url.hostname) && url.hostname !== "fonts.googleapis.com") return;
  if (url.hostname.endsWith("firebaseio.com") || url.hostname.endsWith("firebaseapp.com")) return;

  if (url.origin !== self.location.origin) {
    if (EXTERNAL_OK.includes(url.hostname)) event.respondWith(staleWhileRevalidate(req, STATIC));
    return;
  }

  if (req.mode === "navigate") { event.respondWith(networkFirstPage(req)); return; }
  if (url.pathname.startsWith("/_next/static/")) { event.respondWith(cacheFirst(req, STATIC)); return; }
  if (url.pathname.startsWith("/_next/") || url.pathname.startsWith("/api/")) return;
  event.respondWith(staleWhileRevalidate(req, STATIC));
});

self.addEventListener("message", (event) => {
  if (event.data === "SKIP_WAITING") self.skipWaiting();
});
