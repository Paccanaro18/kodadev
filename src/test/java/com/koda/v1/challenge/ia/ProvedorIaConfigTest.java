package com.koda.v1.challenge.ia;

import org.junit.jupiter.api.Test;
import org.springframework.boot.convert.ApplicationConversionService;
import org.springframework.boot.test.context.runner.ApplicationContextRunner;

import static org.assertj.core.api.Assertions.assertThat;

class ProvedorIaConfigTest {

    private final ApplicationContextRunner contexto = new ApplicationContextRunner()
            .withInitializer(contextoDaAplicacao -> contextoDaAplicacao.getBeanFactory()
                    .setConversionService(ApplicationConversionService.getSharedInstance()))
            .withUserConfiguration(ProvedorIaConfig.class);

    @Test
    void deveUsarOProvedorFalsoPorPadraoSemNenhumSegredo() {
        contexto.run(ctx -> {
            assertThat(ctx).hasSingleBean(ProvedorIa.class);
            assertThat(ctx.getBean(ProvedorIa.class)).isInstanceOf(ProvedorIaFalso.class);
        });
    }

    @Test
    void deveUsarOProvedorFalsoQuandoPedidoExplicitamente() {
        contexto.withPropertyValues("koda.ia.provedor=falso").run(ctx ->
                assertThat(ctx.getBean(ProvedorIa.class)).isInstanceOf(ProvedorIaFalso.class));
    }

    @Test
    void deveCriarOProvedorCompativelQuandoConfigurado() {
        contexto.withPropertyValues(
                "koda.ia.provedor=openai",
                "koda.ia.url=http://localhost:3001/v1",
                "koda.ia.chave=freellmapi-de-teste",
                "koda.ia.modelo=auto").run(ctx -> {
            assertThat(ctx).hasNotFailed();
            assertThat(ctx.getBean(ProvedorIa.class)).isInstanceOf(ProvedorIaCompativelComOpenAi.class);
        });
    }

    @Test
    void deveRecusarSubirSemModeloOuComUrlInsegura() {
        contexto.withPropertyValues("koda.ia.provedor=openai", "koda.ia.url=http://localhost:3001/v1")
                .run(ctx -> assertThat(ctx).hasFailed());
        contexto.withPropertyValues("koda.ia.provedor=openai", "koda.ia.url=http://exemplo.com/v1", "koda.ia.modelo=auto")
                .run(ctx -> assertThat(ctx).hasFailed());
        contexto.withPropertyValues("koda.ia.provedor=openai", "koda.ia.modelo=auto")
                .run(ctx -> assertThat(ctx).hasFailed());
    }

    @Test
    void naoDeveCriarProvedorQuandoOValorDaPropriedadeNaoEConhecido() {
        contexto.withPropertyValues("koda.ia.provedor=outro").run(ctx ->
                assertThat(ctx).doesNotHaveBean(ProvedorIa.class));
    }
}
