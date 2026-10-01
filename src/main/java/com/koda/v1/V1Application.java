package com.koda.v1;

import com.koda.v1.shared.VerificadorDeConfiguracao;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class V1Application {

	public static void main(String[] args) {
		SpringApplication aplicacao = new SpringApplication(V1Application.class);
		aplicacao.addInitializers(new VerificadorDeConfiguracao());
		aplicacao.run(args);
	}

}
