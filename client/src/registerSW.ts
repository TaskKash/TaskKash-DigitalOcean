export function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return;

  window.addEventListener('load', () => {
    // In dev mode — unregister workers and clear caches to avoid loops
    if (import.meta.env.DEV) {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        for (const r of registrations) r.unregister();
      });
      if ('caches' in window) {
        caches.keys().then((names) => {
          for (const name of names) caches.delete(name);
        });
      }
      return;
    }

    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        console.log('[SW] Registered:', registration.scope);

        // Detect when a new SW is waiting (update available)
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (!newWorker) return;

          newWorker.addEventListener('statechange', () => {
            if (
              newWorker.state === 'installed' &&
              navigator.serviceWorker.controller
            ) {
              // A new SW is installed but waiting — the active SW will broadcast
              // SW_UPDATED once it activates via skipWaiting. We also dispatch
              // the DOM event here as an additional trigger.
              window.dispatchEvent(new CustomEvent('swUpdated'));
            }
          });
        });
      })
      .catch((err) => {
        console.error('[SW] Registration failed:', err);
      });

    // Listen for messages from the active service worker
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data?.type === 'SW_UPDATED') {
        window.dispatchEvent(new CustomEvent('swUpdated'));
      }
    });
  });
}
