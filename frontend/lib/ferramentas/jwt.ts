export type JwtDecodificado = {
  cabecalho: Record<string, unknown>;
  carga: Record<string, unknown>;
  algoritmo: string | null;
  temAssinatura: boolean;
  emitidoEm: string | null;
  naoValidoAntesDe: string | null;
  expiraEm: string | null;
  expirado: boolean | null;
  avisos: string[];
};

export type ErroDeJwt = { erro: string };

export function decodificarBase64Url(texto: string): string {
  const padrao = texto.replace(/-/g, "+").replace(/_/g, "/");
  const completo = padrao + "=".repeat((4 - (padrao.length % 4)) % 4);
  const binario = atob(completo);
  return new TextDecoder("utf-8", { fatal: true }).decode(Uint8Array.from(binario, (c) => c.charCodeAt(0)));
}

function lerParte(parte: string, nome: string): { dados: Record<string, unknown> } | ErroDeJwt {
  try {
    const valor: unknown = JSON.parse(decodificarBase64Url(parte));
    if (valor === null || typeof valor !== "object" || Array.isArray(valor)) return { erro: `O ${nome} do token não é um objeto JSON.` };
    return { dados: valor as Record<string, unknown> };
  } catch {
    return { erro: `Não foi possível ler o ${nome} do token: ele não é Base64URL com JSON válido.` };
  }
}

function dataDe(segundos: unknown): string | null {
  return typeof segundos === "number" && Number.isFinite(segundos) ? new Date(segundos * 1000).toISOString() : null;
}

/** Só decodifica. Não verifica a assinatura, que exige a chave. Tudo roda no navegador, e o token não é enviado a ninguém. */
export function decodificarJwt(token: string, agora: Date = new Date()): JwtDecodificado | ErroDeJwt {
  const partes = token.trim().replace(/^Bearer\s+/i, "").split(".");
  if (partes.length !== 3) return { erro: "Um JWT tem três partes separadas por pontos: cabeçalho.carga.assinatura." };
  const lidoCabecalho = lerParte(partes[0], "cabeçalho");
  if ("erro" in lidoCabecalho) return lidoCabecalho;
  const lidaCarga = lerParte(partes[1], "corpo (payload)");
  if ("erro" in lidaCarga) return lidaCarga;
  const cabecalho = lidoCabecalho.dados;
  const carga = lidaCarga.dados;

  const algoritmo = typeof cabecalho.alg === "string" ? cabecalho.alg : null;
  const temAssinatura = partes[2] !== "";
  const exp = typeof carga.exp === "number" ? carga.exp : null;
  const avisos: string[] = [];
  if (algoritmo === null) avisos.push("O cabeçalho não declara o algoritmo (alg).");
  if (algoritmo?.toLowerCase() === "none" || !temAssinatura) avisos.push("O token não tem assinatura (alg none): qualquer pessoa pode forjá-lo, e um servidor nunca deve aceitá-lo.");
  if (algoritmo?.startsWith("HS")) avisos.push("Assinatura HMAC com segredo compartilhado: um segredo fraco pode ser descoberto por força bruta.");
  if (exp === null) avisos.push("O token não tem expiração (exp): se vazar, vale para sempre.");
  const expirado = exp === null ? null : exp * 1000 < agora.getTime();
  if (expirado) avisos.push("O token já expirou.");
  avisos.push("A carga de um JWT é só codificada, não cifrada: não coloque nela nada secreto.");

  return {
    cabecalho,
    carga,
    algoritmo,
    temAssinatura,
    emitidoEm: dataDe(carga.iat),
    naoValidoAntesDe: dataDe(carga.nbf),
    expiraEm: dataDe(carga.exp),
    expirado,
    avisos,
  };
}
