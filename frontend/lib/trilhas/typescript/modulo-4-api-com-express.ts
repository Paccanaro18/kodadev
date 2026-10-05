import type { Modulo } from "../tipos";

export const TS_MODULO_4: Modulo = {
  tipo: "modulo",
  slug: "api-com-express",
  titulo: "Uma API com Express",
  resumo: "Rotas, middlewares, camadas e tratamento central de erros: a primeira API HTTP em Node, do zero ao esqueleto de produção.",
  nivel: "Júnior",
  leitura: "50 min",
  objetivos: [
    "Explicar o ciclo de uma requisição HTTP em Express: rota, middlewares e resposta.",
    "Criar rotas com parâmetros de caminho, query string e corpo JSON.",
    "Escrever middlewares e entender por que a ordem em que são registrados importa.",
    "Separar a API em camadas (rotas, serviço e repositório) com dependências injetadas.",
    "Centralizar o tratamento de erros e devolver códigos de status coerentes.",
  ],
  preRequisitos: [
    "Ter feito os módulos anteriores da trilha de TypeScript (tipos, async/await, classes e módulos).",
    "Conhecer o básico de HTTP: métodos, status e JSON.",
    "Ter Node.js 22 ou mais novo e npm instalados.",
  ],
  pontosChave: [
    "Express é uma cadeia de funções: cada requisição passa pelos middlewares, na ordem em que foram registrados.",
    "Um middleware ou responde, ou chama next(); nunca os dois, e nunca nenhum.",
    "Rotas só traduzem HTTP: a regra de negócio mora no serviço e o acesso a dados, no repositório.",
    "Um único middleware de erros, no fim, evita repetir try/catch e padroniza as respostas.",
    "Tudo que chega pela rede é desconfiável: valide o tipo, o formato e o tamanho antes de usar.",
  ],
  blocos: [
    { tipo: "p", texto: "Em Node, uma API é um programa que escuta uma porta, recebe requisições HTTP e devolve respostas. O Node traz tudo para fazer isso sozinho (o módulo node:http), mas, na prática, quase ninguém escreve à mão a leitura do corpo, o roteamento por caminho e os cabeçalhos. O Express é a biblioteca mais usada para essa camada: pequena, estável e a base conceitual de outros frameworks. Entender o Express é entender como uma API Node funciona." },

    { tipo: "h", texto: "Instalando e subindo o primeiro servidor" },
    { tipo: "p", texto: "Em uma pasta nova, rode npm init -y, depois npm install express e, como ferramentas de desenvolvimento, npm install -D typescript @types/node @types/express. Acrescente \"type\": \"module\" ao package.json para usar import e export. Os exemplos deste módulo foram executados com Express 5 e Node 24." },
    { tipo: "codigo", linguagem: "bash", legenda: "Terminal", texto: `mkdir minha-api && cd minha-api
npm init -y
npm pkg set type=module
npm install express
npm install -D typescript @types/node @types/express` },
    { tipo: "p", texto: "Um servidor mínimo tem três ideias: criar a aplicação, registrar rotas e escutar uma porta. Cada rota liga um método HTTP e um caminho a uma função que recebe o pedido (req) e a resposta (res)." },
    { tipo: "codigo", linguagem: "typescript", legenda: "minimo.ts (trecho)", texto: `import express from "express";

const app = express();

app.get("/saude", (_req, res) => {
  res.json({ status: "ok" });
});

app.listen(3000, () => {
  console.log("escutando em http://localhost:3000");
});` },

    { tipo: "h", texto: "Rotas, parâmetros, query e corpo" },
    { tipo: "p", texto: "Uma requisição carrega dados em quatro lugares, e cada um tem o seu campo em req. Os parâmetros do caminho (/tarefas/7) ficam em req.params. A query string (?autor=Ana) fica em req.query. O corpo, normalmente JSON em POST e PUT, fica em req.body, mas só depois de registrar o middleware express.json(), que lê e interpreta o corpo. E os cabeçalhos ficam em req.header(\"nome\")." },
    { tipo: "tabela", legenda: "Onde estão os dados da requisição", cabecalho: ["Origem", "Exemplo", "Onde ler"], linhas: [
      ["Caminho", "GET /tarefas/7", "req.params.id"],
      ["Query string", "GET /tarefas?concluida=true", "req.query.concluida"],
      ["Corpo JSON", "POST com {\"titulo\":\"x\"}", "req.body.titulo"],
      ["Cabeçalho", "Authorization: Bearer ...", "req.header(\"authorization\")"],
    ] },
    { tipo: "alerta", titulo: "Tudo que vem de fora é texto desconfiável", texto: "Os parâmetros do caminho e da query chegam sempre como texto (ou lista de textos), e o corpo pode ter qualquer formato. O tipo any de req.body não protege você: se alguém enviar um número onde você espera um texto, o erro estoura mais adiante, longe da causa. Valide o tipo e o formato logo na entrada. O próximo módulo, sobre Zod, mostra como fazer isso de forma sistemática." },
    { tipo: "p", texto: "O exemplo a seguir reúne rotas de leitura, criação com validação e um tratamento de erros. Ele guarda as tarefas em memória, o que basta para entender o fluxo. Foi executado de ponta a ponta, chamando a própria API com fetch, e a saída abaixo é a real." },
    { tipo: "codigo", linguagem: "typescript", legenda: "api.ts (exemplo completo)", texto: `import express from "express";
import type { NextFunction, Request, Response } from "express";

class ErroDeNegocio extends Error {
  readonly status: number;

  constructor(mensagem: string, status: number) {
    super(mensagem);
    this.status = status;
  }
}

interface Tarefa {
  id: number;
  titulo: string;
  concluida: boolean;
}

const tarefas: Tarefa[] = [];
let proximoId = 1;

function registrar(req: Request, _res: Response, next: NextFunction): void {
  console.log(\`\${req.method} \${req.path}\`);
  next();
}

const app = express();
app.use(express.json());
app.use(registrar);

app.get("/tarefas", (_req, res) => {
  res.json(tarefas);
});

app.get("/tarefas/:id", (req, res) => {
  const id = Number(req.params.id);
  const tarefa = tarefas.find((t) => t.id === id);
  if (!tarefa) throw new ErroDeNegocio("tarefa não encontrada", 404);
  res.json(tarefa);
});

app.post("/tarefas", (req, res) => {
  const titulo = req.body?.titulo;
  if (typeof titulo !== "string" || titulo.trim() === "") {
    throw new ErroDeNegocio("título obrigatório", 400);
  }
  const tarefa: Tarefa = { id: proximoId++, titulo: titulo.trim(), concluida: false };
  tarefas.push(tarefa);
  res.status(201).json(tarefa);
});

app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof ErroDeNegocio) {
    res.status(err.status).json({ erro: err.message });
    return;
  }
  console.error("erro inesperado:", err);
  res.status(500).json({ erro: "erro interno" });
});

const servidor = app.listen(0, async () => {
  const { port } = servidor.address() as { port: number };
  const base = \`http://127.0.0.1:\${port}\`;
  const json = { "Content-Type": "application/json" };

  const criada = await fetch(\`\${base}/tarefas\`, { method: "POST", headers: json, body: JSON.stringify({ titulo: "Estudar Express" }) });
  console.log(criada.status, await criada.json());

  const invalida = await fetch(\`\${base}/tarefas\`, { method: "POST", headers: json, body: "{}" });
  console.log(invalida.status, await invalida.json());

  const ausente = await fetch(\`\${base}/tarefas/99\`);
  console.log(ausente.status, await ausente.json());

  const lista = await fetch(\`\${base}/tarefas\`);
  console.log(lista.status, await lista.json());
  servidor.close();
});` },
    { tipo: "codigo", linguagem: "text", legenda: "Saída", texto: `POST /tarefas
201 { id: 1, titulo: 'Estudar Express', concluida: false }
POST /tarefas
400 { erro: 'título obrigatório' }
GET /tarefas/99
404 { erro: 'tarefa não encontrada' }
GET /tarefas
200 [ { id: 1, titulo: 'Estudar Express', concluida: false } ]` },
    { tipo: "p", texto: "Observe como o fluxo funciona. Cada requisição passa primeiro por express.json() e por registrar, que imprime a linha de log e chama next() para continuar. Depois chega à rota correspondente. Quando uma rota lança um erro (ErroDeNegocio), o Express pula tudo e entrega o erro ao middleware de quatro parâmetros no fim, que o traduz para uma resposta com o status certo. Nas rotas, ninguém precisa de try/catch." },
    { tipo: "dica", titulo: "Express 5 trata promessas rejeitadas", texto: "A partir do Express 5, se um manipulador assíncrono rejeitar a promessa (ou lançar dentro de async), o erro é entregue ao middleware de erros automaticamente. No Express 4, era preciso envolver cada rota em um try/catch ou em um utilitário, porque a rejeição simplesmente se perdia e a requisição ficava pendurada." },

    { tipo: "h", texto: "Middlewares: a cadeia da requisição" },
    { tipo: "p", texto: "Um middleware é uma função com três parâmetros (req, res, next). Ele pode ler e alterar o pedido, responder diretamente ou passar adiante com next(). A aplicação executa os middlewares na ordem em que foram registrados com app.use, e depois as rotas. Por isso a ordem importa: se express.json() for registrado depois da rota, req.body chegará vazio." },
    { tipo: "lista", itens: [
      "Registro de logs: anota método, caminho e tempo de resposta de cada requisição.",
      "Autenticação: confere o cabeçalho e responde 401 se não houver credencial válida, sem chamar next().",
      "Leitura do corpo: express.json() transforma o JSON em objeto, com limite de tamanho configurável.",
      "Cabeçalhos de segurança: a biblioteca helmet acrescenta proteções recomendadas sem esforço.",
      "Tratamento de erros: o único com quatro parâmetros (err, req, res, next), sempre no fim.",
    ] },
    { tipo: "alerta", titulo: "Responder ou chamar next(), nunca os dois", texto: "Um middleware que chama res.json() e depois next() faz o Express tentar responder de novo mais adiante, e o resultado é o erro \"Cannot set headers after they are sent\". Se não responder nem chamar next(), a requisição fica pendurada até o cliente desistir. Cada caminho de código do middleware deve terminar em exatamente uma das duas ações." },

    { tipo: "h", texto: "Camadas: rotas, serviço e repositório" },
    { tipo: "p", texto: "Colocar tudo em um arquivo funciona no primeiro dia e vira um problema no décimo. A organização mais comum separa três responsabilidades. A camada de rotas (ou controladores) traduz HTTP: lê os parâmetros, chama o serviço e escolhe o status da resposta. O serviço guarda as regras de negócio e não sabe que existe HTTP. O repositório cuida do acesso aos dados e esconde se eles vêm de memória, de um arquivo ou de um banco." },
    { tipo: "p", texto: "A grande vantagem é poder testar e trocar cada peça isolada. O serviço pode ser testado sem subir servidor, e o repositório em memória pode ser trocado por um de banco de dados sem mexer nas regras. As dependências entram pelo construtor, como visto no módulo anterior. O exemplo a seguir mostra um Router, um middleware de autenticação por cabeçalho e um handler assíncrono." },
    { tipo: "codigo", linguagem: "typescript", legenda: "camadas.ts (exemplo completo)", texto: `import express, { Router } from "express";
import type { NextFunction, Request, Response } from "express";

interface Livro {
  id: number;
  titulo: string;
  autor: string;
}

class RepositorioDeLivros {
  private readonly livros: Livro[] = [
    { id: 1, titulo: "Dom Casmurro", autor: "Machado de Assis" },
    { id: 2, titulo: "Vidas Secas", autor: "Graciliano Ramos" },
    { id: 3, titulo: "Memórias Póstumas", autor: "Machado de Assis" },
  ];

  async buscarTodos(autor?: string): Promise<Livro[]> {
    await new Promise((resolve) => setTimeout(resolve, 5));
    return autor ? this.livros.filter((l) => l.autor === autor) : this.livros;
  }
}

class ServicoDeLivros {
  private readonly repositorio: RepositorioDeLivros;

  constructor(repositorio: RepositorioDeLivros) {
    this.repositorio = repositorio;
  }

  async listar(autor?: string): Promise<Livro[]> {
    if (autor !== undefined && autor.trim() === "") {
      throw new RangeError("autor não pode ser vazio");
    }
    return this.repositorio.buscarTodos(autor);
  }
}

function rotasDeLivros(servico: ServicoDeLivros): Router {
  const rotas = Router();
  rotas.get("/", async (req, res) => {
    const autor = typeof req.query.autor === "string" ? req.query.autor : undefined;
    res.json(await servico.listar(autor));
  });
  return rotas;
}

function exigirChave(req: Request, res: Response, next: NextFunction): void {
  if (req.header("x-chave") !== "segredo-de-teste") {
    res.status(401).json({ erro: "não autenticado" });
    return;
  }
  next();
}

const app = express();
app.use("/livros", exigirChave, rotasDeLivros(new ServicoDeLivros(new RepositorioDeLivros())));
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof RangeError) {
    res.status(400).json({ erro: err.message });
    return;
  }
  res.status(500).json({ erro: "erro interno" });
});

const servidor = app.listen(0, async () => {
  const { port } = servidor.address() as { port: number };
  const base = \`http://127.0.0.1:\${port}/livros\`;
  const autenticado = { "x-chave": "segredo-de-teste" };

  const semChave = await fetch(base);
  console.log(semChave.status, await semChave.json());

  const todos = await fetch(base, { headers: autenticado });
  console.log(todos.status, (await todos.json()).length);

  const filtrados = await fetch(\`\${base}?autor=\${encodeURIComponent("Machado de Assis")}\`, { headers: autenticado });
  console.log(filtrados.status, (await filtrados.json()).map((l: Livro) => l.titulo));

  const vazio = await fetch(\`\${base}?autor=%20\`, { headers: autenticado });
  console.log(vazio.status, await vazio.json());
  servidor.close();
});` },
    { tipo: "codigo", linguagem: "text", legenda: "Saída", texto: `401 { erro: 'não autenticado' }
200 3
200 [ 'Dom Casmurro', 'Memórias Póstumas' ]
400 { erro: 'autor não pode ser vazio' }` },
    { tipo: "p", texto: "Repare em app.use(\"/livros\", exigirChave, rotasDeLivros(...)): o middleware de autenticação vem antes do Router e se aplica só a esse prefixo. As rotas de livros não sabem de autenticação, e o serviço não sabe de HTTP: uma RangeError lançada na regra de negócio vira 400 apenas no middleware de erros. Cada camada tem uma razão para mudar." },
    { tipo: "alerta", titulo: "A chave do exemplo é fictícia", texto: "O valor segredo-de-teste existe só para demonstrar o middleware. Em um sistema real, segredos nunca ficam no código: vêm de variáveis de ambiente, e a autenticação usa tokens ou sessões, assunto de um módulo específico mais adiante." },

    { tipo: "h", texto: "Códigos de status: dizer a verdade ao cliente" },
    { tipo: "p", texto: "O código de status é a primeira informação que o cliente lê, e muitos programas decidem o que fazer apenas com ele. Devolver 200 com um corpo de erro é uma das práticas que mais atrapalham quem consome a API. Escolha o código que descreve o que aconteceu." },
    { tipo: "tabela", legenda: "Os códigos que você mais vai usar", cabecalho: ["Código", "Quando usar"], linhas: [
      ["200 OK", "Leitura ou alteração bem-sucedida, com corpo."],
      ["201 Created", "Algo foi criado (POST). Idealmente com o cabeçalho Location."],
      ["204 No Content", "Sucesso sem corpo, comum em exclusões."],
      ["400 Bad Request", "A requisição está malformada ou os dados são inválidos."],
      ["401 Unauthorized", "Falta autenticação, ou ela é inválida."],
      ["403 Forbidden", "Autenticado, mas sem permissão para esta ação."],
      ["404 Not Found", "O recurso não existe."],
      ["409 Conflict", "O pedido conflita com o estado atual (por exemplo, e-mail já cadastrado)."],
      ["500 Internal Server Error", "Falha inesperada do servidor. Nunca exponha detalhes internos."],
    ] },
    { tipo: "h3", texto: "Erros sem vazar informação" },
    { tipo: "p", texto: "No middleware de erros, distinga os erros que você previu (com mensagem segura para mostrar) dos inesperados. Para estes, registre o detalhe no log do servidor e devolva ao cliente uma mensagem genérica com status 500. Devolver a pilha de execução ou a mensagem original de um erro de banco de dados revela ao atacante a estrutura do seu sistema." },

    { tipo: "h", texto: "Armadilhas comuns" },
    { tipo: "lista", itens: [
      "Esquecer express.json() e receber req.body como undefined.",
      "Registrar o middleware de erros antes das rotas: ele só captura erros de rotas registradas antes dele.",
      "Aceitar corpos enormes: configure um limite (express.json({ limit: \"100kb\" })).",
      "Confiar em req.query e req.params como se fossem do tipo esperado.",
      "Misturar regra de negócio nas rotas, o que impede testar sem subir o servidor.",
      "Deixar o servidor escutando uma porta fixa nos testes: use a porta 0 e leia a porta sorteada, como nos exemplos.",
    ] },
  ],
  questoes: [
    {
      enunciado: "Em um middleware do Express, o que acontece se ele não responder e também não chamar next()?",
      opcoes: ["O Express chama o próximo middleware automaticamente", "A requisição fica pendurada até o cliente desistir", "O servidor responde 404", "O servidor reinicia"],
      correta: 1,
      explicacao: "O Express não avança sozinho: cada middleware deve encerrar a requisição respondendo ou entregar o controle com next(). Sem nenhum dos dois, o cliente espera sem receber nada.",
    },
    {
      enunciado: "Por que express.json() precisa ser registrado antes das rotas que leem req.body?",
      opcoes: ["Porque as rotas só aceitam JSON", "Porque o Node gera req.body sozinho", "Porque ele ativa o servidor", "Porque os middlewares executam na ordem de registro, e é ele que interpreta o corpo"],
      correta: 3,
      explicacao: "A ordem de registro define a ordem de execução. Se a rota for registrada antes, ela roda sem que o corpo tenha sido interpretado, e req.body chega vazio.",
    },
    {
      enunciado: "Onde fica o valor de id em uma requisição GET /tarefas/7 para a rota app.get(\"/tarefas/:id\", ...)?",
      opcoes: ["req.body.id", "req.query.id", "req.params.id", "req.header(\"id\")"],
      correta: 2,
      explicacao: "Os parâmetros definidos no caminho com dois-pontos ficam em req.params, sempre como texto. A query string fica em req.query e o corpo, em req.body.",
    },
    {
      enunciado: "O que diferencia o middleware de tratamento de erros dos demais?",
      opcoes: ["Ele tem quatro parâmetros (err, req, res, next) e é registrado depois das rotas", "Ele deve ser o primeiro a ser registrado", "Ele só trata erros 404", "Ele não pode usar res"],
      correta: 0,
      explicacao: "O Express identifica o middleware de erros pelos quatro parâmetros. Ele precisa vir depois das rotas para receber os erros lançados por elas.",
    },
    {
      enunciado: "Qual a vantagem de separar rotas, serviço e repositório?",
      opcoes: ["O código executa mais rápido", "Cada camada pode ser testada e trocada isoladamente, e as regras de negócio não ficam presas ao HTTP", "O Express exige essa estrutura", "Evita o uso de TypeScript"],
      correta: 1,
      explicacao: "Com as responsabilidades separadas, o serviço é testável sem servidor e o repositório pode mudar (memória, banco) sem alterar as regras. Não é uma exigência do Express, e sim uma decisão de design.",
    },
    {
      enunciado: "Uma requisição chega com autenticação válida, mas o usuário não tem permissão para a ação. Qual status é o mais adequado?",
      opcoes: ["401", "403", "404", "500"],
      correta: 1,
      explicacao: "O 401 indica falta ou invalidez da autenticação. O 403 indica que a identidade é conhecida, mas não tem permissão. O 500 é para falhas do servidor, e o 404 não descreve o problema.",
    },
    {
      enunciado: "Por que o middleware de erros deve devolver uma mensagem genérica para erros inesperados?",
      opcoes: ["Porque o cliente não sabe ler erros", "Porque o Express proíbe mensagens longas", "Para não expor detalhes internos (pilha de execução, consultas, caminhos) que ajudam um atacante", "Porque 500 não aceita corpo"],
      correta: 2,
      explicacao: "Mensagens internas revelam a tecnologia e a estrutura do sistema. O detalhe vai para o log do servidor, e o cliente recebe só uma mensagem genérica com status 500.",
    },
  ],
  desafio: {
    titulo: "API de contatos em camadas",
    enunciado: "Construa uma API de contatos (nome, e-mail, telefone) com Express e TypeScript, organizada em camadas, com repositório em memória. O foco é a estrutura, os códigos de status e o tratamento central de erros.",
    requisitos: [
      "Implemente GET /contatos (com filtro opcional ?nome=), GET /contatos/:id, POST /contatos, PUT /contatos/:id e DELETE /contatos/:id.",
      "Separe em arquivos: rotas, serviço, repositório e um módulo de erros, com o serviço recebendo o repositório pelo construtor.",
      "Valide o corpo na entrada: nome obrigatório, e-mail com formato mínimo válido, e e-mail único (409 se já existir).",
      "Crie um middleware que registre método, caminho, status e tempo de cada requisição.",
      "Crie um middleware de erros que devolva JSON padronizado e nunca vaze detalhes de erros inesperados.",
    ],
    criterios: [
      "Cada resposta usa o código de status correto (200, 201, 204, 400, 404, 409, 500).",
      "As rotas não contêm regras de negócio e o serviço não importa nada do Express.",
      "Não há try/catch repetido nas rotas: os erros chegam ao middleware central.",
      "O servidor aceita um limite de tamanho do corpo e não quebra com JSON inválido.",
      "Você testa as rotas com curl ou fetch, incluindo os casos de erro.",
    ],
    dica: "Comece pelo serviço e pelo repositório, sem Express, testando com um script simples. Só depois ligue as rotas. Assim você prova que as regras funcionam antes de pensar em HTTP.",
  },
  referencias: [
    { titulo: "Express: guia de roteamento (em inglês)", url: "https://expressjs.com/en/guide/routing.html" },
    { titulo: "Express: tratamento de erros (em inglês)", url: "https://expressjs.com/en/guide/error-handling.html" },
    { titulo: "MDN: códigos de status HTTP", url: "https://developer.mozilla.org/pt-BR/docs/Web/HTTP/Reference/Status" },
  ],
};
