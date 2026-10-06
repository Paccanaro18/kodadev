"use client";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, BookOpen, CheckCircle2, ChevronDown, Circle, Clock, Eye, Lightbulb, Plus, RotateCcw, Trash2 } from "lucide-react";
import AppShell from "../AppShell";
import BlocosDeConteudo from "../publico/BlocosDeConteudo";
import { BackLink, Card } from "../ui";
import { IlustracaoDeDispositivo } from "./IlustracoesDeRede";
import JanelaDoDispositivo from "./JanelaDoDispositivo";
import PainelDoDispositivo from "./PainelDoDispositivo";
import TerminalDeRede, { type LinhaDoTerminal } from "./TerminalDeRede";
import {
  adicionarCabo, adicionarDispositivo, atualizarDispositivo, atualizarInterface, posicaoLivre, primeiraInterfaceLivre,
  removerCabo, removerDispositivo,
} from "@/lib/redes/construcao";
import { avaliarObjetivos, laboratorioPorSlug, TRILHA_DE_REDES, tudoCumprido, type Laboratorio } from "@/lib/redes/laboratorios";
import { Simulador } from "@/lib/redes/simulador";
import { executarComando } from "@/lib/redes/terminal";
import { TIPOS_DE_DISPOSITIVO, type Passo, type Rede } from "@/lib/redes/tipos";
import { useEstudo } from "@/lib/useEstudo";

const EditorDeRede = dynamic(() => import("./EditorDeRede"), {
  ssr: false,
  loading: () => <div className="h-[520px] animate-pulse rounded-2xl bg-tint" />,
});

const MS_POR_PASSO = 700;

function prefereMovimentoReduzido(): boolean {
  return typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches === true;
}

function Objetivos({ lab, resultados, completo, jaConcluido }: {
  lab: Laboratorio; resultados: ReturnType<typeof avaliarObjetivos>; completo: boolean; jaConcluido: boolean;
}) {
  const feitos = resultados.filter((r) => r.cumprido).length;
  return (
    <Card className="!p-6">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="text-xl font-bold">Objetivos</h2>
        <span className="text-sm font-semibold text-ink-2">{feitos} de {resultados.length}</span>
      </div>
      <div role="progressbar" aria-label="Objetivos cumpridos" aria-valuemin={0} aria-valuemax={resultados.length} aria-valuenow={feitos} className="mt-3 mb-5 h-2.5 overflow-hidden rounded-full bg-track">
        <div className="h-full rounded-full bg-koda transition-all duration-500" style={{ width: `${resultados.length === 0 ? 0 : (feitos / resultados.length) * 100}%` }} />
      </div>
      <ul className="grid gap-4" aria-label={`Objetivos de ${lab.titulo}`}>
        {resultados.map((resultado) => (
          <li key={resultado.descricao} className="flex gap-3">
            {resultado.cumprido
              ? <CheckCircle2 className="mt-0.5 size-6 shrink-0 text-ok" aria-label="Cumprido" />
              : <Circle className="mt-0.5 size-6 shrink-0 text-ink-3" aria-label="Pendente" />}
            <span className="min-w-0">
              <span className={`block text-[15px] leading-snug font-bold ${resultado.cumprido ? "text-ink-2" : "text-ink"}`}>{resultado.titulo}</span>
              <span className="block text-[13px] leading-snug text-ink-2">{resultado.subtitulo}</span>
              {!resultado.cumprido && resultado.detalhe && <span className="mt-1 block text-xs leading-snug text-warn">{resultado.detalhe}</span>}
            </span>
          </li>
        ))}
      </ul>
      {(completo || jaConcluido) && (
        <p role="status" className="mt-5 flex items-center gap-2 rounded-2xl bg-ok-soft px-4 py-3 text-sm font-bold text-ok">
          <CheckCircle2 className="size-5 shrink-0" aria-hidden="true" />
          {completo ? "Laboratório concluído! Seu progresso foi salvo." : "Você já concluiu este laboratório. Pode refazê-lo à vontade."}
        </p>
      )}
    </Card>
  );
}

