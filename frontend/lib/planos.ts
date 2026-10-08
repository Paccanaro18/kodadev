import type { LimiteDoPlano, NomeDoPlano, SituacaoDoPlano } from "./api";

export type ValorDaLinha = string | { texto: string; emBreve?: boolean };

export type LinhaDaComparacao = {
  id: string;
  rotulo: string;
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
    { id: "trilhas", rotulo: "Trilhas, aulas e desafios de segurança", gratis: incluido, pro: incluido, equipe: incluido },
    { id: "redes", rotulo: "Simulador de redes, ferramentas e ideias de projetos", gratis: incluido, pro: incluido, equipe: incluido },
    { id: "conquistas", rotulo: "Conquistas", gratis: incluido, pro: incluido, equipe: incluido },
    { id: "tickets", rotulo: "Tickets gerados por IA", gratis: tickets(gratis), pro: tickets(pro), equipe: emBreve },
    { id: "repositorios", rotulo: "Repositórios analisados", gratis: repositorios(gratis), pro: repositorios(pro), equipe: emBreve },
    { id: "revisao", rotulo: "Revisão de projeto por IA", gratis: "—", pro: emBreve, equipe: emBreve },
    { id: "certificado", rotulo: "Certificado de conclusão verificável", gratis: "—", pro: emBreve, equipe: emBreve },
    { id: "painel", rotulo: "Painel para mentor ou professor", gratis: "—", pro: "—", equipe: emBreve },
  ];
}

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
