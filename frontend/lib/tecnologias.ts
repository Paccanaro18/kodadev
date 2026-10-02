import type { Linguagem, Tecnologia } from "@/lib/api";

/**
 * Logos em /public/tecnologias (conjunto Devicon, licença MIT). Só entram aqui as tecnologias que têm logo:
 * o que não estiver na lista aparece só com texto.
 */
const POR_LINGUAGEM: Record<Linguagem, string> = {
  JAVA: "java",
  TYPESCRIPT: "typescript",
  JAVASCRIPT: "javascript",
  PYTHON: "python",
};

const POR_TECNOLOGIA: Record<Tecnologia, string> = {
  POSTGRESQL: "postgresql",
  REDIS: "redis",
  RABBITMQ: "rabbitmq",
};

const POR_FRAMEWORK: Record<string, string> = {
  "Spring Boot": "spring",
  NestJS: "nestjs",
  Express: "express",
  Fastify: "fastify",
  "Next.js": "nextjs",
  Flask: "flask",
  Django: "django",
  FastAPI: "fastapi",
};

export function iconeDaLinguagem(linguagem: string | null | undefined): string | null {
  return linguagem ? (POR_LINGUAGEM as Record<string, string>)[linguagem] ?? null : null;
}

export function iconeDaTecnologia(tecnologia: Tecnologia): string | null {
  return POR_TECNOLOGIA[tecnologia] ?? null;
}

export function iconeDoFramework(framework: string | null | undefined): string | null {
  return framework ? POR_FRAMEWORK[framework] ?? null : null;
}

export function caminhoDoIcone(icone: string): string {
  return `/tecnologias/${icone}.svg`;
}
