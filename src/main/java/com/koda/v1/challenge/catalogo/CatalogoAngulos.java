package com.koda.v1.challenge.catalogo;

import com.koda.v1.analyzer.contexto.ContextoProjeto;
import com.koda.v1.analyzer.detector.Tecnologia;
import com.koda.v1.challenge.TipoDesafio;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

import static com.koda.v1.challenge.catalogo.RegrasDeAlvo.classes;
import static com.koda.v1.challenge.catalogo.RegrasDeAlvo.colecao;
import static com.koda.v1.challenge.catalogo.RegrasDeAlvo.endpoints;
import static com.koda.v1.challenge.catalogo.RegrasDeAlvo.item;
import static com.koda.v1.challenge.catalogo.RegrasDeAlvo.metodo;
import static com.koda.v1.challenge.catalogo.RegrasDeAlvo.projeto;
import static com.koda.v1.challenge.catalogo.RegrasDeAlvo.recursosComOperacao;
import static com.koda.v1.challenge.catalogo.RegrasDeAlvo.recursosSemOperacao;
import static com.koda.v1.challenge.catalogo.RegrasDeAlvo.seTem;

@Component
public class CatalogoAngulos {

    private static final String AVISO_BUG =
            " Descreva o problema como um cenário reportado por um usuário ou pela equipe de QA, "
                    + "sem afirmar qual trecho causa o erro e sem indicar a correção.";

