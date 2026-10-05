import type { Checkpoint } from "../tipos";

export const PY_CHECKPOINT_1: Checkpoint = {
  tipo: "checkpoint",
  slug: "checkpoint-fundamentos",
  titulo: "Checkpoint: fundamentos de Python e objetos",
  resumo: "Nove questões sobre tipos, estruturas de dados, funções, classes e exceções. Mostra o que já está firme e o que vale revisar.",
  cobre: ["fundamentos-da-linguagem", "objetos-excecoes-e-modulos"],
  notaMinima: 0.7,
  questoes: [
    {
      enunciado: "O que imprime print(-10 // 3)?",
      opcoes: ["-3", "-4", "-3.33", "3"],
      correta: 1,
      explicacao: "A divisão inteira (//) arredonda para baixo, em direção ao menos infinito: o piso de -3,33 é -4. Por isso -10 // 3 vale -4, e não -3, como em linguagens que truncam em direção a zero.",
    },
    {
      enunciado: "Qual destes valores é verdadeiro quando usado em uma condição (bool(valor))?",
      opcoes: ["[] (lista vazia)", "\"\" (texto vazio)", "\"False\" (texto com a palavra False)", "None"],
      correta: 2,
      explicacao: "Qualquer texto não vazio é verdadeiro, inclusive \"False\" e \"0\". São falsos: False, None, 0, 0.0, texto vazio e coleções vazias.",
    },
    {
      enunciado: "O que acontece ao executar t = (1, 2); t[0] = 5?",
      opcoes: ["t passa a ser (5, 2)", "Lança TypeError, porque tuplas são imutáveis", "t passa a ser (5,)", "Nada acontece"],
      correta: 1,
      explicacao: "Tuplas não aceitam atribuição por índice: são imutáveis. Para obter uma tupla diferente, é preciso criar uma nova, por exemplo (5,) + t[1:].",
    },
    {
      enunciado: "O que imprime o código abaixo?\n\ndef f(x, acc=[]):\n    acc.append(x)\n    return acc\n\nf(1)\nprint(f(2))",
      opcoes: ["[2]", "[1, 2]", "[1]", "Erro"],
      correta: 1,
      explicacao: "O valor padrão de um argumento é criado uma única vez, na definição da função. A primeira chamada colocou o 1 na lista, e a segunda reaproveitou a mesma lista. A forma correta é usar acc=None e criar a lista dentro da função.",
    },
    {
      enunciado: "Qual é a diferença entre sorted(lista) e lista.sort()?",
      opcoes: ["Nenhuma: são idênticos", "sorted devolve uma nova lista ordenada; sort ordena a própria lista e devolve None", "sorted altera a lista original; sort cria uma cópia", "sort só funciona com números"],
      correta: 1,
      explicacao: "sorted não modifica o original e devolve uma lista nova. O método sort ordena no lugar e devolve None, então escrever x = lista.sort() deixa x como None. Um erro muito comum.",
    },
    {
      enunciado: "Em class A: x = [] seguido de a1 = A(); a2 = A(); a1.x.append(1), o que vale a2.x?",
      opcoes: ["[]", "[1]", "None", "Erro"],
      correta: 1,
      explicacao: "x é um atributo de classe: existe uma única lista, compartilhada por todas as instâncias. Para ter uma lista por objeto, crie-a no __init__: self.x = [].",
    },
    {
      enunciado: "Qual é a forma correta de herdar de Conta e inicializar a parte da mãe?",
      opcoes: ["class Poupanca(Conta): ... super().__init__(titular)", "class Poupanca extends Conta: ... super(titular)", "class Poupanca: ... Conta.init(titular)", "class Poupanca(Conta): ... self.super(titular)"],
      correta: 0,
      explicacao: "A herança é declarada entre parênteses depois do nome da classe, e super().__init__(...) chama o inicializador da mãe. As outras formas não são sintaxe válida de Python.",
    },
    {
      enunciado: "Qual das opções captura corretamente tanto um ValueError quanto um TypeError no mesmo bloco?",
      opcoes: ["except ValueError, TypeError:", "except (ValueError, TypeError):", "except ValueError or TypeError:", "except [ValueError, TypeError]:"],
      correta: 1,
      explicacao: "Para capturar mais de um tipo no mesmo except, passe uma tupla de tipos entre parênteses. O \"or\" avaliaria como um único valor, e a forma com vírgula sem parênteses não é a sintaxe atual.",
    },
    {
      enunciado: "Por que se recomenda abrir arquivos com with open(...) as f:?",
      opcoes: ["Porque é mais rápido que open() comum", "Porque o arquivo é fechado automaticamente ao sair do bloco, mesmo se houver erro", "Porque permite abrir vários arquivos ao mesmo tempo", "Porque dispensa tratar erros de arquivo inexistente"],
      correta: 1,
      explicacao: "O with usa um gerenciador de contexto que garante o fechamento do recurso ao sair do bloco, inclusive diante de uma exceção. O tratamento de um arquivo inexistente continua sendo necessário.",
    },
  ],
};
