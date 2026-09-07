self.addEventListener('install', (e) => {
    e.waitUntil(
        caches.open('polycom-v1').then((cache) => {
            return cache.addAll(['/']);
        })
    );
});

self.addEventListener('fetch', (e) => {
    e.respondWith(
        caches.match(e.request).then((response) => {
            return response || fetch(e.request);
        })
    );
});

self.addEventListener('push', (e) => {
    const data = e.data ? e.data.json() : {};
    const title = data.title || 'New Notification';
    const options = {
        body: data.body || 'You have a new message',
        icon: '/icon-192.png',
        badge: '/icon-192.png'
    };
    e.waitUntil(self.registration.showNotification(title, options));
});