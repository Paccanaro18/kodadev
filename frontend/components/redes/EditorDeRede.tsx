"use client";
import "@xyflow/react/dist/style.css";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Background, BackgroundVariant, BaseEdge, Controls, Handle, Position, ReactFlow, useInternalNode,
  type Edge, type EdgeProps, type InternalNode, type Node, type NodeChange, type NodeProps,
} from "@xyflow/react";
import { Cable } from "lucide-react";
import { IlustracaoDeDispositivo } from "./IlustracoesDeRede";
import { temaAtual } from "@/lib/tema";
import type { Dispositivo, Passo, Rede } from "@/lib/redes/tipos";

type DadosDoNo = { dispositivo: Dispositivo; conectando: boolean; ligadas: number };
type NoDeRede = Node<DadosDoNo, "dispositivo">;

type Pacote = { sentido: "ab" | "ba"; tipo: Passo["tipo"]; chave: string };
type DadosDoCabo = { portaA: string; portaB: string; pacote: Pacote | null; selecionado: boolean };
type CaboDeRede = Edge<DadosDoCabo, "cabo">;

function resumoDeEnderecos(dispositivo: Dispositivo): string[] {
  if (dispositivo.tipo === "switch") return [];
  return dispositivo.interfaces.filter((i) => i.ip).map((i) => (dispositivo.tipo === "roteador" ? `${i.nome} ${i.ip}` : i.ip));
}

function NoDoDispositivo({ data, selected }: NodeProps<NoDeRede>) {
  const { dispositivo, conectando, ligadas } = data;
  const enderecos = resumoDeEnderecos(dispositivo);
  return (
    <div
      aria-label={`${dispositivo.nome}, ${ligadas} cabos`}
      className={`group relative w-[148px] rounded-2xl border-2 bg-surface px-3 pt-2 pb-3 text-center shadow-soft transition ${selected ? "border-koda" : "border-line-2"}`}
    >
      <IlustracaoDeDispositivo tipo={dispositivo.tipo} className="mx-auto h-[66px] w-[88px]" />
      <div className="mt-1 text-[15px] leading-tight font-bold text-ink">{dispositivo.nome}</div>
      <div className="mt-0.5 min-h-[16px] text-[12px] leading-tight text-ink-2">
        {enderecos.map((endereco) => <div key={endereco}>{endereco}</div>)}
      </div>
      <Handle
        id="alvo"
        type="target"
        position={Position.Top}
        isConnectableStart={false}
        style={{
          width: "100%", height: "100%", top: 0, left: 0, transform: "none", borderRadius: 16, border: 0, background: "transparent",
          pointerEvents: conectando ? "all" : "none",
        }}
      />
      <Handle
        id="origem"
        type="source"
        position={Position.Right}
        title="Arraste até outro dispositivo para ligar um cabo"
        className="!opacity-0 transition-opacity group-hover:!opacity-100"
        style={{ width: 22, height: 22, right: -11, top: 14, border: "2px solid var(--c-koda)", background: "var(--c-surface)", cursor: "crosshair" }}
      >
        <Cable className="pointer-events-none size-3 text-koda-texto" style={{ margin: "3px" }} aria-hidden="true" />
      </Handle>
    </div>
  );
}

function pontoNaBorda(no: InternalNode, outro: InternalNode): { x: number; y: number } {
  const largura = no.measured.width ?? 0;
  const altura = no.measured.height ?? 0;
  const centro = { x: no.internals.positionAbsolute.x + largura / 2, y: no.internals.positionAbsolute.y + altura / 2 };
  const centroDoOutro = {
    x: outro.internals.positionAbsolute.x + (outro.measured.width ?? 0) / 2,
    y: outro.internals.positionAbsolute.y + (outro.measured.height ?? 0) / 2,
  };
  const dx = centroDoOutro.x - centro.x;
  const dy = centroDoOutro.y - centro.y;
  if (dx === 0 && dy === 0) return centro;
  const escala = Math.min(dx === 0 ? Infinity : largura / 2 / Math.abs(dx), dy === 0 ? Infinity : altura / 2 / Math.abs(dy));
  return { x: centro.x + dx * escala, y: centro.y + dy * escala };
}

