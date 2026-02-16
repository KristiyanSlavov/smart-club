// Service Worker for Web Push Notifications

self.addEventListener("push", (event) => {
  const raw = event.data ? event.data.text() : "";
  console.log("[sw] Push received:", raw);

  let data = {};
  try {
    data = JSON.parse(raw);
  } catch {
    console.warn("[sw] Failed to parse push payload as JSON");
  }

  const title = data.title || "Smart Club";
  const options = {
    body: data.body || "",
    icon: "/icon-192.png",
    badge: "/icon-192.png",
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && "focus" in client) {
            return client.focus();
          }
        }
        return clients.openWindow("/");
      })
  );
});
