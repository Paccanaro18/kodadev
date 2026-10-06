export function analisarIp(texto: string): number | null {
  const partes = texto.trim().split(".");
  if (partes.length !== 4) return null;
  let valor = 0;
  for (const parte of partes) {
    if (!/^\d{1,3}$/.test(parte)) return null;
    const octeto = Number(parte);
    if (octeto > 255) return null;
    valor = valor * 256 + octeto;
  }
  return valor;
}

export function formatarIp(valor: number): string {
  return [24, 16, 8, 0].map((deslocamento) => Math.floor(valor / 2 ** deslocamento) % 256).join(".");
}

export function ipValido(texto: string): boolean {
  return analisarIp(texto) !== null;
}

export function prefixoDaMascara(mascara: string): number | null {
  const valor = analisarIp(mascara);
  if (valor === null) return null;
  let prefixo = 0;
  let ainda = true;
  for (let bit = 31; bit >= 0; bit--) {
    const ligado = Math.floor(valor / 2 ** bit) % 2 === 1;
    if (ligado && ainda) prefixo++;
    else if (ligado && !ainda) return null;
    else ainda = false;
  }
  return prefixo;
}

export function mascaraValida(mascara: string): boolean {
  return prefixoDaMascara(mascara) !== null;
}

export function mascaraDoPrefixo(prefixo: number): string {
  if (prefixo <= 0) return "0.0.0.0";
  const valor = prefixo >= 32 ? 2 ** 32 - 1 : 2 ** 32 - 2 ** (32 - prefixo);
  return formatarIp(valor);
}

function enderecoDaRede(ip: number, prefixo: number): number {
  if (prefixo === 0) return 0;
  const tamanho = 2 ** (32 - prefixo);
  return Math.floor(ip / tamanho) * tamanho;
}

export function redeDe(ip: string, mascara: string): string | null {
  const valor = analisarIp(ip);
  const prefixo = prefixoDaMascara(mascara);
  if (valor === null || prefixo === null) return null;
  return formatarIp(enderecoDaRede(valor, prefixo));
}

export function pertenceARede(ip: string, rede: string, mascara: string): boolean {
  const valor = analisarIp(ip);
  const base = analisarIp(rede);
  const prefixo = prefixoDaMascara(mascara);
  if (valor === null || base === null || prefixo === null) return false;
  return enderecoDaRede(valor, prefixo) === enderecoDaRede(base, prefixo);
}

export function mesmaRede(ipA: string, ipB: string, mascara: string): boolean {
  return pertenceARede(ipA, ipB, mascara);
}

export function cidrValido(texto: string): boolean {
  if (texto === "qualquer") return true;
  const [ip, prefixo, ...resto] = texto.trim().split("/");
  if (resto.length > 0 || !ipValido(ip)) return false;
  if (prefixo === undefined) return true;
  return /^\d{1,2}$/.test(prefixo) && Number(prefixo) >= 0 && Number(prefixo) <= 32;
}

export function pertenceACidr(ip: string, cidr: string): boolean {
  if (cidr === "qualquer") return true;
  if (!cidrValido(cidr)) return false;
  const [base, prefixo] = cidr.trim().split("/");
  return pertenceARede(ip, base, mascaraDoPrefixo(prefixo === undefined ? 32 : Number(prefixo)));
}

export function enderecoDeRedeOuTransmissao(ip: string, mascara: string): "rede" | "transmissao" | null {
  const valor = analisarIp(ip);
  const prefixo = prefixoDaMascara(mascara);
  if (valor === null || prefixo === null || prefixo >= 31) return null;
  const base = enderecoDaRede(valor, prefixo);
  if (valor === base) return "rede";
  if (valor === base + 2 ** (32 - prefixo) - 1) return "transmissao";
  return null;
}
