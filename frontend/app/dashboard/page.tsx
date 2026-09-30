import Link from "next/link";
import { ArrowRight, Check, Clock, Flame, GitBranch, Play, Star, Users, SquareCheck } from "lucide-react";
import AppShell from "@/components/AppShell";
import { AvisoExemplo, Mascot } from "@/components/ui";
import RepositoriosConectados from "@/components/RepositoriosConectados";
import { Saudacao } from "@/components/Saudacao";
import { home } from "@/lib/home";

const card = "rounded-3xl bg-white shadow-soft";
const pill = "rounded-full border border-[#ece9f5] bg-white px-3 py-1 text-xs font-semibold text-[#3b4058]";
const seeAll = "rounded-[10px] border border-[#e5e2f2] px-3 py-1.5 text-xs font-semibold transition duration-200 hover:translate-x-0.5 hover:bg-koda-soft";

export default function Dashboard() {
  return (
    <AppShell>
      <AvisoExemplo>Só a saudação, o menu lateral e os repositórios conectados são reais. O restante chega com a Etapa 8 (progresso e histórico) e com os desafios.</AvisoExemplo>
      <div className="flex flex-wrap gap-5">
        <div className="grid min-w-0 flex-[1_1_560px] content-start gap-5">
          <section className="flex flex-wrap items-center justify-between gap-2 px-2 pt-3">
            <div className="flex-[1_1_300px]">
              <h1 className="text-4xl font-extrabold tracking-[-0.04em] lg:text-[52px]"><Saudacao /></h1>
              <p className="mt-2 max-w-[420px] text-lg leading-snug text-[#3b4058]">Seu próximo desafio já está pronto para você continuar evoluindo como dev!</p>
            </div>
            <Mascot name="laptop" className="-mt-4 ml-auto h-44 sm:h-52" />
          </section>

          <section className={card + " flex flex-wrap items-center gap-6 p-6 sm:px-7"}>
            <div className="min-w-0 flex-[1_1_320px]">
              <div className="mb-4 flex flex-wrap gap-2 text-xs font-semibold">
                <span className="inline-flex items-center gap-1.5 rounded-[10px] bg-[#fff4dc] px-3 py-1.5"><Star className="size-3.5 fill-[#f5a623] text-[#f5a623]" />Desafio em destaque</span>
                <span className="rounded-[10px] bg-koda-soft px-3 py-1.5 text-koda">Backend</span>
                <span className="rounded-[10px] bg-koda-soft px-3 py-1.5 text-koda">Júnior</span>
              </div>
              <h2 className="text-[22px] leading-tight font-bold tracking-tight">DEV-034 · Adicionar filtro de pagamentos por status do escopo</h2>
              <p className="mt-2 mb-4 max-w-[520px] text-sm leading-relaxed text-ink-2">Permitir filtrar os pagamentos de um escopo por status direto no endpoint, seguindo os padrões do projeto e incluindo testes.</p>
              <div className="flex flex-wrap gap-2">{home.featuredTags.map((t) => <span key={t} className={pill}>{t}</span>)}</div>
              <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-[13px] text-[#3b4058]">
                <span className="inline-flex items-center gap-1.5"><SquareCheck className="size-4 text-koda" />4 critérios de aceite</span>
                <span className="inline-flex items-center gap-1.5"><Clock className="size-4 text-koda" />Estimativa: 3–5 horas</span>
                <span className="inline-flex items-center gap-1.5"><Users className="size-4 text-koda" />52 devs já concluíram</span>
              </div>
            </div>
            <div className="grid flex-[0_0_170px] gap-2.5 rounded-[20px] bg-[#faf9ff] p-3.5">
              <Link href="/desafio/DEV-034" className="inline-flex h-12 items-center justify-center gap-2 rounded-[14px] bg-koda font-semibold text-white transition duration-200 hover:-translate-y-0.5 hover:bg-koda-dark hover:text-white hover:shadow-[0_12px_28px_rgb(102_92_255/0.4)] active:scale-[.97]">Ver desafio <ArrowRight className="size-4" /></Link>
              <Link href="/projeto" className="inline-flex h-12 items-center justify-center rounded-[14px] border border-[#ddd9ff] bg-white text-sm font-semibold text-koda transition duration-200 hover:scale-105 hover:bg-koda hover:text-white active:scale-95">Mais detalhes</Link>
            </div>
          </section>

          <RepositoriosConectados />

          <div className="grid gap-5 md:grid-cols-2">
            <section className={card + " p-6"}>
              <h2 className="mb-3.5 font-bold">Atividades recentes</h2>
              <ul className="grid gap-3.5">
                {home.activities.map((a) => (
                  <li key={a.t} className="flex items-center gap-3 text-[13px]">
                    <span className="grid size-6.5 shrink-0 place-items-center rounded-full bg-koda-soft text-koda">{a.done ? <Check className="size-3.5" strokeWidth={3} /> : <GitBranch className="size-3.5" />}</span>
                    <span className="flex-1">{a.t}</span><span className="text-[11px] whitespace-nowrap text-[#8a8fa5]">{a.w}</span>
                  </li>
                ))}
              </ul>
            </section>
            <section className={card + " p-6"}>
              <h2 className="mb-3.5 font-bold">Seus próximos passos</h2>
              <ol className="grid gap-3">
                {home.next.map((n, i) => (
                  <li key={n.t}><Link href="/desafio/DEV-034" className="flex items-center gap-3 text-[13px] text-ink hover:text-ink">
                    <span className="grid size-6.5 shrink-0 place-items-center rounded-full bg-koda text-xs font-bold text-white">{i + 1}</span>
                    <span className="flex-1">{n.t}</span><span className="rounded-lg bg-koda-soft px-2.5 py-0.5 text-[11px] text-koda">{n.tag}</span>
                  </Link></li>
                ))}
              </ol>
            </section>
          </div>
        </div>

        <aside className="grid min-w-0 max-w-full flex-[1_1_320px] content-start gap-5 xl:max-w-[340px]">
          <section className={card + " p-5.5"}>
            <div className="mb-3.5 flex items-center justify-between"><h2 className="text-xs font-bold tracking-[0.12em] text-ink-2">SEU PROGRESSO</h2><span className={seeAll}>Ver tudo →</span></div>
            <div className="grid grid-cols-3 gap-2.5">
              {[{ n: 12, l: "concluídos", i: Check, c: "bg-[#dff5e6] text-[#1d7a3c]" }, { n: 4, l: "em andamento", i: Play, c: "bg-[#e4e0fd] text-koda" }, { n: 2, l: "semanas seguidas", i: Flame, c: "bg-[#ffe9dc] text-[#e0631a]" }].map(({ n, l, i: Icon, c }) => (
                <div key={l} className="rounded-2xl border border-[#efecf7] p-3">
                  <div className={"grid size-9 place-items-center rounded-full " + c}><Icon className="size-4" /></div>
                  <div className="mt-2.5 text-[22px] font-extrabold">{n}</div><div className="text-[11px] text-ink-2">{l}</div>
                </div>
              ))}
            </div>
            <h3 className="mt-5 mb-3 text-[13px] font-semibold">Habilidades praticadas</h3>
            <ul className="grid gap-3">
              {home.skills.map((s) => (
                <li key={s.n} className="flex items-center gap-2.5 text-xs">
                  <span className="size-6.5 rounded-lg bg-koda-soft" /><span className="w-20">{s.n}</span>
                  <div className="h-2 flex-1 rounded-full bg-[#efecfb]"><div className="h-2 rounded-full bg-[#7d74ff]" style={{ width: s.v + "%" }} /></div>
                  <span className="w-8 text-right">{s.v}%</span>
                </li>
              ))}
            </ul>
          </section>
          <section className={card + " relative min-h-[170px] overflow-hidden bg-linear-to-br from-white to-[#f5f3ff] p-5.5"}>
            <h2 className="mb-3 text-[11px] font-bold tracking-[0.12em] text-ink-2">PRÓXIMA RECOMENDAÇÃO</h2>
            <div className="max-w-[190px] text-lg leading-tight font-bold">Trabalhar com filas usando RabbitMQ</div>
            <span className="my-2 inline-block rounded-lg bg-koda-soft px-2.5 py-0.5 text-[11px] text-koda">Intermediário</span>
            <p className="max-w-[190px] text-xs leading-snug text-ink-2">Aprenda a implementar um sistema de filas com RabbitMQ no seu projeto.</p>
            <Mascot name="terminal" className="absolute -right-1.5 bottom-0 h-32" />
          </section>
          <section className={card + " relative flex min-h-[150px] items-center overflow-hidden bg-linear-to-br from-[#f5f3ff] to-white p-5.5"}>
            <Mascot name="cafe" className="mr-4 h-32 shrink-0" />
            <div><div className="text-[15px] font-bold">Você está indo muito bem! 💙</div><p className="mt-1.5 text-[13px] leading-snug text-ink-2">Cada desafio te aproxima de conquistas reais. Continue assim!</p></div>
          </section>
        </aside>
      </div>
    </AppShell>
  );
}
