import type { Modulo } from "../tipos";

export const TS_MODULO_1: Modulo = {
  tipo: "modulo",
  slug: "tipos-funcoes-e-objetos",
  titulo: "TypeScript essencial: tipos, funções e objetos",
  resumo: "O que o TypeScript acrescenta ao JavaScript, como os tipos se comportam e como o compilador evita bugs antes de o código rodar.",
  nivel: "Iniciante",
  leitura: "40 min",
  objetivos: [
    "Explicar a relação entre JavaScript, TypeScript e Node, e o que acontece com os tipos quando o programa roda.",
    "Escolher e declarar os tipos certos, deixando o compilador inferir o que for óbvio.",
    "Evitar as armadilhas clássicas do JavaScript: igualdade frouxa, valores falsos e null versus undefined.",
    "Escrever funções tipadas, usar closures e as funções map, filter e reduce.",
    "Modelar dados com interfaces, uniões e tipos literais, e usar narrowing para tratar cada caso.",
  ],
  preRequisitos: [
    "Saber usar um terminal e um editor de código.",
    "Ter instalado o Node.js (versão 22.18 ou mais nova, de preferência a LTS atual).",
    "Já ter escrito algum código em qualquer linguagem ajuda, mas não é obrigatório.",
  ],
  pontosChave: [
    "TypeScript é JavaScript com tipos. Os tipos são conferidos antes de rodar e desaparecem na execução.",
    "Deixe o compilador inferir o tipo quando for óbvio e declare nas fronteiras: parâmetros, retornos e dados externos.",
    "Use === e !==. Prefira ?? a || quando 0 ou texto vazio forem valores válidos.",
    "Uniões com um campo discriminante, mais narrowing, modelam muito bem estados diferentes.",
    "O modo strict liga as verificações que realmente protegem você. Deixe sempre ligado.",
  ],
  blocos: [
    { tipo: "p", texto: "Quase toda a internet roda JavaScript, e boa parte dos servidores modernos também, graças ao Node.js. O problema do JavaScript puro é que ele deixa você fazer quase qualquer coisa e só reclama quando o programa já está rodando, às vezes em produção. O TypeScript resolve isso colocando um sistema de tipos por cima, que revisa o seu código antes de ele executar. Neste módulo você aprende o suficiente da linguagem para ler e escrever código TypeScript real." },

    { tipo: "h", texto: "JavaScript, TypeScript e Node: quem é quem" },
    { tipo: "tabela", cabecalho: ["Peça", "O que é", "Onde roda"], linhas: [
      ["JavaScript", "A linguagem de programação em si.", "Em qualquer lugar que tenha um motor de JavaScript."],
      ["Node.js", "Um ambiente que executa JavaScript fora do navegador, usando o motor V8.", "No seu computador e em servidores."],
      ["TypeScript", "JavaScript mais um sistema de tipos. Todo JavaScript válido já é TypeScript válido.", "Precisa ser conferido pelo compilador (tsc) e depois executado como JavaScript."],
    ] },
    { tipo: "p", texto: "O ponto mais importante para entender: os tipos do TypeScript existem apenas durante o desenvolvimento. Quando o código vai rodar, as anotações de tipo são removidas e o que executa é JavaScript comum. Por isso, um valor que chega de fora (de uma API, de um arquivo, do usuário) não é verificado pelos tipos: você precisa validá-lo em tempo de execução." },
    { tipo: "p", texto: "Existem duas tarefas separadas, e vale não confundi-las:" },
    { tipo: "numerada", itens: [
      "Conferir os tipos: o compilador tsc lê o código e aponta os erros, sem rodar nada. Isso é o que protege você. O comando é npx tsc --noEmit.",
      "Executar: o Node roda o programa. A partir do Node 22.18, ele consegue executar um arquivo .ts diretamente, simplesmente apagando os tipos (type stripping), com o comando node arquivo.ts. Mas ele não confere os tipos.",
    ] },
    { tipo: "alerta", titulo: "Rodar não é o mesmo que estar certo", texto: "Um arquivo com erros de tipo ainda executa no Node, porque ele só remove as anotações. Quem avisa dos erros é o tsc (e o seu editor). Em um projeto de verdade, o tsc roda sempre na integração contínua: código com erro de tipo não entra." },

    { tipo: "h", texto: "Tipos básicos" },
    { tipo: "p", texto: "O JavaScript tem poucos tipos básicos, e o TypeScript dá nome a cada um. Repare, logo de início, em uma diferença grande para o Java: existe um único tipo para números, o number, que é sempre um decimal de 64 bits (padrão IEEE 754)." },
    { tipo: "codigo", linguagem: "typescript", legenda: "Tipos.ts", texto: `const nome: string = "Ana";
let idade: number = 30;
const ativo: boolean = true;
const nada: null = null;
const indefinido: undefined = undefined;
const grande: bigint = 9007199254740993n;

console.log(typeof nome, typeof idade, typeof ativo, typeof nada, typeof indefinido, typeof grande);
console.log(0.1 + 0.2, 0.1 + 0.2 === 0.3);
console.log(Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER + 2);
console.log(7 / 2, Math.trunc(7 / 2), 7 % 2);
idade = idade + 1;
console.log(idade, grande + 1n);` },
    { tipo: "codigo", linguagem: "text", legenda: "Saída", texto: `string number boolean object undefined bigint
0.30000000000000004 false
9007199254740991 9007199254740992
3.5 3 1
31 9007199254740994n` },
    { tipo: "lista", itens: [
      "typeof null é \"object\": um erro histórico da linguagem, mantido para não quebrar sites antigos. Para testar se algo é nulo, compare com null diretamente.",
      "0.1 + 0.2 não é 0.3, pelo mesmo motivo de qualquer linguagem com decimais binários. Para dinheiro, use inteiros em centavos.",
      "Os números inteiros são exatos só até Number.MAX_SAFE_INTEGER (cerca de 9 quatrilhões). Acima disso, 9007199254740991 + 2 dá 9007199254740992: perdeu-se um. Para inteiros enormes, use bigint (com o sufixo n), que não tem limite, mas não se mistura com number.",
      "A divisão de dois números é sempre decimal: 7 / 2 vale 3,5. Para a divisão inteira, use Math.trunc(7 / 2) ou Math.floor, conforme o tratamento de negativos.",
      "null e undefined são tipos diferentes. Por convenção, undefined significa \"ainda não foi definido\" (uma variável sem valor, uma propriedade que não existe) e null significa \"está vazio de propósito\".",
    ] },

    { tipo: "h", texto: "Inferência, any e unknown" },
    { tipo: "p", texto: "Você não precisa escrever o tipo de tudo. Quando há um valor inicial, o compilador infere o tipo sozinho: const total = 10 já é um number, e uma anotação ali seria só ruído. A prática comum é anotar nas fronteiras (os parâmetros e o retorno das funções, os dados que vêm de fora) e deixar o compilador inferir o miolo." },
    { tipo: "p", texto: "Dois tipos especiais merecem atenção:" },
    { tipo: "lista", itens: [
      "any desliga a checagem: o compilador aceita qualquer uso. Ele se espalha, porque um any contamina tudo o que o toca, e anula a razão de usar TypeScript. Evite.",
      "unknown significa \"não sei o tipo\", mas obriga você a verificar antes de usar. É a escolha certa para dados que chegam de fora, como o resultado de JSON.parse.",
    ] },
    { tipo: "h3", texto: "O compilador em ação" },
    { tipo: "p", texto: "Esses são os erros mais frequentes que o compilador evita. Cada um aparece, no JavaScript puro, apenas durante a execução:" },
    { tipo: "codigo", linguagem: "typescript", legenda: "Atribuicao.erro.ts", texto: `let idade: number = 30;
idade = "trinta";` },
    { tipo: "codigo", linguagem: "text", legenda: "Erro do compilador", texto: `Type 'string' is not assignable to type 'number'.` },
    { tipo: "codigo", linguagem: "typescript", legenda: "Propriedade.erro.ts", texto: `const usuario = { nome: "Ana" };
console.log(usuario.nme);` },
    { tipo: "codigo", linguagem: "text", legenda: "Erro do compilador", texto: `Property 'nme' does not exist on type '{ nome: string; }'. Did you mean 'nome'?` },
    { tipo: "codigo", linguagem: "typescript", legenda: "Argumento.erro.ts", texto: `function dividir(a: number, b: number): number {
  return a / b;
}
dividir(10, "2");` },
    { tipo: "codigo", linguagem: "text", legenda: "Erro do compilador", texto: `Argument of type 'string' is not assignable to parameter of type 'number'.` },
    { tipo: "p", texto: "Em JavaScript, o primeiro erro só aparece quando alguém usa a idade como número, o segundo devolve undefined sem avisar (um erro de digitação que vira um bug silencioso), e o terceiro faz 10 / \"2\" dar 5 por conversão automática, escondendo uma entrada errada. O TypeScript pega os três antes de rodar." },

    { tipo: "h", texto: "Igualdade e valores falsos: as armadilhas do JavaScript" },
    { tipo: "p", texto: "O JavaScript tem duas formas de igualdade. A frouxa (==) converte os tipos antes de comparar, com regras difíceis de decorar, e a estrita (===) só considera iguais valores do mesmo tipo e do mesmo conteúdo. A regra de ouro: sempre use === e !==." },
    { tipo: "codigo", linguagem: "typescript", legenda: "Igualdade.ts", texto: `const zero: unknown = 0;
const textoZero: unknown = "0";
console.log(zero == textoZero, zero === textoZero);

const nada: unknown = null;
const vazio: unknown = undefined;
console.log(nada == vazio, nada === vazio);

console.log("5" + 3, Number("5") - 3, 5 + Number("3"));

const valores: unknown[] = [0, "", "0", [], {}, null, undefined, NaN, -1];
for (const valor of valores) {
  console.log(JSON.stringify(valor) ?? String(valor), Boolean(valor));
}

const quantidade: number | undefined = 0;
console.log(quantidade || 10);
console.log(quantidade ?? 10);

const n = Number("abc");
console.log(n, n === n, Number.isNaN(n));` },
    { tipo: "codigo", linguagem: "text", legenda: "Saída", texto: `true false
true false
53 2 8
0 false
"" false
"0" true
[] true
{} true
null false
undefined false
null false
-1 true
10
0
NaN false true` },
    { tipo: "p", texto: "Leitura do resultado:" },
    { tipo: "lista", itens: [
      "0 == \"0\" é true, mas 0 === \"0\" é false. A igualdade frouxa mistura tipos. (Aliás, o TypeScript nem deixa você comparar um number com uma string diretamente: por isso o exemplo usa unknown.)",
      "\"5\" + 3 vale \"53\": quando um dos lados é texto, o + concatena. Para somar, converta antes com Number(...). Já \"5\" - 3 funcionaria em JavaScript e daria 2, porque o - só existe para números. O TypeScript recusa essa conta, e isso é uma proteção, não um incômodo.",
      "São falsos (falsy) exatamente: false, 0, -0, 0n, \"\" (texto vazio), null, undefined e NaN. Todo o resto é verdadeiro, inclusive \"0\", [] (lista vazia) e {} (objeto vazio).",
      "NaN (not a number) é o único valor diferente de si mesmo: n === n dá false. Para testá-lo, use Number.isNaN.",
    ] },
    { tipo: "h3", texto: "|| ou ??" },
    { tipo: "p", texto: "Para dar um valor padrão, o operador || devolve o lado direito sempre que o esquerdo for falso, e isso inclui 0 e o texto vazio, que muitas vezes são valores legítimos. O operador ?? (coalescência nula) só devolve o lado direito se o esquerdo for null ou undefined. No exemplo, uma quantidade 0 virou 10 com ||, o que seria um bug, e continuou 0 com ??." },
    { tipo: "alerta", titulo: "Regra prática", texto: "Use ?? para valores padrão, a menos que você queira de fato tratar 0, texto vazio e false como ausência. Esse é um dos bugs mais comuns em código JavaScript: um desconto de 0%, um contador em 0 ou um nome vazio sendo trocados sem querer." },

    { tipo: "h", texto: "Funções" },
    { tipo: "p", texto: "Em JavaScript, funções são valores como quaisquer outros: podem ser guardadas em variáveis, passadas como argumento e devolvidas por outras funções. É a base de quase tudo o que você verá em Node." },
    { tipo: "codigo", linguagem: "typescript", legenda: "Funcoes.ts", texto: `function saudar(nome: string, titulo = "Sr(a)."): string {
  return \`\${titulo} \${nome}\`;
}

const dobro = (n: number): number => n * 2;

function somarTudo(...numeros: number[]): number {
  return numeros.reduce((soma, n) => soma + n, 0);
}

function criarContador(inicio = 0) {
  let valor = inicio;
  return {
    incrementar: () => ++valor,
    atual: () => valor,
  };
}

console.log(saudar("Ana"));
console.log(saudar("Ana", "Dra."));
console.log(dobro(4), somarTudo(1, 2, 3, 4));

const contador = criarContador(10);
contador.incrementar();
contador.incrementar();
console.log(contador.atual());

const idades = [31, 25, 42, 19, 37];
const maiores = idades.filter((i) => i >= 30);
const dobradas = idades.map(dobro);
const total = idades.reduce((soma, i) => soma + i, 0);
console.log(maiores, dobradas, total);
console.log(idades.find((i) => i > 40), idades.some((i) => i < 20), idades.every((i) => i > 20));` },
    { tipo: "codigo", linguagem: "text", legenda: "Saída", texto: `Sr(a). Ana
Dra. Ana
8 10
12
[ 31, 42, 37 ] [ 62, 50, 84, 38, 74 ] 154
42 true false` },
    { tipo: "lista", itens: [
      "Parâmetro com valor padrão (titulo = \"Sr(a).\") é opcional para quem chama, e o tipo é inferido.",
      "A seta (=>) é a forma curta de escrever uma função. Quando o corpo é uma expressão só, o retorno é implícito.",
      "O resto (...numeros) reúne os argumentos restantes em um array.",
      "Closure: criarContador devolve funções que \"lembram\" a variável valor, mesmo depois de criarContador ter terminado. O valor fica privado: ninguém de fora consegue mexer nele, só por incrementar e atual.",
      "map transforma cada elemento, filter fica com os que passam em um teste, reduce junta tudo em um valor, e find, some e every respondem a perguntas sobre a lista. Elas não alteram o array original: devolvem um novo.",
      "Os textos entre crases (template literals) aceitam expressões dentro de ${ }, o que é muito mais legível do que concatenar com +.",
    ] },

    { tipo: "h", texto: "Objetos, interfaces e tipos" },
    { tipo: "p", texto: "A maior parte dos dados em JavaScript são objetos: conjuntos de pares nome-valor. O TypeScript permite descrever a forma de um objeto com uma interface ou com um type. Para objetos, as duas servem; a diferença prática aparece em casos avançados, e o mais comum é usar interface para objetos e type para uniões e apelidos." },
    { tipo: "codigo", linguagem: "typescript", legenda: "Objetos.ts", texto: `interface Endereco {
  cidade: string;
  cep?: string;
}

interface Usuario {
  readonly id: number;
  nome: string;
  endereco?: Endereco;
}

type Status = "ativo" | "inativo" | "bloqueado";

type Resultado =
  | { tipo: "ok"; valor: number }
  | { tipo: "erro"; mensagem: string };

function descrever(resultado: Resultado): string {
  switch (resultado.tipo) {
    case "ok":
      return \`deu certo: \${resultado.valor}\`;
    case "erro":
      return \`falhou: \${resultado.mensagem}\`;
  }
}

function tamanho(valor: string | string[]): number {
  if (typeof valor === "string") {
    return valor.length;
  }
  return valor.length;
}

const ana: Usuario = { id: 1, nome: "Ana", endereco: { cidade: "Recife" } };
const bia: Usuario = { id: 2, nome: "Bia" };

console.log(ana.endereco?.cidade, bia.endereco?.cidade);
console.log(bia.endereco?.cidade ?? "cidade não informada");

const status: Status = "ativo";
console.log(status);
console.log(descrever({ tipo: "ok", valor: 42 }));
console.log(descrever({ tipo: "erro", mensagem: "sem rede" }));
console.log(tamanho("koda"), tamanho(["a", "b", "c"]));

const { nome, ...resto } = ana;
console.log(nome, resto);
const copia = { ...ana, nome: "Ana Maria" };
console.log(copia.nome, ana.nome);

function primeiro<T>(itens: T[]): T | undefined {
  return itens[0];
}
console.log(primeiro([10, 20]), primeiro(["x"]), primeiro([]));

const desconhecido: unknown = JSON.parse('{"a": 1}');
if (typeof desconhecido === "object" && desconhecido !== null && "a" in desconhecido) {
  console.log("tem a:", (desconhecido as { a: number }).a);
}` },
    { tipo: "codigo", linguagem: "text", legenda: "Saída", texto: `Recife undefined
cidade não informada
ativo
deu certo: 42
falhou: sem rede
4 3
Ana { id: 1, endereco: { cidade: 'Recife' } }
Ana Maria Ana
10 x undefined
tem a: 1` },
    { tipo: "h3", texto: "O que cada parte faz" },
    { tipo: "lista", itens: [
      "Propriedade opcional (cep?, endereco?): pode estar ausente, e o seu tipo vira \"o tipo ou undefined\". O compilador te obriga a tratar essa possibilidade.",
      "readonly: a propriedade não pode ser reatribuída depois de criada.",
      "Tipo literal e união (\"ativo\" | \"inativo\" | \"bloqueado\"): em vez de um string qualquer, só esses três valores são aceitos. Escrever \"ativoo\" vira um erro de compilação.",
      "União discriminada (Resultado): cada variante tem um campo, aqui tipo, que diz qual é. Dentro do switch, o compilador sabe, para cada case, exatamente quais campos existem: em \"ok\" há valor; em \"erro\", há mensagem. É a forma mais segura de modelar estados diferentes.",
      "Narrowing (estreitamento): depois de typeof valor === \"string\", o compilador trata valor como string dentro do if, e como array fora dele.",
      "Encadeamento opcional (?.): se endereco for undefined, a expressão inteira vira undefined em vez de lançar um erro. Combinado com ??, dá um valor padrão em uma linha.",
      "Desestruturação e spread: { nome, ...resto } separa uma propriedade e junta o restante; { ...ana, nome: \"...\" } cria uma cópia com uma propriedade trocada, sem alterar o original.",
      "Genéricos (<T>): primeiro funciona para um array de qualquer tipo e devolve o mesmo tipo. Quem chama com números recebe number | undefined.",
      "unknown e a verificação manual: o resultado de JSON.parse é desconhecido. Só depois de conferir que é um objeto com a propriedade a o código a usa. Em projetos reais, essa checagem é feita por uma biblioteca de validação (como Zod), assunto de um módulo à frente.",
    ] },
    { tipo: "h3", texto: "O compilador não deixa passar o que pode ser undefined" },
    { tipo: "codigo", linguagem: "typescript", legenda: "Opcional.erro.ts", texto: `interface Usuario {
  nome: string;
  endereco?: { cidade: string };
}
const ana: Usuario = { nome: "Ana" };
console.log(ana.endereco.cidade);` },
    { tipo: "codigo", linguagem: "text", legenda: "Erro do compilador", texto: `'ana.endereco' is possibly 'undefined'.` },
    { tipo: "p", texto: "É exatamente o erro que, em JavaScript puro, aparece como \"Cannot read properties of undefined\" em produção. Aqui ele aparece no editor, enquanto você escreve." },
    { tipo: "codigo", linguagem: "typescript", legenda: "Estreitamento.erro.ts", texto: `function tamanhoEmMaiusculas(valor: string | number) {
  return valor.toUpperCase();
}` },
    { tipo: "codigo", linguagem: "text", legenda: "Erro do compilador", texto: `Property 'toUpperCase' does not exist on type 'string | number'.` },

    { tipo: "h", texto: "Módulos: dividindo o código em arquivos" },
    { tipo: "p", texto: "Em projetos reais, o código é dividido em arquivos, e cada arquivo é um módulo: o que não for exportado fica privado." },
    { tipo: "codigo", linguagem: "typescript", legenda: "calculos.ts (trecho)", texto: `export function dobro(n: number): number {
  return n * 2;
}

export const TAXA = 0.05;

export type Moeda = "BRL" | "USD";` },
    { tipo: "codigo", linguagem: "typescript", legenda: "principal.ts (trecho)", texto: `import { dobro, TAXA } from "./calculos.ts";
import type { Moeda } from "./calculos.ts";

const moeda: Moeda = "BRL";
console.log(dobro(21), TAXA, moeda);` },
    { tipo: "p", texto: "O import type deixa claro que aquele nome só existe para a checagem de tipos e some na execução. Isso importa, inclusive, para o Node, que apaga os tipos sem analisá-los: ele precisa saber que um import é só de tipo para removê-lo por inteiro." },

    { tipo: "h", texto: "Configurando um projeto: o modo estrito" },
    { tipo: "p", texto: "O tsc é configurado por um arquivo tsconfig.json. A opção mais importante é strict, que liga um conjunto de verificações (as de null e undefined, as de any implícito e outras). Um projeto novo deve nascer com ela ligada:" },
    { tipo: "codigo", linguagem: "json", legenda: "tsconfig.json", texto: `{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noEmit": true,
    "skipLibCheck": true
  }
}` },
    { tipo: "lista", itens: [
      "strict: liga as verificações que realmente protegem. Ligar depois de o projeto crescer é doloroso, então comece com ela.",
      "noUncheckedIndexedAccess: faz itens[0] ter o tipo \"T ou undefined\", o que reflete a realidade (a lista pode estar vazia).",
      "noEmit: o tsc só confere, sem gerar arquivos. Em projetos em que o Node executa o TypeScript direto, é o que se quer.",
    ] },

    { tipo: "h", texto: "Os erros mais comuns de quem está começando" },
    { tipo: "tabela", cabecalho: ["Erro", "Por que é um problema", "O que fazer"], linhas: [
      ["Usar any para fazer o erro sumir", "Desliga a proteção, e o erro volta em produção.", "Usar o tipo certo, unknown ou estreitar."],
      ["Usar == em vez de ===", "Conversões automáticas escondem entradas erradas.", "Sempre === e !==."],
      ["Usar || para valor padrão", "Troca 0, \"\" e false por engano.", "Usar ??."],
      ["Achar que os tipos protegem dados de fora", "Os tipos somem na execução; JSON, APIs e formulários chegam sem garantia.", "Validar em tempo de execução."],
      ["Alterar um array enquanto percorre", "Pula elementos ou entra em laço sem fim.", "Criar um novo com map e filter."],
      ["Esquecer que objetos são referências", "const outra = ana não copia nada; alterar uma muda a outra.", "Copiar com spread: { ...ana }."],
      ["Ignorar o erro do editor", "Ele costuma estar certo.", "Ler a mensagem inteira: ela diz o que o tipo esperava e o que recebeu."],
    ] },
  ],
  questoes: [
    {
      enunciado: "O que acontece com as anotações de tipo do TypeScript quando o programa executa no Node?",
      opcoes: ["Elas são verificadas a cada linha, e um erro de tipo interrompe o programa", "Elas são removidas: só o JavaScript executa", "Elas viram código de máquina mais rápido", "Elas ficam guardadas para proteger dados vindos de APIs"],
      correta: 1,
      explicacao: "Os tipos existem só durante o desenvolvimento. O Node apaga as anotações (type stripping) e executa o JavaScript restante, sem conferir nada. Por isso um dado que vem de fora, como um JSON, não é protegido pelos tipos e precisa ser validado em tempo de execução.",
    },
    {
      enunciado: "Qual comando confere os tipos de um projeto TypeScript sem executar nada?",
      opcoes: ["node arquivo.ts", "npx tsc --noEmit", "npm start", "npx tsc --run"],
      correta: 1,
      explicacao: "O tsc é o compilador/verificador de tipos, e --noEmit faz com que ele apenas confira, sem gerar arquivos. O node arquivo.ts executa o programa, mas não confere os tipos.",
    },
    {
      enunciado: "Qual é o resultado de console.log(\"5\" + 3)?",
      opcoes: ["8", "53", "NaN", "Erro de execução"],
      correta: 1,
      explicacao: "Quando um dos operandos do + é um texto, o operador concatena: \"5\" + 3 vale \"53\". Para somar, é preciso converter antes, com Number(\"5\") + 3.",
    },
    {
      enunciado: "Uma variável quantidade tem o valor 0. Qual expressão devolve 0, em vez de um valor padrão de 10?",
      opcoes: ["quantidade || 10", "quantidade ?? 10", "quantidade && 10", "Nenhuma das anteriores"],
      correta: 1,
      explicacao: "O operador ?? só usa o valor padrão quando o lado esquerdo é null ou undefined, então 0 é mantido. O || troca qualquer valor falso (0, texto vazio, false) pelo padrão, e o && devolve o lado direito quando o esquerdo é verdadeiro e o esquerdo quando é falso: 0 && 10 também dá 0, mas por outro motivo e com outra intenção.",
    },
    {
      enunciado: "Qual destes valores é verdadeiro (truthy) em uma condição?",
      opcoes: ["0", "\"\" (texto vazio)", "\"0\" (o texto com o caractere zero)", "NaN"],
      correta: 2,
      explicacao: "São falsos: false, 0, -0, 0n, \"\", null, undefined e NaN. Qualquer outro valor é verdadeiro, inclusive o texto \"0\", uma lista vazia [] e um objeto vazio {}.",
    },
    {
      enunciado: "Por que unknown é preferível a any para o resultado de JSON.parse?",
      opcoes: ["Porque unknown é mais rápido", "Porque unknown obriga a verificar o tipo antes de usar o valor, e any desliga a checagem", "Porque any não existe em TypeScript moderno", "Porque unknown converte o valor automaticamente"],
      correta: 1,
      explicacao: "Com any, o compilador aceita qualquer uso e o erro só aparece na execução. Com unknown, é preciso estreitar o tipo (por exemplo, com typeof e verificações de propriedades) antes de usar o valor, o que evita bugs.",
    },
    {
      enunciado: "Em type Resultado = { tipo: \"ok\"; valor: number } | { tipo: \"erro\"; mensagem: string }, dentro de um case \"erro\" de um switch sobre resultado.tipo, o que o compilador permite acessar?",
      opcoes: ["Apenas resultado.tipo", "resultado.mensagem", "resultado.valor e resultado.mensagem", "Nada: é preciso usar uma conversão de tipo"],
      correta: 1,
      explicacao: "É uma união discriminada: o campo tipo diz qual variante é. Dentro do case \"erro\", o compilador estreita o tipo para a variante de erro e permite resultado.mensagem. O valor só existe na variante \"ok\".",
    },
    {
      enunciado: "O que significa a expressão usuario.endereco?.cidade?",
      opcoes: ["Lança um erro se endereco for undefined", "Devolve undefined se endereco for undefined, sem lançar erro", "Define a cidade como padrão", "Converte endereco para texto"],
      correta: 1,
      explicacao: "O encadeamento opcional (?.) interrompe a expressão e devolve undefined quando o valor à esquerda é null ou undefined. Sem ele, acessar .cidade em undefined lançaria um erro de execução.",
    },
  ],
  desafio: {
    titulo: "Catálogo de produtos tipado",
    enunciado: "Escreva um programa TypeScript de um arquivo só (catalogo.ts) que gerencia um pequeno catálogo de produtos, usando o sistema de tipos para impedir dados inválidos. O programa precisa passar no tsc com strict ligado e rodar com node catalogo.ts.",
    requisitos: [
      "Defina uma interface Produto com id (somente leitura), nome, preço em centavos (number) e uma categoria que só aceite três valores literais de sua escolha.",
      "Defina uma propriedade opcional desconto (em porcentagem) e uma função precoFinal(produto) que aplique o desconto quando existir, usando ?? para o valor padrão.",
      "Crie uma função buscarPorId que devolve o produto ou undefined, e trate o resultado nos dois casos antes de usá-lo.",
      "Modele o resultado de uma compra como uma união discriminada (sucesso com o total, ou falha com o motivo) e escreva uma função que descreve cada caso com um switch.",
      "Use map, filter e reduce para calcular o total do carrinho e a lista dos produtos de uma categoria.",
    ],
    criterios: [
      "npx tsc --noEmit --strict catalogo.ts termina sem nenhum erro.",
      "Não há nenhum any no código.",
      "Um produto com categoria inválida é recusado pelo compilador (teste e mostre o erro).",
      "Um desconto de 0 é respeitado e não é trocado por um valor padrão.",
      "Você consegue explicar por que o programa roda mesmo se houver um erro de tipo, e por que isso não é uma boa razão para ignorá-lo.",
    ],
    dica: "Trabalhe com os preços em centavos (inteiros) e converta para reais só na hora de exibir. Dica extra: escreva primeiro os tipos e só depois as funções. Se os tipos estiverem bons, o compilador guia o resto.",
  },
  referencias: [
    { titulo: "TypeScript Handbook (documentação oficial, em inglês)", url: "https://www.typescriptlang.org/docs/handbook/intro.html" },
    { titulo: "MDN: Guia de JavaScript", url: "https://developer.mozilla.org/pt-BR/docs/Web/JavaScript/Guide" },
    { titulo: "Node.js: executando TypeScript nativamente (em inglês)", url: "https://nodejs.org/en/learn/typescript/run-natively" },
  ],
};
