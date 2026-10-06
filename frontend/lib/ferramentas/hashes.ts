export type AlgoritmoDeHash = "SHA-1" | "SHA-256" | "SHA-384" | "SHA-512";

export const ALGORITMOS: { valor: AlgoritmoDeHash; aviso?: string }[] = [
  { valor: "SHA-1", aviso: "Quebrado para assinaturas e senhas: use só para conferir arquivos antigos." },
  { valor: "SHA-256" },
  { valor: "SHA-384" },
  { valor: "SHA-512" },
];

export async function calcularHash(texto: string, algoritmo: AlgoritmoDeHash): Promise<string> {
  const resumo = await crypto.subtle.digest(algoritmo, new TextEncoder().encode(texto));
  return [...new Uint8Array(resumo)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export function codificarBase64(texto: string, seguroParaUrl = false): string {
  const bytes = new TextEncoder().encode(texto);
  const base64 = btoa(String.fromCharCode(...bytes));
  return seguroParaUrl ? base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "") : base64;
}

export function decodificarBase64(texto: string): string | { erro: string } {
  try {
    const padrao = texto.trim().replace(/-/g, "+").replace(/_/g, "/");
    const completo = padrao + "=".repeat((4 - (padrao.length % 4)) % 4);
    const binario = atob(completo);
    return new TextDecoder("utf-8", { fatal: true }).decode(Uint8Array.from(binario, (c) => c.charCodeAt(0)));
  } catch {
    return { erro: "Isso não é Base64 válido, ou o conteúdo decodificado não é texto UTF-8." };
  }
}
