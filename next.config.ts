import type { NextConfig } from "next";

const isGitHubPages = process.env.GITHUB_PAGES === "true";
const githubPagesBasePath = process.env.GITHUB_PAGES_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  ...(isGitHubPages
    ? {
        output: "export",
        basePath: githubPagesBasePath,
        assetPrefix: githubPagesBasePath ? `${githubPagesBasePath}/` : undefined,
        images: { unoptimized: true },
        trailingSlash: true,
        typescript: { tsconfigPath: "tsconfig.github.json" },
      }
    : {}),
};

export default nextConfig;