function Ajuda({ lab }: { lab: Laboratorio }) {
  const [aberta, setAberta] = useState(false);
  const [dica, setDica] = useState(false);
  const [solucao, setSolucao] = useState(false);
  if (!lab.dica && !lab.solucao) return null;
  const botao = "inline-flex h-9 items-center gap-2 rounded-xl border-[1.5px] border-koda-texto px-3.5 text-[13px] font-bold text-koda-texto transition duration-200 hover:bg-koda-soft active:scale-95";
  return (
    <Card className="!p-0">
      <button type="button" aria-expanded={aberta} onClick={() => setAberta((v) => !v)}
        className="flex w-full items-center justify-between gap-3 rounded-[28px] px-6 py-5 text-left text-[15px] font-bold text-koda-texto transition duration-200 hover:bg-koda-soft">
        <span className="inline-flex items-center gap-3"><Lightbulb className="size-5" aria-hidden="true" />Ver dicas</span>
        <ChevronDown className={`size-5 transition duration-200 ${aberta ? "rotate-180" : ""}`} aria-hidden="true" />
      </button>
      {aberta && (
        <div className="px-6 pb-6">
          <div className="flex flex-wrap gap-2">
            {lab.dica && !dica && <button type="button" onClick={() => setDica(true)} className={botao}><Lightbulb className="size-4" aria-hidden="true" />Ver uma dica</button>}
            {lab.solucao && !solucao && <button type="button" onClick={() => setSolucao(true)} className={botao}><Eye className="size-4" aria-hidden="true" />Ver a solução</button>}
          </div>
          {dica && lab.dica && <p className="mt-3 rounded-xl bg-koda-soft p-3 text-sm leading-relaxed">{lab.dica}</p>}
          {solucao && lab.solucao && (
            <ol className="mt-3 list-decimal space-y-1.5 rounded-xl bg-tint p-3 pl-7 text-sm leading-relaxed">
              {lab.solucao.map((passo) => <li key={passo}>{passo}</li>)}
            </ol>
          )}
        </div>
      )}
    </Card>
  );
}

const ESTILO_DO_PASSO: Record<Passo["tipo"], string> = {
  arp: "bg-warn-soft text-warn",
  icmp: "bg-ok-soft text-ok",
  dhcp: "bg-[#38bdf8]/15 text-[#38bdf8]",
  dns: "bg-[#f472b6]/15 text-[#f472b6]",
};

function RegistroDePacotes({ rede, passos, visiveis, reproduzindo, aoRepetir }: {
  rede: Rede; passos: Passo[]; visiveis: number; reproduzindo: boolean; aoRepetir: () => void;
}) {
  const nome = (id: string) => rede.dispositivos.find((d) => d.id === id)?.nome ?? id;
  return (
    <Card className="!p-5">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="text-xs font-bold tracking-[0.12em] text-ink-2/70 uppercase">Pacotes na rede</div>
        {passos.length > 0 && !reproduzindo && (
          <button type="button" onClick={aoRepetir} className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-koda-soft px-2.5 text-xs font-bold text-koda-texto transition duration-200 hover:-translate-y-0.5 active:scale-95">
            <RotateCcw className="size-3.5" aria-hidden="true" />Ver de novo
          </button>
        )}
      </div>
      {passos.length === 0
        ? <p className="text-sm text-ink-2">Dê um ping no terminal de um dispositivo e acompanhe aqui cada quadro que passa pelos cabos: <span className="font-bold text-warn">ARP</span> para descobrir o endereço físico e <span className="font-bold text-ok">ICMP</span> para o ping em si, e também <span className="font-bold text-[#38bdf8]">DHCP</span> e <span className="font-bold text-[#f472b6]">DNS</span>.</p>
        : (
          <ol aria-label="Quadros enviados" className="grid max-h-56 gap-1.5 overflow-y-auto pr-1 text-[13px]">
            {passos.slice(0, visiveis).map((passo, indice) => (
              <li key={indice} className="flex items-start gap-2">
                <span className={`mt-0.5 shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-extrabold ${ESTILO_DO_PASSO[passo.tipo]}`}>{passo.tipo.toUpperCase()}</span>
                <span className="min-w-0 leading-snug">
                  <span className="font-semibold text-ink">{nome(passo.de.dispositivo)} {passo.de.interface} → {nome(passo.para.dispositivo)} {passo.para.interface}</span>
                  <span className="block text-xs text-ink-2">{passo.rotulo}</span>
                </span>
              </li>
            ))}
          </ol>
        )}
    </Card>
  );
}

