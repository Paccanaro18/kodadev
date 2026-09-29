export type Status = "Concluído" | "Em andamento" | "Não iniciado";

export const connectedRepos = [
  { name: "api-pagamentos", stack: "Spring Boot", desc: "API de pagamentos e escopos", challenges: 8, progress: 38 },
  { name: "loja-react", stack: "React · TS", desc: "E-commerce em React", challenges: 5, progress: 60 },
  { name: "agenda-mobile", stack: "Kotlin", desc: "App de agenda", challenges: 3, progress: 0 },
];

export const githubRepos = [
  { name: "api-pagamentos", desc: "API de pagamentos e escopos", lang: "Java", updated: "há 2 dias" },
  { name: "loja-react", desc: "E-commerce em React", lang: "TypeScript", updated: "há 1 semana" },
  { name: "agenda-mobile", desc: "App de agenda", lang: "Kotlin", updated: "há 3 semanas" },
  { name: "blog-next", desc: "Blog com Next.js", lang: "TypeScript", updated: "há 1 mês" },
  { name: "scripts-dados", desc: "Automação de dados", lang: "Python", updated: "há 2 meses" },
];

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

export const project = {
  name: "api-pagamentos",
  stack: ["Java 17", "Spring Boot 3", "JPA / Hibernate", "PostgreSQL", "Maven", "JUnit 5"],
  architecture: "API REST em camadas: controller → service → repository, com DTOs e entidades JPA separadas.",
  domains: ["Escopos", "Pagamentos", "Clientes", "Contratos"],
  endpoints: [
    { method: "GET", path: "/escopos/{id}/pagamentos" },
    { method: "POST", path: "/escopos/{id}/pagamentos" },
    { method: "PUT", path: "/pagamentos/{id}" },
    { method: "GET", path: "/clientes" },
  ],
  tickets: [
    { id: "DEV-034", title: "Adicionar filtro de pagamentos por status do escopo", type: "Feature", status: "Em andamento" as Status },
    { id: "DEV-033", title: "Corrigir cálculo de juros em pagamentos atrasados", type: "Bug", status: "Não iniciado" as Status },
    { id: "DEV-031", title: "Testes do serviço de contratos", type: "Testing", status: "Concluído" as Status },
    { id: "DEV-029", title: "Paginação na lista de clientes", type: "Feature", status: "Concluído" as Status },
  ],
};

export const challengeTypes = [
  { name: "Feature", desc: "Nova funcionalidade no seu código" },
  { name: "Bug", desc: "Encontre e corrija um problema" },
  { name: "Testing", desc: "Escreva testes para o que existe" },
  { name: "Aleatório", desc: "A Koda escolhe por você" },
];

export const ticket = {
  id: "DEV-034",
  title: "Adicionar filtro de pagamentos por status do escopo",
  area: "Backend",
  level: "Júnior",
  status: "Em andamento" as Status,
  text: [
    { title: "Contexto", body: "O módulo de pagamentos concentra as cobranças de cada escopo contratado. O time financeiro precisa acompanhar rapidamente quais pagamentos estão pendentes, pagos ou atrasados dentro de um escopo." },
    { title: "Cenário atual", body: "O endpoint GET /escopos/{id}/pagamentos retorna todos os pagamentos do escopo, sem filtro. Para encontrar os pendentes, o front-end baixa a lista inteira e filtra no navegador." },
    { title: "Objetivo", body: "Permitir filtrar os pagamentos de um escopo por status diretamente no endpoint, usando o parâmetro opcional status." },
  ],
  lists: [
    { title: "Regras de negócio", mark: "dot", items: ["Os status válidos são PENDENTE, PAGO e ATRASADO.", "Sem o parâmetro status, o endpoint continua retornando todos os pagamentos.", "Um pagamento PENDENTE com vencimento anterior a hoje deve ser tratado como ATRASADO.", "O filtro só considera pagamentos do escopo informado no caminho."] },
    { title: "Requisitos técnicos", mark: "dot", items: ["Adicionar o parâmetro opcional status ao PagamentoController.", "Criar o método findByEscopoIdAndStatus em PagamentoRepository.", "Aplicar a regra de atraso em PagamentoService, sem duplicar lógica.", "Retornar PagamentoResponseDTO, mantendo o formato atual da resposta."] },
    { title: "Critérios de aceite", mark: "check", items: ["GET /escopos/1/pagamentos?status=PAGO retorna somente pagamentos pagos.", "GET /escopos/1/pagamentos?status=ATRASADO inclui pendentes já vencidos.", "Um status inválido retorna 400 com mensagem clara.", "Chamadas sem status mantêm o comportamento atual."] },
    { title: "Testes esperados", mark: "check", items: ["Teste de service para cada status válido.", "Teste de service para pendente vencido virando ATRASADO.", "Teste de controller para status inválido (400)."] },
    { title: "Restrições", mark: "alert", items: ["Não alterar o contrato dos demais endpoints de pagamentos.", "Não criar novas tabelas nem migrações.", "Não adicionar dependências ao pom.xml.", "Seguir o padrão de camadas e nomes já usado no projeto."] },
  ],
  hint: "Comece pelo repository: crie a consulta por escopo e status. Depois trate o atraso no service, comparando o vencimento com a data de hoje.",
};
