import { ligados } from "../construcao";
import { analisarIp, pertenceARede, prefixoDaMascara } from "../ip";
import { Simulador } from "../simulador";
import type { Rede } from "../tipos";
import type { Objetivo, ResultadoDoObjetivo } from "./tipos";

function ipDoDispositivo(simulador: Simulador, referencia: string): string | null {
  if (analisarIp(referencia) !== null) return referencia;
  const dispositivo = simulador.dispositivo(referencia);
  return dispositivo?.interfaces.find((i) => i.ip)?.ip ?? null;
}

function tituloDe(objetivo: Objetivo, nome: (referencia: string) => string): { titulo: string; subtitulo: string } {
  switch (objetivo.tipo) {
    case "cabo":
      return { titulo: `${nome(objetivo.entre[0])} ↔ ${nome(objetivo.entre[1])}`, subtitulo: "Conectar com um cabo" };
    case "ip": {
      const prefixo = prefixoDaMascara(objetivo.naRede.mascara);
      return { titulo: `Endereço do ${nome(objetivo.dispositivo)}`, subtitulo: `Rede ${objetivo.naRede.rede}/${prefixo}` };
    }
    case "ping":
      return {
        titulo: `${nome(objetivo.de)} → ${nome(objetivo.para)}`,
        subtitulo: objetivo.esperado === false ? "Confirmar que o ping não passa" : "Confirmar comunicação com ping",
      };
    case "dhcp":
      return { titulo: `${nome(objetivo.dispositivo)} com DHCP`, subtitulo: "Receber um endereço do servidor DHCP" };
    case "dns":
      return { titulo: `${nome(objetivo.de)} resolve ${objetivo.nome}`, subtitulo: "Confirmar a resolução do nome" };
    case "mac-aprendido":
      return { titulo: `Tabela MAC do ${nome(objetivo.comutador)}`, subtitulo: `Aprender ao menos ${objetivo.minimo} endereços` };
    case "existe":
      return { titulo: `Dispositivos na rede`, subtitulo: objetivo.descricao };
  }
}

function avaliarUm(rede: Rede, simulador: Simulador, objetivo: Objetivo): ResultadoDoObjetivo {
  const nome = (referencia: string) => rede.dispositivos.find((d) => d.id === referencia)?.nome ?? referencia;
  const base = { descricao: objetivo.descricao, ...tituloDe(objetivo, nome) };
  switch (objetivo.tipo) {
    case "cabo": {
      const [a, b] = objetivo.entre;
      return { ...base, cumprido: ligados(rede, a, b) };
    }
    case "ip": {
      const dispositivo = simulador.dispositivo(objetivo.dispositivo);
      if (!dispositivo) return { ...base, cumprido: false, detalhe: "O dispositivo não está na rede." };
      const configurada = dispositivo.interfaces.find((i) => i.ip);
      if (!configurada) return { ...base, cumprido: false, detalhe: "Ainda sem endereço IP." };
      if (prefixoDaMascara(configurada.mascara) !== prefixoDaMascara(objetivo.naRede.mascara)) {
        return { ...base, cumprido: false, detalhe: `A máscara deveria ser ${objetivo.naRede.mascara}.` };
      }
      const dentro = pertenceARede(configurada.ip, objetivo.naRede.rede, objetivo.naRede.mascara);
      return { ...base, cumprido: dentro, detalhe: dentro ? undefined : `O endereço deveria estar na rede ${objetivo.naRede.rede}.` };
    }
    case "ping": {
      const origem = simulador.dispositivo(objetivo.de);
      if (!origem) return { ...base, cumprido: false, detalhe: "O dispositivo de origem não está na rede." };
      let destino = ipDoDispositivo(simulador, objetivo.para);
      if (!destino && objetivo.para.includes(".")) {
        const resolucao = simulador.resolverNome(origem.id, objetivo.para);
        if (!resolucao.sucesso) return { ...base, cumprido: objetivo.esperado === false, detalhe: resolucao.motivo };
        destino = resolucao.ip;
      }
      if (!destino) return { ...base, cumprido: false, detalhe: "O destino ainda não tem endereço IP." };
      const esperado = objetivo.esperado ?? true;
      const resultado = simulador.ping(origem.id, destino);
      if (resultado.sucesso === esperado) return { ...base, cumprido: true };
      return { ...base, cumprido: false, detalhe: esperado ? resultado.motivo : "Ainda existe comunicação entre eles." };
    }
    case "dhcp": {
      const dispositivo = simulador.dispositivo(objetivo.dispositivo);
      if (!dispositivo) return { ...base, cumprido: false, detalhe: "O dispositivo não está na rede." };
      if (!dispositivo.usaDhcp) return { ...base, cumprido: false, detalhe: "Ative o DHCP na configuração do dispositivo." };
      const resultado = simulador.resultadoDoDhcp(dispositivo.id);
      const configuracao = simulador.configuracaoDe(dispositivo.id);
      return { ...base, cumprido: configuracao.origem === "dhcp", detalhe: configuracao.origem === "dhcp" ? undefined : resultado?.motivo };
    }
    case "dns": {
      const origem = simulador.dispositivo(objetivo.de);
      if (!origem) return { ...base, cumprido: false, detalhe: "O dispositivo de origem não está na rede." };
      const resolucao = simulador.resolverNome(origem.id, objetivo.nome);
      if (!resolucao.sucesso) return { ...base, cumprido: false, detalhe: resolucao.motivo };
      return { ...base, cumprido: resolucao.ip === objetivo.resposta, detalhe: resolucao.ip === objetivo.resposta ? undefined : `${objetivo.nome} resolveu para ${resolucao.ip}, e deveria ser ${objetivo.resposta}.` };
    }
    case "mac-aprendido": {
      const aprendidos = simulador.tabelaMac(objetivo.comutador).length;
      return { ...base, cumprido: aprendidos >= objetivo.minimo, detalhe: aprendidos >= objetivo.minimo ? undefined : `${aprendidos} de ${objetivo.minimo} endereços aprendidos.` };
    }
    case "existe": {
      const quantos = rede.dispositivos.filter((d) => d.tipo === objetivo.dispositivo).length;
      return { ...base, cumprido: quantos >= objetivo.minimo };
    }
  }
}

export function avaliarObjetivos(rede: Rede, objetivos: Objetivo[]): ResultadoDoObjetivo[] {
  const simulador = new Simulador(rede);
  return objetivos.map((objetivo) => avaliarUm(rede, simulador, objetivo));
}

export function tudoCumprido(resultados: ResultadoDoObjetivo[]): boolean {
  return resultados.length > 0 && resultados.every((r) => r.cumprido);
}
