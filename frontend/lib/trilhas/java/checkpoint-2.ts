import type { Checkpoint } from "../tipos";

export const JAVA_CHECKPOINT_2: Checkpoint = {
  tipo: "checkpoint",
  slug: "checkpoint-orientacao-a-objetos-e-colecoes",
  titulo: "Checkpoint: objetos, coleções e streams",
  resumo: "Nove questões sobre classes, herança, interfaces, coleções, generics, Optional, lambdas e Streams.",
  cobre: ["orientacao-a-objetos", "heranca-interfaces-e-polimorfismo", "colecoes-generics-e-optional", "lambdas-e-streams"],
  notaMinima: 0.7,
  questoes: [
    {
      enunciado: "Por que os atributos de uma classe costumam ser declarados como private e final sempre que possível?",
      opcoes: ["Para o programa rodar mais rápido", "Porque o compilador exige", "Para impedir que a classe tenha métodos", "Para proteger o estado do objeto, mantê-lo válido e, com final, torná-lo imutável depois de criado"],
      correta: 3,
      explicacao: "Encapsular o estado permite que a classe garanta as próprias regras, e atributos final eliminam uma classe de bugs ao impedir mudanças depois da construção. Não há ganho de velocidade, e o compilador não exige.",
    },
    {
      enunciado: "O que imprime o código abaixo?\n\nPonto a = new Ponto(1, 2);\nPonto b = new Ponto(1, 2);\nSystem.out.println((a == b) + \" \" + a.equals(b));\n\n(Ponto é uma classe comum com equals e hashCode implementados pelos campos x e y.)",
      opcoes: ["true true", "true false", "false true", "false false"],
      correta: 2,
      explicacao: "O == compara referências: são dois objetos distintos, então dá false. O equals sobrescrito compara o conteúdo dos campos e dá true.",
    },
    {
      enunciado: "Qual a vantagem de escrever a variável como List<String> nomes = new ArrayList<>() em vez de ArrayList<String> nomes?",
      opcoes: ["Nenhuma, é só estilo", "O código depende do contrato (a interface), e trocar a implementação exige mudar uma linha só", "O ArrayList não pode ser usado como tipo de variável", "A lista fica imutável"],
      correta: 1,
      explicacao: "Declarar pela interface desacopla o código da implementação concreta. Se amanhã for melhor usar outra List, a mudança fica restrita ao new.",
    },
    {
      enunciado: "Uma variável do tipo Animal guarda um objeto Gato, e Gato sobrescreve o método som(). Ao chamar animal.som(), qual versão executa?",
      opcoes: ["A de Gato, porque o objeto real é um Gato (despacho dinâmico)", "A de Animal, porque a variável é desse tipo", "Nenhuma, dá erro de compilação", "Depende da ordem de declaração das classes"],
      correta: 0,
      explicacao: "O tipo da variável define o que pode ser chamado, mas o objeto real define qual implementação executa. É o polimorfismo.",
    },
    {
      enunciado: "Quando uma classe abstrata é preferível a uma interface?",
      opcoes: ["Quando se quer que a classe implemente vários contratos", "Quando as subclasses compartilham estado e código e há uma relação real de tipo entre elas", "Nunca: interfaces sempre são melhores", "Quando as classes não têm nenhuma relação"],
      correta: 1,
      explicacao: "A classe abstrata guarda estado e comportamento comuns a filhas muito parecidas. Para papéis e capacidades que classes sem relação podem ter, e para múltiplos contratos, usa-se interface.",
    },
    {
      enunciado: "O que acontece ao remover elementos de uma ArrayList dentro de um for-each sobre ela mesma?",
      opcoes: ["Funciona sempre", "O Java ignora a remoção", "Costuma lançar ConcurrentModificationException", "Erro de compilação"],
      correta: 2,
      explicacao: "Alterar a estrutura da coleção durante a iteração invalida o iterador. Para remover com segurança, use removeIf ou um Iterator.",
    },
    {
      enunciado: "Qual das opções representa o uso recomendado de Optional?",
      opcoes: ["Um atributo de classe Optional<String> nome", "Um parâmetro de método Optional<String>", "O tipo de retorno de um método de busca que pode não achar nada", "Elementos de uma lista de milhares de itens"],
      correta: 2,
      explicacao: "O Optional comunica no tipo de retorno que pode não haver resultado. Em atributos, parâmetros e coleções, só adiciona ruído.",
    },
    {
      enunciado: "O que imprime o código abaixo?\n\nList<Integer> numeros = List.of(1, 2, 3, 4, 5, 6);\nSystem.out.println(numeros.stream().filter(n -> n % 2 == 0).map(n -> n * n).toList());",
      opcoes: ["[1, 4, 9, 16, 25, 36]", "[4, 16, 36]", "[2, 4, 6]", "[2, 8, 18]"],
      correta: 1,
      explicacao: "O filter mantém os pares (2, 4, 6) e o map os eleva ao quadrado: [4, 16, 36].",
    },
    {
      enunciado: "Por que o código abaixo não imprime nada ao ser executado?\n\nStream.of(1, 2, 3).map(n -> {\n    System.out.println(n);\n    return n * 2;\n});",
      opcoes: ["Porque o map não pode ter chaves", "Porque Stream.of é inválido", "Porque a lista está vazia", "Porque não há operação terminal: os Streams são preguiçosos e só executam quando há uma"],
      correta: 3,
      explicacao: "As operações intermediárias apenas descrevem o pipeline. Sem uma operação terminal (toList, count, forEach...), nada é executado.",
    },
  ],
};
