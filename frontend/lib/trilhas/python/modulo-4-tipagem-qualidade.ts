import type { Modulo } from "../tipos";

export const PY_MODULO_4: Modulo = {
  tipo: "modulo",
  slug: "tipagem-e-qualidade",
  titulo: "Tipagem e qualidade de código",
  resumo: "Type hints, mypy, dataclasses, Protocol, ruff e formatação automática: como manter um projeto Python legível e seguro.",
  nivel: "Júnior",
  leitura: "45 min",
  objetivos: [
    "Anotar funções, variáveis e classes com type hints modernos (list[str], str | None).",
    "Explicar que o Python não verifica tipos em execução e que quem verifica é uma ferramenta como o mypy.",
    "Usar dataclasses e Protocol para modelar dados e contratos.",
    "Ler e corrigir mensagens do mypy, em especial a de valores que podem ser None.",
    "Configurar ruff para lint e formatação e rodar as checagens antes de cada commit.",
  ],
  preRequisitos: [
    "Ter feito os módulos anteriores da trilha de Python ou dominar funções, classes e módulos.",
    "Saber usar o pip e criar um ambiente virtual.",
  ],
  pontosChave: [
    "Type hints são documentação verificável: o Python os ignora ao executar, mas ferramentas os checam.",
    "Prefira a sintaxe moderna: list[int], dict[str, float] e str | None, sem importar nada de typing.",
    "str | None obriga quem usa o resultado a tratar a ausência, e o mypy cobra isso.",
    "Dataclasses eliminam código repetitivo; Protocol descreve contratos sem exigir herança.",
    "Lint e formatação automáticos tiram da revisão de código as discussões de estilo.",
  ],
  blocos: [
    { tipo: "p", texto: "O Python é uma linguagem de tipagem dinâmica: uma variável pode guardar um número agora e um texto depois, e os erros de tipo só aparecem quando a linha problemática executa. Isso é ótimo para um script de dez linhas e arriscado em um sistema de dez mil. A solução adotada pela comunidade foi acrescentar anotações de tipo opcionais e ferramentas que as verificam antes da execução. É o que você vai encontrar em quase todo projeto profissional, inclusive no FastAPI, que usa os tipos para validar requisições." },

    { tipo: "h", texto: "Type hints: o básico" },
    { tipo: "p", texto: "Uma anotação de tipo diz o que uma variável, um parâmetro ou um retorno deveria ser. A sintaxe usa dois-pontos para variáveis e parâmetros e uma seta para o retorno. A informação não muda o comportamento do programa: o interpretador a guarda e a ignora. Seu valor está em três lugares: o editor passa a completar o código e apontar erros, as ferramentas verificam o projeto inteiro, e quem lê a função entende o que ela espera sem precisar adivinhar." },
    { tipo: "p", texto: "A sintaxe moderna (Python 3.10 em diante) dispensa importações para os casos comuns. Escreva list[float] em vez de List[float] e str | None em vez de Optional[str]. O | significa \"ou\": um valor que pode ser um texto ou None." },
    { tipo: "tabela", legenda: "Anotações mais usadas", cabecalho: ["Anotação", "Significa"], linhas: [
      ["int, float, str, bool", "Os tipos básicos."],
      ["list[str]", "Lista em que todos os itens são texto."],
      ["dict[str, int]", "Dicionário com chaves de texto e valores inteiros."],
      ["tuple[int, str]", "Tupla de exatamente dois itens, de tipos diferentes."],
      ["str | None", "Um texto ou a ausência de valor."],
      ["Callable[[int], str]", "Função que recebe um int e devolve um str (de collections.abc)."],
      ["Any", "Qualquer coisa: desliga a verificação, use só em último caso."],
    ] },
    { tipo: "alerta", titulo: "Anotar não é verificar", texto: "def f(x: int) continua aceitando f(\"texto\") sem nenhum erro ao executar: o interpretador não confere. Quem confere é uma ferramenta externa, como o mypy ou o verificador do seu editor. Se você não rodar a ferramenta (de preferência em todo commit e no CI), as anotações viram comentários que podem mentir." },

    { tipo: "h", texto: "Dados e contratos: dataclass e Protocol" },
    { tipo: "p", texto: "Para classes que só guardam dados, o decorador @dataclass gera o construtor, o __repr__ e a comparação com base nos campos anotados, sem você escrever nada disso. Com frozen=True, os objetos ficam imutáveis, o que evita uma classe inteira de bugs. É o equivalente Python dos records do Java e das interfaces de dados do TypeScript." },
    { tipo: "p", texto: "O Protocol resolve outro problema: descrever o que um objeto precisa saber fazer, sem obrigar a herdar de nada. Qualquer classe que tenha os métodos pedidos satisfaz o protocolo, o que combina com o espírito do Python (a chamada tipagem estrutural, ou \"duck typing\" verificado). O código abaixo reúne os dois e roda sem erros." },
    { tipo: "codigo", linguagem: "python", legenda: "tipos_basicos.py", texto: `from dataclasses import dataclass
from typing import Protocol


def media(notas: list[float]) -> float:
    if not notas:
        raise ValueError("lista vazia")
    return sum(notas) / len(notas)


def buscar(nomes: list[str], prefixo: str) -> str | None:
    for nome in nomes:
        if nome.startswith(prefixo):
            return nome
    return None


@dataclass(frozen=True)
class Produto:
    nome: str
    preco: float
    estoque: int = 0

    def com_desconto(self, percentual: float) -> "Produto":
        return Produto(self.nome, round(self.preco * (1 - percentual / 100), 2), self.estoque)


class Notificador(Protocol):
    def enviar(self, mensagem: str) -> str: ...


class PorEmail:
    def enviar(self, mensagem: str) -> str:
        return f"email: {mensagem}"


def avisar(notificador: Notificador, texto: str) -> str:
    return notificador.enviar(texto)


print(media([7.0, 8.5, 6.0]))
achado = buscar(["Ana", "Bruno"], "Br")
print(achado.upper() if achado is not None else "ninguém")
print(buscar(["Ana"], "Z"))

caneta = Produto("caneta", 4.0, 10)
print(caneta.com_desconto(25))
print(avisar(PorEmail(), "pedido enviado"))` },
    { tipo: "codigo", linguagem: "text", legenda: "Saída", texto: `7.166666666666667
BRUNO
None
Produto(nome='caneta', preco=3.0, estoque=10)
email: pedido enviado` },
    { tipo: "p", texto: "Repare que a classe PorEmail nunca diz que \"implementa\" Notificador. Basta ter o método enviar com a assinatura certa, e o verificador aceita. Já a função buscar devolve str | None, e a linha que usa o resultado só chama upper() depois de checar que ele não é None. Esse cuidado é o centro do próximo assunto." },

    { tipo: "h", texto: "mypy: o verificador de tipos" },
    { tipo: "p", texto: "O mypy lê o seu código, cruza as anotações com o uso e aponta as inconsistências sem executar nada. Instale-o no ambiente de desenvolvimento (pip install mypy) e rode mypy --strict arquivo.py, ou na pasta inteira. O modo --strict liga as checagens mais rigorosas, como exigir anotação em todas as funções, e é o ponto de partida recomendado para projetos novos. Em projetos antigos, vale começar sem ele e apertar aos poucos." },
    { tipo: "codigo", linguagem: "python", legenda: "com_erros.py (com erros de tipo)", texto: `def media(notas: list[float]) -> float:
    return sum(notas) / len(notas)


def primeiro(nomes: list[str]) -> str | None:
    return nomes[0] if nomes else None


print(media(["7", "8"]))
print(primeiro(["Ana"]).upper())
resultado: int = media([1.0, 2.0])` },
    { tipo: "codigo", linguagem: "text", legenda: "Saída do mypy --strict", texto: `com_erros.py:9: error: List item 0 has incompatible type "str"; expected "float"  [list-item]
com_erros.py:9: error: List item 1 has incompatible type "str"; expected "float"  [list-item]
com_erros.py:10: error: Item "None" of "str | None" has no attribute "upper"  [union-attr]
com_erros.py:11: error: Incompatible types in assignment (expression has type "float", variable has type "int")  [assignment]
Found 4 errors in 1 file (checked 1 source file)` },
    { tipo: "p", texto: "Os três tipos de erro são os mais comuns. O primeiro é passar o tipo errado a uma função. O segundo, o mais valioso, é usar um resultado que pode ser None sem checar: é a versão em Python do clássico erro de referência nula, e o mypy o encontra sem você precisar executar o caso raro em que ele aconteceria. O terceiro é atribuir um valor a uma variável de outro tipo. Cada mensagem traz o arquivo, a linha, a explicação e, entre colchetes, o código do erro." },
    { tipo: "h3", texto: "Como tratar o None" },
    { tipo: "lista", itens: [
      "Teste explicitamente: if achado is not None: ... Dentro do bloco, o verificador sabe que o valor é um str.",
      "Devolva cedo: if achado is None: raise ValueError(...), e o resto da função trabalha com o tipo já estreitado.",
      "Dê um valor padrão: achado or \"desconhecido\", quando um padrão faz sentido.",
      "Evite o escape assert x is not None, a não ser que a lógica realmente garanta isso, e nunca desligue o aviso com # type: ignore sem comentar por quê.",
    ] },
    { tipo: "dica", titulo: "Comece pelas fronteiras", texto: "Em um projeto existente sem anotações, anote primeiro o que cruza fronteiras: funções públicas, entradas de API, dados vindos de arquivos e do banco. Ali os tipos dão mais valor e os erros custam mais caro. O interior pode ficar para depois." },

    { tipo: "h", texto: "ruff: lint e formatação" },
    { tipo: "p", texto: "Tipos pegam erros de contrato. Há outra categoria de problema que um verificador de tipos não vê: imports sem uso, variáveis que nunca são lidas, comparações com None feitas do jeito errado, código morto. Quem encontra isso é um linter. O ruff, escrito em Rust, é hoje o mais usado em projetos novos: roda em milissegundos, substitui várias ferramentas mais antigas (flake8, isort, pyupgrade, black) e é configurado em um único arquivo." },
    { tipo: "codigo", linguagem: "python", legenda: "sujo.py (com problemas de estilo)", texto: `import os
import sys


def soma(a, b):
    resultado = a + b
    x = 10
    return a+b


lista = [1,2,3]
if lista == None:
    print("vazia")` },
    { tipo: "codigo", linguagem: "text", legenda: "Saída do ruff check", texto: `sujo.py:1:8: F401 [*] \`os\` imported but unused
sujo.py:2:8: F401 [*] \`sys\` imported but unused
sujo.py:6:5: F841 Local variable \`resultado\` is assigned to but never used
sujo.py:7:5: F841 Local variable \`x\` is assigned to but never used
sujo.py:12:13: E711 Comparison to \`None\` should be \`cond is None\`
Found 5 errors.` },
    { tipo: "p", texto: "Cada linha traz o código da regra (F401, E711), que você pode pesquisar para entender o motivo. As marcas [*] indicam correções automáticas com ruff check --fix. Já o ruff format cuida só da aparência: espaços ao redor de operadores, vírgulas, aspas e quebras de linha. No exemplo, ele trocaria a+b por a + b e [1,2,3] por [1, 2, 3], sem mudar o significado." },
    { tipo: "p", texto: "A configuração mora no pyproject.toml, o arquivo que concentra os metadados do projeto Python. Um ponto de partida sensato escolhe conjuntos de regras amplos o bastante para ajudar e estreitos o bastante para não incomodar." },
    { tipo: "codigo", linguagem: "text", legenda: "pyproject.toml", texto: `[project]
name = "meu-servico"
version = "0.1.0"
requires-python = ">=3.11"

[tool.ruff]
line-length = 100
target-version = "py311"

[tool.ruff.lint]
select = ["E", "F", "W", "I", "B", "UP"]

[tool.mypy]
strict = true
python_version = "3.11"` },
    { tipo: "p", texto: "As regras E, F e W vêm do estilo clássico e dos erros mais simples; I ordena os imports; B (bugbear) pega armadilhas conhecidas, como argumentos padrão mutáveis; UP moderniza a sintaxe para a versão de Python do projeto." },

    { tipo: "h", texto: "Automatizando a qualidade" },
    { tipo: "p", texto: "Ferramentas que ninguém roda não protegem nada. Três camadas ajudam. A primeira é o editor: configure-o para formatar ao salvar e mostrar os avisos do ruff e do mypy enquanto você escreve. A segunda é um hook de pré-commit (com a ferramenta pre-commit ou um script simples), que roda as checagens antes de aceitar o commit. A terceira, a mais importante, é o CI: o repositório rejeita mudanças que não passam. Só o CI é à prova de esquecimento, pois vale para todo mundo, inclusive para você em um dia apressado." },
    { tipo: "codigo", linguagem: "bash", legenda: "Checagens do dia a dia", texto: `ruff format .          # formata o código
ruff check --fix .     # aponta (e corrige) problemas
mypy .                 # verifica os tipos
pytest                 # roda os testes` },
    { tipo: "lista", itens: [
      "Rode as mesmas quatro linhas localmente e no CI, para que \"funciona na minha máquina\" signifique algo.",
      "Fixe as versões das ferramentas (no pyproject ou em um arquivo de requisitos de desenvolvimento), para que uma atualização não quebre o CI sem aviso.",
      "Trate os avisos como erros no CI: um aviso ignorado hoje vira um problema aceito amanhã.",
      "Ao silenciar uma regra, faça-o na linha exata, com um comentário explicando o motivo.",
      "Reveja os tipos Any: cada um é um buraco na verificação, e a quantidade deles diz muito sobre a saúde do projeto.",
    ] },
    { tipo: "alerta", titulo: "Tipos não substituem validação de entrada", texto: "Os type hints não existem em tempo de execução para checar dados que chegam de fora. Se uma função anotada com int recebe do usuário um texto, nada impede. Dados de entrada (requisições, arquivos, variáveis de ambiente) precisam de validação real. É por isso que bibliotecas como Pydantic, base do FastAPI, usam as anotações para validar em execução, tema do próximo módulo." },
  ],
  questoes: [
    {
      enunciado: "O que acontece ao executar def f(x: int) -> int: return x seguido de f(\"texto\") em Python puro?",
      opcoes: ["Lança TypeError porque o tipo está errado", "Executa normalmente: o interpretador ignora as anotações, e só uma ferramenta externa acusaria o erro", "Converte o texto para int automaticamente", "Dá erro de sintaxe"],
      correta: 1,
      explicacao: "Os type hints não são verificados pelo interpretador. Quem acusa o erro é o mypy (ou o editor), antes de executar. Por isso é preciso rodar a ferramenta no commit e no CI.",
    },
    {
      enunciado: "O que significa a anotação str | None?",
      opcoes: ["Um texto, necessariamente vazio", "Um texto ou a ausência de valor (None)", "Uma lista de textos", "Um texto e também None"],
      correta: 1,
      explicacao: "O | significa \"ou\": o valor pode ser um str ou None. O verificador então exige que você trate o caso None antes de usar métodos de str.",
    },
    {
      enunciado: "Por que o mypy reclama de buscar(nomes, \"x\").upper() quando buscar devolve str | None?",
      opcoes: ["Porque upper não existe em Python", "Porque o resultado pode ser None, e None não tem o método upper", "Porque o prefixo é inválido", "Porque faltou um import"],
      correta: 1,
      explicacao: "Se nenhum nome combinar, a função devolve None, e chamar upper() em None lança AttributeError. O mypy encontra isso antes de executar, e a correção é checar is not None antes.",
    },
    {
      enunciado: "Qual a principal vantagem de um Protocol em relação a uma classe base comum?",
      opcoes: ["Torna a execução mais rápida", "Qualquer classe que tenha os métodos pedidos satisfaz o contrato, sem precisar herdar dele", "Permite criar objetos do protocolo", "Impede que outras classes tenham métodos extras"],
      correta: 1,
      explicacao: "O Protocol usa tipagem estrutural: o que importa é a forma (os métodos e suas assinaturas), e não a árvore de herança. Isso reduz o acoplamento entre quem define o contrato e quem o satisfaz.",
    },
    {
      enunciado: "O que faz @dataclass(frozen=True) em uma classe?",
      opcoes: ["Gera construtor, repr e comparação a partir dos campos, e torna os objetos imutáveis", "Congela o interpretador", "Impede a criação de métodos", "Transforma a classe em um dicionário"],
      correta: 0,
      explicacao: "@dataclass gera __init__, __repr__ e __eq__ a partir dos atributos anotados. Com frozen=True, tentar alterar um campo depois da criação lança uma exceção, o que torna o objeto imutável.",
    },
    {
      enunciado: "Qual a diferença entre o ruff check e o ruff format?",
      opcoes: ["Nenhuma, são o mesmo comando", "O check aponta problemas de código (imports sem uso, comparações erradas); o format só ajusta a aparência, sem mudar o significado", "O format verifica tipos", "O check só funciona com mypy instalado"],
      correta: 1,
      explicacao: "O check é o linter: encontra problemas de lógica e estilo, alguns com correção automática. O format reescreve espaços, vírgulas e quebras de linha, deixando todo o código com a mesma aparência.",
    },
    {
      enunciado: "Por que as checagens (ruff, mypy, pytest) devem rodar também no CI, e não só no editor?",
      opcoes: ["Porque o editor não consegue rodá-las", "Porque só o CI vale para todos os contribuidores e não depende de alguém lembrar de rodar", "Porque o CI deixa o código mais rápido", "Porque as ferramentas só funcionam em servidores"],
      correta: 1,
      explicacao: "Editor e hook de pré-commit ajudam, mas podem ser ignorados ou estar mal configurados. O CI é o filtro que bloqueia mudanças fora do padrão para todo mundo, de forma automática.",
    },
  ],
  desafio: {
    titulo: "Biblioteca tipada e sem avisos",
    enunciado: "Escreva uma pequena biblioteca de controle de estoque (estoque.py) totalmente anotada, que passe em mypy --strict e em ruff check sem avisos. O objetivo é praticar tipos, dataclasses e protocolos e, principalmente, a rotina de rodar as ferramentas.",
    requisitos: [
      "Modele Produto como uma dataclass imutável (nome, sku, preco, quantidade) e valide os valores no __post_init__ (preço e quantidade não podem ser negativos).",
      "Crie uma classe Estoque com métodos adicionar, remover, buscar_por_sku (devolve Produto | None) e valor_total, todos com tipos completos.",
      "Defina um Protocol Persistencia com salvar e carregar, e uma implementação que guarda os dados em um arquivo JSON.",
      "Crie um pyproject.toml com a configuração do ruff (regras E, F, W, I, B, UP) e do mypy em modo estrito.",
      "Escreva um script curto que usa a biblioteca e trate o caso de um SKU inexistente sem deixar o mypy reclamar.",
    ],
    criterios: [
      "mypy --strict e ruff check terminam sem nenhum aviso.",
      "O ruff format não altera nenhum arquivo ao ser executado.",
      "Não há Any nem # type: ignore sem uma justificativa em comentário.",
      "O Estoque depende do Protocol, e não da implementação em arquivo.",
      "Você consegue explicar o que o mypy checa e o que ele não consegue checar.",
    ],
    dica: "Rode as ferramentas a cada função nova, e não só no fim. Um erro de tipo apontado logo depois de escrever é uma correção de dez segundos; apontado depois de duzentas linhas, é uma investigação.",
  },
  referencias: [
    { titulo: "Documentação do Python: módulo typing", url: "https://docs.python.org/3/library/typing.html" },
    { titulo: "mypy: primeiros passos (em inglês)", url: "https://mypy.readthedocs.io/en/stable/getting_started.html" },
    { titulo: "ruff: documentação (em inglês)", url: "https://docs.astral.sh/ruff/" },
  ],
};
