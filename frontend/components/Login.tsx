import { ArrowRight, BarChart3, Code2, Folder, GitBranch, Lock, ShieldCheck, Heart } from "lucide-react";
import Link from "next/link";
import SeloDeLinguagem from "./SeloDeLinguagem";
import { PAGINAS_PUBLICAS } from "@/lib/contato";
import { LogoImagem, Mascot } from "./ui";

const githubLogin =
  process.env.NEXT_PUBLIC_GITHUB_AUTH_URL ??
  "http://localhost:8080/oauth2/authorization/github";

function GithubMark() {
  return (
    <svg viewBox="0 0 24 24" className="size-9 sm:size-10" aria-hidden>
      <circle cx="12" cy="12" r="12" fill="#fff" />
      <path fill="#12163a" d="M12 3.5a8.5 8.5 0 0 0-2.7 16.6c.4.1.6-.2.6-.4v-1.5c-2.4.5-2.9-1-2.9-1-.4-1-1-1.3-1-1.3-.8-.5.1-.5.1-.5.9.1 1.4.9 1.4.9.8 1.4 2.1 1 2.6.8.1-.6.3-1 .6-1.2-1.9-.2-3.9-1-3.9-4.2 0-.9.3-1.7.9-2.3-.1-.2-.4-1.1.1-2.3 0 0 .7-.2 2.3.9a8 8 0 0 1 4.2 0c1.6-1.1 2.3-.9 2.3-.9.5 1.2.2 2.1.1 2.3.5.6.9 1.4.9 2.3 0 3.2-2 4-3.9 4.2.3.3.6.8.6 1.6v2.3c0 .2.2.5.6.4A8.5 8.5 0 0 0 12 3.5z" />
    </svg>
  );
}

const features = [
  { icon: Folder, t: "Lê a estrutura do projeto", d: "Entende tecnologias, arquitetura e contexto." },
  { icon: Code2, t: "Cria tickets realistas", d: "Desafios baseados no seu próprio código." },
  { icon: BarChart3, t: "Sem exercícios genéricos", d: "Prática focada em evolução real." },
];

const tree = [
  [0, "src"], [1, "controllers"], [1, "services"], [1, "repositories"], [1, "models"], [1, "dto"], [0, "tests"],
] as const;

