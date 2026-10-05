import type { Modulo } from "../tipos";

export const PY_MODULO_6: Modulo = {
  tipo: "modulo",
  slug: "testes-com-pytest",
  titulo: "Testes com pytest",
  resumo: "Testes unitários e de API em Python: asserts simples, fixtures, parametrização, arquivos temporários, variáveis de ambiente e dependências trocadas.",
  nivel: "Júnior",
  leitura: "45 min",
  objetivos: [
    "Escrever testes com funções e assert simples, e entender as mensagens de falha do pytest.",
    "Usar fixtures para preparar e limpar o que os testes precisam.",
    "Parametrizar casos com @pytest.mark.parametrize e verificar exceções com pytest.raises.",
    "Isolar o ambiente com tmp_path e monkeypatch.",
    "Testar uma API FastAPI trocando dependências, sem subir servidor.",
  ],
  preRequisitos: [
    "Ter feito o módulo \"Uma API com FastAPI e Pydantic\" e o de tipagem e qualidade de código.",
    "Saber criar um ambiente virtual e instalar pacotes com pip.",
  ],
  pontosChave: [
    "O pytest descobre testes sozinho: arquivos test_*.py e funções test_*, com assert comum.",
    "Fixtures entregam aos testes os objetos de que precisam e cuidam da limpeza.",
    "Parametrização transforma uma lista de casos em testes independentes, cada um com seu nome.",
    "Cada teste deve criar o próprio estado: evite dados compartilhados e dependência de ordem.",
    "Teste comportamento observável, e use dublês só onde não houver alternativa.",
  ],
  blocos: [
    { tipo: "p", texto: "O Python traz o módulo unittest na biblioteca padrão, baseado em classes e em métodos como assertEqual. Funciona, mas é verboso, e quase todo projeto novo usa o pytest: testes são funções comuns, as verificações usam o assert da própria linguagem, e a saída de uma falha mostra exatamente os valores comparados. Este módulo cobre o que você precisa para testar um serviço real, incluindo uma API FastAPI, e os exemplos foram executados com o pytest instalado por pip install pytest." },

    { tipo: "h", texto: "Primeiros testes" },
    { tipo: "p", texto: "Para o pytest, um teste é uma função cujo nome começa com test_, em um arquivo cujo nome começa com test_ (ou termina em _test). Dentro dela, você usa assert: se a expressão for falsa, o teste falha, e o pytest reescreve o assert para mostrar os valores envolvidos. Para verificar que um erro é lançado, use o gerenciador de contexto pytest.raises, que pode conferir também a mensagem." },
    { tipo: "p", texto: "O código testado calcula o total de um pedido. Repare que ele usa Decimal, e não float: para dinheiro, o ponto flutuante acumula erros de arredondamento (0.1 + 0.2 não é exatamente 0.3). O Decimal representa valores decimais com exatidão, e o arredondamento é explícito." },
    { tipo: "codigo", linguagem: "python", legenda: "descontos.py (código testado)", texto: `from dataclasses import dataclass
from decimal import ROUND_HALF_UP, Decimal


@dataclass(frozen=True)
class Item:
    nome: str
    preco: Decimal
    quantidade: int


def total_do_pedido(itens: list[Item], cupom: str | None = None) -> Decimal:
    if any(i.preco < 0 or i.quantidade <= 0 for i in itens):
        raise ValueError("preço ou quantidade inválidos")
    bruto = sum((i.preco * i.quantidade for i in itens), Decimal("0"))
    desconto = Decimal("0.10") if cupom == "KODA10" else Decimal("0")
    return (bruto * (1 - desconto)).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)` },
    { tipo: "codigo", linguagem: "python", legenda: "test_descontos.py (testes)", texto: `from decimal import Decimal

import pytest

from descontos import Item, total_do_pedido


@pytest.fixture
def itens() -> list[Item]:
    return [Item("caderno", Decimal("20.00"), 2), Item("caneta", Decimal("5.50"), 1)]


def test_soma_preco_vezes_quantidade(itens: list[Item]) -> None:
    assert total_do_pedido(itens) == Decimal("45.50")


def test_aplica_o_cupom(itens: list[Item]) -> None:
    assert total_do_pedido(itens, "KODA10") == Decimal("40.95")


def test_pedido_vazio_vale_zero() -> None:
    assert total_do_pedido([]) == Decimal("0.00")


@pytest.mark.parametrize(
    ("preco", "quantidade"),
    [(Decimal("-1"), 1), (Decimal("1"), 0), (Decimal("1"), -3)],
    ids=["preco-negativo", "quantidade-zero", "quantidade-negativa"],
)
def test_recusa_itens_invalidos(preco: Decimal, quantidade: int) -> None:
    with pytest.raises(ValueError, match="inválidos"):
        total_do_pedido([Item("x", preco, quantidade)])


def test_arredonda_para_cima_na_metade() -> None:
    assert total_do_pedido([Item("x", Decimal("0.05"), 1)], "KODA10") == Decimal("0.05")` },
    { tipo: "codigo", linguagem: "bash", legenda: "Rodando os testes", texto: `pytest            # roda tudo
pytest -v         # mostra cada teste
pytest -k cupom   # só os testes cujo nome contém "cupom"
pytest -x         # para no primeiro que falhar
pytest --lf       # repete só os que falharam na última vez` },
    { tipo: "p", texto: "Os testes mostram os recursos centrais. A fixture itens, marcada com @pytest.fixture, prepara os dados: qualquer teste que tenha um parâmetro com esse nome recebe o resultado, e o pytest cuida da ligação. Cada teste recebe uma lista nova, então um não interfere no outro. O @pytest.mark.parametrize executa o mesmo teste para três combinações de entrada, cada uma vira um teste separado, com o nome indicado em ids, e o pytest.raises confere o tipo e a mensagem do erro (match é uma expressão regular). O último teste mostra um caso de borda: 10% de desconto sobre 0,05 dá 0,045, e a regra de arredondamento (meio para cima) o leva a 0,05." },
    { tipo: "codigo", linguagem: "text", legenda: "Saída de pytest -v (os tempos variam)", texto: `test_descontos.py::test_soma_preco_vezes_quantidade PASSED               [ 14%]
test_descontos.py::test_aplica_o_cupom PASSED                            [ 28%]
test_descontos.py::test_pedido_vazio_vale_zero PASSED                    [ 42%]
test_descontos.py::test_recusa_itens_invalidos[preco-negativo] PASSED    [ 57%]
test_descontos.py::test_recusa_itens_invalidos[quantidade-zero] PASSED   [ 71%]
test_descontos.py::test_recusa_itens_invalidos[quantidade-negativa] PASSED [ 85%]
test_descontos.py::test_arredonda_para_cima_na_metade PASSED             [100%]` },
    { tipo: "dica", titulo: "Nomeie o comportamento", texto: "Prefira nomes como test_recusa_itens_invalidos a test_total_2. Quando uma falha aparecer no CI, o nome do teste é a primeira (e às vezes a única) coisa que você lê. Ele deve dizer o que o sistema deveria fazer." },

    { tipo: "h", texto: "Fixtures: preparar e limpar" },
    { tipo: "p", texto: "Fixtures são a forma do pytest de reaproveitar preparação. Elas podem devolver um valor (return) ou, com yield, entregar o valor, deixar o teste rodar e depois executar a limpeza (fechar uma conexão, apagar um arquivo, remover uma configuração). O escopo padrão é por teste, o que garante isolamento; escopos maiores (module, session) aceleram a suíte para recursos caros, ao preço de compartilhar estado, e devem ser usados com cuidado. Fixtures colocadas em um arquivo conftest.py ficam disponíveis a todos os testes da pasta, sem importar nada." },
    { tipo: "h3", texto: "Fixtures embutidas que você vai usar sempre" },
    { tipo: "lista", itens: [
      "tmp_path: uma pasta temporária, única para cada teste e apagada depois. Use no lugar de escrever arquivos em locais fixos.",
      "monkeypatch: altera variáveis de ambiente, atributos e funções só durante o teste, e desfaz tudo ao final.",
      "capsys: captura o que o programa imprime, para verificar a saída.",
      "caplog: captura mensagens de log, para verificar o que foi registrado.",
    ] },
    { tipo: "codigo", linguagem: "python", legenda: "test_arquivos.py (testes)", texto: `from pathlib import Path

import pytest


def contar_linhas(caminho: Path) -> int:
    return len(caminho.read_text(encoding="utf-8").splitlines())


def test_conta_linhas_com_arquivo_temporario(tmp_path: Path) -> None:
    arquivo = tmp_path / "dados.txt"
    arquivo.write_text("a\\nb\\nc\\n", encoding="utf-8")
    assert contar_linhas(arquivo) == 3


def test_le_variavel_de_ambiente(monkeypatch: pytest.MonkeyPatch) -> None:
    import os

    monkeypatch.setenv("MODO", "teste")
    assert os.environ["MODO"] == "teste"` },
    { tipo: "p", texto: "O primeiro teste cria o arquivo em uma pasta temporária e confere a contagem, sem deixar lixo no disco nem depender de um caminho do seu computador. O segundo muda uma variável de ambiente só durante o teste: sem o monkeypatch, a alteração vazaria para os testes seguintes, e o resultado de um passaria a depender do outro." },

    { tipo: "h", texto: "Testando uma API FastAPI" },
    { tipo: "p", texto: "No módulo anterior, a rota recebia o repositório por Depends. Isso rende agora: o teste troca a dependência por uma instância limpa e usa o TestClient, que executa a aplicação em processo, sem rede nem servidor. A fixture entrega o cliente já configurado e, depois do teste (depois do yield), remove a substituição." },
    { tipo: "codigo", linguagem: "python", legenda: "test_api.py (testes)", texto: `from collections.abc import Iterator

import pytest
from fastapi.testclient import TestClient

import api_app


@pytest.fixture
def cliente() -> Iterator[TestClient]:
    repositorio = api_app.Repositorio()  # uma única instância para o teste inteiro
    api_app.app.dependency_overrides[api_app.obter_repositorio] = lambda: repositorio
    yield TestClient(api_app.app)
    api_app.app.dependency_overrides.clear()


def test_lista_comeca_vazia(cliente: TestClient) -> None:
    assert cliente.get("/tarefas").json() == []


def test_cria_e_busca(cliente: TestClient) -> None:
    criada = cliente.post("/tarefas", json={"titulo": "Estudar pytest"})
    assert criada.status_code == 201
    assert cliente.get(f"/tarefas/{criada.json()['id']}").json()["titulo"] == "Estudar pytest"` },
    { tipo: "codigo", linguagem: "text", legenda: "Saída de pytest -q (o tempo varia)", texto: `...........                                                              [100%]
11 passed in 0.75s` },
    { tipo: "alerta", titulo: "Uma armadilha real nas dependências trocadas", texto: "Na primeira versão deste teste, a substituição criava um repositório novo a cada chamada: lambda: Repositorio(). O teste que criava uma tarefa e depois a buscava falhou com KeyError: 'titulo', porque cada requisição recebia um repositório vazio, sem a tarefa recém-criada. A função de substituição é chamada a cada requisição, então, para manter o estado entre as chamadas de um teste, crie a instância fora e devolva sempre a mesma, como na fixture acima." },

    { tipo: "h", texto: "Marcadores, testes pulados e dublês" },
    { tipo: "p", texto: "Nem todo teste precisa rodar sempre. Os marcadores (marks) permitem classificá-los: @pytest.mark.skip pula um teste com um motivo, @pytest.mark.skipif o pula sob uma condição (por exemplo, um recurso que só existe em outro sistema operacional) e @pytest.mark.xfail declara uma falha esperada, útil para registrar um bug conhecido sem deixar a suíte vermelha. Você também pode criar marcadores próprios (como slow ou integration) e rodar apenas um grupo com pytest -m \"not slow\", o que mantém o ciclo de desenvolvimento rápido enquanto o CI roda tudo." },
    { tipo: "codigo", linguagem: "python", legenda: "marcadores_e_dubles.py (trecho)", texto: `import sys
from unittest.mock import Mock

import pytest


@pytest.mark.skipif(sys.platform == "win32", reason="usa um recurso exclusivo de Unix")
def test_recurso_de_unix() -> None: ...


@pytest.mark.xfail(reason="bug conhecido: arredondamento de cupom em pedidos grandes")
def test_bug_registrado() -> None:
    assert 0.1 + 0.2 == 0.3


def test_envia_o_aviso_uma_vez() -> None:
    notificador = Mock()
    notificador.enviar.return_value = "ok"
    resultado = notificador.enviar("pedido pago")
    assert resultado == "ok"
    notificador.enviar.assert_called_once_with("pedido pago")` },
    { tipo: "p", texto: "O último teste usa um Mock da biblioteca padrão: um objeto que aceita qualquer chamada, devolve o que você configurou e registra como foi usado, permitindo verificar chamadas com assert_called_once_with. É a mesma ideia do vi.fn de outras linguagens. Vale o aviso de sempre: use dublês para o que não dá para observar de outro modo (um e-mail enviado, uma API de terceiros), e prefira fakes simples e verificação de resultado, que sobrevivem a refatorações. Para substituir uma função ou um atributo apenas durante um teste, o monkeypatch.setattr é, em geral, mais simples e mais seguro do que um patch global." },

    { tipo: "p", texto: "Um último hábito merece ser mencionado: organize os testes espelhando o código. Uma pasta tests com um arquivo test_x.py para cada módulo x torna fácil achar onde cada comportamento é verificado, e um arquivo conftest.py na raiz guarda as fixtures compartilhadas. Quando um teste falhar no CI, quem o lê (muitas vezes você, meses depois) deve conseguir descobrir sem esforço o que ele protege e por que quebrou, só pelo nome do arquivo, da função e da mensagem do assert." },

    { tipo: "h", texto: "Boas práticas para suítes duráveis" },
    { tipo: "numerada", itens: [
      "Um comportamento por teste, com nome em forma de frase, e o padrão preparar, agir, verificar.",
      "Testes independentes: cada um monta o próprio estado e funciona sozinho ou em qualquer ordem. Se possível, rode com ordem aleatória (plugin pytest-randomly) para descobrir dependências escondidas.",
      "Sem dependências externas: nada de rede, relógio real ou aleatoriedade solta. Injete ou substitua o que for imprevisível.",
      "Cubra os casos de borda e de erro, e não só o caminho feliz.",
      "Prefira fakes simples (um repositório em memória) a mocks complexos que repetem a implementação.",
      "Rode a suíte no CI a cada mudança, junto com o ruff e o mypy.",
      "Meça a cobertura com pytest-cov para achar trechos sem teste, sem transformá-la em meta numérica.",
    ] },
    { tipo: "p", texto: "Duas ferramentas completam o arsenal. O unittest.mock, da biblioteca padrão (e o pytest-mock, que o integra ao pytest), cria dublês para o que não dá para controlar de outro modo. E o Hypothesis gera automaticamente centenas de entradas para testar propriedades gerais (\"somar e depois subtrair o mesmo valor devolve o original\"), pegando casos de borda que você não imaginou. Nenhuma das duas é necessária para começar, mas vale conhecê-las quando o sistema crescer." },
  ],
  questoes: [
    {
      enunciado: "Como o pytest descobre quais funções são testes?",
      opcoes: ["Pelo decorador @test obrigatório", "Por funções com nome test_* em arquivos test_*.py (ou *_test.py)", "Por uma lista em um arquivo de configuração", "Por qualquer função que use assert"],
      correta: 1,
      explicacao: "A descoberta é por convenção de nomes: arquivos test_*.py e funções (ou métodos) test_*. Nenhum decorador é necessário.",
    },
    {
      enunciado: "Qual a vantagem do assert simples do pytest sobre os métodos do unittest?",
      opcoes: ["Ele é mais rápido", "Ele funciona sem Python", "Ele ignora falhas", "O pytest reescreve o assert e mostra os valores comparados quando falha, sem precisar de métodos como assertEqual"],
      correta: 3,
      explicacao: "O pytest introspecta a expressão do assert e mostra os valores à esquerda e à direita na falha, o que dispensa a família de métodos assertX do unittest.",
    },
    {
      enunciado: "Para que serve @pytest.mark.parametrize?",
      opcoes: ["Para rodar o mesmo teste com vários conjuntos de entradas, gerando um teste independente para cada um", "Para pular testes", "Para medir a cobertura", "Para rodar testes em outra máquina"],
      correta: 0,
      explicacao: "A parametrização expande uma função de teste em vários casos, cada um reportado separadamente e identificado pelos valores ou por ids.",
    },
    {
      enunciado: "O que a fixture tmp_path oferece?",
      opcoes: ["Uma pasta temporária única para o teste, apagada depois", "Uma conexão com o banco de dados", "O caminho do Python instalado", "A lista de arquivos do projeto"],
      correta: 0,
      explicacao: "O tmp_path entrega uma pasta temporária exclusiva do teste, o que evita escrever em locais fixos e deixar lixo para os testes seguintes.",
    },
    {
      enunciado: "Por que usar monkeypatch.setenv em vez de alterar os.environ diretamente em um teste?",
      opcoes: ["Porque os.environ é somente leitura", "Porque o monkeypatch desfaz a alteração ao fim do teste, sem vazar para os outros", "Porque é mais rápido", "Porque funciona só no Windows"],
      correta: 1,
      explicacao: "Alterações diretas persistem e podem fazer testes posteriores se comportarem de forma diferente. O monkeypatch restaura o estado original automaticamente.",
    },
    {
      enunciado: "Em um teste, a dependência da API foi substituída por lambda: Repositorio(). O que acontece quando o teste cria uma tarefa e depois a busca?",
      opcoes: ["Funciona, porque o repositório é compartilhado", "O FastAPI avisa com um erro de sintaxe", "Falha, porque cada requisição recebe um repositório novo e vazio", "O repositório é criado só uma vez"],
      correta: 2,
      explicacao: "A função de substituição é chamada a cada requisição. Para preservar o estado entre chamadas do mesmo teste, a instância deve ser criada fora e a mesma devolvida sempre.",
    },
    {
      enunciado: "Por que valores monetários nos testes (e no código) usam Decimal em vez de float?",
      opcoes: ["Porque float não existe em Python", "Porque float acumula erros de representação decimal, e o Decimal é exato com arredondamento explícito", "Porque Decimal é mais rápido", "Porque o pytest só aceita Decimal"],
      correta: 1,
      explicacao: "Números de ponto flutuante binário não representam exatamente valores como 0,1. Para dinheiro, o Decimal (ou inteiros em centavos) evita erros e permite definir a regra de arredondamento.",
    },
  ],
  desafio: {
    titulo: "Cobertura de uma biblioteca de estoque",
    enunciado: "Pegue a biblioteca de estoque do desafio de tipagem (ou crie uma simples) e escreva uma suíte de testes com pytest, sem alterar o comportamento do código, e depois acrescente uma funcionalidade guiada pelos testes.",
    requisitos: [
      "Escreva testes para adicionar, remover, buscar e calcular o valor total, incluindo casos de borda (estoque vazio, quantidade zero, remoção de mais do que existe).",
      "Use uma fixture para o estoque preenchido e @pytest.mark.parametrize para as entradas inválidas, com ids legíveis.",
      "Teste a persistência em arquivo JSON usando tmp_path, sem escrever em locais fixos.",
      "Teste uma função que lê uma variável de ambiente usando monkeypatch.",
      "Acrescente a funcionalidade \"alerta de estoque baixo\" seguindo o ciclo: escreva o teste que falha, implemente e veja o teste passar.",
    ],
    criterios: [
      "Todos os testes passam sozinhos e em qualquer ordem (experimente rodá-los separadamente com -k).",
      "Nenhum teste depende de arquivos fixos, da rede ou da data atual.",
      "Cada teste tem um nome que descreve o comportamento e verifica uma ideia.",
      "A cobertura (pytest --cov) mostra poucos trechos sem teste, e você sabe explicar os que sobraram.",
      "O código novo nasceu de um teste que falhava, e você consegue mostrar isso no histórico dos commits.",
    ],
    dica: "Rode pytest -x --lf durante o desenvolvimento: ele para no primeiro erro e repete só o que falhou, o que torna o ciclo de escrever, falhar e corrigir muito mais rápido.",
  },
  referencias: [
    { titulo: "pytest: documentação (em inglês)", url: "https://docs.pytest.org/en/stable/" },
    { titulo: "pytest: fixtures (em inglês)", url: "https://docs.pytest.org/en/stable/how-to/fixtures.html" },
    { titulo: "FastAPI: testes (em inglês)", url: "https://fastapi.tiangolo.com/tutorial/testing/" },
  ],
};
