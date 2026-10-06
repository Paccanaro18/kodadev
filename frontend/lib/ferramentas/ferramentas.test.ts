import { describe, expect, it } from "vitest";
import { agruparBits, converterNumero } from "./conversores";
import { calcularHash, codificarBase64, decodificarBase64 } from "./hashes";
import { decodificarJwt } from "./jwt";
import { calcularSubRede, dividirRede } from "./subRedes";

describe("calculadora de sub-redes", () => {
  it("calcula rede, broadcast, faixa e quantidade para um /26", () => {
    expect(calcularSubRede("192.168.1.77/26")).toMatchObject({
      rede: "192.168.1.64", broadcast: "192.168.1.127", primeiro: "192.168.1.65", ultimo: "192.168.1.126",
      mascara: "255.255.255.192", total: 64, utilizaveis: 62, prefixo: 26, categoria: "privado",
    });
  });

  it("aceita a máscara por extenso e mostra os bits", () => {
    const resultado = calcularSubRede("10.0.0.5 255.255.255.0");
    expect(resultado).toMatchObject({ prefixo: 24, rede: "10.0.0.0", utilizaveis: 254 });
    if ("erro" in resultado) throw new Error(resultado.erro);
    expect(resultado.binarioDoIp).toBe("00001010.00000000.00000000.00000101");
    expect(resultado.binarioDaMascara).toBe("11111111.11111111.11111111.00000000");
  });

  it("trata os prefixos extremos", () => {
    expect(calcularSubRede("8.8.8.8/32")).toMatchObject({ rede: "8.8.8.8", utilizaveis: 1, primeiro: "8.8.8.8", ultimo: "8.8.8.8", categoria: "publico" });
    expect(calcularSubRede("10.0.0.0/31")).toMatchObject({ utilizaveis: 2, primeiro: "10.0.0.0", ultimo: "10.0.0.1" });
    expect(calcularSubRede("172.20.5.9/0")).toMatchObject({ rede: "0.0.0.0", broadcast: "255.255.255.255", total: 2 ** 32 });
  });

  it("classifica o tipo de endereço", () => {
    expect(calcularSubRede("172.16.0.1/12")).toMatchObject({ categoria: "privado" });
    expect(calcularSubRede("172.32.0.1/12")).toMatchObject({ categoria: "publico" });
    expect(calcularSubRede("169.254.4.1/16")).toMatchObject({ categoria: "link-local" });
    expect(calcularSubRede("127.0.0.1/8")).toMatchObject({ categoria: "loopback" });
  });

  it("explica as entradas inválidas", () => {
    expect(calcularSubRede("")).toHaveProperty("erro");
    expect(calcularSubRede("192.168.1.1")).toHaveProperty("erro");
    expect(calcularSubRede("999.1.1.1/24")).toMatchObject({ erro: expect.stringContaining("não é um endereço") });
    expect(calcularSubRede("10.0.0.1/33")).toMatchObject({ erro: expect.stringContaining("0 a 32") });
    expect(calcularSubRede("10.0.0.1 255.0.255.0")).toMatchObject({ erro: expect.stringContaining("máscara") });
    expect(calcularSubRede("10.0.0.1/24/8")).toHaveProperty("erro");
  });

  it("divide uma rede em sub-redes iguais", () => {
    const partes = dividirRede("192.168.0.0/24", 26);
    if ("erro" in partes) throw new Error(partes.erro);
    expect(partes.map((p) => p.cidr)).toEqual(["192.168.0.0/26", "192.168.0.64/26", "192.168.0.128/26", "192.168.0.192/26"]);
    expect(partes[1]).toMatchObject({ primeiro: "192.168.0.65", ultimo: "192.168.0.126", broadcast: "192.168.0.127", utilizaveis: 62 });
  });

  it("recusa divisões inválidas ou grandes demais", () => {
    expect(dividirRede("192.168.0.0/24", 24)).toHaveProperty("erro");
    expect(dividirRede("192.168.0.0/24", 31)).toHaveProperty("erro");
    expect(dividirRede("10.0.0.0/8", 30)).toMatchObject({ erro: expect.stringContaining("limite é 256") });
    expect(dividirRede("lixo", 26)).toHaveProperty("erro");
  });
});

