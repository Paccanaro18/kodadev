"use client";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import { CheckCircle2, Download, Flag, Lightbulb, XCircle } from "lucide-react";
import AppShell from "../AppShell";
import BlocoDeCodigo from "../publico/BlocoDeCodigo";
import { Card, Eyebrow, Mascot } from "../ui";
import { enviarFlag, ErroApi, type ArtefatoDeSeguranca, type DetalheDeSeguranca } from "@/lib/api";
import { estiloDaDificuldade, rotuloDaCategoria, rotuloDaDificuldade } from "@/lib/seguranca";
import { useDesafioDeSeguranca } from "@/lib/useSeguranca";

function baixar(artefato: ArtefatoDeSeguranca) {
  const url = URL.createObjectURL(new Blob([artefato.conteudo], { type: "text/plain;charset=utf-8" }));
  const ancora = document.createElement("a");
  ancora.href = url;
  ancora.download = artefato.nome;
  ancora.click();
  URL.revokeObjectURL(url);
}

function Dicas({ dicas }: { dicas: string[] }) {
  const [reveladas, setReveladas] = useState(0);
  return (
    <Card>
      <Eyebrow>Dicas</Eyebrow>
      {reveladas === 0 && <p className="text-sm text-ink-2">Tente primeiro sozinho. Se travar, abra uma dica de cada vez.</p>}
      <ol className="grid gap-3">
        {dicas.slice(0, reveladas).map((dica, indice) => (
          <li key={indice} className="flex gap-3 rounded-2xl bg-koda-soft p-4 text-sm leading-relaxed">
            <Lightbulb className="mt-0.5 size-4 shrink-0 text-koda-texto" aria-hidden="true" />
            <span><strong>Dica {indice + 1}.</strong> {dica}</span>
          </li>
        ))}
      </ol>
      {reveladas < dicas.length && (
        <button type="button" onClick={() => setReveladas((n) => n + 1)}
          className="mt-4 h-10 rounded-xl border-[1.5px] border-koda-texto px-4 text-sm font-bold text-koda-texto transition duration-200 hover:bg-koda-soft active:scale-95">
          Mostrar a dica {reveladas + 1} de {dicas.length}
        </button>
      )}
    </Card>
  );
}

type Retorno = { tipo: "certa"; pontos: number } | { tipo: "errada" } | { tipo: "erro"; mensagem: string } | null;

function FormularioDaFlag({ desafio, aoAcertar }: { desafio: DetalheDeSeguranca; aoAcertar: () => void }) {
  const [flag, setFlag] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [retorno, setRetorno] = useState<Retorno>(null);

  async function enviar(evento: FormEvent) {
    evento.preventDefault();
    if (flag.trim() === "") return;
    setEnviando(true);
    setRetorno(null);
    try {
      const resultado = await enviarFlag(desafio.slug, flag);
      if (resultado.correta) {
        setRetorno({ tipo: "certa", pontos: resultado.pontosGanhos });
        aoAcertar();
      } else {
        setRetorno({ tipo: "errada" });
      }
    } catch (erro) {
      setRetorno({ tipo: "erro", mensagem: erro instanceof ErroApi || erro instanceof Error ? erro.message : "Erro inesperado." });
    } finally {
      setEnviando(false);
    }
  }

  return (
    <Card>
      <Eyebrow><span className="inline-flex items-center gap-2"><Flag className="size-4" aria-hidden="true" />Sua resposta</span></Eyebrow>
      <p className="text-sm text-ink-2">Formato da flag: <code className="rounded-md bg-tint px-1.5 py-0.5 font-semibold text-ink">{desafio.formatoDaFlag}</code></p>
      <form onSubmit={enviar} className="mt-4 flex flex-wrap gap-3">
        <label className="sr-only" htmlFor="flag">Flag</label>
        <input id="flag" value={flag} onChange={(e) => setFlag(e.target.value)} maxLength={200} autoComplete="off" spellCheck={false}
          placeholder="KODA{...}"
          className="h-12 min-w-[240px] flex-1 rounded-2xl border border-line-2 bg-cream px-4 font-mono text-sm text-ink outline-none transition duration-200 focus:border-koda" />
        <button type="submit" disabled={enviando || flag.trim() === ""}
          className="h-12 rounded-2xl bg-koda px-6 text-[15px] font-bold text-white transition duration-200 hover:-translate-y-0.5 hover:bg-koda-dark active:scale-[.97] disabled:cursor-not-allowed disabled:opacity-50">
          {enviando ? "Conferindo…" : "Enviar flag"}
        </button>
      </form>
      <div role="status" aria-live="polite" className="mt-4 empty:hidden">
        {retorno?.tipo === "certa" && (
          <p className="flex items-center gap-2 rounded-2xl bg-ok-soft px-4 py-3 text-sm font-bold text-ok">
            <CheckCircle2 className="size-5" aria-hidden="true" />
            {retorno.pontos > 0 ? `Flag correta! Você ganhou ${retorno.pontos} pontos.` : "Flag correta!"}
          </p>
        )}
        {retorno?.tipo === "errada" && (
          <p className="flex items-center gap-2 rounded-2xl bg-bad-soft px-4 py-3 text-sm font-bold text-bad">
            <XCircle className="size-5" aria-hidden="true" />Não é essa. Releia o enunciado e confira o formato da flag.
          </p>
        )}
        {retorno?.tipo === "erro" && <p role="alert" className="rounded-2xl bg-warn-soft px-4 py-3 text-sm font-bold text-warn">{retorno.mensagem}</p>}
      </div>
    </Card>
  );
}

