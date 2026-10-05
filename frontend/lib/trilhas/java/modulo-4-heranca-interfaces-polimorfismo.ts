import type { Modulo } from "../tipos";

export const JAVA_MODULO_4: Modulo = {
  tipo: "modulo",
  slug: "heranca-interfaces-e-polimorfismo",
  titulo: "Herança, interfaces e polimorfismo",
  resumo: "Reaproveitar e abstrair comportamento: extends, classes abstratas, interfaces, sealed e o polimorfismo que sustenta o Spring.",
  nivel: "Iniciante",
  leitura: "45 min",
  objetivos: [
    "Criar subclasses com extends, sobrescrever métodos e usar super.",
    "Escolher entre classe abstrata e interface conforme o problema.",
    "Explicar polimorfismo e como o Java decide qual método executar.",
    "Preferir composição à herança quando a relação não for de tipo.",
    "Usar interfaces sealed e pattern matching em switch para modelar casos fechados.",
  ],
  preRequisitos: [
    "Ter feito o módulo de orientação a objetos ou conhecer classes, construtores, encapsulamento e records.",
    "Saber compilar e executar um arquivo .java.",
  ],
  pontosChave: [
    "Herança expressa uma relação \"é um\" e acopla a filha à mãe: use com critério.",
    "O método executado depende do objeto real, e não do tipo da variável (polimorfismo).",
    "Interfaces definem contratos; uma classe pode implementar várias, mas estender só uma.",
    "Classe abstrata serve para compartilhar estado e código entre filhas muito parecidas.",
    "Programe para a interface: quem usa só precisa saber o que o objeto faz.",
  ],
  blocos: [
    { tipo: "p", texto: "Depois de modelar uma coisa com uma classe, o passo seguinte é lidar com coisas parecidas: contas corrente e poupança, pagamentos por cartão e por Pix, notificações por e-mail e SMS. O Java oferece dois mecanismos para isso, herança e interfaces, e a habilidade que você precisa desenvolver é saber qual usar. Errar essa escolha produz sistemas rígidos, onde mudar uma classe quebra dez outras." },

    { tipo: "h", texto: "Herança com extends" },
    { tipo: "p", texto: "Uma classe pode estender outra com a palavra extends. A filha (subclasse) recebe os atributos e métodos acessíveis da mãe (superclasse) e pode acrescentar os seus ou sobrescrever o comportamento herdado com @Override. Dentro da filha, super acessa o que é da mãe, e o construtor da filha precisa chamar um construtor da mãe com super(...) na primeira linha." },
    { tipo: "p", texto: "O ponto central é o polimorfismo, \"muitas formas\": uma variável do tipo da mãe pode guardar um objeto de qualquer filha, e, ao chamar um método sobrescrito, o Java executa a versão do objeto real, decidida em tempo de execução. Quem usa a variável não precisa saber qual é a filha." },
    { tipo: "codigo", linguagem: "java", legenda: "Animais.java", texto: `import java.util.List;

public class Animais {
    public static void main(String[] args) {
        List<Animal> bicho = List.of(new Cachorro("Rex"), new Gato("Mimi"), new Animal("Bicho"));

        for (Animal a : bicho) {
            System.out.println(a.apresentar());
        }
    }
}

class Animal {
    protected final String nome;

    Animal(String nome) {
        this.nome = nome;
    }

    String som() {
        return "...";
    }

    String apresentar() {
        return nome + " faz " + som();
    }
}

class Cachorro extends Animal {
    Cachorro(String nome) {
        super(nome);
    }

    @Override
    String som() {
        return "au";
    }
}

class Gato extends Animal {
    Gato(String nome) {
        super(nome);
    }

    @Override
    String som() {
        return "miau";
    }

    @Override
    String apresentar() {
        return super.apresentar() + " (e ignora você)";
    }
}` },
    { tipo: "codigo", linguagem: "text", legenda: "Saída", texto: `Rex faz au
Mimi faz miau (e ignora você)
Bicho faz ...` },
    { tipo: "p", texto: "O laço percorre uma lista de Animal e chama apresentar() em cada um. O código do laço nunca menciona Cachorro nem Gato, e, se amanhã existir um Papagaio, ele continuará funcionando sem alteração. Esse é o ganho: o código que usa depende da abstração, e as novidades entram como novas classes, sem mexer no que já funciona." },
    { tipo: "alerta", titulo: "@Override não é opcional na prática", texto: "Sem a anotação, um erro de digitação (apresentr, ou um parâmetro diferente) cria um método novo em vez de sobrescrever, e o programa compila e roda com o comportamento errado. Com @Override, o compilador recusa se nada está sendo sobrescrito. Use sempre." },

    { tipo: "h", texto: "Classes abstratas" },
    { tipo: "p", texto: "Às vezes a classe mãe não faz sentido sozinha: não existe uma \"Forma\" genérica, só círculos e retângulos. Uma classe abstract não pode ser instanciada e pode declarar métodos abstract, sem corpo, que cada filha é obrigada a implementar. Ela é o lugar certo para guardar o que as filhas compartilham (atributos, código comum) e, ao mesmo tempo, impor o que cada uma deve fornecer." },
    { tipo: "codigo", linguagem: "java", legenda: "Formas.java", texto: `public class Formas {
    public static void main(String[] args) {
        Forma[] formas = { new Circulo(1.0), new Retangulo(2.0, 3.0) };
        for (Forma f : formas) {
            System.out.printf(java.util.Locale.ROOT, "%s: área %.2f%n", f.nome(), f.area());
        }
    }
}

abstract class Forma {
    private final String nome;

    Forma(String nome) {
        this.nome = nome;
    }

    String nome() {
        return nome;
    }

    abstract double area();
}

class Circulo extends Forma {
    private final double raio;

    Circulo(double raio) {
        super("círculo");
        this.raio = raio;
    }

    @Override
    double area() {
        return Math.PI * raio * raio;
    }
}

class Retangulo extends Forma {
    private final double largura;
    private final double altura;

    Retangulo(double largura, double altura) {
        super("retângulo");
        this.largura = largura;
        this.altura = altura;
    }

    @Override
    double area() {
        return largura * altura;
    }
}` },
    { tipo: "codigo", linguagem: "text", legenda: "Saída", texto: `círculo: área 3.14
retângulo: área 6.00` },

    { tipo: "h", texto: "Interfaces: contratos" },
    { tipo: "p", texto: "Uma interface declara o que uma classe sabe fazer, sem dizer como. Uma classe a implementa com implements e se compromete a oferecer todos os métodos. Diferente da herança, uma classe pode implementar várias interfaces, o que permite que um mesmo objeto desempenhe papéis diferentes: um Pedido pode ser Comparable (ordenável) e Auditavel (tem registro de alterações)." },
    { tipo: "p", texto: "Desde o Java 8, interfaces podem ter métodos default, com um corpo padrão que as implementações herdam ou sobrescrevem. Isso permite evoluir um contrato sem quebrar quem já o implementa. Use com moderação: uma interface cheia de código vira uma classe abstrata disfarçada." },
    { tipo: "codigo", linguagem: "java", legenda: "Pagamentos.java", texto: `import java.util.List;

public class Pagamentos {
    public static void main(String[] args) {
        List<MeioDePagamento> meios = List.of(new Cartao(3), new Pix());

        for (MeioDePagamento meio : meios) {
            System.out.println(meio.descricao() + " -> " + meio.cobrar(300.0));
        }
    }
}

interface MeioDePagamento {
    double taxa();

    default String descricao() {
        return getClass().getSimpleName();
    }

    default double cobrar(double valor) {
        return valor + valor * taxa();
    }
}

class Cartao implements MeioDePagamento {
    private final int parcelas;

    Cartao(int parcelas) {
        this.parcelas = parcelas;
    }

    @Override
    public double taxa() {
        return parcelas > 1 ? 0.05 : 0.02;
    }
}

class Pix implements MeioDePagamento {
    @Override
    public double taxa() {
        return 0.0;
    }

    @Override
    public String descricao() {
        return "Pix instantâneo";
    }
}` },
    { tipo: "codigo", linguagem: "text", legenda: "Saída", texto: `Cartao -> 315.0
Pix instantâneo -> 300.0` },
    { tipo: "p", texto: "Note que os métodos de uma interface são public por padrão, e por isso as implementações precisam declará-los public. O código que recebe um MeioDePagamento não sabe, nem precisa saber, se é cartão ou Pix. Essa é a regra de ouro: programe para a interface, não para a implementação. Em Spring, quase tudo é conectado assim: você declara que precisa de um repositório (interface), e o framework entrega uma implementação." },
    { tipo: "tabela", legenda: "Classe abstrata ou interface?", cabecalho: ["Critério", "Classe abstrata", "Interface"], linhas: [
      ["Quantas posso usar", "Uma só (herança simples).", "Quantas quiser."],
      ["Guarda estado (atributos)?", "Sim.", "Não, só constantes."],
      ["Relação que expressa", "É um tipo de (Cachorro é Animal).", "Sabe fazer (Cartao sabe cobrar)."],
      ["Quando preferir", "Filhas parecidas que compartilham código e dados.", "Um papel ou capacidade que classes sem relação podem ter."],
    ] },
    { tipo: "dica", titulo: "Uma regra simples", texto: "Comece pela interface. Só introduza uma classe abstrata quando perceber código e atributos realmente repetidos nas implementações, e então faça a abstrata implementar a interface. Assim você mantém o contrato limpo e reaproveita o código." },

    { tipo: "h", texto: "Herança demais é um problema" },
    { tipo: "p", texto: "Herança parece uma forma barata de reaproveitar código, mas custa caro. A filha depende dos detalhes da mãe: se a mãe muda, todas as filhas podem quebrar. Hierarquias profundas (A estende B, que estende C, que estende D) tornam impossível entender o comportamento de um objeto sem ler quatro classes. E herança é uma decisão para a vida toda: não dá para mudar a superclasse de um objeto em tempo de execução." },
    { tipo: "p", texto: "A alternativa é a composição: em vez de ser uma coisa, o objeto tem uma coisa que faz o trabalho. Em vez de criar PedidoComDescontoDeCupom e PedidoComDescontoDeFidelidade, o Pedido recebe uma política de desconto, que é uma interface. Trocar o comportamento vira trocar um objeto." },
    { tipo: "codigo", linguagem: "java", legenda: "Descontos.java", texto: `public class Descontos {
    public static void main(String[] args) {
        Pedido a = new Pedido(200.0, new SemDesconto());
        Pedido b = new Pedido(200.0, new Percentual(10));
        Pedido c = new Pedido(200.0, valor -> Math.max(0, valor - 50));

        System.out.println(a.total() + " " + b.total() + " " + c.total());
    }
}

interface PoliticaDeDesconto {
    double aplicar(double valor);
}

class SemDesconto implements PoliticaDeDesconto {
    @Override
    public double aplicar(double valor) {
        return valor;
    }
}

class Percentual implements PoliticaDeDesconto {
    private final double percentual;

    Percentual(double percentual) {
        this.percentual = percentual;
    }

    @Override
    public double aplicar(double valor) {
        return valor * (1 - percentual / 100);
    }
}

class Pedido {
    private final double valor;
    private final PoliticaDeDesconto politica;

    Pedido(double valor, PoliticaDeDesconto politica) {
        this.valor = valor;
        this.politica = politica;
    }

    double total() {
        return politica.aplicar(valor);
    }
}` },
    { tipo: "codigo", linguagem: "text", legenda: "Saída", texto: `200.0 180.0 150.0` },
    { tipo: "p", texto: "A terceira política foi escrita como uma expressão lambda, no lugar de uma classe. Isso funciona porque PoliticaDeDesconto tem um único método abstrato (é uma interface funcional). Você vai usar muito essa característica quando chegar aos streams." },

    { tipo: "h", texto: "Interfaces sealed e pattern matching" },
    { tipo: "p", texto: "Às vezes o conjunto de variações é fechado: uma resposta é sucesso ou erro, e mais nada. Uma interface sealed lista, com permits, as únicas classes autorizadas a implementá-la. Combinada com records e com o switch moderno, o compilador sabe todos os casos possíveis e avisa se você esquecer algum, sem precisar de um default." },
    { tipo: "codigo", linguagem: "java", legenda: "Resultados.java", texto: `public class Resultados {
    public static void main(String[] args) {
        Resultado[] resultados = { new Sucesso(42), new Falha("sem rede") };
        for (Resultado r : resultados) {
            String texto = switch (r) {
                case Sucesso s -> "ok: " + s.valor();
                case Falha f -> "erro: " + f.motivo();
            };
            System.out.println(texto);
        }
    }
}

sealed interface Resultado permits Sucesso, Falha {}

record Sucesso(int valor) implements Resultado {}

record Falha(String motivo) implements Resultado {}` },
    { tipo: "codigo", linguagem: "text", legenda: "Saída", texto: `ok: 42
erro: sem rede` },
    { tipo: "p", texto: "Se alguém adicionar um terceiro tipo à lista de permits e esquecer de tratá-lo no switch, o código deixa de compilar. É a vantagem de trocar um default silencioso por uma checagem do compilador: o erro aparece na hora, e não em produção." },

    { tipo: "h", texto: "Sobrescrita, sobrecarga e o que o compilador enxerga" },
    { tipo: "p", texto: "Dois conceitos com nomes parecidos costumam ser confundidos. A sobrecarga (overloading) é ter, na mesma classe, vários métodos com o mesmo nome e parâmetros diferentes, e o compilador escolhe qual chamar olhando os argumentos. A sobrescrita (overriding) é a filha redefinir um método herdado com a mesma assinatura, e a escolha acontece em tempo de execução, pelo tipo do objeto real. A primeira é decidida antes de o programa rodar; a segunda, enquanto ele roda." },
    { tipo: "p", texto: "Uma consequência prática: ao usar uma variável do tipo Animal, você só pode chamar o que Animal declara, mesmo que o objeto seja um Cachorro com métodos extras. Se precisar do método específico, é sinal de que o desenho está pedindo outra coisa, como um método a mais na abstração ou uma interface própria. Converter para a subclasse com cast e instanceof é uma saída legítima em casos pontuais (o pattern matching moderno a deixa bem mais limpa), mas uma sequência de ifs com instanceof espalhada pelo código é o cheiro clássico de polimorfismo que faltou." },
    { tipo: "p", texto: "Por fim, lembre da regra do construtor: antes de a filha existir, a mãe precisa ser construída. Por isso a primeira linha do construtor da filha é super(...), e por isso chamar, dentro do construtor da mãe, um método que a filha sobrescreve é perigoso: o método da filha pode executar antes de os atributos da filha terem sido inicializados e enxergar valores nulos ou zerados. Em construtores, chame apenas métodos privados ou final." },

    { tipo: "h", texto: "Boas práticas" },
    { tipo: "lista", itens: [
      "Declare variáveis e parâmetros com o tipo mais genérico que serve (List em vez de ArrayList, MeioDePagamento em vez de Cartao).",
      "Não herde só para reaproveitar código: se a relação não é de tipo, use composição.",
      "Marque classes como final quando não foram pensadas para extensão, e deixe a herança para o que foi desenhado para ela.",
      "Garanta o princípio da substituição: onde a mãe é aceita, qualquer filha deve funcionar sem surpresas.",
      "Mantenha as hierarquias rasas: dois ou três níveis são, em geral, o limite saudável.",
    ] },
  ],
  questoes: [
    {
      enunciado: "O que é polimorfismo em Java?",
      opcoes: ["Ter muitos métodos com o mesmo nome na mesma classe", "Uma variável de um tipo mais geral executar o comportamento do objeto real que ela guarda", "Converter números entre tipos", "Esconder atributos com private"],
      correta: 1,
      explicacao: "No polimorfismo, ao chamar um método sobrescrito por uma variável do tipo da mãe ou da interface, o Java executa a versão do objeto real em tempo de execução. Vários métodos de mesmo nome na mesma classe são sobrecarga, outro assunto.",
    },
    {
      enunciado: "Qual a vantagem do @Override?",
      opcoes: ["Torna o método mais rápido", "Permite herdar de duas classes", "Impede que a subclasse seja instanciada", "Faz o compilador recusar o código se o método não estiver realmente sobrescrevendo outro"],
      correta: 3,
      explicacao: "Se houver um erro de digitação no nome ou nos parâmetros, o método seria considerado novo e o comportamento herdado continuaria valendo sem aviso. Com @Override, o compilador acusa o erro.",
    },
    {
      enunciado: "O que acontece ao tentar fazer new Forma(\"x\") se Forma é uma classe abstract?",
      opcoes: ["Erro de compilação: classes abstratas não podem ser instanciadas", "Cria um objeto sem métodos", "Lança uma exceção em tempo de execução", "Cria uma subclasse automática"],
      correta: 0,
      explicacao: "Uma classe abstrata é incompleta por definição e só pode ser usada por meio de suas filhas concretas. O erro aparece já na compilação.",
    },
    {
      enunciado: "Uma classe Robo precisa ser Comparable e também Serializable. O que o Java permite?",
      opcoes: ["Estender as duas, com extends", "Nenhuma das duas, porque só uma é permitida", "Implementar as duas interfaces", "Só uma delas, e a outra deve ser copiada"],
      correta: 2,
      explicacao: "Uma classe pode implementar quantas interfaces quiser, mas estender apenas uma classe. Por isso interfaces são ideais para papéis e capacidades que se combinam.",
    },
    {
      enunciado: "Por que a composição costuma ser preferida à herança para reaproveitar comportamento?",
      opcoes: ["Porque herança não existe no Java moderno", "Porque deixa o código menos acoplado e permite trocar o comportamento sem criar novas subclasses", "Porque composição é mais rápida em tempo de execução", "Porque herança proíbe métodos privados"],
      correta: 1,
      explicacao: "A herança liga a filha aos detalhes da mãe e é fixa. Na composição, o objeto recebe outro objeto (por exemplo, uma política de desconto) e a troca é só passar outro. A diferença de desempenho é irrelevante.",
    },
    {
      enunciado: "Qual a principal vantagem de uma interface sealed combinada com switch?",
      opcoes: ["Permite que qualquer classe a implemente", "O compilador conhece todos os casos e acusa um caso esquecido, sem precisar de default", "Torna o switch mais lento", "Impede o uso de records"],
      correta: 1,
      explicacao: "Com sealed e permits, o conjunto de implementações é fechado. O switch que cobre todos os casos compila sem default, e, se um novo tipo surgir, o compilador avisa onde falta tratar.",
    },
    {
      enunciado: "Em MeioDePagamento m = new Pix(); m.descricao(); qual versão é executada se Pix sobrescreve descricao()?",
      opcoes: ["A da interface, porque a variável é do tipo MeioDePagamento", "Nenhuma, dá erro de compilação", "Depende da ordem das declarações", "A de Pix, porque o objeto real é um Pix"],
      correta: 3,
      explicacao: "O tipo da variável decide o que pode ser chamado; o objeto real decide qual implementação executa. É o despacho dinâmico, a base do polimorfismo.",
    },
  ],
  desafio: {
    titulo: "Folha de pagamento",
    enunciado: "Modele uma folha de pagamento (Folha.java) com diferentes tipos de funcionário. O cálculo do salário varia por tipo, e a folha deve calcular o total sem saber qual é o tipo de cada um.",
    requisitos: [
      "Defina uma interface ou classe abstrata Funcionario com nome e um método salario().",
      "Implemente ao menos três tipos: CLT (salário fixo), Horista (valor por hora vezes horas trabalhadas) e Comissionado (fixo mais percentual sobre vendas).",
      "Crie uma lista de Funcionario com os três tipos e calcule o total da folha em um laço, sem usar instanceof.",
      "Adicione uma política de bônus por composição (uma interface PoliticaDeBonus recebida pelo construtor, com pelo menos duas implementações).",
      "Use uma interface sealed com records para representar o resultado de validar um funcionário (válido ou inválido com motivo) e trate os dois casos com switch.",
    ],
    criterios: [
      "Adicionar um novo tipo de funcionário não exige alterar a classe que calcula a folha.",
      "Nenhum instanceof é usado para escolher o comportamento.",
      "A composição é usada para o bônus, e não uma subclasse para cada combinação.",
      "Os atributos são private e final sempre que possível.",
      "Você consegue explicar por que a escolha entre classe abstrata e interface foi feita.",
    ],
    dica: "Comece escrevendo só a interface e o cálculo da folha. Se ele funciona sem conhecer os tipos concretos, o desenho está certo.",
  },
  referencias: [
    { titulo: "Dev.java: Herança (em inglês)", url: "https://dev.java/learn/inheritance/" },
    { titulo: "Dev.java: Interfaces (em inglês)", url: "https://dev.java/learn/interfaces/" },
  ],
};
