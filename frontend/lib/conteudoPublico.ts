/** Textos das páginas públicas (Produto, Recursos, Blog, Ajuda, Termos e Privacidade). Só dizem o que a Koda faz de verdade. */

export const ATUALIZACAO_DOS_DOCUMENTOS = "2 de outubro de 2026";

export type Passo = { titulo: string; texto: string };

export const PASSOS_DO_PRODUTO: Passo[] = [
  { titulo: "Conecte um repositório", texto: "Entre com o GitHub e escolha um dos seus repositórios públicos. A Koda só lê o que já é público." },
  { titulo: "A Koda entende o projeto", texto: "Ela identifica a linguagem, o framework, as camadas, as rotas, as entidades e quais classes ainda não têm teste." },
  { titulo: "Receba um ticket de verdade", texto: "O código escolhe o ângulo e o alvo, e a IA escreve um ticket de nível júnior, no estilo Jira, sobre o seu próprio projeto." },
  { titulo: "Resolva no seu ritmo", texto: "Peça dicas em três níveis quando travar, marque o andamento e acompanhe o que você já praticou." },
];

export const O_QUE_A_KODA_NAO_FAZ: string[] = [
  "Não executa o código do seu repositório. Ela só lê texto.",
  "Não entrega a solução. Os tickets descrevem o que é esperado, nunca como fazer.",
  "Não corrige nem avalia o que você escreveu. A conclusão do ticket é declarada por você.",
  "Não envia o seu código inteiro para a IA, só um resumo com nomes e estrutura.",
];

export type Recurso = { titulo: string; texto: string; icone: "pasta" | "alvo" | "escudo" | "lampada" | "grafico" | "paleta" | "cadeado" | "codigo" };

export const RECURSOS: Recurso[] = [
  { icone: "pasta", titulo: "Análise do projeto", texto: "Stack, camadas, domínios, rotas, entidades e testes, para Java (Spring Boot), TypeScript e JavaScript (Node) e Python." },
  { icone: "alvo", titulo: "36 ângulos de desafio", texto: "Features, bugs e testes em cenários diferentes. O código escolhe o ângulo menos usado e o alvo ainda não praticado, então os tickets não se repetem." },
  { icone: "escudo", titulo: "Tickets validados", texto: "Cada ticket passa por verificações: sem solução pronta, sem classe inventada, com critérios de aceite verificáveis e sem parecer com os anteriores." },
  { icone: "lampada", titulo: "Dicas em 3 níveis", texto: "Direção, abordagem e conferência. As dicas apontam o caminho e nunca a resposta, e passam pela mesma validação dos tickets." },
  { icone: "grafico", titulo: "Andamento e histórico", texto: "Comece, conclua e reabra desafios. Veja o que está em aberto, o que você já fez e as habilidades que praticou." },
  { icone: "paleta", titulo: "Três temas", texto: "Preto (padrão), roxo escuro e claro, com contraste conferido por teste automatizado." },
  { icone: "cadeado", titulo: "Segurança desde o início", texto: "Só repositórios públicos da sua conta, token do GitHub criptografado, sessão protegida e nada do seu código é executado." },
  { icone: "codigo", titulo: "Feito para quem está crescendo", texto: "Nível júnior, tarefas pequenas e bem delimitadas, que se resolvem em poucas horas." },
];

export type Artigo = {
  slug: string;
  titulo: string;
  resumo: string;
  leitura: string;
  paragrafos: { subtitulo?: string; texto: string }[];
};

