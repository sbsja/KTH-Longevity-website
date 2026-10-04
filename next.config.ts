import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static HTML per route: deployable to any static host. `next build` writes to ./out
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  reactStrictMode: true,
  transpilePackages: ["three"],
};

export default nextConfig;