const COR_DO_PACOTE: Record<Passo["tipo"], string> = { arp: "#f59e0b", icmp: "#22c55e", dhcp: "#38bdf8", dns: "#f472b6" };

function CaboFlutuante({ id, source, target, data }: EdgeProps<CaboDeRede>) {
  const origem = useInternalNode(source);
  const destino = useInternalNode(target);
  if (!origem || !destino || !data) return null;
  const a = pontoNaBorda(origem, destino);
  const b = pontoNaBorda(destino, origem);
  const caminho = `M ${a.x},${a.y} L ${b.x},${b.y}`;
  const comprimento = Math.hypot(b.x - a.x, b.y - a.y) || 1;
  const u = { x: (b.x - a.x) / comprimento, y: (b.y - a.y) / comprimento };
  const normal = { x: -u.y, y: u.x };
  const recuo = Math.min(34, comprimento / 3);
  const rotuloA = { x: a.x + u.x * recuo + normal.x * 14, y: a.y + u.y * recuo + normal.y * 14 };
  const rotuloB = { x: b.x - u.x * recuo + normal.x * 14, y: b.y - u.y * recuo + normal.y * 14 };
  const estiloDoTexto = { fontSize: 11, fontWeight: 600, fill: "var(--c-ink-2)", paintOrder: "stroke", stroke: "var(--c-cream)", strokeWidth: 4 } as const;
  const cor = data.selecionado ? "var(--c-koda)" : "var(--c-ink-3)";

  return (
    <>
      <BaseEdge id={id} path={caminho} interactionWidth={18} style={{ stroke: cor, strokeWidth: data.selecionado ? 3.5 : 3, strokeLinecap: "round" }} />
      <circle cx={a.x} cy={a.y} r={6} fill="var(--c-koda)" stroke="var(--c-surface)" strokeWidth={2} />
      <circle cx={b.x} cy={b.y} r={6} fill="var(--c-koda)" stroke="var(--c-surface)" strokeWidth={2} />
      <text x={rotuloA.x} y={rotuloA.y} textAnchor="middle" dominantBaseline="middle" style={estiloDoTexto}>{data.portaA}</text>
      <text x={rotuloB.x} y={rotuloB.y} textAnchor="middle" dominantBaseline="middle" style={estiloDoTexto}>{data.portaB}</text>
      {data.pacote && (
        <circle key={data.pacote.chave} r={7} fill={COR_DO_PACOTE[data.pacote.tipo]} stroke="var(--c-surface)" strokeWidth={2}>
          <animateMotion
            dur="0.6s"
            fill="freeze"
            path={caminho}
            calcMode="linear"
            keyPoints={data.pacote.sentido === "ab" ? "0;1" : "1;0"}
            keyTimes="0;1"
          />
        </circle>
      )}
    </>
  );
}

const TIPOS_DE_NO = { dispositivo: NoDoDispositivo };
const TIPOS_DE_CABO = { cabo: CaboFlutuante };

export type PropriedadesDoEditor = {
  rede: Rede;
  posicoes: Record<string, { x: number; y: number }>;
  selecionado: string | null;
  caboSelecionado: string | null;
  passoAtual: (Passo & { chave: string }) | null;
  aoSelecionarDispositivo: (id: string | null, ancora?: { x: number; y: number }) => void;
  aoSelecionarCabo: (id: string | null) => void;
  aoMover: (id: string, posicao: { x: number; y: number }) => void;
  aoLigar: (origem: string, destino: string) => void;
};