export const ARTIGOS: Artigo[] = [
  {
    slug: "como-a-koda-escreve-um-ticket",
    titulo: "Como a Koda escreve um ticket sem entregar a solução",
    resumo: "O código decide o que pedir. A IA só redige. E tudo o que ela devolve é conferido antes de chegar até você.",
    leitura: "4 min",
    paragrafos: [
      { texto: "Pedir a uma IA que invente um exercício costuma dar tarefas genéricas, repetidas e, às vezes, com a resposta embutida. A Koda separa as responsabilidades para evitar isso." },
      { subtitulo: "O código escolhe, a IA redige", texto: "Depois de analisar o repositório, a Koda tem um catálogo de 36 ângulos, como paginação, tratamento de erro ou teste de um service sem cobertura. Quem decide o ângulo e o alvo, uma rota, uma classe ou um recurso, é o código, escolhendo o menos usado até então. A IA recebe essa decisão pronta e só escreve o ticket: contexto, cenário atual, objetivo, critérios de aceite e testes esperados." },
      { subtitulo: "Só um resumo vai para a IA", texto: "A IA não recebe o seu código. Ela recebe um resumo com a linguagem, o framework, os nomes de classes ou módulos, as rotas e as tecnologias de infraestrutura. Tudo isso é limpo antes: o que não parece um nome ou um caminho válido é descartado." },
      { subtitulo: "A resposta é tratada como não confiável", texto: "O texto que volta passa por um verificador de formato e por um validador. Ele recusa tickets que entregam código ou passos de implementação, que citam classes ou rotas que não existem no projeto, que têm critérios vagos como “melhorar o desempenho” ou que não combinam com o tipo pedido. Um detector de similaridade também impede que dois tickets do mesmo projeto sejam parecidos demais." },
      { subtitulo: "Quando falha, tenta de novo, uma vez", texto: "Se o ticket é reprovado, a Koda pede uma segunda versão com orientações fixas sobre o que corrigir. Se falhar de novo, ela diz isso com clareza em vez de mostrar um ticket ruim." },
    ],
  },
  {
    slug: "ticket-de-verdade-ensina-mais",
    titulo: "Por que um ticket de verdade ensina mais do que um tutorial",
    resumo: "No trabalho ninguém entrega o passo a passo. Praticar no seu próprio código treina o que o dia a dia realmente cobra.",
    leitura: "3 min",
    paragrafos: [
      { texto: "Tutoriais são ótimos para conhecer uma ferramenta. O problema aparece depois: no primeiro ticket real, não existe projeto vazio nem roteiro, existe um código que alguém escreveu e uma descrição curta do que precisa mudar." },
      { subtitulo: "Contexto vale mais que sintaxe", texto: "Um ticket da Koda cita as classes, as rotas e as convenções do seu projeto. Você precisa ler o que já existe, entender o padrão e escrever algo que se encaixe. É essa leitura que costuma faltar em quem está começando." },
      { subtitulo: "Descrever o esperado, não o caminho", texto: "Os tickets dizem o que o sistema deve fazer e como saber que ficou pronto, mas não como programar. Quando travar, as dicas em três níveis ajudam a olhar para o lugar certo sem tirar de você o prazer de resolver." },
      { subtitulo: "Variedade sem repetição", texto: "Features, bugs e testes exercitam músculos diferentes. Escrever um teste para um service sem cobertura é outra habilidade que corrigir um erro reportado por QA, e a Koda alterna entre elas." },
    ],
  },
  {
    slug: "o-que-a-koda-le-do-seu-repositorio",
    titulo: "O que a Koda lê do seu repositório (e o que não lê)",
    resumo: "Só repositórios públicos, só texto, só alguns arquivos. Veja exatamente o que entra na análise.",
    leitura: "3 min",
    paragrafos: [
      { texto: "Confiança vem de saber o que acontece com o seu código. Este é o resumo do que a análise faz." },
      { subtitulo: "Quais repositórios", texto: "Apenas repositórios públicos da sua própria conta. A Koda confere isso no GitHub antes de começar, e o login pede só a permissão de ler o seu perfil público." },
      { subtitulo: "Quais arquivos", texto: "Primeiro a árvore de arquivos. Depois, só os que importam para entender a estrutura: o manifesto do projeto (pom.xml, package.json, pyproject.toml, requirements.txt ou Pipfile), o arquivo do Docker Compose, os arquivos que definem rotas e os que declaram entidades. Arquivos muito grandes são pulados e a análise é marcada como parcial." },
      { subtitulo: "O que é guardado", texto: "O resultado da análise: linguagem, framework, nomes de componentes, rotas e tecnologias. O conteúdo dos arquivos lidos não fica guardado." },
      { subtitulo: "O que nunca acontece", texto: "Nada do seu código é executado, compilado ou instalado. A Koda trata tudo como texto." },
    ],
  },
];

export type Pergunta = { pergunta: string; resposta: string };
export type GrupoDePerguntas = { titulo: string; perguntas: Pergunta[] };

