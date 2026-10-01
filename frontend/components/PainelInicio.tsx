"use client";
import Link from "next/link";
import { ArrowRight, Check, CheckCircle2, Clock, GitBranch, Play, Plus, Sparkles, Star } from "lucide-react";
import { Mascot } from "./ui";
import SeloProgresso from "./SeloProgresso";
import RepositoriosConectados from "./RepositoriosConectados";
import { Saudacao } from "./Saudacao";
import type { DesafioRecente, ResumoDoProgresso } from "@/lib/api";
import { estaGerando, rotuloDoTipo } from "@/lib/desafio";
import { tempoRelativo } from "@/lib/formatar";
import { useDesafiosRecentes } from "@/lib/useDesafiosRecentes";
import { useResumoDoProgresso } from "@/lib/useResumoDoProgresso";

const card = "rounded-3xl bg-white shadow-soft";
const pill = "rounded-full border border-[#ece9f5] bg-white px-3 py-1 text-xs font-semibold text-[#3b4058]";
const botao = "inline-flex h-12 items-center justify-center gap-2 rounded-[14px] bg-koda font-semibold text-white transition duration-200 hover:-translate-y-0.5 hover:bg-koda-dark hover:text-white hover:shadow-[0_12px_28px_rgb(102_92_255/0.4)] active:scale-[.97]";

function destino(d: DesafioRecente): string {
  const id = encodeURIComponent(d.id);
  return estaGerando(d.statusGeracao) ? `/desafio/gerando?desafio=${id}` : `/desafio/${id}`;
}

function Vazio({ children }: { children: string }) {
  return <p className="text-sm text-ink-2">{children}</p>;
}

function Destaque({ desafio }: { desafio: DesafioRecente | undefined }) {
  return (
    <section className={card + " flex flex-wrap items-center gap-6 p-6 sm:px-7"}>
      <div className="min-w-0 flex-[1_1_320px]">
        {desafio ? (
          <>
            <div className="mb-4 flex flex-wrap gap-2 text-xs font-semibold">
              <span className="inline-flex items-center gap-1.5 rounded-[10px] bg-[#fff4dc] px-3.5 py-1.5"><Star className="size-3.5 fill-[#f5a623] text-[#f5a623]" />Último desafio</span>
              <span className="rounded-[10px] bg-koda-soft px-3 py-1.5 text-koda">{rotuloDoTipo(desafio.tipo)}</span>
              <span className="rounded-[10px] bg-koda-soft px-3 py-1.5 text-koda">Júnior</span>
              {desafio.statusGeracao === "PRONTO" && <SeloProgresso status={desafio.statusProgresso} />}
            </div>
            <h2 className="text-[22px] leading-tight font-bold tracking-tight">{desafio.codigo} · {desafio.titulo ?? "Gerando o ticket…"}</h2>
            <div className="mt-4 flex flex-wrap gap-2">{desafio.habilidades.map((h) => <span key={h} className={pill}>{h}</span>)}</div>
            <p className="mt-4 flex items-center gap-1.5 text-[13px] text-[#3b4058]"><Clock className="size-4 text-koda" />Criado {tempoRelativo(desafio.criadoEm)}</p>
          </>
        ) : (
          <>
            <h2 className="text-[22px] leading-tight font-bold tracking-tight">Nenhum desafio ainda</h2>
            <p className="mt-2 max-w-[520px] text-sm leading-relaxed text-ink-2">Escolha um repositório analisado e gere o seu primeiro ticket a partir do seu próprio código.</p>
          </>
        )}
      </div>
      <div className="grid flex-[0_0_170px] gap-2.5 rounded-[20px] bg-[#faf9ff] p-3.5">
        {desafio
          ? <Link href={destino(desafio)} className={botao}>Ver desafio <ArrowRight className="size-4" /></Link>
          : <Link href="/desafio/novo" className={botao}>Gerar desafio <ArrowRight className="size-4" /></Link>}
        <Link href="/projeto" className="inline-flex h-12 items-center justify-center rounded-[14px] border border-[#ddd9ff] bg-white text-sm font-semibold text-koda transition duration-200 hover:scale-105 hover:bg-koda hover:text-white active:scale-95">Ver projeto</Link>
      </div>
    </section>
  );
}

