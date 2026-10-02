"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import AppShell from "./AppShell";
import CartaoContexto, { AvisoSemContexto } from "./CartaoContexto";
import ListaDesafios from "./ListaDesafios";
import { BackLink, btnPrimary, Card, Chip, Eyebrow, Mascot, PageHeader } from "./ui";
import { listarAnalises, type ResultadoAnalise } from "@/lib/api";
import { camadasDe, dependenciasDe, stackDe } from "@/lib/projeto";
import SeloDeLinguagem from "./SeloDeLinguagem";
import { useAnalise } from "@/lib/useAnalise";

const ENDPOINTS_VISIVEIS = 30;
const DEPENDENCIAS_VISIVEIS = 12;

function Mensagem({ titulo, texto, acao }: { titulo: string; texto: string; acao?: { href: string; rotulo: string } }) {
  return (
    <AppShell width="max-w-[560px]">
      <div className="text-center">
        <Mascot name="duvida" className="mx-auto h-44 sm:h-52" />
        <h1 className="mt-2 text-[28px] font-bold tracking-tight">{titulo}</h1>
        <p className="mx-auto mt-3 max-w-[440px] text-ink-2">{texto}</p>
        {acao && <Link href={acao.href} className={btnPrimary + " mt-8 hover:text-white"}>{acao.rotulo}</Link>}
      </div>
    </AppShell>
  );
}

function Carregando() {
  return (
    <AppShell>
      <div className="grid gap-6 pt-8 md:grid-cols-2">
        <div className="h-64 animate-pulse rounded-[28px] bg-surface shadow-soft" />
        <div className="h-64 animate-pulse rounded-[28px] bg-surface shadow-soft" />
      </div>
    </AppShell>
  );
}

function Endpoints({ resultado }: { resultado: ResultadoAnalise }) {
  const [todos, setTodos] = useState(false);
  const lista = todos ? resultado.endpoints : resultado.endpoints.slice(0, ENDPOINTS_VISIVEIS);

  if (resultado.endpoints.length === 0) {
    return <p className="-mt-2 text-sm text-ink-2">Nenhum endpoint encontrado nos controllers analisados.</p>;
  }

  return (
    <>
      <ul className="-mt-2 grid gap-2 text-[13px]">
        {lista.map((e, i) => (
          <li key={`${e.metodoHttp}${e.caminho}${i}`} className="flex items-center gap-2.5">
            <b className="w-[4.25rem] shrink-0 rounded-lg bg-koda-soft py-0.5 text-center text-[11px] text-koda-texto">{e.metodoHttp}</b>
            <code className="font-mono break-all">{e.caminho}</code>
          </li>
        ))}
      </ul>
      {resultado.endpoints.length > ENDPOINTS_VISIVEIS && (
        <button onClick={() => setTodos(!todos)} className="mt-4 text-[13px] font-bold text-koda-texto transition duration-200 hover:translate-x-0.5">
          {todos ? "Mostrar menos" : `Mostrar todos (${resultado.endpoints.length})`}
        </button>
      )}
    </>
  );
}

