import type { D1Database } from "@cloudflare/workers-types";
import { sendPushNotification } from "@mmmike/web-push/send";

interface Env {
  DB: D1Database;
  VAPID_PUBLIC_KEY: string;
  VAPID_PRIVATE_KEY: string;
  VAPID_SUBJECT: string;
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

    if (
      url.pathname === "/api/test-push" &&
      request.method === "POST"
    ) {
      const subscription = await env.DB.prepare(
        `
          SELECT endpoint, p256dh, auth
          FROM push_subscriptions
          ORDER BY id DESC
          LIMIT 1
        `
      ).first<{
        endpoint: string;
        p256dh: string;
        auth: string;
      }>();

      if (!subscription) {
        return Response.json(
          {
            ok: false,
            error: "No push subscription found",
          },
          { status: 404 }
        );
      }

      const delivered = await sendPushNotification(
        {
          endpoint: subscription.endpoint,
          keys: {
            p256dh: subscription.p256dh,
            auth: subscription.auth,
          },
        },
        {
          title: "PWA Push Lab",
          body: "テスト通知です",
          url: "/",
        },
        {
          publicKey: env.VAPID_PUBLIC_KEY,
          privateKey: env.VAPID_PRIVATE_KEY,
          subject: env.VAPID_SUBJECT,
        }
      );

      console.log("Push result:", delivered);

      return Response.json({
        ok: true,
        delivered,
      });
    }

    return new Response("Not found", { status: 404 });
  },
};