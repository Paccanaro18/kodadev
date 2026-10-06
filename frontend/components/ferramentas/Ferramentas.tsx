"use client";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Binary, Calculator, Check, Copy, Hash, KeyRound, ShieldAlert } from "lucide-react";
import AppShell from "../AppShell";
import { Card, Mascot } from "../ui";
import { agruparBits, converterNumero, type BaseNumerica } from "@/lib/ferramentas/conversores";
import { ALGORITMOS, calcularHash, codificarBase64, decodificarBase64, type AlgoritmoDeHash } from "@/lib/ferramentas/hashes";
import { decodificarJwt } from "@/lib/ferramentas/jwt";
import { calcularSubRede, dividirRede } from "@/lib/ferramentas/subRedes";

const campo = "w-full rounded-xl border border-line-2 bg-cream px-3.5 font-mono text-[14px] text-ink outline-none transition duration-200 focus:border-koda";

function Copiar({ texto, rotulo }: { texto: string; rotulo: string }) {
  const [copiado, setCopiado] = useState(false);
  async function copiar() {
    try {
      await navigator.clipboard.writeText(texto);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 1500);
    } catch {
      setCopiado(false);
    }
  }
  return (
    <button type="button" onClick={copiar} aria-label={`Copiar ${rotulo}`}
      className="grid size-8 shrink-0 place-items-center rounded-lg text-ink-2 transition duration-200 hover:bg-tint active:scale-95">
      {copiado ? <Check className="size-4 text-ok" aria-hidden="true" /> : <Copy className="size-4" aria-hidden="true" />}
    </button>
  );
}

function Linha({ nome, valor, mono = true }: { nome: string; valor: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-line py-2.5 last:border-0">
      <dt className="text-sm text-ink-2">{nome}</dt>
      <dd className="flex min-w-0 items-center gap-1">
        <span className={`truncate text-sm font-semibold text-ink ${mono ? "font-mono" : ""}`}>{valor}</span>
        <Copiar texto={valor} rotulo={nome} />
      </dd>
    </div>
  );
}

function Erro({ texto }: { texto: string }) {
  return <p role="alert" className="mt-3 rounded-xl bg-bad-soft px-4 py-2.5 text-sm font-semibold text-bad">{texto}</p>;
}

