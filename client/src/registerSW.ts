export function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      // Unregister existing service workers in dev mode to avoid WebKit loop
      if (import.meta.env.DEV) {
        navigator.serviceWorker.getRegistrations().then(registrations => {
          for (let registration of registrations) {
            registration.unregister();
          }
        });
        // Clear caches
        if ('caches' in window) {
          caches.keys().then(names => {
            for (let name of names) {
              caches.delete(name);
            }
          });
        }
        return;
      }

      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('SW registered: ', registration);
        })
        .catch((registrationError) => {
          console.log('SW registration failed: ', registrationError);
        });
    });
  }
}

