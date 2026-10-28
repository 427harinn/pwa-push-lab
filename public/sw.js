self.addEventListener("install", () => {
    console.log("Service Worker: Installed");
});

self.addEventListener("activate", () => {
    console.log("Service Worker: Activated");
});


self.addEventListener("push", (event) => {
  const data = event.data?.json() ?? {};

  event.waitUntil(
    self.registration.showNotification(
      data.title ?? "PWA Push Lab",
      {
        body: data.body ?? "",
        data: {
          url: data.url ?? "/",
        },
      }
    )
  );
});