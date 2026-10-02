import type { Aula } from "./tipos";

export const AULAS_INICIAIS: Aula[] = [
  {
    slug: "api-rest-spring-boot-controller-service-repository",
    titulo: "API REST com Spring Boot: controller, service e repository",
    resumo: "Entenda o papel de cada camada e como uma requisição HTTP atravessa uma aplicação Spring Boot.",
    trilha: "java",
    nivel: "Iniciante",
    leitura: "8 min",
    blocos: [
      { tipo: "p", texto: "Quase todo projeto Spring Boot que você vai encontrar no trabalho divide o código em três camadas. Saber o que pertence a cada uma é o primeiro passo para ler e alterar um projeto sem medo." },
      { tipo: "h", texto: "O caminho de uma requisição" },
      { tipo: "p", texto: "Quando alguém chama GET /pedidos/7, a requisição chega ao controller, que a repassa ao service, que usa o repository para buscar o dado no banco. A resposta volta pelo mesmo caminho." },
      { tipo: "lista", itens: [
        "Controller: fala HTTP. Recebe a requisição, valida o formato, chama o service e devolve o status e o corpo da resposta.",
        "Service: guarda as regras de negócio. Não sabe nada de HTTP nem de SQL.",
        "Repository: fala com o banco. No Spring Data JPA, uma interface já resolve as consultas mais comuns.",
      ] },
      { tipo: "h", texto: "O controller" },
      { tipo: "codigo", linguagem: "java", legenda: "PedidoController.java", texto: `@RestController
@RequestMapping("/pedidos")
public class PedidoController {

    private final PedidoService service;

    public PedidoController(PedidoService service) {
        this.service = service;
    }

    @GetMapping("/{id}")
    public PedidoResposta buscar(@PathVariable Long id) {
        return service.buscar(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public PedidoResposta criar(@Valid @RequestBody NovoPedidoRequisicao corpo) {
        return service.criar(corpo);
    }
}` },
      { tipo: "p", texto: "Repare em três detalhes: as dependências entram pelo construtor, o POST devolve 201 (criado) em vez do 200 padrão e o @Valid faz o Spring recusar um corpo inválido antes de o método rodar." },
      { tipo: "h", texto: "O service" },
      { tipo: "codigo", linguagem: "java", legenda: "PedidoService.java", texto: `@Service
public class PedidoService {

    private final PedidoRepository repository;

    public PedidoService(PedidoRepository repository) {
        this.repository = repository;
    }

    public PedidoResposta buscar(Long id) {
        Pedido pedido = repository.findById(id)
                .orElseThrow(() -> new PedidoNaoEncontradoException(id));
        return PedidoResposta.de(pedido);
    }
}` },
      { tipo: "p", texto: "É aqui que a regra mora. Se o pedido não existe, o service lança uma exceção do domínio. Quem a transforma em um 404 é o tratamento global de erros, não o service." },
      { tipo: "h", texto: "O repository" },
      { tipo: "codigo", linguagem: "java", legenda: "PedidoRepository.java", texto: `public interface PedidoRepository extends JpaRepository<Pedido, Long> {
}` },
      { tipo: "p", texto: "Só isso já dá findById, save, deleteById e findAll. Consultas específicas viram métodos com nomes como findByClienteId, que o Spring Data transforma em SQL." },
      { tipo: "dica", titulo: "Por que separar?", texto: "Cada camada muda por um motivo diferente. Trocar o formato da resposta mexe no controller. Mudar uma regra de preço mexe no service. Trocar o banco mexe no repository. Misturar tudo faz uma mudança pequena quebrar vários lugares." },
      { tipo: "h", texto: "Para praticar" },
      { tipo: "p", texto: "Abra um projeto Spring Boot seu e siga uma rota até o banco, lendo controller, service e repository nessa ordem. Depois escolha uma rota sem teste e tente descrever, em uma frase, o que ela deveria garantir." },
    ],
  },
  {
    slug: "testes-unitarios-junit-mockito",
    titulo: "Testes unitários com JUnit 5 e Mockito: o essencial",
    resumo: "Como testar um service isolado do banco, escrevendo um teste que falha pelo motivo certo.",
    trilha: "java",
    nivel: "Júnior",
    leitura: "7 min",
    blocos: [
      { tipo: "p", texto: "Um teste unitário verifica uma peça pequena do código, sozinha. Para testar um service sem subir banco nem servidor, trocamos as dependências por dublês, que o Mockito cria para nós." },
      { tipo: "h", texto: "A estrutura de um bom teste" },
      { tipo: "lista", itens: [
        "Preparar (arrange): montar os dados e dizer o que cada dublê devolve.",
        "Agir (act): chamar o método que está sendo testado.",
        "Verificar (assert): conferir o resultado ou o efeito esperado.",
      ] },
      { tipo: "h", texto: "Um exemplo: o pedido que não existe" },
      { tipo: "codigo", linguagem: "java", legenda: "PedidoServiceTest.java", texto: `@ExtendWith(MockitoExtension.class)
class PedidoServiceTest {

    @Mock
    private PedidoRepository repository;

    @InjectMocks
    private PedidoService service;

    @Test
    void deveLancarExcecaoQuandoOPedidoNaoExiste() {
        when(repository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.buscar(99L))
                .isInstanceOf(PedidoNaoEncontradoException.class);
    }

    @Test
    void deveDevolverOPedidoQuandoEleExiste() {
        Pedido pedido = new Pedido(7L, "Ana");
        when(repository.findById(7L)).thenReturn(Optional.of(pedido));

        PedidoResposta resposta = service.buscar(7L);

        assertThat(resposta.cliente()).isEqualTo("Ana");
    }
}` },
      { tipo: "p", texto: "O @Mock cria um repository falso, o @InjectMocks monta o service com ele, e o when(...).thenReturn(...) define o que o falso responde. Os métodos assertThat e assertThatThrownBy vêm do AssertJ, que deixa a verificação legível." },
      { tipo: "h", texto: "O que testar" },
      { tipo: "lista", itens: [
        "O caminho feliz: o que acontece quando tudo dá certo.",
        "Os caminhos de erro: dados que não existem, valores inválidos, falhas de dependências.",
        "Os casos de borda: nulo, vazio, zero, o maior e o menor valor aceitos.",
      ] },
      { tipo: "dica", titulo: "O nome do teste é documentação", texto: "Escreva o nome como uma frase que diz o comportamento: deveLancarExcecaoQuandoOPedidoNaoExiste. Quando o teste falhar, só de ler o nome você já sabe o que quebrou." },
      { tipo: "h", texto: "Erros comuns" },
      { tipo: "lista", itens: [
        "Testar o Mockito em vez do código: se o teste só confere que o dublê foi chamado, ele não protege nada.",
        "Um teste que depende de outro ou da ordem de execução.",
        "Testes sem nenhuma verificação, que passam sempre.",
      ] },
    ],
  },
  {
    slug: "organizando-servidor-express-typescript",
    titulo: "Organizando um servidor Express em TypeScript",
    resumo: "Rotas, services e um tratador de erros: como separar responsabilidades em um servidor Node.",
    trilha: "typescript",
    nivel: "Iniciante",
    leitura: "8 min",
    blocos: [
      { tipo: "p", texto: "O Express não impõe estrutura nenhuma, e é por isso que cada projeto parece diferente. Mesmo assim, os bons seguem a mesma ideia de camadas que você viu em outras linguagens: quem fala HTTP fica separado de quem tem a regra de negócio." },
      { tipo: "h", texto: "Rotas finas, services com a regra" },
      { tipo: "codigo", linguagem: "typescript", legenda: "src/routes/pedidos.routes.ts", texto: `import { Router } from "express";
import { PedidosService } from "../services/pedidos.service";

const service = new PedidosService();
export const pedidosRouter = Router();

pedidosRouter.get("/:id", async (req, res, next) => {
  try {
    const pedido = await service.buscar(Number(req.params.id));
    if (!pedido) {
      res.status(404).json({ erro: "Pedido não encontrado" });
      return;
    }
    res.json(pedido);
  } catch (erro) {
    next(erro);
  }
});` },
      { tipo: "p", texto: "A rota só traduz HTTP: lê o parâmetro, chama o service e escolhe o status. O que significa ser um pedido válido ou como buscá-lo fica no service." },
      { tipo: "h", texto: "Montando a aplicação" },
      { tipo: "codigo", linguagem: "typescript", legenda: "src/app.ts", texto: `import express from "express";
import { pedidosRouter } from "./routes/pedidos.routes";
import { tratadorDeErros } from "./middlewares/tratador-de-erros";

export const app = express();

app.use(express.json());
app.use("/pedidos", pedidosRouter);
app.use(tratadorDeErros);` },
      { tipo: "p", texto: "A ordem importa: o middleware de erros precisa ser registrado depois das rotas, para receber o que elas passarem com next(erro)." },
      { tipo: "h", texto: "Um tratador de erros central" },
      { tipo: "codigo", linguagem: "typescript", legenda: "src/middlewares/tratador-de-erros.ts", texto: `import type { NextFunction, Request, Response } from "express";

export function tratadorDeErros(
  erro: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  console.error(erro);
  res.status(500).json({ erro: "Erro interno do servidor" });
}` },
      { tipo: "p", texto: "O Express reconhece um middleware de erro pelos quatro parâmetros. Repare que a resposta ao cliente é uma mensagem fixa: o detalhe do erro vai para o log, não para quem fez a requisição." },
      { tipo: "dica", titulo: "Erros em funções assíncronas", texto: "No Express 4, um erro dentro de uma função async que ninguém capturou não chega ao tratador. Por isso o try/catch com next(erro). Versões mais novas tratam isso por você, então confira a versão do projeto." },
      { tipo: "h", texto: "Para praticar" },
      { tipo: "p", texto: "Pegue um servidor Express seu e verifique: existe um lugar único para tratar erros? As rotas têm regra de negócio dentro? Se sim, mover essa regra para um service é um ótimo primeiro desafio." },
    ],
  },
  {
    slug: "fastapi-pydantic-primeira-api",
    titulo: "Sua primeira API com FastAPI e Pydantic",
    resumo: "Rotas, validação automática dos dados e respostas tipadas em poucas linhas de Python.",
    trilha: "python",
    nivel: "Iniciante",
    leitura: "7 min",
    blocos: [
      { tipo: "p", texto: "O FastAPI usa as dicas de tipo do Python para validar a entrada, converter os dados e gerar a documentação da API. Quem faz o trabalho de validação é o Pydantic." },
      { tipo: "h", texto: "Modelos e rotas" },
      { tipo: "codigo", linguagem: "python", legenda: "app/main.py", texto: `from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

app = FastAPI()


class NovoPedido(BaseModel):
    cliente: str = Field(min_length=2)
    total: float = Field(gt=0)


class Pedido(NovoPedido):
    id: int


pedidos: dict[int, Pedido] = {}


@app.post("/pedidos", response_model=Pedido, status_code=201)
def criar(corpo: NovoPedido):
    novo = Pedido(id=len(pedidos) + 1, **corpo.model_dump())
    pedidos[novo.id] = novo
    return novo


@app.get("/pedidos/{pedido_id}", response_model=Pedido)
def buscar(pedido_id: int):
    if pedido_id not in pedidos:
        raise HTTPException(status_code=404, detail="Pedido não encontrado")
    return pedidos[pedido_id]` },
      { tipo: "h", texto: "O que o framework faz por você" },
      { tipo: "lista", itens: [
        "Se o corpo do POST não tiver cliente com ao menos 2 caracteres ou tiver total menor ou igual a zero, a resposta é automaticamente 422, com a descrição do campo inválido.",
        "O pedido_id do caminho é convertido para inteiro. Se vier texto, também é 422.",
        "O response_model garante que só os campos do modelo saem na resposta.",
        "A documentação interativa fica disponível em /docs, sem escrever nada a mais.",
      ] },
      { tipo: "h", texto: "Rodando" },
      { tipo: "codigo", linguagem: "bash", texto: `pip install fastapi uvicorn
uvicorn app.main:app --reload` },
      { tipo: "dica", titulo: "Guardar em um dicionário é só para estudar", texto: "O dicionário em memória some quando o servidor reinicia e não funciona com mais de um processo. Em um projeto de verdade, o acesso aos dados fica em uma camada própria, como um repositório, falando com um banco." },
      { tipo: "h", texto: "Para praticar" },
      { tipo: "p", texto: "Acrescente uma rota para listar os pedidos com um parâmetro opcional de filtro por cliente. Pense em qual status devolver quando nenhum pedido corresponder ao filtro." },
    ],
  },
  {
    slug: "testando-api-com-pytest",
    titulo: "Testando uma API FastAPI com pytest",
    resumo: "Escreva testes que chamam a API de verdade, sem subir servidor, e cubra o caminho feliz e os erros.",
    trilha: "python",
    nivel: "Júnior",
    leitura: "6 min",
    blocos: [
      { tipo: "p", texto: "O pytest é o padrão de testes em Python: testes são funções simples que começam com test_ e usam o assert do próprio Python. Para APIs FastAPI, o TestClient faz as requisições sem precisar de um servidor rodando." },
      { tipo: "h", texto: "Preparando" },
      { tipo: "codigo", linguagem: "bash", texto: `pip install pytest httpx` },
      { tipo: "p", texto: "O TestClient depende do httpx. Coloque os testes em uma pasta tests/, com nomes de arquivo como test_pedidos.py." },
      { tipo: "h", texto: "Os testes" },
      { tipo: "codigo", linguagem: "python", legenda: "tests/test_pedidos.py", texto: `from fastapi.testclient import TestClient

from app.main import app

cliente = TestClient(app)


def test_cria_pedido_valido():
    resposta = cliente.post("/pedidos", json={"cliente": "Ana", "total": 10.5})

    assert resposta.status_code == 201
    assert resposta.json()["cliente"] == "Ana"


def test_recusa_total_negativo():
    resposta = cliente.post("/pedidos", json={"cliente": "Ana", "total": -1})

    assert resposta.status_code == 422


def test_devolve_404_para_pedido_inexistente():
    resposta = cliente.get("/pedidos/9999")

    assert resposta.status_code == 404` },
      { tipo: "p", texto: "Cada teste cobre um comportamento: o caminho feliz, uma entrada inválida e um recurso que não existe. Para rodar, use pytest na raiz do projeto." },
      { tipo: "h", texto: "Fixtures: preparar sem repetir" },
      { tipo: "codigo", linguagem: "python", texto: `import pytest


@pytest.fixture
def pedido_criado():
    resposta = cliente.post("/pedidos", json={"cliente": "Bia", "total": 20})
    return resposta.json()


def test_busca_pedido_existente(pedido_criado):
    resposta = cliente.get(f"/pedidos/{pedido_criado['id']}")

    assert resposta.status_code == 200` },
      { tipo: "dica", titulo: "Testes independentes", texto: "Um teste não pode depender do que outro deixou para trás. Se a sua API guarda dados em memória ou em um banco, limpe ou isole o estado entre os testes, senão a ordem de execução passa a mudar o resultado." },
    ],
  },
  {
    slug: "codigos-de-status-http",
    titulo: "Códigos de status HTTP: qual devolver em cada caso",
    resumo: "Um guia curto para escolher o status certo, em qualquer linguagem, e evitar o 200 para tudo.",
    trilha: "carreira",
    nivel: "Iniciante",
    leitura: "5 min",
    blocos: [
      { tipo: "p", texto: "O status HTTP é a primeira coisa que o cliente de uma API lê. Escolher o código certo evita bugs e conversa, e ticket de bug sobre status errado é dos mais comuns." },
      { tipo: "h", texto: "As famílias" },
      { tipo: "lista", itens: [
        "2xx: deu certo.",
        "3xx: redirecionamento.",
        "4xx: o problema está no pedido do cliente.",
        "5xx: o problema está no servidor.",
      ] },
      { tipo: "h", texto: "Os que você mais vai usar" },
      { tipo: "lista", itens: [
        "200 OK: a consulta ou a atualização funcionou e há um corpo na resposta.",
        "201 Created: um recurso foi criado. Costuma vir com o endereço do novo recurso.",
        "204 No Content: deu certo e não há corpo, comum em exclusões.",
        "400 Bad Request: o pedido está malformado, como um JSON quebrado.",
        "401 Unauthorized: falta autenticação, a pessoa não se identificou.",
        "403 Forbidden: a pessoa se identificou, mas não tem permissão.",
        "404 Not Found: o recurso não existe, ou você não pode saber que ele existe.",
        "409 Conflict: o pedido conflita com o estado atual, como criar algo que já existe.",
        "422 Unprocessable Entity: o formato está certo, mas os dados não passam nas regras de validação.",
        "500 Internal Server Error: algo inesperado quebrou no servidor.",
      ] },
      { tipo: "h", texto: "Erros comuns" },
      { tipo: "lista", itens: [
        "Devolver 200 com uma mensagem de erro no corpo: quem consome a API precisa ler o texto para descobrir que falhou.",
        "Devolver 500 para um erro previsível, como um item que não existe. Isso é um 404.",
        "Devolver 404 quando uma listagem está apenas vazia. Uma lista vazia é um 200 com lista vazia.",
        "Confundir 401 e 403.",
      ] },
      { tipo: "dica", titulo: "Mensagens de erro não são para vazar detalhes", texto: "Em erros 5xx, devolva uma mensagem genérica ao cliente e registre o detalhe no log. Mostrar stack trace ou o texto de uma exceção do banco entrega informação a quem não deveria ter." },
    ],
  },
  {
    slug: "como-ler-um-ticket-de-desenvolvimento",
    titulo: "Como ler um ticket de desenvolvimento e entender o que fazer",
    resumo: "Contexto, cenário atual, objetivo e critérios de aceite: o que cada parte quer dizer e como transformar em trabalho.",
    trilha: "carreira",
    nivel: "Iniciante",
    leitura: "6 min",
    blocos: [
      { tipo: "p", texto: "No trabalho, quase tudo começa em um ticket. Saber lê-lo com calma, antes de abrir o editor, economiza horas de retrabalho." },
      { tipo: "h", texto: "As partes de um bom ticket" },
      { tipo: "lista", itens: [
        "Contexto: por que isso existe? Que problema de negócio ou de usuário está por trás.",
        "Cenário atual: como o sistema se comporta hoje.",
        "Objetivo: o resultado esperado, sem dizer como chegar a ele.",
        "Regras de negócio: o que precisa ser verdade para o resultado estar certo.",
        "Critérios de aceite: como saber que acabou. Cada um deve poder ser verificado.",
        "Restrições: o que não deve mudar ou o que evitar.",
      ] },
      { tipo: "h", texto: "Um roteiro de leitura" },
      { tipo: "lista", itens: [
        "Leia tudo uma vez, sem tentar resolver.",
        "Reescreva o objetivo com as suas palavras, em uma frase.",
        "Para cada critério de aceite, pergunte: como eu mostraria que isso está atendido?",
        "Procure no código o ponto de partida: a rota, a classe ou a tela citada.",
        "Anote as dúvidas e leve ao time antes de começar, não no meio.",
      ] },
      { tipo: "h", texto: "Critérios vagos e critérios bons" },
      { tipo: "lista", itens: [
        "Vago: “melhorar o desempenho da listagem”. Não dá para dizer quando terminou.",
        "Bom: “a listagem responde em até 500 ms com 1.000 itens e aceita os parâmetros página e tamanho”.",
      ] },
      { tipo: "dica", titulo: "Pergunte quando faltar", texto: "Um ticket ambíguo não é um fracasso seu: é uma informação. Pedir esclarecimento cedo é sinal de maturidade, e mostra que você leu com atenção." },
      { tipo: "h", texto: "Para praticar" },
      { tipo: "p", texto: "Escolha um ticket da Koda e faça só o roteiro de leitura, sem programar nada: objetivo com as suas palavras, uma verificação para cada critério e o ponto de partida no código. Depois comece a implementar." },
    ],
  },
];
