import type { Modulo } from "../tipos";

export const PY_MODULO_1: Modulo = {
  tipo: "modulo",
  slug: "fundamentos-da-linguagem",
  titulo: "Fundamentos: tipos, estruturas de dados, funções e fluxo",
  resumo: "A base do Python: tipos e conversões, listas, tuplas, dicionários e conjuntos, funções (e a armadilha do argumento mutável) e o fluxo do programa.",
  nivel: "Iniciante",
  leitura: "40 min",
  objetivos: [
    "Rodar programas Python no terminal e entender que a indentação faz parte da sintaxe.",
    "Usar os tipos básicos e prever o resultado de contas, conversões e comparações.",
    "Escolher entre lista, tupla, dicionário e conjunto conforme o problema.",
    "Escrever funções com argumentos padrão, nomeados e variáveis, e evitar o erro do argumento padrão mutável.",
    "Controlar o fluxo com if, laços, comprehensions e o comando match.",
  ],
  preRequisitos: [
    "Saber usar um terminal.",
    "Ter o Python 3.10 ou mais novo instalado (python --version).",
    "Nenhuma experiência com programação é necessária.",
  ],
  pontosChave: [
    "Em Python, o bloco de código é definido pela indentação, não por chaves.",
    "Tudo é um objeto, e as variáveis são nomes que apontam para objetos. Atribuir não copia.",
    "Listas e dicionários são mutáveis; tuplas e strings, não. Isso decide como cada uma se comporta ao ser passada e copiada.",
    "Nunca use uma lista ou um dicionário como valor padrão de argumento: use None.",
    "Compare com None usando is, e valores com ==.",
  ],
  blocos: [
    { tipo: "p", texto: "Python é hoje uma das linguagens mais usadas do mundo: aparece em backend, automação, ciência de dados e inteligência artificial. Sua sintaxe limpa convida a escrever rápido, e isso é uma faca de dois gumes: é fácil escrever um código que funciona e difícil perceber que ele funciona por acaso. Este módulo cobre os fundamentos com o cuidado de explicar o que acontece por baixo." },

    { tipo: "h", texto: "Como o Python executa o seu código" },
    { tipo: "p", texto: "Python é uma linguagem interpretada: você escreve o código em arquivos .py e o interpretador o executa, linha por linha, de cima para baixo. Não há uma etapa de compilação separada que você precise rodar. Há duas formas principais de usar:" },
    { tipo: "lista", itens: [
      "Um arquivo: python programa.py executa o arquivo inteiro.",
      "O modo interativo: o comando python abre um prompt (REPL) em que você digita uma expressão e vê o resultado na hora. É ótimo para experimentar.",
    ] },
    { tipo: "p", texto: "Três características definem o jeito de escrever Python:" },
    { tipo: "lista", itens: [
      "A indentação é a sintaxe. Em vez de chaves, o bloco de um if, de um laço ou de uma função é o conjunto de linhas com o mesmo recuo (por convenção, 4 espaços). Misturar espaços e tabulações dá erro.",
      "Tipagem dinâmica: você não declara o tipo da variável; o tipo pertence ao valor, e a mesma variável pode apontar para valores de tipos diferentes ao longo do programa. As dicas de tipo (type hints), que aparecem mais adiante, documentam e permitem checagem por ferramentas, mas o Python não as impõe ao executar.",
      "Tipagem forte: ainda assim, o Python não faz conversões surpreendentes. Somar um texto e um número é erro (TypeError), e não uma concatenação silenciosa.",
    ] },
    { tipo: "dica", titulo: "Ambientes virtuais", texto: "Em projetos reais, você cria um ambiente virtual por projeto (python -m venv .venv) para isolar as bibliotecas instaladas com pip. Isso evita que dois projetos briguem por versões diferentes de uma mesma biblioteca. Veremos o uso com mais detalhe no módulo de módulos e pacotes." },

    { tipo: "h", texto: "Tipos básicos e operadores" },
    { tipo: "codigo", linguagem: "python", legenda: "Tipos.py", texto: `idade = 30
preco = 19.90
nome = "Ana"
ativo = True
nada = None

print(type(idade).__name__, type(preco).__name__, type(nome).__name__, type(ativo).__name__, type(nada).__name__)
print(2 ** 100)
print(7 / 2, 7 // 2, 7 % 2, -7 // 2, -7 % 3)
print(0.1 + 0.2, round(0.1 + 0.2, 2))
print(int("42") + 1, float("3.5"), str(10) + "!", int(3.99))
print(f"{nome} tem {idade} anos e paga R$ {preco:.2f}")
print(f"{1234567.891:,.2f}")
print(bool(0), bool(""), bool([]), bool("0"), bool(None))
print(nada is None, idade == 30, "ab" * 3)
a = "koda"
b = "KODA".lower()
print(a == b, a is b)` },
    { tipo: "codigo", linguagem: "text", legenda: "Saída", texto: `int float str bool NoneType
1267650600228229401496703205376
3.5 3 1 -4 2
0.30000000000000004 0.3
43 3.5 10! 3
Ana tem 30 anos e paga R$ 19.90
1,234,567.89
False False False True False
True True ababab
True False` },
    { tipo: "p", texto: "Cada linha tem uma lição:" },
    { tipo: "lista", itens: [
      "Os tipos são int (inteiro), float (decimal), str (texto), bool (verdadeiro ou falso) e NoneType (o valor None, que significa ausência de valor).",
      "Inteiros não têm limite de tamanho: 2 ** 100 funciona sem estouro, ao contrário de Java ou C. O custo é só memória.",
      "A divisão tem dois operadores: / sempre devolve float (7 / 2 é 3.5) e // é a divisão inteira, que arredonda para baixo. Repare em -7 // 2, que vale -4 (não -3): o piso de -3,5 é -4. O resto (%) acompanha: -7 % 3 vale 2, porque o Python garante que a // b * b + a % b seja sempre igual a a.",
      "float é um decimal binário, e por isso 0.1 + 0.2 dá 0.30000000000000004. Para formatar, use round ou, melhor, a formatação do texto. Para dinheiro, use o módulo decimal ou guarde em centavos.",
      "As conversões são explícitas: int(\"42\"), float(\"3.5\"), str(10). int(3.99) trunca para 3.",
      "f-strings (o f antes das aspas) inserem expressões entre chaves e aceitam formatação: :.2f são duas casas decimais, :,.2f acrescenta o separador de milhar.",
      "São falsos: False, None, 0, 0.0, \"\" (texto vazio) e qualquer coleção vazia ([], {}, set(), ()). Todo o resto é verdadeiro, inclusive o texto \"0\".",
      "Repetir um texto com * funciona: \"ab\" * 3 vale \"ababab\".",
    ] },
    { tipo: "h3", texto: "== e is não são a mesma coisa" },
    { tipo: "p", texto: "O operador == pergunta se dois valores são iguais. O operador is pergunta se são exatamente o mesmo objeto na memória. No exemplo, a e b têm o mesmo conteúdo (True para ==), mas são objetos diferentes (is dá False). A regra prática: use == para comparar valores, e is só para comparar com None (valor is None), que é um objeto único. Nunca use is para comparar números ou textos: o resultado pode depender de detalhes internos do interpretador." },

    { tipo: "h", texto: "Estruturas de dados: onde guardar vários valores" },
    { tipo: "p", texto: "O Python traz quatro estruturas essenciais, e saber qual escolher é metade do trabalho de escrever um bom programa." },
    { tipo: "tabela", cabecalho: ["Estrutura", "Sintaxe", "Ordenada", "Mutável", "Quando usar"], linhas: [
      ["list", "[1, 2, 3]", "Sim", "Sim", "Uma sequência que cresce, encolhe e pode ter repetidos."],
      ["tuple", "(3, 4)", "Sim", "Não", "Um grupo fixo de valores, como uma coordenada ou o retorno de uma função."],
      ["dict", "{\"a\": 1}", "Sim (pela inserção)", "Sim", "Buscar um valor por uma chave."],
      ["set", "{1, 2, 3}", "Não", "Sim", "Valores únicos e testes de pertencimento rápidos."],
    ] },
    { tipo: "codigo", linguagem: "python", legenda: "Estruturas.py", texto: `frutas = ["maçã", "banana", "uva"]
frutas.append("pera")
frutas[0] = "manga"
print(frutas, len(frutas), frutas[-1], frutas[1:3])

ponto = (3, 4)
x, y = ponto
print(x + y, ponto[0])

idades = {"Ana": 31, "Bia": 25}
idades["Caio"] = 42
print(idades["Ana"], idades.get("Zé"), idades.get("Zé", 0), list(idades.keys()))
for nome, idade in idades.items():
    print(nome, idade)

unicos = {1, 2, 2, 3, 3, 3}
print(unicos, 2 in unicos, unicos & {3, 4})

numeros = [5, 2, 9, 1]
print(sorted(numeros), numeros)
numeros.sort(reverse=True)
print(numeros)

quadrados = [n * n for n in range(1, 6)]
pares = [n for n in range(10) if n % 2 == 0]
mapa = {n: n * n for n in range(1, 4)}
print(quadrados, pares, mapa)

original = [1, 2, 3]
alias = original
copia = original.copy()
alias.append(4)
print(original, copia)

primeiro, *resto = [10, 20, 30]
print(primeiro, resto)
print(list(zip(["a", "b"], [1, 2])), list(enumerate(["x", "y"], start=1)))` },
    { tipo: "codigo", linguagem: "text", legenda: "Saída", texto: `['manga', 'banana', 'uva', 'pera'] 4 pera ['banana', 'uva']
7 3
31 None 0 ['Ana', 'Bia', 'Caio']
Ana 31
Bia 25
Caio 42
{1, 2, 3} True {3}
[1, 2, 5, 9] [5, 2, 9, 1]
[9, 5, 2, 1]
[1, 4, 9, 16, 25] [0, 2, 4, 6, 8] {1: 1, 2: 4, 3: 9}
[1, 2, 3, 4] [1, 2, 3]
10 [20, 30]
[('a', 1), ('b', 2)] [(1, 'x'), (2, 'y')]` },
    { tipo: "h3", texto: "O que observar" },
    { tipo: "lista", itens: [
      "Índices negativos contam do fim: frutas[-1] é o último. O fatiamento [1:3] pega dos índices 1 e 2: o início é incluído e o fim, não, como em Java.",
      "dict[chave] lança KeyError se a chave não existir; dict.get(chave) devolve None (ou o valor padrão que você passar) sem erro. Use get quando a ausência for normal.",
      "Os conjuntos eliminam repetidos e oferecem operações como interseção (&), união (|) e diferença (-). Testar if x in conjunto é muito mais rápido do que em uma lista grande.",
      "sorted(lista) devolve uma lista nova e não altera a original; lista.sort() ordena a própria lista e devolve None. Confundir os dois é um erro clássico: ordenada = lista.sort() deixa ordenada como None.",
      "Comprehensions (listas, dicionários e conjuntos por compreensão) criam coleções a partir de outras em uma linha: [n * n for n in range(1, 6)]. Preferem-se às versões com laço quando o corpo é simples e cabe em uma linha.",
      "Atribuir não copia: alias = original faz dois nomes apontarem para a mesma lista, e alterar um muda o outro (o original ficou [1, 2, 3, 4]). Para uma cópia, use .copy() ou list(original). Para estruturas aninhadas, copy.deepcopy.",
      "Desempacotamento: x, y = ponto separa os valores, e primeiro, *resto = lista pega o primeiro e junta o restante.",
      "zip percorre listas em paralelo, e enumerate dá o índice junto com o valor.",
    ] },
    { tipo: "alerta", titulo: "Mutável ou imutável?", texto: "Os tipos imutáveis (int, float, str, tuple, bool) não mudam depois de criados: uma operação cria um novo valor. Os mutáveis (list, dict, set) podem ser alterados no lugar. Isso tem uma consequência prática enorme: ao passar uma lista para uma função, a função pode modificá-la sem que você perceba. Se não quer esse efeito, passe uma cópia." },

    { tipo: "h", texto: "Funções" },
    { tipo: "p", texto: "Funções são definidas com def e são objetos como qualquer outro: podem ser guardadas em variáveis, passadas a outras funções e devolvidas. A primeira string de uma função é a docstring, a documentação que ferramentas como o help() mostram." },
    { tipo: "codigo", linguagem: "python", legenda: "Funcoes.py", texto: `def saudar(nome, titulo="Sr(a)."):
    """Devolve uma saudação."""
    return f"{titulo} {nome}"


def somar_tudo(*numeros):
    return sum(numeros)


def descrever(**atributos):
    return ", ".join(f"{chave}={valor}" for chave, valor in sorted(atributos.items()))


def dividir(a: int, b: int) -> tuple[int, int]:
    return a // b, a % b


def acumular_errado(item, lista=[]):
    lista.append(item)
    return lista


def acumular_certo(item, lista=None):
    if lista is None:
        lista = []
    lista.append(item)
    return lista


def criar_contador(inicio=0):
    valor = inicio

    def incrementar():
        nonlocal valor
        valor += 1
        return valor

    return incrementar


print(saudar("Ana"), saudar("Ana", titulo="Dra."))
print(somar_tudo(1, 2, 3, 4), descrever(cor="azul", tamanho=3))
quociente, resto = dividir(17, 5)
print(quociente, resto)

print(acumular_errado(1), acumular_errado(2))
print(acumular_certo(1), acumular_certo(2))

contador = criar_contador(10)
contador()
print(contador())

pessoas = [("Ana", 31), ("Bia", 25), ("Caio", 42)]
print(sorted(pessoas, key=lambda p: p[1]))
print(list(map(lambda p: p[0].upper(), pessoas)))
print(max(pessoas, key=lambda p: p[1])[0])` },
    { tipo: "codigo", linguagem: "text", legenda: "Saída", texto: `Sr(a). Ana Dra. Ana
10 cor=azul, tamanho=3
3 2
[1, 2] [1, 2]
[1] [2]
12
[('Bia', 25), ('Ana', 31), ('Caio', 42)]
['ANA', 'BIA', 'CAIO']
Caio` },
    { tipo: "lista", itens: [
      "Argumentos podem ser posicionais ou nomeados: saudar(\"Ana\", titulo=\"Dra.\"). Nomear deixa a chamada legível, principalmente com vários parâmetros.",
      "*numeros reúne os argumentos posicionais extras em uma tupla, e **atributos reúne os nomeados em um dicionário.",
      "Uma função pode devolver vários valores: na verdade, devolve uma tupla, que o chamador desempacota (quociente, resto = dividir(17, 5)).",
      "As dicas de tipo (a: int, -> tuple[int, int]) documentam o contrato e permitem que o editor e ferramentas como o mypy encontrem erros. O Python, sozinho, não as impõe.",
      "Closures: criar_contador devolve incrementar, que \"lembra\" valor. A palavra nonlocal permite alterar uma variável da função de fora.",
      "lambda cria uma função anônima de uma linha, útil como chave de ordenação (key=lambda p: p[1]). Para algo maior, escreva uma def com nome.",
    ] },
    { tipo: "h3", texto: "A armadilha do argumento padrão mutável" },
    { tipo: "p", texto: "Veja a quarta e a quinta linhas da saída. acumular_errado(1) devolve [1], mas acumular_errado(2) devolve [1, 2]: a lista foi guardada de uma chamada para a outra. (Como as duas chamadas devolvem a mesma lista, o print das duas mostra [1, 2] nas duas posições.) Isso acontece porque o valor padrão de um argumento é criado uma só vez, quando a função é definida, e não a cada chamada. Se for uma lista ou um dicionário, todas as chamadas compartilham o mesmo objeto." },
    { tipo: "p", texto: "A versão correta usa None como padrão e cria a lista dentro da função, como em acumular_certo. É um dos erros mais conhecidos de Python, e vale decorar a regra: nunca use [] nem {} como valor padrão." },

    { tipo: "h", texto: "Controle de fluxo" },
    { tipo: "codigo", linguagem: "python", legenda: "Fluxo.py", texto: `nota = 7
if nota >= 9:
    conceito = "A"
elif nota >= 7:
    conceito = "B"
else:
    conceito = "C"
print(conceito)

for i in range(1, 6):
    if i % 2 == 0:
        continue
    if i > 4:
        break
    print(i, end=",")
print()

for numero in [4, 6, 8]:
    if numero % 2 == 1:
        print("achou ímpar")
        break
else:
    print("todos pares")

contagem = 0
while contagem < 3:
    contagem += 1
print(contagem)


def tipo_do_comando(comando):
    match comando.split():
        case ["sair"]:
            return "encerrar"
        case ["ir", destino]:
            return f"ir para {destino}"
        case ["pegar", *itens] if itens:
            return f"pegar {len(itens)} item(ns)"
        case _:
            return "desconhecido"


print(tipo_do_comando("sair"), "|", tipo_do_comando("ir norte"), "|", tipo_do_comando("pegar a b"), "|", tipo_do_comando("dançar"))` },
    { tipo: "codigo", linguagem: "text", legenda: "Saída", texto: `B
1,3,
todos pares
3
encerrar | ir para norte | pegar 2 item(ns) | desconhecido` },
    { tipo: "lista", itens: [
      "if, elif e else: o primeiro caso verdadeiro vence, e o resto é ignorado. Os dois-pontos e a indentação delimitam o bloco.",
      "O for percorre qualquer sequência. range(1, 6) gera de 1 a 5 (o fim não entra). Para percorrer com o índice, use enumerate, e não range(len(...)).",
      "break interrompe o laço e continue vai para a próxima volta, como em outras linguagens.",
      "O else de um laço é uma peculiaridade do Python: roda quando o laço termina sem ter sido interrompido por um break. No exemplo, imprimiu \"todos pares\" porque nenhum ímpar foi encontrado.",
      "match (Python 3.10 ou superior) casa um valor com padrões: listas com formas específicas, captura de partes (destino, *itens) e condições (if itens). O caso _ cobre o que sobrar. É muito mais poderoso do que o switch de outras linguagens.",
    ] },

    { tipo: "h", texto: "Os erros mais comuns de quem está começando" },
    { tipo: "tabela", cabecalho: ["Erro", "O que acontece", "Como corrigir"], linhas: [
      ["Indentação inconsistente", "IndentationError ou um bloco que não faz o que você espera.", "Usar sempre 4 espaços; configurar o editor."],
      ["Lista como argumento padrão", "A lista é compartilhada entre as chamadas.", "Usar None e criar dentro da função."],
      ["Achar que atribuir copia", "Alterar uma lista muda a outra.", ".copy(), list(...) ou copy.deepcopy."],
      ["Usar is para comparar valores", "Resultado imprevisível para números e textos.", "Usar ==; reservar is para None."],
      ["lista = lista.sort()", "A variável vira None.", "Usar lista.sort() sozinho, ou sorted(lista)."],
      ["Modificar uma lista enquanto a percorre", "Elementos são pulados.", "Percorrer uma cópia ou construir uma nova lista."],
      ["Misturar texto e número", "TypeError: não é possível somar str e int.", "Converter explicitamente com str() ou int()."],
      ["dict[chave] em chave que pode faltar", "KeyError.", "Usar dict.get(chave, padrão) ou testar com in."],
    ] },
  ],
  questoes: [
    {
      enunciado: "O que imprime print(7 // 2, 7 / 2, -7 // 2)?",
      opcoes: ["3 3.5 -3", "3 3.5 -4", "3.5 3.5 -3.5", "4 3.5 -4"],
      correta: 1,
      explicacao: "// é a divisão inteira com arredondamento para baixo (piso): 7 // 2 vale 3, e -7 // 2 vale -4, porque o piso de -3,5 é -4. O operador / sempre devolve float: 7 / 2 vale 3.5.",
    },
    {
      enunciado: "Qual é a forma correta de testar se uma variável x é None?",
      opcoes: ["x == None", "x is None", "x = None", "x equals None"],
      correta: 1,
      explicacao: "None é um objeto único, então a comparação de identidade, x is None, é a forma idiomática e segura. O == pode ser sobrescrito por classes e dar resultados inesperados. O operador = é atribuição.",
    },
    {
      enunciado: "O que acontece depois destas linhas?\n\na = [1, 2, 3]\nb = a\nb.append(4)\nprint(a)",
      opcoes: ["[1, 2, 3]", "[1, 2, 3, 4]", "[4]", "Erro"],
      correta: 1,
      explicacao: "Atribuir não copia: a e b apontam para a mesma lista. Alterar uma altera a outra. Para uma cópia independente, use a.copy() ou list(a).",
    },
    {
      enunciado: "Qual destas estruturas é mutável?",
      opcoes: ["tuple", "str", "list", "int"],
      correta: 2,
      explicacao: "Listas (assim como dicionários e conjuntos) podem ser alteradas no lugar. Tuplas, strings e números são imutáveis: qualquer operação cria um novo valor.",
    },
    {
      enunciado: "Qual é o problema deste código?\n\ndef adicionar(item, lista=[]):\n    lista.append(item)\n    return lista",
      opcoes: ["Nenhum: é a forma recomendada", "A lista padrão é criada uma única vez e compartilhada entre todas as chamadas", "Não é permitido ter valor padrão em uma função", "A função não pode devolver uma lista"],
      correta: 1,
      explicacao: "O valor padrão é avaliado uma só vez, na definição da função. Todas as chamadas sem o segundo argumento usam a mesma lista, que cresce a cada uso. O correto é usar lista=None e criar a lista dentro da função.",
    },
    {
      enunciado: "Qual é o valor de idades.get(\"Zé\", 0) se \"Zé\" não está no dicionário idades?",
      opcoes: ["Lança KeyError", "None", "0", "\"Zé\""],
      correta: 2,
      explicacao: "O método get devolve o segundo argumento (o valor padrão) quando a chave não existe, sem lançar erro. Sem o padrão, devolveria None. Já idades[\"Zé\"] lançaria KeyError.",
    },
    {
      enunciado: "O que significa o else em um laço for?",
      opcoes: ["Roda sempre que o laço termina, com ou sem break", "Roda quando o laço termina sem ter sido interrompido por break", "Roda quando o laço não executa nenhuma volta", "Roda se ocorrer uma exceção"],
      correta: 1,
      explicacao: "O else de um laço executa apenas se o laço chegou ao fim naturalmente, sem passar por um break. É útil em buscas: se o break não aconteceu, nada foi encontrado.",
    },
  ],
  desafio: {
    titulo: "Análise de vendas",
    enunciado: "Escreva um programa (vendas.py) que analisa uma lista de vendas e imprime um relatório. Os dados ficam em uma lista de dicionários, e cada cálculo é uma função com nome claro e dicas de tipo.",
    requisitos: [
      "Crie uma lista com pelo menos 8 vendas, cada uma um dicionário com produto, categoria, quantidade e preço unitário em centavos.",
      "Escreva funções para o total vendido (em centavos), o total por categoria (um dicionário), o produto mais vendido em quantidade e a lista de produtos distintos (sem repetição).",
      "Use pelo menos uma list comprehension e uma dict comprehension, e uma lambda como chave de ordenação.",
      "Imprima o relatório com f-strings, mostrando os valores em reais com duas casas decimais e separador de milhar.",
      "Trate o caso de uma lista vazia sem lançar exceção.",
    ],
    criterios: [
      "O programa roda com python vendas.py e imprime o relatório completo.",
      "Nenhuma função tem uma lista ou dicionário como valor padrão de argumento.",
      "Nenhum valor monetário é guardado em float: as contas são em centavos inteiros.",
      "Você usa .get() ou um padrão para as categorias, sem causar KeyError.",
      "Você consegue explicar por que alterar a lista dentro de uma função afeta quem a chamou.",
    ],
    dica: "Para somar por categoria, use totais.get(categoria, 0) + valor, ou collections.defaultdict(int). Comece pelas funções pequenas e teste cada uma com uma lista de 2 ou 3 vendas antes de montar o relatório.",
  },
  referencias: [
    { titulo: "Documentação oficial: tutorial do Python (pt-BR)", url: "https://docs.python.org/pt-br/3/tutorial/index.html" },
    { titulo: "Documentação oficial: tipos embutidos (pt-BR)", url: "https://docs.python.org/pt-br/3/library/stdtypes.html" },
    { titulo: "PEP 8: guia de estilo do código Python (em inglês)", url: "https://peps.python.org/pep-0008/" },
  ],
};