export const PERGUNTAS_FREQUENTES: GrupoDePerguntas[] = [
  {
    titulo: "Começando",
    perguntas: [
      { pergunta: "Como começo a usar a Koda?", resposta: "Entre com o GitHub, escolha um repositório público seu em “Repositórios” e aguarde a análise, que costuma levar alguns segundos. Quando terminar, gere o primeiro desafio." },
      { pergunta: "Quais linguagens a Koda entende?", resposta: "Java com Spring Boot (Maven), TypeScript e JavaScript em servidores Node (NestJS, Express, Fastify, Koa, Hono, Hapi e Next.js) e Python (FastAPI, Flask e Django). O projeto precisa ter o manifesto na raiz do repositório." },
      { pergunta: "Posso analisar o repositório de outra pessoa?", resposta: "Não. Hoje só é possível analisar repositórios públicos da sua própria conta." },
      { pergunta: "Por que a análise do meu repositório falhou?", resposta: "As causas mais comuns são: o repositório ser privado, não ter o manifesto na raiz (como o pom.xml ou o package.json), não usar um framework de servidor reconhecido ou ter uma linguagem que ainda não é suportada. A mensagem na tela diz qual foi o motivo." },
    ],
  },
  {
    titulo: "Desafios e dicas",
    perguntas: [
      { pergunta: "O que é um desafio?", resposta: "Um ticket de nível júnior, no estilo Jira, escrito sobre o seu projeto: contexto, cenário atual, objetivo, regras de negócio, critérios de aceite e testes esperados." },
      { pergunta: "A Koda corrige o que eu escrevo?", resposta: "Não. Ela não lê a sua solução. Você marca o desafio como concluído quando considerar que cumpriu os critérios de aceite." },
      { pergunta: "Como funcionam as dicas?", resposta: "São três níveis: direção (onde olhar primeiro), abordagem (que caminho seguir) e conferência (como saber se está certo). Nenhuma dica entrega a resposta, e cada desafio aceita uma dica por vez." },
      { pergunta: "Existe limite de uso?", resposta: "Sim, para o serviço ficar disponível para todo mundo: há um número máximo de desafios novos e de dicas a cada 24 horas, e só um desafio pode estar sendo gerado por vez. A tela avisa quando o limite é atingido." },
      { pergunta: "Por que um ticket às vezes demora ou falha?", resposta: "A geração usa um provedor de IA externo, que pode estar lento ou instável. A Koda tenta de novo uma vez e, se não der, avisa. Gerar outro desafio costuma resolver." },
    ],
  },
  {
    titulo: "Privacidade e segurança",
    perguntas: [
      { pergunta: "O que a Koda lê do meu repositório?", resposta: "O manifesto do projeto, o Docker Compose, os arquivos de rotas e as entidades, sempre como texto. Nada é executado. O conteúdo dos arquivos não fica guardado, só o resultado da análise." },
      { pergunta: "Meu código vai para a IA?", resposta: "Não o código inteiro. Vai um resumo com linguagem, framework, nomes de classes ou módulos, rotas e tecnologias, depois de limpo." },
      { pergunta: "Como removo o acesso da Koda à minha conta do GitHub?", resposta: "Nas configurações do GitHub, em aplicações autorizadas, revogue o acesso da Koda. A partir daí ela não consegue mais ler os seus repositórios." },
      { pergunta: "Como mudo o tema?", resposta: "Em Configurações, na seção Aparência, escolha entre preto, roxo escuro e claro." },
    ],
  },
];

export type SecaoDeDocumento = { titulo: string; paragrafos: string[]; itens?: string[] };

