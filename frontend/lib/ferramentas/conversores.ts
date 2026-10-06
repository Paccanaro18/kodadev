export type BaseNumerica = 2 | 8 | 10 | 16;

export type Conversao = { decimal: string; binario: string; octal: string; hexadecimal: string };
export type ErroDeConversao = { erro: string };

const DIGITOS: Record<BaseNumerica, RegExp> = {
  2: /^[01]+$/,
  8: /^[0-7]+$/,
  10: /^\d+$/,
  16: /^[0-9a-f]+$/i,
};

const NOMES: Record<BaseNumerica, string> = { 2: "binário", 8: "octal", 10: "decimal", 16: "hexadecimal" };
const PREFIXOS: Record<BaseNumerica, string> = { 2: "0b", 8: "0o", 10: "", 16: "0x" };

export function converterNumero(texto: string, base: BaseNumerica): Conversao | ErroDeConversao {
  let limpo = texto.trim().replace(/[\s_]/g, "");
  if (PREFIXOS[base] !== "" && limpo.toLowerCase().startsWith(PREFIXOS[base])) limpo = limpo.slice(2);
  if (limpo === "") return { erro: "Digite um número." };
  if (!DIGITOS[base].test(limpo)) return { erro: `${texto.trim()} não é um número ${NOMES[base]} válido.` };
  const valor = BigInt(`${PREFIXOS[base]}${limpo}`);
  if (valor > BigInt(2) ** BigInt(64) - BigInt(1)) return { erro: "O número é grande demais: o limite é 64 bits." };
  return { decimal: valor.toString(10), binario: valor.toString(2), octal: valor.toString(8), hexadecimal: valor.toString(16).toUpperCase() };
}

/** Agrupa os bits de quatro em quatro, da direita para a esquerda, para ler melhor. */
export function agruparBits(binario: string): string {
  return binario.replace(/\B(?=(\d{4})+(?!\d))/g, " ");
}
