import type { Modulo } from "../tipos";

export const TS_MODULO_5: Modulo = {
  tipo: "modulo",
  slug: "validacao-com-zod",
  titulo: "Validação de dados com Zod",
  resumo: "Garantir em tempo de execução o que os tipos prometem: esquemas, inferência de tipos, erros úteis, validação de requisições e de variáveis de ambiente.",
  nivel: "Júnior",
  leitura: "45 min",
  objetivos: [
    "Explicar por que os tipos do TypeScript não validam dados que chegam de fora.",
    "Escrever esquemas Zod para objetos, enums, números, textos e valores opcionais ou com padrão.",
    "Derivar o tipo TypeScript do esquema, mantendo uma única fonte de verdade.",
    "Validar corpo e query de uma API Express e devolver erros de validação claros.",
    "Validar a configuração do programa (variáveis de ambiente) na inicialização.",
  ],
  preRequisitos: [
    "Ter feito o módulo \"Uma API com Express\".",
    "Conhecer os tipos básicos e as uniões do TypeScript.",
  ],
  pontosChave: [
    "Os tipos do TypeScript desaparecem na compilação: nada garante, em execução, o formato do que chega por rede, arquivo ou ambiente.",
    "Valide na fronteira do sistema e, depois disso, trabalhe com dados já tipados e confiáveis.",
    "Com z.infer, o esquema vira a fonte única de verdade: o tipo é derivado dele, e não escrito duas vezes.",
    "safeParse devolve sucesso ou erro como valor; parse lança uma exceção.",
    "Dados de query e de ambiente chegam como texto: converta com coerção explícita.",
  ],
  blocos: [
    { tipo: "p", texto: "No módulo anterior, uma rota recebia req.body e o tratava como se tivesse o formato certo. O TypeScript aceitou, porque req.body é tipado como any. Mas o que acontece se o cliente enviar um número no lugar do título, ou um objeto sem o campo obrigatório, ou um texto de dez megabytes? O programa quebra mais adiante, longe da causa, ou, pior, aceita o dado errado e o grava no banco. Este módulo resolve isso com uma biblioteca que valida os dados em tempo de execução: o Zod." },

    { tipo: "h", texto: "O problema: tipos não existem em execução" },
    { tipo: "p", texto: "Os tipos do TypeScript são uma ferramenta de compilação. Depois de compilado, o programa é JavaScript puro, sem nenhuma informação de tipo. Quando você escreve const u: Usuario = JSON.parse(texto), está apenas dizendo ao compilador \"confie em mim\": se o texto não tiver o formato de Usuario, nada reclama, e o erro aparece quando um campo faltante for usado. Em toda fronteira do sistema (requisições HTTP, arquivos, filas, variáveis de ambiente, respostas de APIs externas), os dados chegam como unknown, e a garantia de formato precisa ser construída, e não presumida." },
    { tipo: "p", texto: "A solução é desenhar a fronteira em dois passos. Primeiro, um esquema descreve o formato esperado e verifica o dado. Segundo, dali em diante, o resto do código recebe um valor já validado e com o tipo correto. O Zod faz as duas coisas com a mesma declaração: o esquema valida em execução e, ao mesmo tempo, gera o tipo para o compilador." },
    { tipo: "alerta", titulo: "Sobre a versão", texto: "Os exemplos usam o Zod 4 (testado com a versão 4.6). Instale com npm install zod. Algumas formas da versão 3 mudaram: por exemplo, z.string().email() deu lugar a z.email(), e os métodos de formatação de erros passaram a ser funções, como z.flattenError. Em projetos existentes, confira a versão instalada." },

    { tipo: "h", texto: "Esquemas: descrevendo o formato" },
    { tipo: "p", texto: "Um esquema é construído combinando peças: z.string(), z.number(), z.boolean(), z.enum([...]), z.array(...), z.object({...}). Cada peça aceita refinamentos encadeados (min, max, trim, int) e mensagens de erro personalizadas. Para campos que podem faltar, use optional() (pode ser ausente), nullable() (pode ser null) ou default(valor) (se ausente, assume um padrão)." },
    { tipo: "codigo", linguagem: "typescript", legenda: "validacao.ts (exemplo completo)", texto: `import { z } from "zod";

const NovoUsuario = z.object({
  nome: z.string().trim().min(2, "nome muito curto"),
  email: z.email("e-mail inválido"),
  idade: z.number().int().min(18, "só maiores de 18").optional(),
  papel: z.enum(["aluno", "mentor"]).default("aluno"),
});

type NovoUsuario = z.infer<typeof NovoUsuario>;

const entradas: unknown[] = [
  { nome: "  Ana ", email: "ana@exemplo.com", idade: 30 },
  { nome: "A", email: "nao-e-email", idade: 12 },
  { nome: "Bia", email: "bia@exemplo.com", papel: "admin" },
  "texto solto",
];

for (const entrada of entradas) {
  const resultado = NovoUsuario.safeParse(entrada);
  if (resultado.success) {
    const usuario: NovoUsuario = resultado.data;
    console.log("ok:", usuario);
  } else {
    console.log("inválido:", resultado.error.issues.map((i) => \`\${i.path.join(".") || "(raiz)"}: \${i.message}\`));
  }
}

const Consulta = z.object({
  pagina: z.coerce.number().int().min(1).default(1),
  limite: z.coerce.number().int().min(1).max(100).default(20),
});
console.log(Consulta.parse({}), Consulta.parse({ pagina: "3", limite: "50" }));
console.log(Consulta.safeParse({ pagina: "abc" }).success);

const Resposta = z.object({ id: z.number(), titulo: z.string() }).strict();
console.log(Resposta.safeParse({ id: 1, titulo: "x", extra: true }).success);
console.log(z.flattenError(NovoUsuario.safeParse({ nome: "A", email: "x" }).error!));` },
    { tipo: "codigo", linguagem: "text", legenda: "Saída", texto: `ok: { nome: 'Ana', email: 'ana@exemplo.com', idade: 30, papel: 'aluno' }
inválido: [
  'nome: nome muito curto',
  'email: e-mail inválido',
  'idade: só maiores de 18'
]
inválido: [ 'papel: Invalid option: expected one of "aluno"|"mentor"' ]
inválido: [ '(raiz): Invalid input: expected object, received string' ]
{ pagina: 1, limite: 20 } { pagina: 3, limite: 50 }
false
false
{
  formErrors: [],
  fieldErrors: { nome: [ 'nome muito curto' ], email: [ 'e-mail inválido' ] }
}` },
    { tipo: "p", texto: "Veja o que o esquema NovoUsuario fez. Na primeira entrada, aparou os espaços do nome (trim), aceitou o e-mail e preencheu o papel ausente com o padrão \"aluno\": o resultado não é só validado, é normalizado. Na segunda, devolveu os três erros ao mesmo tempo, cada um com o caminho do campo e a mensagem, o que permite mostrar todos os problemas de uma vez ao usuário. Na terceira, o papel \"admin\" não está entre as opções, e na quarta, o dado nem é um objeto." },
    { tipo: "h3", texto: "parse ou safeParse" },
    { tipo: "p", texto: "O método parse devolve o dado validado ou lança uma exceção (ZodError). O safeParse nunca lança: devolve um objeto com success verdadeiro e data, ou success falso e error. Como erros de validação são esperados (afinal, o usuário digita coisas erradas), o safeParse costuma ser a escolha nas fronteiras, e o parse serve quando um dado inválido é realmente um erro de programação, como a configuração no início do programa." },

    { tipo: "h", texto: "Uma fonte única de verdade com z.infer" },
    { tipo: "p", texto: "No exemplo, a linha type NovoUsuario = z.infer<typeof NovoUsuario> deriva o tipo TypeScript do esquema. Isso elimina a duplicação clássica de manter uma interface e um validador separados, que inevitavelmente saem de sincronia. Quando alguém acrescenta um campo ao esquema, o tipo já o conhece, e o compilador aponta todos os lugares que precisam ser atualizados." },
    { tipo: "p", texto: "Duas observações. O tipo inferido representa o dado depois de validado: no esquema acima, papel é obrigatório no tipo de saída, porque o default garante um valor. E, por padrão, o Zod descarta as chaves desconhecidas do objeto, o que protege contra um erro de segurança conhecido como atribuição em massa (mass assignment): se o cliente enviar { \"nome\": \"Ana\", \"admin\": true }, o campo admin não passa para o objeto validado. Se, em vez de descartar, você prefere recusar, use .strict()." },

    { tipo: "h", texto: "Validando as entradas de uma API Express" },
    { tipo: "p", texto: "O lugar natural da validação é a borda da API. Você escreve um middleware genérico que recebe um esquema, valida o corpo da requisição e, se for inválido, responde 400 com os campos problemáticos, sem nunca chamar a rota. Se for válido, substitui o corpo pelo dado validado e normalizado, e deixa a rota seguir. A query string, que chega sempre como texto, usa coerção (z.coerce.number()) para converter, e os limites evitam pedidos absurdos, como uma página com um milhão de itens." },
    { tipo: "codigo", linguagem: "typescript", legenda: "api-validada.ts (exemplo completo)", texto: `import express from "express";
import type { NextFunction, Request, Response } from "express";
import { z } from "zod";

const NovaTarefa = z.object({
  titulo: z.string().trim().min(3, "título muito curto").max(80),
  prioridade: z.enum(["baixa", "media", "alta"]).default("media"),
});

const FiltroDeTarefas = z.object({
  prioridade: z.enum(["baixa", "media", "alta"]).optional(),
  limite: z.coerce.number().int().min(1).max(50).default(10),
});

type Tarefa = z.infer<typeof NovaTarefa> & { id: number };
const tarefas: Tarefa[] = [];

function validarCorpo<T extends z.ZodType>(esquema: T) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const resultado = esquema.safeParse(req.body);
    if (!resultado.success) {
      res.status(400).json({ erro: "dados inválidos", campos: z.flattenError(resultado.error).fieldErrors });
      return;
    }
    req.body = resultado.data;
    next();
  };
}

const app = express();
app.use(express.json());

app.post("/tarefas", validarCorpo(NovaTarefa), (req, res) => {
  const dados = req.body as z.infer<typeof NovaTarefa>;
  const tarefa: Tarefa = { id: tarefas.length + 1, ...dados };
  tarefas.push(tarefa);
  res.status(201).json(tarefa);
});

app.get("/tarefas", (req, res) => {
  const filtro = FiltroDeTarefas.safeParse(req.query);
  if (!filtro.success) {
    res.status(400).json({ erro: "consulta inválida", campos: z.flattenError(filtro.error).fieldErrors });
    return;
  }
  const { prioridade, limite } = filtro.data;
  res.json(tarefas.filter((t) => !prioridade || t.prioridade === prioridade).slice(0, limite));
});

const servidor = app.listen(0, async () => {
  const { port } = servidor.address() as { port: number };
  const base = \`http://127.0.0.1:\${port}/tarefas\`;
  const json = { "Content-Type": "application/json" };
  const enviar = async (corpo: unknown) => {
    const r = await fetch(base, { method: "POST", headers: json, body: JSON.stringify(corpo) });
    console.log(r.status, JSON.stringify(await r.json()));
  };

  await enviar({ titulo: "  Estudar Zod  " });
  await enviar({ titulo: "ab", prioridade: "urgente" });
  await enviar({ titulo: "Escrever testes", prioridade: "alta" });

  for (const consulta of ["?prioridade=alta", "?limite=0", "?limite=abc"]) {
    const r = await fetch(base + consulta);
    console.log(consulta, r.status, JSON.stringify(await r.json()));
  }
  servidor.close();
});` },
    { tipo: "codigo", linguagem: "text", legenda: "Saída", texto: `201 {"id":1,"titulo":"Estudar Zod","prioridade":"media"}
400 {"erro":"dados inválidos","campos":{"titulo":["título muito curto"],"prioridade":["Invalid option: expected one of \\"baixa\\"|\\"media\\"|\\"alta\\""]}}
201 {"id":2,"titulo":"Escrever testes","prioridade":"alta"}
?prioridade=alta 200 [{"id":2,"titulo":"Escrever testes","prioridade":"alta"}]
?limite=0 400 {"erro":"consulta inválida","campos":{"limite":["Too small: expected number to be >=1"]}}
?limite=abc 400 {"erro":"consulta inválida","campos":{"limite":["Invalid input: expected number, received NaN"]}}` },
    { tipo: "p", texto: "Os exemplos foram executados de ponta a ponta. O primeiro pedido, com espaços sobrando no título, foi criado com o título já aparado e a prioridade padrão. O segundo recebeu um 400 listando os dois campos incorretos. A consulta com limite zero ou texto também foi recusada, e uma consulta sem limite usaria o padrão de 10. A API agora tem uma regra clara: nada entra sem passar pelo esquema." },
    { tipo: "dica", titulo: "Mensagens para pessoas, não para o Zod", texto: "As mensagens padrão do Zod estão em inglês e falam em termos técnicos. Para erros que vão ser mostrados a usuários, informe a sua própria mensagem em cada regra (min(3, \"título muito curto\")). Para erros usados só por programas, mantenha o código do campo e a descrição técnica." },

    { tipo: "h", texto: "Validar a configuração na inicialização" },
    { tipo: "p", texto: "Variáveis de ambiente também são entrada externa: chegam como texto, podem faltar ou estar erradas. Um erro comum é descobrir só em produção, horas depois, que a URL do banco estava vazia. A prática recomendada é validar toda a configuração uma única vez, na partida do programa, e parar de imediato com uma mensagem clara se algo estiver errado (o conceito de falhar cedo, ou fail fast). O restante do código lê a configuração já tipada, em vez de acessar process.env em qualquer lugar." },
    { tipo: "codigo", linguagem: "typescript", legenda: "ambiente.ts (exemplo completo)", texto: `import { z } from "zod";

const Ambiente = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().min(1).max(65535).default(3000),
  DATABASE_URL: z.string().min(1, "obrigatória"),
  LOG_JSON: z.stringbool().default(false),
});

function lerAmbiente(variaveis: Record<string, string | undefined>) {
  const resultado = Ambiente.safeParse(variaveis);
  if (!resultado.success) {
    const problemas = Object.entries(z.flattenError(resultado.error).fieldErrors).map(([campo, erros]) => \`\${campo}: \${erros?.join(", ")}\`);
    throw new Error(\`configuração inválida -> \${problemas.join(" | ")}\`);
  }
  return resultado.data;
}

console.log(lerAmbiente({ DATABASE_URL: "postgres://localhost/app", PORT: "8080", LOG_JSON: "true" }));
try {
  lerAmbiente({ PORT: "99999" });
} catch (erro) {
  console.log((erro as Error).message);
}` },
    { tipo: "codigo", linguagem: "text", legenda: "Saída", texto: `{
  NODE_ENV: 'development',
  PORT: 8080,
  DATABASE_URL: 'postgres://localhost/app',
  LOG_JSON: true
}
configuração inválida -> PORT: Too big: expected number to be <=65535 | DATABASE_URL: Invalid input: expected string, received undefined` },
    { tipo: "alerta", titulo: "A armadilha do booleano", texto: "Não use z.coerce.boolean() para variáveis de ambiente: ele converte qualquer texto não vazio em verdadeiro, inclusive a palavra \"false\". Use z.stringbool(), que entende \"true\", \"false\", \"1\", \"0\", \"yes\" e \"no\", como no exemplo. O mesmo cuidado vale para formulários e query strings." },

    { tipo: "h", texto: "Boas práticas" },
    { tipo: "lista", itens: [
      "Valide na borda uma única vez, e passe adiante os tipos inferidos. Não valide de novo em cada camada.",
      "Imponha limites: tamanho máximo de textos e listas, intervalos de números. Entradas sem limite são convite a abuso e a lentidão.",
      "Prefira listas de valores permitidos (enum) a textos livres, sempre que o conjunto for conhecido.",
      "Valide também as respostas de APIs de terceiros antes de confiar nelas, em especial as que alimentam decisões importantes.",
      "Não devolva ao cliente a exceção crua: converta os erros em uma resposta estruturada e estável.",
      "Mantenha os esquemas em arquivos próprios, perto do domínio, e compartilhe o tipo inferido com o resto do código.",
      "Lembre que a validação de formato não substitui as regras de negócio (e-mail único, estoque disponível), que dependem de dados que o esquema não conhece.",
    ] },
  ],
  questoes: [
    {
      enunciado: "Por que os tipos do TypeScript não bastam para garantir o formato de uma requisição HTTP?",
      opcoes: ["Porque o TypeScript só funciona no navegador", "Porque o Node não aceita tipos", "Porque JSON não tem tipos", "Porque os tipos são apagados na compilação e nada checa, em execução, os dados que chegam de fora"],
      correta: 3,
      explicacao: "Os tipos existem só durante a compilação. Em execução, os dados vindos de rede, arquivos ou ambiente chegam sem nenhuma garantia, e é preciso validá-los explicitamente.",
    },
    {
      enunciado: "Para que serve z.infer<typeof Esquema>?",
      opcoes: ["Para executar a validação", "Para derivar o tipo TypeScript do esquema, mantendo uma única fonte de verdade", "Para converter o esquema em JSON", "Para lançar erros de validação"],
      correta: 1,
      explicacao: "O z.infer gera o tipo a partir do esquema. Assim, não é preciso manter uma interface e um validador separados, que acabam saindo de sincronia.",
    },
    {
      enunciado: "Qual a diferença entre parse e safeParse?",
      opcoes: ["O parse lança uma exceção se o dado for inválido; o safeParse devolve um resultado com success verdadeiro ou falso", "Nenhuma", "O safeParse só funciona com números", "O parse só funciona no navegador"],
      correta: 0,
      explicacao: "Com safeParse, o erro é um valor que você inspeciona, o que combina com validações de entrada de usuário, onde o erro é esperado. O parse lança, o que serve melhor quando o dado inválido é um defeito do programa.",
    },
    {
      enunciado: "O esquema z.object({ nome: z.string() }) recebe { nome: \"Ana\", admin: true }. O que contém o resultado validado, por padrão?",
      opcoes: ["{ nome: \"Ana\", admin: true }", "{ nome: \"Ana\" }, porque as chaves desconhecidas são descartadas", "Um erro, sempre", "{ admin: true }"],
      correta: 1,
      explicacao: "Por padrão, o Zod remove as chaves que o esquema não declara, o que protege contra atribuição em massa. Para recusar chaves extras, use .strict().",
    },
    {
      enunciado: "Por que a query string precisa de z.coerce.number() para campos numéricos?",
      opcoes: ["Porque o Express não lê a query", "Porque os valores chegam como texto", "Porque números não podem ser validados", "Porque o Zod só aceita texto"],
      correta: 1,
      explicacao: "Tudo o que vem na URL é texto. A coerção converte \"3\" em 3 antes de aplicar as regras (inteiro, mínimo, máximo).",
    },
    {
      enunciado: "Qual a melhor forma de lidar com a variável LOG_JSON=false, vinda do ambiente?",
      opcoes: ["z.coerce.boolean(), que converte \"false\" para falso", "z.number()", "z.stringbool(), que entende textos como \"true\" e \"false\"", "Comparar com if (process.env.LOG_JSON)"],
      correta: 2,
      explicacao: "A coerção para booleano trata qualquer texto não vazio, inclusive \"false\", como verdadeiro. O stringbool interpreta as palavras corretamente.",
    },
    {
      enunciado: "Onde a configuração do programa (variáveis de ambiente) deve ser validada?",
      opcoes: ["Em cada função que a usa, quando for preciso", "Uma vez, na inicialização, falhando imediatamente com uma mensagem clara se estiver errada", "Somente em produção", "Nunca: o sistema operacional valida"],
      correta: 1,
      explicacao: "Validar tudo na partida (fail fast) evita descobrir, tarde e em produção, que uma variável estava faltando. O resto do código usa a configuração já tipada.",
    },
  ],
  desafio: {
    titulo: "API de eventos com entradas blindadas",
    enunciado: "Estenda a API do módulo anterior (ou crie uma nova) para gerenciar eventos de uma comunidade, com todas as entradas validadas por Zod: corpo, query e configuração.",
    requisitos: [
      "Crie um esquema NovoEvento com título (3 a 80 caracteres), data (texto no formato AAAA-MM-DD, validada como data real e não anterior a hoje), capacidade (inteiro de 1 a 1000) e tags (lista de até 5 textos).",
      "Crie um middleware genérico validarCorpo e use-o nas rotas POST e PUT, devolvendo 400 com os campos inválidos.",
      "Crie um esquema para a query de listagem (página, limite, tag opcional) usando coerção e limites.",
      "Valide a configuração (PORT, NODE_ENV e uma variável obrigatória) na inicialização, falhando com mensagem clara.",
      "Escreva 8 chamadas de teste com curl ou fetch cobrindo casos válidos, campos faltando, tipos errados, chaves extras e valores fora dos limites.",
    ],
    criterios: [
      "Nenhuma rota usa req.body ou req.query sem passar por um esquema.",
      "O tipo do evento é derivado do esquema com z.infer, e não escrito à mão.",
      "As mensagens de erro são claras para uma pessoa e listam todos os campos problemáticos de uma vez.",
      "A API recusa chaves desconhecidas ou as descarta, e você consegue explicar a escolha.",
      "O programa não sobe com a configuração inválida.",
    ],
    dica: "Para validar a data, combine uma expressão regular de formato com uma checagem de que a data existe (por exemplo, 31 de fevereiro não existe) usando .refine(). Teste os casos de borda: ano bissexto, hoje e ontem.",
  },
  referencias: [
    { titulo: "Zod: documentação oficial (em inglês)", url: "https://zod.dev/" },
    { titulo: "OWASP: validação de entrada (em inglês)", url: "https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html" },
  ],
};
