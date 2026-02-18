self.addEventListener("push", (event) => {
  let data = { title: "Smart Club", body: "Имате ново съобщение", url: null };

  try {
    if (event.data) {
      data = event.data.json();
    }
  } catch (e) {
    console.warn("[sw] Push data was not JSON, using text instead");
    data.body = event.data.text();
  }

  const options = {
    body: data.body,
    vibrate: [100, 50, 100],
    data: { url: data.url || "/", dateOfArrival: Date.now() },
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const raw = event.notification.data?.url || "/";
  // Ensure absolute URL — relative paths won't work on Android
  const targetUrl = raw.startsWith("http") ? raw : new URL(raw, self.location.origin).href;

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((windowClients) => {
        // Try to find an existing tab with this URL and focus it
        for (const client of windowClients) {
          if (new URL(client.url).pathname === new URL(targetUrl).pathname) {
            client.navigate(targetUrl);
            return client.focus();
          }
        }
        // No matching tab — open a new one
        return clients.openWindow(targetUrl);
      })
  );
});