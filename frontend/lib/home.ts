export const home = {
  featuredTags: ["Java", "Spring Boot", "PostgreSQL", "+2"],
  repos: [
    { name: "fintech-core", path: "seu-org/fintech-core", main: true, desc: "Sistema principal da fintech com módulos de contas, transações e usuários.", tags: ["Java", "Spring Boot", "PostgreSQL"], when: "Analisado há 2 horas" },
    { name: "payment-api", path: "seu-org/payment-api", main: false, desc: "API responsável pelo processamento de pagamentos e notificações.", tags: ["Java", "Spring Boot", "Docker"], when: "Analisado há 1 dia" },
    { name: "rabbitmq-lab", path: "seu-org/rabbitmq-lab", main: false, desc: "Estudos e implementações com mensageria e processamento assíncrono.", tags: ["Java", "RabbitMQ", "Docker"], when: "Analisado há 3 dias" },
  ],
  activities: [
    { t: 'Concluiu o desafio "Autenticação com JWT"', w: "há 2 horas", done: true },
    { t: "Fez um commit em api-pagamentos", w: "há 5 horas", done: false },
    { t: "Iniciou o desafio DEV-034", w: "há 1 dia", done: false },
    { t: "Conectou o repositório loja-react", w: "há 2 dias", done: false },
  ],
  next: [
    { t: "Adicionar filtro de pagamentos por status", tag: "Backend" },
    { t: "Configurar filas com RabbitMQ", tag: "Backend" },
    { t: "Testes do serviço de contratos", tag: "Testing" },
  ],
  skills: [{ n: "REST (APIs)", v: 85 }, { n: "JPA / Hibernate", v: 70 }, { n: "Testing", v: 60 }, { n: "Docker", v: 45 }, { n: "RabbitMQ", v: 30 }],
};