function descricaoDaAtividade(d: DesafioRecente): string {
  if (d.statusGeracao === "FALHOU") return `A geração do ${d.codigo} falhou`;
  if (estaGerando(d.statusGeracao)) return `Gerando o ${d.codigo}`;
  if (d.statusProgresso === "CONCLUIDO") return `Concluiu o ${d.codigo}: ${d.titulo}`;
  if (d.statusProgresso === "EM_ANDAMENTO") return `Está resolvendo o ${d.codigo}: ${d.titulo}`;
  return `Gerou o ${d.codigo}: ${d.titulo}`;
}

function Atividades({ recentes }: { recentes: DesafioRecente[] }) {
  return (
    <section className={card + " p-6"}>
      <h2 className="mb-3.5 font-bold">Atividades recentes</h2>
      {recentes.length === 0 ? <Vazio>Seus desafios gerados aparecem aqui.</Vazio> : (
        <ul className="grid gap-3.5">
          {recentes.slice(0, 5).map((d) => (
            <li key={d.id}>
              <Link href={destino(d)} className="flex items-center gap-3 text-[13px] text-ink transition duration-200 hover:translate-x-1 hover:text-ink">
                <span className="grid size-6.5 shrink-0 place-items-center rounded-full bg-koda-soft text-koda">
                  {d.statusGeracao === "PRONTO" ? <Check className="size-3.5" strokeWidth={3} /> : <GitBranch className="size-3.5" />}
                </span>
                <span className="flex-1">{descricaoDaAtividade(d)}</span>
                <span className="text-[11px] whitespace-nowrap text-[#8a8fa5]">{tempoRelativo(d.criadoEm)}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function passosDe(recentes: DesafioRecente[]) {
  const emAndamento = recentes.find((d) => d.statusGeracao === "PRONTO" && d.statusProgresso === "EM_ANDAMENTO");
  const naoIniciado = recentes.find((d) => d.statusGeracao === "PRONTO" && d.statusProgresso === "NAO_INICIADO");
  const passos: { t: string; tag: string; href: string }[] = [];

  if (emAndamento) passos.push({ t: `Continuar o ${emAndamento.codigo}`, tag: "Em andamento", href: destino(emAndamento) });
  if (naoIniciado) passos.push({ t: `Começar o ${naoIniciado.codigo}`, tag: "Desafio", href: destino(naoIniciado) });
  passos.push({ t: "Gerar um novo desafio", tag: "Desafio", href: "/desafio/novo" });
  passos.push({ t: "Analisar outro repositório", tag: "Repositório", href: "/repositorios/adicionar" });
  return passos.slice(0, 3);
}

function ProximosPassos({ recentes }: { recentes: DesafioRecente[] }) {
  const passos = passosDe(recentes);

  return (
    <section className={card + " p-6"}>
      <h2 className="mb-3.5 font-bold">Seus próximos passos</h2>
      <ol className="grid gap-3">
        {passos.map((p, i) => (
          <li key={p.t}>
            <Link href={p.href} className="flex items-center gap-3 text-[13px] text-ink transition duration-200 hover:translate-x-1 hover:text-ink">
              <span className="grid size-6.5 shrink-0 place-items-center rounded-full bg-koda text-xs font-bold text-white">{i + 1}</span>
              <span className="flex-1">{p.t}</span><span className="rounded-lg bg-koda-soft px-2.5 py-0.5 text-[11px] text-koda">{p.tag}</span>
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );
}

function Numero({ icone, valor, rotulo, cor }: { icone: React.ReactNode; valor: number; rotulo: string; cor: string }) {
  return (
    <div className="rounded-2xl border border-[#efecf7] p-3">
      <div className={"grid size-9 place-items-center rounded-full " + cor}>{icone}</div>
      <div className="mt-2.5 text-[22px] font-extrabold">{valor}</div>
      <div className="text-[11px] text-ink-2">{rotulo}</div>
    </div>
  );
}

function Progresso({ total, resumo }: { total: number; resumo: ResumoDoProgresso | null }) {
  const habilidades = resumo?.habilidades.slice(0, 5) ?? [];
  const maximo = habilidades[0]?.total ?? 1;

  return (
    <section className={card + " p-5.5"}>
      <div className="mb-3.5 flex items-center justify-between">
        <h2 className="text-xs font-bold tracking-[0.12em] text-ink-2">SEU PROGRESSO</h2>
        <Link href="/progresso" className="rounded-[10px] border border-[#e5e2f2] px-3 py-1.5 text-xs font-semibold transition duration-200 hover:translate-x-0.5 hover:bg-koda-soft">Ver tudo →</Link>
      </div>
      <div className="grid grid-cols-3 gap-2.5">
        <Numero icone={<CheckCircle2 className="size-4" />} valor={resumo?.concluidos ?? 0} rotulo="concluídos" cor="bg-[#dff5e6] text-[#1d7a3c]" />
        <Numero icone={<Play className="size-4" />} valor={resumo?.emAndamento ?? 0} rotulo="em andamento" cor="bg-[#fff4d6] text-[#8a5a00]" />
        <Numero icone={<Sparkles className="size-4" />} valor={total} rotulo="gerados" cor="bg-[#e4e0fd] text-koda" />
      </div>
      <h3 className="mt-5 mb-3 text-[13px] font-semibold">Habilidades praticadas</h3>
      {habilidades.length === 0 ? <Vazio>Elas aparecem quando você concluir o seu primeiro desafio.</Vazio> : (
        <ul className="grid gap-3">
          {habilidades.map((h) => (
            <li key={h.nome} className="flex items-center gap-2.5 text-xs">
              <span className="min-w-0 flex-[0_0_7rem] truncate" title={h.nome}>{h.nome}</span>
              <div className="h-2 flex-1 rounded-full bg-[#efecfb]"><div className="h-2 rounded-full bg-[#7d74ff]" style={{ width: `${Math.round((h.total / maximo) * 100)}%` }} /></div>
              <span className="w-6 text-right">{h.total}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default function PainelInicio() {
  const { dados, erro } = useDesafiosRecentes();
  const { resumo } = useResumoDoProgresso();
  const recentes = dados?.recentes ?? [];

  return (
    <div className="flex flex-wrap gap-5">
      <div className="grid min-w-0 flex-[1_1_560px] content-start gap-5">
        <section className="flex flex-wrap items-center justify-between gap-2 px-2 pt-3">
          <div className="flex-[1_1_300px]">
            <h1 className="text-4xl font-extrabold tracking-[-0.04em] lg:text-[52px]"><Saudacao /></h1>
            <p className="mt-2 max-w-[420px] text-lg leading-snug text-[#3b4058]">Gere desafios a partir do seu código e continue evoluindo como dev!</p>
          </div>
          <Mascot name="laptop" className="-mt-4 ml-auto h-44 sm:h-52" />
        </section>

        {erro && <p role="alert" className="rounded-2xl border border-[#f5c2c4] bg-[#fdeaea] px-4 py-2.5 text-[13px] text-[#b3261e]">{erro}</p>}
        {!erro && !dados && <div className="h-44 animate-pulse rounded-3xl bg-white shadow-soft" />}
        {!erro && dados && <Destaque desafio={recentes[0]} />}

        <RepositoriosConectados />

        <div className="grid gap-5 md:grid-cols-2">
          <Atividades recentes={recentes} />
          <ProximosPassos recentes={recentes} />
        </div>
      </div>

      <aside className="grid min-w-0 max-w-full flex-[1_1_320px] content-start gap-5 xl:max-w-[340px]">
        <Progresso total={dados?.totalGerados ?? 0} resumo={resumo} />
        <Link href="/desafio/novo" className={botao + " h-13 text-[15px]"}><Plus className="size-4" /> Novo desafio</Link>
        <section className={card + " relative flex min-h-[150px] items-center overflow-hidden bg-linear-to-br from-[#f5f3ff] to-white p-5.5"}>
          <Mascot name="cafe" className="mr-4 h-32 shrink-0" />
          <div><div className="text-[15px] font-bold">Você está indo muito bem! 💙</div><p className="mt-1.5 text-[13px] leading-snug text-ink-2">Cada desafio te aproxima de conquistas reais. Continue assim!</p></div>
        </section>
      </aside>
    </div>
  );
}
