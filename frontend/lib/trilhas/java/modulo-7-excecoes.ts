import type { Modulo } from "../tipos";

export const JAVA_MODULO_7: Modulo = {
  tipo: "modulo",
  slug: "excecoes-e-tratamento-de-erros",
  titulo: "Exceções e tratamento de erros",
  resumo: "Como o Java representa falhas: try, catch e finally, exceções verificadas e não verificadas, try-with-resources, exceções próprias e o que fazer (e não fazer) ao capturar um erro.",
  nivel: "Júnior",
  leitura: "45 min",
  objetivos: [
    "Explicar a hierarquia de exceções do Java e a diferença entre verificadas e não verificadas.",
    "Usar try, catch, finally e try-with-resources na ordem e no lugar certos.",
    "Criar exceções próprias com mensagem útil e causa preservada.",
    "Decidir entre capturar, propagar ou traduzir uma exceção.",
    "Evitar os erros clássicos: engolir exceções, capturar Exception por reflexo e perder a causa.",
  ],
  preRequisitos: [
    "Ter feito os módulos de orientação a objetos e de herança e interfaces.",
  ],
  pontosChave: [
    "Uma exceção é um objeto que interrompe o fluxo normal e sobe a pilha de chamadas até alguém a tratar.",
    "Exceções verificadas (checked) são cobradas pelo compilador; as não verificadas indicam, em geral, erros de programação.",
    "O finally sempre executa; o try-with-resources fecha os recursos sozinho, na ordem inversa da abertura.",
    "Capture só o que você sabe tratar, e traduza o resto preservando a causa original.",
    "Nunca deixe um catch vazio: uma falha silenciosa é pior que uma falha barulhenta.",
  ],
  blocos: [
    { tipo: "p", texto: "Programas reais falham: o arquivo não existe, a rede cai, o usuário digita \"abc\" onde se esperava um número, o banco recusa a conexão. A pergunta de engenharia não é como evitar todas as falhas, e sim como o programa se comporta quando elas acontecem: se avisa com clareza, se mantém os dados consistentes, se libera o que abriu. O Java trata isso com exceções, um mecanismo que separa o caminho feliz do tratamento de erros e que você vai encontrar em cada camada de uma aplicação Spring." },

    { tipo: "h", texto: "O que é uma exceção" },
    { tipo: "p", texto: "Uma exceção é um objeto que representa uma situação anormal. Quando o código a lança (throw), a execução do método para na hora, e a JVM sobe pela pilha de chamadas, de método em método, procurando um bloco catch capaz de tratá-la. Se ninguém trata, a exceção chega ao topo e a thread termina, imprimindo o rastro da pilha (stack trace) que mostra por onde ela passou. Esse rastro é a ferramenta mais importante de diagnóstico: aprenda a lê-lo de baixo para cima (de onde partiu) e olhe sempre a linha do seu código." },
    { tipo: "codigo", linguagem: "text", legenda: "A hierarquia de exceções", texto: `Throwable
├── Error                          problemas graves da JVM (OutOfMemoryError, StackOverflowError)
│                                  não se captura, normalmente
└── Exception
    ├── IOException, SQLException  ... verificadas (checked): o compilador obriga a tratar ou declarar
    └── RuntimeException           não verificadas (unchecked)
        ├── IllegalArgumentException
        ├── IllegalStateException
        ├── NullPointerException
        ├── ArrayIndexOutOfBoundsException
        └── ArithmeticException` },
    { tipo: "tabela", legenda: "Verificadas e não verificadas", cabecalho: ["", "Verificadas (checked)", "Não verificadas (unchecked)"], linhas: [
      ["Herdam de", "Exception, sem ser RuntimeException.", "RuntimeException (ou Error)."],
      ["O compilador exige", "Tratar com try/catch ou declarar com throws.", "Nada: é opcional."],
      ["Representam", "Falhas externas previsíveis: arquivo ausente, rede, banco.", "Erros de programação ou de uso: argumento inválido, estado errado, referência nula."],
      ["Exemplos", "IOException, SQLException.", "IllegalArgumentException, NullPointerException."],
    ] },
    { tipo: "p", texto: "A ideia por trás da divisão é que, diante de uma falha externa que pode legitimamente acontecer, quem chama deve ser forçado a pensar no assunto (verificada). Já um erro de programação deve ser corrigido no código, e não tratado (não verificada). Na prática, o debate sobre as verificadas é antigo: muitas bibliotecas modernas, incluindo o Spring, preferem exceções não verificadas, porque as verificadas poluem as assinaturas e acabam sendo capturadas só para serem relançadas. Use verificadas com parcimônia, e nunca para casos que o chamador não tem como tratar." },

    { tipo: "h", texto: "try, catch e finally" },
    { tipo: "p", texto: "O try envolve o código que pode falhar. Cada catch trata um tipo de exceção, e o primeiro compatível, de cima para baixo, é o escolhido; por isso, os tipos mais específicos vêm antes dos mais gerais (o compilador recusa a ordem inversa). Um catch pode listar vários tipos com |, quando o tratamento é o mesmo. O finally executa sempre, com ou sem exceção, e serve para liberar recursos. O exemplo abaixo mostra o fluxo, a ordem de execução e uma exceção própria." },
    { tipo: "codigo", linguagem: "java", legenda: "Excecoes.java", texto: `import java.util.List;

public class Excecoes {
    public static void main(String[] args) {
        System.out.println(dividir(10, 2));
        System.out.println(dividir(1, 0));
        System.out.println(ordem());

        for (String entrada : List.of("42", "abc", "")) {
            try {
                System.out.println("lido: " + lerIdade(entrada));
            } catch (IdadeInvalidaException e) {
                System.out.println("erro de negócio: " + e.getMessage() + " (causa: " + (e.getCause() == null ? "nenhuma" : e.getCause().getClass().getSimpleName()) + ")");
            }
        }

        try {
            int[] valores = new int[2];
            valores[5] = 1;
        } catch (ArrayIndexOutOfBoundsException | NullPointerException e) {
            System.out.println("capturada: " + e.getClass().getSimpleName());
        }
    }

    static String dividir(int a, int b) {
        try {
            return "resultado " + (a / b);
        } catch (ArithmeticException e) {
            return "divisão inválida";
        }
    }

    static String ordem() {
        StringBuilder trilha = new StringBuilder();
        try {
            trilha.append("try;");
            throw new IllegalStateException("falha");
        } catch (IllegalStateException e) {
            trilha.append("catch;");
        } finally {
            trilha.append("finally");
        }
        return trilha.toString();
    }

    static int lerIdade(String texto) throws IdadeInvalidaException {
        try {
            int idade = Integer.parseInt(texto);
            if (idade < 0 || idade > 130) {
                throw new IdadeInvalidaException("idade fora do intervalo: " + idade);
            }
            return idade;
        } catch (NumberFormatException e) {
            throw new IdadeInvalidaException("não é um número: '" + texto + "'", e);
        }
    }
}

class IdadeInvalidaException extends Exception {
    IdadeInvalidaException(String mensagem) {
        super(mensagem);
    }

    IdadeInvalidaException(String mensagem, Throwable causa) {
        super(mensagem, causa);
    }
}` },
    { tipo: "codigo", linguagem: "text", legenda: "Saída", texto: `resultado 5
divisão inválida
try;catch;finally
lido: 42
erro de negócio: não é um número: 'abc' (causa: NumberFormatException)
erro de negócio: não é um número: '' (causa: NumberFormatException)
capturada: ArrayIndexOutOfBoundsException` },
    { tipo: "p", texto: "Observe vários pontos. Em dividir, a divisão por zero é capturada perto de onde acontece e traduzida em uma resposta do método, em vez de derrubar o programa. Em ordem(), a trilha mostra o caminho: try, catch e, por fim, finally. Em lerIdade, aparece o padrão mais importante do módulo: uma NumberFormatException, falha de baixo nível da biblioteca, é capturada e traduzida em uma exceção do domínio (IdadeInvalidaException), com mensagem clara para quem usa o método e com a causa original anexada (o segundo argumento do construtor). Quem depurar depois consegue ver as duas camadas: o que falhou no negócio e a falha técnica que o originou. Por fim, o multi-catch trata dois tipos de uma vez." },
    { tipo: "alerta", titulo: "Sempre preserve a causa", texto: "Ao capturar uma exceção e lançar outra, passe a original como causa (new MinhaExcecao(mensagem, e)). Sem isso, o rastro da pilha original se perde, e você fica com uma mensagem genérica e nenhuma pista de onde a falha de fato nasceu." },
    { tipo: "h3", texto: "O finally tem pegadinhas" },
    { tipo: "lista", itens: [
      "Um return dentro do finally sobrescreve o retorno do try e engole qualquer exceção em andamento: evite.",
      "Se o finally lançar uma exceção, ela substitui a original, e o erro verdadeiro desaparece.",
      "Para liberar recursos, não escreva finally à mão: use try-with-resources, descrito a seguir.",
    ] },

    { tipo: "h", texto: "try-with-resources: fechar o que se abre" },
    { tipo: "p", texto: "Arquivos, conexões de banco e sockets precisam ser fechados mesmo quando algo dá errado, sob pena de vazamento de recursos (o clássico erro \"too many open files\"). Fazer isso com finally exige código longo e cheio de armadilhas. O try-with-resources resolve: qualquer objeto que implemente AutoCloseable, declarado entre parênteses depois do try, é fechado automaticamente ao fim do bloco, na ordem inversa da abertura, com ou sem exceção." },
    { tipo: "codigo", linguagem: "java", legenda: "Recursos.java", texto: `public class Recursos {
    public static void main(String[] args) {
        try (Conexao a = new Conexao("A"); Conexao b = new Conexao("B")) {
            System.out.println("usando " + a.nome + " e " + b.nome);
        }

        try (Conexao c = new Conexao("C")) {
            System.out.println("vai falhar");
            throw new IllegalStateException("erro no corpo");
        } catch (IllegalStateException e) {
            System.out.println("capturada: " + e.getMessage());
        }

        try (Conexao d = new Conexao("D", true)) {
            throw new IllegalStateException("erro no corpo");
        } catch (Exception e) {
            System.out.println(e.getMessage() + " | suprimidas: " + e.getSuppressed().length + " -> " + e.getSuppressed()[0].getMessage());
        }
    }
}

class Conexao implements AutoCloseable {
    final String nome;
    private final boolean falhaAoFechar;

    Conexao(String nome) {
        this(nome, false);
    }

    Conexao(String nome, boolean falhaAoFechar) {
        this.nome = nome;
        this.falhaAoFechar = falhaAoFechar;
        System.out.println("abrindo " + nome);
    }

    @Override
    public void close() {
        System.out.println("fechando " + nome);
        if (falhaAoFechar) {
            throw new IllegalArgumentException("erro ao fechar " + nome);
        }
    }
}` },
    { tipo: "codigo", linguagem: "text", legenda: "Saída", texto: `abrindo A
abrindo B
usando A e B
fechando B
fechando A
abrindo C
vai falhar
fechando C
capturada: erro no corpo
abrindo D
fechando D
erro no corpo | suprimidas: 1 -> erro ao fechar D` },
    { tipo: "p", texto: "A saída mostra três coisas. Primeiro, B é fechado antes de A, a ordem inversa da abertura, o que respeita eventuais dependências entre eles. Segundo, mesmo quando o corpo lança uma exceção, o recurso C é fechado antes de o catch executar. Terceiro, quando o corpo falha e o fechamento também falha (caso D), a exceção do corpo é a principal, e a do fechamento fica anexada como suprimida (getSuppressed), de modo que nenhuma das duas se perde, ao contrário do que ocorreria com um finally escrito à mão." },

    { tipo: "h", texto: "Criando exceções próprias" },
    { tipo: "p", texto: "Quando uma falha tem significado no seu domínio (saldo insuficiente, pedido não encontrado, idade inválida), crie uma exceção para ela, herdando de RuntimeException (a escolha mais comum hoje) ou de Exception, se quiser que seja verificada. Duas regras: o nome deve dizer o que aconteceu (SaldoInsuficienteException), e a classe deve ter construtores com mensagem e com mensagem e causa. Acrescentar campos úteis (o valor pedido, o saldo atual) ajuda quem trata o erro, mas cuidado para não vazar dados sensíveis na mensagem." },
    { tipo: "h3", texto: "Boas mensagens de erro" },
    { tipo: "lista", itens: [
      "Diga o que falhou e com quais valores: \"idade fora do intervalo: 150\", e não apenas \"valor inválido\".",
      "Diga o que se esperava, quando for útil: \"esperado entre 0 e 130\".",
      "Não inclua senhas, tokens, números de cartão ou dados pessoais: mensagens de exceção vão parar em logs e, às vezes, em respostas ao usuário.",
      "Escreva para quem vai depurar às duas da manhã, sem o contexto que você tem agora.",
    ] },

    { tipo: "h", texto: "Capturar, propagar ou traduzir" },
    { tipo: "p", texto: "Diante de uma exceção, há três atitudes legítimas. Capturar e tratar, quando você sabe o que fazer: tentar de novo, usar um valor padrão, pedir outro dado ao usuário. Propagar (deixar subir), quando quem chama está em melhor posição de decidir, e esta é a escolha certa na maior parte das vezes. Ou traduzir, convertendo uma falha técnica em uma exceção do seu domínio, como em lerIdade, para que as camadas superiores não dependam dos detalhes das inferiores (a camada de serviço não deveria precisar conhecer SQLException). Em aplicações web, existe um lugar central para tratar o que sobrou: no Spring, um manipulador global transforma as exceções em respostas HTTP padronizadas, ideia idêntica à do middleware de erros das APIs em Node." },
    { tipo: "numerada", itens: [
      "Capture a exceção mais específica que você sabe tratar, e não Exception ou Throwable por reflexo.",
      "Nunca deixe um catch vazio. Se a ideia é ignorar mesmo, comente o porquê, e registre ao menos em log.",
      "Registre (log) uma exceção em um só lugar, normalmente onde ela é de fato tratada, e não em cada camada por onde passa. Logar e relançar gera o mesmo erro repetido dez vezes.",
      "Preserve a causa ao traduzir.",
      "Valide cedo: argumentos inválidos devem falhar na entrada do método, com IllegalArgumentException e uma mensagem clara, e não três camadas depois.",
      "Não use exceções para controle de fluxo normal (como sair de um laço): são lentas e confusas. Para a ausência de valor esperada, prefira Optional ou um retorno vazio.",
    ] },
    { tipo: "alerta", titulo: "O catch que engole", texto: "catch (Exception e) {} é uma das piores linhas que se pode escrever: o erro acontece, nada aparece em lugar nenhum e o programa segue com dados possivelmente inconsistentes. Semanas depois, o sintoma surge longe da causa, sem pista alguma. Se não sabe tratar, deixe propagar." },
  ],
  questoes: [
    {
      enunciado: "Qual a principal diferença entre uma exceção verificada (checked) e uma não verificada (unchecked)?",
      opcoes: ["As verificadas são mais rápidas", "O compilador exige tratar ou declarar as verificadas; nas não verificadas, isso é opcional", "As não verificadas não geram stack trace", "As verificadas só existem em bibliotecas externas"],
      correta: 1,
      explicacao: "As verificadas (como IOException) obrigam o código a tratá-las ou a declará-las com throws. As não verificadas (subclasses de RuntimeException) indicam, em geral, erros de programação, e o compilador não cobra o tratamento.",
    },
    {
      enunciado: "O que imprime o método abaixo?\n\nstatic String f() {\n    StringBuilder s = new StringBuilder();\n    try { s.append(\"A\"); throw new RuntimeException(); }\n    catch (RuntimeException e) { s.append(\"B\"); }\n    finally { s.append(\"C\"); }\n    return s.toString();\n}",
      opcoes: ["AB", "AC", "ACB", "ABC"],
      correta: 3,
      explicacao: "O try executa e lança, o catch trata (B) e o finally executa sempre (C): ABC.",
    },
    {
      enunciado: "Por que é importante passar a exceção original como causa ao lançar uma exceção traduzida?",
      opcoes: ["Para o programa rodar mais rápido", "Para não perder o rastro da falha de origem, que é essencial para depurar", "Porque o compilador exige", "Para o catch ser ignorado"],
      correta: 1,
      explicacao: "A causa anexada preserva a pilha original. Sem ela, você vê apenas a mensagem da exceção nova e perde onde a falha de fato nasceu.",
    },
    {
      enunciado: "Qual a vantagem do try-with-resources sobre o finally escrito à mão?",
      opcoes: ["Fecha os recursos automaticamente, na ordem inversa, e preserva as exceções do fechamento como suprimidas", "Ele funciona sem a interface AutoCloseable", "Ele ignora todas as exceções", "Ele só serve para arquivos de texto"],
      correta: 0,
      explicacao: "O recurso é fechado ao fim do bloco, com ou sem exceção, e as falhas de fechamento ficam anexadas à principal, sem esconder o erro verdadeiro, o que o finally manual faz com facilidade.",
    },
    {
      enunciado: "Qual das alternativas descreve o pior hábito ao tratar exceções?",
      opcoes: ["Capturar a exceção específica que se sabe tratar", "Escrever catch (Exception e) {} sem fazer nada", "Traduzir uma exceção técnica em uma do domínio", "Validar os argumentos no início do método"],
      correta: 1,
      explicacao: "Um catch vazio esconde a falha: nada aparece em logs nem na tela, e o programa segue com possível inconsistência. Trate de verdade, registre ou deixe propagar.",
    },
    {
      enunciado: "Uma camada de serviço recebe uma SQLException do repositório. Qual é a melhor prática?",
      opcoes: ["Expor a SQLException até a interface web", "Capturar e ignorar", "Traduzir para uma exceção do domínio (por exemplo, PedidoNaoEncontradoException), preservando a causa", "Chamar System.exit(1)"],
      correta: 2,
      explicacao: "Traduzir mantém as camadas superiores independentes dos detalhes da persistência, enquanto a causa preservada continua disponível para diagnóstico.",
    },
    {
      enunciado: "Em um try-with-resources com dois recursos, abertos na ordem A e B, em que ordem eles são fechados?",
      opcoes: ["A e depois B", "B e depois A (ordem inversa)", "Ao mesmo tempo", "A ordem é indefinida"],
      correta: 1,
      explicacao: "A ordem de fechamento é a inversa da abertura, o que respeita dependências: o recurso aberto por último, que pode depender dos anteriores, é fechado primeiro.",
    },
  ],
  desafio: {
    titulo: "Conversor de arquivos com tratamento de erros",
    enunciado: "Escreva um programa (Importador.java) que lê um arquivo de texto com uma lista de produtos, um por linha, no formato \"nome;preco;quantidade\", valida cada linha e gera um relatório do que foi importado e do que foi rejeitado, sem nunca derrubar o programa por uma linha ruim.",
    requisitos: [
      "Use try-with-resources para abrir o arquivo (por exemplo, com BufferedReader) e trate a ausência do arquivo com uma mensagem clara.",
      "Crie uma exceção própria LinhaInvalidaException, com o número da linha e o motivo, e preserve a causa quando a falha vier de um NumberFormatException.",
      "Valide: três campos, nome não vazio, preço positivo, quantidade inteira não negativa. Cada falha lança a exceção própria.",
      "Capture a exceção por linha, acumule as rejeições e continue o processamento das demais linhas.",
      "Imprima, ao final, quantas linhas foram importadas, quantas foram rejeitadas e a lista de motivos com o número da linha.",
    ],
    criterios: [
      "Nenhum catch está vazio, e nenhum captura Exception sem necessidade.",
      "As exceções traduzidas preservam a causa original.",
      "O arquivo é sempre fechado, inclusive quando ocorre uma falha no meio da leitura.",
      "As mensagens dizem o que falhou, em qual linha e com qual valor, sem dados sensíveis.",
      "Um arquivo vazio e um arquivo inexistente têm comportamentos claros e diferentes.",
    ],
    dica: "Crie um arquivo de teste com linhas boas e ruins misturadas (campo faltando, preço negativo, texto no lugar do número) antes de escrever o código, e use-o como o seu conjunto de casos.",
  },
  referencias: [
    { titulo: "Dev.java: Exceções (em inglês)", url: "https://dev.java/learn/exceptions/" },
    { titulo: "Tutorial oficial do Java: exceções (em inglês)", url: "https://docs.oracle.com/javase/tutorial/essential/exceptions/" },
  ],
};