function Solucao({ solucao }: { solucao: string[] }) {
  return (
    <Card>
      <Eyebrow>Como se resolve, e como se defender</Eyebrow>
      <div className="grid gap-3 leading-relaxed text-body">
        {solucao.map((paragrafo, indice) => <p key={indice}>{paragrafo}</p>)}
      </div>
    </Card>
  );
}

function Conteudo({ slug }: { slug: string }) {
  const { desafio, atualizar, erro, tentarDeNovo } = useDesafioDeSeguranca(slug);

  if (erro) {
    return (
      <div role="alert" className="rounded-2xl bg-bad-soft px-5 py-4 text-sm text-bad">
        <p>{erro}</p>
        <button onClick={tentarDeNovo} className="mt-3 h-9 rounded-xl border-[1.5px] border-bad px-4 text-sm font-bold transition duration-200 hover:bg-[#b42335] hover:text-white">Tentar de novo</button>
        <Link href="/seguranca" className="mt-3 ml-3 inline-block font-bold underline">Voltar aos desafios</Link>
      </div>
    );
  }
  if (!desafio) return <p className="text-ink-2">Carregando o desafio…</p>;

  return (
    <div className="mx-auto grid max-w-[860px] gap-6">
      <div>
        <Link href="/seguranca" className="text-sm font-semibold text-koda-texto">← Desafios de segurança</Link>
        <div className="mt-4 flex flex-wrap items-center gap-2.5">
          <span className="rounded-full bg-koda-soft px-3 py-1 text-xs font-bold text-koda-texto">{rotuloDaCategoria(desafio.categoria)}</span>
          <span className={`rounded-full px-3 py-1 text-xs font-bold ${estiloDaDificuldade(desafio.dificuldade)}`}>{rotuloDaDificuldade(desafio.dificuldade)}</span>
          <span className="text-sm font-bold text-ink-2">{desafio.pontos} pontos</span>
          {desafio.resolvido && <span className="inline-flex items-center gap-1.5 rounded-full bg-ok-soft px-3 py-1 text-xs font-bold text-ok"><CheckCircle2 className="size-3.5" aria-hidden="true" />Resolvido</span>}
        </div>
        <div className="mt-3 flex items-center gap-4">
          <h1 className="text-[28px] leading-tight font-extrabold tracking-tight sm:text-4xl">{desafio.titulo}</h1>
          {desafio.resolvido && <Mascot name="festa" className="h-16 shrink-0" />}
        </div>
      </div>

      <Card>
        <Eyebrow>O desafio</Eyebrow>
        <div className="grid gap-3 leading-relaxed text-body">
          {desafio.enunciado.map((paragrafo, indice) => <p key={indice}>{paragrafo}</p>)}
        </div>
      </Card>

      <section aria-labelledby="artefatos" className="grid gap-4">
        <h2 id="artefatos" className="text-xl font-bold tracking-tight">Material para análise</h2>
        {desafio.artefatos.map((artefato) => (
          <div key={artefato.nome} className="grid gap-2">
            <BlocoDeCodigo linguagem={artefato.linguagem} texto={artefato.conteudo} legenda={artefato.nome} />
            <button type="button" onClick={() => baixar(artefato)}
              className="inline-flex w-fit items-center gap-2 rounded-xl px-3 py-1.5 text-sm font-semibold text-koda-texto transition duration-200 hover:bg-koda-soft active:scale-95">
              <Download className="size-4" aria-hidden="true" />Baixar {artefato.nome}
            </button>
          </div>
        ))}
      </section>

      <FormularioDaFlag desafio={desafio} aoAcertar={() => { void atualizar(); }} />
      {!desafio.resolvido && <Dicas dicas={desafio.dicas} />}
      {desafio.resolvido && desafio.solucao && <Solucao solucao={desafio.solucao} />}
    </div>
  );
}

export default function DetalheDeSeguranca({ slug }: { slug: string }) {
  return <AppShell><Conteudo slug={slug} /></AppShell>;
}
