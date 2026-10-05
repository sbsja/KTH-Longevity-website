import type { NextConfig } from "next";

// Empty for a domain root; "/<repository>" for a GitHub Pages project site (see src/lib/assetPath.ts).
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || undefined;

const nextConfig: NextConfig = {
  // Static HTML per route: deployable to any static host. `next build` writes to ./out
  output: "export",
  basePath,
  assetPrefix: basePath,
  trailingSlash: true,
  images: { unoptimized: true },
  reactStrictMode: true,
  transpilePackages: ["three"],
};

export default nextConfig;
