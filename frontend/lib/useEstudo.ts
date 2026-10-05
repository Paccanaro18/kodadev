"use client";

import { useCallback, useEffect, useState } from "react";
import {
  CHAVE_DO_ESTUDO, ESTADO_VAZIO, gravarEstado, lerEstado, marcarDesafio, marcarLicao, progressoDa, registrarNota,
  type EstadoDeEstudo, type ProgressoDaTrilha,
} from "@/lib/progressoDeEstudo";

function armazenamento(): Storage | null {
  try {
    return typeof window === "undefined" ? null : window.localStorage;
  } catch {
    return null;
  }
}

/**
 * O progresso de estudo de uma trilha. Começa vazio e carrega do navegador depois da primeira pintura, para o HTML do
 * servidor e o do navegador serem iguais. Mudanças feitas em outra aba chegam pelo evento "storage".
 */
export function useEstudo(trilha: string) {
  const [estado, setEstado] = useState<EstadoDeEstudo>(ESTADO_VAZIO);
  const [carregado, setCarregado] = useState(false);

  useEffect(() => {
    setEstado(lerEstado(armazenamento()));
    setCarregado(true);

    const aoMudarEmOutraAba = (evento: StorageEvent) => {
      if (evento.key === CHAVE_DO_ESTUDO) setEstado(lerEstado(armazenamento()));
    };
    window.addEventListener("storage", aoMudarEmOutraAba);
    return () => window.removeEventListener("storage", aoMudarEmOutraAba);
  }, []);

  const aplicar = useCallback((mudar: (atual: EstadoDeEstudo) => EstadoDeEstudo) => {
    setEstado((atual) => {
      const novo = mudar(atual);
      gravarEstado(armazenamento(), novo);
      return novo;
    });
  }, []);

  const progresso: ProgressoDaTrilha = progressoDa(estado, trilha);

  return {
    progresso,
    carregado,
    marcarLicao: (modulo: string, lida: boolean) => aplicar((e) => marcarLicao(e, trilha, modulo, lida)),
    marcarDesafio: (modulo: string, concluido: boolean) => aplicar((e) => marcarDesafio(e, trilha, modulo, concluido)),
    registrarNota: (item: string, nota: number) => aplicar((e) => registrarNota(e, trilha, item, nota)),
  };
}
