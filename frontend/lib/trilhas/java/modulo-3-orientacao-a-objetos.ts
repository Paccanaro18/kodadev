import type { Modulo } from "../tipos";

export const JAVA_MODULO_3: Modulo = {
  tipo: "modulo",
  slug: "orientacao-a-objetos",
  titulo: "Orientação a objetos: classes, objetos e encapsulamento",
  resumo: "Como modelar o mundo com classes: atributos, construtores, métodos, encapsulamento, static, equals e records.",
  nivel: "Iniciante",
  leitura: "45 min",
  objetivos: [
    "Explicar a diferença entre classe e objeto e criar objetos com new.",
    "Escrever classes com atributos privados, construtores e métodos que protegem as próprias regras.",
    "Entender o que this, static e final significam e quando usar cada um.",
    "Explicar por que == não compara o conteúdo de objetos e implementar equals e hashCode.",
    "Usar records para modelar dados imutáveis sem escrever código repetitivo.",
  ],
  preRequisitos: [
    "Ter feito os módulos anteriores ou dominar variáveis, métodos, laços e arrays em Java.",
    "Saber compilar e executar um arquivo .java.",
  ],
  pontosChave: [
    "Uma classe é a planta; o objeto é cada coisa construída a partir dela, com estado próprio.",
    "Encapsular é esconder o estado (private) e expor só operações que mantêm o objeto sempre válido.",
    "O construtor é o lugar de garantir que ninguém consiga criar um objeto inválido.",
    "== compara referências; para comparar conteúdo, use equals, e sobrescreva hashCode junto.",
    "Prefira objetos imutáveis: records e campos final eliminam uma classe inteira de bugs.",
  ],
  blocos: [
    { tipo: "p", texto: "Até aqui, seus programas eram sequências de instruções com dados soltos. Isso funciona para um script, mas não para um sistema com centenas de conceitos: pedidos, clientes, contas, produtos. A orientação a objetos propõe agrupar, em uma mesma unidade, os dados de uma coisa e as operações que fazem sentido sobre esses dados. Em Java, essa unidade é a classe, e quase tudo que você vai ler em projetos reais (inclusive no Spring Boot) é construído assim." },

    { tipo: "h", texto: "Classe e objeto" },
    { tipo: "p", texto: "Uma classe descreve um tipo de coisa: quais dados ela tem (atributos, ou campos) e o que ela sabe fazer (métodos). Um objeto é uma instância concreta dessa classe, criada com a palavra new. Pense na classe ContaBancaria como a planta de uma casa, e em cada objeto como uma casa construída: todas seguem a mesma planta, mas cada uma tem o seu próprio endereço, a sua própria pintura e o seu próprio estado." },
    { tipo: "p", texto: "Duas contas criadas a partir da mesma classe guardam saldos independentes. Depositar em uma não mexe na outra, porque cada objeto tem a sua cópia dos atributos. O exemplo a seguir mostra a classe, o construtor e o uso." },
    { tipo: "codigo", linguagem: "java", legenda: "Banco.java", texto: `public class Banco {
    public static void main(String[] args) {
        Conta ana = new Conta("Ana", 100.0);
        Conta bia = new Conta("Bia", 50.0);

        ana.depositar(25.5);
        bia.sacar(20.0);

        System.out.println(ana.resumo());
        System.out.println(bia.resumo());

        try {
            bia.sacar(500.0);
        } catch (IllegalStateException e) {
            System.out.println("Recusado: " + e.getMessage());
        }
    }
}

class Conta {
    private final String titular;
    private double saldo;

    Conta(String titular, double saldoInicial) {
        if (titular == null || titular.isBlank()) {
            throw new IllegalArgumentException("titular obrigatório");
        }
        if (saldoInicial < 0) {
            throw new IllegalArgumentException("saldo inicial não pode ser negativo");
        }
        this.titular = titular;
        this.saldo = saldoInicial;
    }

    void depositar(double valor) {
        if (valor <= 0) {
            throw new IllegalArgumentException("valor deve ser positivo");
        }
        saldo += valor;
    }

    void sacar(double valor) {
        if (valor > saldo) {
            throw new IllegalStateException("saldo insuficiente");
        }
        saldo -= valor;
    }

    String resumo() {
        return titular + ": " + saldo;
    }
}` },
    { tipo: "codigo", linguagem: "text", legenda: "Saída", texto: `Ana: 125.5
Bia: 30.0
Recusado: saldo insuficiente` },
    { tipo: "p", texto: "Repare em três decisões. Os atributos são private: ninguém fora da classe consegue escrever conta.saldo = 1000000. O construtor recusa dados inválidos, então não existe objeto Conta sem titular nem com saldo negativo. E os métodos depositar e sacar são as únicas portas de mudança, cada uma com a sua regra. Isso é encapsulamento, e é a ideia mais importante do módulo." },

    { tipo: "h", texto: "Encapsulamento: proteger o estado" },
    { tipo: "p", texto: "Encapsular não é só escrever private. É garantir que o objeto nunca fique em um estado que não faça sentido. Se o saldo fosse público, qualquer parte do programa poderia deixá-lo negativo, e um bug de saldo errado poderia estar em qualquer lugar. Com o estado escondido, o bug só pode estar dentro da classe, e é ali que você procura." },
    { tipo: "p", texto: "Java oferece quatro níveis de visibilidade. Use sempre o mais restrito que ainda permita o código funcionar, e só abra mais quando houver uma razão." },
    { tipo: "tabela", legenda: "Modificadores de acesso em Java", cabecalho: ["Modificador", "Quem enxerga", "Uso típico"], linhas: [
      ["private", "Só a própria classe.", "Atributos e métodos auxiliares."],
      ["(nenhum)", "Qualquer classe do mesmo pacote.", "Detalhes internos de um pacote."],
      ["protected", "O pacote e as subclasses.", "Pontos de extensão para herança."],
      ["public", "Qualquer classe.", "A API que você quer oferecer."],
    ] },
    { tipo: "dica", titulo: "Getters e setters não são encapsulamento por si só", texto: "Criar um getter e um setter para cada atributo (o que algumas IDEs fazem com um clique) devolve o acesso total ao estado, só que mais verboso. Pergunte-se qual é a operação que o mundo exterior precisa fazer, e ofereça essa operação: depositar, em vez de setSaldo." },

    { tipo: "h", texto: "Construtores e this" },
    { tipo: "p", texto: "O construtor é um método especial com o mesmo nome da classe e sem tipo de retorno, executado uma única vez, na criação do objeto. Seu papel é deixar o objeto pronto e válido. Se você não escrever nenhum, o Java cria um construtor vazio por conta própria; assim que escrever um, esse construtor automático deixa de existir." },
    { tipo: "p", texto: "A palavra this é uma referência ao próprio objeto que está executando o código. Ela é necessária quando o parâmetro tem o mesmo nome do atributo (this.titular = titular), e também permite que um construtor chame outro da mesma classe, evitando repetir validações: this(titular, 0.0)." },
    { tipo: "codigo", linguagem: "java", legenda: "Pessoa.java", texto: `public class Pessoa {
    public static void main(String[] args) {
        Retangulo a = new Retangulo(3, 4);
        Retangulo b = new Retangulo(5);
        System.out.println(a.area() + " " + b.area());
        System.out.println(Retangulo.criados());
    }
}

class Retangulo {
    private static int criados = 0;

    private final double largura;
    private final double altura;

    Retangulo(double largura, double altura) {
        this.largura = largura;
        this.altura = altura;
        criados++;
    }

    Retangulo(double lado) {
        this(lado, lado);
    }

    double area() {
        return largura * altura;
    }

    static int criados() {
        return criados;
    }
}` },
    { tipo: "codigo", linguagem: "text", legenda: "Saída", texto: `12.0 25.0
2` },

    { tipo: "h", texto: "static e final" },
    { tipo: "p", texto: "No exemplo anterior, largura e altura pertencem a cada retângulo, mas criados pertence à classe como um todo: existe uma única cópia, compartilhada. É isso que static significa. Métodos estáticos também pertencem à classe e são chamados pelo nome dela (Retangulo.criados()), sem precisar de objeto. É por isso que o main é static: o Java precisa chamá-lo antes que exista qualquer objeto." },
    { tipo: "p", texto: "Já final quer dizer que a variável só recebe valor uma vez. Em um atributo, isso força a atribuição no construtor e impede mudanças depois. Atributos final são a forma mais simples de produzir objetos imutáveis, que não mudam depois de criados. Objetos imutáveis são mais fáceis de entender, podem ser compartilhados sem medo e não precisam de proteção quando vários trechos do programa os usam ao mesmo tempo." },
    { tipo: "alerta", titulo: "Estado estático compartilhado é armadilha", texto: "Um atributo static mutável é uma variável global disfarçada: qualquer parte do programa pode alterá-lo e os testes passam a interferir uns nos outros. Use static para constantes (static final) e métodos utilitários sem estado. Para o resto, prefira objetos." },

    { tipo: "h", texto: "Referências: o que é uma variável de objeto" },
    { tipo: "p", texto: "Uma variável de tipo primitivo guarda o valor. Uma variável de tipo objeto guarda uma referência: o endereço de um objeto em outra região da memória. Isso explica três comportamentos que surpreendem iniciantes. Primeiro, atribuir um objeto a outra variável não o copia: as duas variáveis passam a apontar para o mesmo objeto. Segundo, uma variável de objeto pode valer null, que significa não apontar para nada, e chamar um método nela lança NullPointerException. Terceiro, o operador == compara referências, não conteúdo." },
    { tipo: "codigo", linguagem: "java", legenda: "Igualdade.java", texto: `import java.util.Objects;

public class Igualdade {
    public static void main(String[] args) {
        Ponto a = new Ponto(1, 2);
        Ponto b = new Ponto(1, 2);
        Ponto c = a;

        System.out.println(a == b);
        System.out.println(a == c);
        System.out.println(a.equals(b));
        System.out.println(a.hashCode() == b.hashCode());
        System.out.println(a);
    }
}

class Ponto {
    private final int x;
    private final int y;

    Ponto(int x, int y) {
        this.x = x;
        this.y = y;
    }

    @Override
    public boolean equals(Object outro) {
        if (this == outro) return true;
        if (!(outro instanceof Ponto p)) return false;
        return x == p.x && y == p.y;
    }

    @Override
    public int hashCode() {
        return Objects.hash(x, y);
    }

    @Override
    public String toString() {
        return "Ponto(" + x + ", " + y + ")";
    }
}` },
    { tipo: "codigo", linguagem: "text", legenda: "Saída", texto: `false
true
true
true
Ponto(1, 2)` },
    { tipo: "p", texto: "O == entre a e b dá false porque são dois objetos distintos, mesmo com os mesmos valores. O método equals, que sobrescrevemos, define o que significa ser igual para um Ponto. Ao sobrescrever equals, é obrigatório sobrescrever hashCode também, com a regra: objetos iguais devem ter o mesmo hash. Coleções como HashMap e HashSet usam o hash para encontrar objetos, e quebrar essa regra faz um objeto \"sumir\" de dentro delas. O toString, por sua vez, define como o objeto aparece ao ser impresso; sem ele, você veria algo como Ponto@1b6d3586, que não ajuda ninguém." },
    { tipo: "alerta", titulo: "Compare Strings com equals, nunca com ==", texto: "Strings são objetos. Dois textos iguais podem ser objetos diferentes, e == pode dar false. Use sempre a.equals(b). O mesmo vale para qualquer objeto: == só pergunta se são exatamente o mesmo objeto." },

    { tipo: "h", texto: "Records: dados sem cerimônia" },
    { tipo: "p", texto: "A classe Ponto acima tem 25 linhas para dizer o que cabe em uma: um ponto é um par de inteiros. Para classes cujo único papel é carregar dados, o Java 16 trouxe os records. Ao declarar record Ponto(int x, int y), o compilador gera construtor, acessores (x() e y()), equals, hashCode e toString, e todos os campos são final. Você ainda pode validar no construtor compacto e adicionar métodos." },
    { tipo: "codigo", linguagem: "java", legenda: "UsandoRecords.java", texto: `public class UsandoRecords {
    public static void main(String[] args) {
        Dinheiro a = new Dinheiro(1050, "BRL");
        Dinheiro b = new Dinheiro(1050, "BRL");

        System.out.println(a);
        System.out.println(a.equals(b));
        System.out.println(a.somar(new Dinheiro(250, "BRL")).centavos());

        try {
            new Dinheiro(-1, "BRL");
        } catch (IllegalArgumentException e) {
            System.out.println("Inválido: " + e.getMessage());
        }
    }
}

record Dinheiro(long centavos, String moeda) {
    Dinheiro {
        if (centavos < 0) {
            throw new IllegalArgumentException("valor negativo");
        }
    }

    Dinheiro somar(Dinheiro outro) {
        if (!moeda.equals(outro.moeda)) {
            throw new IllegalArgumentException("moedas diferentes");
        }
        return new Dinheiro(centavos + outro.centavos, moeda);
    }
}` },
    { tipo: "codigo", linguagem: "text", legenda: "Saída", texto: `Dinheiro[centavos=1050, moeda=BRL]
true
1300
Inválido: valor negativo` },
    { tipo: "p", texto: "O exemplo também mostra uma boa prática: dinheiro em centavos, como número inteiro, e não em double. Valores decimais binários não representam 0,1 com exatidão, e somar quantias monetárias com double acumula erros de arredondamento. Para valores de dinheiro, use inteiros em centavos ou a classe BigDecimal." },
    { tipo: "p", texto: "Quando usar uma classe e quando usar um record? Se o objeto tem identidade e muda ao longo do tempo (uma conta, um pedido em andamento), use classe. Se ele é só um conjunto de valores, sem comportamento de ciclo de vida (um endereço, uma quantia, o corpo de uma requisição), use record. Na prática, em um backend Spring, a maior parte dos objetos que trafegam pela API (os DTOs) são records." },

    { tipo: "h", texto: "Enums: um conjunto fechado de valores" },
    { tipo: "p", texto: "Quando um valor só pode ser um entre poucos, como o status de um pedido, não use String nem int. Use um enum. O compilador impede valores inválidos, o switch consegue avisar se você esqueceu um caso, e cada constante pode ter dados e métodos próprios." },
    { tipo: "codigo", linguagem: "java", legenda: "Estados.java", texto: `public class Estados {
    public static void main(String[] args) {
        for (Status s : Status.values()) {
            System.out.println(s + " final? " + s.terminal());
        }
        Status atual = Status.valueOf("ENVIADO");
        String texto = switch (atual) {
            case NOVO -> "aguardando pagamento";
            case PAGO -> "separando";
            case ENVIADO -> "a caminho";
            case ENTREGUE, CANCELADO -> "encerrado";
        };
        System.out.println(texto);
    }
}

enum Status {
    NOVO, PAGO, ENVIADO, ENTREGUE, CANCELADO;

    boolean terminal() {
        return this == ENTREGUE || this == CANCELADO;
    }
}` },
    { tipo: "codigo", linguagem: "text", legenda: "Saída", texto: `NOVO final? false
PAGO final? false
ENVIADO final? false
ENTREGUE final? true
CANCELADO final? true
a caminho` },

    { tipo: "h", texto: "Como dividir responsabilidades" },
    { tipo: "p", texto: "Saber a sintaxe não basta: a pergunta difícil é onde colocar cada coisa. Uma regra prática é a da responsabilidade única: uma classe deve ter um motivo para mudar. Uma classe Conta que calcula saldo, formata o extrato em HTML e grava no banco muda por três razões distintas, e cada mudança arrisca quebrar as outras. Separe: a Conta cuida das regras do saldo, outra classe formata, outra persiste." },
    { tipo: "lista", itens: [
      "Dê nomes de substantivos às classes (Pedido, Cliente) e de verbos aos métodos (cancelar, calcularTotal).",
      "Prefira muitas classes pequenas e coesas a poucas gigantes que fazem tudo.",
      "Faça o objeto responsável por seus dados: em vez de pedir o saldo e calcular fora, peça à conta que faça a operação (\"diga, não pergunte\").",
      "Valide na fronteira: no construtor e nos métodos públicos, e não em cada lugar que usa o objeto.",
      "Comece com tudo private e final, e só abra mão disso quando houver um motivo concreto.",
    ] },
    { tipo: "dica", titulo: "Um teste simples de qualidade", texto: "Se, para usar um objeto corretamente, você precisa lembrar de chamar métodos em uma ordem específica (primeiro setX, depois setY, depois validar), o design está deixando a responsabilidade com quem usa. Faça o construtor devolver um objeto pronto." },
  ],
  questoes: [
    {
      enunciado: "Qual é a diferença entre classe e objeto?",
      opcoes: ["Não há diferença, são sinônimos", "A classe é o molde; o objeto é uma instância criada a partir dela, com estado próprio", "O objeto é o molde; a classe é a instância", "A classe só existe em tempo de compilação e o objeto só em tempo de execução, mas ambos têm o mesmo estado"],
      correta: 1,
      explicacao: "A classe descreve atributos e comportamentos; cada objeto criado com new é uma instância com os seus próprios valores de atributo. Duas contas da mesma classe têm saldos independentes.",
    },
    {
      enunciado: "Por que os atributos de uma classe costumam ser private?",
      opcoes: ["Porque o compilador exige", "Para que o objeto controle as próprias regras e nunca fique em um estado inválido", "Porque private deixa o programa mais rápido", "Para impedir que a classe seja instanciada"],
      correta: 1,
      explicacao: "Escondendo o estado, só a própria classe pode alterá-lo, e ela pode validar cada mudança. Isso é encapsulamento. Não há ganho de desempenho, e o compilador não exige: é uma decisão de design.",
    },
    {
      enunciado: "O que imprime o código abaixo?\n\nString a = new String(\"koda\");\nString b = new String(\"koda\");\nSystem.out.println((a == b) + \" \" + a.equals(b));",
      opcoes: ["true true", "true false", "false true", "false false"],
      correta: 2,
      explicacao: "Com new String, são criados dois objetos diferentes: == compara as referências e dá false. O equals compara o conteúdo e dá true. Por isso Strings devem sempre ser comparadas com equals.",
    },
    {
      enunciado: "Você sobrescreveu equals em uma classe e não mexeu em hashCode. Qual o risco?",
      opcoes: ["Nenhum, o Java ajusta sozinho", "Objetos iguais podem ter hashes diferentes e não serem encontrados em um HashSet ou HashMap", "O programa não compila", "O equals passa a comparar referências"],
      correta: 1,
      explicacao: "O contrato exige que objetos iguais tenham o mesmo hashCode. Sem isso, coleções baseadas em hash procuram no \"balde\" errado e não acham um objeto que, pelo equals, deveria estar lá. O código compila normalmente, e o bug aparece só em tempo de execução.",
    },
    {
      enunciado: "O que significa um atributo ser static?",
      opcoes: ["Ele não pode ser lido de fora da classe", "Ele não pode mudar de valor", "Existe uma única cópia dele, compartilhada por toda a classe, e não uma por objeto", "Ele só pode ser usado dentro do construtor"],
      correta: 2,
      explicacao: "Um atributo static pertence à classe e não ao objeto. Já a imutabilidade é do final, e a visibilidade é de private e public. É possível combinar: static final é a forma de declarar uma constante.",
    },
    {
      enunciado: "Em qual situação um record é mais adequado do que uma classe comum?",
      opcoes: ["Uma conta bancária cujo saldo muda a cada operação", "Um conjunto imutável de valores, como um endereço ou o corpo de uma requisição", "Uma classe com muitas subclasses", "Uma classe que precisa de atributos que mudam depois de criada"],
      correta: 1,
      explicacao: "O record é pensado para carregar dados imutáveis: gera construtor, acessores, equals, hashCode e toString, e todos os campos são final. Objetos com ciclo de vida e estado mutável continuam sendo classes.",
    },
    {
      enunciado: "Por que representar dinheiro em double é uma má ideia?",
      opcoes: ["Porque o double não aceita casas decimais", "Porque números decimais em ponto flutuante binário não representam valores como 0,1 com exatidão e acumulam erros", "Porque o double ocupa pouca memória", "Porque o Java não permite somar doubles"],
      correta: 1,
      explicacao: "O double usa representação binária e não consegue guardar valores como 0,1 com precisão exata, então somas repetidas acumulam erros. Para dinheiro, use inteiros em centavos ou BigDecimal.",
    },
  ],
  desafio: {
    titulo: "Biblioteca com empréstimos",
    enunciado: "Modele uma pequena biblioteca em Java (Biblioteca.java). Os livros podem ser emprestados e devolvidos, e o sistema deve impedir operações sem sentido. O objetivo é praticar encapsulamento: as regras vivem dentro das classes, e não no main.",
    requisitos: [
      "Crie a classe Livro com título, autor e um estado de disponibilidade que só muda pelos métodos emprestar() e devolver().",
      "emprestar() deve lançar uma exceção com mensagem clara se o livro já estiver emprestado, e devolver() se ele já estiver disponível.",
      "Crie um enum para o estado do livro (por exemplo DISPONIVEL e EMPRESTADO) em vez de usar boolean ou String.",
      "Crie um record Membro(String nome, int matricula) e valide no construtor que o nome não é vazio e a matrícula é positiva.",
      "Implemente equals, hashCode e toString em Livro (ou transforme parte dele em record) e mostre, no main, a diferença entre == e equals com dois livros iguais.",
    ],
    criterios: [
      "Todos os atributos são private e nenhum tem setter público.",
      "Não é possível criar um Livro ou um Membro inválido.",
      "As regras de empréstimo estão dentro da classe Livro, e não no main.",
      "O programa roda sem exceções não tratadas e imprime o que aconteceu em cada operação.",
      "Você consegue explicar por que equals e hashCode devem ser sobrescritos juntos.",
    ],
    dica: "Escreva primeiro o que o main faria se a biblioteca já existisse, e só depois crie as classes que tornam aquilo possível. Isso mostra quais métodos públicos você realmente precisa.",
  },
  referencias: [
    { titulo: "Dev.java: Classes e objetos (em inglês)", url: "https://dev.java/learn/classes-objects/" },
    { titulo: "Dev.java: Records (em inglês)", url: "https://dev.java/learn/records/" },
  ],
};
