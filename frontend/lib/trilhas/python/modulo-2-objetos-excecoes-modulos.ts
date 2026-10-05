import type { Modulo } from "../tipos";

export const PY_MODULO_2: Modulo = {
  tipo: "modulo",
  slug: "objetos-excecoes-e-modulos",
  titulo: "Orientação a objetos, exceções, arquivos e módulos",
  resumo: "Classes, herança e dataclasses, o tratamento de erros com try/except, o comando with e como organizar o código em módulos e pacotes.",
  nivel: "Júnior",
  leitura: "45 min",
  objetivos: [
    "Modelar um problema com classes, atributos, métodos e propriedades.",
    "Usar herança com super() e entender o duck typing e o polimorfismo em Python.",
    "Escrever dataclasses para classes que só guardam dados.",
    "Tratar erros com try/except/else/finally, criar exceções próprias e encadear causas.",
    "Usar o with para recursos que precisam ser fechados, e organizar o projeto em módulos e pacotes.",
  ],
  preRequisitos: [
    "Ter feito o módulo \"Fundamentos\" ou conhecer tipos, listas, dicionários e funções em Python.",
    "Python 3.10 ou mais novo instalado.",
  ],
  pontosChave: [
    "Uma classe é um molde. O self é o objeto sobre o qual o método foi chamado, e precisa aparecer como primeiro parâmetro.",
    "Em Python, nada é realmente privado: o underscore inicial é uma convenção que avisa \"uso interno\".",
    "Duck typing: o que importa é se o objeto tem os métodos necessários, não de qual classe ele é.",
    "Capture exceções específicas, nunca um except: genérico, e use finally ou with para liberar recursos.",
    "Pedir perdão costuma ser melhor do que pedir permissão: tente a operação e trate o erro (EAFP).",
  ],
  blocos: [
    { tipo: "p", texto: "Com os fundamentos você já resolve muitos problemas pequenos. À medida que o programa cresce, duas necessidades aparecem: agrupar dados e comportamento que andam juntos, e lidar com as coisas que dão errado. As classes resolvem a primeira, e as exceções, a segunda. Fechamos o módulo com a forma de organizar o código em arquivos e pacotes, o que transforma um script em um projeto." },

    { tipo: "h", texto: "Classes e objetos" },
    { tipo: "p", texto: "Uma classe é um molde que descreve que dados (atributos) e que comportamentos (métodos) um tipo de objeto tem. Um objeto, ou instância, é uma coisa concreta criada a partir desse molde. Em Python, tudo é objeto, inclusive números e funções: você já usa classes o tempo todo." },
    { tipo: "codigo", linguagem: "python", legenda: "Classes.py", texto: `class Conta:
    taxa_padrao = 100  # atributo de classe: compartilhado por todas as contas

    def __init__(self, titular, saldo=0):
        self.titular = titular
        self._saldo = saldo  # o underscore avisa: uso interno

    @property
    def saldo(self):
        return self._saldo

    def depositar(self, valor):
        if valor <= 0:
            raise ValueError("o valor do depósito deve ser positivo")
        self._saldo += valor

    @classmethod
    def vazia(cls, titular):
        return cls(titular)

    @staticmethod
    def valor_valido(valor):
        return valor > 0

    def __repr__(self):
        return f"{type(self).__name__}(titular={self.titular!r}, saldo={self._saldo})"

    def __eq__(self, outra):
        return isinstance(outra, Conta) and self.titular == outra.titular


class ContaPoupanca(Conta):
    def __init__(self, titular, saldo=0, rendimento=0.01):
        super().__init__(titular, saldo)
        self.rendimento = rendimento

    def render(self):
        self._saldo += int(self._saldo * self.rendimento)


ana = Conta("Ana", 1000)
ana.depositar(500)
print(ana, ana.saldo)

try:
    ana.depositar(-5)
except ValueError as erro:
    print("erro:", erro)

nova = Conta.vazia("Bia")
print(nova, Conta.valor_valido(10), Conta.taxa_padrao)

poupanca = ContaPoupanca("Caio", 10000, rendimento=0.05)
poupanca.render()
print(poupanca, isinstance(poupanca, Conta), issubclass(ContaPoupanca, Conta))
print(Conta("Ana") == Conta("Ana", 99), Conta("Ana") == Conta("Bia"))

for item in [ana, poupanca]:
    print(type(item).__name__, item.saldo)` },
    { tipo: "codigo", linguagem: "text", legenda: "Saída", texto: `Conta(titular='Ana', saldo=1500) 1500
erro: o valor do depósito deve ser positivo
Conta(titular='Bia', saldo=0) True 100
ContaPoupanca(titular='Caio', saldo=10500) True True
True False
Conta 1500
ContaPoupanca 10500` },
    { tipo: "h3", texto: "As peças, uma a uma" },
    { tipo: "lista", itens: [
      "__init__ é o inicializador: roda quando você cria o objeto (Conta(\"Ana\", 1000)) e guarda os dados em atributos de instância, com self.nome = valor.",
      "self é o próprio objeto. Todo método de instância o recebe como primeiro parâmetro, e o Python o preenche sozinho na chamada: ana.depositar(500) equivale a Conta.depositar(ana, 500). Esquecer o self na definição é um erro clássico (\"takes 1 positional argument but 2 were given\").",
      "Atributos de instância (self.titular) pertencem a cada objeto. Atributos de classe (taxa_padrao) são compartilhados por todos.",
      "Nada é privado de verdade. A convenção do underscore (_saldo) diz aos outros programadores \"não mexa nisso de fora\". Um underscore duplo (__x) faz o Python trocar o nome para dificultar acessos acidentais, mas é raro precisar disso.",
      "@property transforma um método em um atributo de leitura (ana.saldo, sem parênteses). Permite começar com um atributo simples e, depois, acrescentar validação ou cálculo sem mudar quem usa.",
      "@classmethod recebe a classe (cls) em vez do objeto, e é a forma idiomática de criar construtores alternativos (Conta.vazia(...)). Em uma subclasse, cls já é a subclasse.",
      "@staticmethod é uma função comum que mora dentro da classe por organização: não recebe nem self nem cls.",
      "Os métodos com dois underscores nas pontas (dunder methods) integram a sua classe aos recursos da linguagem: __repr__ define como o objeto aparece no print e no depurador, __eq__ define o ==.",
    ] },
    { tipo: "alerta", titulo: "Definir __eq__ muda o __hash__", texto: "Quando uma classe define __eq__ e não define __hash__, o Python marca os objetos como não hasheáveis: eles não podem ser chaves de dicionário nem entrar em conjuntos. Para objetos de dados, o mais simples é usar uma dataclass, que cuida disso corretamente." },

    { tipo: "h", texto: "Herança, polimorfismo e duck typing" },
    { tipo: "p", texto: "Na herança, uma classe filha reaproveita e especializa o que a mãe oferece. ContaPoupanca herda de Conta (class ContaPoupanca(Conta)) e ganha o depositar, o saldo e o __repr__. Dentro do __init__ da filha, super().__init__(...) chama o inicializador da mãe, para que ela configure a sua parte. Esquecer essa chamada é um erro comum: o objeto fica sem os atributos da mãe." },
    { tipo: "p", texto: "O isinstance(poupanca, Conta) é verdadeiro, porque uma poupança é uma conta. Por isso o laço final trata os dois objetos do mesmo jeito e cada um responde pelo seu tipo: isso é polimorfismo." },
    { tipo: "p", texto: "Python vai além com o duck typing: \"se anda como pato e grasna como pato, é um pato\". Uma função não precisa exigir que o argumento seja de uma classe específica: basta que ele tenha os métodos que a função vai usar. Isso torna o código flexível e dispensa muitas hierarquias que outras linguagens exigem. Se uma classe só existe para dar um tipo comum, geralmente não é necessária em Python." },
    { tipo: "dica", titulo: "Prefira composição à herança", texto: "Herança cria um acoplamento forte: mudanças na classe mãe afetam todas as filhas. Quando a relação é de \"tem um\" em vez de \"é um\" (uma Loja tem Contas, mas não é uma Conta), guarde o objeto em um atributo. Use herança quando a relação \"é um\" for natural, e mantenha as hierarquias rasas." },

    { tipo: "h", texto: "Dataclasses: classes para guardar dados" },
    { tipo: "p", texto: "Muitas classes só existem para agrupar dados. Escrever o __init__, o __repr__ e o __eq__ à mão é repetitivo. O decorador @dataclass gera tudo isso a partir das anotações de tipo dos campos." },
    { tipo: "codigo", linguagem: "python", legenda: "Dataclasses.py", texto: `from dataclasses import asdict, dataclass, field


@dataclass(order=True)
class Produto:
    nome: str
    preco_centavos: int
    tags: list[str] = field(default_factory=list)


@dataclass(frozen=True)
class Ponto:
    x: int
    y: int


a = Produto("caneta", 250, ["escritório"])
b = Produto("caderno", 1990)
print(a)
print(a == Produto("caneta", 250, ["escritório"]), a < b)
print(asdict(b))

p = Ponto(1, 2)
try:
    p.x = 10
except AttributeError as erro:
    print("imutável:", type(erro).__name__)

print(sorted([b, a])[0].nome)
print(Ponto(1, 2) == Ponto(1, 2), len({Ponto(1, 2), Ponto(1, 2)}))` },
    { tipo: "codigo", linguagem: "text", legenda: "Saída", texto: `Produto(nome='caneta', preco_centavos=250, tags=['escritório'])
True False
{'nome': 'caderno', 'preco_centavos': 1990, 'tags': []}
imutável: FrozenInstanceError
caderno
True 1` },
    { tipo: "lista", itens: [
      "A comparação == compara os campos, e order=True permite usar < e ordenar (pela ordem dos campos).",
      "field(default_factory=list) é a forma correta de ter uma lista como valor padrão: cada objeto recebe a sua. É a mesma regra do argumento padrão mutável, que a dataclass aplica por você (e proíbe o erro: tags: list = [] lança uma exceção).",
      "frozen=True deixa o objeto imutável, e ele ainda funciona como elemento de conjunto (por isso o conjunto com dois Ponto(1, 2) tem tamanho 1).",
      "asdict converte a dataclass em um dicionário, útil para gerar JSON.",
    ] },

    { tipo: "h", texto: "Exceções: lidando com o que dá errado" },
    { tipo: "p", texto: "Quando algo dá errado em um programa Python (dividir por zero, abrir um arquivo que não existe, converter um texto que não é número), o interpretador lança uma exceção. Se ninguém a trata, o programa termina e mostra a pilha de chamadas (traceback). Tratar exceções é o que separa um script frágil de um sistema que continua funcionando diante do inesperado." },
    { tipo: "codigo", linguagem: "python", legenda: "Excecoes.py", texto: `class SaldoInsuficiente(Exception):
    def __init__(self, saldo, valor):
        super().__init__(f"saldo {saldo} insuficiente para sacar {valor}")
        self.saldo = saldo
        self.valor = valor


def sacar(saldo, valor):
    if valor > saldo:
        raise SaldoInsuficiente(saldo, valor)
    return saldo - valor


def converter(texto):
    try:
        numero = int(texto)
    except ValueError:
        print("não é um número")
        return None
    else:
        print("convertido")
        return numero
    finally:
        print("fim da conversão")


def carregar(chave, dados):
    try:
        return dados[chave]
    except KeyError as erro:
        raise LookupError(f"configuração ausente: {chave}") from erro


print(sacar(100, 30))
try:
    sacar(100, 500)
except SaldoInsuficiente as erro:
    print(erro, "|", erro.saldo, erro.valor)

print(converter("42"))
print(converter("abc"))

try:
    carregar("porta", {})
except LookupError as erro:
    print(erro, "| causa:", type(erro.__cause__).__name__)

try:
    1 / 0
except ZeroDivisionError:
    print("divisão por zero")
except (TypeError, ValueError):
    print("outro erro")` },
    { tipo: "codigo", linguagem: "text", legenda: "Saída", texto: `70
saldo 100 insuficiente para sacar 500 | 100 500
convertido
fim da conversão
42
não é um número
fim da conversão
None
configuração ausente: porta | causa: KeyError
divisão por zero` },
    { tipo: "h3", texto: "A estrutura completa do try" },
    { tipo: "tabela", cabecalho: ["Bloco", "Quando roda", "Para quê"], linhas: [
      ["try", "Sempre começa por ele.", "O código que pode falhar."],
      ["except Tipo", "Se uma exceção daquele tipo (ou de uma subclasse) for lançada.", "Tratar o erro. Pode haver vários, e o primeiro que combina vence."],
      ["else", "Se o try terminou sem exceção.", "O código que depende do sucesso, separado do que pode falhar."],
      ["finally", "Sempre, com erro ou sem erro, mesmo se houver return.", "Liberar recursos: fechar arquivo, soltar uma conexão."],
    ] },
    { tipo: "p", texto: "Repare que o finally de converter rodou nas duas chamadas (\"42\" e \"abc\"), inclusive a que usou return dentro do else. Ele é a garantia de que a limpeza acontece." },
    { tipo: "h3", texto: "Boas práticas" },
    { tipo: "lista", itens: [
      "Capture o tipo específico que você sabe tratar. Um except: sozinho (ou except Exception: sem critério) engole todos os erros, inclusive bugs e até Ctrl+C, e esconde o problema real. Se a única coisa que você faz é imprimir e seguir, provavelmente deveria deixar subir.",
      "Crie exceções próprias herdando de Exception (SaldoInsuficiente), com os dados do erro como atributos. Quem captura ganha informação e decide o que fazer, em vez de analisar o texto da mensagem.",
      "Encadeie causas com raise Novo(...) from erro: a exceção original fica em __cause__ e aparece no traceback. Isso preserva a história do erro quando você traduz uma exceção de baixo nível para uma do seu domínio.",
      "Use raise sozinho dentro de um except para relançar a mesma exceção depois de, por exemplo, registrá-la no log.",
      "EAFP: é mais fácil pedir perdão do que permissão. Em Python, o estilo comum é tentar a operação e tratar a falha (try: valor = dados[chave]), em vez de testar antes (if chave in dados). Evita corridas e costuma ser mais claro.",
      "Valide os dados de entrada na fronteira do sistema e levante exceções com mensagens úteis, que dizem o que estava errado e o valor recebido.",
    ] },
    { tipo: "alerta", titulo: "Nunca devolva ao usuário o texto de uma exceção interna", texto: "Em uma API ou aplicação web, mostrar str(erro) ao cliente pode vazar caminhos, consultas e dados internos. Registre o detalhe no log e responda com uma mensagem genérica, como visto na trilha de Segurança." },

    { tipo: "h", texto: "O comando with e os gerenciadores de contexto" },
    { tipo: "p", texto: "Alguns recursos precisam ser liberados depois do uso: arquivos, conexões, travas. O with garante a limpeza mesmo se ocorrer uma exceção no meio, sem precisar de um try/finally escrito à mão. O objeto usado no with é um gerenciador de contexto: ele define o que fazer ao entrar e ao sair." },
    { tipo: "codigo", linguagem: "python", legenda: "Contexto.py", texto: `import json
import tempfile
from contextlib import contextmanager
from pathlib import Path


@contextmanager
def cronometrado(nome):
    print(f"início: {nome}")
    try:
        yield
    finally:
        print(f"fim: {nome}")


with tempfile.TemporaryDirectory() as pasta:
    caminho = Path(pasta) / "notas.json"
    caminho.write_text(json.dumps({"notas": [8, 6, 10]}), encoding="utf-8")

    with cronometrado("leitura"):
        with open(caminho, encoding="utf-8") as arquivo:
            dados = json.load(arquivo)
    print(len(dados["notas"]), max(dados["notas"]))
    print(caminho.name, caminho.suffix, caminho.exists())

    try:
        (Path(pasta) / "nao-existe.txt").read_text()
    except FileNotFoundError as erro:
        print("não encontrado:", type(erro).__name__)

print(Path(pasta).exists())` },
    { tipo: "codigo", linguagem: "text", legenda: "Saída", texto: `início: leitura
fim: leitura
3 10
notas.json .json True
não encontrado: FileNotFoundError
False` },
    { tipo: "lista", itens: [
      "A pasta temporária foi criada pelo with e apagada ao final: a última linha mostra False. O mesmo vale para open(...): o arquivo é fechado ao sair do bloco, mesmo com erro.",
      "O decorador @contextmanager permite criar o seu gerenciador com uma função simples: o que vem antes do yield é a entrada, e o que está no finally, a saída.",
      "pathlib.Path trata caminhos como objetos: a barra (/) junta partes, e há métodos como read_text, write_text, exists, name e suffix. É preferível a montar caminhos com texto.",
      "Informe sempre o encoding (utf-8) ao ler e gravar texto: o padrão depende do sistema operacional, e arquivos com acentos quebram quando ele muda.",
      "O módulo json converte entre texto JSON e estruturas Python (dumps e loads para texto, dump e load para arquivos).",
    ] },

    { tipo: "h", texto: "Módulos, pacotes e ambientes virtuais" },
    { tipo: "p", texto: "Um módulo é simplesmente um arquivo .py. Você usa o código dele com import. Um pacote é uma pasta de módulos (tradicionalmente com um arquivo __init__.py). Dividir o programa em módulos é o que o mantém compreensível quando ele passa de algumas centenas de linhas." },
    { tipo: "codigo", linguagem: "text", legenda: "Estrutura de um projeto", texto: `loja/
├── pyproject.toml
├── src/
│   └── loja/
│       ├── __init__.py
│       ├── contas.py
│       ├── relatorios.py
│       └── __main__.py
└── tests/
    └── test_contas.py` },
    { tipo: "codigo", linguagem: "python", legenda: "relatorios.py (trecho)", texto: `from loja.contas import Conta
import json  # biblioteca padrão: não precisa instalar


def resumo(contas: list[Conta]) -> str:
    return json.dumps({"total": sum(c.saldo for c in contas)})


if __name__ == "__main__":
    # só roda quando o arquivo é executado diretamente,
    # e não quando ele é importado por outro módulo
    print(resumo([Conta("Ana", 100)]))` },
    { tipo: "lista", itens: [
      "A forma import modulo usa o prefixo (modulo.funcao); from modulo import funcao traz o nome direto. Evite from modulo import *, que despeja nomes no seu código sem você saber de onde vêm.",
      "if __name__ == \"__main__\": separa o que é biblioteca do que é programa. Quando o arquivo é importado, o __name__ é o nome do módulo e o bloco não roda.",
      "Cuidado com imports circulares (a importa b, que importa a): resolva movendo o código compartilhado para um terceiro módulo.",
      "A biblioteca padrão é enorme (json, pathlib, datetime, collections, itertools, logging, sqlite3). Antes de instalar um pacote, veja se ela já resolve.",
    ] },
    { tipo: "h3", texto: "Ambiente virtual e pip" },
    { tipo: "codigo", linguagem: "bash", legenda: "Um ambiente por projeto", texto: `python -m venv .venv          # cria o ambiente isolado
source .venv/bin/activate     # Linux e macOS (no Windows: .venv\\Scripts\\activate)
pip install fastapi pytest    # instala só dentro do ambiente
pip freeze > requirements.txt # registra as versões instaladas
pip install -r requirements.txt  # reproduz em outra máquina` },
    { tipo: "p", texto: "O ambiente virtual isola as bibliotecas de cada projeto, evitando conflitos de versão. Nunca instale pacotes direto no Python do sistema para um projeto. E nunca versione a pasta .venv: coloque-a no .gitignore e versione apenas o arquivo de dependências." },

    { tipo: "h", texto: "Os erros mais comuns de quem está começando" },
    { tipo: "tabela", cabecalho: ["Erro", "O que acontece", "Como corrigir"], linhas: [
      ["Esquecer o self na definição do método", "TypeError: takes 1 positional argument but 2 were given.", "Todo método de instância recebe self primeiro."],
      ["Esquecer super().__init__() na filha", "Os atributos da mãe não existem.", "Chamar super().__init__(...)."],
      ["except: sem tipo", "Engole erros e esconde bugs.", "Capturar a exceção específica."],
      ["Lista como atributo padrão em dataclass", "ValueError na definição da classe.", "field(default_factory=list)."],
      ["Abrir arquivo sem with", "Arquivo fica aberto em caso de erro.", "with open(...) as f."],
      ["Ler arquivo de texto sem encoding", "Acentos quebrados em outro sistema.", "Informar encoding=\"utf-8\"."],
      ["Importar de forma circular", "ImportError ou nomes que não existem ainda.", "Extrair o código compartilhado para um terceiro módulo."],
      ["Instalar pacotes sem ambiente virtual", "Versões conflitantes entre projetos.", "Um .venv por projeto."],
    ] },
  ],
  questoes: [
    {
      enunciado: "Para que serve o self em um método de instância?",
      opcoes: ["É uma palavra reservada que cria o objeto", "É o próprio objeto sobre o qual o método foi chamado, passado como primeiro parâmetro", "É a classe, compartilhada por todos os objetos", "É um atributo privado"],
      correta: 1,
      explicacao: "O self referencia a instância atual. O Python o passa sozinho: ana.depositar(500) equivale a Conta.depositar(ana, 500). Quem recebe a classe (e não o objeto) é o cls, nos métodos de classe.",
    },
    {
      enunciado: "O que o underscore inicial em self._saldo comunica?",
      opcoes: ["Que o atributo é privado e o Python impede o acesso de fora", "Que é uma convenção: o atributo é de uso interno e não deve ser usado de fora", "Que o atributo é constante", "Que o atributo é compartilhado entre instâncias"],
      correta: 1,
      explicacao: "Python não tem atributos realmente privados. O underscore é uma convenção entre programadores: \"não mexa nisso de fora\". O acesso continua sendo possível, mas quem o faz assume o risco.",
    },
    {
      enunciado: "Qual é a função de super().__init__(titular, saldo) em uma classe filha?",
      opcoes: ["Cria uma nova classe mãe", "Chama o inicializador da classe mãe para configurar a parte herdada", "Impede que a filha tenha atributos próprios", "Copia o objeto da mãe"],
      correta: 1,
      explicacao: "A filha precisa que a mãe inicialize os seus atributos. super().__init__(...) delega essa tarefa. Se for esquecido, os atributos da mãe simplesmente não existem no objeto.",
    },
    {
      enunciado: "O que significa duck typing?",
      opcoes: ["Declarar o tipo de cada variável", "O que importa é o objeto ter os métodos necessários, não de qual classe ele é", "Converter automaticamente entre tipos", "Usar sempre herança para compartilhar comportamento"],
      correta: 1,
      explicacao: "\"Se anda como pato e grasna como pato, é um pato\". Uma função usa o objeto pelo que ele sabe fazer, não pelo seu tipo declarado. Isso dispensa muitas hierarquias de classes.",
    },
    {
      enunciado: "Qual é o problema de escrever except: (sem tipo) para tratar erros?",
      opcoes: ["Não é permitido pela linguagem", "Captura todos os erros, inclusive bugs e interrupções, e esconde problemas reais", "Só funciona dentro de funções", "Torna o programa mais lento"],
      correta: 1,
      explicacao: "Um except sem tipo engole tudo, até KeyboardInterrupt. Isso mascara bugs e dificulta o diagnóstico. Capture o tipo específico que você sabe tratar e deixe os demais subirem.",
    },
    {
      enunciado: "Em quais situações o bloco finally é executado?",
      opcoes: ["Só se ocorrer uma exceção", "Só se não ocorrer exceção", "Sempre: com ou sem exceção, mesmo se houver return no try", "Nunca, se houver return"],
      correta: 2,
      explicacao: "O finally é a garantia de limpeza: roda sempre ao sair do bloco try, com erro, sem erro ou com um return no meio. É onde se fecham recursos (ou, de forma mais simples, usa-se o with).",
    },
    {
      enunciado: "Qual a vantagem de usar with open(caminho) as arquivo: em vez de arquivo = open(caminho)?",
      opcoes: ["O arquivo é lido mais rápido", "O arquivo é fechado automaticamente ao sair do bloco, mesmo se ocorrer um erro", "O arquivo pode ser lido por vários programas ao mesmo tempo", "Dispensa informar o encoding"],
      correta: 1,
      explicacao: "O with usa um gerenciador de contexto que garante o fechamento do arquivo ao sair do bloco, mesmo diante de uma exceção. Sem ele, é preciso lembrar de chamar close() em todos os caminhos.",
    },
    {
      enunciado: "Para que serve if __name__ == \"__main__\": em um módulo?",
      opcoes: ["Para impedir que o módulo seja importado", "Para executar um trecho só quando o arquivo é rodado diretamente, e não quando importado", "Para declarar a função principal obrigatória", "Para instalar as dependências"],
      correta: 1,
      explicacao: "Quando o arquivo é executado diretamente, __name__ vale \"__main__\". Quando é importado, vale o nome do módulo. Assim o mesmo arquivo serve como biblioteca e como programa.",
    },
  ],
  desafio: {
    titulo: "Biblioteca de livros",
    enunciado: "Modele um pequeno sistema de biblioteca (biblioteca.py), com classes, exceções próprias e persistência em JSON. O foco é separar responsabilidades e tratar os erros do jeito certo.",
    requisitos: [
      "Crie uma dataclass Livro (título, autor e disponível) e uma classe Biblioteca que guarda os livros e oferece adicionar, emprestar e devolver.",
      "Crie exceções próprias: LivroInexistente e LivroIndisponivel, herdando de uma exceção base da biblioteca.",
      "Faça emprestar levantar a exceção adequada, e mostre no programa principal um try/except para cada caso, com uma mensagem clara.",
      "Salve e carregue o acervo em um arquivo JSON usando pathlib e with, com encoding utf-8, e trate o caso de o arquivo ainda não existir.",
      "Escreva uma segunda classe, por herança, como LivroDigital, com um campo extra e um método próprio, e use isinstance em algum ponto.",
    ],
    criterios: [
      "O programa roda com python biblioteca.py e mostra o fluxo completo.",
      "Nenhum except captura Exception de forma genérica nem usa except: sem tipo.",
      "Os arquivos são sempre abertos com with e com encoding.",
      "Ao converter um erro de arquivo em uma exceção da biblioteca, você usa raise ... from erro.",
      "Você consegue explicar a diferença entre atributo de instância e atributo de classe com um exemplo do seu código.",
    ],
    dica: "Comece pelas classes e pelas exceções, sem arquivo nenhum, e teste o fluxo na memória. Só depois acrescente a leitura e a gravação do JSON. Se usar uma dataclass, asdict facilita a conversão para JSON.",
  },
  referencias: [
    { titulo: "Documentação oficial: classes (pt-BR)", url: "https://docs.python.org/pt-br/3/tutorial/classes.html" },
    { titulo: "Documentação oficial: erros e exceções (pt-BR)", url: "https://docs.python.org/pt-br/3/tutorial/errors.html" },
    { titulo: "Documentação oficial: módulos (pt-BR)", url: "https://docs.python.org/pt-br/3/tutorial/modules.html" },
    { titulo: "Documentação oficial: dataclasses (em inglês)", url: "https://docs.python.org/3/library/dataclasses.html" },
  ],
};
