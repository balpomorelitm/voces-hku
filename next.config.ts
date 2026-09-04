import type { NextConfig } from "next";

const isGitHubPages = process.env.BUILD_TARGET === "github-pages";
const basePath = isGitHubPages ? "/voces-hku" : "";

const nextConfig: NextConfig = {
  output: isGitHubPages ? "export" : undefined,
  basePath,
  assetPrefix: basePath || undefined,
  trailingSlash: true,
  images: { unoptimized: true },
  turbopack: { root: process.cwd() },
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
};

export default nextConfig;
