import type { LimiteDoPlano, NomeDoPlano, SituacaoDoPlano } from "./api";

export type ValorDaLinha = string | { texto: string; emBreve?: boolean };

export type GrupoDaComparacao = "aprender" | "ia" | "turmas";

export const ROTULO_DO_GRUPO: Record<GrupoDaComparacao, string> = {
  aprender: "Para aprender",
  ia: "Tickets com IA",
  turmas: "Para turmas e mentores",
};

export type LinhaDaComparacao = {
  id: string;
  grupo: GrupoDaComparacao;
  rotulo: string;
  dica?: string;
  gratis: ValorDaLinha;
  pro: ValorDaLinha;
  equipe: ValorDaLinha;
};

export function limiteDe(planos: LimiteDoPlano[] | undefined, plano: NomeDoPlano): LimiteDoPlano | undefined {
  return planos?.find((p) => p.plano === plano);
}

export function percentualDeUso(usado: number, limite: number): number {
  if (limite <= 0) return 0;
  return Math.min(100, Math.round((usado / limite) * 100));
}

export type NivelDeUso = "folga" | "atencao" | "esgotado";

export function nivelDeUso(usado: number, limite: number): NivelDeUso {
  if (limite > 0 && usado >= limite) return "esgotado";
  if (limite > 0 && usado / limite >= 0.8) return "atencao";
  return "folga";
}

export function restantes(usado: number, limite: number): number {
  return Math.max(0, limite - usado);
}

export function dataDeRenovacao(iso: string): string {
  const data = new Date(iso);
  if (Number.isNaN(data.getTime())) return "";
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "America/Sao_Paulo" }).format(data);
}

export function plural(quantidade: number, singular: string, pluralDaPalavra: string): string {
  return `${quantidade} ${quantidade === 1 ? singular : pluralDaPalavra}`;
}

export function linhasDaComparacao(planos: LimiteDoPlano[] | undefined): LinhaDaComparacao[] {
  const gratis = limiteDe(planos, "GRATIS");
  const pro = limiteDe(planos, "PRO");
  const tickets = (limite?: LimiteDoPlano) => (limite ? `${limite.ticketsPorMes} por mês` : "—");
  const repositorios = (limite?: LimiteDoPlano) => (limite ? plural(limite.repositorios, "repositório", "repositórios") : "—");
  const incluido = "Incluído";
  const emBreve = { texto: "Em breve", emBreve: true };

  return [
    { id: "trilhas", grupo: "aprender", rotulo: "Trilhas, aulas e desafios de segurança", gratis: incluido, pro: incluido, equipe: incluido },
    { id: "redes", grupo: "aprender", rotulo: "Simulador de redes, ferramentas e ideias de projetos", gratis: incluido, pro: incluido, equipe: incluido },
    { id: "conquistas", grupo: "aprender", rotulo: "Conquistas e progresso salvo na conta", gratis: incluido, pro: incluido, equipe: incluido },
    { id: "tickets", grupo: "ia", rotulo: "Tickets gerados por IA", dica: "Um ticket é um desafio técnico gerado a partir do código do seu repositório.", gratis: tickets(gratis), pro: tickets(pro), equipe: emBreve },
    { id: "repositorios", grupo: "ia", rotulo: "Repositórios analisados", dica: "Hoje só repositórios públicos da sua própria conta.", gratis: repositorios(gratis), pro: repositorios(pro), equipe: emBreve },
    { id: "revisao", grupo: "ia", rotulo: "Revisão de projeto por IA", gratis: "—", pro: emBreve, equipe: emBreve },
    { id: "certificado", grupo: "turmas", rotulo: "Certificado de conclusão verificável", gratis: "—", pro: emBreve, equipe: emBreve },
    { id: "painel", grupo: "turmas", rotulo: "Painel para mentor ou professor", gratis: "—", pro: "—", equipe: emBreve },
  ];
}

export function agruparLinhas(linhas: LinhaDaComparacao[]): { grupo: GrupoDaComparacao; linhas: LinhaDaComparacao[] }[] {
  const ordem: GrupoDaComparacao[] = ["aprender", "ia", "turmas"];
  return ordem
    .map((grupo) => ({ grupo, linhas: linhas.filter((l) => l.grupo === grupo) }))
    .filter((g) => g.linhas.length > 0);
}

export const PERGUNTAS: { pergunta: string; resposta: string }[] = [
  {
    pergunta: "Posso assinar agora?",
    resposta: "Ainda não. O pagamento está em preparação, e o que aparece como \"Em breve\" ainda não existe. Hoje, a diferença real do Pro é a cota maior. Quando o pagamento abrir, os preços serão divulgados aqui antes de qualquer cobrança.",
  },
  {
    pergunta: "O que conta como um ticket?",
    resposta: "Cada desafio que o Koda gera a partir do código do seu repositório. Ele entra na cota assim que a geração começa. Se a geração falhar, o ticket não é descontado.",
  },
  {
    pergunta: "O que acontece quando a cota acaba?",
    resposta: "Você continua com acesso a tudo o que já gerou, às trilhas, ao simulador de redes, às ferramentas, às ideias de projetos e às conquistas. Só a geração de novos tickets espera a renovação, que acontece no primeiro dia do mês, no horário de Brasília.",
  },
  {
    pergunta: "Por que existe um limite diário também?",
    resposta: "Para evitar abuso e proteger o custo da IA. Ele vale para todos os planos.",
  },
  {
    pergunta: "Posso analisar repositórios privados?",
    resposta: "Hoje não. O Koda analisa apenas repositórios públicos da sua própria conta do GitHub.",
  },
  {
    pergunta: "O plano Grátis expira?",
    resposta: "Não. O Grátis não tem prazo e não pede cartão.",
  },
];

export function resumoDoUso(situacao: SituacaoDoPlano) {
  return {
    tickets: {
      usados: situacao.ticketsUsados,
      limite: situacao.ticketsPorMes,
      restantes: restantes(situacao.ticketsUsados, situacao.ticketsPorMes),
      nivel: nivelDeUso(situacao.ticketsUsados, situacao.ticketsPorMes),
      percentual: percentualDeUso(situacao.ticketsUsados, situacao.ticketsPorMes),
    },
    repositorios: {
      usados: situacao.repositoriosUsados,
      limite: situacao.repositorios,
      restantes: restantes(situacao.repositoriosUsados, situacao.repositorios),
      nivel: nivelDeUso(situacao.repositoriosUsados, situacao.repositorios),
      percentual: percentualDeUso(situacao.repositoriosUsados, situacao.repositorios),
    },
  };
}
