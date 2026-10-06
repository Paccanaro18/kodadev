"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { buscarResumoDoProgresso, listarDesafiosDeSeguranca, type ResumoDeSeguranca } from "@/lib/api";
import { assinarEstudo, instantaneoDoEstudo, instantaneoInicialDoEstudo, iniciarEstudo } from "@/lib/estudoStore";
import { calcularInsignias, type CatalogoDeInsignias, type Insignia } from "@/lib/insignias";

type Fonte<T> = { carregado: boolean; valor: T | null };

/**
 * As insígnias são calculadas, não guardadas: saem do progresso de estudo (que já é sincronizado com a conta), dos
 * desafios de segurança resolvidos e dos tickets concluídos. Se uma das fontes falhar, as outras continuam valendo.
 */
export function useInsignias(catalogo: CatalogoDeInsignias) {
  const instantaneo = useSyncExternalStore(assinarEstudo, instantaneoDoEstudo, instantaneoInicialDoEstudo);
  const [seguranca, setSeguranca] = useState<Fonte<ResumoDeSeguranca[]>>({ carregado: false, valor: null });
  const [tickets, setTickets] = useState<Fonte<number>>({ carregado: false, valor: null });

  useEffect(() => {
    iniciarEstudo();
    let ativo = true;
    listarDesafiosDeSeguranca()
      .then((valor) => { if (ativo) setSeguranca({ carregado: true, valor }); })
      .catch(() => { if (ativo) setSeguranca({ carregado: true, valor: null }); });
    buscarResumoDoProgresso()
      .then((resumo) => { if (ativo) setTickets({ carregado: true, valor: resumo.concluidos }); })
      .catch(() => { if (ativo) setTickets({ carregado: true, valor: null }); });
    return () => { ativo = false; };
  }, []);

  const insignias: Insignia[] = calcularInsignias({ catalogo, estudo: instantaneo.estado, seguranca: seguranca.valor, ticketsConcluidos: tickets.valor });
  const carregando = !instantaneo.carregado || !seguranca.carregado || !tickets.carregado;
  const incompleto = seguranca.carregado && tickets.carregado && (seguranca.valor === null || tickets.valor === null);

  return { insignias, carregando, incompleto };
}
