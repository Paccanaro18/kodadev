"use client";
import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { ipValido, mascaraValida } from "@/lib/redes/ip";
import { ehHost, type Dispositivo, type Interface, type Rede, type Rota } from "@/lib/redes/tipos";

const campo = "h-9 w-full rounded-xl border border-line-2 bg-cream px-3 font-mono text-[13px] text-ink outline-none transition duration-200 focus:border-koda";
const rotulo = "grid gap-1 text-xs font-semibold text-ink-2";

function CampoDeTexto({ nome, valor, aoMudar, valido = true, placeholder }: {
  nome: string; valor: string; aoMudar: (novo: string) => void; valido?: boolean; placeholder?: string;
}) {
  return (
    <label className={rotulo}>
      {nome}
      <input value={valor} onChange={(e) => aoMudar(e.target.value)} placeholder={placeholder} spellCheck={false} autoComplete="off" maxLength={40}
        aria-invalid={!valido} className={`${campo} ${valido ? "" : "!border-bad"}`} />
    </label>
  );
}

function valorOuVazio(valor: string, validar: (v: string) => boolean): boolean {
  return valor === "" || validar(valor);
}

function CamposDeEndereco({ interfaceDoDispositivo, aoMudar, prefixo = "" }: {
  interfaceDoDispositivo: Interface; aoMudar: (mudanca: Partial<Interface>) => void; prefixo?: string;
}) {
  return (
    <div className="grid grid-cols-2 gap-2">
      <CampoDeTexto nome={`${prefixo}Endereço IP`} valor={interfaceDoDispositivo.ip} placeholder="192.168.0.10"
        valido={valorOuVazio(interfaceDoDispositivo.ip, ipValido)} aoMudar={(ip) => aoMudar({ ip })} />
      <CampoDeTexto nome={`${prefixo}Máscara`} valor={interfaceDoDispositivo.mascara} placeholder="255.255.255.0"
        valido={valorOuVazio(interfaceDoDispositivo.mascara, mascaraValida)} aoMudar={(mascara) => aoMudar({ mascara })} />
    </div>
  );
}

