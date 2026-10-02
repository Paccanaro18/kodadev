import { describe, expect, it } from "vitest";
import type { Linguagem, ResultadoAnalise } from "@/lib/api";
import { camadasDe, dependenciasDe, stackDe, stackDetalhadaDe } from "@/lib/projeto";

function resultado(parcial: Partial<ResultadoAnalise>): ResultadoAnalise {
  return {
    linguagem: "JAVA",
    framework: "Spring Boot",
    temCodigo: true,
    versaoLinguagem: "21",
    versaoFramework: "4.1.1",
    ferramentaDeBuild: "maven",
    dependencias: [],
    tecnologias: [],
    imagensDocker: [],
    controllers: [],
    services: [],
    repositories: [],
    entidades: [],
    testes: [],
    endpoints: [],
    parcial: false,
    ...parcial,
  };
}

describe("stackDe", () => {
  it("monta a stack de um projeto Java", () => {
    expect(stackDe(resultado({ tecnologias: ["POSTGRESQL"] }))).toEqual([
      "Java 21", "Spring Boot 4.1.1", "Maven", "PostgreSQL",
    ]);
  });

  it("monta a stack de um projeto TypeScript com NestJS", () => {
    const r = resultado({
      linguagem: "TYPESCRIPT", framework: "NestJS", versaoLinguagem: "5.4.5", versaoFramework: "10.3.1",
      ferramentaDeBuild: "pnpm", tecnologias: ["REDIS", "RABBITMQ"],
    });
    expect(stackDe(r)).toEqual(["TypeScript 5.4.5", "NestJS 10.3.1", "pnpm", "Redis", "RabbitMQ"]);
  });

  it("chama de Node.js a versão declarada num projeto JavaScript", () => {
    const r = resultado({ linguagem: "JAVASCRIPT", framework: "Express", versaoLinguagem: "18.17.0", versaoFramework: null, ferramentaDeBuild: "npm" });
    expect(stackDe(r)).toEqual(["Node.js 18.17.0", "Express", "npm"]);
  });

  it("mostra só o nome da linguagem quando não há versão", () => {
    const r = resultado({ linguagem: "PYTHON", framework: "FastAPI", versaoLinguagem: null, versaoFramework: "0.110.0", ferramentaDeBuild: "poetry" });
    expect(stackDe(r)).toEqual(["Python", "FastAPI 0.110.0", "Poetry"]);
  });

  it("mostra o nome da ferramenta de build que não conhece, do jeito que veio", () => {
    expect(stackDe(resultado({ ferramentaDeBuild: "gradle" }))).toContain("gradle");
  });

  it("omite framework e build ausentes", () => {
    const r = resultado({ framework: null, versaoFramework: null, ferramentaDeBuild: null });
    expect(stackDe(r)).toEqual(["Java 21"]);
  });

  it("ignora linguagem que não conhece", () => {
    const r = resultado({ linguagem: "COBOL" as unknown as Linguagem });
    expect(stackDe(r)[0]).toBe("Spring Boot 4.1.1");
  });
});

describe("stackDetalhadaDe", () => {
  it("traz o logo de linguagem, framework e tecnologias, e nenhum para o build", () => {
    const itens = stackDetalhadaDe(resultado({ tecnologias: ["POSTGRESQL", "REDIS"] }));
    expect(itens).toEqual([
      { rotulo: "Java 21", icone: "java" },
      { rotulo: "Spring Boot 4.1.1", icone: "spring" },
      { rotulo: "Maven", icone: null },
      { rotulo: "PostgreSQL", icone: "postgresql" },
      { rotulo: "Redis", icone: "redis" },
    ]);
  });

  it("deixa sem logo o framework que não tem", () => {
    const itens = stackDetalhadaDe(resultado({ linguagem: "JAVASCRIPT", framework: "Koa", versaoFramework: null }));
    expect(itens[1]).toEqual({ rotulo: "Koa", icone: null });
  });
});

describe("camadasDe", () => {
  it("usa os rótulos de cada linguagem", () => {
    const rotulos = (l: Linguagem) => camadasDe(resultado({ linguagem: l })).map((c) => c.rotulo);

    expect(rotulos("JAVA")).toEqual(["Controllers", "Services", "Repositories", "Entidades", "Testes"]);
    expect(rotulos("TYPESCRIPT")[0]).toBe("Controllers e rotas");
    expect(rotulos("JAVASCRIPT")[3]).toBe("Entidades e models");
    expect(rotulos("PYTHON")).toEqual(["Rotas e views", "Services", "Repositories", "Models", "Testes"]);
  });

  it("conta os itens de cada camada", () => {
    const camadas = camadasDe(resultado({ controllers: ["a", "b"], testes: ["t"] }));
    expect(camadas.map((c) => c.total)).toEqual([2, 0, 0, 0, 1]);
  });

  it("cai nos rótulos de Java para linguagem desconhecida", () => {
    const camadas = camadasDe(resultado({ linguagem: "COBOL" as unknown as Linguagem }));
    expect(camadas[0].rotulo).toBe("Controllers");
  });
});

describe("dependenciasDe", () => {
  it("tira o grupo do Maven e mantém nomes de pacotes de Node e Python", () => {
    const r = resultado({ dependencias: ["org.postgresql:postgresql", "@nestjs/core", "fastapi"] });
    expect(dependenciasDe(r)).toEqual(["postgresql", "@nestjs/core", "fastapi"]);
  });
});
