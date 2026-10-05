import type { Modulo } from "../tipos";

export const TS_MODULO_6: Modulo = {
  tipo: "modulo",
  slug: "testes-com-vitest-e-supertest",
  titulo: "Testes com Vitest e Supertest",
  resumo: "Testes unitários e de integração de uma API Node: como escrever bons casos, usar dublês, testar rotas sem subir servidor e manter a suíte confiável.",
  nivel: "Júnior",
  leitura: "50 min",
  objetivos: [
    "Explicar por que e o que testar, e a diferença entre testes unitários e de integração.",
    "Escrever testes com describe, it e expect, no padrão preparar, agir e verificar.",
    "Cobrir casos de borda e de erro, e parametrizar casos com it.each.",
    "Testar uma API Express com Supertest, sem abrir porta de rede, usando um repositório em memória.",
    "Usar dublês (vi.fn) com critério e evitar testes frágeis.",
  ],
  preRequisitos: [
    "Ter feito os módulos \"Uma API com Express\" e \"Classes, módulos e organização de um projeto\".",
    "Saber escrever funções assíncronas com async/await.",
  ],
  pontosChave: [
    "Um teste é uma especificação executável: descreve o comportamento esperado e avisa quando ele quebra.",
    "Bons testes são rápidos, independentes, determinísticos e falham por um motivo só.",
    "Teste comportamento observável (entradas e saídas), e não detalhes internos de implementação.",
    "Separe a criação do app (criarApp) da abertura da porta (listen): é isso que permite testar com Supertest.",
    "Dublês isolam dependências lentas ou imprevisíveis, mas o excesso de mocks deixa os testes acoplados ao código.",
  ],
  blocos: [
    { tipo: "p", texto: "Todo programa é testado: a diferença está em quem executa os testes. Se você abre o navegador e clica em tudo depois de cada mudança, está testando à mão, e isso não escala nem dura. Testes automatizados são código que verifica o seu código, e rodam em segundos, a cada mudança, no seu computador e no CI. Eles dão a confiança para alterar o sistema sem medo e funcionam como documentação executável do que cada parte deve fazer. Este módulo usa o Vitest, o executor de testes mais usado em projetos TypeScript novos, e o Supertest, que testa APIs HTTP." },
    { tipo: "alerta", titulo: "Sobre as versões", texto: "Os exemplos foram executados com Vitest 5.0 e Supertest 7.1 (npm install -D vitest supertest @types/supertest), junto com o Express 5 do módulo anterior. O Vitest evolui rápido e alguns nomes de comparadores variam entre versões, então consulte a documentação da versão que você instalou." },

    { tipo: "h", texto: "O que testar, e em que nível" },
    { tipo: "p", texto: "Os testes se organizam em camadas. Testes unitários verificam uma peça isolada (uma função, uma classe), sem rede nem banco: são muito rápidos e apontam com precisão onde está o problema. Testes de integração verificam várias peças juntas, como a rota, o serviço e o repositório, e pegam erros de encaixe que os unitários não veem. Testes de ponta a ponta exercitam o sistema inteiro, como um usuário, e são os mais lentos e mais frágeis. A recomendação é uma pirâmide: muitos unitários, uma quantidade moderada de integração e poucos de ponta a ponta." },
    { tipo: "lista", itens: [
      "Teste regras de negócio (cálculos, validações, decisões): é onde os bugs custam mais.",
      "Teste os casos de borda: lista vazia, zero, valores no limite, textos vazios, datas especiais.",
      "Teste os caminhos de erro: entradas inválidas, recursos inexistentes, permissões negadas.",
      "Não teste o código das bibliotecas (o Express já foi testado) nem detalhes triviais, como um getter simples.",
      "Ao corrigir um bug, comece escrevendo um teste que o reproduz: ele garante que o erro não volta.",
    ] },

    { tipo: "h", texto: "Seu primeiro teste unitário" },
    { tipo: "p", texto: "O Vitest procura arquivos terminados em .test.ts. Cada teste é uma chamada a it (ou test) com uma descrição e uma função, e as verificações usam expect(valor) seguido de um comparador, como toBe (igualdade estrita), toEqual (igualdade de conteúdo), toThrow (lança erro) e toHaveLength. Os testes se agrupam com describe. A estrutura de cada teste segue o padrão preparar, agir e verificar (arrange, act, assert): monte os dados, execute a operação e confirme o resultado." },
    { tipo: "codigo", linguagem: "typescript", legenda: "src/descontos.ts (código testado)", texto: `export interface Item {
  nome: string;
  preco: number;
  quantidade: number;
}

export function totalDoPedido(itens: Item[], cupom?: string): number {
  if (itens.some((i) => i.preco < 0 || i.quantidade <= 0)) {
    throw new RangeError("preço ou quantidade inválidos");
  }
  const bruto = itens.reduce((soma, i) => soma + i.preco * i.quantidade, 0);
  const desconto = cupom === "KODA10" ? 0.1 : 0;
  return Math.round(bruto * (1 - desconto) * 100) / 100;
}` },
    { tipo: "codigo", linguagem: "typescript", legenda: "src/descontos.test.ts (testes)", texto: `import { describe, expect, it } from "vitest";
import { totalDoPedido } from "./descontos.ts";

describe("totalDoPedido", () => {
  const itens = [
    { nome: "caderno", preco: 20, quantidade: 2 },
    { nome: "caneta", preco: 5.5, quantidade: 1 },
  ];

  it("soma preço vezes quantidade", () => {
    expect(totalDoPedido(itens)).toBe(45.5);
  });

  it("aplica o cupom KODA10", () => {
    expect(totalDoPedido(itens, "KODA10")).toBe(40.95);
  });

  it("ignora cupons desconhecidos", () => {
    expect(totalDoPedido(itens, "QUALQUER")).toBe(45.5);
  });

  it("devolve zero para um pedido vazio", () => {
    expect(totalDoPedido([])).toBe(0);
  });

  it.each([
    [{ nome: "x", preco: -1, quantidade: 1 }],
    [{ nome: "x", preco: 1, quantidade: 0 }],
  ])("recusa itens inválidos: %o", (item) => {
    expect(() => totalDoPedido([item])).toThrow(RangeError);
  });
});` },
    { tipo: "codigo", linguagem: "bash", legenda: "Rodando os testes", texto: `npx vitest run        # roda uma vez e termina (bom para o CI)
npx vitest            # modo observação: roda de novo a cada mudança` },
    { tipo: "p", texto: "Repare em como os nomes dos testes leem como frases de uma especificação (\"aplica o cupom KODA10\"), e como cada teste verifica uma única ideia. O it.each roda o mesmo teste com várias entradas, ideal para casos de borda, e cada linha da tabela é reportada separadamente. Quando um teste falha, a saída aponta a linha, o valor esperado e o recebido, como neste caso, em que uma expectativa errada de propósito foi executada:" },
    { tipo: "codigo", linguagem: "text", legenda: "Saída de um teste que falha", texto: ` FAIL  src/falha.test.ts > soma errada de propósito
AssertionError: expected 30 to be 33 // Object.is equality

- Expected
+ Received

- 33
+ 30

 ❯ src/falha.test.ts:5:68
      3|
      4| it("soma errada de propósito", () => {
      5|   expect(totalDoPedido([{ nome: "a", preco: 10, quantidade: 3 }])).toB…
       |                                                                    ^` },
    { tipo: "dica", titulo: "Dinheiro e ponto flutuante", texto: "Repare no Math.round(... * 100) / 100 do código testado: ele evita resultados como 40.949999999999996 por causa da forma como os decimais são guardados. Em um sistema real, prefira guardar valores em centavos, como inteiros. O fato de o teste ter exposto essa preocupação é, aliás, um bom exemplo do valor dos testes de casos de borda." },

    { tipo: "h", texto: "Testando uma API com Supertest" },
    { tipo: "p", texto: "Para testar uma API de Express, o Supertest faz requisições diretamente ao objeto da aplicação, sem abrir uma porta de rede: é rápido e evita conflitos de porta. Para isso funcionar, o código precisa estar organizado de um jeito específico: uma função criarApp monta e devolve o app, e só o arquivo de entrada (index.ts) chama listen. Cada teste constrói um app novo, com um repositório em memória vazio, e por isso os testes são independentes entre si." },
    { tipo: "codigo", linguagem: "typescript", legenda: "src/app.ts (código testado)", texto: `import express from "express";

export interface RepositorioDeTarefas {
  listar(): { id: number; titulo: string }[];
  adicionar(titulo: string): { id: number; titulo: string };
}

export function criarRepositorioEmMemoria(): RepositorioDeTarefas {
  const tarefas: { id: number; titulo: string }[] = [];
  return {
    listar: () => [...tarefas],
    adicionar(titulo) {
      const tarefa = { id: tarefas.length + 1, titulo };
      tarefas.push(tarefa);
      return tarefa;
    },
  };
}

export function criarApp(repositorio: RepositorioDeTarefas) {
  const app = express();
  app.use(express.json());

  app.get("/tarefas", (_req, res) => {
    res.json(repositorio.listar());
  });

  app.post("/tarefas", (req, res) => {
    const titulo = req.body?.titulo;
    if (typeof titulo !== "string" || titulo.trim() === "") {
      res.status(400).json({ erro: "título obrigatório" });
      return;
    }
    res.status(201).json(repositorio.adicionar(titulo.trim()));
  });

  return app;
}` },
    { tipo: "codigo", linguagem: "typescript", legenda: "src/app.test.ts (testes)", texto: `import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { criarApp, criarRepositorioEmMemoria } from "./app.ts";

describe("API de tarefas", () => {
  let app: ReturnType<typeof criarApp>;

  beforeEach(() => {
    app = criarApp(criarRepositorioEmMemoria());
  });

  it("começa com a lista vazia", async () => {
    const resposta = await request(app).get("/tarefas");
    expect(resposta.status).toBe(200);
    expect(resposta.body).toEqual([]);
  });

  it("cria uma tarefa e a lista depois", async () => {
    const criada = await request(app).post("/tarefas").send({ titulo: "  Estudar testes " });
    expect(criada.status).toBe(201);
    expect(criada.body).toEqual({ id: 1, titulo: "Estudar testes" });

    const lista = await request(app).get("/tarefas");
    expect(lista.body).toHaveLength(1);
  });

  it.each([{}, { titulo: "" }, { titulo: 42 }])("recusa o corpo %j", async (corpo) => {
    const resposta = await request(app).post("/tarefas").send(corpo);
    expect(resposta.status).toBe(400);
    expect(resposta.body.erro).toBe("título obrigatório");
  });

  it("chama o repositório com o título aparado (dublê)", async () => {
    const adicionar = vi.fn((titulo: string) => ({ id: 7, titulo }));
    const falso = { listar: () => [], adicionar };
    await request(criarApp(falso)).post("/tarefas").send({ titulo: " x " });
    expect(adicionar).toHaveBeenCalledExactlyOnceWith("x");
  });
});` },
    { tipo: "codigo", linguagem: "text", legenda: "Resultado da execução (os tempos variam)", texto: ` Test Files  2 passed (2)
      Tests  12 passed (12)` },
    { tipo: "p", texto: "Os doze testes passaram: seis do módulo de descontos (o it.each conta como dois) e seis da API (o it.each de corpos inválidos conta como três). O beforeEach cria um app novo antes de cada teste, o que garante que a ordem de execução não importe: um teste nunca depende do que outro deixou para trás. O último teste usa um dublê, uma função falsa criada com vi.fn(), para verificar que o repositório recebeu o título já aparado." },

    { tipo: "h", texto: "Dublês: quando e quanto usar" },
    { tipo: "p", texto: "Um dublê substitui uma dependência real em um teste. Há várias formas. O fake é uma implementação simples e funcional (o repositório em memória, que usamos nos testes de integração). O stub devolve respostas fixas. O mock registra como foi chamado, e você verifica as chamadas (o vi.fn). O spy observa uma função real sem substituí-la. Eles são ótimos para isolar o que é lento (rede, banco, relógio) ou imprevisível (data atual, números aleatórios, serviços de terceiros)." },
    { tipo: "alerta", titulo: "Mocks demais deixam os testes frágeis", texto: "Um teste cheio de verificações do tipo \"foi chamado três vezes com estes argumentos\" repete a implementação: qualquer refatoração, mesmo correta, o quebra. Prefira verificar o resultado observável (a resposta, o estado final) e use fakes sempre que puder. Reserve os mocks para o que não dá para observar de outra forma, como o envio de um e-mail." },

    { tipo: "h3", texto: "Testes assíncronos e tempo" },
    { tipo: "p", texto: "Em Node, quase tudo é assíncrono, e o erro mais comum nos testes é esquecer de esperar. Se o teste chama uma função que devolve uma promessa e não usa await (ou não devolve a promessa), ele termina antes de a verificação acontecer e passa sempre, mesmo quando o código está errado. Marque a função do teste como async, use await em toda chamada assíncrona e, para verificar rejeições, escreva await expect(funcao()).rejects.toThrow(). Os testes do Supertest acima já seguem essa regra, e por isso cada request(app).get(...) vem com await." },
    { tipo: "p", texto: "O tempo é outra fonte clássica de testes frágeis: esperas fixas com setTimeout deixam a suíte lenta e, mesmo assim, falham em máquinas mais lentas. O Vitest oferece relógios falsos (vi.useFakeTimers), com os quais você avança o tempo à vontade e instantaneamente, e a mesma ideia vale para a data atual (vi.setSystemTime). Com isso, uma regra como \"o cupom expira em 24 horas\" pode ser testada em milissegundos, e o resultado é sempre o mesmo, em qualquer dia e em qualquer computador." },

    { tipo: "h", texto: "Testes que dão confiança" },
    { tipo: "numerada", itens: [
      "Rápidos: a suíte inteira deve rodar em segundos, ou as pessoas deixam de rodá-la.",
      "Independentes: nenhum teste depende da ordem nem do resultado de outro.",
      "Determinísticos: o mesmo código deve dar o mesmo resultado sempre. Controle o tempo (vi.useFakeTimers) e a aleatoriedade, e não dependa de rede externa.",
      "Legíveis: o nome diz o comportamento, e o corpo cabe na tela. Quem lê a falha deve entender o problema sem abrir o código.",
      "Focados: um motivo para falhar. Muitas verificações em um só teste escondem qual delas quebrou.",
      "Executados no CI: um teste que só roda na máquina de quem lembrou de rodá-lo não protege ninguém.",
    ] },
    { tipo: "p", texto: "A cobertura de testes (a porcentagem de linhas executadas pelos testes), que o Vitest calcula com um plugin, é um indicador útil, mas não uma meta. Cem por cento de cobertura com verificações fracas prova pouco, e um conjunto menor de testes bem pensados vale mais. Use a cobertura para descobrir trechos que nenhum teste toca, e não para medir qualidade. Outra prática é o desenvolvimento orientado a testes (TDD): escrever o teste que falha, fazer o mínimo para passar e depois melhorar o código. Nem sempre é o mais prático, mas é excelente para regras de negócio e para corrigir bugs." },
  ],
  questoes: [
    {
      enunciado: "Qual a principal diferença entre um teste unitário e um teste de integração?",
      opcoes: ["O unitário é sempre mais lento", "O unitário verifica uma peça isolada; o de integração verifica várias peças trabalhando juntas", "O de integração não usa expect", "Não há diferença"],
      correta: 1,
      explicacao: "Testes unitários isolam uma função ou classe e são rápidos e precisos. Os de integração verificam o encaixe entre as peças (por exemplo, rota, serviço e repositório), pegando erros que os unitários não veem.",
    },
    {
      enunciado: "Por que o código da API separa criarApp() da chamada a listen()?",
      opcoes: ["Porque o Express exige", "Para que os testes possam importar o app e fazer requisições com Supertest sem abrir uma porta de rede", "Para o servidor iniciar mais rápido", "Para proteger o código com senha"],
      correta: 1,
      explicacao: "Quando o app é criado por uma função sem iniciar o servidor, os testes o importam e disparam requisições diretamente, sem conflito de portas e de forma rápida e isolada.",
    },
    {
      enunciado: "Para que serve o beforeEach nos testes da API?",
      opcoes: ["Para criar um app e um repositório novos antes de cada teste, tornando-os independentes", "Para rodar os testes na ordem alfabética", "Para desligar o servidor", "Para medir a cobertura"],
      correta: 0,
      explicacao: "Recriar o estado antes de cada teste evita que um teste dependa dos dados deixados por outro, o que tornaria a suíte frágil e dependente da ordem de execução.",
    },
    {
      enunciado: "O que faz it.each em um teste?",
      opcoes: ["Executa o mesmo teste com várias entradas, reportando cada uma", "Executa todos os testes em paralelo", "Ignora testes que falham", "Repete o teste até passar"],
      correta: 0,
      explicacao: "O it.each recebe uma tabela de casos e executa o teste uma vez para cada linha. É excelente para casos de borda e entradas inválidas.",
    },
    {
      enunciado: "Qual abordagem torna um teste menos frágil a refatorações?",
      opcoes: ["Verificar quantas vezes cada função interna foi chamada", "Verificar o resultado observável (resposta, estado final) e usar fakes no lugar de muitos mocks", "Copiar a implementação para dentro do teste", "Usar números aleatórios nas entradas"],
      correta: 1,
      explicacao: "Testes que repetem a implementação quebram a cada mudança interna, mesmo correta. Verificar comportamento observável mantém o teste útil enquanto o código evolui.",
    },
    {
      enunciado: "Um teste depende da data atual e falha só às terças-feiras. Qual é o problema?",
      opcoes: ["O teste é lento", "O teste não é determinístico, porque depende de uma fonte externa imprevisível", "O Vitest não suporta datas", "O teste não tem expect"],
      correta: 1,
      explicacao: "Testes devem dar o mesmo resultado sempre. O relógio, a aleatoriedade e a rede são fontes de imprevisibilidade; controle-os com dublês (por exemplo, vi.useFakeTimers) ou injete-os como dependências.",
    },
    {
      enunciado: "Qual afirmação sobre cobertura de testes é a mais correta?",
      opcoes: ["100% de cobertura garante ausência de bugs", "É um indicador útil para achar trechos não testados, mas não mede a qualidade das verificações", "Cobertura baixa é sempre melhor", "A cobertura substitui os testes de integração"],
      correta: 1,
      explicacao: "A cobertura mostra o que foi executado, e não se foi verificado corretamente. Serve como guia para encontrar lacunas, e não como meta absoluta.",
    },
  ],
  desafio: {
    titulo: "Teste a sua API de contatos",
    enunciado: "Pegue a API de contatos do desafio do módulo de Express (ou crie uma versão simples) e escreva uma suíte de testes completa, com Vitest e Supertest, antes de fazer qualquer mudança no código.",
    requisitos: [
      "Reorganize o código para exportar criarApp(repositorio) e deixe o listen em um arquivo index.ts separado.",
      "Escreva testes unitários do serviço (regras de negócio), com um repositório em memória como fake.",
      "Escreva testes de integração com Supertest para cada rota: sucesso, validação (400), inexistente (404) e conflito (409).",
      "Use it.each para ao menos uma tabela de entradas inválidas e descreva cada teste como uma frase de comportamento.",
      "Corrija um bug que você introduziu de propósito no código (por exemplo, aceitar e-mail duplicado), seguindo o ciclo de escrever o teste que falha, corrigir e ver passar.",
    ],
    criterios: [
      "Os testes rodam em poucos segundos e em qualquer ordem, sem depender de porta fixa nem de arquivos.",
      "Cada teste verifica uma ideia, com um nome que explica o comportamento.",
      "Mocks são usados só onde não há alternativa observável.",
      "A suíte pega o bug que você introduziu e passa depois da correção.",
      "Você consegue explicar a diferença entre fake, stub e mock, com um exemplo do seu projeto.",
    ],
    dica: "Se estiver em dúvida sobre o que testar, liste as regras da API em português (\"não aceita e-mail duplicado\") e transforme cada uma em um teste. A lista de regras é a lista de testes.",
  },
  referencias: [
    { titulo: "Vitest: guia de início (em inglês)", url: "https://vitest.dev/guide/" },
    { titulo: "Supertest no GitHub (em inglês)", url: "https://github.com/ladjs/supertest" },
  ],
};
