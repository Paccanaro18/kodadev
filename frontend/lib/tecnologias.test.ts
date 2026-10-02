import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { caminhoDoIcone, iconeDaLinguagem, iconeDaTecnologia, iconeDoFramework } from "@/lib/tecnologias";

describe("logos das tecnologias", () => {
  it("acha o logo de cada linguagem, tecnologia e framework conhecidos", () => {
    expect(iconeDaLinguagem("JAVA")).toBe("java");
    expect(iconeDaLinguagem("TYPESCRIPT")).toBe("typescript");
    expect(iconeDaLinguagem("JAVASCRIPT")).toBe("javascript");
    expect(iconeDaLinguagem("PYTHON")).toBe("python");
    expect(iconeDaTecnologia("POSTGRESQL")).toBe("postgresql");
    expect(iconeDaTecnologia("REDIS")).toBe("redis");
    expect(iconeDaTecnologia("RABBITMQ")).toBe("rabbitmq");
    expect(iconeDoFramework("Spring Boot")).toBe("spring");
    expect(iconeDoFramework("Next.js")).toBe("nextjs");
  });

  it("não inventa logo para o que não conhece", () => {
    expect(iconeDaLinguagem(null)).toBeNull();
    expect(iconeDaLinguagem("COBOL")).toBeNull();
    expect(iconeDoFramework("Koa")).toBeNull();
    expect(iconeDoFramework(undefined)).toBeNull();
  });

  it("aponta para a pasta pública", () => {
    expect(caminhoDoIcone("java")).toBe("/tecnologias/java.svg");
  });

  it("tem o arquivo de cada logo listado", () => {
    const nomes = [
      ...["JAVA", "TYPESCRIPT", "JAVASCRIPT", "PYTHON"].map(iconeDaLinguagem),
      ...(["POSTGRESQL", "REDIS", "RABBITMQ"] as const).map(iconeDaTecnologia),
      ...["Spring Boot", "NestJS", "Express", "Fastify", "Next.js", "Flask", "Django", "FastAPI"].map(iconeDoFramework),
    ];
    for (const nome of nomes) {
      expect(existsSync(join(process.cwd(), "public", "tecnologias", `${nome}.svg`)), String(nome)).toBe(true);
    }
  });
});
