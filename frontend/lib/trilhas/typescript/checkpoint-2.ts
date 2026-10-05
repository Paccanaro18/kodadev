import type { Checkpoint } from "../tipos";

export const TS_CHECKPOINT_2: Checkpoint = {
  tipo: "checkpoint",
  slug: "checkpoint-classes-apis-e-testes",
  titulo: "Checkpoint: classes, API, validação e testes",
  resumo: "Nove questões sobre classes e módulos, Express, Zod e testes com Vitest e Supertest.",
  cobre: [
    "classes-modulos-e-projeto",
    "api-com-express",
    "validacao-com-zod",
    "testes-com-vitest-e-supertest",
  ],
  notaMinima: 0.7,
  questoes: [
    {
      enunciado: "O que faz o modificador private em uma propriedade de classe TypeScript?",
      opcoes: ["Torna o campo inacessível em tempo de execução, sempre", "Impede a leitura dentro da própria classe", "Faz o compilador recusar acessos de fora, mas é apagado no JavaScript gerado", "Criptografa o valor"],
      correta: 2,
      explicacao: "O private é uma checagem de compilação. Para privacidade real em execução, usa-se a sintaxe nativa #campo.",
    },
    {
      enunciado: "Qual a vantagem de o serviço receber um repositório (interface) pelo construtor?",
      opcoes: ["O código roda mais rápido", "Dá para trocar a implementação, como uma versão em memória nos testes, sem alterar o serviço", "O TypeScript exige", "Impede o uso do repositório em outro lugar"],
      correta: 1,
      explicacao: "Dependendo do contrato e recebendo a implementação de fora, o serviço fica desacoplado e fácil de testar.",
    },
    {
      enunciado: "Em um middleware do Express, o que acontece se ele não responder e também não chamar next()?",
      opcoes: ["A requisição fica pendurada até o cliente desistir", "O Express chama o próximo automaticamente", "O servidor responde 404", "O servidor reinicia"],
      correta: 0,
      explicacao: "O Express não avança sozinho: cada middleware deve responder ou chamar next().",
    },
    {
      enunciado: "O que diferencia o middleware de tratamento de erros dos demais no Express?",
      opcoes: ["Ele é registrado primeiro", "Ele tem quatro parâmetros (err, req, res, next) e vem depois das rotas", "Só trata o erro 404", "Não pode usar res"],
      correta: 1,
      explicacao: "O Express identifica o middleware de erros pelos quatro parâmetros, e ele precisa vir depois das rotas para receber os erros delas.",
    },
    {
      enunciado: "Por que os tipos do TypeScript não bastam para garantir o formato do corpo de uma requisição?",
      opcoes: ["Porque o Node não aceita tipos", "Porque os tipos são apagados na compilação, e nada checa os dados que chegam de fora em execução", "Porque JSON não tem tipos", "Porque o Express remove os tipos"],
      correta: 1,
      explicacao: "Em execução, os dados chegam sem garantia. É preciso validar na borda, por exemplo com um esquema Zod.",
    },
    {
      enunciado: "Para que serve z.infer<typeof Esquema>?",
      opcoes: ["Executar a validação", "Converter o esquema em JSON", "Lançar erros", "Derivar o tipo TypeScript do esquema, mantendo uma única fonte de verdade"],
      correta: 3,
      explicacao: "O z.infer evita manter uma interface e um validador separados, que acabam saindo de sincronia.",
    },
    {
      enunciado: "Qual a melhor forma de lidar com a variável de ambiente LOG_JSON=false usando Zod?",
      opcoes: ["z.coerce.boolean()", "z.number()", "z.stringbool()", "if (process.env.LOG_JSON)"],
      correta: 2,
      explicacao: "A coerção para booleano trata qualquer texto não vazio, inclusive \"false\", como verdadeiro. O stringbool interpreta as palavras corretamente.",
    },
    {
      enunciado: "Por que o código separa criarApp() de listen()?",
      opcoes: ["O Express exige", "Para os testes importarem o app e usarem o Supertest sem abrir porta de rede", "Para iniciar mais rápido", "Para proteger o código"],
      correta: 1,
      explicacao: "Quando o app é criado por uma função sem iniciar o servidor, os testes disparam requisições direto nele, sem conflito de portas.",
    },
    {
      enunciado: "Qual abordagem torna um teste menos frágil a refatorações?",
      opcoes: ["Verificar quantas vezes cada função interna foi chamada", "Verificar o resultado observável (resposta, estado final) e preferir fakes a muitos mocks", "Copiar a implementação para o teste", "Usar entradas aleatórias"],
      correta: 1,
      explicacao: "Testes que repetem a implementação quebram a cada mudança interna, mesmo correta. Verificar comportamento observável os mantém úteis.",
    },
  ],
};
