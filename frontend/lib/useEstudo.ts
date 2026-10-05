"use client";

import { useEffect, useSyncExternalStore } from "react";
import {
  assinarEstudo, instantaneoDoEstudo, instantaneoInicialDoEstudo, iniciarEstudo, mudarEstudo,
} from "@/lib/estudoStore";
import { marcarDesafio, marcarLicao, progressoDa, registrarNota, type ProgressoDaTrilha } from "@/lib/progressoDeEstudo";

/**
 * O progresso de estudo de uma trilha. Todos os componentes da página compartilham o mesmo estado. Começa vazio e
 * carrega do navegador depois da primeira pintura (o HTML do servidor e o do navegador ficam iguais); quem está logado
 * tem o progresso juntado ao do perfil, e cada mudança é guardada na conta.
 */
export function useEstudo(trilha: string) {
  const instantaneo = useSyncExternalStore(assinarEstudo, instantaneoDoEstudo, instantaneoInicialDoEstudo);

  useEffect(() => {
    iniciarEstudo();
  }, []);

  const progresso: ProgressoDaTrilha = progressoDa(instantaneo.estado, trilha);

  return {
    progresso,
    carregado: instantaneo.carregado,
    naConta: instantaneo.origem === "conta",
    falhaAoSalvar: instantaneo.falhaAoSalvar,
    marcarLicao: (modulo: string, lida: boolean) =>
      mudarEstudo((e) => marcarLicao(e, trilha, modulo, lida), trilha, modulo, { licaoLida: lida }),
    marcarDesafio: (modulo: string, concluido: boolean) =>
      mudarEstudo((e) => marcarDesafio(e, trilha, modulo, concluido), trilha, modulo, { desafioDeclarado: concluido }),
    registrarNota: (item: string, nota: number) =>
      mudarEstudo((e) => registrarNota(e, trilha, item, nota), trilha, item, { nota }),
  };
}
