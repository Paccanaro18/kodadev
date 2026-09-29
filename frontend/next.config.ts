import type { NextConfig } from "next";

const urlBackend = process.env.BACKEND_URL ?? "http://localhost:8080";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/api/:caminho*",
        destination: `${urlBackend}/api/:caminho*`,
      },
    ];
  },
};

export default nextConfig;
