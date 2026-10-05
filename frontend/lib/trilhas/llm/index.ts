import type { Trilha } from "../tipos";
import { LLM_CHECKPOINT_1 } from "./checkpoint-1";
import { LLM_MODULO_1 } from "./modulo-1-como-llms-funcionam";
import { LLM_MODULO_2 } from "./modulo-2-api-e-ferramentas";
import { LLM_MODULO_3 } from "./modulo-3-mcp";

export const TRILHA_LLM: Trilha = {
  slug: "llm-mcp-mvp",
  grupo: "ia",
  titulo: "LLMs, MCP e o seu primeiro MVP com IA",
  descricao: "Como os modelos de linguagem funcionam, como usá-los por API com ferramentas, o protocolo MCP e como transformar isso em um produto mínimo viável.",
  publico: "Para quem programa e quer construir produtos com IA. Os exemplos usam Python e rodam sem chave de API, para você aprender sem gastar.",
  etapas: [
    {
      titulo: "Fundamentos e integração",
      descricao: "Do funcionamento dos modelos até agentes com ferramentas e servidores MCP, sempre com segurança em mente.",
      itens: [LLM_MODULO_1, LLM_MODULO_2, LLM_MODULO_3, LLM_CHECKPOINT_1],
    },
  ],
  planejados: [
    { titulo: "RAG: dar ao modelo os seus próprios dados", resumo: "Embeddings, busca semântica, divisão de documentos e respostas com fontes." },
    { titulo: "Avaliando sistemas com LLM", resumo: "Conjuntos de teste, métricas, avaliação com modelos e regressões de prompt." },
    { titulo: "Segurança e privacidade em produtos com IA", resumo: "Injeção de prompt, dados pessoais, LGPD e auditoria." },
    { titulo: "Do problema ao MVP: escopo, hipóteses e métricas", resumo: "Escolher o menor produto que valide a ideia, sem construir demais." },
    { titulo: "Construindo o MVP: arquitetura, custos e limites", resumo: "Um desenho simples, controle de gastos e plano para falhas." },
    { titulo: "Lançando, medindo e iterando", resumo: "Feedback real, telemetria, custo por usuário e próximos passos." },
  ],
};