function ProjetoAnalisado({ id }: { id: string }) {
  const { analise, erro } = useAnalise(id);

  if (erro) return <Mensagem titulo="Não foi possível carregar" texto={erro} acao={{ href: "/dashboard", rotulo: "Voltar ao início" }} />;
  if (!analise) return <Carregando />;

  if (analise.status === "FALHOU") {
    return <Mensagem titulo="A análise falhou" texto={analise.mensagemErro ?? "A análise não foi concluída."} acao={{ href: "/repositorios/adicionar", rotulo: "Escolher outro repositório" }} />;
  }
  if (analise.status !== "CONCLUIDA" || !analise.resultado) {
    return <Mensagem titulo="Análise em andamento" texto="A Koda ainda está lendo o código deste repositório." acao={{ href: `/analisando?analise=${encodeURIComponent(id)}`, rotulo: "Acompanhar" }} />;
  }

  const resultado = analise.resultado;
  const dependencias = dependenciasDe(resultado);
  const contexto = analise.contexto;

  return (
    <AppShell>
      {(resultado.parcial || contexto?.parcial) && (
        <div role="status" className="mb-4 rounded-2xl border border-warn/40 bg-warn-soft px-4 py-2.5 text-[13px] text-warn">
          <b>Análise parcial.</b> O repositório é grande ou tem arquivos que não deu para ler, então alguns itens podem estar faltando.
        </div>
      )}
      <PageHeader
        mascot="laptop"
        title={analise.nome}
        subtitle="Análise concluída. A Koda entendeu o seu projeto."
        action={<Link href={`/desafio/novo?analise=${encodeURIComponent(id)}`} className={btnPrimary + " hover:text-white"}><Plus className="size-4" /> Novo desafio</Link>}
      >
        <BackLink href="/dashboard">← Repositórios</BackLink>
        <div className="mt-2"><SeloDeLinguagem linguagem={resultado.linguagem} tamanho="medio" /></div>
      </PageHeader>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <Card>
          <Eyebrow>Stack detectada</Eyebrow>
          <div className="flex flex-wrap gap-2">{stackDe(resultado).map((s) => <Chip key={s}>{s}</Chip>)}</div>
          <div className="mt-6"><Eyebrow>Estrutura</Eyebrow></div>
          <ul className="-mt-2 grid grid-cols-2 gap-x-6 gap-y-2 text-sm sm:grid-cols-3">
            {camadasDe(resultado).map((c) => (
              <li key={c.rotulo} className="flex items-baseline gap-2"><b className="text-xl">{c.total}</b><span className="text-ink-2">{c.rotulo}</span></li>
            ))}
          </ul>
          {dependencias.length > 0 && (
            <>
              <div className="mt-6"><Eyebrow>Dependências</Eyebrow></div>
              <div className="-mt-2 flex flex-wrap gap-2">
                {dependencias.slice(0, DEPENDENCIAS_VISIVEIS).map((d) => <Chip key={d} tone="neutral">{d}</Chip>)}
                {dependencias.length > DEPENDENCIAS_VISIVEIS && <Chip tone="neutral">+{dependencias.length - DEPENDENCIAS_VISIVEIS}</Chip>}
              </div>
            </>
          )}
        </Card>
        <Card>
          {contexto && (
            <>
              <Eyebrow>Domínios</Eyebrow>
              {contexto.dominios.length > 0
                ? <div className="flex flex-wrap gap-2">{contexto.dominios.map((s) => <Chip key={s} tone="neutral">{s}</Chip>)}</div>
                : <p className="text-sm text-ink-2">Nenhum domínio identificado pelos nomes das classes.</p>}
              <div className="mt-6" />
            </>
          )}
          <Eyebrow>Endpoints</Eyebrow>
          <Endpoints resultado={resultado} />
        </Card>
      </div>

      {contexto ? <CartaoContexto contexto={contexto} /> : <AvisoSemContexto />}

      <ListaDesafios analiseId={id} />
    </AppShell>
  );
}

function UltimoProjeto() {
  const [id, setId] = useState<string | null>(null);
  const [vazio, setVazio] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    let ativo = true;
    listarAnalises()
      .then((lista) => {
        if (!ativo) return;
        const concluida = lista.find((a) => a.status === "CONCLUIDA");
        if (concluida) setId(concluida.id);
        else setVazio(true);
      })
      .catch((e: unknown) => {
        if (ativo) setErro(e instanceof Error ? e.message : "Erro inesperado.");
      });
    return () => { ativo = false; };
  }, []);

  if (erro) return <Mensagem titulo="Não foi possível carregar" texto={erro} acao={{ href: "/dashboard", rotulo: "Voltar ao início" }} />;
  if (vazio) return <Mensagem titulo="Nenhum projeto analisado ainda" texto="Conecte um repositório para a Koda analisar o seu código." acao={{ href: "/repositorios/adicionar", rotulo: "Adicionar repositório" }} />;
  if (!id) return <Carregando />;
  return <ProjetoAnalisado id={id} />;
}

export default function DetalheProjeto({ id }: { id: string | null }) {
  return id ? <ProjetoAnalisado id={id} /> : <UltimoProjeto />;
}
