import type { TipoDeDispositivo } from "@/lib/redes/tipos";

export const ROTULO_DO_DISPOSITIVO: Record<TipoDeDispositivo, string> = { pc: "Computador", servidor: "Servidor", switch: "Switch", roteador: "Roteador" };

const CLARO = "url(#koda-ilustracao-claro)";
const MEDIO = "url(#koda-ilustracao-medio)";
const ESCURO = "url(#koda-ilustracao-escuro)";
const TELA = "#16122b";
const LED = "#ffe7a8";

function Gradientes() {
  return (
    <defs>
      <linearGradient id="koda-ilustracao-claro" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#d4ccff" />
        <stop offset="1" stopColor="#9d8ff9" />
      </linearGradient>
      <linearGradient id="koda-ilustracao-medio" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#a698fb" />
        <stop offset="1" stopColor="#7566ee" />
      </linearGradient>
      <linearGradient id="koda-ilustracao-escuro" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#7566ee" />
        <stop offset="1" stopColor="#5b4cd6" />
      </linearGradient>
    </defs>
  );
}

function Computador() {
  return (
    <>
      <ellipse cx="60" cy="80" rx="31" ry="7" fill={CLARO} />
      <rect x="40" y="68" width="40" height="11" rx="5.5" fill={MEDIO} />
      <path d="M25 22 L23 6 Q23 3 26.5 5 L40 14 Z" fill={CLARO} />
      <path d="M95 22 L97 6 Q97 3 93.5 5 L80 14 Z" fill={CLARO} />
      <rect x="21" y="12" width="78" height="60" rx="14" fill={CLARO} />
      <rect x="21" y="52" width="78" height="20" rx="10" fill={MEDIO} opacity="0.55" />
      <rect x="28" y="19" width="54" height="42" rx="8" fill={TELA} />
      <path d="M36 31l7 5-7 5M47 42h9" stroke="#f2efff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M88 26v0M88 33h6M88 39h6M88 45h6" stroke="#6f60e6" strokeWidth="2.2" strokeLinecap="round" />
      <circle cx="87" cy="61" r="2.6" fill="#ff8ad8" />
    </>
  );
}

function Switch() {
  return (
    <>
      <ellipse cx="62" cy="76" rx="48" ry="6" fill="#000" opacity="0.18" />
      <path d="M12 38 L28 22 H100 L90 38 Z" fill={CLARO} />
      <path d="M90 38 L100 22 V52 L90 68 Z" fill={ESCURO} />
      <rect x="12" y="38" width="78" height="30" rx="5" fill={MEDIO} />
      <path d="M36 28h26M36 31h26M36 34h26" stroke="#7566ee" strokeWidth="1.6" strokeLinecap="round" opacity="0.7" />
      {[19, 31, 43, 55, 67].map((x) => (
        <g key={x}>
          <rect x={x} y="46" width="9" height="13" rx="1.6" fill={TELA} />
          <path d={`M${x + 2} 58.5h5`} stroke="#ffb454" strokeWidth="1.6" strokeLinecap="round" />
        </g>
        ))}
      <circle cx="82" cy="48" r="2.8" fill={LED} />
      <circle cx="82" cy="57" r="2.8" fill="#4636c8" />
      <path d="M93 33v0M94 40l4-6M94 46l4-6M94 52l4-6" stroke="#4636c8" strokeWidth="1.8" strokeLinecap="round" />
    </>
  );
}

function Roteador() {
  return (
    <>
      <ellipse cx="62" cy="80" rx="46" ry="6" fill="#000" opacity="0.18" />
      <path d="M30 40 V16" stroke={ESCURO} strokeWidth="4.5" strokeLinecap="round" />
      <circle cx="30" cy="14" r="4.5" fill={CLARO} />
      <path d="M88 40 V16" stroke={ESCURO} strokeWidth="4.5" strokeLinecap="round" />
      <circle cx="88" cy="14" r="4.5" fill={CLARO} />
      <path d="M12 48 L26 36 H96 L88 48 Z" fill={CLARO} />
      <path d="M88 48 L96 36 V62 L88 74 Z" fill={ESCURO} />
      <rect x="12" y="48" width="76" height="26" rx="5" fill={MEDIO} />
      <circle cx="30" cy="61" r="9" fill={TELA} />
      <path d="M30 54v14M30 54l-3 3M30 54l3 3M30 68l-3-3M30 68l3-3M23 61h14M23 61l3-3M23 61l3 3M37 61l-3-3M37 61l-3 3" stroke="#f2efff" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      {[48, 60].map((x) => (
        <g key={x}>
          <rect x={x} y="55" width="9" height="12" rx="1.6" fill={TELA} />
          <path d={`M${x + 2} 66.5h5`} stroke="#ffb454" strokeWidth="1.6" strokeLinecap="round" />
        </g>
      ))}
      <circle cx="78" cy="57" r="2.6" fill={LED} />
      <circle cx="78" cy="66" r="2.6" fill="#4636c8" />
    </>
  );
}

function Servidor() {
  return (
    <>
      <ellipse cx="60" cy="82" rx="38" ry="5.5" fill="#000" opacity="0.18" />
      {[10, 33, 56].map((y) => (
        <g key={y}>
          <rect x="22" y={y} width="76" height="20" rx="6" fill={y === 10 ? CLARO : MEDIO} />
          <rect x="22" y={y + 11} width="76" height="9" rx="4.5" fill={ESCURO} opacity="0.35" />
          <path d={`M34 ${y + 10}h30`} stroke={TELA} strokeWidth="3.2" strokeLinecap="round" />
          <circle cx="78" cy={y + 10} r="2.6" fill={LED} />
          <circle cx="88" cy={y + 10} r="2.6" fill="#4636c8" />
        </g>
      ))}
    </>
  );
}

export function CorpoDaIlustracao({ tipo }: { tipo: TipoDeDispositivo }) {
  return (
    <>
      <Gradientes />
      {tipo === "pc" && <Computador />}
      {tipo === "switch" && <Switch />}
      {tipo === "roteador" && <Roteador />}
      {tipo === "servidor" && <Servidor />}
    </>
  );
}

export function IlustracaoDeDispositivo({ tipo, className = "h-12 w-16", titulo }: { tipo: TipoDeDispositivo; className?: string; titulo?: string }) {
  return (
    <svg viewBox="0 0 120 90" className={className} role={titulo ? "img" : undefined} aria-label={titulo} aria-hidden={titulo ? undefined : true}>
      <CorpoDaIlustracao tipo={tipo} />
    </svg>
  );
}
