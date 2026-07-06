import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Existing config kept as‑is
  reactCompiler: true,
  allowedDevOrigins: ["10.64.62.117", "*.local", "localhost"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
      { protocol: "https", hostname: "*.blob.vercel-storage.com" },
    ],
  },
  turbopack: { root: process.cwd() },
  // ---- Security Headers -------------------------------------------------
  async headers() {
    const csp = [
      "default-src 'self'",
      "script-src 'self' https://cdn.jsdelivr.net https://www.google.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: blob: https://resend.com https://vercel.com https://*.vercel.app",
      "connect-src 'self' https://api.nexivo.space https://resend.com",
      "media-src blob:",
      "object-src 'none'",
      "frame-src 'none'",
      "base-uri 'self'",
      "form-action 'self' https://api.nexivo.space",
    ].join("; ");
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: csp },
          { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains; preload" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "geolocation=(),camera=(),microphone=(),payment=()" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
          { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
          { key: "Cross-Origin-Embedder-Policy", value: "require-corp" },
          { key: "Origin-Agent-Cluster", value: "?1" },
          { key: "X-DNS-Prefetch-Control", value: "off" },
          { key: "X-Permitted-Cross-Domain-Policies", value: "none" },
        ],
      },
    ];
  },
  // Duplicate configuration removed – the earlier definitions (lines 4‑13) are retained.
};

export default nextConfig;
