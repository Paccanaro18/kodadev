import Link from "next/link";
import { Plus } from "lucide-react";
import AppShell from "@/components/AppShell";
import { AvisoExemplo, BackLink, btnPrimary, Card, Chip, Eyebrow, PageHeader, StatusBadge } from "@/components/ui";
import { project } from "@/lib/data";

export default async function Projeto({ searchParams }: { searchParams: Promise<{ repo?: string }> }) {
  const { repo } = await searchParams;
  const nome = repo?.split("/")[1] ?? project.name;

  return (
    <AppShell>
      <AvisoExemplo>O nome do repositório é real. Stack, arquitetura, endpoints e desafios chegam com o Repository Analyzer (Etapa 4).</AvisoExemplo>
      <PageHeader
        mascot="laptop"
        title={nome}
        subtitle="Análise concluída. A Koda entendeu o seu projeto."
        action={<Link href="/desafio/novo" className={btnPrimary + " hover:text-white"}><Plus className="size-4" /> Novo desafio</Link>}
      >
        <BackLink href="/dashboard">← Repositórios</BackLink>
      </PageHeader>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <Card>
          <Eyebrow>Stack detectada</Eyebrow>
          <div className="flex flex-wrap gap-2">{project.stack.map((s) => <Chip key={s}>{s}</Chip>)}</div>
          <div className="mt-6"><Eyebrow>Arquitetura</Eyebrow></div>
          <p className="-mt-2 text-sm leading-relaxed">{project.architecture}</p>
        </Card>
        <Card>
          <Eyebrow>Domínios</Eyebrow>
          <div className="flex flex-wrap gap-2">{project.domains.map((s) => <Chip key={s} tone="neutral">{s}</Chip>)}</div>
          <div className="mt-6"><Eyebrow>Endpoints</Eyebrow></div>
          <ul className="-mt-2 grid gap-2 text-[13px]">
            {project.endpoints.map((e) => (
              <li key={e.method + e.path} className="flex items-center gap-2.5">
                <b className="w-11 rounded-lg bg-koda-soft py-0.5 text-center text-[11px] text-koda">{e.method}</b>
                <code className="font-mono break-all">{e.path}</code>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Card className="mt-6">
        <Eyebrow>Desafios</Eyebrow>
        <ul>
          {project.tickets.map((t) => (
            <li key={t.id} className="border-b border-[#f4f1fa] last:border-0">
              <Link href="/desafio/DEV-034" className="flex flex-wrap items-center gap-x-4 gap-y-2 py-4 text-ink transition duration-200 hover:translate-x-2 hover:bg-[#faf9ff] hover:text-ink active:translate-x-1">
                <span className="rounded-[10px] bg-koda-soft px-3 py-1 text-[13px] font-bold text-koda">{t.id}</span>
                <span className="min-w-[200px] flex-1 font-semibold">{t.title}</span>
                <span className="text-xs text-ink-2">{t.type} · Júnior</span>
                <StatusBadge status={t.status} />
              </Link>
            </li>
          ))}
        </ul>
      </Card>
    </AppShell>
  );
}
