export function validateOrigin(req: Request): boolean {
  const origin = req.headers.get("origin");
  const referer = req.headers.get("referer");

  if (!origin && !referer) {
    return true;
  }

  const allowedOrigins = [
    process.env.NEXT_PUBLIC_APP_URL,
    "http://localhost:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3000",
  ].filter(Boolean);

  const checkUrl = origin || referer || "";
  try {
    const parsed = new URL(checkUrl);
    return allowedOrigins.some((allowed) => {
      if (!allowed) return false;
      try {
        const allowedParsed = new URL(allowed);
        return parsed.origin === allowedParsed.origin;
      } catch {
        return false;
      }
    });
  } catch {
    return false;
  }
}

export function csrfGuard(req: Request): Response | null {
  if (req.method === "GET" || req.method === "HEAD" || req.method === "OPTIONS") {
    return null;
  }

  if (!validateOrigin(req)) {
    return new Response(JSON.stringify({ error: "CSRF validation failed" }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }

  return null;
}