    private static final List<AnguloDesafio> ANGULOS = List.of(
            testing("TESTING_UNITARIO_DE_SERVICE", "Teste unitário de um service sem cobertura",
                    "Peça testes unitários para o service alvo, que hoje não tem teste, cobrindo o fluxo principal "
                            + "e ao menos um cenário de erro, com as dependências isoladas por mocks.",
                    List.of("JUnit 5", "Mockito", "Testes unitários"),
                    classes(c -> c.testes().servicesSemTeste())),
            testing("TESTING_CONTROLLER_COM_MOCKMVC", "Teste de um controller com MockMvc",
                    "Peça testes para o controller alvo, que hoje não tem teste, verificando status HTTP e corpo "
                            + "da resposta de pelo menos um caminho feliz e um de erro.",
                    List.of("MockMvc", "Status HTTP", "Testes de API"),
                    classes(c -> c.testes().controllersSemTeste())),
            testing("TESTING_CASOS_DE_BORDA", "Casos de borda de um service",
                    "Peça testes de valores limite para o service alvo: nulos, vazios, zero, negativos e máximos, "
                            + "deixando claro o comportamento esperado em cada caso.",
                    List.of("Testes de borda", "JUnit 5", "Análise de requisitos"),
                    classes(c -> c.componentes().services())),
            testing("TESTING_CAMINHOS_DE_ERRO", "Testes dos caminhos de erro",
                    "Peça testes que provoquem as falhas do service alvo e verifiquem as exceções lançadas, "
                            + "incluindo as mensagens ou tipos esperados.",
                    List.of("Exceções", "AssertJ", "Testes de falha"),
                    seTem(c -> !c.componentes().excecoes().isEmpty(), classes(c -> c.componentes().services()))),
            testing("TESTING_REPOSITORY_COM_BANCO", "Teste de um repository com banco real",
                    "Peça testes de persistência para o repository alvo, gravando e relendo dados, sem mockar o banco.",
                    List.of("DataJpaTest", "JPA", "Testes de persistência"),
                    classes(c -> c.componentes().repositories())),
            testing("TESTING_VALIDACAO_DE_ENTRADA", "Testes de validação de entrada",
                    "Peça testes que confirmem quais dados o DTO de entrada alvo aceita e quais recusa, "
                            + "com uma mensagem de erro clara para cada recusa.",
                    List.of("Bean Validation", "Testes unitários", "Validação de entrada"),
                    classes(c -> c.componentes().dtos().stream().filter(nome -> nome.endsWith("Request")).toList())),
            testing("TESTING_TRATADOR_DE_ERROS", "Teste do tratamento global de erros",
                    "Peça testes que confirmem o formato e o status das respostas de erro devolvidas pelo "
                            + "tratamento global de exceções do projeto.",
                    List.of("ControllerAdvice", "MockMvc", "Tratamento de erros"),
                    seTem(c -> c.componentes().temTratadorDeErros(), projeto("tratamento global de erros"))),
            testing("TESTING_INTEGRACAO_DE_ENDPOINT", "Teste de integração de um endpoint",
                    "Peça um teste de integração do endpoint alvo, da requisição HTTP até o banco, "
                            + "verificando o resultado gravado ou lido.",
                    List.of("SpringBootTest", "Testes de integração", "API REST"),
                    endpoints(endpoint -> true)),
            testing("TESTING_FORMATO_DA_RESPOSTA", "Teste do formato da resposta JSON",
                    "Peça um teste que fixe o formato da resposta JSON do endpoint alvo, campo a campo, "
                            + "para que mudanças acidentais no contrato sejam detectadas.",
                    List.of("JSON", "jsonPath", "Testes de contrato"),
                    endpoints(metodo("GET"))),
            testing("TESTING_PARAMETRIZADO", "Testes parametrizados de uma regra de negócio",
                    "Peça testes parametrizados para uma regra de negócio do service alvo, "
                            + "com uma tabela de entradas e saídas esperadas.",
                    List.of("Testes parametrizados", "JUnit 5", "Regras de negócio"),
                    classes(c -> c.componentes().services())),

            feature("FEATURE_PAGINACAO", "Paginação de uma listagem",
                    "Peça paginação para a listagem alvo, com parâmetros de página e tamanho, limite máximo "
                            + "e resposta que informe o total de itens.",
                    List.of("Paginação", "Spring Data", "API REST"),
                    endpoints(endpoint -> metodo("GET").test(endpoint) && colecao(endpoint))),
            feature("FEATURE_FILTRO_OPCIONAL", "Filtro opcional em uma listagem",
                    "Peça um filtro opcional por um campo do recurso na listagem alvo, mantendo o comportamento "
                            + "atual quando o filtro não for informado.",
                    List.of("Query params", "Spring Data", "Filtros"),
                    endpoints(endpoint -> metodo("GET").test(endpoint) && colecao(endpoint))),
            feature("FEATURE_ORDENACAO", "Ordenação de uma listagem",
                    "Peça ordenação configurável para a listagem alvo, com campo e direção, recusando campos "
                            + "que não existam.",
                    List.of("Ordenação", "Spring Data", "Query params"),
                    endpoints(endpoint -> metodo("GET").test(endpoint) && colecao(endpoint))),
            feature("FEATURE_BUSCA_POR_ID", "Consulta de um recurso por identificador",
                    "Peça um endpoint de consulta por identificador para o recurso alvo, que hoje só tem outras "
                            + "operações, com resposta clara quando o item não existe.",
                    List.of("Path variables", "API REST", "Tratamento de não encontrado"),
                    recursosSemOperacao("GET", true)),
            feature("FEATURE_CRIACAO", "Criação de um recurso",
                    "Peça um endpoint de criação para o recurso alvo, que hoje não tem, com validação dos dados "
                            + "de entrada e status HTTP adequado.",
                    List.of("POST", "DTOs", "Validação de entrada"),
                    recursosSemOperacao("POST", false)),
            feature("FEATURE_ATUALIZACAO_COMPLETA", "Atualização completa de um recurso",
                    "Peça um endpoint de atualização completa para o recurso alvo, que hoje não tem, "
                            + "com regra clara para item inexistente.",
                    List.of("PUT", "API REST", "JPA"),
                    recursosSemOperacao("PUT", true)),
            feature("FEATURE_ATUALIZACAO_PARCIAL", "Atualização parcial de um recurso",
                    "Peça um endpoint de atualização parcial para o recurso alvo, que hoje não tem, "
                            + "alterando só os campos enviados.",
                    List.of("PATCH", "API REST", "DTOs"),
                    recursosSemOperacao("PATCH", true)),
            feature("FEATURE_EXCLUSAO", "Exclusão de um recurso",
                    "Peça um endpoint de exclusão para o recurso alvo, que hoje não tem, "
                            + "definindo o que acontece com item inexistente e com dados relacionados.",
                    List.of("DELETE", "API REST", "Integridade de dados"),
                    recursosSemOperacao("DELETE", true)),
            feature("FEATURE_EXCLUSAO_LOGICA", "Exclusão lógica de uma entidade",
                    "Peça que a entidade alvo deixe de ser apagada de verdade e passe a ser marcada como inativa, "
                            + "sumindo das consultas comuns.",
                    List.of("JPA", "Exclusão lógica", "Modelagem"),
                    classes(c -> c.componentes().entidades())),
            feature("FEATURE_VALIDACAO_DE_ENTRADA", "Regras de validação em um DTO de entrada",
                    "Peça regras de validação para os campos do DTO de entrada alvo, com mensagens de erro "
                            + "claras devolvidas ao cliente.",
                    List.of("Bean Validation", "DTOs", "Mensagens de erro"),
                    classes(c -> c.componentes().dtos().stream().filter(nome -> nome.endsWith("Request")).toList())),
            feature("FEATURE_DTO_DE_RESPOSTA", "DTO de resposta para uma entidade",
                    "Peça um DTO de resposta para a entidade alvo, que hoje não tem, "
                            + "para que a API não exponha a entidade diretamente.",
                    List.of("DTOs", "Mapeamento", "Encapsulamento"),
                    classes(CatalogoAngulos::entidadesSemDtoDeResposta)),
            feature("FEATURE_CAMPOS_DE_AUDITORIA", "Campos de auditoria em uma entidade",
                    "Peça campos de criação e atualização para a entidade alvo, preenchidos automaticamente, "
                            + "com a mudança no banco versionada.",
                    List.of("JPA", "Auditoria", "Migrations"),
                    classes(c -> c.componentes().entidades())),
            feature("FEATURE_CACHE_DE_CONSULTA", "Cache de uma consulta frequente",
                    "Peça cache para a consulta alvo, com tempo de expiração e invalidação quando o dado mudar.",
                    List.of("Cache", "Redis", "Spring Cache"),
                    seTem(c -> c.tecnologias().contains(Tecnologia.REDIS), endpoints(metodo("GET")))),
            feature("FEATURE_EVENTO_DE_DOMINIO", "Publicação de um evento de domínio",
                    "Peça que o service alvo publique uma mensagem quando um fato importante acontecer, "
                            + "definindo o conteúdo da mensagem.",
                    List.of("Mensageria", "RabbitMQ", "Eventos"),
                    seTem(c -> c.tecnologias().contains(Tecnologia.RABBITMQ), classes(c -> c.componentes().services()))),
            feature("FEATURE_CONTAGEM_DO_RECURSO", "Endpoint de contagem ou resumo",
                    "Peça um endpoint que devolva totais ou um resumo do recurso alvo, "
                            + "calculado no banco e não em memória.",
                    List.of("Agregações", "Spring Data", "API REST"),
                    recursosComOperacao("GET", false)),

            bug("BUG_NAO_ENCONTRADO_RETORNA_500", "Item inexistente responde com erro interno",
                    "O cenário reportado é que consultar um item que não existe devolve erro interno do servidor "
                            + "em vez de uma resposta de não encontrado." + AVISO_BUG,
                    List.of("Tratamento de exceções", "HTTP 404", "Depuração"),
                    endpoints(endpoint -> metodo("GET").test(endpoint) && item(endpoint))),
            bug("BUG_DADO_INVALIDO_ACEITO", "Dados inválidos são aceitos",
                    "O cenário reportado é que o endpoint grava dados claramente inválidos, como campos vazios "
                            + "ou fora do permitido." + AVISO_BUG,
                    List.of("Validação de entrada", "Bean Validation", "Depuração"),
                    endpoints(metodo("POST", "PUT", "PATCH"))),
            bug("BUG_ERRO_SEM_TRATAMENTO", "Erros chegam ao cliente sem tratamento",
                    "O cenário reportado é que falhas previsíveis chegam ao cliente com resposta genérica ou "
                            + "sem padrão, sem mensagem útil." + AVISO_BUG,
                    List.of("ControllerAdvice", "Tratamento de erros", "Respostas de erro"),
                    seTem(c -> !c.componentes().temTratadorDeErros(), projeto("tratamento de erros"))),
            bug("BUG_STATUS_DE_CRIACAO", "Criação responde com status inadequado",
                    "O cenário reportado é que a criação de um item funciona, mas a resposta não usa o status "
                            + "HTTP esperado para criação." + AVISO_BUG,
                    List.of("Status HTTP", "API REST", "Depuração"),
                    endpoints(endpoint -> metodo("POST").test(endpoint) && colecao(endpoint))),
            bug("BUG_LISTA_VAZIA_DA_404", "Listagem vazia responde como não encontrada",
                    "O cenário reportado é que, quando não há itens, a listagem responde como se o recurso "
                            + "não existisse." + AVISO_BUG,
                    List.of("Status HTTP", "API REST", "Depuração"),
                    endpoints(endpoint -> metodo("GET").test(endpoint) && colecao(endpoint))),
            bug("BUG_DUPLICIDADE_PERMITIDA", "Registros duplicados são aceitos",
                    "O cenário reportado é que é possível criar o mesmo registro mais de uma vez, "
                            + "gerando duplicidade." + AVISO_BUG,
                    List.of("Regras de negócio", "Unicidade", "Consultas"),
                    endpoints(endpoint -> metodo("POST").test(endpoint) && colecao(endpoint))),
            bug("BUG_ATUALIZACAO_ZERA_CAMPOS", "Atualização apaga campos não enviados",
                    "O cenário reportado é que, ao atualizar um item, campos que não foram enviados "
                            + "perdem o valor." + AVISO_BUG,
                    List.of("Atualização de dados", "JPA", "Depuração"),
                    endpoints(metodo("PUT", "PATCH"))),
            bug("BUG_EXCLUSAO_DE_INEXISTENTE", "Exclusão de item inexistente responde de forma incorreta",
                    "O cenário reportado é que excluir um item que não existe devolve sucesso ou erro interno "
                            + "em vez de uma resposta coerente." + AVISO_BUG,
                    List.of("Tratamento de exceções", "HTTP 404", "Idempotência"),
                    endpoints(metodo("DELETE"))),
            bug("BUG_NULO_EM_CAMPO_OPCIONAL", "Falha com campo opcional vazio",
                    "O cenário reportado é que o fluxo quebra com erro inesperado quando um campo opcional "
                            + "não é preenchido." + AVISO_BUG,
                    List.of("NullPointerException", "Optional", "Depuração"),
                    classes(c -> c.componentes().services())),
            bug("BUG_TRANSACAO_AUSENTE", "Gravação parcial quando uma etapa falha",
                    "O cenário reportado é que, quando uma operação com várias gravações falha no meio, "
                            + "parte dos dados fica salva e o restante não." + AVISO_BUG,
                    List.of("Transações", "Spring", "Consistência de dados"),
                    seTem(c -> !c.componentes().repositories().isEmpty(), classes(c -> c.componentes().services()))),
            bug("BUG_CONSULTAS_EXCESSIVAS", "Listagem lenta por excesso de consultas",
                    "O cenário reportado é que uma listagem que envolve a entidade alvo fica muito mais lenta "
                            + "conforme a quantidade de dados cresce." + AVISO_BUG,
                    List.of("JPA", "Desempenho", "Consultas N+1"),
                    classes(c -> c.componentes().entidades())));

