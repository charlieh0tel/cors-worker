const ALLOWED_ORIGIN = "https://charlieh0tel.github.io";

export default {
  async fetch(request) {
    const origin = request.headers.get("Origin");
    if (origin && origin !== ALLOWED_ORIGIN) {
      return new Response("Forbidden origin", { status: 403 });
    }

    const corsHeaders = {
      "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    const targetUrl = new URL(request.url).searchParams.get("url");
    if (!targetUrl) {
      return new Response("Missing ?url= parameter", { status: 400 });
    }

    const response = await fetch(targetUrl, {
      method: request.method,
      headers: { "Content-Type": request.headers.get("Content-Type") || "application/json" },
      body: request.method !== "GET" && request.method !== "HEAD" ? request.body : null,
    });

    const newHeaders = new Headers(response.headers);
    Object.entries(corsHeaders).forEach(([k, v]) => newHeaders.set(k, v));

    return new Response(response.body, {
      status: response.status,
      headers: newHeaders,
    });
  },
};
