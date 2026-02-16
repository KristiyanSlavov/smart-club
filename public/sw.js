self.addEventListener("push", (event) => {
  let data = { title: "Smart Club", body: "Имате ново съобщение" };

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
    // Махаме иконата временно, за да сме сигурни, че не тя блокира банера
    vibrate: [100, 50, 100],
    data: { dateOfArrival: Date.now() }
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});