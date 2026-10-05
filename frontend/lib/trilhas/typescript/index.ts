import type { Trilha } from "../tipos";
import { TS_CHECKPOINT_1 } from "./checkpoint-1";
import { TS_MODULO_1 } from "./modulo-1-tipos-funcoes-modulos";
import { TS_MODULO_2 } from "./modulo-2-assincrono";
import { TS_MODULO_3 } from "./modulo-3-classes-modulos-projeto";
import { TS_MODULO_4 } from "./modulo-4-api-com-express";
import { TS_MODULO_5 } from "./modulo-5-validacao-com-zod";
import { TS_MODULO_6 } from "./modulo-6-testes-com-vitest";

export const TRILHA_TYPESCRIPT: Trilha = {
  slug: "typescript",
  grupo: "linguagem",
  titulo: "TypeScript e Node do zero ao backend",
  descricao: "Da linguagem e do sistema de tipos até uma API em Node com validação, banco de dados, testes e segurança.",
  publico: "Para quem está começando ou vem de outra linguagem. Basta saber usar um terminal e ter o Node instalado.",
  etapas: [
    {
      titulo: "A linguagem e o modelo do Node",
      descricao: "TypeScript essencial e o modelo assíncrono que define como o Node funciona.",
      itens: [TS_MODULO_1, TS_MODULO_2, TS_CHECKPOINT_1],
    },
    {
      titulo: "Organização de um projeto",
      descricao: "Classes, contratos, módulos e a estrutura de um projeto Node com npm.",
      itens: [TS_MODULO_3],
    },
    {
      titulo: "APIs HTTP",
      descricao: "Da primeira rota às camadas e ao tratamento de erros de uma API em Node.",
      itens: [TS_MODULO_4, TS_MODULO_5, TS_MODULO_6],
    },
  ],
  planejados: [
    { titulo: "Banco de dados com Prisma", resumo: "Modelagem, migrações, consultas e transações." },
    { titulo: "Autenticação e autorização", resumo: "Sessões, tokens e controle de acesso em uma API Node." },
    { titulo: "NestJS: estrutura para projetos grandes", resumo: "Módulos, injeção de dependência e decoradores." },
    { titulo: "Publicando: variáveis de ambiente, logs e Docker", resumo: "Configuração segura e empacotamento." },
  ],
};
