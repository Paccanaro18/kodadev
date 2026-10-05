import type { Checkpoint } from "../tipos";

export const TS_CHECKPOINT_1: Checkpoint = {
  tipo: "checkpoint",
  slug: "checkpoint-fundamentos",
  titulo: "Checkpoint: TypeScript e assíncrono",
  resumo: "Nove questões sobre tipos, igualdade, objetos e o event loop. Mostra o que já está firme e o que vale revisar.",
  cobre: ["tipos-funcoes-e-objetos", "assincrono-em-node"],
  notaMinima: 0.7,
  questoes: [
    {
      enunciado: "Qual é o resultado de typeof null em JavaScript?",
      opcoes: ["\"null\"", "\"undefined\"", "\"object\"", "\"boolean\""],
      correta: 2,
      explicacao: "É um erro histórico da linguagem, mantido por compatibilidade: typeof null devolve \"object\". Para saber se um valor é nulo, compare diretamente: valor === null.",
    },
    {
      enunciado: "Qual é o valor de 0.1 + 0.2 === 0.3 em JavaScript?",
      opcoes: ["true", "false", "Erro de compilação", "undefined"],
      correta: 1,
      explicacao: "Os números são decimais de 64 bits em binário, e 0.1 + 0.2 resulta em 0.30000000000000004. Por isso a comparação é false. Para dinheiro, use inteiros em centavos.",
    },
    {
      enunciado: "Qual operador deve ser usado para fornecer um valor padrão apenas quando a variável for null ou undefined?",
      opcoes: ["||", "&&", "??", "?."],
      correta: 2,
      explicacao: "O ?? (coalescência nula) só troca null e undefined. O || troca qualquer valor falso, inclusive 0, texto vazio e false. O ?. é o encadeamento opcional, que evita erro ao acessar propriedades.",
    },
    {
      enunciado: "O que significa o tipo string | number?",
      opcoes: ["O valor é uma string e um number ao mesmo tempo", "O valor é uma string ou um number, e é preciso estreitar antes de usar métodos de apenas um dos dois", "O valor é convertido automaticamente para o tipo certo", "Equivale a any"],
      correta: 1,
      explicacao: "É uma união: o valor pode ser de qualquer um dos dois tipos. O compilador só permite usar o que existe em ambos, até você estreitar com algo como typeof valor === \"string\".",
    },
    {
      enunciado: "Por que um tipo declarado como Usuario não protege você contra um JSON malformado vindo de uma API?",
      opcoes: ["Porque o TypeScript só funciona com o navegador", "Porque os tipos desaparecem em tempo de execução e o que chega de fora não é verificado", "Porque o JSON.parse converte o valor para o tipo certo", "Porque interfaces só valem para classes"],
      correta: 1,
      explicacao: "As anotações são removidas antes de o programa rodar. Dados que vêm de fora (JSON, formulários, APIs) precisam ser validados em tempo de execução, por exemplo com uma biblioteca de validação.",
    },
    {
      enunciado: "Qual é a ordem de saída?\n\nconsole.log(\"1\");\nsetTimeout(() => console.log(\"2\"), 0);\nawait Promise.resolve();\nconsole.log(\"3\");",
      opcoes: ["1, 2, 3", "1, 3, 2", "3, 1, 2", "2, 1, 3"],
      correta: 1,
      explicacao: "O \"1\" é síncrono. O await coloca a continuação na fila de microtarefas, que roda antes de qualquer timer. Então o \"3\" sai antes do callback do setTimeout (macrotarefa): 1, 3, 2.",
    },
    {
      enunciado: "Qual abordagem executa três chamadas independentes em paralelo?",
      opcoes: ["const a = await f1(); const b = await f2(); const c = await f3();", "await Promise.all([f1(), f2(), f3()])", "f1().then(f2).then(f3)", "for (const f of [f1, f2, f3]) await f();"],
      correta: 1,
      explicacao: "Promise.all dispara as três promises ao mesmo tempo e espera todas. As demais opções executam as chamadas em sequência, somando os tempos.",
    },
    {
      enunciado: "Em um servidor Node, o que acontece durante um while com 3 segundos de cálculo na thread principal?",
      opcoes: ["As outras requisições continuam sendo atendidas normalmente", "O servidor não atende nenhuma outra requisição até o cálculo terminar", "O Node cria threads extras automaticamente", "As requisições são rejeitadas com erro 500"],
      correta: 1,
      explicacao: "A thread de JavaScript é única, e o event loop só segue adiante quando o código atual termina. Um laço longo congela o servidor inteiro. Trabalhos pesados devem ir para worker_threads ou outro serviço.",
    },
    {
      enunciado: "Qual afirmação sobre uma função declarada com async está correta?",
      opcoes: ["Ela devolve diretamente o valor do return", "Ela sempre devolve uma Promise", "Ela roda em outra thread", "Ela não pode lançar erros"],
      correta: 1,
      explicacao: "Funções async sempre devolvem uma Promise: o valor do return vira o resultado, e um erro lançado vira uma rejeição. Elas não rodam em outra thread: apenas pausam nos await sem bloquear o event loop.",
    },
  ],
};
