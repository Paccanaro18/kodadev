import type { Trilha } from "../tipos";
import { PY_CHECKPOINT_1 } from "./checkpoint-1";
import { PY_MODULO_1 } from "./modulo-1-fundamentos";
import { PY_MODULO_2 } from "./modulo-2-objetos-excecoes-modulos";
import { PY_MODULO_3 } from "./modulo-3-funcional-iteradores";
import { PY_MODULO_4 } from "./modulo-4-tipagem-qualidade";

export const TRILHA_PYTHON: Trilha = {
  slug: "python",
  titulo: "Python do zero ao backend",
  descricao: "Da linguagem até uma API com FastAPI, banco de dados, testes com pytest e segurança.",
  publico: "Para quem está começando ou vem de outra linguagem. Basta saber usar um terminal e ter o Python instalado.",
  etapas: [
    {
      titulo: "Fundamentos da linguagem",
      descricao: "Tipos, estruturas de dados, funções, objetos, exceções e a organização do código.",
      itens: [PY_MODULO_1, PY_MODULO_2, PY_CHECKPOINT_1],
    },
    {
      titulo: "Python idiomático",
      descricao: "Funções como valores, iteradores, geradores e decoradores: o estilo que aparece no código profissional.",
      itens: [PY_MODULO_3, PY_MODULO_4],
    },
  ],
  planejados: [
    { titulo: "Uma API com FastAPI e Pydantic", resumo: "Rotas, validação, respostas tipadas e injeção de dependências." },
    { titulo: "Testes com pytest", resumo: "Testes unitários, fixtures, parametrização e testes de API." },
    { titulo: "Banco de dados com SQLAlchemy", resumo: "Modelos, consultas, relacionamentos e migrações com Alembic." },
    { titulo: "Programação assíncrona com asyncio", resumo: "async/await, tarefas e concorrência em Python." },
    { titulo: "Segurança em APIs Python", resumo: "Autenticação, autorização e configuração segura." },
    { titulo: "Publicando: Docker, variáveis de ambiente e logs", resumo: "Empacotar e operar uma aplicação Python." },
  ],
};
