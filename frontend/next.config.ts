import type { NextConfig } from "next";

// 127.0.0.1 em vez de localhost: o backend só escuta em IPv4 local e o Node pode resolver localhost para ::1.
const urlBackend = process.env.BACKEND_URL ?? "http://127.0.0.1:8080";

const emProducao = process.env.NODE_ENV === "production";

/**
 * Política de conteúdo das páginas. O Next injeta scripts inline na hidratação e o tema é aplicado por um script
 * inline antes da primeira pintura, então 'unsafe-inline' fica em script-src (sem 'unsafe-eval'). Em desenvolvimento
 * a política não é enviada: o React Refresh e o HMR precisam de eval e websocket.
 */
const politicaDeConteudo = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https://avatars.githubusercontent.com",
  "font-src 'self'",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ");

const cabecalhosDeSeguranca = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "geolocation=(), camera=(), microphone=(), payment=()" },
  ...(emProducao ? [{ key: "Content-Security-Policy", value: politicaDeConteudo }] : []),
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
    ],
  },
  async headers() {
    return [{ source: "/:caminho*", headers: cabecalhosDeSeguranca }];
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