export default function EditorDeRede({
  rede, posicoes, selecionado, caboSelecionado, passoAtual, aoSelecionarDispositivo, aoSelecionarCabo, aoMover, aoLigar,
}: PropriedadesDoEditor) {
  const raiz = useRef<HTMLDivElement>(null);
  const [conectando, setConectando] = useState(false);
  const [modoEscuro, setModoEscuro] = useState(true);

  useEffect(() => {
    const atualizar = () => setModoEscuro(temaAtual() !== "claro");
    atualizar();
    window.addEventListener("koda-tema", atualizar);
    return () => window.removeEventListener("koda-tema", atualizar);
  }, []);

  const nos = useMemo<NoDeRede[]>(
    () => rede.dispositivos.map((dispositivo) => ({
      id: dispositivo.id,
      type: "dispositivo",
      position: posicoes[dispositivo.id] ?? { x: dispositivo.x, y: dispositivo.y },
      selected: dispositivo.id === selecionado,
      initialWidth: 148,
      initialHeight: 128,
      data: {
        dispositivo,
        conectando,
        ligadas: rede.cabos.filter((c) => c.a.dispositivo === dispositivo.id || c.b.dispositivo === dispositivo.id).length,
      },
    })),
    [rede, posicoes, selecionado, conectando],
  );

  const cabos = useMemo<CaboDeRede[]>(
    () => rede.cabos.map((cabo) => {
      let pacote: Pacote | null = null;
      if (passoAtual?.caboId === cabo.id) {
        const sentido = passoAtual.de.dispositivo === cabo.a.dispositivo && passoAtual.de.interface === cabo.a.interface ? "ab" : "ba";
        pacote = { sentido, tipo: passoAtual.tipo, chave: passoAtual.chave };
      }
      return {
        id: cabo.id,
        type: "cabo",
        source: cabo.a.dispositivo,
        target: cabo.b.dispositivo,
        sourceHandle: "origem",
        targetHandle: "alvo",
        selected: cabo.id === caboSelecionado,
        data: { portaA: cabo.a.interface, portaB: cabo.b.interface, pacote, selecionado: cabo.id === caboSelecionado },
      };
    }),
    [rede.cabos, passoAtual, caboSelecionado],
  );

  function aoMudarNos(mudancas: NodeChange<NoDeRede>[]) {
    for (const mudanca of mudancas) {
      if (mudanca.type === "position" && mudanca.position) aoMover(mudanca.id, mudanca.position);
    }
  }

  return (
    <div ref={raiz} className="h-[520px] overflow-hidden rounded-2xl border border-line" data-testid="editor-de-rede">
      <ReactFlow<NoDeRede, CaboDeRede>
        nodes={nos}
        edges={cabos}
        nodeTypes={TIPOS_DE_NO}
        edgeTypes={TIPOS_DE_CABO}
        colorMode={modoEscuro ? "dark" : "light"}
        onNodesChange={aoMudarNos}
        onNodeClick={(evento, no) => {
          const no_ = (evento.currentTarget as HTMLElement).getBoundingClientRect();
          const base = raiz.current?.getBoundingClientRect();
          aoSelecionarDispositivo(no.id, base ? { x: no_.x - base.x, y: no_.y - base.y } : undefined);
        }}
        onEdgeClick={(_, cabo) => aoSelecionarCabo(cabo.id)}
        onPaneClick={() => {
          aoSelecionarDispositivo(null);
          aoSelecionarCabo(null);
        }}
        onConnectStart={() => setConectando(true)}
        onConnectEnd={() => setConectando(false)}
        onConnect={(conexao) => aoLigar(conexao.source, conexao.target)}
        deleteKeyCode={null}
        nodesConnectable
        fitView
        fitViewOptions={{ padding: 0.25, maxZoom: 1.1 }}
        minZoom={0.4}
        maxZoom={1.6}
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1.4} />
        <Controls showInteractive={false} />
      </ReactFlow>
    </div>
  );
}
