import Link from "next/link";
import { Check, X } from "lucide-react";
import { Card, Chip, Eyebrow } from "./ui";
import type { ContextoProjeto } from "@/lib/api";
import { arquiteturaDe } from "@/lib/projeto";

function plural(total: number, singular: string, muitos: string): string {
  return `${total} ${total === 1 ? singular : muitos}`;
}

function Situacao({ ok, texto }: { ok: boolean; texto: string }) {
  return (
    <li className="flex items-center gap-2 text-sm">
      <span className={`grid size-5 shrink-0 place-items-center rounded-full ${ok ? "bg-ok-soft text-ok" : "bg-tint text-ink-2"}`}>
        {ok ? <Check className="size-3" strokeWidth={3} /> : <X className="size-3" strokeWidth={3} />}
      </span>
      {texto}
    </li>
  );
}

function SemTeste({ titulo, nomes }: { titulo: string; nomes: string[] }) {
  return (
    <div>
      <div className="mb-2 text-[13px] font-semibold">{titulo}</div>
      {nomes.length > 0
        ? <div className="flex flex-wrap gap-2">{nomes.map((n) => <Chip key={n} tone="neutral">{n}</Chip>)}</div>
        : <p className="text-[13px] text-ink-2">Todos têm teste correspondente.</p>}
    </div>
  );
}

export function AvisoSemContexto() {
  return (
    <div role="status" className="mt-6 rounded-2xl border border-line-2 bg-surface px-5 py-4 text-[13px] text-ink-2">
      <b className="text-ink">Esta análise é anterior ao contexto do projeto.</b>{" "}
      Para ver arquitetura, features e classes sem teste,{" "}
      <Link href="/repositorios/adicionar" className="font-bold text-koda-texto">analise o repositório de novo</Link>.
    </div>
  );
}

export default function CartaoContexto({ contexto }: { contexto: ContextoProjeto }) {
  const arquitetura = arquiteturaDe(contexto.arquitetura);
  const { componentes, testes, infra } = contexto;

  return (
    <Card className="mt-6">
      <Eyebrow>Arquitetura e qualidade</Eyebrow>
      <div className="grid gap-8 md:grid-cols-2">
        <div>
          <div className="text-lg font-bold">{arquitetura.rotulo}</div>
          <p className="mt-1 text-sm leading-relaxed text-ink-2">{arquitetura.descricao}</p>

          {contexto.features.length > 0 && (
            <>
              <div className="mt-6"><Eyebrow>Features</Eyebrow></div>
              <div className="-mt-2 flex flex-wrap gap-2">{contexto.features.map((f) => <Chip key={f}>{f}</Chip>)}</div>
            </>
          )}

          <div className="mt-6"><Eyebrow>Projeto</Eyebrow></div>
          <ul className="-mt-2 grid gap-2">
            <Situacao ok={componentes.temTratadorDeErros} texto={componentes.temTratadorDeErros ? "Tem tratador global de erros" : "Sem tratador global de erros"} />
            <Situacao ok={infra.temDockerfile} texto={infra.temDockerfile ? "Tem Dockerfile" : "Sem Dockerfile"} />
            <Situacao ok={infra.temCompose} texto={infra.temCompose ? "Tem Docker Compose" : "Sem Docker Compose"} />
          </ul>
          <p className="mt-4 text-[13px] text-ink-2">
            {plural(componentes.dtos.length, "DTO", "DTOs")} · {plural(componentes.excecoes.length, "exceção própria", "exceções próprias")}
          </p>
        </div>

        <div className="grid content-start gap-5">
          <div>
            <div className="text-sm"><b className="text-xl">{testes.total}</b> <span className="text-ink-2">{testes.total === 1 ? "classe de teste" : "classes de teste"}</span></div>
          </div>
          <SemTeste titulo="Services sem teste" nomes={testes.servicesSemTeste} />
          <SemTeste titulo="Controllers sem teste" nomes={testes.controllersSemTeste} />
        </div>
      </div>
      {contexto.truncado && (
        <p className="mt-6 text-[12px] text-ink-2">Algumas listas foram limitadas para manter o resumo enxuto.</p>
      )}
    </Card>
  );
}