describe("conversor de bases", () => {
  it("converte entre decimal, binário, octal e hexadecimal", () => {
    expect(converterNumero("255", 10)).toEqual({ decimal: "255", binario: "11111111", octal: "377", hexadecimal: "FF" });
    expect(converterNumero("11000000", 2)).toMatchObject({ decimal: "192", hexadecimal: "C0" });
    expect(converterNumero("0xff", 16)).toMatchObject({ decimal: "255" });
    expect(converterNumero("1010 1010", 2)).toMatchObject({ decimal: "170" });
    expect(converterNumero("777", 8)).toMatchObject({ decimal: "511" });
  });

  it("rejeita dígitos inválidos, vazio e números grandes demais", () => {
    expect(converterNumero("102", 2)).toMatchObject({ erro: expect.stringContaining("binário") });
    expect(converterNumero("xyz", 16)).toHaveProperty("erro");
    expect(converterNumero("  ", 10)).toEqual({ erro: "Digite um número." });
    expect(converterNumero("18446744073709551616", 10)).toMatchObject({ erro: expect.stringContaining("64 bits") });
    expect(converterNumero("18446744073709551615", 10)).toHaveProperty("decimal");
  });

  it("agrupa os bits de quatro em quatro", () => {
    expect(agruparBits("11000000")).toBe("1100 0000");
    expect(agruparBits("101")).toBe("101");
    expect(agruparBits("1100000010")).toBe("11 0000 0010");
  });
});

const TOKEN_EXEMPLO = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";

function token(cabecalho: object, carga: object, assinatura = "assinatura"): string {
  const url = (valor: object) => codificarBase64(JSON.stringify(valor), true);
  return `${url(cabecalho)}.${url(carga)}.${assinatura}`;
}

describe("decodificador de JWT", () => {
  it("lê o cabeçalho, a carga e as datas", () => {
    const resultado = decodificarJwt(TOKEN_EXEMPLO, new Date("2020-01-01T00:00:00Z"));
    if ("erro" in resultado) throw new Error(resultado.erro);
    expect(resultado.cabecalho).toEqual({ alg: "HS256", typ: "JWT" });
    expect(resultado.carga).toMatchObject({ sub: "1234567890", name: "John Doe" });
    expect(resultado.emitidoEm).toBe("2018-01-18T01:30:22.000Z");
    expect(resultado.algoritmo).toBe("HS256");
    expect(resultado.temAssinatura).toBe(true);
    expect(resultado.avisos.join(" ")).toContain("não tem expiração");
    expect(resultado.avisos.join(" ")).toContain("HMAC");
  });

  it("aceita o prefixo Bearer e avisa de expiração", () => {
    const expirado = token({ alg: "RS256" }, { exp: 1000 });
    const resultado = decodificarJwt(`Bearer ${expirado}`, new Date("2020-01-01T00:00:00Z"));
    if ("erro" in resultado) throw new Error(resultado.erro);
    expect(resultado.expirado).toBe(true);
    expect(resultado.expiraEm).toBe("1970-01-01T00:16:40.000Z");
    expect(resultado.avisos).toContain("O token já expirou.");

    const valido = decodificarJwt(token({ alg: "RS256" }, { exp: 4102444800 }), new Date("2020-01-01T00:00:00Z"));
    if ("erro" in valido) throw new Error(valido.erro);
    expect(valido.expirado).toBe(false);
  });

  it("avisa sobre alg none e token sem assinatura", () => {
    const resultado = decodificarJwt(token({ alg: "none" }, { sub: "x" }, ""));
    if ("erro" in resultado) throw new Error(resultado.erro);
    expect(resultado.temAssinatura).toBe(false);
    expect(resultado.avisos.join(" ")).toContain("alg none");
  });

  it("decodifica acentos e rejeita tokens malformados", () => {
    const acentuado = decodificarJwt(token({ alg: "HS256" }, { nome: "João Ação" }));
    if ("erro" in acentuado) throw new Error(acentuado.erro);
    expect(acentuado.carga.nome).toBe("João Ação");
    expect(decodificarJwt("a.b")).toMatchObject({ erro: expect.stringContaining("três partes") });
    expect(decodificarJwt("%%%.%%%.x")).toHaveProperty("erro");
    expect(decodificarJwt(`${codificarBase64("[1]", true)}.${codificarBase64("{}", true)}.x`)).toMatchObject({ erro: expect.stringContaining("não é um objeto") });
  });
});

describe("hash e Base64", () => {
  it("calcula SHA-256 e SHA-1 conhecidos", async () => {
    expect(await calcularHash("abc", "SHA-256")).toBe("ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad");
    expect(await calcularHash("abc", "SHA-1")).toBe("a9993e364706816aba3e25717850c26c9cd0d89d");
    expect((await calcularHash("", "SHA-512")).length).toBe(128);
  });

  it("codifica e decodifica Base64, com UTF-8 e a variante para URL", () => {
    expect(codificarBase64("koda")).toBe("a29kYQ==");
    expect(decodificarBase64("a29kYQ==")).toBe("koda");
    expect(decodificarBase64(codificarBase64("João ação ✓"))).toBe("João ação ✓");
    expect(codificarBase64("??>>", true)).toBe("Pz8-Pg");
    expect(decodificarBase64("Pz8-Pg")).toBe("??>>");
  });

  it("recusa Base64 inválido", () => {
    expect(decodificarBase64("***")).toHaveProperty("erro");
  });
});
