const formatador = new Intl.RelativeTimeFormat("pt-BR", { numeric: "auto" });

const UNIDADES: [Intl.RelativeTimeFormatUnit, number][] = [
  ["year", 31_536_000],
  ["month", 2_592_000],
  ["week", 604_800],
  ["day", 86_400],
  ["hour", 3_600],
  ["minute", 60],
];

/** "2024-05-01T10:00:00Z" -> "há 2 dias", "ontem", "há 3 semanas"... */
export function tempoRelativo(iso: string | null): string {
  if (!iso) return "";

  const segundos = Math.round((new Date(iso).getTime() - Date.now()) / 1000);
  for (const [unidade, tamanho] of UNIDADES) {
    if (Math.abs(segundos) >= tamanho) {
      return formatador.format(Math.round(segundos / tamanho), unidade);
    }
  }
  return "agora";
}
