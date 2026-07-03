export function validateOrigin(req: Request): boolean {
  const origin = req.headers.get("origin");
  const referer = req.headers.get("referer");
  const host = req.headers.get("host");
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;

  const allowedOrigins = [
    appUrl,
    "http://localhost:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3000",
  ].filter(Boolean);

  if (!origin && !referer) {
    console.log("[CSRF DIAG] No origin and no referer → allowed (non-browser request)");
    return true;
  }

  const checkUrl = origin || referer || "";
  try {
    const parsed = new URL(checkUrl);
    const match = allowedOrigins.some((allowed) => {
      if (!allowed) return false;
      try {
        const allowedParsed = new URL(allowed);
        return parsed.origin === allowedParsed.origin;
      } catch {
        return false;
      }
    });

    if (!match) {
      console.log("[CSRF DIAG] BLOCKED", JSON.stringify({
        origin,
        referer,
        host,
        appUrl,
        checkUrl,
        parsedOrigin: parsed.origin,
        allowedOrigins,
      }));
    }

    return match;
  } catch (e) {
    console.log("[CSRF DIAG] URL parse FAILED", JSON.stringify({
      origin,
      referer,
      host,
      appUrl,
      checkUrl,
      error: String(e),
    }));
    return false;
  }
} 

export function csrfGuard(req: Request): Response | null {
  if (req.method === "GET" || req.method === "HEAD" || req.method === "OPTIONS") {
    return null;
  }

  if (!validateOrigin(req)) {
    const origin = req.headers.get("origin");
    const referer = req.headers.get("referer");
    console.log("[CSRF GUARD] Returning 403 for", req.method, req.url, JSON.stringify({ origin, referer }));
    return new Response(JSON.stringify({ error: "CSRF validation failed" }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }

  return null;
}
