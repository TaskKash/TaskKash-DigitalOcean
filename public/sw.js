/* ============================================================
   TaskKash Service Worker  v5.0
   Strategy:
   - Static assets  → Cache-First (then update cache in bg)
   - Navigation     → Network-First → fallback to cache → offline.html
   - API calls      → Network-Only (never cached)
   ============================================================ */

const CACHE_VERSION = 'taskkash-v6';
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const RUNTIME_CACHE = `${CACHE_VERSION}-runtime`;

// Files to pre-cache on install
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/offline.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
];

// ── Install ──────────────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(PRECACHE_URLS);
    })
  );
  // Activate immediately — don't wait for old SW to die
  self.skipWaiting();
});

// ── Activate ─────────────────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames
          .filter((name) => name !== STATIC_CACHE && name !== RUNTIME_CACHE)
          .map((name) => caches.delete(name))
      )
    ).then(() => {
      // Tell all open clients a new SW is active
      self.clients.matchAll({ includeUncontrolled: true }).then((clients) => {
        clients.forEach((client) =>
          client.postMessage({ type: 'SW_UPDATED', version: CACHE_VERSION })
        );
      });
      return self.clients.claim();
    })
  );
});

// ── Fetch ─────────────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // 1. API calls — always go to network, never cache
  if (
    url.pathname.startsWith('/api/') ||
    url.pathname.startsWith('/api/trpc')
  ) {
    event.respondWith(fetch(request));
    return;
  }

  // 2. Navigation requests (HTML pages) — network-first, offline fallback
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache successful navigations
          if (response.ok) {
            const clone = response.clone();
            caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(() =>
          caches.match(request).then(
            (cached) => cached || caches.match('/offline.html')
          )
        )
    );
    return;
  }

  // 3. Static assets — stale-while-revalidate (serve from cache, refresh in background)
  if (
    url.pathname.match(/\.(js|css|png|jpg|jpeg|svg|gif|webp|woff|woff2|ico)$/)
  ) {
    event.respondWith(
      caches.open(RUNTIME_CACHE).then((cache) =>
        cache.match(request).then((cached) => {
          const fetchPromise = fetch(request)
            .then((response) => {
              if (response && response.status === 200) {
                cache.put(request, response.clone());
              }
              return response;
            })
            .catch(() => cached); // network failed → serve stale

          return cached || fetchPromise;
        })
      )
    );
    return;
  }

  // 4. Everything else — network with cache fallback
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response && response.status === 200 && response.type === 'basic') {
          const clone = response.clone();
          caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, clone));
        }
        return response;
      })
      .catch(() => caches.match(request))
  );
});

// ── Push Notifications ────────────────────────────────────────
self.addEventListener('push', (event) => {
  let data = {
    title: 'TaskKash',
    body: 'لديك إشعار جديد',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    url: '/',
    tag: 'taskkash-notification',
  };

  if (event.data) {
    try {
      const parsed = event.data.json();
      data = { ...data, ...parsed };
    } catch {
      data.body = event.data.text();
    }
  }

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: data.icon,
      badge: data.badge,
      tag: data.tag,
      data: { url: data.url },
      requireInteraction: false,
      vibrate: [200, 100, 200],
    })
  );
});

// ── Notification Click ────────────────────────────────────────
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || '/';

  event.waitUntil(
    clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((windowClients) => {
        // Focus existing window if already open at target URL
        for (const client of windowClients) {
          if (client.url.includes(targetUrl) && 'focus' in client) {
            return client.focus();
          }
        }
        // Otherwise focus any open window and navigate
        for (const client of windowClients) {
          if ('focus' in client) {
            return client.focus().then(() => client.navigate(targetUrl));
          }
        }
        // Or open a new window
        if (clients.openWindow) {
          return clients.openWindow(targetUrl);
        }
      })
  );
});

// ── Background Sync ───────────────────────────────────────────
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-pending-tasks') {
    event.waitUntil(syncPendingTasks());
  }
});

async function syncPendingTasks() {
  try {
    // Placeholder: In production, replay any queued API requests stored in IndexedDB
    console.log('[SW] Background sync: syncing pending tasks...');
  } catch (err) {
    console.error('[SW] Background sync failed:', err);
  }
}
