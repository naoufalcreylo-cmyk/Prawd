import type { NextConfig } from "next";
import path from "node:path";

const indexable = process.env.NEXT_PUBLIC_ALLOW_INDEXING === "true";

const nextConfig: NextConfig = {
  turbopack: { root: path.resolve(__dirname) },
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 828, 1080, 1440, 1920, 2400],
    imageSizes: [160, 256, 384, 512],
    qualities: [75, 82],
  },
  // /search renders on demand and reads articles from disk.
  outputFileTracingIncludes: { "/search": ["./content/**/*"] },
  async headers() {
    const security = [
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "X-Frame-Options", value: "SAMEORIGIN" },
    ];
    if (!indexable) security.push({ key: "X-Robots-Tag", value: "noindex, nofollow" });
    return [{ source: "/:path*", headers: security }];
  },
};

export default nextConfig;
