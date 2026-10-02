package com.koda.v1.challenge.catalogo;

import com.koda.v1.analyzer.contexto.ContextoProjeto;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

import static com.koda.v1.challenge.catalogo.RegrasDeAlvo.classes;
import static com.koda.v1.challenge.catalogo.Variante.completa;
import static com.koda.v1.challenge.catalogo.Variante.comRegra;
import static com.koda.v1.challenge.catalogo.Variante.habilidades;

/**
 * Os textos do catálogo foram escritos para Java com Spring Boot. Aqui estão as habilidades e os termos
 * equivalentes em Node (TypeScript e JavaScript) e em Python, para um ticket nunca citar JUnit num projeto pytest.
 * Um ângulo sem entrada aqui vale igual nas três linguagens.
 */
final class VariantesDoCatalogo {

    private static final Set<String> SUFIXOS_DE_ENTIDADE = Set.of("Entity", "Model", "Schema");
    private static final List<String> SUFIXOS_DE_ENTRADA = List.of("Request", "Input", "Create", "Update");
    private static final List<String> PREFIXOS_DE_ENTRADA = List.of("Create", "Update", "New");

    private static final RegraDeAlvo DTOS_DE_ENTRADA =
            classes(contexto -> contexto.componentes().dtos().stream()
                    .filter(VariantesDoCatalogo::ehDtoDeEntrada)
                    .toList());
    private static final RegraDeAlvo ENTIDADES_SEM_DTO_DE_RESPOSTA =
            classes(VariantesDoCatalogo::entidadesSemDtoDeResposta);

    private static final Map<String, Map<FamiliaDeLinguagem, Variante>> TABELA = montar();

    private VariantesDoCatalogo() {
    }

    static Map<FamiliaDeLinguagem, Variante> de(String anguloId) {
        return TABELA.getOrDefault(anguloId, Map.of());
    }

