package com.koda.v1;

import org.springframework.context.ApplicationContextInitializer;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.core.env.ConfigurableEnvironment;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.regex.Pattern;

/**
 * Garante, antes de qualquer contexto de teste subir, que os testes vão rodar num banco terminado em {@code _test}
 * e que esse banco existe. Assim os testes nunca encostam no banco de desenvolvimento e {@code ./mvnw test} funciona
 * sem nenhum passo manual (só o Postgres precisa estar de pé). Registrado em {@code META-INF/spring.factories}.
 */
public class BancoDeTesteInicializador implements ApplicationContextInitializer<ConfigurableApplicationContext> {

    private static final Pattern URL = Pattern.compile("^(jdbc:postgresql://[^/]+)/([a-z0-9_]+)(\\?.*)?$");
    private static final String SUFIXO_DE_TESTE = "_test";
    private static final AtomicBoolean PRONTO = new AtomicBoolean(false);

    @Override
    public void initialize(ConfigurableApplicationContext contexto) {
        ConfigurableEnvironment ambiente = contexto.getEnvironment();
        String url = ambiente.getProperty("spring.datasource.url", "");
        var encontrado = URL.matcher(url);
        // A trava vale sempre: nenhum contexto de teste sobe apontando para um banco que não seja de teste.
        if (!encontrado.matches() || !encontrado.group(2).endsWith(SUFIXO_DE_TESTE)) {
            throw new IllegalStateException("Os testes só rodam em um banco terminado em '" + SUFIXO_DE_TESTE
                    + "'. A URL configurada não é de um banco de teste.");
        }
        if (PRONTO.get()) {
            return;
        }

        criarSeNaoExistir(encontrado.group(1) + "/postgres", encontrado.group(2),
                ambiente.getProperty("spring.datasource.username", ""),
                ambiente.getProperty("spring.datasource.password", ""));
        PRONTO.set(true);
    }

    private void criarSeNaoExistir(String urlAdministrativa, String banco, String usuario, String senha) {
        try (Connection conexao = DriverManager.getConnection(urlAdministrativa, usuario, senha)) {
            if (existe(conexao, banco)) {
                return;
            }
            try (Statement comando = conexao.createStatement()) {
                // O nome já foi validado pelo padrão da URL (só letras minúsculas, números e '_').
                comando.execute("CREATE DATABASE " + banco);
            }
        } catch (SQLException e) {
            throw new IllegalStateException(
                    "Não foi possível preparar o banco de teste '" + banco + "'. O Postgres está de pé? "
                            + "Suba com: docker compose up -d", e);
        }
    }

    private boolean existe(Connection conexao, String banco) throws SQLException {
        try (PreparedStatement consulta = conexao.prepareStatement("SELECT 1 FROM pg_database WHERE datname = ?")) {
            consulta.setString(1, banco);
            try (ResultSet resultado = consulta.executeQuery()) {
                return resultado.next();
            }
        }
    }
}
