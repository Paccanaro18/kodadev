package com.koda.v1.analyzer.ecossistema.python;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class PapelNoPythonTest {

    @Test
    void deveReconhecerOPapelPeloNomeDoArquivo() {
        assertThat(PapelNoPython.de("app/routers.py")).isEqualTo(PapelNoPython.CONTROLLER);
        assertThat(PapelNoPython.de("app/pedido_router.py")).isEqualTo(PapelNoPython.CONTROLLER);
        assertThat(PapelNoPython.de("loja/views.py")).isEqualTo(PapelNoPython.CONTROLLER);
        assertThat(PapelNoPython.de("loja/urls.py")).isEqualTo(PapelNoPython.CONTROLLER);
        assertThat(PapelNoPython.de("app/pedido_service.py")).isEqualTo(PapelNoPython.SERVICE);
        assertThat(PapelNoPython.de("app/services.py")).isEqualTo(PapelNoPython.SERVICE);
        assertThat(PapelNoPython.de("app/pedido_repository.py")).isEqualTo(PapelNoPython.REPOSITORY);
        assertThat(PapelNoPython.de("app/crud.py")).isEqualTo(PapelNoPython.REPOSITORY);
        assertThat(PapelNoPython.de("app/models.py")).isEqualTo(PapelNoPython.MODELO);
        assertThat(PapelNoPython.de("app/pedido_model.py")).isEqualTo(PapelNoPython.MODELO);
        assertThat(PapelNoPython.de("app/schemas.py")).isEqualTo(PapelNoPython.SCHEMA);
        assertThat(PapelNoPython.de("app/pedido_schema.py")).isEqualTo(PapelNoPython.SCHEMA);
        assertThat(PapelNoPython.de("app/exceptions.py")).isEqualTo(PapelNoPython.EXCECAO);
        assertThat(PapelNoPython.de("app/domain_errors.py")).isEqualTo(PapelNoPython.EXCECAO);
        assertThat(PapelNoPython.de("app/main.py")).isEqualTo(PapelNoPython.OUTRO);
    }

    @Test
    void deveReconhecerOPapelPelaPastaQuandoONomeNaoDiz() {
        assertThat(PapelNoPython.de("app/routers/pedidos.py")).isEqualTo(PapelNoPython.CONTROLLER);
        assertThat(PapelNoPython.de("app/services/pedidos.py")).isEqualTo(PapelNoPython.SERVICE);
        assertThat(PapelNoPython.de("app/repositories/pedidos.py")).isEqualTo(PapelNoPython.REPOSITORY);
        assertThat(PapelNoPython.de("app/models/pedido.py")).isEqualTo(PapelNoPython.MODELO);
        assertThat(PapelNoPython.de("app/schemas/pedido.py")).isEqualTo(PapelNoPython.SCHEMA);
        assertThat(PapelNoPython.de("app/exceptions/pedido.py")).isEqualTo(PapelNoPython.EXCECAO);
        assertThat(PapelNoPython.de("solto.py")).isEqualTo(PapelNoPython.OUTRO);
    }

    @Test
    void oNomeDoArquivoDeveVencerAPasta() {
        assertThat(PapelNoPython.de("app/api/schemas.py")).isEqualTo(PapelNoPython.SCHEMA);
        assertThat(PapelNoPython.de("app/models/pedido_service.py")).isEqualTo(PapelNoPython.SERVICE);
    }

    @Test
    void deveTratarClassesDeDentroDoArquivoPeloPapelDoArquivo() {
        ConvencaoPython convencao = ConvencaoPython.INSTANCIA;

        assertThat(convencao.ehDto("app/schemas.py#PedidoCreate")).isTrue();
        assertThat(convencao.ehDto("app/schemas.py")).isFalse();
        assertThat(convencao.ehDto("app/models.py#Pedido")).isFalse();
        assertThat(convencao.ehExcecao("app/exceptions.py#NaoEncontrado")).isTrue();
        assertThat(convencao.ehExcecao("app/exceptions.py")).isFalse();
        assertThat(ConvencaoPython.ehCodigo("app/schemas.py#PedidoCreate")).isTrue();
        assertThat(ConvencaoPython.semClasse("app/x.py#Y")).isEqualTo("app/x.py");
        assertThat(ConvencaoPython.semClasse("app/x.py")).isEqualTo("app/x.py");
    }
}
