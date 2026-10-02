/** O canal de contato é definido por variável de ambiente, para o e-mail real nunca ficar no código. */
export const EMAIL_DE_CONTATO: string | null = process.env.NEXT_PUBLIC_EMAIL_DE_CONTATO?.trim() || null;

export const PAGINAS_PUBLICAS = [
  { rotulo: "Produto", href: "/produto" },
  { rotulo: "Recursos", href: "/recursos" },
  { rotulo: "Blog", href: "/blog" },
  { rotulo: "Ajuda", href: "/ajuda" },
] as const;

export const DOCUMENTOS_LEGAIS = [
  { rotulo: "Termos de Uso", href: "/termos" },
  { rotulo: "Política de Privacidade", href: "/privacidade" },
] as const;