function Rotas({ rotas, aoMudar }: { rotas: Rota[]; aoMudar: (rotas: Rota[]) => void }) {
  function mudar(indice: number, mudanca: Partial<Rota>) {
    aoMudar(rotas.map((r, i) => (i === indice ? { ...r, ...mudanca } : r)));
  }
  return (
    <div className="grid gap-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold tracking-wide text-ink-2 uppercase">Rotas estáticas</span>
        <button type="button" onClick={() => aoMudar([...rotas, { rede: "", mascara: "", proximoSalto: "" }])}
          className="inline-flex h-8 items-center gap-1 rounded-lg bg-koda-soft px-2.5 text-xs font-bold text-koda-texto transition duration-200 hover:-translate-y-0.5 active:scale-95">
          <Plus className="size-3.5" aria-hidden="true" />Adicionar rota
        </button>
      </div>
      {rotas.length === 0 && <p className="text-xs text-ink-2">Nenhuma rota. O roteador só conhece as redes ligadas a ele.</p>}
      {rotas.map((rota, indice) => (
        <div key={indice} className="grid gap-2 rounded-xl bg-tint p-2.5">
          <div className="grid grid-cols-2 gap-2">
            <CampoDeTexto nome="Rede de destino" valor={rota.rede} placeholder="10.3.0.0" valido={valorOuVazio(rota.rede, ipValido)} aoMudar={(v) => mudar(indice, { rede: v })} />
            <CampoDeTexto nome="Máscara" valor={rota.mascara} placeholder="255.255.255.0" valido={valorOuVazio(rota.mascara, mascaraValida)} aoMudar={(v) => mudar(indice, { mascara: v })} />
          </div>
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <CampoDeTexto nome="Próximo salto" valor={rota.proximoSalto} placeholder="10.2.0.2" valido={valorOuVazio(rota.proximoSalto, ipValido)} aoMudar={(v) => mudar(indice, { proximoSalto: v })} />
            </div>
            <button type="button" onClick={() => aoMudar(rotas.filter((_, i) => i !== indice))} aria-label={`Remover a rota ${indice + 1}`}
              className="grid size-9 place-items-center rounded-xl text-bad transition duration-200 hover:bg-bad-soft active:scale-95">
              <Trash2 className="size-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function VlanDaPorta({ porta, aoMudar }: { porta: Interface; aoMudar: (vlan: number) => void }) {
  const [texto, setTexto] = useState(String(porta.vlan));
  return (
    <label className="flex items-center justify-between gap-3 text-sm">
      <span className="font-mono text-[13px] text-ink">{porta.nome}</span>
      <span className="flex items-center gap-2 text-xs text-ink-2">
        VLAN
        <input type="number" min={1} max={4094} value={texto}
          onChange={(e) => {
            setTexto(e.target.value);
            const valor = Number(e.target.value);
            if (Number.isInteger(valor) && valor >= 1 && valor <= 4094) aoMudar(valor);
          }}
          onBlur={() => setTexto(String(porta.vlan))}
          aria-label={`VLAN da porta ${porta.nome}`}
          className="h-8 w-20 rounded-lg border border-line-2 bg-cream px-2 font-mono text-[13px] text-ink outline-none focus:border-koda" />
      </span>
    </label>
  );
}

export type PropriedadesDoPainel = {
  dispositivo: Dispositivo;
  rede: Rede;
  aoMudarNome: (nome: string) => void;
  aoMudarGateway: (gateway: string) => void;
  aoMudarInterface: (nome: string, mudanca: Partial<Interface>) => void;
  aoMudarRotas: (rotas: Rota[]) => void;
  aoRemover: () => void;
};

function vizinhoDa(rede: Rede, dispositivo: Dispositivo, porta: string): string | null {
  for (const cabo of rede.cabos) {
    const aqui = cabo.a.dispositivo === dispositivo.id && cabo.a.interface === porta ? cabo.b
      : cabo.b.dispositivo === dispositivo.id && cabo.b.interface === porta ? cabo.a : null;
    if (aqui) {
      const outro = rede.dispositivos.find((d) => d.id === aqui.dispositivo);
      return outro ? `${outro.nome} (${aqui.interface})` : null;
    }
  }
  return null;
}

export default function PainelDoDispositivo({
  dispositivo, rede, aoMudarNome, aoMudarGateway, aoMudarInterface, aoMudarRotas, aoRemover,
}: PropriedadesDoPainel) {
  const host = ehHost(dispositivo.tipo);
  return (
    <div className="grid gap-4">
      <label className={rotulo}>
        Nome
        <input value={dispositivo.nome} onChange={(e) => aoMudarNome(e.target.value)} maxLength={24} className={campo} />
      </label>

      {host && (
        <>
          <CamposDeEndereco interfaceDoDispositivo={dispositivo.interfaces[0]} aoMudar={(mudanca) => aoMudarInterface(dispositivo.interfaces[0].nome, mudanca)} />
          <CampoDeTexto nome="Gateway padrão" valor={dispositivo.gateway} placeholder="192.168.0.1" valido={valorOuVazio(dispositivo.gateway, ipValido)} aoMudar={aoMudarGateway} />
        </>
      )}

      {dispositivo.tipo === "roteador" && (
        <>
          {dispositivo.interfaces.map((porta) => (
            <fieldset key={porta.nome} className="grid gap-2 rounded-xl border border-line p-3">
              <legend className="px-1 font-mono text-[13px] font-bold text-ink">{porta.nome}</legend>
              <CamposDeEndereco interfaceDoDispositivo={porta} aoMudar={(mudanca) => aoMudarInterface(porta.nome, mudanca)} />
            </fieldset>
          ))}
          <Rotas rotas={dispositivo.rotas} aoMudar={aoMudarRotas} />
        </>
      )}

      {dispositivo.tipo === "switch" && (
        <div className="grid gap-2.5">
          <span className="text-xs font-bold tracking-wide text-ink-2 uppercase">Portas de acesso</span>
          {dispositivo.interfaces.map((porta) => <VlanDaPorta key={porta.nome} porta={porta} aoMudar={(vlan) => aoMudarInterface(porta.nome, { vlan })} />)}
        </div>
      )}

      <div>
        <span className="text-xs font-bold tracking-wide text-ink-2 uppercase">Cabos</span>
        <ul className="mt-2 grid gap-1 text-[13px]">
          {dispositivo.interfaces.map((porta) => {
            const vizinho = vizinhoDa(rede, dispositivo, porta.nome);
            return (
              <li key={porta.nome} className="flex justify-between gap-2">
                <span className="font-mono text-ink">{porta.nome}</span>
                <span className={vizinho ? "text-ink-2" : "text-ink-3"}>{vizinho ?? "livre"}</span>
              </li>
            );
          })}
        </ul>
      </div>

      <button type="button" onClick={aoRemover}
        className="inline-flex h-9 items-center justify-center gap-2 rounded-xl border-[1.5px] border-bad px-4 text-sm font-bold text-bad transition duration-200 hover:bg-bad-soft active:scale-95">
        <Trash2 className="size-4" aria-hidden="true" />Remover dispositivo
      </button>
    </div>
  );
}
