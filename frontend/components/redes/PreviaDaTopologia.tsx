import { Desenho } from "./IconesDeRede";
import type { Rede } from "@/lib/redes/tipos";

const LARGURA_DO_NO = 108;
const ALTURA_DO_NO = 108;
const ICONE = 78;

export default function PreviaDaTopologia({ rede }: { rede: Rede }) {
  const xs = rede.dispositivos.map((d) => d.x);
  const ys = rede.dispositivos.map((d) => d.y);
  const minX = Math.min(...xs);
  const minY = Math.min(...ys);
  const largura = Math.max(...xs) - minX + LARGURA_DO_NO;
  const altura = Math.max(...ys) - minY + ALTURA_DO_NO;
  const centro = (id: string) => {
    const d = rede.dispositivos.find((x) => x.id === id)!;
    return { x: d.x - minX + LARGURA_DO_NO / 2, y: d.y - minY + ALTURA_DO_NO / 2 };
  };
  const margem = 12;

  return (
    <svg viewBox={`${-margem} ${-margem} ${largura + 2 * margem} ${altura + 2 * margem}`} className="h-full w-full" aria-hidden="true" preserveAspectRatio="xMidYMid meet">
      {rede.cabos.map((cabo) => {
        const a = centro(cabo.a.dispositivo);
        const b = centro(cabo.b.dispositivo);
        return <line key={cabo.id} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="var(--c-ink-3)" strokeWidth={4} strokeLinecap="round" />;
      })}
      {rede.dispositivos.map((d) => {
        const c = centro(d.id);
        return (
          <g key={d.id}>
            <rect x={c.x - 54} y={c.y - 54} width={108} height={108} rx={26} fill="var(--c-surface)" stroke="var(--c-line-2)" strokeWidth={3} />
            <svg x={c.x - ICONE / 2} y={c.y - ICONE / 2} width={ICONE} height={ICONE} viewBox="0 0 48 48" fill="none" stroke="var(--c-koda-texto)" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round">
              <Desenho tipo={d.tipo} />
            </svg>
          </g>
        );
      })}
    </svg>
  );
}
