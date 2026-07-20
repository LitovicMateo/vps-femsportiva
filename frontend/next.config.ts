import type { NextConfig } from "next";
import type { RemotePattern } from "next/dist/shared/lib/image-config";

/**
 * Build the image optimizer's remote allowlist from the configured WordPress /
 * site origins instead of the previous open `hostname: "**"` (which turned the
 * `/_next/image` optimizer into an open proxy — an SSRF/abuse surface). Falls
 * back to a permissive pattern only if nothing is configured at build time, so
 * images never silently break.
 */
function buildRemotePatterns(): RemotePattern[] {
  const origins = [
    process.env.NEXT_PUBLIC_WORDPRESS_URL,
    process.env.NEXT_PUBLIC_SITE_URL,
  ].filter((v): v is string => Boolean(v));

  const patterns: RemotePattern[] = [];
  const seen = new Set<string>();

  for (const origin of origins) {
    try {
      const url = new URL(origin);
      const key = `${url.protocol}//${url.host}`;
      if (seen.has(key)) continue;
      seen.add(key);
      patterns.push({
        protocol: url.protocol.replace(":", "") as "http" | "https",
        hostname: url.hostname,
        ...(url.port ? { port: url.port } : {}),
        pathname: "/**",
      });
    } catch {
      // Ignore malformed origins.
    }
  }

  // Author avatars come from Gravatar.
  patterns.push({ protocol: "https", hostname: "secure.gravatar.com" });

  if (patterns.length === 1) {
    // Only the Gravatar entry — no WP/site origin configured. Keep a permissive
    // fallback so builds without env still render images.
    patterns.push({ protocol: "https", hostname: "**" });
    patterns.push({ protocol: "http", hostname: "**" });
  }

  return patterns;
}

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: buildRemotePatterns(),
  },
};

export default nextConfig;
