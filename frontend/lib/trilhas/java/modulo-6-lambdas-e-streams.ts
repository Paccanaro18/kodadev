import type { Modulo } from "../tipos";

export const JAVA_MODULO_6: Modulo = {
  tipo: "modulo",
  slug: "lambdas-e-streams",
  titulo: "Expressões lambda e Streams",
  resumo: "Funções como valores em Java: interfaces funcionais, referências a métodos e pipelines de Streams para filtrar, transformar, agrupar e somar dados.",
  nivel: "Júnior",
  leitura: "50 min",
  objetivos: [
    "Escrever expressões lambda e referências a métodos e saber em que interfaces funcionais elas se encaixam.",
    "Montar um pipeline de Stream com operações intermediárias e uma operação terminal.",
    "Usar Collectors para agrupar, contar, somar, juntar textos e particionar.",
    "Explicar a avaliação preguiçosa (lazy) e por que um Stream só pode ser consumido uma vez.",
    "Saber quando um laço comum é mais claro do que um Stream.",
  ],
  preRequisitos: [
    "Ter feito os módulos de interfaces e polimorfismo e de coleções, generics e Optional.",
  ],
  pontosChave: [
    "Uma lambda é uma implementação curta de uma interface com um único método abstrato (interface funcional).",
    "Um Stream não guarda dados: descreve um pipeline que só roda quando há uma operação terminal.",
    "Operações intermediárias (filter, map, sorted) devolvem outro Stream; terminais (toList, collect, sum) produzem o resultado.",
    "Collectors.groupingBy substitui o clássico laço que monta um Map de listas.",
    "Evite efeitos colaterais dentro das operações: um Stream deve transformar dados, e não alterar o mundo.",
  ],
  blocos: [
    { tipo: "p", texto: "Até o Java 7, passar um comportamento como argumento exigia escrever uma classe anônima de cinco linhas para fazer uma comparação de duas. O Java 8 trouxe as expressões lambda e a API de Streams, e mudou o estilo da linguagem: em vez de descrever como percorrer e acumular, você descreve o que quer obter. Em projetos Spring, você os verá a toda hora, nos repositórios, nos serviços e nos testes." },

    { tipo: "h", texto: "Lambdas e interfaces funcionais" },
    { tipo: "p", texto: "Uma lambda é uma função sem nome: (parâmetros) -> expressão. Ela só pode ser usada onde o Java espera uma interface funcional, isto é, uma interface com exatamente um método abstrato. O compilador deduz de qual interface se trata pelo contexto, e a lambda vira a implementação desse método. A biblioteca traz as interfaces funcionais mais comuns no pacote java.util.function." },
    { tipo: "tabela", legenda: "As interfaces funcionais mais usadas", cabecalho: ["Interface", "Método", "Ideia", "Exemplo"], linhas: [
      ["Function<T, R>", "R apply(T)", "Transforma um valor em outro.", "n -> n * 2"],
      ["Predicate<T>", "boolean test(T)", "Responde sim ou não sobre um valor.", "s -> s.isBlank()"],
      ["Consumer<T>", "void accept(T)", "Faz algo com um valor, sem devolver nada.", "System.out::println"],
      ["Supplier<T>", "T get()", "Fornece um valor, sem receber nada.", "() -> \"oi\""],
      ["BiFunction<T, U, R>", "R apply(T, U)", "Combina dois valores em um.", "Integer::sum"],
    ] },
    { tipo: "p", texto: "Quando a lambda só chama um método que já existe, pode-se usar uma referência a método, mais curta e legível: String::isBlank no lugar de s -> s.isBlank(), e System.out::println no lugar de x -> System.out.println(x). As funções também se compõem: andThen encadeia uma depois da outra, compose faz o contrário, e os predicados têm negate, and e or." },
    { tipo: "codigo", linguagem: "java", legenda: "Lambdas.java", texto: `import java.util.ArrayList;
import java.util.List;
import java.util.function.BiFunction;
import java.util.function.Consumer;
import java.util.function.Function;
import java.util.function.Predicate;
import java.util.function.Supplier;

public class Lambdas {
    public static void main(String[] args) {
        Function<Integer, Integer> dobro = n -> n * 2;
        Predicate<String> vazio = String::isBlank;
        Supplier<String> saudacao = () -> "oi";
        Consumer<String> imprimir = System.out::println;
        BiFunction<Integer, Integer, Integer> soma = Integer::sum;

        imprimir.accept(dobro.apply(21) + " " + vazio.test("  ") + " " + saudacao.get() + " " + soma.apply(2, 3));

        Function<Integer, Integer> maisUm = n -> n + 1;
        System.out.println(dobro.andThen(maisUm).apply(5) + " " + dobro.compose(maisUm).apply(5));
        System.out.println(vazio.negate().test("a") + " " + vazio.or(s -> s.length() > 3).test("abcd"));

        List<String> nomes = new ArrayList<>(List.of("Carla", "ana", "Bruno"));
        nomes.sort(String::compareToIgnoreCase);
        System.out.println(nomes);
        nomes.forEach(n -> System.out.print(n.toUpperCase() + ";"));
        System.out.println();

        int fator = 10;
        Function<Integer, Integer> escalar = n -> n * fator;
        System.out.println(escalar.apply(4));
        System.out.println(criarContador().get() + " " + criarContador().get());
    }

    static Supplier<Integer> criarContador() {
        int[] contagem = {0};
        return () -> ++contagem[0];
    }
}` },
    { tipo: "codigo", linguagem: "text", legenda: "Saída", texto: `42 true oi 5
11 12
true true
[ana, Bruno, Carla]
ANA BRUNO CARLA
40
1 1` },
    { tipo: "p", texto: "Duas linhas merecem atenção. Em dobro.andThen(maisUm).apply(5), o dobro é aplicado primeiro (10) e depois o maisUm (11); com compose, é o contrário (6 e depois 12). E o último resultado, \"1 1\", mostra que cada contador criado tem a sua própria variável: a lambda captura o array da chamada onde nasceu, o que se chama fechamento (closure)." },
    { tipo: "alerta", titulo: "Variáveis capturadas precisam ser efetivamente finais", texto: "Uma lambda só pode usar variáveis locais que não mudam depois de receberem valor. Se você tentar alterar fator dentro da lambda, ou depois dela, o código não compila. O truque do array de um elemento (int[] contagem = {0}) contorna a regra, porque o que é final é a referência, mas deve ser usado com cuidado: estado mutável compartilhado dentro de lambdas é fonte de bugs, em especial com concorrência." },

    { tipo: "h", texto: "Streams: pipelines de dados" },
    { tipo: "p", texto: "Um Stream não é uma coleção: não guarda dados. É uma descrição de uma sequência de operações sobre uma fonte (uma lista, um array, um intervalo, um arquivo). Um pipeline tem três partes: a fonte (coleção.stream()), zero ou mais operações intermediárias, que transformam o fluxo e devolvem outro Stream (filter, map, sorted, distinct, limit, flatMap), e uma operação terminal, que dispara a execução e produz um resultado (toList, collect, count, sum, max, findFirst, anyMatch, forEach)." },
    { tipo: "codigo", linguagem: "java", legenda: "Fluxos.java", texto: `import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

public class Fluxos {
    record Pedido(int id, String cliente, String categoria, double valor) {}

    public static void main(String[] args) {
        List<Pedido> pedidos = List.of(
            new Pedido(1, "Ana", "livros", 80.0),
            new Pedido(2, "Bruno", "jogos", 250.0),
            new Pedido(3, "Ana", "jogos", 120.0),
            new Pedido(4, "Carla", "livros", 45.5),
            new Pedido(5, "Bruno", "livros", 60.0));

        List<Integer> grandes = pedidos.stream().filter(p -> p.valor() > 100).map(Pedido::id).toList();
        System.out.println(grandes);

        double total = pedidos.stream().mapToDouble(Pedido::valor).sum();
        System.out.println(total);

        Map<String, Long> porCategoria = pedidos.stream()
            .collect(Collectors.groupingBy(Pedido::categoria, Collectors.counting()));
        System.out.println(new java.util.TreeMap<>(porCategoria));

        Map<String, Double> gastoPorCliente = pedidos.stream()
            .collect(Collectors.groupingBy(Pedido::cliente, java.util.TreeMap::new, Collectors.summingDouble(Pedido::valor)));
        System.out.println(gastoPorCliente);

        String clientes = pedidos.stream().map(Pedido::cliente).distinct().sorted().collect(Collectors.joining(", ", "[", "]"));
        System.out.println(clientes);

        Optional<Pedido> maior = pedidos.stream().max(java.util.Comparator.comparingDouble(Pedido::valor));
        System.out.println(maior.map(Pedido::cliente).orElse("ninguém"));

        System.out.println(pedidos.stream().anyMatch(p -> p.valor() > 200) + " " + pedidos.stream().allMatch(p -> p.valor() > 50));

        System.out.println(IntStream.rangeClosed(1, 5).map(n -> n * n).sum());
        System.out.println(List.of(List.of(1, 2), List.of(3), List.<Integer>of()).stream().flatMap(List::stream).toList());

        Map<Boolean, List<Integer>> partes = IntStream.rangeClosed(1, 8).boxed().collect(Collectors.partitioningBy(n -> n % 2 == 0));
        System.out.println(partes);
    }
}` },
    { tipo: "codigo", linguagem: "text", legenda: "Saída", texto: `[2, 3]
555.5
{jogos=2, livros=3}
{Ana=200.0, Bruno=310.0, Carla=45.5}
[Ana, Bruno, Carla]
Bruno
true false
55
[1, 2, 3]
{false=[1, 3, 5, 7], true=[2, 4, 6, 8]}` },
    { tipo: "p", texto: "Leia o código como uma frase. Os pedidos grandes são os que têm valor acima de 100, e o resultado é a lista dos seus identificadores: filter, map e toList. O total vem de mapToDouble(...).sum(), a versão especializada para números primitivos (existem IntStream, LongStream e DoubleStream, que evitam a conversão para objetos). O Collectors.groupingBy faz o trabalho de um laço inteiro: agrupa os pedidos por categoria e conta quantos há em cada uma, e, com um coletor de soma como segundo argumento, calcula o gasto de cada cliente. O max devolve um Optional, já que um fluxo vazio não tem máximo, e o flatMap \"achata\" uma lista de listas em uma só." },
    { tipo: "tabela", legenda: "Collectors que você mais vai usar", cabecalho: ["Coletor", "O que produz"], linhas: [
      ["toList() (ou o método stream.toList())", "Uma lista, no Java 16+ imutável quando se usa o método do próprio Stream."],
      ["toSet()", "Um conjunto sem repetição."],
      ["joining(sep, prefixo, sufixo)", "Um texto com os elementos juntados."],
      ["groupingBy(chave)", "Um Map de chave para lista dos elementos."],
      ["groupingBy(chave, downstream)", "Um Map de chave para um resultado agregado (counting, summingDouble, averagingInt)."],
      ["partitioningBy(teste)", "Um Map com duas entradas: true e false."],
      ["toMap(chave, valor, combinar)", "Um Map; informe como combinar se houver chaves repetidas."],
    ] },

    { tipo: "h", texto: "Preguiça e consumo único" },
    { tipo: "p", texto: "Os Streams são preguiçosos: nada acontece enquanto não houver uma operação terminal, e, quando há, os elementos passam pelo pipeline um a um, e não etapa por etapa. Isso permite parar cedo (findFirst, limit, anyMatch) sem processar o resto. O exemplo abaixo mostra isso de forma concreta, e mostra também duas armadilhas clássicas." },
    { tipo: "codigo", linguagem: "java", legenda: "Cuidados.java", texto: `import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.stream.Stream;

public class Cuidados {
    public static void main(String[] args) {
        Stream<String> fluxo = Stream.of("a", "bb", "ccc")
            .filter(s -> {
                System.out.println("filtrando " + s);
                return s.length() > 1;
            })
            .map(s -> {
                System.out.println("mapeando " + s);
                return s.toUpperCase();
            });
        System.out.println("nada executou ainda");
        System.out.println(fluxo.findFirst().get());

        Stream<Integer> uso = Stream.of(1, 2, 3);
        System.out.println(uso.count());
        try {
            uso.count();
        } catch (IllegalStateException e) {
            System.out.println("o fluxo já foi consumido");
        }

        try {
            Stream.of("x", "y", "x").collect(Collectors.toMap(s -> s, String::length));
        } catch (IllegalStateException e) {
            System.out.println("chave duplicada");
        }
        Map<String, Integer> ok = Stream.of("x", "y", "x").collect(Collectors.toMap(s -> s, String::length, Integer::sum));
        System.out.println(new java.util.TreeMap<>(ok));

        List<Integer> destino = new java.util.ArrayList<>();
        Stream.of(1, 2, 3).map(n -> n * 2).forEach(destino::add);
        System.out.println(destino);
    }
}` },
    { tipo: "codigo", linguagem: "text", legenda: "Saída", texto: `nada executou ainda
filtrando a
filtrando bb
mapeando bb
BB
3
o fluxo já foi consumido
chave duplicada
{x=2, y=1}
[2, 4, 6]` },
    { tipo: "p", texto: "Observe a ordem. A mensagem \"nada executou ainda\" saiu antes de qualquer filtro, porque o pipeline só foi montado. Quando o findFirst pediu o primeiro elemento, \"a\" foi rejeitado pelo filtro, \"bb\" passou e foi mapeado, e o fluxo parou: o \"ccc\" nunca foi visto. Depois, um Stream só pode ser consumido uma vez: a segunda operação terminal lança IllegalStateException, e para reutilizar é preciso criar outro Stream a partir da fonte. Por fim, o toMap sem função de combinação lança exceção quando há chaves repetidas, e com Integer::sum a duplicata é resolvida." },
    { tipo: "alerta", titulo: "Não use Streams para efeitos colaterais", texto: "O último trecho do exemplo funciona, mas é um mau uso: um forEach que adiciona em uma lista externa altera estado de fora do pipeline, o que é difícil de entender e inseguro em fluxos paralelos. Prefira terminar com toList() ou collect(...) e deixar o Stream produzir o resultado." },
    { tipo: "h3", texto: "E os Streams paralelos?" },
    { tipo: "p", texto: "Basta trocar stream() por parallelStream() para dividir o trabalho entre núcleos. Parece um ganho gratuito, mas não é: em coleções pequenas, o custo de dividir e juntar é maior do que o ganho, operações com estado compartilhado dão resultados errados, e o paralelismo usa um conjunto de threads comum a todo o programa. Só use depois de medir, em tarefas grandes e independentes entre si." },

    { tipo: "h3", texto: "Exceções e lambdas" },
    { tipo: "p", texto: "Um ponto que costuma frustrar quem começa: as interfaces funcionais da biblioteca não declaram exceções verificadas (checked). Se dentro de um map você chamar um método que lança IOException, o código não compila, e a saída mais comum é envolver a chamada em um try/catch dentro da lambda, o que deixa o pipeline feio. Duas alternativas são mais limpas: extrair a chamada para um método próprio que trata o erro e devolve um resultado (um Optional ou um valor padrão), ou deixar o trecho de I/O fora do Stream e usar o Stream apenas na transformação dos dados já lidos. Como regra geral, o Stream deve cuidar de transformar dados em memória, e o tratamento de falhas deve ficar em volta dele." },
    { tipo: "p", texto: "Vale lembrar também a diferença em relação às classes anônimas, que as lambdas substituíram na maior parte dos casos. Dentro de uma lambda, this se refere à classe que a contém, e não à própria lambda, e o código gerado é mais enxuto. Isso explica por que as lambdas são não só mais curtas, mas também mais fáceis de raciocinar: elas não criam um novo escopo de classe, e usam apenas o que está ao redor." },

    { tipo: "h", texto: "Quando não usar um Stream" },
    { tipo: "lista", itens: [
      "Quando o laço tem lógica de controle complexa (vários break, continue ou retornos antecipados): um for comum é mais claro.",
      "Quando a operação precisa de índices ou de modificar a coleção sendo percorrida.",
      "Quando o pipeline passa de cinco ou seis etapas ou usa lambdas de várias linhas: extraia métodos com nomes e use referências a eles.",
      "Quando você só precisa de um laço simples com efeito colateral (imprimir, gravar): o for-each exprime melhor a intenção.",
      "Quando depurar passo a passo é essencial: pipelines são mais difíceis de inspecionar do que laços.",
    ] },
    { tipo: "dica", titulo: "Nomeie as lambdas que importam", texto: "Se uma lambda for longa ou tiver regra de negócio, dê um nome a ela: guarde-a em um Predicate<Pedido> chamado pedidoGrande, ou em um método estático, e use pedidos.stream().filter(pedidoGrande). O pipeline continua legível, e a regra passa a ter nome e pode ser testada sozinha." },
  ],
  questoes: [
    {
      enunciado: "O que é uma interface funcional?",
      opcoes: ["Uma interface sem nenhum método", "Uma interface que só pode ser usada em Streams", "Uma interface com todos os métodos estáticos", "Uma interface com exatamente um método abstrato, que pode ser implementada por uma lambda"],
      correta: 3,
      explicacao: "Uma lambda implementa o único método abstrato de uma interface funcional, como Function, Predicate ou Runnable. Se houver mais de um método abstrato, o compilador não sabe qual implementar.",
    },
    {
      enunciado: "O que imprime o código abaixo?\n\nFunction<Integer, Integer> dobro = n -> n * 2;\nFunction<Integer, Integer> maisUm = n -> n + 1;\nSystem.out.println(dobro.andThen(maisUm).apply(5));",
      opcoes: ["12", "10", "11", "6"],
      correta: 2,
      explicacao: "O andThen aplica primeiro o dobro (10) e depois o maisUm (11). O compose faria o contrário: primeiro maisUm (6) e depois o dobro (12).",
    },
    {
      enunciado: "Quando um Stream com filter e map é efetivamente executado?",
      opcoes: ["Quando o filter é chamado", "Quando uma operação terminal (como toList ou count) é chamada", "Quando o programa é compilado", "Assim que o Stream é criado"],
      correta: 1,
      explicacao: "As operações intermediárias só descrevem o pipeline. A execução, preguiçosa, começa quando uma operação terminal pede o resultado.",
    },
    {
      enunciado: "O que acontece ao chamar duas operações terminais no mesmo Stream?",
      opcoes: ["As duas funcionam normalmente", "A segunda lança IllegalStateException, porque o Stream já foi consumido", "O Stream é reiniciado automaticamente", "Erro de compilação"],
      correta: 1,
      explicacao: "Um Stream é de uso único. Para percorrer os dados de novo, crie outro Stream a partir da fonte original.",
    },
    {
      enunciado: "Qual coletor agrupa pedidos em um Map de categoria para a lista dos pedidos dessa categoria?",
      opcoes: ["Collectors.groupingBy(Pedido::categoria)", "Collectors.joining(...)", "Collectors.counting()", "Collectors.toSet()"],
      correta: 0,
      explicacao: "O groupingBy cria um Map em que a chave é o resultado da função de classificação e o valor é a lista dos elementos. Com um segundo coletor, o valor pode ser uma contagem, uma soma e assim por diante.",
    },
    {
      enunciado: "Por que Collectors.toMap(s -> s, String::length) lança exceção para a entrada [\"x\", \"y\", \"x\"]?",
      opcoes: ["Porque String::length não existe", "Porque há uma chave repetida e não foi informada uma função para combinar os valores", "Porque o Map é imutável", "Porque o Stream está vazio"],
      correta: 1,
      explicacao: "Com chaves duplicadas, o toMap lança IllegalStateException. Passar uma função de combinação (por exemplo, Integer::sum) resolve a duplicata.",
    },
    {
      enunciado: "Em qual situação um laço for comum costuma ser melhor que um Stream?",
      opcoes: ["Para somar valores de uma lista", "Para filtrar uma lista por uma condição simples", "Para uma lógica com vários break e retornos antecipados, ou que precise do índice", "Para agrupar elementos por chave"],
      correta: 2,
      explicacao: "Streams brilham em transformações declarativas. Lógica de controle complexa, índices e modificações da coleção ficam mais claros e depuráveis em um laço tradicional.",
    },
  ],
  desafio: {
    titulo: "Relatório de vendas com Streams",
    enunciado: "Escreva um programa (Relatorio.java) que gera um relatório a partir de uma lista de vendas, usando Streams e Collectors. Dados fictícios bastam: crie ao menos 12 vendas em uma lista de records.",
    requisitos: [
      "Modele Venda como record (id, vendedor, produto, categoria, quantidade, precoUnitario) e crie os dados de teste.",
      "Calcule o faturamento total e o ticket médio (faturamento dividido pelo número de vendas).",
      "Produza o faturamento por categoria, ordenado do maior para o menor, e os 3 vendedores que mais faturaram.",
      "Agrupe os produtos vendidos por vendedor em um Map<String, Set<String>>, e junte os nomes dos vendedores em uma única linha separada por vírgula.",
      "Particione as vendas entre as de valor alto (acima de uma constante com nome) e as demais, e mostre a contagem de cada grupo.",
    ],
    criterios: [
      "Nenhum cálculo usa laço com acumulador manual: tudo é feito com Stream.",
      "As regras de negócio têm nome (constantes, Predicate ou métodos), e não aparecem como números soltos nas lambdas.",
      "Nenhuma operação altera uma coleção externa dentro do pipeline.",
      "O programa lida com a lista vazia sem lançar exceção nem imprimir NaN.",
      "Você consegue explicar por que o programa não faz nada até a operação terminal.",
    ],
    dica: "Monte o pipeline um passo de cada vez, imprimindo o resultado intermediário com toList(). Só encadeie tudo depois de cada etapa estar certa, e aproveite para escrever as lambdas como métodos com nomes, se ficarem longas.",
  },
  referencias: [
    { titulo: "Dev.java: Expressões lambda (em inglês)", url: "https://dev.java/learn/lambdas/" },
    { titulo: "Dev.java: Streams (em inglês)", url: "https://dev.java/learn/api/collections-and-streams/" },
  ],
};
