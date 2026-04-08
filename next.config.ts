import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  turbopack: {},
  serverExternalPackages: ["better-sqlite3"],
  async redirects() {
    return [
      { source: "/wordcloud", destination: "/explore?tab=wordcloud", permanent: true },
      { source: "/arxiv-graph", destination: "/explore?tab=arxiv", permanent: true },
      { source: "/knowledge-graph", destination: "/explore?tab=knowledge", permanent: true },
    ];
  },
};

export default nextConfig;