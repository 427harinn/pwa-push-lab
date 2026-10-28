import type { D1Database } from "@cloudflare/workers-types";

interface Env {
  DB: D1Database;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    
    const url = new URL(request.url);

    if (url.pathname === "/api/health") {
      return Response.json({
        ok: true,
        service: "pwa-push-lab",
      });
    }

    if (
      url.pathname === "/api/subscriptions" &&
      request.method === "POST"
    ) {
      const subscription = (await request.json()) as {
        endpoint: string;
        keys: {
          p256dh: string;
          auth: string;
        };
      };
      
      console.log("Before D1 insert:", subscription.endpoint);

      const result = await env.DB.prepare(
        `
          INSERT INTO push_subscriptions (
            endpoint,
            p256dh,
            auth
          )
          VALUES (?, ?, ?)
          ON CONFLICT(endpoint) DO UPDATE SET
            p256dh = excluded.p256dh,
            auth = excluded.auth
        `
      )
        .bind(
          subscription.endpoint,
          subscription.keys.p256dh,
          subscription.keys.auth
        )
        .run();

        console.log("D1 result:", result);


      return Response.json({
        ok: true,
      });
    }

    return new Response("Not found", { status: 404 });
  },
};