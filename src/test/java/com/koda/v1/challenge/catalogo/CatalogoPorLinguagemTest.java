package com.koda.v1.challenge.catalogo;

import com.koda.v1.analyzer.contexto.Arquitetura;
import com.koda.v1.analyzer.contexto.ComponentesContexto;
import com.koda.v1.analyzer.contexto.ContextoProjeto;
import com.koda.v1.analyzer.contexto.EndpointContexto;
import com.koda.v1.analyzer.contexto.InfraContexto;
import com.koda.v1.analyzer.contexto.TestesContexto;
import com.koda.v1.analyzer.detector.Tecnologia;
import com.koda.v1.analyzer.ecossistema.Linguagem;
import com.koda.v1.challenge.TipoDesafio;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.regex.Pattern;

import static org.assertj.core.api.Assertions.assertThat;

class CatalogoPorLinguagemTest {

    private static final Pattern TERMO_DE_JAVA = Pattern.compile(
            "Spring|JPA|JUnit|Mockito|MockMvc|Bean Validation|NullPointer|ControllerAdvice|DataJpaTest|AssertJ"
                    + "|\\bOptional\\b|SpringBootTest|jsonPath");

    private final CatalogoAngulos catalogo = new CatalogoAngulos();

    private ContextoProjeto contexto(Linguagem linguagem, String framework, ComponentesContexto componentes,
                                     TestesContexto testes, List<EndpointContexto> endpoints) {
        return new ContextoProjeto(ContextoProjeto.VERSAO_ESQUEMA, linguagem, framework, null, null, "npm",
                Arquitetura.EM_CAMADAS, List.of(), List.of(Tecnologia.REDIS, Tecnologia.RABBITMQ), List.of(),
                endpoints, componentes, testes, new InfraContexto(false, false), false, false, 0);
    }

    private ContextoProjeto rico(Linguagem linguagem) {
        ComponentesContexto componentes = new ComponentesContexto(
                List.of("UsersController"), List.of("UsersService"), List.of("UsersRepository"),
                List.of("UserEntity", "OrderEntity"),
                List.of("CreateUserDto", "UserResponseDto", "UpdateUserDto"), List.of("UserNotFoundException"), true);
        TestesContexto testes = new TestesContexto(0, List.of("UsersService"), List.of("UsersController"));
        List<EndpointContexto> endpoints = List.of(
                new EndpointContexto("GET", "/users", "UsersController"),
                new EndpointContexto("GET", "/users/{id}", "UsersController"),
                new EndpointContexto("POST", "/users", "UsersController"),
                new EndpointContexto("PUT", "/users/{id}", "UsersController"),
                new EndpointContexto("DELETE", "/users/{id}", "UsersController"));
        return contexto(linguagem, "NestJS", componentes, testes, endpoints);
    }

    @Test
    void naoDeveCitarTermosDeJavaEmProjetosNodeNemPython() {
        for (Linguagem linguagem : List.of(Linguagem.TYPESCRIPT, Linguagem.JAVASCRIPT, Linguagem.PYTHON)) {
            for (AnguloDesafio angulo : catalogo.todos()) {
                AnguloDesafio adaptado = angulo.para(linguagem);
                String texto = adaptado.nome() + " " + adaptado.instrucao() + " " + String.join(" ", adaptado.habilidades());

                assertThat(TERMO_DE_JAVA.matcher(texto).find())
                        .as("%s em %s: %s", angulo.id(), linguagem, texto)
                        .isFalse();
            }
        }
    }

    @Test
    void deveManterOMesmoIdEOMesmoTipoEmTodasAsLinguagens() {
        for (AnguloDesafio angulo : catalogo.todos()) {
            for (Linguagem linguagem : Linguagem.values()) {
                AnguloDesafio adaptado = angulo.para(linguagem);

                assertThat(adaptado.id()).isEqualTo(angulo.id());
                assertThat(adaptado.tipo()).isEqualTo(angulo.tipo());
                assertThat(adaptado.habilidades()).isNotEmpty();
            }
        }
    }

    @Test
    void javaDeveContinuarComOTextoOriginal() {
        AnguloDesafio original = catalogo.porId("TESTING_CONTROLLER_COM_MOCKMVC").orElseThrow();

        assertThat(original.para(Linguagem.JAVA)).isSameAs(original);
        assertThat(original.nome()).contains("MockMvc");
        assertThat(original.para(Linguagem.TYPESCRIPT).nome()).doesNotContain("MockMvc");
        assertThat(original.para(Linguagem.PYTHON).habilidades()).contains("pytest");
        assertThat(original.para(Linguagem.TYPESCRIPT).habilidades()).contains("Supertest");
    }

    @Test
    void deveHerdarOTextoQuandoOAnguloNaoTemVariante() {
        AnguloDesafio criacao = catalogo.porId("FEATURE_CRIACAO").orElseThrow();

        assertThat(criacao.para(Linguagem.PYTHON)).isSameAs(criacao);
    }

    @Test
    void deveBuscarOAnguloJaAdaptadoPelaLinguagem() {
        assertThat(catalogo.porId("TESTING_PARAMETRIZADO", Linguagem.PYTHON).orElseThrow().habilidades())
                .contains("pytest");
        assertThat(catalogo.porId("NAO_EXISTE", Linguagem.PYTHON)).isEmpty();
    }

    @Test
    void deveOferecerAnguloDeCadaTipoParaProjetoNode() {
        ContextoProjeto contexto = rico(Linguagem.TYPESCRIPT);

        for (TipoDesafio tipo : TipoDesafio.values()) {
            assertThat(catalogo.aplicaveis(contexto, tipo)).as(tipo.name()).isNotEmpty();
        }
    }

    @Test
    void deveEscolherComoAlvoSoDtoDeEntradaNaValidacao() {
        AnguloDesafio validacao = catalogo.porId("TESTING_VALIDACAO_DE_ENTRADA").orElseThrow();

        List<AlvoDesafio> alvos = validacao.alvosEm(rico(Linguagem.TYPESCRIPT));

        assertThat(alvos).extracting(AlvoDesafio::nome).containsExactly("CreateUserDto", "UpdateUserDto");
        assertThat(validacao.alvosEm(rico(Linguagem.JAVA))).isEmpty();
    }

    @Test
    void deveIndicarEntidadesSemDtoDeRespostaIgnorandoOSufixoDaEntidade() {
        AnguloDesafio dto = catalogo.porId("FEATURE_DTO_DE_RESPOSTA").orElseThrow();

        List<AlvoDesafio> alvos = dto.alvosEm(rico(Linguagem.TYPESCRIPT));

        assertThat(alvos).extracting(AlvoDesafio::nome).containsExactly("OrderEntity");
    }

    @Test
    void deveTratarEntidadeSemSufixoConhecido() {
        ComponentesContexto componentes = new ComponentesContexto(
                List.of(), List.of(), List.of(), List.of("User", "Item"), List.of("UserRead", "UserCreate"),
                List.of(), false);
        ContextoProjeto contexto = contexto(Linguagem.PYTHON, "FastAPI", componentes,
                new TestesContexto(0, List.of(), List.of()), List.of());

        List<AlvoDesafio> alvos = catalogo.porId("FEATURE_DTO_DE_RESPOSTA").orElseThrow().alvosEm(contexto);

        assertThat(alvos).extracting(AlvoDesafio::nome).containsExactly("Item");
    }
}
