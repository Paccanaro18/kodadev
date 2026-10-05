import type { Modulo } from "../tipos";

export const JAVA_MODULO_1: Modulo = {
  tipo: "modulo",
  slug: "primeiros-passos",
  titulo: "Primeiros passos: como o Java funciona, tipos e variáveis",
  resumo: "Do JDK ao primeiro programa: tipos primitivos, Strings, operadores e os erros que todo iniciante comete.",
  nivel: "Iniciante",
  leitura: "35 min",
  objetivos: [
    "Explicar o que são JDK, JVM e bytecode e como um programa Java é compilado e executado.",
    "Escrever, compilar e rodar um programa simples no terminal.",
    "Escolher o tipo certo para cada dado e prever o resultado de contas com inteiros e decimais.",
    "Comparar Strings corretamente e usar as operações mais comuns.",
    "Reconhecer estouro de inteiro, divisão inteira, conversão com perda e valor nulo antes de eles virarem bugs.",
  ],
  preRequisitos: [
    "Saber usar um terminal (abrir uma pasta e rodar um comando).",
    "Nenhuma experiência com programação é necessária.",
  ],
  pontosChave: [
    "O código Java é compilado para bytecode e executado pela JVM, por isso roda em qualquer sistema com uma JVM.",
    "Java é estaticamente tipado: o tipo de cada variável é conhecido antes de o programa rodar.",
    "Existem 8 tipos primitivos. Todo o resto é objeto, e objetos são comparados com equals, não com ==.",
    "Inteiros estouram em silêncio, dividir inteiros descarta a parte decimal e double não é exato.",
    "Strings são imutáveis: toda operação devolve uma nova String.",
  ],
  blocos: [
    { tipo: "p", texto: "Java é uma das linguagens mais usadas no mundo para sistemas de backend: bancos, varejo, telecomunicações, governo e boa parte das empresas que você conhece rodam Java. Aprender os fundamentos com cuidado, sem pressa, é o que separa quem escreve código que funciona por sorte de quem entende por que ele funciona. Este módulo cobre exatamente esses fundamentos." },

    { tipo: "h", texto: "Como o Java funciona" },
    { tipo: "p", texto: "Em linguagens como C, o compilador transforma o seu código em instruções específicas do processador e do sistema operacional da máquina. Em Java, o caminho tem uma etapa a mais:" },
    { tipo: "numerada", itens: [
      "Você escreve o código-fonte, em arquivos com extensão .java.",
      "O compilador (javac) traduz o código-fonte para bytecode, em arquivos .class. O bytecode não é específico de nenhum sistema operacional.",
      "A JVM (Java Virtual Machine) carrega o bytecode e o executa. Existe uma JVM para Windows, outra para Linux, outra para macOS, e todas entendem o mesmo bytecode.",
    ] },
    { tipo: "p", texto: "É por isso que o slogan antigo do Java era \"escreva uma vez, rode em qualquer lugar\": você compila uma vez e roda onde houver uma JVM. Dentro da JVM, um componente chamado JIT (compilação just-in-time) observa quais trechos do programa rodam com mais frequência e os traduz para código nativo durante a execução, o que torna o Java rápido." },
    { tipo: "tabela", cabecalho: ["Sigla", "O que é", "Para que você usa"], linhas: [
      ["JVM", "A máquina virtual que executa o bytecode.", "Rodar programas Java."],
      ["JRE", "A JVM mais as bibliotecas padrão.", "Só executar programas (hoje raramente instalado à parte)."],
      ["JDK", "O JRE mais as ferramentas de desenvolvimento, como o compilador javac.", "Desenvolver. É o que você instala."],
    ] },
    { tipo: "dica", titulo: "Qual versão instalar", texto: "Instale um JDK de suporte de longo prazo (LTS). Os LTS mais usados hoje são o 17 e o 21. Este curso usa recursos que existem desde o Java 17, e a maior parte funciona também no 21 e nos seguintes. Para conferir o que você tem, rode java -version no terminal." },

    { tipo: "h", texto: "O seu primeiro programa" },
    { tipo: "p", texto: "Crie um arquivo chamado Ola.java com o conteúdo abaixo:" },
    { tipo: "codigo", linguagem: "java", legenda: "Ola.java", texto: `public class Ola {
    public static void main(String[] args) {
        System.out.println("Olá, Koda!");
    }
}` },
    { tipo: "p", texto: "Para rodar, existem dois caminhos. O completo compila e depois executa:" },
    { tipo: "codigo", linguagem: "bash", texto: `javac Ola.java   # gera Ola.class
java Ola         # executa o bytecode` },
    { tipo: "p", texto: "A partir do Java 11, para programas de um arquivo só, você pode pular a etapa visível de compilação e rodar direto o código-fonte, o que é ótimo para estudar:" },
    { tipo: "codigo", linguagem: "bash", texto: `java Ola.java` },
    { tipo: "codigo", linguagem: "text", legenda: "Saída", texto: `Olá, Koda!` },
    { tipo: "h3", texto: "A anatomia do programa" },
    { tipo: "lista", itens: [
      "public class Ola: em Java, todo código vive dentro de uma classe. Por convenção, o nome do arquivo é o nome da classe pública.",
      "public static void main(String[] args): é o ponto de entrada. A JVM procura esse método para começar a executar. A palavra void diz que ele não devolve nada, e args recebe os argumentos da linha de comando.",
      "System.out.println(...): escreve uma linha no terminal. System é uma classe da biblioteca padrão, out é a saída padrão e println é o método que imprime e pula a linha.",
      "Cada instrução termina com ponto e vírgula, e os blocos ficam entre chaves.",
    ] },
    { tipo: "alerta", titulo: "Maiúsculas e minúsculas importam", texto: "Java diferencia maiúsculas de minúsculas: Main, main e MAIN são três nomes diferentes. Um erro de digitação como system.out.println (com s minúsculo) é a causa de muitos \"cannot find symbol\" na primeira semana." },

    { tipo: "h", texto: "Tipos de dados: primitivos e de referência" },
    { tipo: "p", texto: "Java é uma linguagem estaticamente tipada: toda variável tem um tipo declarado, e o compilador recusa o programa se você usar o dado de um jeito que o tipo não permite. Isso parece burocrático no começo, mas pega muitos erros antes de o programa rodar." },
    { tipo: "p", texto: "Os tipos se dividem em dois grupos. Os primitivos guardam o valor diretamente. Os de referência (classes, interfaces, arrays) guardam um endereço que aponta para um objeto." },
    { tipo: "tabela", legenda: "Os 8 tipos primitivos", cabecalho: ["Tipo", "Tamanho", "O que guarda", "Exemplo"], linhas: [
      ["byte", "8 bits", "Inteiro de -128 a 127", "byte b = 100;"],
      ["short", "16 bits", "Inteiro de -32.768 a 32.767", "short s = 2000;"],
      ["int", "32 bits", "Inteiro de cerca de -2,1 bilhões a 2,1 bilhões", "int idade = 30;"],
      ["long", "64 bits", "Inteiro enorme (cerca de ±9,2 quintilhões)", "long n = 8_000_000_000L;"],
      ["float", "32 bits", "Decimal de precisão simples", "float f = 1.5f;"],
      ["double", "64 bits", "Decimal de precisão dupla (o padrão)", "double preco = 19.90;"],
      ["char", "16 bits", "Um caractere", "char c = 'K';"],
      ["boolean", "—", "true ou false", "boolean ativo = true;"],
    ] },
    { tipo: "p", texto: "No dia a dia você usa quase só int, long, double e boolean. Dois detalhes de escrita: números long terminam com L (sem ele, o literal é tratado como int e não cabe), e underscores nos números, como 8_000_000_000L, são ignorados e só ajudam a leitura." },
    { tipo: "codigo", linguagem: "java", legenda: "Tipos.java", texto: `public class Tipos {
    public static void main(String[] args) {
        int idade = 30;
        long populacao = 8_000_000_000L;
        double preco = 19.90;
        boolean ativo = true;
        char inicial = 'K';

        System.out.println(idade + " " + populacao);
        System.out.println(preco + " " + ativo + " " + inicial);

        int maior = Integer.MAX_VALUE;
        System.out.println(maior);
        System.out.println(maior + 1);        // estouro: volta para o menor valor
        System.out.println(0.1 + 0.2);        // double não é exato
        System.out.println(7 / 2);            // divisão inteira
        System.out.println(7 / 2.0);          // com um decimal, a conta é decimal
        System.out.println(7 % 2);            // resto da divisão
        System.out.println((int) 3.99);       // conversão trunca, não arredonda
        System.out.println((char) ('A' + 2)); // soma com char vira número; o cast volta
    }
}` },
    { tipo: "codigo", linguagem: "text", legenda: "Saída", texto: `30 8000000000
19.9 true K
2147483647
-2147483648
0.30000000000000004
3
3.5
1
3
C` },
    { tipo: "p", texto: "Cada linha dessa saída guarda uma lição que costuma surpreender:" },
    { tipo: "lista", itens: [
      "Estouro (overflow): Integer.MAX_VALUE + 1 não dá erro, não avisa e volta para o menor int. Em sistemas que somam dinheiro ou quantidades, isso é um bug sério e silencioso. Quando o valor pode passar de 2 bilhões, use long.",
      "double não é exato: 0.1 + 0.2 dá 0.30000000000000004, porque números decimais são guardados em binário e muitos deles não cabem exatamente. Para dinheiro, nunca use double: use BigDecimal ou guarde o valor em centavos como inteiro.",
      "Divisão inteira: 7 / 2 é 3, não 3,5. Quando os dois lados são inteiros, a divisão é inteira e a parte decimal é descartada. Basta que um dos lados seja decimal para a conta ser decimal.",
      "Conversão (cast) explícita: (int) 3.99 vale 3. O cast trunca (corta a parte decimal), não arredonda.",
      "char é um número: 'A' + 2 é um int (67), e o cast para char devolve o caractere C.",
    ] },

    { tipo: "h", texto: "Variáveis, constantes e nomes" },
    { tipo: "p", texto: "Uma variável é um nome para um valor guardado na memória. A declaração tem o tipo, o nome e, geralmente, um valor inicial." },
    { tipo: "lista", itens: [
      "final cria uma constante: depois de receber um valor, não pode ser alterada. Prefira final sempre que a variável não precisar mudar.",
      "var (Java 10 ou superior) deixa o compilador descobrir o tipo pelo valor: var nome = \"Ana\"; continua sendo uma String. Só vale para variáveis locais com valor inicial.",
      "Convenções de nomes: variáveis e métodos em camelCase (valorTotal), classes em PascalCase (PedidoService), constantes em MAIUSCULAS_COM_UNDERSCORE (TAXA_MAXIMA). Seguir a convenção faz o seu código parecer o de qualquer outro projeto Java.",
    ] },
    { tipo: "alerta", titulo: "Variável local não tem valor padrão", texto: "Campos de uma classe recebem valores padrão (0, false, null), mas variáveis locais, aquelas declaradas dentro de um método, não. Usar uma variável local antes de atribuir um valor é erro de compilação (\"variable might not have been initialized\"). Ainda bem: o compilador te protege de lixo na memória." },

    { tipo: "h", texto: "Operadores" },
    { tipo: "p", texto: "Os operadores aritméticos são os de sempre (+, -, *, /, %). Os de comparação (==, !=, <, >, <=, >=) devolvem boolean. Os lógicos combinam booleanos: && (e), || (ou) e ! (não). Há também os atalhos de atribuição, como +=, e os de incremento, ++ e --." },
    { tipo: "p", texto: "Os operadores && e || usam avaliação em curto-circuito: se o resultado já está decidido pelo lado esquerdo, o direito nem é avaliado. Isso é útil (e perigoso se o lado direito tiver efeito colateral, como o do exemplo):" },
    { tipo: "codigo", linguagem: "java", legenda: "Operadores.java", texto: `public class Operadores {

    static boolean avisa(String lado) {
        System.out.println("avaliou " + lado);
        return true;
    }

    public static void main(String[] args) {
        int x = 5;
        x += 3;   // x = x + 3
        x++;      // x = x + 1
        System.out.println(x);
        System.out.println(x > 5 && x < 10);

        System.out.println(false && avisa("direita"));  // não avalia o lado direito
        System.out.println(true || avisa("outra"));     // idem

        String faixa = x >= 18 ? "adulto" : "menor";    // operador ternário
        System.out.println(faixa);

        int a = 10, b = 3;
        System.out.println(a / b + " " + a % b + " " + (double) a / b);
        System.out.println(5 + 3 + "x" + 5 + 3);
    }
}` },
    { tipo: "codigo", linguagem: "text", legenda: "Saída", texto: `9
true
false
true
menor
3 1 3.3333333333333335
8x53` },
    { tipo: "p", texto: "O último resultado, 8x53, é um clássico: a expressão é avaliada da esquerda para a direita. 5 + 3 vira 8 (soma de inteiros); 8 + \"x\" vira o texto 8x; e dali em diante, tudo o que vem depois é concatenado como texto, então 5 e 3 viram \"5\" e \"3\", e não uma soma. O operador + faz duas coisas diferentes conforme os tipos." },
    { tipo: "p", texto: "Repare também em (double) a / b: o cast acontece antes da divisão, porque tem precedência maior. Por isso o resultado é decimal. Escrever (double) (a / b) daria 3.0, porque a divisão inteira já tinha acontecido." },

    { tipo: "h", texto: "Strings: o tipo que mais aparece" },
    { tipo: "p", texto: "String não é um tipo primitivo, é uma classe, mas é tão usada que a linguagem trata com carinho: tem literais entre aspas duplas e o operador +. Duas propriedades são fundamentais." },
    { tipo: "h3", texto: "Strings são imutáveis" },
    { tipo: "p", texto: "Nenhum método de String altera a String original. Todos devolvem uma nova. Escrever s.toUpperCase() sozinho em uma linha não faz nada útil, porque o resultado é descartado. É preciso guardar o retorno: s = s.toUpperCase();." },
    { tipo: "h3", texto: "Compare com equals, nunca com ==" },
    { tipo: "p", texto: "Para tipos de referência, o operador == pergunta se as duas variáveis apontam para o mesmo objeto, não se têm o mesmo conteúdo. Para comparar o conteúdo de Strings, use o método equals." },
    { tipo: "codigo", linguagem: "java", legenda: "Strings.java", texto: `import java.util.Locale;

public class Strings {
    public static void main(String[] args) {
        String a = "koda";
        String b = new String("koda");
        System.out.println(a == b);        // objetos diferentes
        System.out.println(a.equals(b));   // mesmo conteúdo
        System.out.println(a.toUpperCase() + " " + a.length() + " " + a.charAt(0));
        System.out.println("Java".substring(1, 3));
        System.out.println(String.join("-", "a", "b", "c"));

        String bloco = """
                Linha 1
                  Linha 2
                """;
        System.out.print(bloco);

        System.out.println(String.format(Locale.US, "Total: %.2f", 19.9));

        String s = "x";
        s.concat("y");              // o resultado é descartado
        System.out.println(s);

        StringBuilder montagem = new StringBuilder();
        for (int i = 0; i < 3; i++) {
            montagem.append(i).append(',');
        }
        System.out.println(montagem);
    }
}` },
    { tipo: "codigo", linguagem: "text", legenda: "Saída", texto: `false
true
KODA 4 k
av
a-b-c
Linha 1
  Linha 2
Total: 19.90
x
0,1,2,` },
    { tipo: "lista", itens: [
      "substring(1, 3) devolve os caracteres das posições 1 e 2: o início é incluído e o fim, não. As posições começam em 0.",
      "Os blocos de texto (entre três aspas duplas, a partir do Java 15) facilitam escrever textos de várias linhas, como JSON e SQL. A indentação comum a todas as linhas é removida.",
      "String.format monta textos com marcadores: %.2f é um decimal com duas casas, %d é um inteiro, %s é um texto. Passe um Locale explícito se o resultado não puder depender da configuração da máquina: em português, o formato padrão usa vírgula decimal.",
      "StringBuilder serve para montar um texto em partes, principalmente em laços. Concatenar com + dentro de um laço cria muitas Strings intermediárias, e o StringBuilder evita isso.",
    ] },
    { tipo: "alerta", titulo: "Por que a == b deu false se os dois são \"koda\"?", texto: "O literal \"koda\" é guardado em um espaço compartilhado, mas new String(\"koda\") obriga a criação de um objeto novo. Se você compara dois literais iguais com ==, pode dar true por acaso, e isso faz muita gente acreditar que == funciona. Não funciona de forma confiável: sempre use equals para comparar Strings." },

    { tipo: "h", texto: "Conversões entre tipos" },
    { tipo: "p", texto: "Existem dois sentidos de conversão entre tipos numéricos:" },
    { tipo: "lista", itens: [
      "Alargamento (widening): de um tipo menor para um maior (int para long, int para double). É seguro, e o Java faz sozinho.",
      "Estreitamento (narrowing): de um tipo maior para um menor (long para int, double para int). Pode perder informação, e por isso o Java exige que você peça explicitamente, com o cast.",
    ] },
    { tipo: "p", texto: "Para converter entre texto e número, a biblioteca padrão oferece métodos como Integer.parseInt e String.valueOf. Se o texto não representar um número, parseInt lança uma exceção (NumberFormatException), assunto de um módulo mais adiante." },

    { tipo: "h", texto: "Null e os tipos embrulhados" },
    { tipo: "p", texto: "Cada primitivo tem uma classe correspondente, chamada de wrapper: Integer para int, Long para long, Double para double, Boolean para boolean e assim por diante. Elas são necessárias em lugares em que só objetos são aceitos (como as coleções, que você verá no próximo módulo) e oferecem métodos úteis." },
    { tipo: "p", texto: "A diferença prática mais importante: um int sempre tem um valor, mas um Integer é um objeto e pode ser null, que significa \"nenhum objeto\". Chamar um método em uma referência nula, ou desembrulhar um Integer nulo para um int, causa a famosa NullPointerException." },
    { tipo: "codigo", linguagem: "java", legenda: "Variaveis.java", texto: `public class Variaveis {
    public static void main(String[] args) {
        final double TAXA = 0.05;
        var nome = "Ana";               // o compilador infere String
        Integer total = null;           // objeto: pode ser nulo
        int numero = Integer.parseInt("42");
        System.out.println(nome + " " + TAXA + " " + numero + " " + total);

        try {
            Integer.parseInt("abc");
        } catch (NumberFormatException erro) {
            System.out.println("não é número: " + erro.getMessage());
        }

        long grande = 3_000_000_000L;
        int menor = (int) grande;       // estreitamento perde informação
        System.out.println(menor);
    }
}` },
    { tipo: "codigo", linguagem: "text", legenda: "Saída", texto: `Ana 0.05 42 null
não é número: For input string: "abc"
-1294967296` },
    { tipo: "p", texto: "O último valor mostra o custo do estreitamento: 3 bilhões não cabem em um int, e o cast mantém só os 32 bits de baixo, o que resulta em um número negativo sem sentido. O compilador deixou passar porque você pediu o cast. A responsabilidade passa a ser sua." },

    { tipo: "h", texto: "Os erros mais comuns de quem está começando" },
    { tipo: "tabela", cabecalho: ["Erro", "O que acontece", "Como corrigir"], linhas: [
      ["Comparar Strings com ==", "Resultado imprevisível: pode dar false para textos iguais.", "Usar equals."],
      ["Esquecer o ponto e vírgula", "Erro de compilação (\"';' expected\").", "Terminar cada instrução com ;."],
      ["Dividir inteiros esperando decimal", "7 / 2 dá 3.", "Converter um dos lados para double."],
      ["Usar double para dinheiro", "Centavos que somem ou aparecem (0.1 + 0.2).", "Usar BigDecimal ou centavos em long."],
      ["Ignorar o estouro de int", "Valores que viram negativos sem aviso.", "Usar long quando o valor pode ser grande."],
      ["Não guardar o retorno de um método de String", "A String original não muda.", "Atribuir: s = s.trim();."],
      ["Misturar nome do arquivo e da classe pública", "Erro de compilação (\"class X is public, should be declared in a file named X.java\").", "Fazer o arquivo ter o mesmo nome da classe pública."],
    ] },
    { tipo: "dica", titulo: "Leia a mensagem de erro do compilador", texto: "Os erros do javac dizem a linha, o trecho e o motivo. Aprenda a lê-los em ordem: o primeiro erro costuma ser o verdadeiro, e os seguintes são consequência dele. Corrija um, recompile e veja o que sobra." },
  ],
  questoes: [
    {
      enunciado: "O que a JVM executa quando você roda um programa Java?",
      opcoes: ["O código-fonte (.java), linha por linha", "O bytecode (.class) gerado pelo compilador", "Código de máquina específico do sistema operacional, gerado pelo javac", "O JRE inteiro, que o programa carrega junto"],
      correta: 1,
      explicacao: "O javac traduz o código-fonte em bytecode, e a JVM executa o bytecode. Por isso o mesmo .class roda em qualquer sistema que tenha uma JVM. O javac não gera código de máquina específico: isso fica a cargo da JVM, em tempo de execução, pelo JIT.",
    },
    {
      enunciado: "Qual é o resultado de System.out.println(7 / 2); ?",
      opcoes: ["3.5", "3", "4", "Erro de compilação"],
      correta: 1,
      explicacao: "Quando os dois operandos são inteiros, a divisão é inteira e a parte decimal é descartada: 7 / 2 vale 3. Para obter 3.5, ao menos um dos lados precisa ser decimal, como em 7 / 2.0.",
    },
    {
      enunciado: "Qual é a forma correta de comparar o conteúdo de duas Strings, a e b?",
      opcoes: ["a == b", "a.equals(b)", "a = b", "a.compare(b)"],
      correta: 1,
      explicacao: "O == compara as referências (se são o mesmo objeto), não o conteúdo. O método equals compara o conteúdo. O operador = é atribuição, e String não tem um método compare com essa assinatura.",
    },
    {
      enunciado: "O que Integer.MAX_VALUE + 1 produz em Java?",
      opcoes: ["Uma exceção ArithmeticException", "Um erro de compilação", "-2147483648, sem nenhum aviso", "Um long com o valor 2147483648"],
      correta: 2,
      explicacao: "A soma de dois int é um int, e o resultado estoura: o valor volta para o menor int, -2147483648, sem lançar exceção nem avisar. É um dos bugs mais silenciosos da linguagem. Para valores que podem passar de 2 bilhões, use long.",
    },
    {
      enunciado: "Por que não se deve usar double para representar dinheiro?",
      opcoes: ["Porque double só aceita números inteiros", "Porque double não é exato para muitos decimais (como 0.1 + 0.2)", "Porque double é mais lento que int em toda situação", "Porque o Java proíbe o ponto decimal em valores monetários"],
      correta: 1,
      explicacao: "Os decimais são guardados em binário, e muitos valores, como 0.1, não têm representação exata. Isso gera erros de arredondamento. Para dinheiro, use BigDecimal ou guarde o valor em centavos em um inteiro.",
    },
    {
      enunciado: "O que o código abaixo imprime?\n\nString s = \"java\";\ns.toUpperCase();\nSystem.out.println(s);",
      opcoes: ["JAVA", "java", "Um erro de compilação", "null"],
      correta: 1,
      explicacao: "Strings são imutáveis: toUpperCase devolve uma nova String e não altera a original. Como o retorno foi descartado, s continua sendo \"java\". O correto seria s = s.toUpperCase();.",
    },
    {
      enunciado: "Qual é o resultado de System.out.println(1 + 2 + \"a\" + 1 + 2); ?",
      opcoes: ["3a3", "3a12", "12a12", "a12"],
      correta: 1,
      explicacao: "A expressão é avaliada da esquerda para a direita. 1 + 2 vale 3 (soma de inteiros). 3 + \"a\" vira o texto \"3a\". Depois disso, + 1 e + 2 concatenam como texto, dando \"3a12\".",
    },
  ],
  desafio: {
    titulo: "Recibo de compra",
    enunciado: "Escreva um programa Java de um arquivo só (Recibo.java) que calcula e imprime o recibo de uma compra. Trabalhar com os tipos certos é o centro do exercício.",
    requisitos: [
      "Declare, com os tipos adequados: o nome do cliente, a quantidade de itens (int), o preço unitário em centavos (long) e uma taxa de serviço de 10% (constante).",
      "Calcule o subtotal (quantidade vezes o preço unitário), a taxa e o total, tudo em centavos, usando apenas inteiros.",
      "Imprima os valores em reais com duas casas decimais, como 12,50, sem usar double nas contas.",
      "Imprima uma frase de resumo montada com um bloco de texto ou com String.format.",
      "Mostre, em uma linha de comentário, por que não usou double para os valores monetários.",
    ],
    criterios: [
      "O programa compila e roda com java Recibo.java, sem erros nem avisos.",
      "Os cálculos usam long e int, e nenhum valor monetário é guardado em double.",
      "A taxa é uma constante declarada com final e com nome em MAIUSCULAS.",
      "A saída mostra os valores com duas casas decimais.",
      "Você consegue explicar a diferença entre a divisão inteira e a decimal usando o seu próprio código.",
    ],
    dica: "Para imprimir centavos como reais, divida por 100 para os reais e use % 100 para os centavos restantes, formatando os centavos com dois dígitos (%02d).",
  },
  referencias: [
    { titulo: "Dev.java: Aprendendo Java (documentação oficial da Oracle, em inglês)", url: "https://dev.java/learn/" },
    { titulo: "Especificação da linguagem Java: tipos, valores e variáveis (em inglês)", url: "https://docs.oracle.com/javase/specs/jls/se21/html/jls-4.html" },
  ],
};
