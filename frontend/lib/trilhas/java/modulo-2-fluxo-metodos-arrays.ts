import type { Modulo } from "../tipos";

export const JAVA_MODULO_2: Modulo = {
  tipo: "modulo",
  slug: "fluxo-metodos-e-arrays",
  titulo: "Controle de fluxo, métodos e arrays",
  resumo: "Decisões, laços, métodos com sobrecarga e recursão, e arrays: tudo o que falta para escrever programas de verdade.",
  nivel: "Iniciante",
  leitura: "40 min",
  objetivos: [
    "Escolher entre if, switch e os diferentes laços conforme o problema.",
    "Dividir um programa em métodos pequenos, com parâmetros e retorno bem definidos.",
    "Explicar por que Java sempre passa argumentos por valor, inclusive para objetos e arrays.",
    "Criar, percorrer, copiar e ordenar arrays, e evitar o erro de índice fora dos limites.",
    "Escrever uma função recursiva identificando o caso base.",
  ],
  preRequisitos: [
    "Ter feito o módulo \"Primeiros passos\" ou conhecer tipos, variáveis e operadores em Java.",
    "Saber rodar um programa com java Arquivo.java.",
  ],
  pontosChave: [
    "if e switch decidem; for, while e do-while repetem. Escolha o laço pela pergunta que ele responde.",
    "O switch moderno (com seta) devolve um valor e não tem o problema do break esquecido.",
    "Um método bom faz uma coisa só, tem um nome que é um verbo e cabe na tela.",
    "Java passa tudo por valor. Para objetos e arrays, o que é copiado é a referência.",
    "Arrays têm tamanho fixo, índices começam em 0 e atribuir um array a outro não o copia.",
  ],
  blocos: [
    { tipo: "p", texto: "Com tipos e variáveis você consegue guardar dados. Falta o resto: tomar decisões, repetir tarefas, dar nome a pedaços de lógica e guardar vários valores de uma vez. Este módulo junta quatro ferramentas que aparecem em todo programa Java, de um script de dez linhas a um sistema bancário." },

    { tipo: "h", texto: "Decisões: if e switch" },
    { tipo: "p", texto: "O if executa um bloco se uma condição booleana for verdadeira. Com else if e else, você cobre vários casos, e o primeiro que for verdadeiro vence: os demais nem são avaliados." },
    { tipo: "p", texto: "Quando o que está sendo decidido é o valor de uma única variável, o switch costuma ser mais claro. A forma moderna, com seta (a partir do Java 14), é uma expressão: devolve um valor, aceita vários rótulos por caso e não cai de um caso no seguinte." },
    { tipo: "alerta", titulo: "O switch antigo e o break esquecido", texto: "No switch tradicional, com dois-pontos, se você esquecer o break no final de um caso, a execução continua no caso seguinte (o chamado fall-through). Foi fonte de bugs por décadas. Prefira sempre a forma com seta, que não tem esse problema." },

    { tipo: "h", texto: "Laços: repetindo tarefas" },
    { tipo: "tabela", cabecalho: ["Laço", "Quando usar", "Característica"], linhas: [
      ["for", "Você sabe quantas vezes vai repetir, ou precisa do índice.", "Inicialização, condição e passo na mesma linha."],
      ["while", "Repete enquanto uma condição for verdadeira, sem saber quantas vezes.", "Pode não executar nenhuma vez."],
      ["do-while", "Precisa executar ao menos uma vez antes de testar.", "Testa a condição no final."],
      ["for-each", "Percorrer todos os elementos de um array ou coleção.", "Sem índice, sem risco de errar o limite."],
    ] },
    { tipo: "p", texto: "Dentro de um laço, break interrompe o laço inteiro e continue pula para a próxima volta. O programa abaixo reúne decisões e laços:" },
    { tipo: "codigo", linguagem: "java", legenda: "Fluxo.java", texto: `public class Fluxo {
    public static void main(String[] args) {
        int nota = 7;
        if (nota >= 9) {
            System.out.println("A");
        } else if (nota >= 7) {
            System.out.println("B");
        } else {
            System.out.println("C");
        }

        String dia = "SAB";
        String tipo = switch (dia) {
            case "SEG", "TER", "QUA", "QUI", "SEX" -> "útil";
            case "SAB", "DOM" -> "fim de semana";
            default -> "desconhecido";
        };
        System.out.println(tipo);

        for (int i = 1; i <= 3; i++) {
            System.out.print(i + ",");
        }
        System.out.println();

        int n = 10;
        while (n > 1) {
            n /= 2;
        }
        System.out.println(n);

        int tentativas = 0;
        do {
            tentativas++;
        } while (tentativas < 3);
        System.out.println(tentativas);

        for (int i = 1; i <= 10; i++) {
            if (i % 2 == 0) continue;   // pula os pares
            if (i > 7) break;           // para de vez
            System.out.print(i + ",");
        }
        System.out.println();

        String[] nomes = {"Ana", "Bia", "Caio"};
        for (String nome : nomes) {
            System.out.print(nome.charAt(0));
        }
        System.out.println();
    }
}` },
    { tipo: "codigo", linguagem: "text", legenda: "Saída", texto: `B
fim de semana
1,2,3,
1
3
1,3,5,7,
ABC` },
    { tipo: "h3", texto: "Os erros clássicos dos laços" },
    { tipo: "lista", itens: [
      "Erro por um (off-by-one): usar <= no lugar de < (ou o contrário) e executar uma volta a mais ou a menos. Ao percorrer um array de n elementos, os índices vão de 0 a n - 1.",
      "Laço infinito: esquecer de atualizar a variável que a condição testa. O programa trava, e o único remédio é interrompê-lo.",
      "Alterar a coleção enquanto se percorre: com arrays, isso confunde o índice; com coleções, causa uma exceção. Escolha: ou percorre, ou altera.",
      "Condição que mistura tipos: for (double x = 0; x != 1.0; x += 0.1) nunca termina, porque 0.1 não é exato. Para laços com contagem, use inteiros.",
    ] },

    { tipo: "h", texto: "Métodos: dando nome à lógica" },
    { tipo: "p", texto: "Um método é um bloco de código com nome, que recebe dados (parâmetros), faz alguma coisa e pode devolver um resultado. Métodos existem para três coisas: não repetir código, dar um nome a uma ideia e permitir testar uma peça isolada." },
    { tipo: "codigo", linguagem: "java", legenda: "Trecho", texto: `static int somar(int a, int b) {
    return a + b;
}
// static   → pertence à classe (por enquanto, sempre use)
// int      → tipo do retorno (void se não devolve nada)
// somar    → nome: um verbo, em camelCase
// (int a, int b) → parâmetros, cada um com tipo e nome` },
    { tipo: "h3", texto: "Sobrecarga e argumentos variáveis" },
    { tipo: "p", texto: "Java permite vários métodos com o mesmo nome, desde que a lista de parâmetros seja diferente. Isso é a sobrecarga (overloading): o compilador escolhe a versão pelos tipos dos argumentos. Com reticências, o método recebe uma quantidade variável de argumentos, tratada como um array dentro do método." },
    { tipo: "h3", texto: "Passagem por valor: o que realmente acontece" },
    { tipo: "p", texto: "Este é um dos assuntos que mais confunde. Em Java, todo argumento é passado por valor: o método recebe uma cópia do que foi passado. Para um primitivo, a cópia é o próprio número. Para um objeto ou array, a cópia é a referência, o endereço do objeto. O resultado é sutil:" },
    { tipo: "lista", itens: [
      "Atribuir um novo valor ao parâmetro dentro do método não afeta a variável de quem chamou.",
      "Mas alterar o conteúdo do objeto ou do array apontado pela referência afeta, porque as duas referências apontam para o mesmo objeto.",
    ] },
    { tipo: "codigo", linguagem: "java", legenda: "Metodos.java", texto: `import java.util.Arrays;

public class Metodos {

    static int somar(int a, int b) {
        return a + b;
    }

    static double somar(double a, double b) {
        return a + b;
    }

    static int somar(int... valores) {
        int total = 0;
        for (int valor : valores) {
            total += valor;
        }
        return total;
    }

    static void tentarAlterar(int numero, int[] lista) {
        numero = 99;                    // altera só a cópia local
        lista[0] = 99;                  // altera o array compartilhado
        lista = new int[] {7, 7, 7};    // reaponta só a cópia da referência
    }

    static long fatorial(int n) {
        if (n <= 1) {
            return 1;                   // caso base
        }
        return n * fatorial(n - 1);     // caso recursivo
    }

    public static void main(String[] args) {
        System.out.println(somar(2, 3));
        System.out.println(somar(2.5, 3.5));
        System.out.println(somar(1, 2, 3, 4));

        int numero = 1;
        int[] lista = {1, 2, 3};
        tentarAlterar(numero, lista);
        System.out.println(numero + " " + Arrays.toString(lista));

        System.out.println(fatorial(5));
        System.out.println(fatorial(20));
    }
}` },
    { tipo: "codigo", linguagem: "text", legenda: "Saída", texto: `5
6.0
10
1 [99, 2, 3]
120
2432902008176640000` },
    { tipo: "p", texto: "Repare no 1 [99, 2, 3]: o numero continua 1, porque o método recebeu uma cópia do valor. Já o array teve o primeiro elemento alterado, porque o método recebeu uma cópia da referência e usou-a para mexer no mesmo array. A linha que reaponta a lista para um array novo não tem efeito nenhum fora do método." },
    { tipo: "h3", texto: "Recursão" },
    { tipo: "p", texto: "Um método é recursivo quando chama a si mesmo. Toda recursão precisa de duas partes: o caso base, que termina a repetição sem chamar de novo, e o caso recursivo, que se aproxima do caso base. Sem o caso base (ou com um que nunca é alcançado), as chamadas se empilham até a JVM lançar um StackOverflowError." },
    { tipo: "p", texto: "O fatorial é o exemplo clássico, mas na prática muitos problemas recursivos podem ser resolvidos com um laço. A recursão brilha em estruturas que são naturalmente recursivas, como árvores e pastas dentro de pastas." },
    { tipo: "h3", texto: "Como escrever bons métodos" },
    { tipo: "lista", itens: [
      "Um método faz uma coisa só, e o nome diz qual: calcularMedia, validarEmail, imprimirRecibo.",
      "Cabe na tela. Se está difícil de ler, divida em métodos menores.",
      "Poucos parâmetros. Mais de três ou quatro é sinal de que uma classe deveria agrupá-los (assunto do próximo módulo).",
      "Retorne cedo para casos de saída: um if que devolve logo no começo é mais legível que um else gigante.",
      "Evite números mágicos. Um 0.05 solto no meio do código deveria ser uma constante com nome.",
    ] },

    { tipo: "h", texto: "Arrays: guardando vários valores" },
    { tipo: "p", texto: "Um array é uma sequência de elementos do mesmo tipo, de tamanho fixo, definido na criação. Os elementos são acessados por índice, que começa em 0. Como arrays são objetos, a variável guarda uma referência." },
    { tipo: "lista", itens: [
      "new int[3] cria um array de três ints, todos com valor padrão 0. Os padrões são 0 para números, false para boolean e null para objetos.",
      "{5, 2, 9} cria e preenche ao mesmo tempo.",
      "array.length diz o tamanho (note: é um campo, sem parênteses; em String, length() é um método).",
      "Acessar um índice inválido lança ArrayIndexOutOfBoundsException, em vez de ler lixo de memória, como acontece em outras linguagens.",
    ] },
    { tipo: "codigo", linguagem: "java", legenda: "Vetores.java", texto: `import java.util.Arrays;

public class Vetores {
    public static void main(String[] args) {
        int[] notas = new int[3];
        System.out.println(Arrays.toString(notas));
        notas[0] = 8;
        notas[1] = 6;
        notas[2] = 10;
        System.out.println(notas.length + " " + notas[2]);

        int[] outra = notas;            // NÃO copia: as duas apontam para o mesmo array
        outra[0] = 0;
        System.out.println(notas[0]);

        int[] copia = Arrays.copyOf(notas, notas.length);   // cópia de verdade
        copia[1] = 1;
        System.out.println(notas[1] + " " + copia[1]);

        int[] desordenado = {5, 2, 9, 1};
        Arrays.sort(desordenado);
        System.out.println(Arrays.toString(desordenado));

        int[][] tabela = {{1, 2, 3}, {4, 5, 6}};
        System.out.println(tabela[1][2] + " " + tabela.length + " " + tabela[0].length);
        System.out.println(Arrays.deepToString(tabela));

        try {
            System.out.println(notas[3]);
        } catch (ArrayIndexOutOfBoundsException erro) {
            System.out.println("fora dos limites: " + erro.getMessage());
        }
    }
}` },
    { tipo: "codigo", linguagem: "text", legenda: "Saída", texto: `[0, 0, 0]
3 10
0
6 1
[1, 2, 5, 9]
6 2 3
[[1, 2, 3], [4, 5, 6]]
fora dos limites: Index 3 out of bounds for length 3` },
    { tipo: "lista", itens: [
      "Imprimir um array com System.out.println(array) mostra um código sem sentido, como [I@1b6d3586 (o tipo e um identificador). Use Arrays.toString (ou deepToString para matrizes).",
      "int[] outra = notas não copia nada. Se alterar um, o outro muda junto. Para copiar, use Arrays.copyOf ou clone.",
      "Um array bidimensional é um array de arrays: tabela[1][2] é a linha 1, coluna 2. Cada linha pode até ter um tamanho diferente.",
      "Arrays têm tamanho fixo. Para listas que crescem e diminuem, o Java oferece as coleções (como ArrayList), assunto do próximo módulo.",
    ] },

    { tipo: "h", texto: "Juntando tudo: um programa pequeno" },
    { tipo: "p", texto: "Veja como métodos e arrays trabalham juntos para calcular a média e o maior valor de uma lista de idades. Cada método faz uma coisa e pode ser testado sozinho:" },
    { tipo: "codigo", linguagem: "java", legenda: "Estatisticas.java", texto: `import java.util.Locale;

public class Estatisticas {

    static double media(int[] valores) {
        int soma = 0;
        for (int valor : valores) {
            soma += valor;
        }
        return (double) soma / valores.length;
    }

    static int maior(int[] valores) {
        int maior = valores[0];
        for (int i = 1; i < valores.length; i++) {
            if (valores[i] > maior) {
                maior = valores[i];
            }
        }
        return maior;
    }

    public static void main(String[] args) {
        int[] idades = {31, 25, 42, 19, 37};
        System.out.println(String.format(Locale.US, "média: %.1f", media(idades)));
        System.out.println("maior: " + maior(idades));
    }
}` },
    { tipo: "codigo", linguagem: "text", legenda: "Saída", texto: `média: 30.8
maior: 42` },
    { tipo: "p", texto: "Pergunte-se: o que acontece se a lista estiver vazia? Em media, valores.length é 0, e o resultado, uma divisão por zero em double, é NaN (não é um número). Em maior, valores[0] lança uma exceção. Um código robusto trata esse caso, decidindo o que fazer: devolver um valor padrão, lançar uma exceção própria ou exigir que o chamador nunca passe um array vazio. Essa pergunta (\"e se a entrada for vazia ou inválida?\") é o hábito mais valioso que você pode criar." },
    { tipo: "alerta", titulo: "Divisão por zero depende do tipo", texto: "Dividir um int por zero lança ArithmeticException. Dividir um double por zero não lança nada: dá Infinity (ou NaN, se for 0.0 / 0.0). Quem espera um erro e recebe um número estranho pode propagá-lo por todo o programa sem perceber." },
  ],
  questoes: [
    {
      enunciado: "Qual a principal vantagem do switch com seta (->) sobre o switch tradicional com dois-pontos?",
      opcoes: ["Ele é mais rápido em todas as situações", "Não cai de um caso para o seguinte e pode devolver um valor", "Aceita qualquer tipo de dado, inclusive objetos arbitrários", "Dispensa o caso default"],
      correta: 1,
      explicacao: "A forma com seta não tem o fall-through (a execução não continua no caso seguinte se faltar um break) e funciona como uma expressão que devolve valor. Não é necessariamente mais rápido, não aceita qualquer tipo, e quando é uma expressão sobre tipos que não cobrem todos os casos, o default continua sendo necessário.",
    },
    {
      enunciado: "Qual laço é o mais indicado quando você precisa executar o bloco ao menos uma vez antes de testar a condição?",
      opcoes: ["for", "while", "do-while", "for-each"],
      correta: 2,
      explicacao: "O do-while testa a condição no final, então o corpo sempre roda ao menos uma vez. O while pode não executar nenhuma vez, e o for-each percorre todos os elementos de uma coleção.",
    },
    {
      enunciado: "O que o código abaixo imprime?\n\nstatic void alterar(int n, int[] v) {\n    n = 5;\n    v[0] = 5;\n}\n// ...\nint n = 1;\nint[] v = {1};\nalterar(n, v);\nSystem.out.println(n + \" \" + v[0]);",
      opcoes: ["1 1", "5 5", "1 5", "5 1"],
      correta: 2,
      explicacao: "Java passa tudo por valor. O n é um primitivo: o método recebe uma cópia, e a variável original continua 1. O v é um array: o método recebe uma cópia da referência, que aponta para o mesmo array, então v[0] = 5 altera o array original.",
    },
    {
      enunciado: "Qual é o caso base na recursão?",
      opcoes: ["A primeira chamada do método", "A condição que encerra a recursão sem chamar o método de novo", "O método que chama o recursivo", "O último valor devolvido pelo programa"],
      correta: 1,
      explicacao: "O caso base é a situação mais simples, resolvida diretamente, que impede as chamadas de se repetirem para sempre. Sem ele (ou com um que nunca é alcançado), a pilha de chamadas estoura e a JVM lança StackOverflowError.",
    },
    {
      enunciado: "O que acontece ao executar int[] a = {1, 2, 3}; int[] b = a; b[0] = 9; System.out.println(a[0]);?",
      opcoes: ["Imprime 1, porque b é uma cópia independente", "Imprime 9, porque a e b apontam para o mesmo array", "Erro de compilação", "Lança uma exceção"],
      correta: 1,
      explicacao: "Atribuir um array a outra variável copia só a referência, não o conteúdo. As duas variáveis apontam para o mesmo array, então a alteração aparece pelas duas. Para uma cópia independente, use Arrays.copyOf ou clone.",
    },
    {
      enunciado: "Para um array de 5 elementos, quais são os índices válidos?",
      opcoes: ["De 1 a 5", "De 0 a 5", "De 0 a 4", "De 1 a 4"],
      correta: 2,
      explicacao: "Os índices começam em 0 e terminam em length - 1, ou seja, de 0 a 4. Acessar o índice 5 lança ArrayIndexOutOfBoundsException. Esse é o motivo de muitos erros por um (off-by-one).",
    },
    {
      enunciado: "O que significa sobrecarga (overloading) de métodos?",
      opcoes: ["Um método que recebe argumentos demais", "Vários métodos com o mesmo nome e listas de parâmetros diferentes", "Um método que chama a si mesmo", "Substituir na subclasse um método herdado"],
      correta: 1,
      explicacao: "Sobrecarga é ter vários métodos com o mesmo nome e parâmetros diferentes, e o compilador escolhe pela lista de argumentos. Chamar a si mesmo é recursão, e substituir um método herdado é sobrescrita (overriding), assunto do módulo de herança.",
    },
  ],
  desafio: {
    titulo: "Boletim da turma",
    enunciado: "Escreva um programa (Boletim.java) que recebe as notas de uma turma em um array e imprime um boletim com estatísticas e o conceito de cada aluno. Cada cálculo deve ser um método separado.",
    requisitos: [
      "Declare um array de notas (double) e um array de nomes com os mesmos tamanhos, com pelo menos 5 alunos.",
      "Crie métodos para a média da turma, a maior nota, a menor nota e a quantidade de aprovados (nota 6 ou mais).",
      "Crie um método conceito(double nota) que devolve \"A\" para 9 ou mais, \"B\" para 7 ou mais, \"C\" para 6 ou mais e \"D\" nos demais casos, usando um switch ou if/else if.",
      "Percorra os arrays com um laço e imprima o nome, a nota e o conceito de cada aluno.",
      "Trate o caso de uma turma vazia sem deixar o programa quebrar nem imprimir NaN.",
    ],
    criterios: [
      "Nenhum cálculo está dentro do main: cada um é um método com nome de verbo.",
      "A média é calculada com divisão decimal (não inteira).",
      "O programa não lança exceção para uma turma vazia e deixa claro o que fez nesse caso.",
      "Não há números mágicos: a nota de aprovação é uma constante com nome.",
      "Você consegue explicar a diferença entre alterar o array dentro de um método e reapontar a variável.",
    ],
    dica: "Comece escrevendo os métodos e testando cada um no main com valores simples, antes de montar o boletim. Se um método não está certo, é muito mais fácil descobrir isso sozinho.",
  },
  referencias: [
    { titulo: "Dev.java: Aprendendo Java (em inglês)", url: "https://dev.java/learn/" },
    { titulo: "Especificação da linguagem Java: arrays (em inglês)", url: "https://docs.oracle.com/javase/specs/jls/se21/html/jls-10.html" },
  ],
};