export function LoginHero() {
  return (
    <section className="relative flex flex-col overflow-hidden bg-linear-to-b from-cream via-tint to-cream px-5 pt-6 pb-10 sm:px-10 lg:px-16">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <LogoImagem className="h-12" />
        <nav className="hidden gap-9 text-sm font-medium sm:flex lg:mr-14">
          {PAGINAS_PUBLICAS.map(({ rotulo, href }) => (
            <Link key={href} href={href} className="text-ink transition duration-200 hover:text-koda-texto">{rotulo}</Link>
          ))}
        </nav>
      </div>

      <h1 className="mt-10 max-w-[680px] text-[40px] leading-[1.02] font-extrabold tracking-[-0.045em] sm:text-6xl lg:mt-20 lg:text-[68px]">
        Seu próximo desafio começa no seu <span className="text-koda-texto">código</span>.
      </h1>
      <p className="mt-5 max-w-[570px] text-base leading-relaxed sm:text-xl">
        Conecte seu GitHub. A Koda entende seu projeto e transforma o repositório em tarefas de desenvolvimento que parecem trabalho de verdade.
      </p>

      <div className="mt-8 grid max-w-[760px] gap-5 sm:grid-cols-3">
        {features.map(({ icon: Icon, t, d }) => (
          <div key={t} className="flex gap-3.5">
            <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-koda-soft text-koda-texto"><Icon className="size-6" /></div>
            <div>
              <div className="text-base leading-snug font-bold">{t}</div>
              <div className="mt-1.5 text-[13px] leading-snug text-ink-2">{d}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="relative mt-10 hidden h-[370px] w-full max-w-[840px] md:block">
        <div className="absolute top-0 left-0 h-[350px] w-[68%] max-w-[570px] overflow-hidden rounded-t-[18px] bg-surface shadow-[0_14px_50px_rgb(102_92_255/0.1)]">
          <div className="flex gap-1.5 p-3.5"><i className="size-2.5 rounded-full bg-[#ff6058]" /><i className="size-2.5 rounded-full bg-[#ffbd2e]" /><i className="size-2.5 rounded-full bg-[#28c941]" /></div>
          <div className="grid h-[calc(100%-38px)] grid-cols-[32%_1fr]">
            <div className="overflow-hidden bg-tint p-3.5 text-[11.5px] leading-7 whitespace-nowrap">
              <div className="mb-1 font-semibold">seu-projeto</div>
              {tree.map(([d, n]) => <div key={n} style={{ paddingLeft: d * 10 }}>▸ {n}</div>)}
              <div>README.md</div>
            </div>
            <div className="p-5">
              <div className="rounded-2xl p-5 shadow-[0_4px_24px_rgb(102_92_255/0.1)]">
                <div className="flex items-center justify-between">
                  <span className="rounded-[9px] bg-koda-soft px-3 py-1 text-[13px] font-bold text-koda-texto">DEV-042</span>
                  <span className="rounded-md border border-line-2 px-2 py-0.5 text-[11px] text-koda-texto">Backend</span>
                </div>
                <div className="mt-4 mb-2 text-[17px] leading-tight font-bold">Implementar paginação na lista de usuários</div>
                <div className="text-xs leading-normal text-ink-2">Adicionar paginação no endpoint de listagem de usuários, seguindo o padrão do projeto.</div>
                <dl className="mt-4 grid gap-2.5 text-[13px]">
                  <div>Critérios de aceite <span className="ml-2 text-xs text-ink-2">4 itens</span></div>
                  <div>Tecnologias <span className="ml-2 text-xs text-ink-2">as do seu projeto</span></div>
                  <div>Dificuldade <span className="ml-2 text-xs text-koda-texto">Júnior</span></div>
                </dl>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute top-2.5 left-[68%] ml-3.5 h-[340px] w-[110px] rounded-t-[14px] bg-[#2b2f4a]/90" />
        <div className="absolute top-0 right-5 z-20 w-[150px] rounded-[20px] bg-koda-soft px-4 py-3.5 text-[15px] leading-tight font-semibold text-koda-texto">Transforme seu repositório em evolução.</div>
        <Mascot name="laptop" className="absolute right-0 -bottom-6 z-10 h-[270px] drop-shadow-[0_18px_24px_rgb(102_92_255/0.25)]" />
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-2 text-sm text-ink-2">
        <span>Para projetos em</span>
        {(["JAVA", "TYPESCRIPT", "PYTHON"] as const).map((l) => <SeloDeLinguagem key={l} linguagem={l} />)}
      </div>
      <p className="mt-3 text-sm text-ink-2">Junte-se a devs que já estão praticando com a Koda.</p>
    </section>
  );
}

export function LoginCard({ erro = false }: { erro?: boolean }) {
  const trust = [{ i: Lock, t: "Seguro" }, { i: GitBranch, t: "Apenas públicos" }, { i: ShieldCheck, t: "Você controla" }];
  return (
    <section className="flex flex-col bg-tint px-4 pt-6 pb-10 sm:px-8">
      <div className="flex items-center gap-3.5 self-end text-[13px] leading-snug text-ink-2">
        <span>Feito para<br />desenvolvedores</span><Heart className="size-5 fill-koda text-koda-texto" />
      </div>
      <div className="relative mt-40 w-full max-w-[520px] self-center rounded-[30px] border border-line bg-tint px-5 pb-11 shadow-[0_12px_50px_rgb(17_21_45/0.05)] sm:px-12 lg:mt-44">
        <div className="relative -mt-[115px] flex h-[185px] justify-center">
          <div className="h-[185px] w-[330px] overflow-hidden [mask-image:linear-gradient(#000_82%,transparent)]">
            <Mascot name="aceno" className="h-auto w-[330px]" />
          </div>
          <div className="absolute top-[95px] left-0 grid h-16 w-[68px] place-items-center rounded-[18px_18px_18px_6px] border-2 border-line-2 bg-koda-soft shadow-[0_8px_20px_rgb(102_92_255/0.15)] sm:left-6">
            <GitBranch className="size-8 text-koda-texto" />
          </div>
        </div>
        <div className="rounded-t-[26px] bg-tint pt-6">
          <h2 className="text-center text-3xl font-bold tracking-tight whitespace-nowrap sm:text-[44px]">Entrar na Koda</h2>
          <p className="mt-3 mb-10 text-center text-base text-body sm:text-lg">Use sua conta do GitHub para continuar.</p>
          {erro && (
            <p role="alert" className="-mt-5 mb-6 rounded-2xl bg-bad-soft px-4 py-3 text-center text-sm text-bad">Não foi possível entrar com o GitHub. Tente novamente.</p>
          )}
          <a href={githubLogin} className="relative flex h-16 w-full items-center justify-center gap-4 rounded-2xl bg-navy pr-14 pl-5 text-base font-medium whitespace-nowrap text-white shadow-[0_8px_22px_rgb(18_22_58/0.16)] group transition duration-200 ease-out hover:-translate-y-0.5 hover:bg-[#1d2246] hover:text-white hover:shadow-[0_14px_30px_rgb(18_22_58/0.28)] active:translate-y-0 active:scale-[.98] sm:text-xl">
            <GithubMark /> Continuar com GitHub
            <ArrowRight className="absolute right-6 size-5 text-ink-3 transition duration-200 group-hover:translate-x-1.5 group-hover:text-white" />
          </a>
          <ul className="mt-12 flex flex-wrap items-center justify-around gap-2 rounded-2xl border border-line bg-tint px-2 py-3.5 text-sm font-medium">
            {trust.map(({ i: Icon, t }, k) => (
              <li key={t} className={`flex items-center gap-2 ${k ? "sm:border-l sm:border-line sm:pl-4" : ""}`}><Icon className="size-5 text-koda-texto" />{t}</li>
            ))}
          </ul>
          <p className="mt-20 text-center text-sm leading-7 text-body">
            Ao continuar, você concorda com nossos<br />
            <Link href="/termos" className="underline">Termos de Uso</Link> e <Link href="/privacidade" className="underline">Política de Privacidade.</Link>
          </p>
        </div>
      </div>
    </section>
  );
}
