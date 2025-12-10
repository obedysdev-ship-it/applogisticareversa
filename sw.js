const CACHE_NAME = 'gdm-reversa-v2'
const ASSETS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/src/main.jsx',
  '/src/index.css',
  '/logologisticareversa.png'
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))))
  )
})

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) => {
      return cached || fetch(event.request).then((response) => {
        try {
          const url = new URL(event.request.url)
          if (event.request.method === 'GET' && url.origin === self.location.origin) {
            const clone = response.clone()
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone)).catch(() => {})
          }
        } catch {}
        return response
      }).catch(() => cached)
    })
  )
})
