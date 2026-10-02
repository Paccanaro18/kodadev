import Link from "next/link";
import { ATUALIZACAO_DOS_DOCUMENTOS, type SecaoDeDocumento } from "@/lib/conteudoPublico";
import { EMAIL_DE_CONTATO } from "@/lib/contato";
import { Titulo } from "./PaginaPublica";

/** Um documento legal em seções numeradas, com índice para pular direto a uma delas. */
export default function Documento({ titulo, introducao, secoes, comContato = false }: {
  titulo: string;
  introducao: string;
  secoes: SecaoDeDocumento[];
  comContato?: boolean;
}) {
  return (
    <>
      <Titulo etiqueta="Legal" titulo={titulo} texto={introducao} />
      <p className="mt-3 text-sm text-ink-2">Última atualização: {ATUALIZACAO_DOS_DOCUMENTOS}</p>

      <div className="mt-10 grid gap-10 lg:grid-cols-[260px_1fr]">
        <nav aria-label="Neste documento" className="lg:sticky lg:top-28 lg:self-start">
          <div className="mb-3 text-xs font-bold tracking-[0.12em] text-ink-2/70 uppercase">Neste documento</div>
          <ol className="grid gap-1.5 text-sm">
            {secoes.map((secao, i) => (
              <li key={secao.titulo}>
                <a href={`#secao-${i + 1}`} className="text-ink hover:text-koda-texto">{secao.titulo}</a>
              </li>
            ))}
          </ol>
        </nav>

        <article className="max-w-[760px] rounded-[28px] bg-surface p-6 shadow-soft sm:p-10">
          {secoes.map((secao, i) => (
            <section key={secao.titulo} id={`secao-${i + 1}`} className="scroll-mt-28 border-b border-line py-6 first:pt-0 last:border-0 last:pb-0">
              <h2 className="text-xl font-bold tracking-tight">{secao.titulo}</h2>
              {secao.paragrafos.map((paragrafo) => <p key={paragrafo} className="mt-3 leading-relaxed text-body">{paragrafo}</p>)}
              {secao.itens && (
                <ul className="mt-3 list-disc space-y-2 pl-5 leading-relaxed text-body marker:text-koda-texto">
                  {secao.itens.map((item) => <li key={item}>{item}</li>)}
                </ul>
              )}
            </section>
          ))}
          {comContato && <Contato />}
        </article>
      </div>

      <p className="mt-8 text-sm text-ink-2">
        Veja também: <Link href="/termos" className="font-semibold text-koda-texto">Termos de Uso</Link> e{" "}
        <Link href="/privacidade" className="font-semibold text-koda-texto">Política de Privacidade</Link>.
      </p>
    </>
  );
}

export function Contato() {
  return (
    <section className="mt-6 rounded-2xl bg-tint p-5">
      <h2 className="text-lg font-bold">Contato</h2>
      <p className="mt-2 text-sm leading-relaxed text-body">
        {EMAIL_DE_CONTATO
          ? <>Para exercer os seus direitos ou tirar dúvidas sobre esta política, escreva para <a href={`mailto:${EMAIL_DE_CONTATO}`} className="font-semibold text-koda-texto">{EMAIL_DE_CONTATO}</a>.</>
          : "O canal de contato para pedidos sobre os seus dados será divulgado nesta página no lançamento do serviço."}
      </p>
    </section>
  );
}
