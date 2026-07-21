self.addEventListener('push', function(event) {
  let data = {title: 'Allo Dakar', body: 'Nouvelle activité'};
  try { data = event.data ? event.data.json() : data; } catch(e) {}
  event.waitUntil(
    self.registration.showNotification(data.title || 'Allo Dakar', {
      body: data.body || ''
    })
  );
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  event.waitUntil(clients.openWindow('/'));
});
