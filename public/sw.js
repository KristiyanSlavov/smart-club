self.addEventListener("push", (event) => {
  // Guard: skip if no data at all
  if (!event.data) return;

  let data;
  try {
    data = event.data.json();
  } catch (e) {
    const text = event.data.text();
    if (!text) return; // empty payload — do not show a blank notification
    data = { title: "Smart Club", body: text };
  }

  // Guard: skip malformed payloads that have no body
  if (!data || !data.body) return;

  const options = {
    body: data.body,
    vibrate: [100, 50, 100],
    tag: "smartclub", // Android replaces instead of stacking
    renotify: true,   // still vibrate/sound on replacement
    data: { url: data.url || "/" },
  };

  event.waitUntil(self.registration.showNotification(data.title || "Smart Club", options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const raw = event.notification.data?.url || "/";
  const targetUrl = raw.startsWith("http") ? raw : new URL(raw, self.location.origin).href;

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((windowClients) => {
        for (const client of windowClients) {
          if (new URL(client.url).pathname === new URL(targetUrl).pathname) {
            client.navigate(targetUrl);
            return client.focus();
          }
        }
        return clients.openWindow(targetUrl);
      })
  );
});