import { useEffect, useState } from "react";

type HealthResponse = {
  ok: boolean;
  service: string;
};

export function App() {
  const [apiStatus, setApiStatus] = useState("確認中...");

  useEffect(() => {
    fetch("/api/health")
      .then((response) => {
        if (!response.ok) throw new Error("API request failed");
        return response.json() as Promise<HealthResponse>;
      })
      .then((data) => setApiStatus(data.ok ? "接続できています" : "接続できません"))
      .catch(() => setApiStatus("接続できません"));
  }, []);

  return (
    <main className="container">
      <p className="eyebrow">PWA Push Lab</p>
      <h1>予約Push通知を最小構成で試す</h1>
      <p>
        React と Cloudflare Workers で、iPhone対応PWAの予約Web Push通知を
        一段ずつ実装する検証用アプリです。
      </p>

      <section className="status">
        <strong>Worker API</strong>
        <span>{apiStatus}</span>
      </section>
    </main>
  );
}
