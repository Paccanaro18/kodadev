import type { Modulo } from "../tipos";

export const PY_MODULO_5: Modulo = {
  tipo: "modulo",
  slug: "api-com-fastapi-e-pydantic",
  titulo: "Uma API com FastAPI e Pydantic",
  resumo: "Modelos Pydantic, rotas tipadas, validação automática, respostas filtradas, injeção de dependências e testes sem subir servidor.",
  nivel: "Júnior",
  leitura: "50 min",
  objetivos: [
    "Criar modelos Pydantic com validação, valores padrão e validadores personalizados.",
    "Declarar rotas FastAPI com parâmetros de caminho, de query e de corpo, e entender os erros 422.",
    "Usar response_model para controlar exatamente o que a API devolve.",
    "Usar injeção de dependências (Depends) para repositórios e configurações, e trocá-las nos testes.",
    "Testar a API com TestClient e ler a documentação gerada automaticamente.",
  ],
  preRequisitos: [
    "Ter feito o módulo de tipagem e qualidade de código, ou conhecer type hints e dataclasses.",
    "Conhecer o básico de HTTP: métodos, status e JSON.",
    "Ter Python 3.10 ou mais novo e saber criar um ambiente virtual.",
  ],
  pontosChave: [
    "O FastAPI usa os type hints das funções para validar, converter e documentar as entradas.",
    "O Pydantic valida e converte os dados na borda: se a função é chamada, os dados já estão corretos.",
    "response_model filtra a saída: campos que não estão no modelo (como senhas) nunca vazam.",
    "Depends injeta dependências, o que torna fácil trocar o banco por um falso nos testes.",
    "Funções async def não podem bloquear: trabalho bloqueante deve ir em def comum ou em uma thread.",
  ],
  blocos: [
    { tipo: "p", texto: "Em Python, há dois grandes caminhos para construir APIs web: frameworks mais tradicionais, como Flask e Django, e o FastAPI, que se tornou muito popular em projetos novos. A diferença central é que o FastAPI trata os tipos como parte do contrato: você descreve as entradas e saídas com type hints, e ele valida, converte, documenta e testa a partir deles. Quem leu o módulo anterior, sobre tipagem, vê aqui o motivo de investir nas anotações." },
    { tipo: "p", texto: "O FastAPI é construído sobre duas bibliotecas: o Starlette, que cuida da parte web (rotas, requisições, respostas), e o Pydantic, que cuida da validação de dados. Por isso, vamos começar pelo Pydantic e depois juntar os dois. Os exemplos foram executados com FastAPI 0.142 e Pydantic 2.13, e as APIs do Pydantic 2 (model_validate, model_dump) diferem das da versão 1, então confira a versão no seu projeto." },

    { tipo: "h", texto: "Pydantic: modelos que validam" },
    { tipo: "p", texto: "Um modelo Pydantic é uma classe que herda de BaseModel e declara os campos com tipos. Ao criar uma instância, o Pydantic valida os dados e converte o que for possível: o texto \"1994-05-20\" vira uma data, e \"3\" vira o inteiro 3 se o campo for int. Se algo estiver errado, ele lança ValidationError com a lista completa dos problemas, e não só o primeiro. Para regras além do tipo, use Field (tamanhos, intervalos, padrões) e validadores personalizados." },
    { tipo: "codigo", linguagem: "python", legenda: "modelos.py", texto: `from datetime import date

from pydantic import BaseModel, Field, ValidationError, field_validator


class Usuario(BaseModel):
    nome: str = Field(min_length=2)
    email: str
    nascimento: date
    tags: list[str] = []

    @field_validator("email")
    @classmethod
    def email_simples(cls, valor: str) -> str:
        if "@" not in valor:
            raise ValueError("e-mail inválido")
        return valor.lower()


ok = Usuario.model_validate({"nome": "Ana", "email": "ANA@Exemplo.com", "nascimento": "1994-05-20"})
print(ok)
print(ok.model_dump())
print(ok.model_dump_json(exclude={"tags"}))
print(Usuario.model_validate_json('{"nome": "Bia", "email": "b@x.com", "nascimento": "2000-01-31", "tags": ["a"]}').tags)

for ruim in [{"nome": "A", "email": "sem-arroba", "nascimento": "ontem"}, {"nome": "Caio"}]:
    try:
        Usuario.model_validate(ruim)
    except ValidationError as erro:
        print(erro.error_count(), "erros:", [(e["loc"][0], e["type"]) for e in erro.errors()])` },
    { tipo: "codigo", linguagem: "text", legenda: "Saída", texto: `nome='Ana' email='ana@exemplo.com' nascimento=datetime.date(1994, 5, 20) tags=[]
{'nome': 'Ana', 'email': 'ana@exemplo.com', 'nascimento': datetime.date(1994, 5, 20), 'tags': []}
{"nome":"Ana","email":"ana@exemplo.com","nascimento":"1994-05-20"}
['a']
3 erros: [('nome', 'string_too_short'), ('email', 'value_error'), ('nascimento', 'date_from_datetime_parsing')]
2 erros: [('email', 'missing'), ('nascimento', 'missing')]` },
    { tipo: "p", texto: "Veja o que aconteceu. O texto da data virou um objeto date de verdade, e o e-mail passou pelo validador, que o converteu para minúsculas. O model_dump devolve um dicionário, e o model_dump_json, um JSON, com a opção de excluir campos. Para ler um JSON direto, há o model_validate_json. E, na validação do primeiro dado ruim, os três erros vieram juntos, cada um com o campo (loc) e um código estável (type) que o seu código pode usar. No segundo, dois campos obrigatórios faltavam (missing)." },
    { tipo: "tabela", legenda: "O essencial da API do Pydantic 2", cabecalho: ["Necessidade", "Como fazer"], linhas: [
      ["Validar um dicionário", "Modelo.model_validate(dados)"],
      ["Validar um JSON em texto", "Modelo.model_validate_json(texto)"],
      ["Converter para dicionário", "objeto.model_dump()"],
      ["Converter para JSON", "objeto.model_dump_json()"],
      ["Restrições de campo", "Field(min_length=3, ge=0, pattern=...)"],
      ["Regra personalizada de um campo", "@field_validator(\"campo\")"],
      ["Opções do modelo (por exemplo, aparar espaços)", "model_config = ConfigDict(str_strip_whitespace=True)"],
    ] },

    { tipo: "h", texto: "A primeira API" },
    { tipo: "p", texto: "Instale com pip install fastapi uvicorn (o uvicorn é o servidor que executa a aplicação) e, para os testes, httpx. Uma rota é uma função decorada com o método HTTP e o caminho. O FastAPI olha os parâmetros da função e decide, pelo tipo e pela posição, de onde vem cada valor: parâmetros que aparecem no caminho vêm do caminho, parâmetros simples vêm da query string, e parâmetros do tipo de um modelo Pydantic vêm do corpo JSON." },
    { tipo: "codigo", linguagem: "python", legenda: "api.py", texto: `from typing import Annotated, Literal

from fastapi import Depends, FastAPI, HTTPException, Query
from fastapi.testclient import TestClient
from pydantic import BaseModel, ConfigDict, Field


class NovaTarefa(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    titulo: str = Field(min_length=3, max_length=80)
    prioridade: Literal["baixa", "media", "alta"] = "media"


class Tarefa(NovaTarefa):
    id: int
    concluida: bool = False


class Repositorio:
    def __init__(self) -> None:
        self.tarefas: dict[int, Tarefa] = {}
        self.proximo_id = 1

    def criar(self, dados: NovaTarefa) -> Tarefa:
        tarefa = Tarefa(id=self.proximo_id, **dados.model_dump())
        self.tarefas[tarefa.id] = tarefa
        self.proximo_id += 1
        return tarefa


repositorio = Repositorio()


def obter_repositorio() -> Repositorio:
    return repositorio


app = FastAPI(title="Tarefas")


@app.post("/tarefas", status_code=201, response_model=Tarefa)
def criar_tarefa(dados: NovaTarefa, repo: Annotated[Repositorio, Depends(obter_repositorio)]) -> Tarefa:
    return repo.criar(dados)


@app.get("/tarefas", response_model=list[Tarefa])
def listar_tarefas(
    repo: Annotated[Repositorio, Depends(obter_repositorio)],
    prioridade: Literal["baixa", "media", "alta"] | None = None,
    limite: Annotated[int, Query(ge=1, le=50)] = 10,
) -> list[Tarefa]:
    itens = [t for t in repo.tarefas.values() if prioridade is None or t.prioridade == prioridade]
    return itens[:limite]


@app.get("/tarefas/{tarefa_id}", response_model=Tarefa)
def buscar_tarefa(tarefa_id: int, repo: Annotated[Repositorio, Depends(obter_repositorio)]) -> Tarefa:
    tarefa = repo.tarefas.get(tarefa_id)
    if tarefa is None:
        raise HTTPException(status_code=404, detail="tarefa não encontrada")
    return tarefa


cliente = TestClient(app)

r = cliente.post("/tarefas", json={"titulo": "  Estudar FastAPI"})
print(r.status_code, r.json())
r = cliente.post("/tarefas", json={"titulo": "Escrever testes", "prioridade": "alta"})
print(r.status_code, r.json())
r = cliente.post("/tarefas", json={"titulo": "ab", "prioridade": "urgente"})
print(r.status_code, [(e["loc"][-1], e["msg"]) for e in r.json()["detail"]])
print(cliente.get("/tarefas", params={"prioridade": "alta"}).json())
print(cliente.get("/tarefas", params={"limite": 0}).status_code)
print(cliente.get("/tarefas/1").json()["titulo"])
r = cliente.get("/tarefas/99")
print(r.status_code, r.json())
r = cliente.get("/tarefas/abc")
print(r.status_code, r.json()["detail"][0]["type"])
print(sorted(app.openapi()["paths"]))` },
    { tipo: "codigo", linguagem: "text", legenda: "Saída", texto: `201 {'titulo': 'Estudar FastAPI', 'prioridade': 'media', 'id': 1, 'concluida': False}
201 {'titulo': 'Escrever testes', 'prioridade': 'alta', 'id': 2, 'concluida': False}
422 [('titulo', 'String should have at least 3 characters'), ('prioridade', "Input should be 'baixa', 'media' or 'alta'")]
[{'titulo': 'Escrever testes', 'prioridade': 'alta', 'id': 2, 'concluida': False}]
422
Estudar FastAPI
404 {'detail': 'tarefa não encontrada'}
422 int_parsing
['/tarefas', '/tarefas/{tarefa_id}']` },
    { tipo: "p", texto: "O exemplo testa a própria API com o TestClient, que simula as requisições sem subir servidor nem rede, e o resultado mostra bastante coisa. A primeira tarefa foi criada com status 201, com o título já sem os espaços (graças ao str_strip_whitespace) e a prioridade padrão. Os dados inválidos (título curto, prioridade fora da lista) produziram 422 com a lista de erros, sem que você escrevesse uma linha de validação na rota. O parâmetro limite=0 violou o ge=1 do Query, e \"abc\" no lugar do id inteiro gerou o erro int_parsing. A tarefa 99 não existe, e a HTTPException virou 404 com a mensagem." },
    { tipo: "codigo", linguagem: "bash", legenda: "Executando e explorando a API", texto: `uvicorn api:app --reload
# http://127.0.0.1:8000/docs         documentação interativa (Swagger UI)
# http://127.0.0.1:8000/openapi.json  descrição da API em formato OpenAPI` },
    { tipo: "p", texto: "De graça, o FastAPI gera uma documentação interativa em /docs, onde cada rota pode ser testada pelo navegador, e um arquivo OpenAPI em /openapi.json, que outras ferramentas usam para gerar clientes e testes. Essa documentação é sempre fiel ao código, porque nasce dele. (Nota: o --reload é só para desenvolvimento; ele reinicia o servidor a cada mudança de arquivo.)" },
    { tipo: "alerta", titulo: "Em produção, a documentação é uma superfície de ataque", texto: "A página /docs lista todas as rotas e os formatos aceitos, o que ajuda quem quer atacar a API. Em um serviço exposto à internet, desative-a ou proteja-a com autenticação, usando os parâmetros docs_url=None e openapi_url=None ao criar o FastAPI(...)." },

    { tipo: "h", texto: "response_model: controlando o que sai" },
    { tipo: "p", texto: "O parâmetro response_model diz ao FastAPI qual é o formato da resposta, e a resposta é filtrada e validada por ele. Isso é, na prática, uma medida de segurança: se o seu objeto interno tem campos que não devem sair (a senha criptografada, uma observação interna), basta que eles não existam no modelo de resposta, e nunca vazarão por descuido. O padrão recomendado é ter modelos separados para a entrada, a saída e o armazenamento." },
    { tipo: "codigo", linguagem: "python", legenda: "modelos_separados.py (trecho)", texto: `class UsuarioNovo(BaseModel):
    email: str
    senha: str = Field(min_length=8)


class UsuarioPublico(BaseModel):
    id: int
    email: str          # sem a senha


@app.post("/usuarios", response_model=UsuarioPublico, status_code=201)
def criar_usuario(dados: UsuarioNovo) -> Usuario:
    # Usuario é o objeto interno, com senha_hash. O response_model remove o que não está em UsuarioPublico.
    return servico.criar(dados)` },

    { tipo: "h", texto: "Injeção de dependências" },
    { tipo: "p", texto: "No exemplo da API, a rota não cria o repositório: ela o recebe por meio de Depends(obter_repositorio). O FastAPI chama a função de dependência a cada requisição e entrega o resultado à rota. Isso traz três ganhos. As rotas ficam focadas em HTTP, e a criação de recursos (conexão de banco, configurações, usuário autenticado) fica em um lugar só. As dependências podem depender de outras, formando uma cadeia. E, nos testes, você troca qualquer dependência por uma versão falsa com app.dependency_overrides, sem tocar no código das rotas." },
    { tipo: "codigo", linguagem: "python", legenda: "teste_com_dependencia_falsa.py (trecho)", texto: `def repositorio_vazio() -> Repositorio:
    return Repositorio()


app.dependency_overrides[obter_repositorio] = repositorio_vazio
cliente = TestClient(app)
assert cliente.get("/tarefas").json() == []` },
    { tipo: "p", texto: "A mesma ideia serve para autenticação: uma dependência lê o cabeçalho Authorization, valida o token e devolve o usuário, ou lança HTTPException 401. Qualquer rota que declare essa dependência fica protegida, e uma que não declare fica pública. Isso deixa clara, na assinatura de cada rota, quais exigem login." },

    { tipo: "h", texto: "async def ou def?" },
    { tipo: "p", texto: "O FastAPI aceita rotas declaradas com def e com async def, e a escolha importa. Funções async def rodam no laço de eventos principal, junto com todas as outras requisições: se uma delas fizer algo bloqueante (uma consulta com uma biblioteca síncrona, um time.sleep, a leitura de um arquivo grande), todo o servidor para de responder enquanto ela espera. Funções def comuns são executadas em um conjunto de threads, e por isso podem bloquear sem travar as demais. A regra prática: use async def somente se tudo o que a rota chama for assíncrono (e usar await); caso contrário, use def." },

    { tipo: "h", texto: "Erros, configuração e o caminho para produção" },
    { tipo: "p", texto: "Os erros de validação (422) são gerados pelo FastAPI com um formato próprio, uma lista de objetos com o caminho do campo (loc), uma mensagem e um tipo. Para os demais erros previstos, lance HTTPException com o status e a mensagem adequados, como no 404 do exemplo. Para os imprevistos, o FastAPI devolve 500 sem expor a pilha de execução, o que é o comportamento certo, mas você deve registrar o erro no log do servidor para poder investigá-lo depois. Se quiser um formato único de erro para toda a API, registre manipuladores de exceção com @app.exception_handler." },
    { tipo: "p", texto: "A configuração (URL do banco, chaves, modo de execução) deve vir do ambiente, e não do código. O pacote pydantic-settings oferece uma classe BaseSettings que lê as variáveis de ambiente, valida os tipos e falha na partida se algo estiver errado, a mesma ideia de falhar cedo vista na validação de configuração em outras linguagens. Combine isso com uma dependência que entrega a configuração às rotas, e a troca de ambiente (desenvolvimento, teste, produção) deixa de exigir mudanças de código." },
    { tipo: "p", texto: "Para colocar em produção, a regra é rodar o uvicorn (ou o gunicorn com workers do uvicorn) sem a opção de recarga, atrás de um proxy reverso que cuida de TLS, limites de tamanho e de taxa. O número de processos depende do número de núcleos, e cada processo tem a sua própria memória: um dicionário em memória, como o repositório do exemplo, não é compartilhado entre eles, e é por isso que dados reais vão para um banco, assunto de um módulo seguinte desta trilha." },

    { tipo: "h", texto: "Organização e boas práticas" },
    { tipo: "lista", itens: [
      "Separe em módulos: routers (rotas), schemas (modelos Pydantic), services (regras) e repositories (dados). Use APIRouter para agrupar rotas por assunto.",
      "Use modelos distintos para criação, atualização, saída e armazenamento, em vez de um modelo único para tudo.",
      "Imponha limites em todas as entradas (tamanho de textos, de listas, intervalos de números), como fez o Field e o Query no exemplo.",
      "Devolva os status corretos (201 para criação, 204 sem corpo, 404, 409 para conflito) e erros estruturados.",
      "Configure o CORS com origens específicas, nunca com \"*\" em APIs que usam cookies ou credenciais.",
      "Leia a configuração de variáveis de ambiente com validação na partida (por exemplo, com pydantic-settings), e não grave segredos no código.",
      "Escreva testes com TestClient para cada rota, cobrindo o sucesso e cada tipo de erro.",
    ] },
  ],
  questoes: [
    {
      enunciado: "De onde o FastAPI tira as informações para validar e documentar uma rota?",
      opcoes: ["De arquivos de configuração YAML", "De comentários no código", "De um banco de dados", "Dos type hints e dos modelos Pydantic declarados na função"],
      correta: 3,
      explicacao: "O FastAPI lê as anotações de tipo dos parâmetros e dos modelos para decidir de onde vem cada dado, validá-lo, converter os tipos e gerar a documentação OpenAPI.",
    },
    {
      enunciado: "Uma requisição POST com corpo inválido chega a uma rota que recebe um modelo Pydantic. O que o FastAPI responde?",
      opcoes: ["500, porque o código falhou", "422 com a lista dos erros de validação, sem executar a rota", "200 com um aviso", "404"],
      correta: 1,
      explicacao: "A validação acontece antes de a função da rota ser chamada. Se falhar, o FastAPI devolve 422 (Unprocessable Content) com a descrição de cada erro, e a rota nem executa.",
    },
    {
      enunciado: "Para que serve o response_model?",
      opcoes: ["Para definir e filtrar o formato da resposta, evitando que campos internos, como a senha, vazem", "Para acelerar o servidor", "Para validar o corpo da requisição", "Para criar o banco de dados"],
      correta: 0,
      explicacao: "A resposta é filtrada pelo modelo declarado: campos que não estão nele não são enviados. Isso protege contra o vazamento acidental de dados internos.",
    },
    {
      enunciado: "Qual a principal vantagem de Depends nos testes?",
      opcoes: ["Os testes passam a rodar em paralelo", "Os testes não precisam de asserções", "É possível substituir dependências (como o repositório de dados) por versões falsas com dependency_overrides, sem alterar as rotas", "Elimina a necessidade de testes"],
      correta: 2,
      explicacao: "Como a rota recebe o repositório de fora, os testes podem entregar outro, em memória ou falso, apenas registrando a substituição em app.dependency_overrides.",
    },
    {
      enunciado: "Uma rota async def chama uma biblioteca síncrona que demora 2 segundos. Qual o efeito sobre o servidor?",
      opcoes: ["Nenhum, o FastAPI sempre cria uma thread para ela", "Enquanto ela espera, o laço de eventos fica bloqueado e as outras requisições não são atendidas", "O Python lança um erro de sintaxe", "A rota passa a responder mais rápido"],
      correta: 1,
      explicacao: "Rotas async def rodam no laço de eventos; uma chamada bloqueante o trava. Use def comum para código bloqueante (o FastAPI o executa em uma thread) ou uma biblioteca assíncrona com await.",
    },
    {
      enunciado: "Qual o equivalente, no Pydantic 2, de converter um objeto em dicionário?",
      opcoes: ["objeto.dict_all()", "objeto.to_json()", "dict(objeto.validate())", "objeto.model_dump()"],
      correta: 3,
      explicacao: "No Pydantic 2, model_dump devolve um dicionário e model_dump_json devolve uma string JSON. Os antigos dict() e json() da versão 1 foram substituídos.",
    },
    {
      enunciado: "Por que desativar /docs em uma API de produção exposta à internet?",
      opcoes: ["Porque a documentação deixa a API lenta", "Porque ela lista todas as rotas e formatos, ajudando quem quer atacar a API", "Porque o FastAPI não funciona com documentação", "Porque o Swagger é pago"],
      correta: 1,
      explicacao: "A documentação interativa revela a superfície da API. Em produção, desative-a (docs_url=None, openapi_url=None) ou proteja-a com autenticação.",
    },
  ],
  desafio: {
    titulo: "API de biblioteca com testes",
    enunciado: "Construa uma API FastAPI para uma pequena biblioteca (livros e empréstimos), com repositório em memória, validações Pydantic e testes com TestClient.",
    requisitos: [
      "Crie os modelos LivroNovo, Livro e LivroResumo, com validações (título de 1 a 120 caracteres, ano entre 1400 e o ano atual, ISBN com 10 ou 13 dígitos) e use response_model para devolver o formato certo.",
      "Implemente POST /livros, GET /livros (com filtros opcionais de autor e paginação por limite e deslocamento), GET /livros/{id}, PUT /livros/{id} e DELETE /livros/{id} (204).",
      "Impeça ISBN duplicado com 409 e livro inexistente com 404, usando HTTPException.",
      "Use Depends para o repositório e uma segunda dependência que exija o cabeçalho X-Chave para as rotas de escrita (401 se faltar).",
      "Escreva ao menos 10 testes com TestClient, trocando o repositório por um vazio via dependency_overrides.",
    ],
    criterios: [
      "Nenhuma rota contém regras de validação repetidas: elas estão nos modelos.",
      "Os modelos de entrada e de saída são diferentes, e o de saída não expõe campos internos.",
      "mypy --strict e ruff passam sem avisos no projeto.",
      "Os testes cobrem sucesso, validação (422), conflito (409), inexistente (404) e falta de autenticação (401).",
      "A documentação em /docs descreve todas as rotas e você consegue explicar de onde ela vem.",
    ],
    dica: "Comece pelos modelos e pelos testes dos modelos (sem FastAPI). Depois ligue as rotas. Quando uma rota falhar, olhe primeiro o JSON de erro do 422: ele diz exatamente qual campo e qual regra foram violados.",
  },
  referencias: [
    { titulo: "FastAPI: tutorial (em inglês)", url: "https://fastapi.tiangolo.com/tutorial/" },
    { titulo: "Pydantic: documentação (em inglês)", url: "https://docs.pydantic.dev/latest/" },
    { titulo: "OWASP: cheat sheet de segurança de APIs REST (em inglês)", url: "https://cheatsheetseries.owasp.org/cheatsheets/REST_Security_Cheat_Sheet.html" },
  ],
};
