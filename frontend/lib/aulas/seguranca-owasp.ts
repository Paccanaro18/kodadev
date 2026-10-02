import type { Aula } from "./tipos";

export const AULA_OWASP: Aula = {
  slug: "seguranca-de-aplicacoes-owasp-top-10",
  titulo: "Segurança de aplicações: o OWASP Top 10 explicado para quem está começando",
  resumo: "O modelo mental, as dez categorias de falha mais comuns e um endpoint vulnerável corrigido passo a passo.",
  trilha: "seguranca",
  nivel: "Iniciante",
  leitura: "18 min",
  preRequisitos: [
    "Saber o que é uma API e uma requisição HTTP.",
    "Ter lido um trecho de código de backend, em qualquer linguagem.",
  ],
  pontosChave: [
    "Segurança não é um recurso que se acrescenta no fim: é uma propriedade do jeito como o código é escrito.",
    "Toda entrada vinda de fora é não confiável até ser validada, e toda permissão precisa ser conferida no servidor.",
    "O OWASP Top 10 é um mapa das falhas mais frequentes, e quase todas se evitam com hábitos simples.",
    "Defesa em profundidade: nunca dependa de uma única proteção.",
    "Só teste segurança em sistemas seus ou com autorização por escrito.",
  ],
  blocos: [
    { tipo: "p", texto: "Quando alguém começa a programar, o foco é fazer funcionar. Segurança entra na conversa depois, geralmente depois de um susto. Este artigo propõe o caminho inverso: aprender, desde cedo, o pequeno conjunto de ideias que evita a maior parte dos problemas reais." },
    { tipo: "p", texto: "Não é preciso ser especialista em segurança para escrever código mais seguro. É preciso saber onde os problemas costumam aparecer e criar o hábito de perguntar, a cada rota nova: quem pode chamar isso, o que acontece se alguém mandar um dado inesperado e o que eu estou revelando na resposta?" },

    { tipo: "h", texto: "O que é o OWASP e o que é o Top 10" },
    { tipo: "p", texto: "O OWASP (Open Worldwide Application Security Project) é uma fundação sem fins lucrativos que publica material gratuito sobre segurança de software. O projeto mais conhecido é o OWASP Top 10, uma lista das categorias de risco mais comuns em aplicações web, montada a partir de dados reais de empresas e de pesquisadores." },
    { tipo: "alerta", titulo: "A lista muda com o tempo", texto: "O Top 10 é revisado de tempos em tempos, e categorias são renomeadas, juntadas ou trocadas de posição. Este artigo usa como base a edição de 2021, que é a mais citada em materiais e entrevistas. Antes de decorar números, abra o site do OWASP e confira a edição vigente: o que importa é entender cada ideia, não a posição na lista." },
    { tipo: "p", texto: "Existe também o OWASP API Security Top 10, específico para APIs, que dá ainda mais peso a problemas de autorização. Vale a leitura para quem trabalha com backend." },

    { tipo: "h", texto: "O modelo mental: o que estamos protegendo" },
    { tipo: "p", texto: "Quase toda discussão de segurança gira em torno de três propriedades, conhecidas pela sigla CIA em inglês:" },
    { tipo: "lista", itens: [
      "Confidencialidade: só quem pode ver o dado, vê. Exemplo de falha: um usuário lê o pedido de outro.",
      "Integridade: o dado só muda do jeito permitido. Exemplo de falha: alguém altera o preço de um item na requisição.",
      "Disponibilidade: o sistema continua respondendo. Exemplo de falha: uma rota sem limite que derruba o servidor quando chamada milhares de vezes.",
    ] },
    { tipo: "h3", texto: "Princípios que valem em qualquer linguagem" },
    { tipo: "lista", itens: [
      "Nunca confie na entrada. Corpo, parâmetros, cabeçalhos, cookies, arquivos enviados e até dados vindos de outro sistema devem ser tratados como não confiáveis.",
      "Menor privilégio. Cada usuário, serviço e credencial deve poder fazer só o necessário. Um usuário de banco da aplicação não precisa de permissão para apagar tabelas.",
      "Negar por padrão. Se nada diz que o acesso é permitido, ele é negado. Uma rota nova nasce protegida.",
      "Defesa em profundidade. Várias camadas independentes: se uma falhar, outra segura. Validação, autorização, consulta parametrizada e permissões mínimas no banco se complementam.",
      "Falhar de forma segura. Diante de um erro, o sistema deve recusar, não liberar. E o erro não pode revelar detalhes internos.",
      "Simplicidade. Quanto mais código e mais dependências, maior a superfície de ataque.",
    ] },
    { tipo: "p", texto: "A superfície de ataque é o conjunto de pontos por onde alguém de fora consegue interagir com o sistema: rotas, formulários, uploads, integrações, painéis de administração. Reduzi-la, removendo o que não é usado, é uma das formas mais baratas de ganhar segurança." },

    { tipo: "h", texto: "As dez categorias, uma a uma" },
    { tipo: "p", texto: "A tabela resume cada categoria. Depois dela, cada uma ganha uma explicação com um cenário." },
    { tipo: "tabela", legenda: "OWASP Top 10, edição 2021", cabecalho: ["Categoria", "Em uma frase", "Como evitar, em resumo"], linhas: [
      ["A01 Controle de acesso quebrado", "Alguém acessa o que não deveria.", "Conferir a permissão no servidor, em toda requisição."],
      ["A02 Falhas criptográficas", "Dado sensível exposto por falta ou erro de criptografia.", "HTTPS, algoritmos modernos, senhas com hash lento."],
      ["A03 Injeção", "Dado do usuário interpretado como comando.", "Consultas parametrizadas e validação."],
      ["A04 Design inseguro", "A falha está no projeto, não no código.", "Pensar nas ameaças antes de construir."],
      ["A05 Configuração incorreta", "Padrões inseguros, painéis abertos, detalhes demais nos erros.", "Configuração mínima e revisada por ambiente."],
      ["A06 Componentes vulneráveis", "Biblioteca desatualizada com falha conhecida.", "Inventário e atualização das dependências."],
      ["A07 Falhas de identificação e autenticação", "Login fraco, sessão mal protegida.", "Senhas bem guardadas, MFA, limite de tentativas."],
      ["A08 Falhas de integridade de software e dados", "Código ou dados que mudam sem verificação.", "Verificar origem de pacotes e de atualizações."],
      ["A09 Falhas de registro e monitoramento", "Ninguém percebe o ataque.", "Registrar eventos de segurança e alertar."],
      ["A10 Falsificação de requisição no servidor (SSRF)", "O servidor é induzido a chamar endereços internos.", "Lista de destinos permitidos."],
    ] },

    { tipo: "h3", texto: "A01 · Controle de acesso quebrado" },
    { tipo: "p", texto: "A categoria mais frequente. Um usuário logado troca o número na URL, de /pedidos/10 para /pedidos/11, e vê o pedido de outra pessoa. O sistema sabia quem era o usuário, mas não conferiu se aquele pedido era dele. Esse padrão tem nome: referência direta insegura a objeto (IDOR), ou BOLA no vocabulário de APIs." },
    { tipo: "p", texto: "Outras variações: um usuário comum chama uma rota de administrador porque o botão estava escondido, mas a rota não conferia o perfil; ou altera o próprio papel enviando um campo extra no corpo da requisição. A regra é uma só: esconder um botão não é proteger, a conferência precisa estar no servidor." },

    { tipo: "h3", texto: "A02 · Falhas criptográficas" },
    { tipo: "p", texto: "Antes chamada de exposição de dados sensíveis. Inclui trafegar dados sem HTTPS, guardar senha em texto puro ou com hash rápido e inadequado (MD5, SHA-1), usar chave fixa no código e gerar números aleatórios previsíveis para tokens. A regra de ouro: não invente a sua criptografia, use bibliotecas e algoritmos consagrados, e guarde só o que precisa guardar." },

    { tipo: "h3", texto: "A03 · Injeção" },
    { tipo: "p", texto: "Acontece quando o dado do usuário vira parte de um comando: uma consulta SQL, um comando de sistema, uma consulta a um banco NoSQL, um template. O atacante escreve no campo algo que o interpretador entende como instrução. A defesa central é nunca montar comandos concatenando texto. O artigo seguinte desta trilha trata disso a fundo." },

    { tipo: "h3", texto: "A04 · Design inseguro" },
    { tipo: "p", texto: "Algumas falhas não são bugs de código, são decisões de projeto. Um fluxo de recuperação de senha que pergunta o nome da mãe, uma API que deixa comprar com preço negativo, um sistema sem limite de tentativas de login. Nenhuma linha de código corrige isso: é preciso repensar o desenho. Por isso a modelagem de ameaças, vista mais abaixo, vem antes de programar." },

    { tipo: "h3", texto: "A05 · Configuração incorreta de segurança" },
    { tipo: "p", texto: "Modo de depuração ligado em produção, contas padrão com senha padrão, painéis de administração acessíveis pela internet, mensagens de erro que mostram a stack trace, cabeçalhos de segurança ausentes, permissões amplas demais em armazenamento na nuvem. Quase sempre é um padrão que ninguém revisou." },

    { tipo: "h3", texto: "A06 · Componentes vulneráveis e desatualizados" },
    { tipo: "p", texto: "Hoje, a maior parte do código de um projeto vem de bibliotecas de terceiros. Quando uma delas descobre uma vulnerabilidade e você continua na versão antiga, o risco é seu. Saber quais dependências o projeto usa e mantê-las atualizadas é parte do trabalho." },

    { tipo: "h3", texto: "A07 · Falhas de identificação e autenticação" },
    { tipo: "p", texto: "Aceitar senhas fracas, permitir tentativas ilimitadas, deixar o identificador da sessão na URL, não encerrar a sessão no logout, mensagens que revelam se um e-mail existe. Veja o artigo dedicado a autenticação e autorização." },

    { tipo: "h3", texto: "A08 · Falhas de integridade de software e de dados" },
    { tipo: "p", texto: "Inclui baixar e executar código sem verificar a origem, depender de pacotes que podem ser trocados no caminho e aceitar dados serializados de fontes não confiáveis. Em pipelines de entrega, é o risco de alguém alterar o que vai para produção sem ser notado." },

    { tipo: "h3", texto: "A09 · Falhas de registro e monitoramento" },
    { tipo: "p", texto: "Sem registros, um ataque pode durar meses sem que ninguém perceba. É preciso registrar logins, falhas de autorização e ações administrativas, sem registrar segredos, e alguém ou algo precisa olhar. Voltaremos a isso no artigo sobre segredos, dependências e logs." },

    { tipo: "h3", texto: "A10 · Falsificação de requisição no servidor (SSRF)" },
    { tipo: "p", texto: "Se a sua aplicação busca uma URL informada pelo usuário (para gerar uma prévia de link ou importar uma imagem, por exemplo), alguém pode apontá-la para endereços internos, como serviços que só a rede interna alcança. A defesa é aceitar apenas destinos de uma lista permitida e não seguir redirecionamentos cegamente." },

    { tipo: "h", texto: "Um exemplo de ponta a ponta" },
    { tipo: "p", texto: "Vamos ver um endpoint que reúne vários desses problemas. É uma rota de um servidor Express em TypeScript que devolve um pedido pelo identificador:" },
    { tipo: "codigo", linguagem: "typescript", legenda: "Versão vulnerável", texto: "app.get(\"/pedidos/:id\", async (req, res) => {\n  try {\n    const resultado = await db.query(\n      \"SELECT * FROM pedidos WHERE id = \" + req.params.id,\n    );\n    res.json(resultado.rows[0]);\n  } catch (erro) {\n    res.status(500).json({ erro: String(erro), stack: (erro as Error).stack });\n  }\n});" },
    { tipo: "p", texto: "Quantos problemas há aqui? Releia o código antes de continuar. São pelo menos cinco:" },
    { tipo: "numerada", itens: [
      "Injeção de SQL (A03): o identificador é concatenado na consulta, então o texto vindo da URL pode virar parte do comando.",
      "Controle de acesso quebrado (A01): não há login nem conferência de que o pedido pertence a quem pergunta. Qualquer um lê qualquer pedido.",
      "Exposição de dados em excesso (A02/A01): SELECT * devolve todas as colunas, inclusive as que o cliente nunca deveria ver.",
      "Configuração insegura (A05): o erro devolvido ao cliente inclui a stack trace, que revela caminhos, bibliotecas e versões.",
      "Falta de registro (A09): quando falha, nada é registrado de forma útil para quem opera o sistema.",
    ] },
    { tipo: "p", texto: "Agora uma versão corrigida:" },
    { tipo: "codigo", linguagem: "typescript", legenda: "Versão corrigida", texto: "app.get(\"/pedidos/:id\", exigirLogin, async (req, res) => {\n  const id = Number(req.params.id);\n  if (!Number.isInteger(id) || id <= 0) {\n    res.status(400).json({ erro: \"Identificador inválido\" });\n    return;\n  }\n\n  try {\n    const resultado = await db.query(\n      \"SELECT id, total, status FROM pedidos WHERE id = $1 AND usuario_id = $2\",\n      [id, req.usuario.id],\n    );\n    if (resultado.rowCount === 0) {\n      res.status(404).json({ erro: \"Pedido não encontrado\" });\n      return;\n    }\n    res.json(resultado.rows[0]);\n  } catch (erro) {\n    logger.error({ err: erro, pedidoId: id }, \"falha ao buscar pedido\");\n    res.status(500).json({ erro: \"Erro interno do servidor\" });\n  }\n});" },
    { tipo: "p", texto: "O que mudou, ponto a ponto:" },
    { tipo: "lista", itens: [
      "exigirLogin é um middleware que recusa quem não está autenticado e preenche req.usuario.",
      "O identificador é validado antes de tocar no banco: precisa ser um inteiro positivo.",
      "A consulta é parametrizada ($1 e $2): o driver envia o comando e os valores separados.",
      "O filtro AND usuario_id = $2 faz o banco só devolver pedidos do próprio usuário. Um pedido de outra pessoa simplesmente não é encontrado.",
      "Só as colunas necessárias são devolvidas.",
      "Se o pedido não existe ou não é do usuário, a resposta é a mesma: 404. Assim, a API não revela quais identificadores existem.",
      "O erro vai para o log, com contexto, e o cliente recebe uma mensagem fixa.",
    ] },
    { tipo: "dica", titulo: "Repare que nenhuma camada trabalha sozinha", texto: "Se a validação do identificador falhasse, a consulta parametrizada ainda seguraria a injeção. Se a consulta tivesse um erro, o filtro por usuário ainda impediria o vazamento. É isso que significa defesa em profundidade." },

    { tipo: "h", texto: "Pensando como quem ataca: modelagem de ameaças" },
    { tipo: "p", texto: "Modelagem de ameaças é o hábito de procurar falhas no desenho, antes de escrever o código. Existe uma versão simples, em quatro perguntas, que cabe numa conversa de vinte minutos antes de começar uma funcionalidade:" },
    { tipo: "numerada", itens: [
      "O que estamos construindo? Desenhe os componentes, os dados e por onde eles passam.",
      "O que pode dar errado? Para cada ponto de entrada, pense em quem poderia abusar e como.",
      "O que vamos fazer a respeito? Para cada risco, escolha: evitar, reduzir, aceitar ou transferir.",
      "Fizemos um bom trabalho? Revise depois, com o sistema pronto.",
    ] },
    { tipo: "p", texto: "Uma ajuda para a segunda pergunta é a lista STRIDE, que dá nomes às ameaças: falsificação de identidade, adulteração de dados, repúdio (negar que fez algo), vazamento de informação, negação de serviço e elevação de privilégio. Ao olhar para cada rota, passe por essas seis palavras." },

    { tipo: "h", texto: "Ferramentas que ajudam (e o que elas não fazem)" },
    { tipo: "lista", itens: [
      "Análise estática (SAST): lê o código procurando padrões perigosos. Exemplos: Semgrep e CodeQL.",
      "Análise de dependências (SCA): procura bibliotecas com vulnerabilidades conhecidas. Exemplos: npm audit, pip-audit, Dependabot e OWASP Dependency-Check.",
      "Análise dinâmica (DAST): ataca a aplicação em execução, de fora. Exemplo: OWASP ZAP.",
      "Detecção de segredos: procura senhas e chaves no repositório. Exemplos: gitleaks e a proteção contra envio de segredos do GitHub.",
    ] },
    { tipo: "p", texto: "Ferramentas encontram os problemas comuns e reduzem o trabalho, mas não entendem o seu negócio. Elas não sabem que um usuário não deveria ver aquele pedido. Esse tipo de falha só aparece com revisão de código, testes de autorização e atenção." },

    { tipo: "h", texto: "Ética e limites" },
    { tipo: "alerta", titulo: "Teste só o que é seu ou o que você tem autorização por escrito para testar", texto: "Procurar falhas em um sistema alheio sem permissão pode ser crime, mesmo com boa intenção. Para praticar, use ambientes feitos para isso, como o OWASP Juice Shop e o OWASP WebGoat, ou os seus próprios projetos rodando na sua máquina. Se encontrar uma falha em um sistema de terceiros, procure o canal de divulgação responsável da empresa em vez de explorá-la." },

    { tipo: "h", texto: "Um hábito para levar" },
    { tipo: "p", texto: "A cada rota nova ou alterada, faça três perguntas antes de abrir o pull request. Quem pode chamar isso, e onde eu conferi? O que acontece com cada entrada inesperada? O que a resposta revela, e o que vai para o log? Com o tempo, as perguntas viram reflexo." },
  ],
  exercicios: [
    "Escolha uma rota de um projeto seu e procure os cinco problemas do exemplo: injeção, falta de dono do recurso, dados demais, erro vazando detalhes e ausência de log.",
    "Faça a modelagem de ameaças das quatro perguntas para o fluxo de login do seu projeto. Liste pelo menos cinco coisas que podem dar errado, usando STRIDE.",
    "Liste os pontos de entrada do projeto (rotas, uploads, integrações). Existe algum que você nem lembrava que existia?",
    "Instale o OWASP Juice Shop localmente e resolva os desafios de nível mais fácil. Anote o que cada um ensinou.",
  ],
  referencias: [
    { titulo: "OWASP Top 10", url: "https://owasp.org/Top10/" },
    { titulo: "OWASP API Security Project", url: "https://owasp.org/API-Security/" },
    { titulo: "OWASP Cheat Sheet Series", url: "https://cheatsheetseries.owasp.org/" },
    { titulo: "OWASP Juice Shop", url: "https://owasp.org/www-project-juice-shop/" },
  ],
};
