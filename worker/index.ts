export default {
  async fetch(request: Request): Promise<Response> {
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
      const subscription = await request.json();

      console.log("Received subscription:", subscription);

      return Response.json({
        ok: true,
      });
    }

    return new Response("Not found", { status: 404 });
  },
};