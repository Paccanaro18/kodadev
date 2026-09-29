package com.koda.v1.analyzer.detector;

public record Endpoint(
        String metodoHttp,
        String caminho,
        String controller
) {
}