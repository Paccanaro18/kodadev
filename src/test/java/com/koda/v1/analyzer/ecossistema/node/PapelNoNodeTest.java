package com.koda.v1.analyzer.ecossistema.node;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class PapelNoNodeTest {

    @Test
    void deveReconhecerOPapelPeloNomeDoArquivo() {
        assertThat(PapelNoNode.de("src/users/users.controller.ts")).isEqualTo(PapelNoNode.CONTROLLER);
        assertThat(PapelNoNode.de("src/users/users.routes.ts")).isEqualTo(PapelNoNode.CONTROLLER);
        assertThat(PapelNoNode.de("src/users/users.router.js")).isEqualTo(PapelNoNode.CONTROLLER);
        assertThat(PapelNoNode.de("src/users/users.service.ts")).isEqualTo(PapelNoNode.SERVICE);
        assertThat(PapelNoNode.de("src/users/users-service.ts")).isEqualTo(PapelNoNode.SERVICE);
        assertThat(PapelNoNode.de("src/users/users.repository.ts")).isEqualTo(PapelNoNode.REPOSITORY);
        assertThat(PapelNoNode.de("src/users/user.repo.ts")).isEqualTo(PapelNoNode.REPOSITORY);
        assertThat(PapelNoNode.de("src/users/user.entity.ts")).isEqualTo(PapelNoNode.ENTIDADE);
        assertThat(PapelNoNode.de("src/users/user.model.ts")).isEqualTo(PapelNoNode.ENTIDADE);
        assertThat(PapelNoNode.de("src/users/user.schema.ts")).isEqualTo(PapelNoNode.ENTIDADE);
        assertThat(PapelNoNode.de("src/users/create-user.dto.ts")).isEqualTo(PapelNoNode.OUTRO);
        assertThat(PapelNoNode.de("src/main.ts")).isEqualTo(PapelNoNode.OUTRO);
    }

    @Test
    void deveReconhecerOPapelPelaPasta() {
        assertThat(PapelNoNode.de("src/routes/users.ts")).isEqualTo(PapelNoNode.CONTROLLER);
        assertThat(PapelNoNode.de("src/controllers/users.ts")).isEqualTo(PapelNoNode.CONTROLLER);
        assertThat(PapelNoNode.de("src/services/users.ts")).isEqualTo(PapelNoNode.SERVICE);
        assertThat(PapelNoNode.de("src/repositories/users.ts")).isEqualTo(PapelNoNode.REPOSITORY);
        assertThat(PapelNoNode.de("src/models/User.ts")).isEqualTo(PapelNoNode.ENTIDADE);
        assertThat(PapelNoNode.de("src/entities/User.ts")).isEqualTo(PapelNoNode.ENTIDADE);
    }

    @Test
    void naoDeveContarOIndexDeUmaPastaComoComponente() {
        assertThat(PapelNoNode.de("src/services/index.ts")).isEqualTo(PapelNoNode.OUTRO);
        assertThat(PapelNoNode.de("src/models/index.ts")).isEqualTo(PapelNoNode.OUTRO);
    }

    @Test
    void deveTratarArquivosDeRotaDoNextComoController() {
        assertThat(PapelNoNode.de("src/app/api/users/route.ts")).isEqualTo(PapelNoNode.CONTROLLER);
        assertThat(PapelNoNode.de("pages/api/users.ts")).isEqualTo(PapelNoNode.CONTROLLER);
    }

    @Test
    void deveNomearAsRotasDoNextPelasPastas() {
        assertThat(ConvencaoNode.INSTANCIA.nome("src/app/api/users/[id]/route.ts")).isEqualTo("ApiUsersIdRoute");
        assertThat(ConvencaoNode.INSTANCIA.nome("prisma/schema.prisma#User")).isEqualTo("User");
    }

    @Test
    void soAPastaQueContemOArquivoDefineOPapel() {
        assertThat(PapelNoNode.de("src/app/routes/article/article.mapper.ts")).isEqualTo(PapelNoNode.OUTRO);
        assertThat(PapelNoNode.de("src/app/routes/article/token.utils.ts")).isEqualTo(PapelNoNode.OUTRO);
        assertThat(PapelNoNode.de("src/app/routes/article/article.model.ts")).isEqualTo(PapelNoNode.ENTIDADE);
    }

    @Test
    void naoDeveTratarModelDeErroOuDeEntradaComoEntidade() {
        assertThat(PapelNoNode.de("src/app/models/http-exception.model.ts")).isEqualTo(PapelNoNode.OUTRO);
        assertThat(PapelNoNode.de("src/auth/register-input.model.ts")).isEqualTo(PapelNoNode.OUTRO);
        assertThat(PapelNoNode.de("src/auth/user-request.model.ts")).isEqualTo(PapelNoNode.OUTRO);
    }

    @Test
    void deveIndicarOndeValeProcurarRotas() {
        assertThat(PapelNoNode.podeTerRotas("src/users/users.controller.ts")).isTrue();
        assertThat(PapelNoNode.podeTerRotas("src/app/routes/article/article.service.ts")).isTrue();
        assertThat(PapelNoNode.podeTerRotas("src/api/v1/health.ts")).isTrue();
        assertThat(PapelNoNode.podeTerRotas("src/app/api/x/route.ts")).isTrue();
        assertThat(PapelNoNode.podeTerRotas("src/utils/format.ts")).isFalse();
        assertThat(PapelNoNode.podeTerRotas("main.ts")).isFalse();
    }
}
