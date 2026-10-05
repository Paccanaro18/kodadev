import type { Modulo } from "../tipos";

export const PY_MODULO_7: Modulo = {
  tipo: "modulo",
  slug: "banco-de-dados-com-sqlalchemy",
  titulo: "Banco de dados com SQLAlchemy e Alembic",
  resumo: "Modelos, consultas, relacionamentos, transações, o problema das N+1 consultas e migrações: como falar com um banco relacional a partir do Python.",
  nivel: "Júnior",
  leitura: "55 min",
  objetivos: [
    "Mapear tabelas e relacionamentos para classes Python com o estilo moderno do SQLAlchemy 2.",
    "Escrever consultas com select, filtros, ordenação, junção e agregação.",
    "Controlar transações: commit, rollback e a diferença entre flush e commit.",
    "Reconhecer e corrigir o problema das N+1 consultas escolhendo a estratégia de carregamento.",
    "Evoluir o esquema do banco com migrações do Alembic, sem apagar dados.",
  ],
  preRequisitos: [
    "Ter feito os módulos sobre FastAPI e Pydantic e sobre tipagem em Python.",
    "Conhecer o básico de SQL: SELECT, INSERT, UPDATE, DELETE e chaves estrangeiras.",
  ],
  pontosChave: [
    "O ORM mapeia linhas para objetos, mas o banco continua sendo relacional: pense nas consultas que serão geradas.",
    "A Session é uma unidade de trabalho: nada vai ao banco de forma definitiva até o commit.",
    "Uma transação garante tudo ou nada: se algo falha no meio, o rollback desfaz o que foi feito.",
    "Acessar uma relação dentro de um laço pode gerar uma consulta por item (N+1): carregue com antecedência.",
    "O esquema de produção só muda por migrações versionadas, nunca por create_all.",
  ],
  blocos: [
    { tipo: "p", texto: "Quase toda aplicação real guarda dados em um banco relacional. Em Python, o SQLAlchemy é a biblioteca de referência para isso: ela oferece uma camada de mapeamento objeto-relacional (ORM), que transforma linhas de tabelas em objetos, e uma camada mais baixa, que gera SQL por você. Este módulo usa o SQLAlchemy 2 (os exemplos foram executados com a versão 2.1 e com o Alembic 1.20), no estilo moderno, com tipos e consultas por select. Para rodar sem instalar um servidor, os exemplos usam o SQLite em memória, mas tudo se aplica ao PostgreSQL, que é o que você usaria em produção." },
    { tipo: "alerta", titulo: "SQLite é para aprender, e não para tudo", texto: "O SQLite em memória é ótimo para exemplos e testes rápidos, mas se comporta de forma diferente de um banco de servidor em pontos importantes (tipos mais flexíveis, concorrência limitada, menos recursos de SQL). Para testar de verdade o que vai a produção, rode os testes de integração contra o mesmo tipo de banco que a produção usa, como um PostgreSQL em contêiner." },

    { tipo: "h", texto: "Por que um ORM, e o que ele não resolve" },
    { tipo: "p", texto: "Escrever SQL à mão para cada operação é repetitivo e propenso a erros de digitação, e converter linhas em objetos é trabalho que todo programa faz. O ORM cuida disso: você declara classes, e a biblioteca gera os INSERT, SELECT e UPDATE, cuida de parâmetros (o que evita a injeção de SQL) e acompanha as mudanças nos objetos. Em troca, existe uma abstração que pode esconder o custo: uma linha de Python pode gerar uma consulta cara. A regra de ouro é continuar pensando em termos de banco de dados (índices, junções, quantidade de consultas), usando o ORM como ferramenta, e não como substituto desse conhecimento." },

    { tipo: "h", texto: "Modelos e relacionamentos" },
    { tipo: "p", texto: "Um modelo é uma classe que herda de uma Base declarativa. Cada atributo anotado com Mapped[tipo] vira uma coluna, e o tipo Python define o tipo SQL (int vira inteiro, str vira texto, date | None vira uma coluna que aceita nulo). Com mapped_column, você acrescenta detalhes: chave primária, tamanho, unicidade, chave estrangeira. Os relacionamentos usam relationship, que permite navegar de um objeto ao relacionado como se fosse um atributo comum: autor.livros e livro.autor." },
    { tipo: "codigo", linguagem: "python", legenda: "modelos.py", texto: `from datetime import date

from sqlalchemy import ForeignKey, String, create_engine, func, select
from sqlalchemy.orm import DeclarativeBase, Mapped, Session, mapped_column, relationship


class Base(DeclarativeBase):
    pass


class Autor(Base):
    __tablename__ = "autores"

    id: Mapped[int] = mapped_column(primary_key=True)
    nome: Mapped[str] = mapped_column(String(80), unique=True)
    livros: Mapped[list["Livro"]] = relationship(back_populates="autor", cascade="all, delete-orphan")


class Livro(Base):
    __tablename__ = "livros"

    id: Mapped[int] = mapped_column(primary_key=True)
    titulo: Mapped[str] = mapped_column(String(120))
    publicado_em: Mapped[date | None]
    autor_id: Mapped[int] = mapped_column(ForeignKey("autores.id"))
    autor: Mapped[Autor] = relationship(back_populates="livros")


motor = create_engine("sqlite:///:memory:")
Base.metadata.create_all(motor)

with Session(motor) as sessao:
    machado = Autor(nome="Machado de Assis")
    machado.livros.append(Livro(titulo="Dom Casmurro", publicado_em=date(1899, 1, 1)))
    machado.livros.append(Livro(titulo="Quincas Borba", publicado_em=date(1891, 1, 1)))
    graciliano = Autor(nome="Graciliano Ramos", livros=[Livro(titulo="Vidas Secas", publicado_em=date(1938, 1, 1))])
    sessao.add_all([machado, graciliano])
    sessao.commit()

with Session(motor) as sessao:
    consulta = select(Livro).where(Livro.publicado_em < date(1900, 1, 1)).order_by(Livro.titulo)
    for livro in sessao.scalars(consulta):
        print(livro.titulo, "-", livro.autor.nome)

    contagem = select(Autor.nome, func.count(Livro.id)).join(Livro).group_by(Autor.nome).order_by(Autor.nome)
    print(sessao.execute(contagem).all())

    vidas = sessao.scalars(select(Livro).where(Livro.titulo == "Vidas Secas")).one()
    vidas.titulo = "Vidas Secas (edição revista)"
    sessao.commit()
    print(sessao.get(Livro, vidas.id).titulo)

    sessao.delete(sessao.scalars(select(Autor).where(Autor.nome == "Graciliano Ramos")).one())
    sessao.commit()
    print(sessao.scalar(select(func.count()).select_from(Livro)))` },
    { tipo: "codigo", linguagem: "text", legenda: "Saída", texto: `Dom Casmurro - Machado de Assis
Quincas Borba - Machado de Assis
[('Graciliano Ramos', 1), ('Machado de Assis', 2)]
Vidas Secas (edição revista)
2` },
    { tipo: "p", texto: "Acompanhe o programa. O motor (create_engine) representa a conexão com o banco, e create_all cria as tabelas (só para exemplos: veja as migrações adiante). A Session é o objeto com que você conversa com o banco: ao adicionar um autor com livros na lista, os livros são gravados junto, graças ao relacionamento. A consulta é construída com select(Livro).where(...).order_by(...), e scalars() devolve os objetos. A segunda consulta junta as tabelas e agrupa para contar livros por autor, devolvendo tuplas. Alterar um atributo (vidas.titulo = ...) e dar commit gera o UPDATE sozinho. E, ao apagar um autor, o cascade \"all, delete-orphan\" apaga também os livros dele, o que explica por que sobraram 2 livros no fim." },
    { tipo: "tabela", legenda: "Operações comuns", cabecalho: ["Necessidade", "Como fazer"], linhas: [
      ["Inserir", "sessao.add(objeto), sessao.add_all([...]) e commit()"],
      ["Buscar por chave primária", "sessao.get(Livro, 1)"],
      ["Consultar vários", "sessao.scalars(select(Livro).where(...)).all()"],
      ["Exatamente um resultado", "sessao.scalars(select(...)).one()  (falha se houver zero ou mais de um)"],
      ["Atualizar", "alterar o atributo do objeto e commit()"],
      ["Apagar", "sessao.delete(objeto) e commit()"],
      ["Contar e agrupar", "select(func.count(...)).group_by(...)"],
    ] },

    { tipo: "h", texto: "Transações: tudo ou nada" },
    { tipo: "p", texto: "Uma transação agrupa várias operações em uma unidade indivisível: ou todas acontecem, ou nenhuma. O exemplo clássico é a transferência bancária, que tira dinheiro de uma conta e coloca em outra: se o programa cair no meio, o dinheiro não pode desaparecer. A Session do SQLAlchemy trabalha sempre dentro de uma transação, e há dois conceitos que confundem quem começa. O flush envia ao banco as mudanças pendentes (o SQL é executado), mas dentro da transação, ainda desfazível. O commit torna tudo definitivo. O rollback descarta o que não foi confirmado." },
    { tipo: "codigo", linguagem: "python", legenda: "transacoes.py", texto: `from sqlalchemy import CheckConstraint, create_engine, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import DeclarativeBase, Mapped, Session, mapped_column


class Base(DeclarativeBase):
    pass


class Conta(Base):
    __tablename__ = "contas"
    __table_args__ = (CheckConstraint("saldo >= 0", name="saldo_nao_negativo"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    dono: Mapped[str]
    saldo: Mapped[int]


motor = create_engine("sqlite:///:memory:")
Base.metadata.create_all(motor)


def transferir(sessao: Session, origem_id: int, destino_id: int, valor: int) -> None:
    origem = sessao.get(Conta, origem_id)
    destino = sessao.get(Conta, destino_id)
    if origem is None or destino is None:
        raise ValueError("conta inexistente")
    origem.saldo -= valor
    destino.saldo += valor
    sessao.flush()


with Session(motor) as sessao:
    sessao.add_all([Conta(id=1, dono="Ana", saldo=100), Conta(id=2, dono="Bruno", saldo=50)])
    sessao.commit()


def saldos() -> list[int]:
    with Session(motor) as sessao:
        return list(sessao.scalars(select(Conta.saldo).order_by(Conta.id)))


with Session(motor) as sessao, sessao.begin():
    transferir(sessao, 1, 2, 30)
print("depois da transferência:", saldos())

try:
    with Session(motor) as sessao, sessao.begin():
        transferir(sessao, 1, 2, 500)
except IntegrityError:
    print("recusada pelo banco")
print("depois da falha:", saldos())

try:
    with Session(motor) as sessao, sessao.begin():
        transferir(sessao, 1, 2, 10)
        raise RuntimeError("erro depois da transferência")
except RuntimeError:
    print("desfeita pelo rollback")
print("depois do erro:", saldos())` },
    { tipo: "codigo", linguagem: "text", legenda: "Saída", texto: `depois da transferência: [70, 80]
recusada pelo banco
depois da falha: [70, 80]
desfeita pelo rollback
depois do erro: [70, 80]` },
    { tipo: "p", texto: "O padrão with Session(motor) as sessao, sessao.begin() confirma ao sair do bloco sem erro e desfaz se houver uma exceção. Na primeira transferência (30), tudo certo: os saldos viram 70 e 80. Na segunda (500), a conta ficaria negativa, e quem recusou foi o próprio banco, pela restrição CHECK (saldo >= 0), lançando IntegrityError: o rollback devolveu o estado anterior. Na terceira, a transferência de 10 foi feita, mas uma exceção posterior no mesmo bloco fez a transação inteira ser desfeita, e os saldos continuaram [70, 80]. Isso mostra duas ideias importantes: as regras de integridade devem existir também no banco (restrições, chaves estrangeiras, unicidade), porque o código da aplicação pode falhar ou ser contornado, e as operações relacionadas devem estar na mesma transação." },
    { tipo: "alerta", titulo: "Concorrência: duas transferências ao mesmo tempo", texto: "O exemplo funciona porque roda uma operação por vez. Em um sistema real, duas transferências simultâneas podem ler o mesmo saldo e sobrescrever uma à outra. As soluções são o bloqueio de linha na leitura (with_for_update), o controle otimista por uma coluna de versão ou a atualização atômica no próprio SQL (UPDATE contas SET saldo = saldo - 30). O que importa agora é saber que o problema existe, e que a transação sozinha não o resolve." },

    { tipo: "h", texto: "O problema das N+1 consultas" },
    { tipo: "p", texto: "Por padrão, o SQLAlchemy carrega as relações de forma preguiçosa (lazy): a lista de livros de um autor só é buscada no banco quando você a acessa pela primeira vez. Parece conveniente, mas esconde uma armadilha: se você busca 100 autores e percorre os livros de cada um em um laço, o resultado são 1 consulta para os autores e 100 para os livros, as N+1 consultas. Com 5 autores, ninguém nota; com milhares, a página trava, e o banco sofre." },
    { tipo: "codigo", linguagem: "python", legenda: "n_mais_um.py", texto: `from sqlalchemy import ForeignKey, create_engine, event, select
from sqlalchemy.orm import DeclarativeBase, Mapped, Session, joinedload, mapped_column, relationship, selectinload


class Base(DeclarativeBase):
    pass


class Autor(Base):
    __tablename__ = "autores"
    id: Mapped[int] = mapped_column(primary_key=True)
    nome: Mapped[str]
    livros: Mapped[list["Livro"]] = relationship(back_populates="autor")


class Livro(Base):
    __tablename__ = "livros"
    id: Mapped[int] = mapped_column(primary_key=True)
    titulo: Mapped[str]
    autor_id: Mapped[int] = mapped_column(ForeignKey("autores.id"))
    autor: Mapped[Autor] = relationship(back_populates="livros")


motor = create_engine("sqlite:///:memory:")
Base.metadata.create_all(motor)
consultas: list[str] = []


@event.listens_for(motor, "before_cursor_execute")
def contar(conexao, cursor, comando, parametros, contexto, varias):
    if comando.lstrip().upper().startswith("SELECT"):
        consultas.append(comando)


with Session(motor) as sessao:
    for numero in range(5):
        autor = Autor(nome=f"Autor {numero}", livros=[Livro(titulo=f"Livro {numero}.{i}") for i in range(2)])
        sessao.add(autor)
    sessao.commit()


def contar_consultas(descricao: str, carregar) -> None:
    consultas.clear()
    with Session(motor) as sessao:
        total = sum(len(autor.livros) for autor in carregar(sessao))
    print(f"{descricao}: {total} livros em {len(consultas)} consulta(s)")


contar_consultas("preguiçoso (N+1)", lambda s: s.scalars(select(Autor)).all())
contar_consultas("selectinload", lambda s: s.scalars(select(Autor).options(selectinload(Autor.livros))).all())
contar_consultas("joinedload", lambda s: s.scalars(select(Autor).options(joinedload(Autor.livros))).unique().all())` },
    { tipo: "codigo", linguagem: "text", legenda: "Saída", texto: `preguiçoso (N+1): 10 livros em 6 consulta(s)
selectinload: 10 livros em 2 consulta(s)
joinedload: 10 livros em 1 consulta(s)` },
    { tipo: "p", texto: "O programa conta as consultas SELECT com um ouvinte de eventos do motor. A versão preguiçosa faz 6 consultas para 5 autores (1 + 5). O selectinload resolve com 2: uma para os autores e outra para todos os livros deles, de uma vez. O joinedload usa uma só, com uma junção, e por isso exige unique() no resultado, já que cada autor aparece repetido por livro. Como escolher? O selectinload é o melhor padrão para relações de um para muitos, porque evita duplicar os dados do autor em cada linha. O joinedload serve bem para relações de muitos para um (o autor de um livro). E, se você nunca precisa da relação, deixe-a preguiçosa e não pague por ela." },
    { tipo: "dica", titulo: "Meça, não adivinhe", texto: "Ative o registro das consultas (create_engine(..., echo=True) em desenvolvimento) ou, como no exemplo, conte-as em um teste. Um teste que afirma \"esta tela faz no máximo 3 consultas\" pega a regressão do N+1 antes de ela chegar à produção." },

    { tipo: "h", texto: "Session por requisição, na API" },
    { tipo: "p", texto: "Em uma API como a do módulo de FastAPI, cada requisição deve ter a sua própria Session, aberta no início e fechada no fim. A forma idiomática é uma dependência (Depends) que a cria, entrega à rota e garante o fechamento. Assim as rotas não sabem como o banco é configurado, e os testes podem trocar a dependência por uma sessão de teste." },
    { tipo: "codigo", linguagem: "python", legenda: "dependencia_de_sessao.py (trecho)", texto: `from collections.abc import Iterator
from typing import Annotated

from fastapi import Depends, FastAPI
from sqlalchemy import select
from sqlalchemy.orm import Session

app = FastAPI()


def obter_sessao() -> Iterator[Session]:
    with Session(motor) as sessao:
        yield sessao


@app.get("/livros")
def listar_livros(sessao: Annotated[Session, Depends(obter_sessao)]) -> list[str]:
    return list(sessao.scalars(select(Livro.titulo).order_by(Livro.titulo)))` },
    { tipo: "alerta", titulo: "Instâncias \"desconectadas\"", texto: "Depois que a Session é fechada, os objetos carregados por ela ficam desconectados, e acessar uma relação ainda não carregada lança DetachedInstanceError. Duas saídas: carregue o que for precisar antes de fechar (com as estratégias de carregamento) ou converta para modelos Pydantic dentro da sessão e devolva só os dados. Devolver objetos do ORM diretamente de uma rota é uma fonte frequente desse erro." },

    { tipo: "h", texto: "Migrações com Alembic" },
    { tipo: "p", texto: "O create_all cria as tabelas que não existem, mas não altera as que já existem: se você acrescentar uma coluna ao modelo, o banco de produção não muda. Para evoluir o esquema com segurança, usam-se migrações: scripts versionados, que descrevem cada mudança (criar tabela, adicionar coluna) e como desfazê-la. A ferramenta padrão do SQLAlchemy é o Alembic. Ele guarda no próprio banco qual versão foi aplicada e executa, em ordem, só as que faltam, o que garante que desenvolvimento, testes e produção cheguem ao mesmo esquema." },
    { tipo: "codigo", linguagem: "bash", legenda: "O ciclo de uma migração", texto: `alembic init migracoes                          # cria a pasta e a configuração (uma vez)
# em migracoes/env.py: target_metadata = Base.metadata

alembic revision --autogenerate -m "cria usuarios"   # compara os modelos com o banco e escreve o script
alembic upgrade head                            # aplica as migrações que faltam
alembic current                                 # mostra a versão atual do banco
alembic downgrade -1                            # desfaz a última migração` },
    { tipo: "codigo", linguagem: "python", legenda: "migracoes/versions/2f366869c307_cria_usuarios.py (gerado)", texto: `def upgrade() -> None:
    op.create_table('usuarios',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('email', sa.String(length=120), nullable=False),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('email')
    )


def downgrade() -> None:
    op.drop_table('usuarios')` },
    { tipo: "p", texto: "O comando --autogenerate detectou a nova tabela e escreveu o script. Ele é um ponto de partida, e não a palavra final: revise sempre o que foi gerado, porque a comparação automática não percebe, por exemplo, a renomeação de uma coluna (que ela vê como remover uma e criar outra, apagando os dados). Migrações que mexem em dados exigem cuidado extra: adicionar uma coluna obrigatória a uma tabela cheia precisa de um valor padrão ou de uma migração em etapas. E uma migração já aplicada em produção nunca é editada: crie uma nova." },

    { tipo: "h", texto: "Segurança e boas práticas" },
    { tipo: "lista", itens: [
      "Parâmetros, sempre: as consultas do ORM usam parâmetros ligados, o que evita a injeção de SQL. Se precisar de SQL puro (text()), passe os valores como parâmetros nomeados (:nome), e nunca monte o texto com f-strings.",
      "Mínimo de privilégios: o usuário do banco que a aplicação usa não deve ser administrador. As migrações podem rodar com um usuário com mais permissões que a aplicação.",
      "A senha e a URL do banco vêm de variáveis de ambiente, validadas na partida, e nunca do código.",
      "Defina restrições no banco (NOT NULL, UNIQUE, CHECK, chaves estrangeiras), além das validações em Python.",
      "Crie índices nas colunas usadas em filtros e junções frequentes, e confira os planos de consulta (EXPLAIN) quando algo ficar lento.",
      "Pagine as listas: nunca devolva uma tabela inteira por uma API. Use limit e offset (ou paginação por chave) com um limite máximo.",
      "Use o pool de conexões com limites razoáveis, e feche as sessões, o que as dependências com yield garantem.",
    ] },
  ],
  questoes: [
    {
      enunciado: "Para que serve a Session do SQLAlchemy?",
      opcoes: ["Para armazenar a sessão de login do usuário", "Para gerar migrações", "Para ser a unidade de trabalho com o banco: acompanha os objetos e agrupa as operações em uma transação", "Para criar o servidor de banco de dados"],
      correta: 2,
      explicacao: "A Session acompanha os objetos carregados e as mudanças feitas neles, e as grava em uma transação no commit. Não tem relação com sessões de login.",
    },
    {
      enunciado: "Qual a diferença entre flush e commit?",
      opcoes: ["Nenhuma", "O flush envia o SQL ao banco dentro da transação, ainda desfazível; o commit torna a transação definitiva", "O commit só funciona em SQLite", "O flush apaga as tabelas"],
      correta: 1,
      explicacao: "Depois do flush, o banco já executou os comandos, mas, se houver um rollback, tudo é desfeito. Só o commit torna as mudanças permanentes.",
    },
    {
      enunciado: "O que acontece com os saldos se, dentro de with Session(motor) as s, s.begin(), a transferência é feita e depois uma exceção é lançada no mesmo bloco?",
      opcoes: ["A transferência permanece", "Só o saldo de origem é desfeito", "O programa ignora a exceção", "A transação inteira é desfeita (rollback), e os saldos voltam ao que eram"],
      correta: 3,
      explicacao: "O bloco com begin() confirma só se terminar sem erro. Com uma exceção, a transação toda é revertida, o que garante o tudo ou nada.",
    },
    {
      enunciado: "O que são as N+1 consultas?",
      opcoes: ["Uma consulta que retorna N+1 linhas", "Uma consulta para a lista principal e mais uma para cada item, ao acessar uma relação preguiçosa dentro de um laço", "O número máximo de conexões do banco", "Um tipo de índice"],
      correta: 1,
      explicacao: "Com 100 autores e acesso às suas listas de livros em um laço, ocorrem 1 consulta para os autores e 100 para os livros. Carregar as relações com antecedência resolve.",
    },
    {
      enunciado: "Qual estratégia costuma ser a melhor para carregar uma relação de um para muitos (autor e seus livros), sem duplicar os dados do autor em cada linha?",
      opcoes: ["selectinload, que busca todos os livros dos autores em uma segunda consulta", "Relação preguiçosa, sempre", "Fazer uma consulta por autor em um laço", "Desativar o ORM"],
      correta: 0,
      explicacao: "O selectinload resolve com duas consultas (autores e livros). O joinedload usa uma só, mas repete os dados do autor por livro, o que pesa em relações de um para muitos.",
    },
    {
      enunciado: "Por que o create_all não é adequado para evoluir o banco de produção?",
      opcoes: ["Porque é muito lento", "Porque cria só as tabelas que faltam e não altera as existentes, sem registrar o histórico de mudanças", "Porque não funciona com PostgreSQL", "Porque apaga os dados sempre"],
      correta: 1,
      explicacao: "Alterar o esquema de um banco com dados exige migrações versionadas, como as do Alembic, que descrevem cada mudança e permitem desfazer.",
    },
    {
      enunciado: "Qual a forma segura de executar um SQL puro com um valor vindo do usuário?",
      opcoes: ["Montar o texto com uma f-string", "Concatenar o valor com aspas", "Usar text() com parâmetros nomeados (:nome) e passar os valores separadamente", "Remover as aspas do valor manualmente"],
      correta: 2,
      explicacao: "Parâmetros ligados mantêm o valor separado do comando, e é isso que impede a injeção de SQL. Montar o texto com a entrada do usuário abre a porta para o ataque.",
    },
  ],
  desafio: {
    titulo: "Gerenciador de tarefas com banco de dados",
    enunciado: "Transforme a API de tarefas do módulo de FastAPI em uma versão com banco de dados, usando SQLAlchemy 2, uma Session por requisição e migrações do Alembic. Use SQLite para desenvolver e escreva os testes de modo que também rodariam em PostgreSQL.",
    requisitos: [
      "Modele Projeto e Tarefa (um projeto tem várias tarefas) com restrições no banco: título não nulo, prioridade com CHECK em uma lista de valores e chave estrangeira.",
      "Crie a dependência obter_sessao com yield e use-a nas rotas de listar, criar, atualizar, concluir e apagar, devolvendo modelos Pydantic (e não objetos do ORM).",
      "Escreva a rota que lista os projetos com a quantidade de tarefas pendentes de cada um, usando uma única consulta com agregação.",
      "Escreva um teste que conta as consultas de uma listagem de projetos com suas tarefas e prova que ela não cresce com o número de projetos (sem N+1).",
      "Crie a primeira migração com o Alembic, aplique-a, depois acrescente uma coluna (por exemplo, concluida_em) e gere e aplique a segunda migração, revisando o script.",
    ],
    criterios: [
      "O esquema do banco vem das migrações, e não de create_all, fora dos testes.",
      "Nenhuma rota devolve diretamente um objeto do ORM, nem monta SQL com texto concatenado.",
      "A listagem de projetos e tarefas faz um número fixo de consultas, e o teste garante isso.",
      "As regras de integridade existem no banco, e os testes mostram o banco recusando um dado inválido.",
      "Você consegue explicar a diferença entre flush, commit e rollback, com um exemplo do seu projeto.",
    ],
    dica: "Comece escrevendo os modelos e testando-os direto, sem a API, com consultas e transações em um script. Só depois ligue as rotas: assim os problemas do banco aparecem separados dos problemas de HTTP.",
  },
  referencias: [
    { titulo: "SQLAlchemy 2: tutorial unificado (em inglês)", url: "https://docs.sqlalchemy.org/en/20/tutorial/" },
    { titulo: "Alembic: tutorial (em inglês)", url: "https://alembic.sqlalchemy.org/en/latest/tutorial.html" },
    { titulo: "OWASP: prevenção de injeção de SQL (em inglês)", url: "https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html" },
  ],
};
