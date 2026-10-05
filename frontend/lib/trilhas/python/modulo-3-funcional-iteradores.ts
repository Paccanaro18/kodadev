import type { Modulo } from "../tipos";

export const PY_MODULO_3: Modulo = {
  tipo: "modulo",
  slug: "funcional-e-iteradores",
  titulo: "Programação funcional e iteradores",
  resumo: "Funções como valores, comprehensions, iteradores, geradores, itertools e decoradores: o jeito Python de processar dados.",
  nivel: "Intermediário",
  leitura: "45 min",
  objetivos: [
    "Passar funções como argumentos e devolvê-las de outras funções.",
    "Escrever list, dict e set comprehensions e saber quando um laço comum é mais claro.",
    "Explicar a diferença entre iterável e iterador e o que acontece em um laço for.",
    "Criar geradores com yield e usá-los para processar dados sem carregar tudo na memória.",
    "Escrever e aplicar um decorador simples, preservando o nome e a documentação da função.",
  ],
  preRequisitos: [
    "Ter feito os módulos anteriores da trilha de Python ou dominar funções, listas, dicionários e exceções.",
    "Ter Python 3.10 ou mais novo instalado.",
  ],
  pontosChave: [
    "Funções são valores: podem ser guardadas, passadas e devolvidas como qualquer outro objeto.",
    "Uma comprehension é uma forma compacta de construir uma coleção, mas não deve esconder lógica complexa.",
    "Um iterável pode ser percorrido; um iterador é quem sabe qual é o próximo item e se esgota.",
    "Geradores produzem valores sob demanda, usando memória constante.",
    "Um decorador é uma função que recebe uma função e devolve outra, acrescentando comportamento.",
  ],
  blocos: [
    { tipo: "p", texto: "Python permite escrever programas de várias maneiras, e uma delas, inspirada na programação funcional, trata funções como dados e transforma coleções com expressões compactas. Dominar essas ferramentas muda o seu código: laços com contadores e listas auxiliares dão lugar a descrições do que se quer obter. Este módulo cobre o que você mais vai encontrar em código Python profissional: comprehensions, iteradores, geradores e decoradores." },

    { tipo: "h", texto: "Funções são valores" },
    { tipo: "p", texto: "Em Python, uma função é um objeto como qualquer outro. Pode ser atribuída a uma variável, guardada em uma lista ou dicionário, passada como argumento e devolvida por outra função. Funções que recebem ou devolvem funções são chamadas de funções de ordem superior." },
    { tipo: "p", texto: "A expressão lambda cria uma função anônima de uma linha, útil quando a lógica é tão simples que dar-lhe um nome seria exagero, como a chave de uma ordenação. Se a função precisar de mais de uma expressão, escreva um def." },
    { tipo: "codigo", linguagem: "python", legenda: "ordem_superior.py", texto: `def aplicar(funcao, valores):
    return [funcao(v) for v in valores]


def multiplicador(fator):
    def multiplicar(x):
        return x * fator
    return multiplicar


dobro = multiplicador(2)
triplo = multiplicador(3)

print(aplicar(dobro, [1, 2, 3]))
print(aplicar(triplo, [1, 2, 3]))

pessoas = [("Ana", 31), ("Bruno", 25), ("Carla", 28)]
print(sorted(pessoas, key=lambda p: p[1]))
print(max(pessoas, key=lambda p: p[1])[0])

operacoes = {"dobro": dobro, "triplo": triplo}
for nome, funcao in operacoes.items():
    print(nome, funcao(10))` },
    { tipo: "codigo", linguagem: "text", legenda: "Saída", texto: `[2, 4, 6]
[3, 6, 9]
[('Bruno', 25), ('Carla', 28), ('Ana', 31)]
Ana
dobro 20
triplo 30` },
    { tipo: "p", texto: "A função multiplicador devolve uma função interna que \"lembra\" o valor de fator, mesmo depois de multiplicador ter terminado. Isso é um closure (fechamento): a função interna carrega consigo as variáveis do escopo onde foi criada. Closures são a base dos decoradores, que você verá adiante." },

    { tipo: "h", texto: "map, filter e comprehensions" },
    { tipo: "p", texto: "As funções map e filter aplicam uma função a cada elemento, ou selecionam elementos que passam em um teste. Elas existem em Python, mas o estilo preferido pela comunidade é outro: as comprehensions, que descrevem a nova coleção diretamente. Elas são mais legíveis que map com lambda e mais rápidas que um laço que chama append." },
    { tipo: "codigo", linguagem: "python", legenda: "comprehensions.py", texto: `numeros = [1, 2, 3, 4, 5, 6]

quadrados = [n * n for n in numeros]
pares = [n for n in numeros if n % 2 == 0]
rotulos = ["par" if n % 2 == 0 else "ímpar" for n in numeros]
print(quadrados)
print(pares)
print(rotulos)

nomes = ["ana", "bruno", "carla"]
tamanhos = {nome: len(nome) for nome in nomes}
print(tamanhos)

unicas = {len(nome) for nome in nomes}
print(sorted(unicas))

pares_de_pontos = [(x, y) for x in range(2) for y in range(2)]
print(pares_de_pontos)

soma = sum(n * n for n in numeros)
print(soma)

com_map = list(map(lambda n: n * n, numeros))
print(com_map == quadrados)` },
    { tipo: "codigo", linguagem: "text", legenda: "Saída", texto: `[1, 4, 9, 16, 25, 36]
[2, 4, 6]
['ímpar', 'par', 'ímpar', 'par', 'ímpar', 'par']
{'ana': 3, 'bruno': 5, 'carla': 5}
[3, 5]
[(0, 0), (0, 1), (1, 0), (1, 1)]
91
True` },
    { tipo: "p", texto: "Note a penúltima conta: sum(n * n for n in numeros) usa uma expressão geradora, sem colchetes. Ela não cria uma lista intermediária, e sim entrega um valor de cada vez para o sum. Para resultados que só serão consumidos uma vez, é a escolha mais eficiente." },
    { tipo: "dica", titulo: "Quando não usar uma comprehension", texto: "Se a expressão precisa de mais de uma condição, de vários laços aninhados ou de efeitos colaterais (como imprimir ou gravar), um laço for comum é mais claro. O critério é se alguém entende a linha em uma leitura. Código legível vale mais do que código curto." },

    { tipo: "h", texto: "Iteráveis e iteradores" },
    { tipo: "p", texto: "Quando você escreve for x in colecao, o Python faz duas coisas por baixo. Primeiro pede um iterador à coleção, chamando iter(colecao). Depois chama next() no iterador, repetidamente, até ele sinalizar o fim lançando a exceção StopIteration, que o for captura e usa para parar. Um iterável é qualquer objeto que sabe fornecer um iterador (listas, strings, dicionários, arquivos). Um iterador é o objeto que guarda a posição atual e sabe devolver o próximo item." },
    { tipo: "codigo", linguagem: "python", legenda: "iteradores.py", texto: `letras = ["a", "b", "c"]
iterador = iter(letras)

print(next(iterador))
print(next(iterador))
print(next(iterador))

try:
    next(iterador)
except StopIteration:
    print("acabou")

print(list(iterador))


class Contagem:
    def __init__(self, inicio, fim):
        self.atual = inicio
        self.fim = fim

    def __iter__(self):
        return self

    def __next__(self):
        if self.atual > self.fim:
            raise StopIteration
        valor = self.atual
        self.atual += 1
        return valor


print(list(Contagem(1, 4)))` },
    { tipo: "codigo", linguagem: "text", legenda: "Saída", texto: `a
b
c
acabou
[]
[1, 2, 3, 4]` },
    { tipo: "p", texto: "Um detalhe que pega muita gente: um iterador se esgota. Depois de consumido, list(iterador) devolve uma lista vazia, como no exemplo. Para percorrer de novo, é preciso pedir outro iterador à coleção original." },

    { tipo: "h", texto: "Geradores: valores sob demanda" },
    { tipo: "p", texto: "Escrever uma classe com __iter__ e __next__ é trabalhoso. Os geradores resolvem o mesmo problema com uma função comum que usa yield no lugar de return. Cada yield entrega um valor e pausa a função; na próxima chamada de next, a execução continua de onde parou, com todas as variáveis locais preservadas." },
    { tipo: "p", texto: "A grande vantagem é a memória. Uma lista com um milhão de itens existe inteira na memória; um gerador guarda só o estado atual, e gera o próximo valor quando alguém pede. Isso permite processar arquivos enormes ou até sequências infinitas." },
    { tipo: "codigo", linguagem: "python", legenda: "geradores.py", texto: `import sys


def contagem(limite):
    n = 1
    while n <= limite:
        yield n
        n += 1


def fibonacci():
    a, b = 0, 1
    while True:
        yield a
        a, b = b, a + b


def primeiros(iteravel, quantidade):
    for indice, item in enumerate(iteravel):
        if indice >= quantidade:
            return
        yield item


print(list(contagem(5)))
print(list(primeiros(fibonacci(), 10)))

lista = [n for n in range(100_000)]
gerador = (n for n in range(100_000))
print(sys.getsizeof(lista) > 100 * sys.getsizeof(gerador))
print(sum(gerador))` },
    { tipo: "codigo", linguagem: "text", legenda: "Saída", texto: `[1, 2, 3, 4, 5]
[0, 1, 1, 2, 3, 5, 8, 13, 21, 34]
True
4999950000` },
    { tipo: "p", texto: "O fibonacci é uma sequência infinita, mas não trava o programa, porque ninguém pede todos os valores de uma vez: a função primeiros pega só dez. Um padrão real: ler um arquivo de log de vários gigabytes linha a linha com um gerador, filtrar as linhas de erro e contá-las, usando alguns kilobytes de memória." },

    { tipo: "h", texto: "itertools e funções embutidas úteis" },
    { tipo: "p", texto: "A biblioteca padrão traz o módulo itertools, com blocos prontos para compor iteradores, e o Python tem funções embutidas que combinam muito bem com eles. Conhecê-las evita reescrever código que já existe e foi bem testado." },
    { tipo: "tabela", legenda: "Ferramentas para trabalhar com sequências", cabecalho: ["Ferramenta", "O que faz"], linhas: [
      ["enumerate(x)", "Devolve pares (índice, item), sem precisar de contador manual."],
      ["zip(a, b)", "Junta dois iteráveis, par a par, parando no mais curto."],
      ["sorted(x, key=f)", "Devolve uma nova lista ordenada pelo resultado de f."],
      ["any(x) / all(x)", "Verdadeiro se algum / todos os itens forem verdadeiros."],
      ["itertools.islice(x, n)", "Pega os n primeiros itens de qualquer iterável, inclusive infinito."],
      ["itertools.chain(a, b)", "Percorre vários iteráveis em sequência, como se fossem um."],
      ["itertools.groupby(x, key)", "Agrupa itens consecutivos com a mesma chave."],
    ] },
    { tipo: "codigo", linguagem: "python", legenda: "ferramentas.py", texto: `from itertools import chain, groupby, islice

nomes = ["Ana", "Bruno", "Carla"]
notas = [9.0, 6.5, 8.0]
print(list(zip(nomes, notas)))
print({n: nota for n, nota in zip(nomes, notas)})

for posicao, nome in enumerate(nomes, start=1):
    print(posicao, nome)

print(any(nota < 7 for nota in notas), all(nota > 5 for nota in notas))
print(list(chain([1, 2], [3], [4, 5])))
print(list(islice(iter(range(1, 1000)), 3)))

vendas = [("seg", 10), ("seg", 5), ("ter", 7), ("qua", 3), ("qua", 4)]
for dia, grupo in groupby(vendas, key=lambda v: v[0]):
    print(dia, sum(valor for _, valor in grupo))` },
    { tipo: "codigo", linguagem: "text", legenda: "Saída", texto: `[('Ana', 9.0), ('Bruno', 6.5), ('Carla', 8.0)]
{'Ana': 9.0, 'Bruno': 6.5, 'Carla': 8.0}
1 Ana
2 Bruno
3 Carla
True True
[1, 2, 3, 4, 5]
[1, 2, 3]
seg 15
ter 7
qua 7` },
    { tipo: "alerta", titulo: "groupby só agrupa itens consecutivos", texto: "O itertools.groupby agrupa apenas itens vizinhos com a mesma chave. Se os dados não estiverem ordenados pela chave, a mesma chave aparece em vários grupos. Ordene antes com sorted(dados, key=...) ou use um dicionário para acumular." },

    { tipo: "h", texto: "Decoradores" },
    { tipo: "p", texto: "Um decorador é uma função que recebe uma função e devolve outra, normalmente envolvendo a original com algum comportamento extra: medir o tempo, registrar chamadas, checar permissões, repetir em caso de falha. A sintaxe @nome, colocada acima de um def, é só um atalho: escrever @decorador acima de f equivale a f = decorador(f)." },
    { tipo: "p", texto: "Ao envolver uma função, o decorador a substitui, e a substituta perderia o nome e a documentação da original. A função functools.wraps resolve isso copiando essas informações. Use-a sempre ao escrever um decorador." },
    { tipo: "codigo", linguagem: "python", legenda: "decoradores.py", texto: `import functools


def registrar(funcao):
    @functools.wraps(funcao)
    def interna(*args, **kwargs):
        print(f"chamando {funcao.__name__}{args}")
        resultado = funcao(*args, **kwargs)
        print(f"resultado: {resultado}")
        return resultado
    return interna


def repetir(vezes):
    def decorador(funcao):
        @functools.wraps(funcao)
        def interna(*args, **kwargs):
            return [funcao(*args, **kwargs) for _ in range(vezes)]
        return interna
    return decorador


@registrar
def somar(a, b):
    """Soma dois números."""
    return a + b


@repetir(3)
def saudar(nome):
    return f"oi, {nome}"


somar(2, 3)
print(somar.__name__, "-", somar.__doc__)
print(saudar("Ana"))


@functools.lru_cache(maxsize=None)
def fib(n):
    return n if n < 2 else fib(n - 1) + fib(n - 2)


print(fib(60))` },
    { tipo: "codigo", linguagem: "text", legenda: "Saída", texto: `chamando somar(2, 3)
resultado: 5
somar - Soma dois números.
['oi, Ana', 'oi, Ana', 'oi, Ana']
1548008755920` },
    { tipo: "p", texto: "O decorador repetir mostra o padrão com argumentos: uma função que recebe o argumento e devolve o decorador de fato, três níveis de função aninhada. O último exemplo usa o lru_cache, da biblioteca padrão, que memoriza os resultados: sem ele, o fib(60) recursivo levaria horas; com ele, é instantâneo. Em frameworks como o FastAPI e o Flask, as rotas são declaradas com decoradores, então você os verá o tempo todo." },

    { tipo: "h", texto: "Armadilhas comuns" },
    { tipo: "p", texto: "A primeira armadilha é a variável do closure. Funções criadas dentro de um laço guardam a variável, e não o valor que ela tinha naquela volta: se você criar três funções que usam o contador do laço, todas verão o valor final dele. Para fixar o valor, passe-o como argumento padrão (lambda n=n: ...) ou crie as funções dentro de outra função, como fizemos em multiplicador." },
    { tipo: "p", texto: "A segunda é o argumento padrão mutável. Em def f(itens=[]), a lista é criada uma única vez, na definição, e compartilhada entre todas as chamadas, então um item adicionado em uma chamada aparece na seguinte. O padrão correto é usar None como valor inicial e criar a lista dentro da função. É um dos erros mais frequentes em código Python e vale a pena reconhecê-lo à primeira vista." },
    { tipo: "p", texto: "A terceira é esquecer que geradores e iteradores se esgotam. Se você precisa percorrer os mesmos dados duas vezes, converta para lista na primeira passagem, ou crie um gerador novo para cada uso. E lembre-se de que a expressão geradora entre parênteses só é avaliada quando alguém a consome: um erro dentro dela só aparece na hora do consumo, e não onde ela foi escrita, o que pode confundir a depuração." },
    { tipo: "p", texto: "Por fim, mexer em uma lista enquanto se itera sobre ela produz resultados inesperados, porque o iterador guarda posições e elas se deslocam quando os elementos são removidos. A solução é sempre construir uma coleção nova, com uma comprehension ou um laço que acumula, deixando a original intacta. Código que não altera os próprios dados é mais fácil de entender, testar e reaproveitar." },

    { tipo: "h", texto: "Escrevendo código Python idiomático" },
    { tipo: "lista", itens: [
      "Prefira percorrer a coleção diretamente (for item in itens) a usar índices (for i in range(len(itens))).",
      "Use enumerate quando precisar do índice e zip para andar em duas coleções juntas.",
      "Devolva geradores de funções que produzem muitos valores, e deixe quem chama decidir se quer uma lista.",
      "Evite alterar uma lista enquanto a percorre; construa uma nova com uma comprehension.",
      "Não abuse de lambda: se precisa de um nome para entender, use def.",
    ] },
  ],
  questoes: [
    {
      enunciado: "O que significa dizer que funções são valores em Python?",
      opcoes: ["Funções só retornam números", "Funções podem ser atribuídas a variáveis, passadas como argumento e devolvidas por outras funções", "Funções não podem ter parâmetros", "Funções são sempre convertidas em strings"],
      correta: 1,
      explicacao: "Em Python, uma função é um objeto como qualquer outro. Essa propriedade permite funções de ordem superior, closures e decoradores.",
    },
    {
      enunciado: "Qual é a saída?\n\nprint([n * 2 for n in range(5) if n % 2 == 0])",
      opcoes: ["[0, 2, 4, 6, 8]", "[2, 6]", "[0, 4, 8]", "[0, 1, 2, 3, 4]"],
      correta: 2,
      explicacao: "O if filtra antes: só 0, 2 e 4 passam (os pares de 0 a 4), e cada um é multiplicado por 2, resultando em [0, 4, 8]. A condição no final de uma comprehension seleciona elementos.",
    },
    {
      enunciado: "Qual é a diferença entre um iterável e um iterador?",
      opcoes: ["Nenhuma, são sinônimos", "Um iterador guarda a posição atual e se esgota; um iterável fornece um iterador novo a cada iter()", "Um iterável só existe em listas", "Um iterador pode ser reiniciado com reset()"],
      correta: 1,
      explicacao: "Uma lista é um iterável: cada for pede a ela um iterador novo. O iterador é quem avança com next() e, ao terminar, levanta StopIteration. Depois de esgotado, ele não volta ao início.",
    },
    {
      enunciado: "O que acontece quando o código abaixo é executado?\n\ngen = (n for n in range(3))\nprint(list(gen))\nprint(list(gen))",
      opcoes: ["Imprime [0, 1, 2] duas vezes", "Imprime [0, 1, 2] e depois []", "Lança StopIteration na segunda linha", "Imprime [] e depois [0, 1, 2]"],
      correta: 1,
      explicacao: "Um gerador é um iterador: na primeira chamada de list ele é consumido por inteiro. Na segunda, já está esgotado, e list devolve uma lista vazia, sem erro.",
    },
    {
      enunciado: "Qual a principal vantagem de um gerador sobre uma lista ao processar um arquivo gigante?",
      opcoes: ["Ele mantém na memória só o item atual, em vez de carregar tudo", "Ele é sempre mais rápido por linha", "Ele permite acessar qualquer posição com índice", "Ele ordena os dados automaticamente"],
      correta: 0,
      explicacao: "O gerador produz um valor de cada vez, sob demanda, e usa memória praticamente constante. Já o acesso por índice e o tamanho conhecido são vantagens da lista, que um gerador não oferece.",
    },
    {
      enunciado: "Para que serve functools.wraps ao escrever um decorador?",
      opcoes: ["Para fazer o decorador rodar mais rápido", "Para preservar o nome e a documentação da função original na função que a substitui", "Para permitir decorar classes", "Para impedir que a função seja chamada duas vezes"],
      correta: 1,
      explicacao: "Sem wraps, a função devolvida pelo decorador tem o nome e a documentação da função interna (por exemplo, interna). Com wraps, ferramentas, mensagens de erro e a documentação continuam mostrando a função original.",
    },
    {
      enunciado: "Por que groupby, do itertools, pode devolver a mesma chave em mais de um grupo?",
      opcoes: ["Porque é um bug conhecido", "Porque só funciona com números", "Porque ignora o argumento key", "Porque ele só agrupa itens consecutivos com a mesma chave, então dados fora de ordem geram grupos repetidos"],
      correta: 3,
      explicacao: "O groupby percorre a sequência uma única vez e fecha o grupo quando a chave muda. Para agrupar tudo que tem a mesma chave, é preciso ordenar os dados pela chave antes, ou acumular em um dicionário.",
    },
  ],
  desafio: {
    titulo: "Analisador de log com geradores",
    enunciado: "Escreva um programa (analisador.py) que analisa um arquivo de log sem carregá-lo inteiro na memória, usando uma cadeia de geradores. Crie você mesmo um arquivo de teste com algumas centenas de linhas no formato \"2026-01-05 10:32:11 ERROR pagamento falhou\".",
    requisitos: [
      "Crie um gerador que lê o arquivo e devolve uma linha de cada vez (com a quebra de linha removida).",
      "Crie um gerador que transforma cada linha em um dicionário com data, hora, nível e mensagem, ignorando linhas mal formadas sem quebrar.",
      "Crie um gerador que filtra só as entradas de um nível pedido (por exemplo, ERROR).",
      "Calcule, com um dicionário ou collections.Counter, quantos eventos há por nível e quais são as 3 mensagens de erro mais frequentes.",
      "Escreva um decorador @cronometrar (com functools.wraps) e use-o na função principal para mostrar o tempo gasto.",
    ],
    criterios: [
      "O arquivo nunca é lido inteiro para uma lista: o consumo de memória não cresce com o tamanho do log.",
      "Cada etapa é uma função pequena, com um nome que diz o que ela faz.",
      "Linhas inválidas são contadas, mas não derrubam o programa.",
      "O decorador preserva o nome e a documentação da função decorada.",
      "Você consegue explicar por que a lista de eventos só é percorrida uma vez em cada etapa.",
    ],
    dica: "Teste cada gerador separadamente com 3 ou 4 linhas escritas à mão, usando list() para ver o resultado. Só então encadeie tudo, passando a saída de um como entrada do próximo.",
  },
  referencias: [
    { titulo: "Documentação do Python: Iteradores e geradores (HOWTO de programação funcional)", url: "https://docs.python.org/3/howto/functional.html" },
    { titulo: "Documentação do Python: módulo itertools", url: "https://docs.python.org/3/library/itertools.html" },
    { titulo: "Documentação do Python: módulo functools", url: "https://docs.python.org/3/library/functools.html" },
  ],
};
