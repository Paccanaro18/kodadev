import type { Bloco } from "@/lib/aulas/tipos";
import type { Rede, TipoDeDispositivo } from "../tipos";

export type Objetivo =
  | { tipo: "cabo"; entre: [string, string]; descricao: string }
  | { tipo: "ip"; dispositivo: string; naRede: { rede: string; mascara: string }; descricao: string }
  | { tipo: "ping"; de: string; para: string; esperado?: boolean; descricao: string }
  | { tipo: "dhcp"; dispositivo: string; descricao: string }
  | { tipo: "dns"; de: string; nome: string; resposta: string; descricao: string }
  | { tipo: "mac-aprendido"; comutador: string; minimo: number; descricao: string }
  | { tipo: "existe"; dispositivo: TipoDeDispositivo; minimo: number; descricao: string };

export type ResultadoDoObjetivo = {
  titulo: string;
  subtitulo: string;
  descricao: string;
  cumprido: boolean;
  detalhe?: string;
};

export type NivelDoLaboratorio = "Iniciante" | "Intermediário";

export type Laboratorio = {
  slug: string;
  tipo: "aula" | "desafio";
  titulo: string;
  resumo: string;
  nivel: NivelDoLaboratorio;
  minutos: number;
  conceitos: string[];
  moduloDaTrilha: string;
  teoria: Bloco[];
  redeInicial: Rede;
  paleta: TipoDeDispositivo[];
  objetivos: Objetivo[];
  dica?: string;
  solucao?: string[];
};
