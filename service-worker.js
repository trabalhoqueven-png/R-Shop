self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open("loja-cache").then((cache) => {
      return cache.addAll([
        "/",
        "index.html",
        "Home.html",
        "index.css",
        "auth.js",
        "192.png"
      ]);
    })
  );
});

self.addEventListener("fetch", (e) => {
  e.respondWith(
    caches.match(e.request).then((res) => {
      return res || fetch(e.request);
    })
  );
});