export function AreaDoLaboratorio({ lab }: { lab: Laboratorio }) {
  const [rede, setRede] = useState<Rede>(lab.redeInicial);
  const [posicoes, setPosicoes] = useState<Record<string, { x: number; y: number }>>({});
  const [selecionado, setSelecionado] = useState<string | null>(null);
  const [ancora, setAncora] = useState({ x: 20, y: 20 });
  const [caboSelecionado, setCaboSelecionado] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [aba, setAba] = useState<"config" | "terminal">("config");
  const [terminais, setTerminais] = useState<Record<string, LinhaDoTerminal[]>>({});
  const [passos, setPassos] = useState<Passo[]>([]);
  const [indice, setIndice] = useState(-1);
  const [execucao, setExecucao] = useState(0);
  const { progresso, carregado, marcarDesafio } = useEstudo(TRILHA_DE_REDES);

  const simulador = useMemo(() => new Simulador(rede), [rede]);
  const resultados = useMemo(() => avaliarObjetivos(rede, lab.objetivos), [rede, lab.objetivos]);
  const redeEfetiva = useMemo(
    () => ({ ...rede, dispositivos: rede.dispositivos.map((d) => simulador.dispositivo(d.id) ?? d) }),
    [rede, simulador],
  );
  const completo = tudoCumprido(resultados);
  const jaConcluido = progresso.desafios.includes(lab.slug);

  useEffect(() => {
    if (carregado && completo && !jaConcluido) marcarDesafio(lab.slug, true);
  }, [carregado, completo, jaConcluido, lab.slug, marcarDesafio]);

  useEffect(() => {
    if (indice < 0) return;
    const temporizador = setTimeout(() => setIndice((atual) => (atual + 1 < passos.length ? atual + 1 : -1)), MS_POR_PASSO);
    return () => clearTimeout(temporizador);
  }, [indice, passos]);

  const dispositivo = rede.dispositivos.find((d) => d.id === selecionado) ?? null;
  const cabo = rede.cabos.find((c) => c.id === caboSelecionado) ?? null;
  const reproduzindo = indice >= 0;
  const passoAtual = reproduzindo && passos[indice] ? { ...passos[indice], chave: `${execucao}-${indice}` } : null;

  function reproduzir(novos: Passo[]) {
    setPassos(novos);
    setExecucao((n) => n + 1);
    setIndice(novos.length > 0 && !prefereMovimentoReduzido() ? 0 : -1);
  }

  function mudarRede(nova: Rede) {
    setRede(nova);
    setAviso(null);
  }

  function ligar(origem: string, destino: string) {
    const portaOrigem = primeiraInterfaceLivre(rede, origem);
    const portaDestino = primeiraInterfaceLivre(rede, destino);
    const nome = (id: string) => rede.dispositivos.find((d) => d.id === id)?.nome ?? id;
    if (origem === destino) return;
    if (!portaOrigem || !portaDestino) {
      setAviso(`${nome(!portaOrigem ? origem : destino)} não tem porta livre.`);
      return;
    }
    const resultado = adicionarCabo(rede, { dispositivo: origem, interface: portaOrigem }, { dispositivo: destino, interface: portaDestino });
    if ("erro" in resultado) setAviso(resultado.erro);
    else mudarRede(resultado.rede);
  }

  function executar(linha: string) {
    if (!dispositivo) return;
    const saida = executarComando(rede, simulador, dispositivo.id, linha);
    const prompt: LinhaDoTerminal = { tipo: "entrada", texto: `${dispositivo.nome}> ${linha}` };
    setTerminais((atuais) => ({
      ...atuais,
      [dispositivo.id]: saida.limpar ? [] : [...(atuais[dispositivo.id] ?? []), prompt, ...saida.linhas.map((texto) => ({ tipo: "saida" as const, texto }))],
    }));
    if (saida.passos.length > 0) reproduzir(saida.passos);
  }

  function reiniciar() {
    setRede(lab.redeInicial);
    setPosicoes({});
    setSelecionado(null);
    setCaboSelecionado(null);
    setTerminais({});
    setPassos([]);
    setIndice(-1);
    setAviso(null);
  }

  return (
    <>
      <nav aria-label="Trilha de navegação" className="text-xs text-ink-2">
        <Link href="/redes" className="font-semibold">Redes</Link> / <span>Laboratórios</span>
      </nav>
      <div className="mt-3">
        <BackLink href="/redes">← Todos os laboratórios</BackLink>
      </div>
      <h1 className="text-[28px] leading-tight font-bold tracking-tight sm:text-4xl">{lab.titulo}</h1>
      <div className="mt-3 flex flex-wrap items-center gap-2.5">
        <span className="rounded-full bg-koda-soft px-3 py-1 text-xs font-bold text-koda-texto">{lab.tipo === "aula" ? "Aula interativa" : "Desafio"}</span>
        <span className="rounded-full bg-tint px-3 py-1 text-xs font-bold text-ink">{lab.nivel}</span>
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-ink-2"><Clock className="size-3.5" aria-hidden="true" />{lab.minutos} min</span>
      </div>
      <p className="mt-3 max-w-3xl text-ink-2">{lab.resumo}</p>

      <div className="mt-6 grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="grid gap-6">
          <Card className="!p-5 sm:!p-6">
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <h2 className="mr-2 text-xl font-bold">Topologia</h2>
              <div className="flex flex-wrap items-center gap-2" role="toolbar" aria-label="Adicionar dispositivos">
                {TIPOS_DE_DISPOSITIVO.filter((t) => lab.paleta.includes(t.tipo)).map((t) => (
                  <button key={t.tipo} type="button"
                    onClick={() => {
                      const posicao = posicaoLivre(rede, posicoes);
                      mudarRede(adicionarDispositivo(rede, t.tipo, posicao.x, posicao.y));
                    }}
                    className="inline-flex h-10 items-center gap-2 rounded-xl border border-line-2 bg-tint px-3.5 text-[13px] font-bold text-koda-texto transition duration-200 hover:-translate-y-0.5 hover:border-koda active:scale-95">
                    <IlustracaoDeDispositivo tipo={t.tipo} className="h-6 w-8" /><Plus className="size-3" aria-hidden="true" />{t.rotulo}
                  </button>
                ))}
              </div>
              <button type="button" onClick={reiniciar}
                className="ml-auto inline-flex h-10 items-center gap-2 rounded-xl border border-line-2 px-4 text-[13px] font-semibold text-ink-2 transition duration-200 hover:bg-tint active:scale-95">
                <RotateCcw className="size-3.5" aria-hidden="true" />Recomeçar
              </button>
            </div>

            <div className="relative">
              <EditorDeRede
                rede={redeEfetiva}
                posicoes={posicoes}
                selecionado={selecionado}
                caboSelecionado={caboSelecionado}
                passoAtual={passoAtual}
                aoSelecionarDispositivo={(id, posicao) => {
                  setSelecionado(id);
                  if (posicao) setAncora(posicao);
                  if (id) setCaboSelecionado(null);
                }}
                aoSelecionarCabo={(id) => {
                  setCaboSelecionado(id);
                  if (id) setSelecionado(null);
                }}
                aoMover={(id, posicao) => setPosicoes((atuais) => ({ ...atuais, [id]: posicao }))}
                aoLigar={ligar}
              />
          {dispositivo && (
            <JanelaDoDispositivo dispositivo={dispositivo} ancora={ancora} aba={aba} aoMudarAba={setAba} aoFechar={() => setSelecionado(null)}>
              {aba === "config"
                ? (
                  <PainelDoDispositivo
                    dispositivo={dispositivo}
                    configuracao={simulador.configuracaoDe(dispositivo.id)}
                    aoMudarDhcp={(usaDhcp) => mudarRede(atualizarDispositivo(rede, dispositivo.id, (d) => ({ ...d, usaDhcp })))}
                    aoMudarDns={(dnsServidor) => mudarRede(atualizarDispositivo(rede, dispositivo.id, (d) => ({ ...d, dnsServidor })))}
                    aoMudarServicos={(servicos) => mudarRede(atualizarDispositivo(rede, dispositivo.id, (d) => ({ ...d, servicos })))}
                    rede={rede}
                    aoMudarNome={(nome) => mudarRede(atualizarDispositivo(rede, dispositivo.id, (d) => ({ ...d, nome })))}
                    aoMudarGateway={(gateway) => mudarRede(atualizarDispositivo(rede, dispositivo.id, (d) => ({ ...d, gateway })))}
                    aoMudarInterface={(nome, mudanca) => mudarRede(atualizarInterface(rede, dispositivo.id, nome, mudanca))}
                    aoMudarRotas={(rotas) => mudarRede(atualizarDispositivo(rede, dispositivo.id, (d) => ({ ...d, rotas })))}
                    aoRemover={() => { mudarRede(removerDispositivo(rede, dispositivo.id)); setSelecionado(null); }}
                  />
                )
                : <TerminalDeRede nome={dispositivo.nome} linhas={terminais[dispositivo.id] ?? []} aoExecutar={executar} />}
            </JanelaDoDispositivo>
          )}

            </div>
            <p className="mt-3 text-xs text-ink-2">Clique em um dispositivo para configurar ou abrir o terminal. Passe o mouse sobre ele e arraste o círculo com o ícone de cabo até outro dispositivo para ligá-los. Clique em um cabo para removê-lo.</p>
            {aviso && <p role="alert" className="mt-3 rounded-xl bg-warn-soft px-4 py-2.5 text-sm font-semibold text-warn">{aviso}</p>}
            {cabo && (
              <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-tint p-4">
                <p className="text-sm">
                  <strong>Cabo:</strong> {rede.dispositivos.find((d) => d.id === cabo.a.dispositivo)?.nome} ({cabo.a.interface}) ↔ {rede.dispositivos.find((d) => d.id === cabo.b.dispositivo)?.nome} ({cabo.b.interface})
                </p>
                <button type="button" onClick={() => { mudarRede(removerCabo(rede, cabo.id)); setCaboSelecionado(null); }}
                  className="inline-flex h-9 items-center gap-2 rounded-xl border-[1.5px] border-bad px-4 text-sm font-bold text-bad transition duration-200 hover:bg-bad-soft active:scale-95">
                  <Trash2 className="size-4" aria-hidden="true" />Remover cabo
                </button>
              </div>
            )}
          </Card>

          <RegistroDePacotes rede={rede} passos={passos} visiveis={indice < 0 ? passos.length : indice + 1} reproduzindo={reproduzindo}
            aoRepetir={() => reproduzir(passos)} />
        </div>

        <aside className="grid gap-6">
          <Card className="!p-6">
            <h2 className="text-xl font-bold">{lab.tipo === "aula" ? "A aula" : "O chamado"}</h2>
            <div className="mt-3 [&>div]:text-[15px]">
              <BlocosDeConteudo blocos={lab.teoria} />
            </div>
            <Link href={`/aprenda/redes-de-computadores/${lab.moduloDaTrilha}`}
              className="mt-5 flex items-center justify-between gap-3 rounded-2xl bg-koda-soft px-4 py-3 text-sm font-bold text-koda-texto transition duration-200 hover:-translate-y-0.5 hover:text-koda-texto">
              <span className="inline-flex items-center gap-2.5"><BookOpen className="size-5" aria-hidden="true" />{lab.tipo === "aula" ? "Ler a aula completa" : "Estudar a teoria"}</span>
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </Card>
          <Objetivos lab={lab} resultados={resultados} completo={completo} jaConcluido={jaConcluido} />
          <Ajuda lab={lab} />
        </aside>
      </div>
    </>
  );
}

function Conteudo({ slug }: { slug: string }) {
  const lab = laboratorioPorSlug(slug);
  if (!lab) return <p className="text-ink-2">Laboratório não encontrado.</p>;
  return <AreaDoLaboratorio key={lab.slug} lab={lab} />;
}

export default function LaboratorioDeRedes({ slug }: { slug: string }) {
  return <AppShell width="max-w-[1480px]"><Conteudo slug={slug} /></AppShell>;
}
