import type { NextConfig } from "next";

const buildTarget = process.env.BUILD_TARGET;
const isGitHubPages = buildTarget === "github-pages";
const isStaticExport = isGitHubPages || buildTarget === "netlify";
const basePath = isGitHubPages ? "/voces-hku" : "";

const nextConfig: NextConfig = {
  output: isStaticExport ? "export" : undefined,
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
