import type { TipoDeDispositivo } from "@/lib/redes/tipos";

export const ROTULO_DO_DISPOSITIVO: Record<TipoDeDispositivo, string> = { pc: "Computador", servidor: "Servidor", switch: "Switch", roteador: "Roteador" };

export function Desenho({ tipo }: { tipo: TipoDeDispositivo }) {
  switch (tipo) {
    case "pc":
      return (
        <>
          <rect x="5" y="7" width="38" height="26" rx="3.5" />
          <path d="M16 41h16M24 33v8" />
          <path d="M11 14l6 5-6 5M21 25h8" />
        </>
      );
    case "servidor":
      return (
        <>
          <rect x="7" y="6" width="34" height="10" rx="2.5" />
          <rect x="7" y="19" width="34" height="10" rx="2.5" />
          <rect x="7" y="32" width="34" height="10" rx="2.5" />
          <path d="M13 11h.01M13 24h.01M13 37h.01M25 11h12M25 24h12M25 37h12" />
        </>
      );
    case "switch":
      return (
        <>
          <rect x="3" y="12" width="42" height="24" rx="4" />
          <path d="M11 20h22M29 16l4 4-4 4M37 28H15M19 24l-4 4 4 4" />
        </>
      );
    case "roteador":
      return (
        <>
          <circle cx="24" cy="24" r="19" />
          <path d="M24 10v28M24 10l-4.5 4.5M24 10l4.5 4.5M24 38l-4.5-4.5M24 38l4.5-4.5M10 24h28M10 24l4.5-4.5M10 24l4.5 4.5M38 24l-4.5-4.5M38 24l-4.5 4.5" />
        </>
      );
  }
}

export function IconeDeDispositivo({ tipo, className = "size-5", titulo }: { tipo: TipoDeDispositivo; className?: string; titulo?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round"
      className={className} role={titulo ? "img" : undefined} aria-label={titulo} aria-hidden={titulo ? undefined : true}>
      <Desenho tipo={tipo} />
    </svg>
  );
}
