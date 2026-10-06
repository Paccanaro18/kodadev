export type ItemDoMenu = {
  rotulo: string;
  href: string;
  /** Prefixos de rota que deixam o item marcado como ativo. */
  rotas: string[];
};

export type EntradaDoMenu =
  | { tipo: "link"; icone: IconeDoMenu; item: ItemDoMenu }
  | { tipo: "grupo"; id: string; rotulo: string; icone: IconeDoMenu; itens: ItemDoMenu[] };

export type IconeDoMenu = "home" | "desafios" | "aprender" | "comunidade" | "configuracoes";

export const MENU: EntradaDoMenu[] = [
  { tipo: "link", icone: "home", item: { rotulo: "Home", href: "/dashboard", rotas: ["/dashboard"] } },
  {
    tipo: "grupo", id: "desafios", rotulo: "Desafios", icone: "desafios",
    itens: [
      { rotulo: "Meus desafios", href: "/desafios", rotas: ["/desafios", "/projeto", "/desafio"] },
      { rotulo: "Repositórios", href: "/repositorios/adicionar", rotas: ["/repositorios", "/analisando"] },
      { rotulo: "Segurança", href: "/seguranca", rotas: ["/seguranca"] },
    ],
  },
  {
    tipo: "grupo", id: "aprender", rotulo: "Aprender", icone: "aprender",
    itens: [
      { rotulo: "Aprenda aqui", href: "/aprenda", rotas: ["/aprenda"] },
      { rotulo: "Redes", href: "/redes", rotas: ["/redes"] },
      { rotulo: "Ferramentas", href: "/ferramentas", rotas: ["/ferramentas"] },
    ],
  },
  {
    tipo: "grupo", id: "comunidade", rotulo: "Comunidade", icone: "comunidade",
    itens: [
      { rotulo: "Comunidade", href: "/comunidade", rotas: ["/comunidade"] },
      { rotulo: "Conquistas", href: "/conquistas", rotas: ["/conquistas"] },
    ],
  },
  { tipo: "link", icone: "configuracoes", item: { rotulo: "Configurações", href: "/configuracoes", rotas: ["/configuracoes"] } },
];

function todosOsItens(menu: EntradaDoMenu[]): ItemDoMenu[] {
  return menu.flatMap((entrada) => (entrada.tipo === "link" ? [entrada.item] : entrada.itens));
}

/**
 * O item do menu que corresponde à rota atual. Vale o prefixo mais longo, para "/desafios" não marcar também um item
 * cujo prefixo seja só "/desafio", e nunca há mais de um item ativo.
 */
export function itemAtivo(caminho: string, menu: EntradaDoMenu[] = MENU): ItemDoMenu | null {
  let melhor: { item: ItemDoMenu; tamanho: number } | null = null;
  for (const item of todosOsItens(menu)) {
    for (const rota of item.rotas) {
      const casa = caminho.startsWith(rota);
      if (casa && (melhor === null || rota.length > melhor.tamanho)) melhor = { item, tamanho: rota.length };
    }
  }
  return melhor?.item ?? null;
}

/** O id do grupo que contém a rota atual, para abri-lo sozinho. */
export function grupoAtivo(caminho: string, menu: EntradaDoMenu[] = MENU): string | null {
  const ativo = itemAtivo(caminho, menu);
  if (!ativo) return null;
  for (const entrada of menu) {
    if (entrada.tipo === "grupo" && entrada.itens.includes(ativo)) return entrada.id;
  }
  return null;
}

export const CHAVE_DO_MENU = "koda-menu-abertos";

export function lerGruposAbertos(texto: string | null): string[] {
  if (!texto) return [];
  try {
    const valor: unknown = JSON.parse(texto);
    const ids = MENU.flatMap((entrada) => (entrada.tipo === "grupo" ? [entrada.id] : []));
    return Array.isArray(valor) ? valor.filter((v): v is string => typeof v === "string" && ids.includes(v)) : [];
  } catch {
    return [];
  }
}
