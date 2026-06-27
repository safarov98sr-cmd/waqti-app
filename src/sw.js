import { precacheAndRoute, cleanupOutdatedCaches, createHandlerBoundToURL } from 'workbox-precaching'
import { registerRoute, NavigationRoute } from 'workbox-routing'
import { NetworkFirst } from 'workbox-strategies'
import { ExpirationPlugin } from 'workbox-expiration'

precacheAndRoute(self.__WB_MANIFEST)
cleanupOutdatedCaches()

self.skipWaiting()
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()))

registerRoute(new NavigationRoute(createHandlerBoundToURL('index.html')))

registerRoute(
  /^https:\/\/api\.aladhan\.com\/.*/i,
  new NetworkFirst({
    cacheName: 'prayer-times',
    plugins: [new ExpirationPlugin({ maxEntries: 10, maxAgeSeconds: 86400 })],
  }),
  'GET'
)

// ── Push notification handler ──
self.addEventListener('push', event => {
  const data = event.data?.json() ?? {}
  event.waitUntil(
    self.registration.showNotification(data.title || 'Waqti', {
      body:      data.body  || '',
      icon:      '/icon-192.png',
      badge:     '/icon-192.png',
      tag:       data.tag   || 'prayer',
      renotify:  true,
      data:      { url: '/' },
    })
  )
})

self.addEventListener('notificationclick', event => {
  event.notification.close()
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clients => {
      const existing = clients.find(c => 'focus' in c)
      return existing ? existing.focus() : self.clients.openWindow('/')
    })
  )
})