export const TERMOS_DE_USO: SecaoDeDocumento[] = [
  { titulo: "1. Aceitação", paragrafos: ["Ao entrar na Koda com a sua conta do GitHub, você declara que leu e concorda com estes Termos de Uso e com a Política de Privacidade. Se não concordar, não use o serviço."] },
  { titulo: "2. O que é a Koda", paragrafos: ["A Koda é uma plataforma educacional que analisa repositórios públicos do GitHub e usa inteligência artificial para escrever tickets de desenvolvimento de nível júnior, com dicas progressivas, para você praticar. O serviço está em evolução e pode mudar."] },
  { titulo: "3. Conta e acesso pelo GitHub", paragrafos: ["O acesso é feito somente pelo login do GitHub. Você é responsável por manter a sua conta do GitHub segura e por tudo o que acontecer nela. Você pode revogar o acesso da Koda a qualquer momento nas configurações do GitHub."] },
  {
    titulo: "4. Uso permitido",
    paragrafos: ["Você pode usar a Koda para analisar repositórios públicos da sua própria conta e praticar com os desafios gerados. Não é permitido:"],
    itens: [
      "tentar analisar repositórios de outras pessoas ou repositórios privados;",
      "contornar ou tentar burlar os limites de uso, a autenticação ou qualquer medida de segurança;",
      "sobrecarregar o serviço, fazer varreduras automatizadas ou usá-lo de forma abusiva;",
      "usar o serviço para gerar conteúdo ilegal, ofensivo ou que viole direitos de terceiros;",
      "copiar, revender ou redistribuir o serviço como produto próprio.",
    ],
  },
  { titulo: "5. Conteúdo gerado por inteligência artificial", paragrafos: ["Os tickets e as dicas são gerados por IA e passam por verificações automáticas, mas podem conter imprecisões ou erros. Eles têm finalidade educacional e não substituem a orientação de profissionais nem a revisão do seu próprio julgamento.", "A Koda não corrige nem avalia a sua solução. Marcar um desafio como concluído é uma declaração sua. A Koda não garante resultados de aprendizado, aprovação em processos seletivos ou qualquer outro desfecho."] },
  { titulo: "6. Propriedade intelectual", paragrafos: ["O código dos seus repositórios continua sendo seu. A Koda não adquire direitos sobre ele.", "Os tickets e as dicas gerados para você podem ser usados por você para estudo e portfólio pessoal. A marca, o logotipo, o design e o software da Koda pertencem aos seus titulares e não podem ser usados sem autorização."] },
  { titulo: "7. Limites de uso", paragrafos: ["Para manter o serviço disponível para todos, há limites de uso, como o número de desafios novos e de dicas por período de 24 horas. Os limites podem ser alterados."] },
  { titulo: "8. Disponibilidade e mudanças no serviço", paragrafos: ["O serviço é oferecido no estado em que se encontra, sem garantia de funcionamento ininterrupto. Recursos podem ser alterados, suspensos ou removidos. Esforçamo-nos para avisar mudanças relevantes."] },
  { titulo: "9. Limitação de responsabilidade", paragrafos: ["Na medida permitida pela lei, a Koda não se responsabiliza por danos indiretos, perda de dados ou lucros cessantes decorrentes do uso do serviço, nem por falhas de serviços de terceiros dos quais ele depende, como o GitHub e o provedor de inteligência artificial. Nada nestes Termos exclui direitos que a lei assegura a você como consumidor."] },
  { titulo: "10. Suspensão e encerramento", paragrafos: ["Podemos limitar ou suspender o acesso de quem violar estes Termos ou usar o serviço de forma abusiva. Você pode parar de usar a Koda quando quiser e revogar o acesso no GitHub."] },
  { titulo: "11. Alterações destes Termos", paragrafos: ["Podemos atualizar estes Termos. A data da última atualização fica no topo desta página. O uso continuado do serviço depois de uma atualização significa que você concorda com a nova versão."] },
  { titulo: "12. Lei aplicável", paragrafos: ["Estes Termos são regidos pelas leis do Brasil. Quando você for consumidor, fica garantido o foro do seu domicílio."] },
];

