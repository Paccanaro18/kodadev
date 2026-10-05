import type { Checkpoint } from "../tipos";

export const PY_CHECKPOINT_2: Checkpoint = {
  tipo: "checkpoint",
  slug: "checkpoint-estilo-apis-e-dados",
  titulo: "Checkpoint: Python idiomático, APIs e dados",
  resumo: "Nove questões sobre geradores e decoradores, tipagem, FastAPI, pytest e SQLAlchemy.",
  cobre: [
    "funcional-e-iteradores",
    "tipagem-e-qualidade",
    "api-com-fastapi-e-pydantic",
    "testes-com-pytest",
    "banco-de-dados-com-sqlalchemy",
  ],
  notaMinima: 0.7,
  questoes: [
    {
      enunciado: "O que acontece com o código abaixo?\n\ngen = (n for n in range(3))\nprint(list(gen))\nprint(list(gen))",
      opcoes: ["Imprime [0, 1, 2] duas vezes", "Lança StopIteration", "Imprime [0, 1, 2] e depois []", "Imprime [] duas vezes"],
      correta: 2,
      explicacao: "Um gerador é um iterador e se esgota: depois de consumido pela primeira chamada de list, a segunda recebe uma lista vazia, sem erro.",
    },
    {
      enunciado: "Para que serve functools.wraps ao escrever um decorador?",
      opcoes: ["Para acelerar a função decorada", "Para preservar o nome e a documentação da função original", "Para permitir decorar classes", "Para impedir chamadas repetidas"],
      correta: 1,
      explicacao: "Sem wraps, a função devolvida pelo decorador assume o nome e a documentação da função interna. Com ele, ferramentas e mensagens continuam mostrando os da original.",
    },
    {
      enunciado: "O que significa a anotação str | None em um retorno?",
      opcoes: ["Um texto ou a ausência de valor, e quem usa deve tratar o None", "Sempre um texto vazio", "Uma lista de textos", "Que o Python converterá o valor automaticamente"],
      correta: 0,
      explicacao: "O | significa \"ou\". O mypy exige tratar o caso None antes de usar métodos de str, o que previne erros de atributo em tempo de execução.",
    },
    {
      enunciado: "O interpretador do Python verifica os type hints ao executar uma função?",
      opcoes: ["Não: quem verifica é uma ferramenta externa, como o mypy", "Sim, e lança TypeError se não baterem", "Só quando a função é async", "Só em modo de depuração"],
      correta: 0,
      explicacao: "Os type hints são ignorados na execução. Verificadores como o mypy os conferem antes de rodar, por isso devem fazer parte do CI.",
    },
    {
      enunciado: "O que o FastAPI responde quando o corpo de uma requisição não passa na validação do modelo Pydantic?",
      opcoes: ["500, com a pilha de erro", "422, com a lista dos erros de validação, sem executar a rota", "200 com um aviso", "404"],
      correta: 1,
      explicacao: "A validação acontece antes da rota. Se falhar, o FastAPI devolve 422 com a descrição de cada erro, e a função nem executa.",
    },
    {
      enunciado: "Por que usar response_model em uma rota que devolve usuários?",
      opcoes: ["Para a API rodar mais rápido", "Para validar o corpo da requisição", "Para criar o banco", "Para filtrar a saída e evitar que campos internos, como a senha, vazem"],
      correta: 3,
      explicacao: "A resposta é filtrada pelo modelo declarado: campos fora dele não são enviados, o que protege contra vazamentos acidentais.",
    },
    {
      enunciado: "Em um teste, a dependência do repositório foi substituída por lambda: Repositorio(). O que acontece quando o teste cria uma tarefa e depois a busca?",
      opcoes: ["Funciona, porque o repositório é compartilhado", "Falha, porque cada requisição recebe um repositório novo e vazio", "O FastAPI lança um erro de sintaxe", "O repositório é criado só uma vez"],
      correta: 1,
      explicacao: "A função de substituição é chamada a cada requisição. Para manter o estado entre as chamadas de um teste, crie a instância fora e devolva sempre a mesma.",
    },
    {
      enunciado: "Qual a diferença entre flush e commit na Session do SQLAlchemy?",
      opcoes: ["Nenhuma", "O commit só funciona em SQLite", "O flush envia o SQL dentro da transação, ainda desfazível; o commit a torna definitiva", "O flush apaga as tabelas"],
      correta: 2,
      explicacao: "Depois do flush, o banco já executou os comandos, mas um rollback ainda os desfaz. Só o commit confirma a transação.",
    },
    {
      enunciado: "Uma tela lista 100 autores e acessa os livros de cada um em um laço, gerando 101 consultas. Como se chama o problema e qual a correção?",
      opcoes: ["Deadlock; aumentar o pool de conexões", "N+1 consultas; carregar a relação com antecedência (selectinload ou joinedload)", "Injeção de SQL; usar f-strings", "Vazamento de memória; reiniciar o servidor"],
      correta: 1,
      explicacao: "Com carregamento preguiçoso, cada acesso à relação gera uma consulta. Estratégias como o selectinload trazem as relações em uma ou duas consultas.",
    },
  ],
};
