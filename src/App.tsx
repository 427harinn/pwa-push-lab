import { useEffect, useState } from "react";

const VAPID_PUBLIC_KEY = "BG7aFLQ6Nsdg7rEq4ea9IadQl2Cy8C8wYQTBZzTBuvfkEimntsV_MWzuYB1BQIyfIWJ6UZHvL44xZ2krPEjhRIs";

type HealthResponse = {
  ok: boolean;
  service: string;
};

export function App() {
  const [apiStatus, setApiStatus] = useState("確認中...");
  const [notificationStatus, setNotificationStatus] = useState<
    NotificationPermission | "unsupported"
  >(() =>
    typeof Notification === "undefined"
      ? "unsupported"
      : Notification.permission
  );

  useEffect(() => {
    fetch("/api/health")
      .then((response) => {
        if (!response.ok) throw new Error("API request failed");
        return response.json() as Promise<HealthResponse>;
      })
      .then((data) => setApiStatus(data.ok ? "接続できています" : "接続できません"))
      .catch(() => setApiStatus("接続できません"));
  }, []);

  async function requestNotificationPermission() {
    if (typeof Notification === "undefined") {
      setNotificationStatus("unsupported");
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      setNotificationStatus(permission);
    } catch {
      setNotificationStatus(Notification.permission);
    }
  }

  async function subscribeToPush() {
    if(Notification.permission !== "granted") {
      return;
    }

    const registration = await navigator.serviceWorker.ready;

    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: VAPID_PUBLIC_KEY,
    });

    console.log("PushSubscription:", subscription);
    console.log("PushSubscription JSON:", subscription.toJSON());
  }

  return (
    <main className="container">
      <p className="eyebrow">PWA Push Lab</p>

      <h1>PWAの基本構成を確認する</h1>

      <p>
        React と Cloudflare Workers で構成したPWAです。アプリからWorker APIへの
        接続状態を確認できます。
      </p>

      <section className="status">
        <strong>Worker API</strong>
        <span>{apiStatus}</span>
      </section>

      <section className="status">
        <strong>通知権限</strong>
        <span>{notificationStatus}</span>
      </section>

      <button
        onClick={requestNotificationPermission}
        disabled={notificationStatus === "unsupported"}
      >
        通知を有効にする
      </button>

      <button
        onClick={subscribeToPush}
        disabled={notificationStatus !== "granted"}
      >
        Push通知を登録する
      </button>
    </main>
  );
}
