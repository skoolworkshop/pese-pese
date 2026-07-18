// Eenvoudige service worker voor Pese Pese. Zorgt dat de app offline blijft
// werken nadat die een keer geladen is.

const CACHE = "pesepese-v2";
const KAARTEN = ["B", "V", "H"].flatMap((r) =>
  ["schoppen", "harten", "klaveren", "ruiten"].map(
    (k) => `/cards/${r}_${k}.svg`,
  ),
);
const KERN = [
  "/",
  "/manifest.webmanifest",
  "/icons/icon-192.png",
  "/logo.png",
  ...KAARTEN,
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(KERN)).catch(() => undefined),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((sleutels) =>
        Promise.all(
          sleutels.filter((s) => s !== CACHE).map((s) => caches.delete(s)),
        ),
      ),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  // Navigatieverzoeken: netwerk eerst, val terug op cache of de homepagina.
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const kopie = res.clone();
          caches.open(CACHE).then((c) => c.put(req, kopie)).catch(() => undefined);
          return res;
        })
        .catch(() => caches.match(req).then((r) => r || caches.match("/"))),
    );
    return;
  }

  // Overige verzoeken: cache eerst, daarna netwerk.
  event.respondWith(
    caches.match(req).then((cache) => {
      if (cache) return cache;
      return fetch(req)
        .then((res) => {
          if (res && res.status === 200 && res.type === "basic") {
            const kopie = res.clone();
            caches
              .open(CACHE)
              .then((c) => c.put(req, kopie))
              .catch(() => undefined);
          }
          return res;
        })
        .catch(() => cache);
    }),
  );
});