    private static Map<String, Map<FamiliaDeLinguagem, Variante>> montar() {
        Map<String, Map<FamiliaDeLinguagem, Variante>> t = new HashMap<>();

        // Testing
        t.put("TESTING_UNITARIO_DE_SERVICE", dupla(
                habilidades("Jest ou Vitest", "Mocks", "Testes unitários"),
                habilidades("pytest", "Mocks", "Testes unitários")));
        t.put("TESTING_CONTROLLER_COM_MOCKMVC", dupla(
                completa("Teste de uma rota ou controller com requisições HTTP",
                        "Peça testes para o controller ou a rota alvo, que hoje não tem teste, fazendo requisições HTTP "
                                + "e verificando status e corpo da resposta de pelo menos um caminho feliz e um de erro.",
                        null, "Supertest", "Status HTTP", "Testes de API"),
                completa("Teste de uma rota com cliente de teste HTTP",
                        "Peça testes para a rota ou view alvo, que hoje não tem teste, fazendo requisições HTTP com o "
                                + "cliente de teste do framework e verificando status e corpo da resposta de pelo menos "
                                + "um caminho feliz e um de erro.",
                        null, "pytest", "Status HTTP", "Testes de API")));
        t.put("TESTING_CASOS_DE_BORDA", dupla(
                habilidades("Testes de borda", "Jest ou Vitest", "Análise de requisitos"),
                habilidades("Testes de borda", "pytest", "Análise de requisitos")));
        t.put("TESTING_CAMINHOS_DE_ERRO", dupla(
                completa(null, "Peça testes que provoquem as falhas do service alvo e verifiquem os erros lançados, "
                        + "incluindo as mensagens ou tipos esperados.", null,
                        "Erros", "Testes de falha", "Asserções"),
                completa(null, "Peça testes que provoquem as falhas do service alvo e verifiquem as exceções "
                        + "levantadas, incluindo as mensagens ou tipos esperados.", null,
                        "Exceções", "pytest", "Testes de falha")));
        t.put("TESTING_REPOSITORY_COM_BANCO", dupla(
                habilidades("Testes de persistência", "ORM", "Banco de dados"),
                habilidades("Testes de persistência", "ORM", "Banco de dados")));
        t.put("TESTING_VALIDACAO_DE_ENTRADA", dupla(
                comRegra(DTOS_DE_ENTRADA, "Validação de entrada", "Schemas", "Testes unitários"),
                comRegra(DTOS_DE_ENTRADA, "Validação de entrada", "Pydantic ou serializers", "Testes unitários")));
        t.put("TESTING_TRATADOR_DE_ERROS", dupla(
                habilidades("Tratamento de erros", "Middleware", "Respostas de erro"),
                habilidades("Tratamento de erros", "Handlers de exceção", "Respostas de erro")));
        t.put("TESTING_INTEGRACAO_DE_ENDPOINT", dupla(
                habilidades("Testes de integração", "API REST", "Banco de dados"),
                habilidades("Testes de integração", "API REST", "Banco de dados")));
        t.put("TESTING_FORMATO_DA_RESPOSTA", dupla(
                habilidades("JSON", "Testes de contrato", "Asserções"),
                habilidades("JSON", "Testes de contrato", "pytest")));
        t.put("TESTING_PARAMETRIZADO", dupla(
                habilidades("Testes parametrizados", "Jest ou Vitest", "Regras de negócio"),
                habilidades("Testes parametrizados", "pytest", "Regras de negócio")));

        // Feature
        t.put("FEATURE_PAGINACAO", dupla(
                habilidades("Paginação", "Query params", "API REST"),
                habilidades("Paginação", "Query params", "API REST")));
        t.put("FEATURE_FILTRO_OPCIONAL", dupla(
                habilidades("Query params", "Filtros", "API REST"),
                habilidades("Query params", "Filtros", "API REST")));
        t.put("FEATURE_ORDENACAO", dupla(
                habilidades("Ordenação", "Query params", "API REST"),
                habilidades("Ordenação", "Query params", "API REST")));
        t.put("FEATURE_ATUALIZACAO_COMPLETA", dupla(
                habilidades("PUT", "API REST", "Persistência"),
                habilidades("PUT", "API REST", "Persistência")));
        t.put("FEATURE_EXCLUSAO_LOGICA", dupla(
                habilidades("ORM", "Exclusão lógica", "Modelagem"),
                habilidades("ORM", "Exclusão lógica", "Modelagem")));
        t.put("FEATURE_VALIDACAO_DE_ENTRADA", dupla(
                comRegra(DTOS_DE_ENTRADA, "Validação de entrada", "Schemas", "Mensagens de erro"),
                comRegra(DTOS_DE_ENTRADA, "Validação de entrada", "Pydantic ou serializers", "Mensagens de erro")));
        t.put("FEATURE_DTO_DE_RESPOSTA", dupla(
                comRegra(ENTIDADES_SEM_DTO_DE_RESPOSTA, "DTOs", "Mapeamento", "Encapsulamento"),
                comRegra(ENTIDADES_SEM_DTO_DE_RESPOSTA, "Schemas de resposta", "Mapeamento", "Encapsulamento")));
        t.put("FEATURE_CAMPOS_DE_AUDITORIA", dupla(
                habilidades("ORM", "Auditoria", "Migrations"),
                habilidades("ORM", "Auditoria", "Migrations")));
        t.put("FEATURE_CACHE_DE_CONSULTA", dupla(
                habilidades("Cache", "Redis", "Expiração de cache"),
                habilidades("Cache", "Redis", "Expiração de cache")));
        t.put("FEATURE_CONTAGEM_DO_RECURSO", dupla(
                habilidades("Agregações", "Banco de dados", "API REST"),
                habilidades("Agregações", "Banco de dados", "API REST")));

        // Bug
        t.put("BUG_NAO_ENCONTRADO_RETORNA_500", dupla(
                habilidades("Tratamento de erros", "HTTP 404", "Depuração"),
                habilidades("Tratamento de exceções", "HTTP 404", "Depuração")));
        t.put("BUG_DADO_INVALIDO_ACEITO", dupla(
                habilidades("Validação de entrada", "Schemas", "Depuração"),
                habilidades("Validação de entrada", "Pydantic ou serializers", "Depuração")));
        t.put("BUG_ERRO_SEM_TRATAMENTO", dupla(
                habilidades("Middleware de erros", "Tratamento de erros", "Respostas de erro"),
                habilidades("Handlers de exceção", "Tratamento de erros", "Respostas de erro")));
        t.put("BUG_ATUALIZACAO_ZERA_CAMPOS", dupla(
                habilidades("Atualização de dados", "ORM", "Depuração"),
                habilidades("Atualização de dados", "ORM", "Depuração")));
        t.put("BUG_EXCLUSAO_DE_INEXISTENTE", dupla(
                habilidades("Tratamento de erros", "HTTP 404", "Idempotência"),
                habilidades("Tratamento de exceções", "HTTP 404", "Idempotência")));
        t.put("BUG_NULO_EM_CAMPO_OPCIONAL", dupla(
                habilidades("undefined e null", "Tipos opcionais", "Depuração"),
                habilidades("None", "Valores opcionais", "Depuração")));
        t.put("BUG_TRANSACAO_AUSENTE", dupla(
                habilidades("Transações", "Consistência de dados", "Banco de dados"),
                habilidades("Transações", "Consistência de dados", "Banco de dados")));
        t.put("BUG_CONSULTAS_EXCESSIVAS", dupla(
                habilidades("ORM", "Desempenho", "Consultas N+1"),
                habilidades("ORM", "Desempenho", "Consultas N+1")));
        return Map.copyOf(t);
    }

    private static Map<FamiliaDeLinguagem, Variante> dupla(Variante node, Variante python) {
        return Map.of(FamiliaDeLinguagem.NODE, node, FamiliaDeLinguagem.PYTHON, python);
    }

    private static boolean ehDtoDeEntrada(String nome) {
        return SUFIXOS_DE_ENTRADA.stream().anyMatch(nome::endsWith)
                || PREFIXOS_DE_ENTRADA.stream().anyMatch(nome::startsWith);
    }

    private static List<String> entidadesSemDtoDeResposta(ContextoProjeto contexto) {
        return contexto.componentes().entidades().stream()
                .filter(entidade -> {
                    String base = semSufixoDeEntidade(entidade);
                    return contexto.componentes().dtos().stream()
                            .noneMatch(dto -> dto.startsWith(base) && !ehDtoDeEntrada(dto));
                })
                .toList();
    }

    private static String semSufixoDeEntidade(String nome) {
        for (String sufixo : SUFIXOS_DE_ENTIDADE) {
            if (nome.endsWith(sufixo) && nome.length() > sufixo.length()) {
                return nome.substring(0, nome.length() - sufixo.length());
            }
        }
        return nome;
    }
}