    public List<AnguloDesafio> todos() {
        return ANGULOS;
    }

    public List<AnguloDesafio> doTipo(TipoDesafio tipo) {
        return ANGULOS.stream().filter(angulo -> angulo.tipo() == tipo).toList();
    }

    public Optional<AnguloDesafio> porId(String id) {
        return ANGULOS.stream().filter(angulo -> angulo.id().equals(id)).findFirst();
    }

    public List<AnguloAplicavel> aplicaveis(ContextoProjeto contexto, TipoDesafio tipo) {
        return ANGULOS.stream()
                .filter(angulo -> tipo == null || angulo.tipo() == tipo)
                .map(angulo -> new AnguloAplicavel(angulo, angulo.alvosEm(contexto)))
                .filter(aplicavel -> !aplicavel.alvos().isEmpty())
                .toList();
    }

    private static List<String> entidadesSemDtoDeResposta(ContextoProjeto contexto) {
        return contexto.componentes().entidades().stream()
                .filter(entidade -> contexto.componentes().dtos().stream().noneMatch(dto ->
                        dto.startsWith(entidade)
                                && (dto.endsWith("Response") || dto.endsWith("Dto") || dto.endsWith("DTO"))))
                .toList();
    }

    private static AnguloDesafio testing(String id, String nome, String instrucao,
                                         List<String> habilidades, RegraDeAlvo regra) {
        return new AnguloDesafio(id, TipoDesafio.TESTING, nome, instrucao, habilidades, regra);
    }

    private static AnguloDesafio feature(String id, String nome, String instrucao,
                                         List<String> habilidades, RegraDeAlvo regra) {
        return new AnguloDesafio(id, TipoDesafio.FEATURE, nome, instrucao, habilidades, regra);
    }

    private static AnguloDesafio bug(String id, String nome, String instrucao,
                                     List<String> habilidades, RegraDeAlvo regra) {
        return new AnguloDesafio(id, TipoDesafio.BUG, nome, instrucao, habilidades, regra);
    }
}
