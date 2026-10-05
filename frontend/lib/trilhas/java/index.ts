import type { Trilha } from "../tipos";
import { JAVA_CHECKPOINT_1 } from "./checkpoint-1";
import { JAVA_MODULO_1 } from "./modulo-1-primeiros-passos";
import { JAVA_MODULO_2 } from "./modulo-2-fluxo-metodos-arrays";
import { JAVA_MODULO_3 } from "./modulo-3-orientacao-a-objetos";
import { JAVA_MODULO_4 } from "./modulo-4-heranca-interfaces-polimorfismo";
import { JAVA_MODULO_5 } from "./modulo-5-colecoes-generics-optional";

export const TRILHA_JAVA: Trilha = {
  slug: "java",
  grupo: "linguagem",
  titulo: "Java do zero ao backend",
  descricao: "Da primeira linha de código até uma API REST com Spring Boot, banco de dados, testes e segurança.",
  publico: "Para quem nunca programou ou vem de outra linguagem. Basta saber usar um terminal.",
  etapas: [
    {
      titulo: "Fundamentos da linguagem",
      descricao: "A base de tudo: como o Java funciona, os tipos, o fluxo do programa, métodos e arrays.",
      itens: [JAVA_MODULO_1, JAVA_MODULO_2, JAVA_CHECKPOINT_1],
    },
    {
      titulo: "Orientação a objetos",
      descricao: "Modelar o domínio com classes, proteger o estado e escolher bem entre classe, record e enum.",
      itens: [JAVA_MODULO_3, JAVA_MODULO_4, JAVA_MODULO_5],
    },
  ],
  planejados: [
    { titulo: "Exceções e tratamento de erros", resumo: "Erros previstos e imprevistos, try/catch e exceções próprias." },
    { titulo: "Streams e expressões lambda", resumo: "Processar dados de forma declarativa." },
    { titulo: "Maven e a estrutura de um projeto", resumo: "Dependências, ciclo de build e organização de pacotes." },
    { titulo: "Spring Boot: injeção de dependência e a primeira API", resumo: "Controllers, services, repositories e configuração." },
    { titulo: "Persistência com JPA e Hibernate", resumo: "Entidades, relacionamentos, transações e o problema do N+1." },
    { titulo: "Testes: JUnit, Mockito e testes de integração", resumo: "Como testar com confiança." },
    { titulo: "Segurança com Spring Security", resumo: "Autenticação, autorização e as proteções que já vêm prontas." },
  ],
};
