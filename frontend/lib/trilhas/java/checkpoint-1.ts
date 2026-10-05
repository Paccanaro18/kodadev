import type { Checkpoint } from "../tipos";

export const JAVA_CHECKPOINT_1: Checkpoint = {
  tipo: "checkpoint",
  slug: "checkpoint-fundamentos",
  titulo: "Checkpoint: fundamentos da linguagem",
  resumo: "Nove questões sobre tipos, operadores, Strings, métodos e arrays. Mostra o que já está firme e o que vale revisar.",
  cobre: ["primeiros-passos", "fluxo-metodos-e-arrays"],
  notaMinima: 0.7,
  questoes: [
    {
      enunciado: "Qual ferramenta do JDK traduz o código-fonte (.java) para bytecode (.class)?",
      opcoes: ["java", "javac", "jar", "jshell"],
      correta: 1,
      explicacao: "O javac é o compilador. O comando java inicia a JVM para executar o bytecode, o jar empacota arquivos e o jshell é um ambiente interativo de experimentação.",
    },
    {
      enunciado: "O que imprime System.out.println('a' + 1); ?",
      opcoes: ["a1", "b", "98", "Erro de compilação"],
      correta: 2,
      explicacao: "O char 'a' vale 97 e, em uma soma com um int, vira número: 97 + 1 = 98, e o resultado é um int. Para obter o caractere 'b', seria preciso um cast: (char) ('a' + 1).",
    },
    {
      enunciado: "O que imprime o código abaixo?\n\nString s = \"x\";\nString t = s + 1 + 2;\nSystem.out.println(t);",
      opcoes: ["x3", "x12", "3x", "Erro de compilação"],
      correta: 1,
      explicacao: "A expressão é avaliada da esquerda para a direita. s + 1 vira a String \"x1\", e depois + 2 concatena \"2\", resultando em \"x12\". Não há soma numérica, porque o primeiro operando já é um texto.",
    },
    {
      enunciado: "Qual é o valor de d depois de double d = 10 / 4; ?",
      opcoes: ["2.5", "2.0", "2", "3.0"],
      correta: 1,
      explicacao: "A divisão 10 / 4 acontece entre dois inteiros, então o resultado é 2 (a parte decimal é descartada). Só depois esse 2 é convertido para double, dando 2.0. Para obter 2.5, um dos lados precisa ser decimal: 10 / 4.0.",
    },
    {
      enunciado: "Qual das declarações abaixo compila sem erro?",
      opcoes: ["int x = 3.5;", "float f = 1.5;", "byte b = 200;", "long y = 10;"],
      correta: 3,
      explicacao: "Atribuir um int a um long é um alargamento e é feito automaticamente. As outras falham: 3.5 é double e não cabe em int sem cast; 1.5 é double e exigiria o sufixo f (1.5f); e 200 está fora do intervalo de um byte (-128 a 127).",
    },
    {
      enunciado: "Quantas vezes o corpo do laço abaixo é executado?\n\nfor (int i = 0; i < 5; i += 2) {\n    ...\n}",
      opcoes: ["2", "3", "5", "6"],
      correta: 1,
      explicacao: "Os valores de i são 0, 2 e 4. Quando i vira 6, a condição i < 5 falha. Portanto o corpo executa 3 vezes. Acompanhar os valores um a um, em vez de adivinhar, é a melhor forma de evitar erros por um.",
    },
    {
      enunciado: "O que imprime o código abaixo?\n\nstatic void m(String s) { s = \"b\"; }\n// ...\nString a = \"a\";\nm(a);\nSystem.out.println(a);",
      opcoes: ["a", "b", "null", "Erro de compilação"],
      correta: 0,
      explicacao: "Java passa os argumentos por valor. O método recebe uma cópia da referência e, ao atribuir \"b\" ao parâmetro, apenas reaponta a cópia. A variável a, em quem chamou, continua apontando para \"a\".",
    },
    {
      enunciado: "Qual é o conteúdo de new boolean[2] logo depois de criado?",
      opcoes: ["[true, true]", "[false, false]", "[null, null]", "[0, 0]"],
      correta: 1,
      explicacao: "Os elementos de um array recebem o valor padrão do tipo: false para boolean, 0 para tipos numéricos e null para objetos.",
    },
    {
      enunciado: "O que acontece ao executar int[] v = new int[3]; v[3] = 1; ?",
      opcoes: ["Erro de compilação", "O array cresce para 4 elementos", "Lança ArrayIndexOutOfBoundsException em tempo de execução", "O valor é ignorado em silêncio"],
      correta: 2,
      explicacao: "Os índices válidos vão de 0 a 2. O compilador não verifica o valor do índice, então o programa compila, mas falha na execução com ArrayIndexOutOfBoundsException. Arrays têm tamanho fixo e nunca crescem sozinhos.",
    },
  ],
};
