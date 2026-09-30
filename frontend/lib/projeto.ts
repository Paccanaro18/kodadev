import type { Arquitetura, ResultadoAnalise, Tecnologia } from "@/lib/api";

const ROTULOS_TECNOLOGIA: Record<Tecnologia, string> = {
  POSTGRESQL: "PostgreSQL",
  RABBITMQ: "RabbitMQ",
  REDIS: "Redis",
};

const ARQUITETURAS: Record<Arquitetura, { rotulo: string; descricao: string }> = {
  EM_CAMADAS: {
    rotulo: "Em camadas",
    descricao: "Controllers, services e repositories separados por responsabilidade.",
  },
  POR_FEATURE: {
    rotulo: "Por feature",
    descricao: "O código é organizado por recurso: cada pasta reúne controller, service e repository.",
  },
  HEXAGONAL: {
    rotulo: "Hexagonal",
    descricao: "Domínio isolado do resto, com portas e adaptadores.",
  },
  INDEFINIDA: {
    rotulo: "Não identificada",
    descricao: "Não deu para identificar um padrão claro pelos nomes de pastas e classes.",
  },
};

export function rotuloTecnologia(tecnologia: Tecnologia): string {
  return ROTULOS_TECNOLOGIA[tecnologia] ?? tecnologia;
}

export function stackDe(resultado: ResultadoAnalise): string[] {
  const stack: string[] = [];
  if (resultado.versaoJava) stack.push(`Java ${resultado.versaoJava}`);
  if (resultado.springBoot) {
    stack.push(resultado.versaoSpringBoot ? `Spring Boot ${resultado.versaoSpringBoot}` : "Spring Boot");
  }
  stack.push("Maven");
  stack.push(...resultado.tecnologias.map(rotuloTecnologia));
  return stack;
}

export function arquiteturaDe(arquitetura: Arquitetura): { rotulo: string; descricao: string } {
  return ARQUITETURAS[arquitetura] ?? ARQUITETURAS.INDEFINIDA;
}

export function camadasDe(resultado: ResultadoAnalise): { rotulo: string; total: number }[] {
  return [
    { rotulo: "Controllers", total: resultado.controllers.length },
    { rotulo: "Services", total: resultado.services.length },
    { rotulo: "Repositories", total: resultado.repositories.length },
    { rotulo: "Entidades", total: resultado.entidades.length },
    { rotulo: "Testes", total: resultado.testes.length },
  ];
}

export function dependenciasDe(resultado: ResultadoAnalise): string[] {
  return resultado.dependencias.map((d) => d.slice(d.indexOf(":") + 1));
}