export const POLITICA_DE_PRIVACIDADE: SecaoDeDocumento[] = [
  { titulo: "1. Sobre esta política", paragrafos: ["Esta política explica quais dados a Koda coleta, para que os usa, com quem os compartilha e quais são os seus direitos, em linha com a Lei Geral de Proteção de Dados (LGPD, Lei 13.709/2018)."] },
  {
    titulo: "2. Dados que coletamos",
    paragrafos: ["Coletamos apenas o necessário para o serviço funcionar:"],
    itens: [
      "Da sua conta do GitHub, no login: identificador numérico, nome de usuário, nome de exibição e foto de perfil. O login pede somente a permissão de ler o seu perfil público. Não coletamos o seu e-mail nem a sua senha do GitHub.",
      "O token de acesso do GitHub, usado para ler os seus repositórios públicos. Ele é guardado criptografado.",
      "Dados dos repositórios que você conecta: nome, branch padrão e o resultado da análise (linguagem, framework, nomes de componentes, rotas e tecnologias). O conteúdo dos arquivos lidos durante a análise não é guardado.",
      "O que você faz no serviço: tickets e dicas gerados, andamento dos desafios, histórico e datas de início e de conclusão.",
      "Dados técnicos: o cookie de sessão e registros de funcionamento do servidor, que não contêm o conteúdo dos pedidos enviados à IA.",
    ],
  },
  {
    titulo: "3. Para que usamos os dados",
    paragrafos: ["Usamos os dados para autenticar você, analisar os repositórios que você escolher, gerar e validar tickets e dicas, mostrar o seu progresso, aplicar limites de uso, manter a segurança do serviço e corrigir problemas. A base legal é a execução do serviço que você solicitou e o legítimo interesse em mantê-lo seguro."],
  },
  {
    titulo: "4. Inteligência artificial",
    paragrafos: [
      "Para escrever tickets e dicas, enviamos a um provedor de inteligência artificial um resumo do projeto: linguagem, framework, nomes de classes ou módulos, rotas, tecnologias de infraestrutura e títulos de tickets recentes. Esse resumo é limpo antes do envio. Não enviamos o código-fonte completo, o seu token, o seu nome nem a sua foto.",
      "O provedor pode processar essas informações em servidores de terceiros. A resposta da IA é tratada como não confiável e validada antes de ser mostrada.",
    ],
  },
  {
    titulo: "5. Com quem compartilhamos",
    paragrafos: ["Compartilhamos dados somente com quem é necessário para o serviço existir: o GitHub (login e leitura dos repositórios públicos), o provedor de inteligência artificial (apenas o resumo descrito acima) e a infraestrutura de hospedagem. Não vendemos dados pessoais nem os usamos para publicidade."],
  },
  {
    titulo: "6. Cookies e armazenamento local",
    paragrafos: ["Usamos um único cookie, o de sessão, que mantém você conectado e não é acessível por scripts. Também guardamos no seu navegador a preferência de tema. Não usamos cookies de publicidade nem de rastreamento."],
  },
  {
    titulo: "7. Por quanto tempo guardamos",
    paragrafos: ["Guardamos os dados enquanto a sua conta estiver ativa e for necessário para o serviço. Hoje o produto ainda não tem um botão de exclusão de conta. Você pode revogar o acesso da Koda a qualquer momento nas configurações do GitHub, o que impede novas leituras dos seus repositórios, e pode pedir a eliminação dos seus dados pelo canal de contato indicado abaixo."],
  },
  {
    titulo: "8. Segurança",
    paragrafos: ["Adotamos medidas como criptografia do token do GitHub, sessão protegida contra acesso por scripts, proteção contra requisições forjadas, limites de uso, validação de tudo o que vem da IA e leitura dos repositórios apenas como texto, sem executar nada. Nenhum sistema é totalmente imune, e trabalhamos para corrigir qualquer falha rapidamente."],
  },
  {
    titulo: "9. Os seus direitos",
    paragrafos: ["Pela LGPD, você pode, a qualquer momento:"],
    itens: [
      "confirmar que tratamos os seus dados e acessá-los;",
      "corrigir dados incompletos ou desatualizados;",
      "pedir a eliminação dos dados tratados com o seu consentimento ou desnecessários;",
      "pedir a portabilidade dos seus dados;",
      "saber com quem compartilhamos os seus dados;",
      "revogar o consentimento e se opor a um tratamento que considere irregular.",
    ],
  },
  { titulo: "10. Crianças e adolescentes", paragrafos: ["A Koda não é direcionada a crianças. Para usar o serviço é preciso ter uma conta do GitHub, o que exige a idade mínima definida por ela."] },
  { titulo: "11. Alterações nesta política", paragrafos: ["Podemos atualizar esta política. A data da última atualização fica no topo desta página, e mudanças relevantes serão informadas no serviço."] },
];
