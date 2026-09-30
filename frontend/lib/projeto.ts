import type { ResultadoAnalise, Tecnologia } from "@/lib/api";

const ROTULOS_TECNOLOGIA: Record<Tecnologia, string> = {
  POSTGRESQL: "PostgreSQL",
  RABBITMQ: "RabbitMQ",
  REDIS: "Redis",
};

const SUFIXOS_DE_CLASSE = ["Controller", "Service", "ServiceImpl", "Repository"];

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

export function nomeDaClasse(caminho: string): string {
  const arquivo = caminho.slice(caminho.lastIndexOf("/") + 1);
  return arquivo.replace(/\.java$/, "");
}

/** Domínios aproximados: nomes dos controllers e entidades sem o sufixo. */
export function dominiosDe(resultado: ResultadoAnalise, maximo = 10): string[] {
  const nomes = [...resultado.controllers, ...resultado.entidades].map((caminho) => {
    const nome = nomeDaClasse(caminho);
    const sufixo = SUFIXOS_DE_CLASSE.find((s) => nome.endsWith(s) && nome.length > s.length);
    return sufixo ? nome.slice(0, -sufixo.length) : nome;
  });
  return [...new Set(nomes)].slice(0, maximo);
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
