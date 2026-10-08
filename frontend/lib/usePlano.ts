"use client";

import { useEffect, useState } from "react";
import { buscarPlano, type SituacaoDoPlano } from "@/lib/api";

export function usePlano() {
  const [situacao, setSituacao] = useState<SituacaoDoPlano | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [falhou, setFalhou] = useState(false);

  useEffect(() => {
    let ativo = true;
    buscarPlano()
      .then((valor) => { if (ativo) { setSituacao(valor); setCarregando(false); } })
      .catch(() => { if (ativo) { setFalhou(true); setCarregando(false); } });
    return () => { ativo = false; };
  }, []);

  return { situacao, carregando, falhou };
}