function CalculadoraDeSubRedes() {
  const [entrada, setEntrada] = useState("192.168.1.77/26");
  const [novoPrefixo, setNovoPrefixo] = useState("");
  const resultado = useMemo(() => calcularSubRede(entrada), [entrada]);
  const divisao = useMemo(() => (novoPrefixo === "" ? null : dividirRede(entrada, Number(novoPrefixo))), [entrada, novoPrefixo]);

  return (
    <div>
      <label className="grid gap-1.5 text-sm font-semibold text-ink-2">
        Endereço com prefixo ou máscara
        <input value={entrada} onChange={(e) => setEntrada(e.target.value)} spellCheck={false} placeholder="192.168.1.77/26" className={`${campo} h-12`} />
      </label>
      {"erro" in resultado ? <Erro texto={resultado.erro} /> : (
        <>
          <dl className="mt-4">
            <Linha nome="Endereço da rede" valor={`${resultado.rede}/${resultado.prefixo}`} />
            <Linha nome="Máscara" valor={resultado.mascara} />
            <Linha nome="Primeiro endereço utilizável" valor={resultado.primeiro} />
            <Linha nome="Último endereço utilizável" valor={resultado.ultimo} />
            <Linha nome="Endereço de transmissão (broadcast)" valor={resultado.broadcast} />
            <Linha nome="Endereços utilizáveis" valor={resultado.utilizaveis.toLocaleString("pt-BR")} mono={false} />
            <Linha nome="Tipo" valor={{ privado: "Privado (RFC 1918)", "link-local": "Link-local (169.254.0.0/16)", loopback: "Loopback", publico: "Público" }[resultado.categoria]} mono={false} />
          </dl>
          <div className="mt-4 overflow-x-auto rounded-2xl bg-tint p-4 font-mono text-[13px] leading-relaxed">
            <p><span className="text-ink-2">IP       </span> {resultado.binarioDoIp}</p>
            <p><span className="text-ink-2">Máscara  </span> {resultado.binarioDaMascara}</p>
          </div>
          <div className="mt-6">
            <label className="grid max-w-xs gap-1.5 text-sm font-semibold text-ink-2">
              Dividir em sub-redes de prefixo /
              <input value={novoPrefixo} onChange={(e) => setNovoPrefixo(e.target.value.replace(/\D/g, "").slice(0, 2))} inputMode="numeric" placeholder={String(Math.min(resultado.prefixo + 2, 30))} className={`${campo} h-11`} />
            </label>
            {divisao && ("erro" in divisao ? <Erro texto={divisao.erro} /> : (
              <div className="mt-3 max-h-72 overflow-auto rounded-2xl border border-line">
                <table className="w-full min-w-[480px] text-left text-sm">
                  <thead className="sticky top-0 bg-tint"><tr><th className="px-3 py-2">Sub-rede</th><th className="px-3 py-2">Faixa utilizável</th><th className="px-3 py-2">Broadcast</th></tr></thead>
                  <tbody>
                    {divisao.map((parte) => (
                      <tr key={parte.cidr} className="border-t border-line font-mono text-[13px]"><td className="px-3 py-2 font-bold">{parte.cidr}</td><td className="px-3 py-2">{parte.primeiro} – {parte.ultimo}</td><td className="px-3 py-2">{parte.broadcast}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

const BASES: { valor: BaseNumerica; rotulo: string }[] = [
  { valor: 10, rotulo: "Decimal" }, { valor: 2, rotulo: "Binário" }, { valor: 16, rotulo: "Hexadecimal" }, { valor: 8, rotulo: "Octal" },
];

function ConversorDeBases() {
  const [texto, setTexto] = useState("192");
  const [base, setBase] = useState<BaseNumerica>(10);
  const resultado = converterNumero(texto, base);
  return (
    <div>
      <div className="flex flex-wrap items-end gap-3">
        <label className="grid min-w-[220px] flex-1 gap-1.5 text-sm font-semibold text-ink-2">
          Número
          <input value={texto} onChange={(e) => setTexto(e.target.value)} spellCheck={false} className={`${campo} h-12`} />
        </label>
        <div role="group" aria-label="Base do número digitado" className="flex gap-1.5">
          {BASES.map((b) => (
            <button key={b.valor} type="button" aria-pressed={base === b.valor} onClick={() => setBase(b.valor)}
              className={`h-12 rounded-xl px-3.5 text-[13px] font-bold transition duration-200 active:scale-95 ${base === b.valor ? "bg-koda text-white" : "bg-tint text-ink"}`}>{b.rotulo}</button>
          ))}
        </div>
      </div>
      {"erro" in resultado ? <Erro texto={resultado.erro} /> : (
        <dl className="mt-4">
          <Linha nome="Decimal" valor={resultado.decimal} />
          <Linha nome="Binário" valor={agruparBits(resultado.binario)} />
          <Linha nome="Hexadecimal" valor={resultado.hexadecimal} />
          <Linha nome="Octal" valor={resultado.octal} />
        </dl>
      )}
    </div>
  );
}

function DecodificadorDeJwt() {
  const [token, setToken] = useState("");
  const resultado = useMemo(() => (token.trim() === "" ? null : decodificarJwt(token)), [token]);
  return (
    <div>
      <p className="mb-3 flex items-start gap-2 rounded-xl bg-koda-soft px-4 py-3 text-sm leading-relaxed text-body">
        <ShieldAlert className="mt-0.5 size-4 shrink-0 text-koda-texto" aria-hidden="true" />
        A decodificação acontece no seu navegador: o token não é enviado a nenhum servidor. Mesmo assim, evite colar tokens de produção que ainda estejam válidos.
      </p>
      <label className="grid gap-1.5 text-sm font-semibold text-ink-2">
        Token JWT
        <textarea value={token} onChange={(e) => setToken(e.target.value)} rows={4} spellCheck={false} placeholder="eyJhbGciOiJIUzI1NiIs..." className={`${campo} py-3`} />
      </label>
      {resultado && ("erro" in resultado ? <Erro texto={resultado.erro} /> : (
        <div className="mt-4 grid gap-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div><h3 className="mb-1.5 text-xs font-bold tracking-wide text-ink-2 uppercase">Cabeçalho</h3><pre className="overflow-x-auto rounded-2xl bg-tint p-4 text-[13px]">{JSON.stringify(resultado.cabecalho, null, 2)}</pre></div>
            <div><h3 className="mb-1.5 text-xs font-bold tracking-wide text-ink-2 uppercase">Carga (payload)</h3><pre className="overflow-x-auto rounded-2xl bg-tint p-4 text-[13px]">{JSON.stringify(resultado.carga, null, 2)}</pre></div>
          </div>
          <dl>
            {resultado.emitidoEm && <Linha nome="Emitido em (iat)" valor={resultado.emitidoEm} />}
            {resultado.naoValidoAntesDe && <Linha nome="Válido a partir de (nbf)" valor={resultado.naoValidoAntesDe} />}
            {resultado.expiraEm && <Linha nome={resultado.expirado ? "Expirou em (exp)" : "Expira em (exp)"} valor={resultado.expiraEm} />}
          </dl>
          <ul className="grid gap-2" aria-label="Avisos de segurança">
            {resultado.avisos.map((aviso) => <li key={aviso} className="rounded-xl bg-warn-soft px-4 py-2.5 text-sm text-body">{aviso}</li>)}
          </ul>
        </div>
      ))}
    </div>
  );
}

function HashEBase64() {
  const [texto, setTexto] = useState("koda");
  const [algoritmo, setAlgoritmo] = useState<AlgoritmoDeHash>("SHA-256");
  const [hash, setHash] = useState("");
  const [urlSegura, setUrlSegura] = useState(false);
  const [paraDecodificar, setParaDecodificar] = useState("a29kYQ==");

  useEffect(() => {
    let ativo = true;
    calcularHash(texto, algoritmo).then((valor) => { if (ativo) setHash(valor); }).catch(() => { if (ativo) setHash(""); });
    return () => { ativo = false; };
  }, [texto, algoritmo]);

  const decodificado = decodificarBase64(paraDecodificar);
  const aviso = ALGORITMOS.find((a) => a.valor === algoritmo)?.aviso;

  return (
    <div className="grid gap-8">
      <section aria-labelledby="titulo-hash">
        <h3 id="titulo-hash" className="text-lg font-bold">Hash</h3>
        <label className="mt-3 grid gap-1.5 text-sm font-semibold text-ink-2">
          Texto
          <textarea value={texto} onChange={(e) => setTexto(e.target.value)} rows={3} spellCheck={false} className={`${campo} py-3`} />
        </label>
        <div role="group" aria-label="Algoritmo de hash" className="mt-3 flex flex-wrap gap-1.5">
          {ALGORITMOS.map((a) => (
            <button key={a.valor} type="button" aria-pressed={algoritmo === a.valor} onClick={() => setAlgoritmo(a.valor)}
              className={`h-10 rounded-xl px-3.5 text-[13px] font-bold transition duration-200 active:scale-95 ${algoritmo === a.valor ? "bg-koda text-white" : "bg-tint text-ink"}`}>{a.valor}</button>
          ))}
        </div>
        {aviso && <p className="mt-2 text-sm text-warn">{aviso}</p>}
        <div className="mt-3 flex items-start gap-1 rounded-2xl bg-tint p-4">
          <code aria-label={`Hash ${algoritmo}`} className="min-w-0 flex-1 text-[13px] break-all">{hash}</code>
          <Copiar texto={hash} rotulo="hash" />
        </div>
        <p className="mt-2 text-xs text-ink-2">Um hash rápido como o SHA-256 serve para conferir integridade. Para guardar senhas, use um algoritmo lento próprio para isso (scrypt, Argon2 ou bcrypt), como mostra a trilha de Segurança.</p>
      </section>

      <section aria-labelledby="titulo-base64">
        <h3 id="titulo-base64" className="text-lg font-bold">Base64</h3>
        <label className="mt-3 grid gap-1.5 text-sm font-semibold text-ink-2">
          Codificar o texto acima
          <input readOnly value={codificarBase64(texto, urlSegura)} aria-label="Texto em Base64" className={`${campo} h-12`} />
        </label>
        <label className="mt-2 inline-flex items-center gap-2 text-sm text-ink-2">
          <input type="checkbox" checked={urlSegura} onChange={(e) => setUrlSegura(e.target.checked)} className="size-4 accent-[var(--c-koda)]" />
          Variante segura para URL (Base64URL, sem preenchimento)
        </label>
        <label className="mt-4 grid gap-1.5 text-sm font-semibold text-ink-2">
          Decodificar
          <input value={paraDecodificar} onChange={(e) => setParaDecodificar(e.target.value)} spellCheck={false} className={`${campo} h-12`} />
        </label>
        {typeof decodificado === "string"
          ? <p className="mt-2 rounded-xl bg-tint px-4 py-2.5 font-mono text-sm break-all" aria-label="Texto decodificado">{decodificado}</p>
          : <Erro texto={decodificado.erro} />}
        <p className="mt-2 text-xs text-ink-2">Base64 é só uma forma de escrever bytes como texto. Não protege nada: qualquer pessoa decodifica.</p>
      </section>
    </div>
  );
}

type Ferramenta = { id: string; titulo: string; descricao: string; icone: typeof Calculator; corpo: ReactNode };

export function ConteudoDeFerramentas() {
  const ferramentas: Ferramenta[] = [
    { id: "sub-redes", titulo: "Sub-redes", descricao: "Calcule rede, faixa, broadcast e divida uma rede em partes (CIDR).", icone: Calculator, corpo: <CalculadoraDeSubRedes /> },
    { id: "bases", titulo: "Bases numéricas", descricao: "Converta entre decimal, binário, hexadecimal e octal.", icone: Binary, corpo: <ConversorDeBases /> },
    { id: "jwt", titulo: "JWT", descricao: "Decodifique um token e veja avisos de segurança.", icone: KeyRound, corpo: <DecodificadorDeJwt /> },
    { id: "hash", titulo: "Hash e Base64", descricao: "Gere SHA-256 e codifique ou decodifique Base64.", icone: Hash, corpo: <HashEBase64 /> },
  ];
  const [ativa, setAtiva] = useState(ferramentas[0].id);
  const atual = ferramentas.find((f) => f.id === ativa) ?? ferramentas[0];

  return (
    <>
      <section className="rounded-[32px] bg-koda-soft p-6 sm:p-8">
        <div className="flex flex-wrap items-center gap-6">
          <Mascot name="laptop" className="h-28 shrink-0 sm:h-32" />
          <div className="min-w-0 flex-1">
            <span className="text-xs font-bold tracking-[0.14em] text-koda-texto uppercase">Caixa de ferramentas</span>
            <h1 className="mt-1 text-[30px] leading-tight font-bold tracking-tight sm:text-4xl">Ferramentas</h1>
            <p className="mt-2 max-w-2xl leading-relaxed text-body">Utilitários pequenos para o dia a dia de quem desenvolve. Tudo roda no seu navegador, sem enviar o que você digita a lugar nenhum.</p>
          </div>
        </div>
      </section>

      <div role="tablist" aria-label="Ferramentas" className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {ferramentas.map((f) => {
          const Icone = f.icone;
          return (
            <button key={f.id} role="tab" type="button" aria-selected={ativa === f.id} onClick={() => setAtiva(f.id)}
              className={`flex items-start gap-3 rounded-2xl border p-4 text-left transition duration-200 hover:-translate-y-0.5 active:scale-[.98] ${ativa === f.id ? "border-koda bg-koda-soft" : "border-line bg-surface"}`}>
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-tint text-koda-texto"><Icone className="size-5" aria-hidden="true" /></span>
              <span><span className="block text-[15px] font-bold text-ink">{f.titulo}</span><span className="mt-0.5 block text-xs leading-snug text-ink-2">{f.descricao}</span></span>
            </button>
          );
        })}
      </div>

      <Card className="mt-6" >
        <div role="tabpanel" aria-label={atual.titulo}>{atual.corpo}</div>
      </Card>
    </>
  );
}

export default function Ferramentas() {
  return <AppShell><ConteudoDeFerramentas /></AppShell>;
}
