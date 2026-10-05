import type { Modulo } from "../tipos";

export const JAVA_MODULO_5: Modulo = {
  tipo: "modulo",
  slug: "colecoes-generics-e-optional",
  titulo: "Coleções, generics e Optional",
  resumo: "List, Set e Map na prática, como escolher entre eles, generics com tipos limitados, Comparator e como lidar com a ausência de valor sem NullPointerException.",
  nivel: "Iniciante",
  leitura: "50 min",
  objetivos: [
    "Escolher entre List, Set e Map conforme o problema e conhecer o custo de cada operação.",
    "Usar os métodos que evitam código repetitivo (getOrDefault, merge, computeIfAbsent, removeIf).",
    "Escrever métodos e classes genéricos e ler assinaturas com extends e curingas.",
    "Ordenar com Comparable e Comparator, inclusive por vários critérios.",
    "Usar Optional para representar a ausência de valor sem espalhar null pelo código.",
  ],
  preRequisitos: [
    "Ter feito os módulos sobre orientação a objetos e herança e interfaces.",
    "Conhecer arrays, laços e métodos.",
  ],
  pontosChave: [
    "List guarda uma sequência com repetição; Set guarda elementos únicos; Map associa chaves a valores.",
    "Declare variáveis pelo tipo da interface (List, Map), e escolha a implementação só no new.",
    "HashSet e HashMap dependem de equals e hashCode corretos nos elementos e chaves.",
    "Generics fazem o compilador conferir os tipos, em vez de deixar o erro para a execução.",
    "Optional é para o retorno de métodos que podem não ter resultado: não é para campos nem parâmetros.",
  ],
  blocos: [
    { tipo: "p", texto: "Com arrays você guarda vários valores, mas o tamanho é fixo e não há operações prontas. Programas reais precisam de coleções: estruturas que crescem e encolhem, procuram elementos e mantêm a ordem ou a unicidade. A biblioteca padrão do Java traz uma família inteira delas (o Java Collections Framework), e saber escolher a certa é uma das habilidades que mais separam um código claro de um lento ou frágil. Este módulo cobre as três mais usadas, os generics que as tornam seguras e o Optional, que resolve um dos erros mais famosos da linguagem: a referência nula." },

    { tipo: "h", texto: "As três famílias: List, Set e Map" },
    { tipo: "tabela", legenda: "Qual coleção usar", cabecalho: ["Interface", "Ideia", "Repetidos?", "Ordem", "Implementações comuns"], linhas: [
      ["List", "Sequência de elementos acessados por posição.", "Sim", "A de inserção.", "ArrayList (a escolha padrão), LinkedList"],
      ["Set", "Conjunto de elementos únicos.", "Não", "HashSet: nenhuma garantida. LinkedHashSet: a de inserção. TreeSet: ordenada.", "HashSet, LinkedHashSet, TreeSet"],
      ["Map", "Associação de chaves únicas a valores.", "Chaves não; valores sim", "HashMap: nenhuma garantida. LinkedHashMap: de inserção. TreeMap: pelas chaves.", "HashMap, LinkedHashMap, TreeMap"],
    ] },
    { tipo: "p", texto: "Uma regra de estilo vale ouro: declare a variável pelo tipo da interface (List<String> nomes) e deixe a classe concreta só para o new (new ArrayList<>()). Assim, trocar a implementação depois exige mexer em uma linha só, e os métodos e parâmetros do seu código dependem do contrato, e não do detalhe. O <> vazio, chamado de operador diamante, pede ao compilador que deduza o tipo dos elementos." },
    { tipo: "codigo", linguagem: "java", legenda: "Colecoes.java", texto: `import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.TreeMap;
import java.util.TreeSet;

public class Colecoes {
    public static void main(String[] args) {
        List<String> nomes = new ArrayList<>();
        nomes.add("Carla");
        nomes.add("Ana");
        nomes.add("Bruno");
        nomes.add("Ana");
        System.out.println(nomes + " tamanho=" + nomes.size());
        System.out.println(nomes.get(1) + " " + nomes.indexOf("Bruno") + " " + nomes.contains("Zé"));

        Set<String> unicos = new LinkedHashSet<>(nomes);
        System.out.println(unicos);
        System.out.println(new TreeSet<>(nomes));

        Map<String, Integer> idades = new HashMap<>();
        idades.put("Ana", 31);
        idades.put("Bruno", 25);
        idades.put("Ana", 32);
        System.out.println(idades.get("Ana") + " " + idades.get("Zé") + " " + idades.getOrDefault("Zé", 0));

        Map<String, Integer> contagem = new TreeMap<>();
        for (String nome : nomes) {
            contagem.merge(nome, 1, Integer::sum);
        }
        System.out.println(contagem);

        Map<Integer, List<String>> porTamanho = new TreeMap<>();
        for (String nome : unicos) {
            porTamanho.computeIfAbsent(nome.length(), k -> new ArrayList<>()).add(nome);
        }
        System.out.println(porTamanho);

        for (Map.Entry<String, Integer> e : contagem.entrySet()) {
            System.out.print(e.getKey() + "=" + e.getValue() + ";");
        }
        System.out.println();

        List<String> fixa = List.of("a", "b");
        try {
            fixa.add("c");
        } catch (UnsupportedOperationException e) {
            System.out.println("lista imutável");
        }

        try {
            for (String nome : nomes) {
                if (nome.equals("Ana")) nomes.remove(nome);
            }
        } catch (java.util.ConcurrentModificationException e) {
            System.out.println("modificou durante a iteração");
        }
        nomes.removeIf(n -> n.equals("Ana"));
        System.out.println(nomes);
    }
}` },
    { tipo: "codigo", linguagem: "text", legenda: "Saída", texto: `[Carla, Ana, Bruno, Ana] tamanho=4
Ana 2 false
[Carla, Ana, Bruno]
[Ana, Bruno, Carla]
32 null 0
{Ana=2, Bruno=1, Carla=1}
{3=[Ana], 5=[Carla, Bruno]}
Ana=2;Bruno=1;Carla=1;
lista imutável
modificou durante a iteração
[Carla, Bruno]` },
    { tipo: "p", texto: "Percorra o resultado linha por linha. A lista aceita repetidos e mantém a ordem de inserção (Ana aparece duas vezes). Os conjuntos eliminam o repetido: o LinkedHashSet preserva a ordem em que os elementos entraram, e o TreeSet os ordena. No mapa, colocar uma chave que já existe substitui o valor (Ana passa de 31 para 32), e buscar uma chave ausente devolve null, a menos que você use getOrDefault." },

    { tipo: "h3", texto: "Métodos que evitam código repetitivo" },
    { tipo: "lista", itens: [
      "getOrDefault(chave, padrão): lê um valor ou usa um padrão se a chave não existir, sem if.",
      "merge(chave, valor, função): combina com o valor existente. O padrão contador contagem.merge(nome, 1, Integer::sum) substitui um bloco de cinco linhas de if e put.",
      "computeIfAbsent(chave, função): cria o valor só quando falta. É a forma idiomática de montar um mapa de listas (agrupamento), como no exemplo.",
      "removeIf(condição): remove da coleção todos os elementos que satisfazem o teste, de forma segura.",
      "List.of(...), Set.of(...) e Map.of(...): criam coleções imutáveis, ótimas para constantes. Alterá-las lança UnsupportedOperationException.",
    ] },
    { tipo: "alerta", titulo: "Não altere uma coleção enquanto a percorre", texto: "Remover ou adicionar elementos dentro de um for-each lança ConcurrentModificationException (como no exemplo). Para remover durante a varredura, use removeIf, um Iterator com iterator.remove() ou construa uma coleção nova com o resultado." },

    { tipo: "h", texto: "Como o HashMap acha as coisas" },
    { tipo: "p", texto: "O HashMap e o HashSet são rápidos porque usam uma tabela de espalhamento. Para guardar uma chave, o Java chama o seu hashCode, que dá um número, e usa esse número para escolher em qual \"balde\" da tabela ela fica. Para achá-la depois, vai direto ao balde e compara, com equals, só os poucos elementos que estão ali. É por isso que o custo médio de buscar, inserir e remover é constante, e não cresce com o tamanho da coleção." },
    { tipo: "p", texto: "Daí vem a regra que você viu no módulo de orientação a objetos: quem vai ser chave de um mapa ou elemento de um conjunto precisa implementar equals e hashCode de forma consistente, e de preferência ser imutável. Se um objeto mudar depois de entrar na tabela, o seu hash muda, e ele \"some\": ainda está lá, mas no balde errado. Os tipos da biblioteca (String, Integer, enums, records) já são seguros para isso." },
    { tipo: "tabela", legenda: "Custo aproximado das operações mais comuns", cabecalho: ["Coleção", "Buscar por valor", "Acessar por posição", "Inserir", "Observação"], linhas: [
      ["ArrayList", "O(n)", "O(1)", "O(1) no fim; O(n) no meio", "A melhor opção padrão para sequências."],
      ["LinkedList", "O(n)", "O(n)", "O(1) nas pontas", "Raramente vale a pena; use ArrayList ou ArrayDeque."],
      ["HashSet / HashMap", "O(1) em média", "Não se aplica", "O(1) em média", "Sem ordem garantida."],
      ["TreeSet / TreeMap", "O(log n)", "Não se aplica", "O(log n)", "Mantém tudo ordenado."],
    ] },

    { tipo: "h", texto: "Generics: tipos como parâmetros" },
    { tipo: "p", texto: "Antes dos generics, uma lista guardava Object, e você precisava converter cada elemento na leitura, com o risco de errar o tipo e só descobrir em execução. Os generics permitem declarar a lista de um tipo (List<String>) e fazem o compilador garantir isso: colocar um Integer em uma List<String> deixa de compilar. Você também pode escrever as suas próprias classes e métodos genéricos, com parâmetros de tipo entre colchetes angulares." },
    { tipo: "codigo", linguagem: "java", legenda: "Genericos.java", texto: `import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;

public class Genericos {
    public static void main(String[] args) {
        Caixa<String> texto = new Caixa<>("oi");
        Caixa<Integer> numero = new Caixa<>(42);
        System.out.println(texto.valor().length() + " " + (numero.valor() + 1));

        System.out.println(maior(List.of(3, 9, 4)) + " " + maior(List.of("kiwi", "uva", "maçã")));
        System.out.println(somar(List.of(1, 2, 3)) + " " + somar(List.of(1.5, 2.5)));

        List<Pessoa> pessoas = new ArrayList<>(List.of(new Pessoa("Ana", 32), new Pessoa("Bruno", 25), new Pessoa("Carla", 32)));
        pessoas.sort(Comparator.comparingInt(Pessoa::idade).reversed().thenComparing(Pessoa::nome));
        System.out.println(pessoas);

        System.out.println(buscar(pessoas, "Bruno").map(Pessoa::idade).orElse(-1));
        System.out.println(buscar(pessoas, "Zé").map(Pessoa::idade).orElse(-1));
        System.out.println(buscar(pessoas, "Zé").isPresent());
        try {
            buscar(pessoas, "Zé").orElseThrow(() -> new IllegalArgumentException("não achei o Zé"));
        } catch (IllegalArgumentException e) {
            System.out.println(e.getMessage());
        }
    }

    static <T extends Comparable<T>> T maior(List<T> itens) {
        T melhor = itens.get(0);
        for (T item : itens) {
            if (item.compareTo(melhor) > 0) melhor = item;
        }
        return melhor;
    }

    static double somar(List<? extends Number> numeros) {
        double total = 0;
        for (Number n : numeros) total += n.doubleValue();
        return total;
    }

    static Optional<Pessoa> buscar(List<Pessoa> pessoas, String nome) {
        return pessoas.stream().filter(p -> p.nome().equals(nome)).findFirst();
    }
}

record Caixa<T>(T valor) {}

record Pessoa(String nome, int idade) {}` },
    { tipo: "codigo", linguagem: "text", legenda: "Saída", texto: `2 43
9 uva
6.0 4.0
[Pessoa[nome=Ana, idade=32], Pessoa[nome=Carla, idade=32], Pessoa[nome=Bruno, idade=25]]
25
-1
false
não achei o Zé` },
    { tipo: "p", texto: "Alguns pontos desse código merecem explicação. O record Caixa<T> é genérico: Caixa<String> e Caixa<Integer> são usos diferentes da mesma definição, e o compilador sabe o tipo de valor() em cada caso. O método maior declara <T extends Comparable<T>>, o que quer dizer \"qualquer tipo T que saiba se comparar com outro T\": isso permite chamar compareTo dentro do método e funciona tanto para números como para textos. E o método somar usa um curinga, List<? extends Number>, que aceita uma lista de qualquer subtipo de Number (inteiros, decimais) e permite apenas lê-la." },
    { tipo: "dica", titulo: "A regra do curinga: produtor extends, consumidor super", texto: "Quando você só lê elementos de uma coleção genérica, use ? extends T. Quando só escreve nela, use ? super T. Se faz as duas coisas, use o tipo exato, sem curinga. Você não precisa decorar isso agora, mas, ao encontrar essas assinaturas nas bibliotecas, já saberá o que significam." },
    { tipo: "alerta", titulo: "Generics só existem na compilação", texto: "O Java apaga os parâmetros de tipo depois de compilar (type erasure). Por isso você não pode escrever new T(), instanceof List<String> nem criar um array de T. Em compensação, o código gerado é compatível com o anterior aos generics." },

    { tipo: "h", texto: "Ordenação: Comparable e Comparator" },
    { tipo: "p", texto: "Para ordenar uma lista de objetos, o Java precisa saber como compará-los. Há duas formas. Um tipo pode implementar Comparable<T>, definindo a sua ordem natural (é o caso de String e dos números). Ou você passa um Comparator, um objeto que define uma ordem sob medida, sem alterar a classe. Os comparadores se compõem: Comparator.comparingInt(Pessoa::idade).reversed().thenComparing(Pessoa::nome) ordena por idade decrescente e, em caso de empate, por nome, como visto no exemplo anterior (Ana e Carla têm a mesma idade e foram desempatadas pelo nome)." },

    { tipo: "h", texto: "Optional: o fim do null por toda parte" },
    { tipo: "p", texto: "A referência nula, criada em 1965, foi chamada por seu próprio inventor de \"erro de um bilhão de dólares\". Em Java, qualquer variável de objeto pode ser null, e chamar um método nela lança NullPointerException. O problema é que a assinatura de um método não diz se ele pode devolver null: você precisa ler a documentação, e esquecer a verificação é fácil. A classe Optional<T> expressa isso no tipo: um Optional<Pessoa> é uma caixa que pode conter uma pessoa ou estar vazia, e o compilador obriga quem chama a lidar com isso." },
    { tipo: "p", texto: "No exemplo, buscar devolve Optional<Pessoa>. Quem o usa tem várias formas seguras de continuar: map transforma o valor se ele existir (e propaga a ausência se não), orElse define um valor padrão, orElseThrow lança uma exceção com a mensagem que você escolher, e isPresent apenas pergunta. O que não se deve fazer é chamar get() sem verificar, que troca um NullPointerException por um NoSuchElementException." },
    { tipo: "lista", itens: [
      "Use Optional como tipo de retorno de métodos que podem legitimamente não achar nada (buscas, por exemplo).",
      "Não use Optional em atributos de classe, parâmetros de métodos nem em elementos de coleções: ele não foi feito para isso e só adiciona ruído.",
      "Nunca devolva null de um método que retorna coleção: devolva uma coleção vazia (List.of()).",
      "Para validar argumentos que não podem ser nulos, use Objects.requireNonNull(valor, \"mensagem\") logo na entrada.",
      "Prefira orElseThrow ou map a get() e isPresent() seguido de get().",
    ] },
    { tipo: "h", texto: "Escolhendo sem pensar demais" },
    { tipo: "p", texto: "Na dúvida, siga o caminho curto. Precisa de uma sequência? ArrayList. Precisa de elementos sem repetição? HashSet, ou LinkedHashSet/TreeSet se a ordem importar. Precisa achar algo pela chave? HashMap, ou TreeMap se quiser as chaves ordenadas. Precisa de uma constante que não muda? List.of, Set.of ou Map.of. Só otimize a escolha depois de medir, e quase sempre o problema de desempenho estará em um algoritmo (por exemplo, procurar em uma lista dentro de um laço, em vez de usar um mapa), e não na implementação escolhida." },
  ],
  questoes: [
    {
      enunciado: "Qual coleção usar para guardar elementos sem repetição, mantendo a ordem em que foram inseridos?",
      opcoes: ["ArrayList", "HashSet", "LinkedHashSet", "TreeMap"],
      correta: 2,
      explicacao: "O LinkedHashSet elimina repetidos e preserva a ordem de inserção. O HashSet não garante ordem, a ArrayList aceita repetidos e o TreeMap é um mapa ordenado pelas chaves.",
    },
    {
      enunciado: "O que imprime o código abaixo?\n\nMap<String, Integer> m = new HashMap<>();\nm.put(\"a\", 1);\nm.put(\"a\", 2);\nSystem.out.println(m.size() + \" \" + m.get(\"a\"));",
      opcoes: ["2 1", "1 2", "2 2", "1 1"],
      correta: 1,
      explicacao: "Colocar uma chave que já existe substitui o valor. O mapa fica com uma entrada só (a=2).",
    },
    {
      enunciado: "Por que objetos usados como chave de um HashMap devem implementar equals e hashCode de forma consistente?",
      opcoes: ["Porque o HashMap ordena as chaves usando o hashCode", "Porque o Java exige a anotação @Override", "Porque o toString é usado para comparar", "Porque o hashCode escolhe o balde e o equals confirma o elemento; sem consistência, a chave pode não ser encontrada"],
      correta: 3,
      explicacao: "A busca vai ao balde indicado pelo hashCode e usa equals para achar o elemento. Se objetos iguais tiverem hashes diferentes, a busca procura no balde errado e não encontra.",
    },
    {
      enunciado: "O que acontece ao remover um elemento de uma ArrayList dentro de um for-each sobre ela mesma?",
      opcoes: ["Costuma lançar ConcurrentModificationException", "Funciona sempre", "O elemento é removido e o laço reinicia", "Erro de compilação"],
      correta: 0,
      explicacao: "Modificar a estrutura de uma coleção durante o for-each invalida o iterador, e a próxima iteração lança ConcurrentModificationException. Use removeIf ou um Iterator.",
    },
    {
      enunciado: "O que significa o método <T extends Comparable<T>> T maior(List<T> itens)?",
      opcoes: ["Aceita uma lista de qualquer tipo", "Aceita uma lista de elementos de um tipo T que sabe se comparar com outros T", "Só aceita listas de String", "Devolve sempre null"],
      correta: 1,
      explicacao: "O limite T extends Comparable<T> restringe T aos tipos comparáveis, o que permite chamar compareTo dentro do método. Funciona com números, textos e qualquer classe que implemente Comparable.",
    },
    {
      enunciado: "Qual é o uso recomendado de Optional?",
      opcoes: ["Como tipo de atributos de classe", "Como parâmetro de todos os métodos", "Como elemento de listas grandes", "Como tipo de retorno de métodos que podem não ter resultado"],
      correta: 3,
      explicacao: "O Optional serve para sinalizar, no tipo de retorno, que pode não haver valor. Em atributos, parâmetros e coleções, ele só acrescenta ruído e não é a intenção do projeto.",
    },
    {
      enunciado: "Qual das expressões evita NullPointerException e define um valor padrão se o Optional estiver vazio?",
      opcoes: ["opt.get()", "opt.isPresent()", "opt.orElse(padrao)", "opt == null"],
      correta: 2,
      explicacao: "orElse devolve o valor contido ou o padrão informado. O get() lança NoSuchElementException se estiver vazio, o isPresent() só consulta, e comparar o Optional com null não faz sentido: ele nunca deve ser nulo.",
    },
  ],
  desafio: {
    titulo: "Gerenciador de alunos e notas",
    enunciado: "Escreva um programa (Turma.java) que gerencia uma turma usando coleções, generics e Optional, sem usar arrays. O objetivo é praticar a escolha da coleção certa para cada necessidade.",
    requisitos: [
      "Modele Aluno como um record (matricula, nome) e guarde as notas de cada aluno em um Map<Aluno, List<Double>>.",
      "Implemente um método buscarPorMatricula que devolve Optional<Aluno>, e use map/orElse/orElseThrow ao consumi-lo.",
      "Calcule a média de cada aluno e produza uma lista ordenada por média decrescente e, em caso de empate, por nome (com Comparator).",
      "Agrupe os alunos em um Map<String, List<Aluno>> por conceito (A, B, C, D) usando computeIfAbsent.",
      "Escreva um método genérico <T extends Comparable<T>> T melhorDe(List<T> itens) e use-o com notas e com nomes.",
    ],
    criterios: [
      "Nenhum método devolve null: ausências são Optional ou coleções vazias.",
      "As variáveis são declaradas pelas interfaces (List, Map), e não pelas classes concretas.",
      "O código não modifica coleções durante um for-each.",
      "A ordenação usa Comparator composto, e não um laço manual.",
      "Você consegue explicar por que o Aluno pode ser chave do mapa com segurança.",
    ],
    dica: "Records já implementam equals e hashCode com base nos campos, e são imutáveis: por isso funcionam bem como chaves de mapa. Se a nota mudasse a identidade do aluno, não funcionaria.",
  },
  referencias: [
    { titulo: "Dev.java: Coleções (em inglês)", url: "https://dev.java/learn/api/collections-framework/" },
    { titulo: "Dev.java: Generics (em inglês)", url: "https://dev.java/learn/generics/" },
    { titulo: "Documentação do Java: classe Optional (em inglês)", url: "https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/Optional.html" },
  ],
};
