"use client";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { FolderGit2, GitBranch, Search } from "lucide-react";
import { listarAnalises, listarDesafiosRecentes, type AnaliseResumo, type DesafioRecente } from "@/lib/api";
import { estaGerando } from "@/lib/desafio";
import SeloDeLinguagem from "./SeloDeLinguagem";

const MAXIMO_POR_GRUPO = 5;

type Dados = { analises: AnaliseResumo[]; desafios: DesafioRecente[] };

function normalizar(texto: string): string {
  return texto.normalize("NFD").replace(/\p{M}+/gu, "").toLowerCase();
}

function destinoDoDesafio(d: DesafioRecente): string {
  const id = encodeURIComponent(d.id);
  return estaGerando(d.statusGeracao) ? `/desafio/gerando?desafio=${id}` : `/desafio/${id}`;
}

function destinoDaAnalise(a: AnaliseResumo): string {
  const id = encodeURIComponent(a.id);
  return a.status === "CONCLUIDA" ? `/projeto?analise=${id}` : `/analisando?analise=${id}`;
}

/** Busca nos repositórios analisados e nos últimos desafios do usuário. Os dados só são pedidos no primeiro foco. */
export default function BuscaGlobal() {
  const [consulta, setConsulta] = useState("");
  const [aberta, setAberta] = useState(false);
  const [dados, setDados] = useState<Dados | null>(null);
  const [erro, setErro] = useState(false);
  const pediu = useRef(false);
  const caixa = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function aoClicarFora(e: MouseEvent) {
      if (caixa.current && !caixa.current.contains(e.target as Node)) setAberta(false);
    }
    document.addEventListener("mousedown", aoClicarFora);
    return () => document.removeEventListener("mousedown", aoClicarFora);
  }, []);

  function carregar() {
    if (pediu.current) return;
    pediu.current = true;
    Promise.all([listarAnalises(), listarDesafiosRecentes()])
      .then(([analises, recentes]) => setDados({ analises, desafios: recentes.recentes }))
      .catch(() => {
        pediu.current = false;
        setErro(true);
      });
  }

  const termo = normalizar(consulta.trim());
  const resultado = useMemo(() => {
    if (!dados || termo.length === 0) return null;
    return {
      repositorios: dados.analises.filter((a) => normalizar(a.nome).includes(termo)).slice(0, MAXIMO_POR_GRUPO),
      desafios: dados.desafios
        .filter((d) => normalizar(`${d.codigo} ${d.titulo ?? ""} ${d.habilidades.join(" ")}`).includes(termo))
        .slice(0, MAXIMO_POR_GRUPO),
    };
  }, [dados, termo]);

  const semResultado = resultado && resultado.repositorios.length === 0 && resultado.desafios.length === 0;

  return (
    <div ref={caixa} className="relative max-w-[620px] min-w-0 flex-1">
      <label className="flex h-12 items-center gap-3 rounded-2xl border border-line bg-surface px-5 focus-within:border-koda">
        <Search className="size-5 shrink-0 text-ink-2" />
        <input
          value={consulta}
          onChange={(e) => { setConsulta(e.target.value); setAberta(true); }}
          onFocus={() => { carregar(); setAberta(true); }}
          onKeyDown={(e) => { if (e.key === "Escape") setAberta(false); }}
          placeholder="Buscar desafios ou repositórios..."
          aria-label="Buscar desafios ou repositórios"
          className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-ink-3"
        />
      </label>

      {aberta && termo.length > 0 && (
        <div role="listbox" className="absolute top-14 right-0 left-0 z-30 max-h-96 overflow-y-auto rounded-2xl border border-line bg-surface p-2 shadow-soft">
          {erro && <p className="px-3 py-2 text-sm text-ink-2">Não foi possível buscar agora.</p>}
          {!erro && !dados && <p className="px-3 py-2 text-sm text-ink-2">Buscando...</p>}
          {semResultado && <p className="px-3 py-2 text-sm text-ink-2">Nada encontrado para “{consulta.trim()}”.</p>}

          {resultado && resultado.repositorios.length > 0 && (
            <div className="mb-1">
              <div className="px-3 pt-2 pb-1 text-[11px] font-bold tracking-[0.12em] text-ink-2/70 uppercase">Repositórios</div>
              {resultado.repositorios.map((a) => (
                <Link key={a.id} href={destinoDaAnalise(a)} onClick={() => setAberta(false)}
                  className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-ink transition duration-200 hover:bg-tint-2 hover:text-ink">
                  <FolderGit2 className="size-4 shrink-0 text-koda-texto" /><span className="min-w-0 flex-1 truncate">{a.nome}</span><SeloDeLinguagem linguagem={a.linguagem} />
                </Link>
              ))}
            </div>
          )}

          {resultado && resultado.desafios.length > 0 && (
            <div>
              <div className="px-3 pt-2 pb-1 text-[11px] font-bold tracking-[0.12em] text-ink-2/70 uppercase">Desafios</div>
              {resultado.desafios.map((d) => (
                <Link key={d.id} href={destinoDoDesafio(d)} onClick={() => setAberta(false)}
                  className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-ink transition duration-200 hover:bg-tint-2 hover:text-ink">
                  <GitBranch className="size-4 shrink-0 text-koda-texto" />
                  <span className="shrink-0 font-bold text-koda-texto">{d.codigo}</span>
                  <span className="truncate">{d.titulo ?? "Gerando o ticket…"}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
