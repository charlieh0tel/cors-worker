const GITHUB_IO_URL = "https://charlieh0tel.github.io";

const ALLOWED_ORIGINS = new Set([
  GITHUB_IO_URL,
  // For debug only.
  //  "http://127.0.0.1:8000",
  //  "http://localhost:8000",
]);

export default {
  async fetch(request) {
    const origin = request.headers.get("Origin");
    const isAllowedOrigin = origin && ALLOWED_ORIGINS.has(origin);

    if (origin && !isAllowedOrigin) {
      return new Response("Forbidden origin", { status: 403 });
    }

    const corsHeaders = {
      "Access-Control-Allow-Origin": isAllowedOrigin ? origin : GITHUB_IO_URL,
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Vary": "Origin",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    if (request.method !== "GET") {
      return new Response("Method not allowed", { status: 405, headers: corsHeaders });
    }

    const targetUrl = new URL(request.url).searchParams.get("url");
    if (!targetUrl) {
      return new Response("Missing ?url= parameter", { status: 400, headers: corsHeaders });
    }

    try {
      const response = await fetch(targetUrl, {
        cf: { cacheTtl: 3600, cacheEverything: true },
      });

      const newHeaders = new Headers(response.headers);
      Object.entries(corsHeaders).forEach(([k, v]) => newHeaders.set(k, v));

      return new Response(response.body, {
        status: response.status,
        headers: newHeaders,
      });
    } catch {
      return new Response("Invalid or unreachable target URL", { status: 502, headers: corsHeaders });
    }
  },
};
