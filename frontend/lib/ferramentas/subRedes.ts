import { analisarIp, formatarIp, ipValido, mascaraDoPrefixo, prefixoDaMascara } from "@/lib/redes/ip";

export type CategoriaDeEndereco = "privado" | "link-local" | "loopback" | "publico";

export type ResultadoDeSubRede = {
  ip: string;
  prefixo: number;
  mascara: string;
  rede: string;
  broadcast: string;
  primeiro: string;
  ultimo: string;
  total: number;
  utilizaveis: number;
  categoria: CategoriaDeEndereco;
  binarioDoIp: string;
  binarioDaMascara: string;
};

export type ErroDeCalculo = { erro: string };

function emBinario(valor: number): string {
  return [24, 16, 8, 0].map((deslocamento) => (Math.floor(valor / 2 ** deslocamento) % 256).toString(2).padStart(8, "0")).join(".");
}

function categoriaDe(valor: number): CategoriaDeEndereco {
  const a = Math.floor(valor / 2 ** 24);
  const b = Math.floor(valor / 2 ** 16) % 256;
  if (a === 10 || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168)) return "privado";
  if (a === 169 && b === 254) return "link-local";
  if (a === 127) return "loopback";
  return "publico";
}

/** Aceita "192.168.1.77/26" ou "192.168.1.77 255.255.255.192". */
function lerEntrada(texto: string): { ip: string; prefixo: number } | ErroDeCalculo {
  const limpo = texto.trim();
  if (limpo === "") return { erro: "Digite um endereço com prefixo, como 192.168.1.77/26." };
  const [ip, resto, ...sobra] = limpo.split(/[\s/]+/);
  if (sobra.length > 0 || resto === undefined) return { erro: "Use o formato 192.168.1.77/26 ou 192.168.1.77 255.255.255.192." };
  if (!ipValido(ip)) return { erro: `${ip} não é um endereço IPv4 válido.` };
  if (resto.includes(".")) {
    const prefixo = prefixoDaMascara(resto);
    return prefixo === null ? { erro: `${resto} não é uma máscara válida: os bits ligados precisam vir juntos.` } : { ip, prefixo };
  }
  if (!/^\d{1,2}$/.test(resto) || Number(resto) > 32) return { erro: `O prefixo deve ser um número de 0 a 32, e não ${resto}.` };
  return { ip, prefixo: Number(resto) };
}

export function calcularSubRede(texto: string): ResultadoDeSubRede | ErroDeCalculo {
  const entrada = lerEntrada(texto);
  if ("erro" in entrada) return entrada;
  const valor = analisarIp(entrada.ip)!;
  const tamanho = 2 ** (32 - entrada.prefixo);
  const base = Math.floor(valor / tamanho) * tamanho;
  const ultimoDaRede = base + tamanho - 1;
  const pequena = entrada.prefixo >= 31;
  const mascara = mascaraDoPrefixo(entrada.prefixo);
  return {
    ip: entrada.ip,
    prefixo: entrada.prefixo,
    mascara,
    rede: formatarIp(base),
    broadcast: formatarIp(ultimoDaRede),
    primeiro: formatarIp(pequena ? base : base + 1),
    ultimo: formatarIp(pequena ? ultimoDaRede : ultimoDaRede - 1),
    total: tamanho,
    utilizaveis: pequena ? tamanho : tamanho - 2,
    categoria: categoriaDe(valor),
    binarioDoIp: emBinario(valor),
    binarioDaMascara: emBinario(analisarIp(mascara)!),
  };
}

export type SubRedeDividida = { cidr: string; primeiro: string; ultimo: string; broadcast: string; utilizaveis: number };

/** Divide uma rede em sub-redes de um prefixo maior, até o limite de 256 pedaços. */
export function dividirRede(texto: string, novoPrefixo: number): SubRedeDividida[] | ErroDeCalculo {
  const origem = calcularSubRede(texto);
  if ("erro" in origem) return origem;
  if (!Number.isInteger(novoPrefixo) || novoPrefixo <= origem.prefixo || novoPrefixo > 30) {
    return { erro: `O novo prefixo precisa ser maior que /${origem.prefixo} e no máximo /30.` };
  }
  const quantidade = 2 ** (novoPrefixo - origem.prefixo);
  if (quantidade > 256) return { erro: `Isso geraria ${quantidade} sub-redes. O limite é 256: use um prefixo mais próximo de /${origem.prefixo}.` };
  const base = analisarIp(origem.rede)!;
  const tamanho = 2 ** (32 - novoPrefixo);
  return Array.from({ length: quantidade }, (_, i) => {
    const inicio = base + i * tamanho;
    return {
      cidr: `${formatarIp(inicio)}/${novoPrefixo}`,
      primeiro: formatarIp(inicio + 1),
      ultimo: formatarIp(inicio + tamanho - 2),
      broadcast: formatarIp(inicio + tamanho - 1),
      utilizaveis: tamanho - 2,
    };
  });
}
