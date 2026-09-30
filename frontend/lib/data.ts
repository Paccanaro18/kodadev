export type Status = "Concluído" | "Em andamento" | "Não iniciado";

export const analysisSteps = [
  "Lendo estrutura de pastas",
  "Identificando a stack",
  "Mapeando arquitetura e camadas",
  "Encontrando domínios e endpoints",
  "Preparando o resumo do projeto",
];

export const generationSteps = [
  "Lendo o contexto do projeto",
  "Escolhendo um ponto do código",
  "Escrevendo o ticket",
  "Definindo critérios de aceite",
];
