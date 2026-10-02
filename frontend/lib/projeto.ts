import type { Arquitetura, Linguagem, ResultadoAnalise, Tecnologia } from "@/lib/api";
import { rotuloDaLinguagem } from "@/lib/linguagem";

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

const FERRAMENTAS_DE_BUILD: Record<string, string> = {
  maven: "Maven",
  npm: "npm",
  pnpm: "pnpm",
  yarn: "Yarn",
  bun: "Bun",
  pip: "pip",
  poetry: "Poetry",
  pipenv: "Pipenv",
  uv: "uv",
};

/** No JavaScript a versão que o projeto declara é a do Node; nas outras linguagens, é a da própria linguagem. */
function linguagemComVersao(resultado: ResultadoAnalise): string | null {
  const rotulo = rotuloDaLinguagem(resultado.linguagem);
  if (!rotulo) return null;
  const nome = resultado.linguagem === "JAVASCRIPT" && resultado.versaoLinguagem ? "Node.js" : rotulo;
  return resultado.versaoLinguagem ? `${nome} ${resultado.versaoLinguagem}` : rotulo;
}

export function stackDe(resultado: ResultadoAnalise): string[] {
  const stack: string[] = [];
  const linguagem = linguagemComVersao(resultado);
  if (linguagem) stack.push(linguagem);
  if (resultado.framework) {
    stack.push(resultado.versaoFramework ? `${resultado.framework} ${resultado.versaoFramework}` : resultado.framework);
  }
  if (resultado.ferramentaDeBuild) {
    stack.push(FERRAMENTAS_DE_BUILD[resultado.ferramentaDeBuild] ?? resultado.ferramentaDeBuild);
  }
  stack.push(...resultado.tecnologias.map(rotuloTecnologia));
  return stack;
}

export function arquiteturaDe(arquitetura: Arquitetura): { rotulo: string; descricao: string } {
  return ARQUITETURAS[arquitetura] ?? ARQUITETURAS.INDEFINIDA;
}

const ROTULOS_DAS_CAMADAS: Record<Linguagem, [string, string, string, string]> = {
  JAVA: ["Controllers", "Services", "Repositories", "Entidades"],
  TYPESCRIPT: ["Controllers e rotas", "Services", "Repositories", "Entidades e models"],
  JAVASCRIPT: ["Controllers e rotas", "Services", "Repositories", "Entidades e models"],
  PYTHON: ["Rotas e views", "Services", "Repositories", "Models"],
};

export function camadasDe(resultado: ResultadoAnalise): { rotulo: string; total: number }[] {
  const [controllers, services, repositories, entidades] =
    ROTULOS_DAS_CAMADAS[resultado.linguagem] ?? ROTULOS_DAS_CAMADAS.JAVA;
  return [
    { rotulo: controllers, total: resultado.controllers.length },
    { rotulo: services, total: resultado.services.length },
    { rotulo: repositories, total: resultado.repositories.length },
    { rotulo: entidades, total: resultado.entidades.length },
    { rotulo: "Testes", total: resultado.testes.length },
  ];
}

export function dependenciasDe(resultado: ResultadoAnalise): string[] {
  return resultado.dependencias.map((d) => d.slice(d.indexOf(":") + 1));
}
