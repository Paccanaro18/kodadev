import type { Modulo } from "../tipos";

export const TS_MODULO_2: Modulo = {
  tipo: "modulo",
  slug: "assincrono-em-node",
  titulo: "Assíncrono em Node: event loop, promises e async/await",
  resumo: "Por que o Node é rápido com uma única thread, como o event loop decide a ordem das coisas e como escrever código assíncrono sem armadilhas.",
  nivel: "Júnior",
  leitura: "40 min",
  objetivos: [
    "Explicar como o Node atende muitas requisições com uma única thread de JavaScript.",
    "Prever a ordem de execução entre código síncrono, microtarefas e timers.",
    "Escrever código com promises e async/await, tratando erros corretamente.",
    "Escolher entre execução sequencial e concorrente com Promise.all, race, allSettled e any.",
    "Reconhecer e evitar as armadilhas: forEach com async, bloqueio do event loop e rejeições sem tratamento.",
  ],
  preRequisitos: [
    "Ter feito o módulo \"TypeScript essencial\" ou conhecer tipos, funções e objetos.",
    "Node.js 22.18 ou mais novo instalado.",
  ],
  pontosChave: [
    "O JavaScript roda em uma única thread. O que permite atender muitos clientes é que as operações de espera (disco, rede, banco) não bloqueiam essa thread.",
    "O event loop executa o código síncrono primeiro, depois todas as microtarefas (promises) e só então o próximo timer ou evento de I/O.",
    "async/await é uma forma de escrever promises que lê como código síncrono. Toda função async devolve uma Promise.",
    "Promise.all dispara tudo ao mesmo tempo e falha se uma falhar. allSettled espera todas, falhando ou não.",
    "Uma conta pesada na thread principal congela o servidor inteiro: nada mais é atendido enquanto ela roda.",
  ],
  blocos: [
    { tipo: "p", texto: "Se você vem de Java ou Python, há um choque inicial no Node: quase tudo que envolve esperar (ler um arquivo, chamar uma API, consultar um banco) é assíncrono. Entender por que o Node funciona assim, e como o event loop organiza o trabalho, transforma o que parece caos em um modelo simples e previsível. É o assunto mais importante do Node, e a fonte da maior parte dos bugs de quem está começando." },

    { tipo: "h", texto: "Uma thread, muitos clientes" },
    { tipo: "p", texto: "Imagine um restaurante. No modelo tradicional, cada cliente recebe um garçom dedicado, que fica parado ao lado da mesa enquanto a cozinha prepara o prato. Para atender mil clientes, são necessários mil garçons, e a maioria do tempo eles estão apenas esperando. Esse é o modelo de uma thread por requisição." },
    { tipo: "p", texto: "O Node funciona como um único garçom muito rápido: anota o pedido de uma mesa, entrega à cozinha e, sem esperar, vai anotar o da próxima. Quando o prato fica pronto, a cozinha avisa, e ele o leva à mesa. O garçom nunca fica parado: ele só faz coisas, e quem espera é a cozinha." },
    { tipo: "p", texto: "Traduzindo para o Node: o garçom é a thread única que executa o seu JavaScript. A cozinha é o sistema operacional e uma biblioteca chamada libuv, que fazem o trabalho de espera (rede, disco, timers) em paralelo, por baixo, sem usar a sua thread. O aviso de que o prato ficou pronto é um evento, e a função que você deixou preparada para tratá-lo é o callback." },
    { tipo: "alerta", titulo: "A consequência mais importante", texto: "Como há uma só thread executando o seu código, qualquer trabalho longo que você faça nela (um laço pesado, uma conta enorme, um JSON gigante) impede que todo o resto aconteça até terminar. Nenhuma outra requisição é atendida nesse intervalo. Por isso, em Node, o código que roda na thread principal precisa ser rápido, e o que é lento tem de ser esperado de forma assíncrona." },

    { tipo: "h", texto: "O event loop: quem decide a ordem" },
    { tipo: "p", texto: "O event loop é um laço que fica rodando enquanto houver trabalho. Em cada volta, ele pega a próxima tarefa que está pronta e a executa até o fim, sem interrompê-la. Existem, simplificando, três lugares onde o trabalho espera a sua vez:" },
    { tipo: "tabela", cabecalho: ["Fila", "O que entra nela", "Quando roda"], linhas: [
      ["Pilha de chamadas (call stack)", "O código síncrono que está sendo executado agora.", "Primeiro: tudo o que está na pilha termina antes de qualquer outra coisa."],
      ["Microtarefas", "Os callbacks de promises (.then, .catch, e o que vem depois de um await) e queueMicrotask.", "Logo depois que a pilha esvazia, todas elas, antes de seguir adiante."],
      ["Macrotarefas (fila de eventos)", "Timers (setTimeout, setInterval), eventos de rede e de disco.", "Uma por vez, em cada volta do loop, depois de esvaziar as microtarefas."],
    ] },
    { tipo: "p", texto: "A regra que resume: código síncrono, depois todas as microtarefas, depois a próxima macrotarefa. O exemplo abaixo mostra isso na prática:" },
    { tipo: "codigo", linguagem: "typescript", legenda: "Ordem.ts", texto: `console.log("1: início");

setTimeout(() => console.log("5: timeout de 0 ms"), 0);

Promise.resolve().then(() => console.log("3: microtarefa da promise"));
queueMicrotask(() => console.log("4: outra microtarefa"));

console.log("2: fim do código síncrono");` },
    { tipo: "codigo", linguagem: "text", legenda: "Saída", texto: `1: início
2: fim do código síncrono
3: microtarefa da promise
4: outra microtarefa
5: timeout de 0 ms` },
    { tipo: "p", texto: "O timer de 0 milissegundo foi registrado antes das promises, mas rodou por último. Não existe \"zero\" de verdade: ele vai para a fila de macrotarefas e só será atendido depois que o código síncrono acabar e todas as microtarefas forem processadas. Esse detalhe explica uma enorme quantidade de comportamentos que parecem estranhos." },

    { tipo: "h", texto: "Callbacks: a primeira geração" },
    { tipo: "p", texto: "Antes das promises, tudo era feito com callbacks: você passa uma função para ser chamada quando a operação terminar. O padrão do Node era que o primeiro argumento do callback fosse o erro, e o segundo, o resultado." },
    { tipo: "codigo", linguagem: "typescript", legenda: "callbacks (trecho)", texto: `import { readFile } from "node:fs";

readFile("a.json", "utf8", (erro, textoA) => {
  if (erro) return tratar(erro);
  readFile("b.json", "utf8", (erro, textoB) => {
    if (erro) return tratar(erro);
    readFile("c.json", "utf8", (erro, textoC) => {
      if (erro) return tratar(erro);
      // ... a pirâmide continua crescendo para a direita
    });
  });
});` },
    { tipo: "p", texto: "Funciona, mas cada passo dependente aninha mais um nível (o callback hell), e o tratamento de erros precisa ser repetido em todo lugar. As promises foram criadas para resolver isso." },

    { tipo: "h", texto: "Promises" },
    { tipo: "p", texto: "Uma Promise é um objeto que representa um valor que ainda vai existir. Ela está sempre em um de três estados: pendente (a operação ainda está em andamento), cumprida (terminou com sucesso e tem um valor) ou rejeitada (terminou com um erro). Uma vez cumprida ou rejeitada, nunca muda." },
    { tipo: "p", texto: "Você consome uma promise com .then (para o sucesso), .catch (para o erro) e .finally (para algo que roda nos dois casos). Cada um devolve uma nova promise, o que permite encadear, e um erro lançado em qualquer ponto da cadeia pula direto até o próximo .catch." },
    { tipo: "h3", texto: "async e await" },
    { tipo: "p", texto: "O async/await é um açúcar sintático sobre as promises, que faz o código assíncrono parecer síncrono, e é a forma que você usará na maior parte do tempo:" },
    { tipo: "lista", itens: [
      "Uma função marcada com async sempre devolve uma Promise, mesmo que o corpo devolva um valor comum: o valor vira o resultado da promise, e um erro lançado vira uma rejeição.",
      "await pausa a função, e só a função, até a promise terminar, sem bloquear a thread. Enquanto espera, o event loop segue atendendo outras coisas. O resultado é o valor da promise, ou o erro é lançado no ponto do await, e dá para capturá-lo com try/catch.",
      "await só pode ser usado dentro de uma função async (ou no nível superior de um módulo ES).",
    ] },
    { tipo: "codigo", linguagem: "typescript", legenda: "Promises.ts", texto: `interface Usuario {
  id: number;
  nome: string;
}

function esperar(ms: number): Promise<void> {
  return new Promise((resolver) => setTimeout(resolver, ms));
}

function buscarUsuario(id: number): Promise<Usuario> {
  return new Promise((resolver, rejeitar) => {
    setTimeout(() => {
      if (id > 0) {
        resolver({ id, nome: \`Usuário \${id}\` });
      } else {
        rejeitar(new Error("id inválido"));
      }
    }, 10);
  });
}

async function principal(): Promise<void> {
  const usuario = await buscarUsuario(1);
  console.log(usuario);

  try {
    await buscarUsuario(-1);
  } catch (erro) {
    console.log("capturado:", (erro as Error).message);
  } finally {
    console.log("finally sempre roda");
  }

  const tarefa = (nome: string, ms: number) => esperar(ms).then(() => nome);

  const todas = await Promise.all([tarefa("a", 30), tarefa("b", 10), tarefa("c", 20)]);
  console.log(todas);

  console.log(await Promise.race([tarefa("lenta", 40), tarefa("rápida", 5)]));

  const resultados = await Promise.allSettled([Promise.resolve(1), Promise.reject(new Error("x"))]);
  console.log(resultados.map((r) => r.status));

  const inicio = performance.now();
  await esperar(30);
  await esperar(30);
  await esperar(30);
  const sequencial = performance.now() - inicio;

  const inicio2 = performance.now();
  await Promise.all([esperar(30), esperar(30), esperar(30)]);
  const paralelo = performance.now() - inicio2;

  console.log("paralelo é mais rápido:", paralelo < sequencial);
}

principal();` },
    { tipo: "codigo", linguagem: "text", legenda: "Saída", texto: `{ id: 1, nome: 'Usuário 1' }
capturado: id inválido
finally sempre roda
[ 'a', 'b', 'c' ]
rápida
[ 'fulfilled', 'rejected' ]
paralelo é mais rápido: true` },
    { tipo: "h3", texto: "Sequencial ou concorrente?" },
    { tipo: "p", texto: "O final do exemplo mostra a decisão mais importante do código assíncrono. Três await seguidos executam as esperas uma depois da outra: 90 ms no total. Disparar as três promises de uma vez e esperar todas com Promise.all leva só o tempo da mais lenta: cerca de 30 ms. Se as operações não dependem umas das outras, executar em paralelo é muito mais rápido." },
    { tipo: "tabela", cabecalho: ["Função", "Espera", "Se uma falhar"], linhas: [
      ["Promise.all", "Todas terminarem. Devolve os resultados na ordem de entrada, não na de chegada.", "Rejeita imediatamente com o primeiro erro (as demais continuam, mas o resultado é ignorado)."],
      ["Promise.allSettled", "Todas terminarem, com sucesso ou falha. Devolve o status de cada uma.", "Nunca rejeita: você inspeciona cada resultado."],
      ["Promise.race", "A primeira terminar, seja sucesso ou falha.", "Se a primeira a terminar for uma falha, rejeita."],
      ["Promise.any", "A primeira que terminar com sucesso.", "Só rejeita se todas falharem."],
    ] },
    { tipo: "dica", titulo: "Quando não usar Promise.all", texto: "Se você tem mil itens para processar, disparar mil requisições de uma vez pode derrubar o serviço do outro lado ou esgotar conexões. Para listas grandes, processe em lotes com um limite de concorrência (por exemplo, 10 por vez), seja escrevendo o laço em lotes, seja com uma biblioteca como a p-limit." },

    { tipo: "h", texto: "Lendo arquivos: um exemplo real" },
    { tipo: "p", texto: "O Node traz uma biblioteca padrão em que as funções assíncronas devolvem promises, em módulos como node:fs/promises. Repare no prefixo node:, que deixa claro que o módulo é nativo, e não um pacote instalado:" },
    { tipo: "codigo", linguagem: "typescript", legenda: "Arquivos.ts", texto: `import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

async function principal(): Promise<void> {
  const pasta = await mkdtemp(join(tmpdir(), "koda-"));
  const arquivo = join(pasta, "notas.json");

  await writeFile(arquivo, JSON.stringify({ notas: [8, 6, 10] }), "utf8");
  const texto = await readFile(arquivo, "utf8");
  const dados = JSON.parse(texto) as { notas: number[] };
  console.log(dados.notas.length, Math.max(...dados.notas));

  try {
    await readFile(join(pasta, "nao-existe.txt"), "utf8");
  } catch (erro) {
    console.log("código do erro:", (erro as NodeJS.ErrnoException).code);
  }

  await rm(pasta, { recursive: true });
}

principal();` },
    { tipo: "codigo", linguagem: "text", legenda: "Saída", texto: `3 10
código do erro: ENOENT` },
    { tipo: "lista", itens: [
      "Use join do módulo path para montar caminhos, em vez de concatenar com barras: a barra muda entre sistemas operacionais.",
      "Os erros de arquivo trazem um código (ENOENT: não existe; EACCES: sem permissão) que você pode testar para decidir o que fazer.",
      "O JSON.parse devolve unknown/any: o as { notas: number[] } é uma promessa sua ao compilador, não uma verificação. Se o arquivo estiver diferente, o erro aparece só mais adiante. Em dados reais, valide.",
    ] },

    { tipo: "h", texto: "As armadilhas do código assíncrono" },
    { tipo: "codigo", linguagem: "typescript", legenda: "Armadilhas.ts", texto: `function esperar(ms: number): Promise<void> {
  return new Promise((resolver) => setTimeout(resolver, ms));
}

async function principal(): Promise<void> {
  const itens = [1, 2, 3];

  let somaForEach = 0;
  itens.forEach(async (n) => {
    await esperar(5);
    somaForEach += n;
  });
  console.log("logo depois do forEach:", somaForEach);

  let somaForOf = 0;
  for (const n of itens) {
    await esperar(5);
    somaForOf += n;
  }
  console.log("depois do for...of:", somaForOf);

  const inicio = Date.now();
  setTimeout(() => {
    console.log("o timer de 10 ms atrasou:", Date.now() - inicio >= 100);
  }, 10);
  while (Date.now() - inicio < 100) {
    // trava o único thread por 100 ms
  }
}

principal();` },
    { tipo: "codigo", linguagem: "text", legenda: "Saída", texto: `logo depois do forEach: 0
depois do for...of: 6
o timer de 10 ms atrasou: true` },
    { tipo: "h3", texto: "1. forEach não espera funções async" },
    { tipo: "p", texto: "O forEach chama o callback para cada item e ignora a promise que ele devolve. O resultado é que o forEach termina imediatamente, antes de qualquer await do corpo acabar: a soma ainda é 0. Para executar em sequência, use um laço for...of com await. Para executar em paralelo e esperar tudo, use await Promise.all(itens.map(async (n) => ...))." },
    { tipo: "h3", texto: "2. Bloquear o event loop" },
    { tipo: "p", texto: "O timer pedia 10 ms, mas só foi atendido depois de 100, porque o laço while ocupou a única thread. Em um servidor, isso significa que, durante esses 100 ms, nenhuma outra requisição foi respondida. Contas pesadas (compressão, criptografia em volume, processamento de imagens) devem sair da thread principal, com worker_threads ou em um serviço à parte. Mesmo funções síncronas do Node, como readFileSync, bloqueiam: em servidores, use a versão assíncrona." },
    { tipo: "h3", texto: "3. Esquecer o await" },
    { tipo: "p", texto: "Chamar uma função async sem await devolve uma promise pendente, e o código seguinte roda antes de ela terminar. O sintoma típico: um objeto que aparece como Promise { <pending> } onde você esperava dados, ou uma operação que \"não aconteceu\" a tempo. Um linter com a regra no-floating-promises pega esse erro automaticamente." },
    { tipo: "h3", texto: "4. Rejeições sem tratamento" },
    { tipo: "p", texto: "Uma promise rejeitada que ninguém captura vira uma unhandled rejection. A partir do Node 15, isso derruba o processo por padrão. Sempre capture erros com try/catch ao redor do await ou com .catch, e tenha um tratamento no nível mais alto do programa." },
    { tipo: "h3", texto: "5. Condições de corrida" },
    { tipo: "p", texto: "Mesmo com uma só thread, existe condição de corrida quando um await deixa outro trecho de código rodar no meio de uma operação em duas etapas (ler um valor, esperar e gravar o valor + 1). Se duas requisições fazem isso ao mesmo tempo, uma sobrescreve a outra. A solução costuma ficar no banco (operações atômicas, transações), não no JavaScript." },
    { tipo: "h3", texto: "6. Operações que nunca terminam" },
    { tipo: "p", texto: "Toda chamada externa precisa de um limite de tempo. Sem ele, uma API lenta deixa a sua requisição pendurada para sempre. O fetch e muitas bibliotecas aceitam um AbortSignal, e AbortSignal.timeout(5000) cancela a operação depois de 5 segundos." },

    { tipo: "h", texto: "Os erros mais comuns de quem está começando" },
    { tipo: "tabela", cabecalho: ["Erro", "Sintoma", "Correção"], linhas: [
      ["await esquecido", "Promise { <pending> } no lugar do valor.", "Adicionar await (e ligar a regra no-floating-promises)."],
      ["forEach com async", "O código seguinte roda antes de o trabalho terminar.", "for...of com await, ou Promise.all com map."],
      ["await em série quando daria para ser paralelo", "A rotina leva a soma dos tempos.", "Promise.all para o que é independente."],
      ["Promise.all para milhares de itens", "Excesso de conexões, erros de limite de taxa.", "Processar em lotes com limite de concorrência."],
      ["Laço pesado na thread principal", "O servidor para de responder durante o cálculo.", "worker_threads ou outro serviço."],
      ["try/catch ausente", "O processo cai por unhandled rejection.", "Tratar o erro onde há await."],
      ["Chamadas externas sem timeout", "Requisições penduradas.", "AbortSignal.timeout."],
    ] },
  ],
  questoes: [
    {
      enunciado: "Qual é a ordem de execução?\n\nconsole.log(\"A\");\nsetTimeout(() => console.log(\"B\"), 0);\nPromise.resolve().then(() => console.log(\"C\"));\nconsole.log(\"D\");",
      opcoes: ["A, B, C, D", "A, D, C, B", "A, C, D, B", "A, D, B, C"],
      correta: 1,
      explicacao: "Primeiro roda todo o código síncrono (A e D). Depois, as microtarefas (o .then de C). Por último, a macrotarefa do timer (B), mesmo com 0 ms. A ordem é A, D, C, B.",
    },
    {
      enunciado: "Por que o Node consegue atender muitas conexões com uma única thread de JavaScript?",
      opcoes: ["Porque o V8 cria uma thread nova para cada requisição", "Porque as operações de espera (rede, disco) são feitas fora da thread de JavaScript, e ela não fica parada esperando", "Porque o Node é compilado para código de máquina", "Porque o JavaScript executa duas linhas ao mesmo tempo"],
      correta: 1,
      explicacao: "O trabalho de espera é delegado ao sistema operacional e à libuv, e o resultado volta como um evento. A thread de JavaScript só executa callbacks curtos, e por isso fica livre para outros clientes enquanto as esperas acontecem.",
    },
    {
      enunciado: "O que uma função declarada com async sempre devolve?",
      opcoes: ["O valor do return, sem alteração", "Uma Promise", "undefined", "Um callback"],
      correta: 1,
      explicacao: "Uma função async sempre devolve uma Promise: o valor retornado vira o resultado cumprido, e um erro lançado vira uma rejeição. Para obter o valor, é preciso usar await ou .then.",
    },
    {
      enunciado: "Qual é o problema deste código?\n\nitens.forEach(async (item) => {\n  await salvar(item);\n});\nconsole.log(\"terminou\");",
      opcoes: ["Nenhum: ele espera todos os salvamentos", "O \"terminou\" aparece antes de os salvamentos acabarem, porque o forEach não espera as promises", "Erro de sintaxe: forEach não aceita funções async", "Os itens são salvos na ordem inversa"],
      correta: 1,
      explicacao: "O forEach ignora o valor devolvido pelo callback, que é uma promise. Ele termina logo, e o console.log roda antes de os salvamentos concluírem. Use for...of com await (em sequência) ou await Promise.all(itens.map(...)) (em paralelo).",
    },
    {
      enunciado: "Você precisa buscar três recursos independentes de uma API. Qual abordagem é mais rápida?",
      opcoes: ["Três await seguidos", "await Promise.all([...])", "Três callbacks aninhados", "Um laço while com sleep"],
      correta: 1,
      explicacao: "Com Promise.all, as três requisições são disparadas ao mesmo tempo, e o tempo total é o da mais lenta. Três await seguidos somam os tempos, pois cada um só começa depois que o anterior terminou.",
    },
    {
      enunciado: "Qual função espera todas as promises terminarem, com sucesso ou falha, e nunca rejeita?",
      opcoes: ["Promise.all", "Promise.race", "Promise.allSettled", "Promise.any"],
      correta: 2,
      explicacao: "O allSettled devolve, para cada promise, um objeto com o status (fulfilled ou rejected) e o valor ou o motivo. O all rejeita no primeiro erro, o race devolve a primeira a terminar e o any, a primeira que der certo.",
    },
    {
      enunciado: "O que acontece quando um laço pesado de 2 segundos roda na thread principal de um servidor Node?",
      opcoes: ["As outras requisições são atendidas em outra thread", "Nenhuma outra requisição é atendida até o laço terminar", "O Node cria um worker automaticamente", "O laço é pausado quando chega uma requisição"],
      correta: 1,
      explicacao: "Há uma única thread executando o JavaScript, e o event loop só segue para a próxima tarefa quando a atual termina. Um cálculo longo congela todo o servidor. Para trabalhos pesados, use worker_threads ou outro serviço.",
    },
  ],
  desafio: {
    titulo: "Leitor de relatórios com limite de tempo",
    enunciado: "Escreva um programa (relatorios.ts) que lê vários arquivos JSON de notas, calcula a média de cada um e imprime um resumo, tratando arquivos ausentes, inválidos e lentos sem derrubar o programa.",
    requisitos: [
      "Crie, via código, uma pasta temporária com 4 arquivos: dois válidos, um com JSON quebrado e um que você simplesmente não cria.",
      "Leia todos os arquivos em paralelo e use Promise.allSettled para tratar cada resultado individualmente.",
      "Para cada arquivo válido, calcule e imprima a média das notas; para os outros, imprima uma mensagem clara com o motivo (arquivo inexistente ou conteúdo inválido).",
      "Acrescente um limite de tempo de 2 segundos ao conjunto, usando Promise.race com um timer, e mostre o que acontece se estourar.",
      "Ao final, apague a pasta temporária, mesmo se algo falhar (use finally).",
    ],
    criterios: [
      "O programa passa em npx tsc --noEmit --strict e roda com node relatorios.ts.",
      "Um arquivo ruim não impede os outros de serem processados.",
      "Não há nenhum forEach com função async.",
      "A pasta temporária é removida em todos os caminhos, inclusive nos de erro.",
      "Você consegue explicar a diferença de comportamento entre Promise.all e Promise.allSettled usando o seu código.",
    ],
    dica: "Para validar o conteúdo, não confie em JSON.parse(...) as X: confira que é um array de números antes de usar. Se achar útil, escreva uma função pequena temNotasValidas(valor: unknown): valor is number[].",
  },
  referencias: [
    { titulo: "Node.js: o event loop, timers e process.nextTick (em inglês)", url: "https://nodejs.org/en/learn/asynchronous-work/event-loop-timers-and-nexttick" },
    { titulo: "MDN: Usando promises", url: "https://developer.mozilla.org/pt-BR/docs/Web/JavaScript/Guide/Using_promises" },
    { titulo: "MDN: async function", url: "https://developer.mozilla.org/pt-BR/docs/Web/JavaScript/Reference/Statements/async_function" },
  ],
};
