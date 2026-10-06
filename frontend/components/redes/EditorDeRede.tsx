"use client";
import "@xyflow/react/dist/style.css";
import { useEffect, useMemo, useState } from "react";
import {
  Background, BackgroundVariant, BaseEdge, Controls, Handle, Position, ReactFlow, useInternalNode,
  type Edge, type EdgeProps, type InternalNode, type Node, type NodeChange, type NodeProps,
} from "@xyflow/react";
import { Cable, Monitor, Network, Router, Server } from "lucide-react";
import { temaAtual } from "@/lib/tema";
import type { Dispositivo, Passo, Rede, TipoDeDispositivo } from "@/lib/redes/tipos";

type DadosDoNo = { dispositivo: Dispositivo; conectando: boolean; ligadas: number };
type NoDeRede = Node<DadosDoNo, "dispositivo">;

type Pacote = { sentido: "ab" | "ba"; tipo: Passo["tipo"]; chave: string };
type DadosDoCabo = { portaA: string; portaB: string; pacote: Pacote | null; selecionado: boolean };
type CaboDeRede = Edge<DadosDoCabo, "cabo">;

const ICONES: Record<TipoDeDispositivo, typeof Monitor> = { pc: Monitor, servidor: Server, switch: Network, roteador: Router };

function resumoDeEnderecos(dispositivo: Dispositivo): string[] {
  if (dispositivo.tipo === "switch") return [];
  return dispositivo.interfaces.filter((i) => i.ip).map((i) => (dispositivo.tipo === "roteador" ? `${i.nome} ${i.ip}` : i.ip));
}

function NoDoDispositivo({ data, selected }: NodeProps<NoDeRede>) {
  const { dispositivo, conectando, ligadas } = data;
  const Icone = ICONES[dispositivo.tipo];
  const enderecos = resumoDeEnderecos(dispositivo);
  return (
    <div
      aria-label={`${dispositivo.nome}, ${ligadas} cabos`}
      className={`relative w-[132px] rounded-2xl border-2 bg-surface px-3 py-2.5 text-center shadow-soft transition ${selected ? "border-koda" : "border-line"}`}
    >
      <div className="mx-auto grid size-10 place-items-center rounded-xl bg-koda-soft text-koda-texto">
        <Icone className="size-5" aria-hidden="true" />
      </div>
      <div className="mt-1.5 text-[13px] font-bold text-ink">{dispositivo.nome}</div>
      <div className="mt-0.5 min-h-[14px] text-[10px] leading-tight text-ink-2">
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
        style={{ width: 22, height: 22, right: -11, top: 22, border: "2px solid var(--c-koda)", background: "var(--c-surface)", cursor: "crosshair" }}
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

const COR_DO_PACOTE: Record<Passo["tipo"], string> = { arp: "#f59e0b", icmp: "#22c55e" };

function CaboFlutuante({ id, source, target, data }: EdgeProps<CaboDeRede>) {
  const origem = useInternalNode(source);
  const destino = useInternalNode(target);
  if (!origem || !destino || !data) return null;
  const a = pontoNaBorda(origem, destino);
  const b = pontoNaBorda(destino, origem);
  const caminho = `M ${a.x},${a.y} L ${b.x},${b.y}`;
  const ponto = (t: number) => ({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });
  const perto = ponto(0.16);
  const longe = ponto(0.84);
  const estiloDoTexto = { fontSize: 10, fontWeight: 600, fill: "var(--c-ink-2)", paintOrder: "stroke", stroke: "var(--c-cream)", strokeWidth: 4 } as const;

  return (
    <>
      <BaseEdge id={id} path={caminho} interactionWidth={18}
        style={{ stroke: data.selecionado ? "var(--c-koda)" : "var(--c-ink-3)", strokeWidth: data.selecionado ? 3 : 2 }} />
      <text x={perto.x} y={perto.y - 5} textAnchor="middle" style={estiloDoTexto}>{data.portaA}</text>
      <text x={longe.x} y={longe.y - 5} textAnchor="middle" style={estiloDoTexto}>{data.portaB}</text>
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
  aoSelecionarDispositivo: (id: string | null) => void;
  aoSelecionarCabo: (id: string | null) => void;
  aoMover: (id: string, posicao: { x: number; y: number }) => void;
  aoLigar: (origem: string, destino: string) => void;
};

export default function EditorDeRede({
  rede, posicoes, selecionado, caboSelecionado, passoAtual, aoSelecionarDispositivo, aoSelecionarCabo, aoMover, aoLigar,
}: PropriedadesDoEditor) {
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
      initialWidth: 132,
      initialHeight: 106,
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
    <div className="h-[520px] overflow-hidden rounded-2xl border border-line" data-testid="editor-de-rede">
      <ReactFlow<NoDeRede, CaboDeRede>
        nodes={nos}
        edges={cabos}
        nodeTypes={TIPOS_DE_NO}
        edgeTypes={TIPOS_DE_CABO}
        colorMode={modoEscuro ? "dark" : "light"}
        onNodesChange={aoMudarNos}
        onNodeClick={(_, no) => aoSelecionarDispositivo(no.id)}
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
