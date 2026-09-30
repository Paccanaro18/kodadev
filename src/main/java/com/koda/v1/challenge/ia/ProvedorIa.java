package com.koda.v1.challenge.ia;

import com.koda.v1.challenge.prompt.PromptDesafio;

public interface ProvedorIa {

    RespostaIa gerar(PromptDesafio prompt);
}
