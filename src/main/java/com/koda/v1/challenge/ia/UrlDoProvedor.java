package com.koda.v1.challenge.ia;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.Set;

final class UrlDoProvedor {

    private static final Set<String> HOSTS_LOCAIS = Set.of("localhost", "127.0.0.1", "[::1]");

    private UrlDoProvedor() {
    }

    static URI validar(String url) {
        if (url == null || url.isBlank()) {
            throw new IllegalArgumentException("A URL do provedor de IA é obrigatória.");
        }

        URI uri;
        try {
            uri = new URI(url.trim());
        } catch (URISyntaxException e) {
            throw new IllegalArgumentException("A URL do provedor de IA é inválida.");
        }

        String esquema = uri.getScheme();
        String host = uri.getHost();
        if (esquema == null || host == null) {
            throw new IllegalArgumentException("A URL do provedor de IA deve ser absoluta.");
        }
        if (uri.getRawUserInfo() != null || uri.getRawQuery() != null || uri.getRawFragment() != null) {
            throw new IllegalArgumentException("A URL do provedor de IA não pode ter credenciais, consulta nem fragmento.");
        }

        boolean seguro = esquema.equalsIgnoreCase("https");
        boolean local = esquema.equalsIgnoreCase("http") && HOSTS_LOCAIS.contains(host.toLowerCase());
        if (!seguro && !local) {
            throw new IllegalArgumentException("A URL do provedor de IA deve usar https, ou http só em localhost.");
        }
        return uri;
    }
}
