import { CorpoDaIlustracao } from "./IlustracoesDeRede";
import type { Rede } from "@/lib/redes/tipos";

const LARGURA_DO_NO = 112;
const ALTURA_DO_NO = 100;

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
            <rect x={c.x - 56} y={c.y - 50} width={112} height={100} rx={24} fill="var(--c-surface)" stroke="var(--c-line-2)" strokeWidth={3} />
            <svg x={c.x - 48} y={c.y - 36} width={96} height={72} viewBox="0 0 120 90">
              <CorpoDaIlustracao tipo={d.tipo} />
            </svg>
          </g>
        );
      })}
    </svg>
  );
}
