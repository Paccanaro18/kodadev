import type { Modulo } from "../tipos";

export const SEG_MODULO_1: Modulo = {
  tipo: "modulo",
  slug: "ameacas-risco-e-defesa-em-camadas",
  titulo: "Ameaças, risco e defesa em camadas",
  resumo: "Como pensar em segurança antes de escrever código: o que proteger, de quem, qual o risco de cada ameaça e por que nenhuma defesa sozinha basta.",
  nivel: "Iniciante",
  leitura: "40 min",
  objetivos: [
    "Explicar a tríade confidencialidade, integridade e disponibilidade com exemplos de uma aplicação web.",
    "Identificar ativos, atacantes e a superfície de ataque de um sistema.",
    "Priorizar ameaças por probabilidade e impacto, e escolher controles proporcionais ao risco.",
    "Aplicar os princípios de menor privilégio, defesa em profundidade, falhar de forma segura e segurança por padrão.",
    "Usar o OWASP Top 10 como mapa dos erros mais comuns, sem tratá-lo como lista de verificação completa.",
  ],
  preRequisitos: [
    "Nenhum conhecimento de segurança. Saber o que é uma aplicação web e uma API ajuda.",
  ],
  pontosChave: [
    "Segurança é decidir o que proteger, de quem e com qual custo: não existe sistema 100% seguro.",
    "Confidencialidade, integridade e disponibilidade descrevem o que pode dar errado com um dado.",
    "O risco é a combinação de probabilidade e impacto: priorize o que é provável e grave.",
    "Nunca dependa de uma única defesa: camadas independentes fazem a falha de uma não ser a falha de todas.",
    "O atacante precisa acertar uma vez; quem defende precisa acertar sempre. Reduza a superfície e simplifique.",
  ],
  blocos: [
    { tipo: "p", texto: "A maior parte dos incidentes de segurança não vem de ataques sofisticados, e sim de erros comuns: uma senha fraca, um campo que aceita o que não deveria, uma chave esquecida no repositório, uma permissão ampla demais. Quem desenvolve software toma decisões de segurança o tempo todo, mesmo sem perceber: ao escolher como guardar uma senha, ao validar (ou não) uma entrada, ao decidir quem pode ver um registro. Esta trilha ensina a tomar essas decisões de forma consciente, entendendo como a aplicação é atacada para poder construí-la de modo que o ataque falhe." },
    { tipo: "alerta", titulo: "Aprender a atacar é aprender a defender, dentro dos limites", texto: "Tudo o que esta trilha mostra sobre ataques tem o objetivo de defesa. Teste técnicas apenas em sistemas seus, em ambientes de estudo (como os desafios da área Segurança do Koda, cujos dados são fictícios) ou com autorização por escrito de quem é o dono do sistema. Acessar sistemas alheios sem permissão é crime no Brasil (Lei 12.737/2012, que trata da invasão de dispositivo informático), mesmo sem má intenção." },

    { tipo: "h", texto: "O que estamos protegendo: a tríade CIA" },
    { tipo: "p", texto: "Para falar de segurança, precisamos de um vocabulário comum. O modelo mais usado são três propriedades que um dado ou serviço deve manter, conhecidas pela sigla em inglês CIA: confidencialidade, integridade e disponibilidade. Toda falha de segurança quebra pelo menos uma delas, e perguntar \"qual dessas três está em jogo?\" ajuda a entender o problema e escolher a defesa." },
    { tipo: "tabela", legenda: "A tríade CIA", cabecalho: ["Propriedade", "Significa", "Como é quebrada", "Defesas típicas"], linhas: [
      ["Confidencialidade", "Só quem deve vê o dado, vê.", "Vazamento de dados, acesso a dados de outra pessoa (IDOR), senha roubada.", "Controle de acesso, criptografia, mínimo de dados coletados."],
      ["Integridade", "O dado só muda por quem pode, e de forma detectável.", "Alteração de preço no navegador, cookie adulterado, injeção de SQL com UPDATE.", "Validação no servidor, assinaturas, controle de acesso, trilha de auditoria."],
      ["Disponibilidade", "O serviço funciona quando é preciso.", "Ataque de negação de serviço, ransomware, queda por falta de limites.", "Redundância, limites de uso, backups testados, filtros de tráfego."],
    ] },
    { tipo: "p", texto: "Um exemplo com uma loja virtual. Se um atacante lê os dados de cartão de clientes, quebrou a confidencialidade. Se altera o valor de um pedido de 500 para 5 reais antes de pagar, quebrou a integridade. Se derruba o site na Black Friday, quebrou a disponibilidade. As três têm custos diferentes e exigem defesas diferentes, e o peso de cada uma muda com o sistema: para um hospital, a disponibilidade de um prontuário pode importar mais que o sigilo em uma emergência; para um banco, a integridade das transações é o coração do negócio." },

    { tipo: "h", texto: "Ativos, atacantes e superfície de ataque" },
    { tipo: "p", texto: "Antes de escolher defesas, responda a três perguntas. O que vale a pena proteger? Os ativos são dados (senhas, documentos, cartões), mas também contas, a reputação, a infraestrutura e o tempo da equipe. De quem? Os atacantes têm perfis diferentes: curiosos e oportunistas que varrem a internet atrás de falhas conhecidas, criminosos que querem dinheiro (roubo de dados, sequestro de arquivos), concorrentes e pessoas de dentro com acesso legítimo. E por onde podem entrar? A superfície de ataque é o conjunto de pontos em que um atacante consegue interagir com o sistema: cada rota da API, cada campo de formulário, cada porta aberta, cada dependência, cada integração e cada pessoa com acesso." },
    { tipo: "lista", itens: [
      "Cada rota nova é superfície nova: pergunte se ela precisa existir e quem deve acessá-la.",
      "Cada dependência é código de terceiros executando com as permissões da sua aplicação.",
      "Cada permissão extra é um poder a mais para quem comprometer aquela conta.",
      "Serviços esquecidos (servidores de teste, painéis de administração, buckets antigos) são alvos favoritos, porque ninguém os atualiza nem os vigia.",
      "Reduzir a superfície é a defesa mais barata: o que não existe não pode ser atacado.",
    ] },

    { tipo: "codigo", linguagem: "text", legenda: "Fronteiras de confiança de uma loja virtual", texto: `[Navegador do cliente]  <-- NÃO CONFIÁVEL: qualquer coisa pode chegar daqui
        │  HTTPS
════════╪══════════════════ fronteira de confiança 1 ═══════════════
        ▼
[API da loja]  ──────────►  [Provedor de pagamentos]   (terceiro)
        │                         ▲
════════╪═════════════════════════╪═ fronteira de confiança 2 ═════
        ▼                         │
[Banco de dados]            [Fila de e-mails]
        │
[Backups em nuvem]  <-- quem tem acesso? está criptografado?` },
    { tipo: "h", texto: "Risco: probabilidade vezes impacto" },
    { tipo: "p", texto: "Não dá para eliminar todos os riscos, e tentar custa tempo e dinheiro que fariam falta em outro lugar. A pergunta madura é: quais ameaças merecem atenção primeiro? Uma forma simples de responder é estimar, para cada ameaça, a probabilidade de ela acontecer e o impacto se acontecer, em uma escala de 1 a 5, e multiplicar. O resultado ordena a lista de trabalho. O programa abaixo faz essa conta para um conjunto de ameaças realistas." },
    { tipo: "codigo", linguagem: "python", legenda: "risco.py", texto: `from dataclasses import dataclass


@dataclass(frozen=True)
class Ameaca:
    nome: str
    probabilidade: int
    impacto: int
    controle: str

    @property
    def risco(self) -> int:
        return self.probabilidade * self.impacto


AMEACAS = [
    Ameaca("Senhas vazadas reutilizadas em outros sites", 5, 4, "MFA e senhas únicas"),
    Ameaca("Injeção de SQL no formulário de busca", 3, 5, "Consultas parametrizadas"),
    Ameaca("Bucket de arquivos aberto ao público", 2, 5, "Bloqueio de acesso público"),
    Ameaca("Dependência com vulnerabilidade conhecida", 4, 3, "Atualização e varredura"),
    Ameaca("Funcionário clica em e-mail falso", 5, 3, "Treinamento e filtro de e-mail"),
    Ameaca("Servidor de testes esquecido na internet", 2, 2, "Inventário de ativos"),
]


def classificar(risco: int) -> str:
    if risco >= 15:
        return "ALTO"
    if risco >= 8:
        return "MÉDIO"
    return "BAIXO"


for ameaca in sorted(AMEACAS, key=lambda a: a.risco, reverse=True):
    print(f"{ameaca.risco:>2} {classificar(ameaca.risco):<5} {ameaca.nome} -> {ameaca.controle}")` },
    { tipo: "codigo", linguagem: "text", legenda: "Saída", texto: `20 ALTO  Senhas vazadas reutilizadas em outros sites -> MFA e senhas únicas
15 ALTO  Injeção de SQL no formulário de busca -> Consultas parametrizadas
15 ALTO  Funcionário clica em e-mail falso -> Treinamento e filtro de e-mail
12 MÉDIO Dependência com vulnerabilidade conhecida -> Atualização e varredura
10 MÉDIO Bucket de arquivos aberto ao público -> Bloqueio de acesso público
 4 BAIXO Servidor de testes esquecido na internet -> Inventário de ativos` },
    { tipo: "p", texto: "O resultado conta uma história típica: o maior risco da lista não é uma técnica sofisticada, e sim o reaproveitamento de senhas vazadas (probabilidade 5 porque acontece o tempo todo, impacto 4), seguido de falhas clássicas como a injeção de SQL. As notas são estimativas e discutíveis, e esse é justamente o valor do exercício: obriga a equipe a conversar sobre o que é provável e grave, em vez de decidir pela ansiedade do momento ou pela última notícia. Revise a lista periodicamente, porque o risco muda com o produto." },
    { tipo: "h3", texto: "O que fazer com cada risco" },
    { tipo: "numerada", itens: [
      "Mitigar: reduzir a probabilidade ou o impacto com um controle (consultas parametrizadas, MFA, backup). É a resposta mais comum.",
      "Evitar: eliminar a atividade que gera o risco (não guardar o número do cartão, desligar o serviço que ninguém usa).",
      "Transferir: dividir o risco com terceiros (seguro, um provedor de pagamento certificado que guarda os cartões por você).",
      "Aceitar: reconhecer o risco e conviver com ele, de forma consciente e documentada, quando o custo de tratá-lo supera o dano provável.",
    ] },

    { tipo: "h", texto: "Princípios que valem para qualquer sistema" },
    { tipo: "tabela", legenda: "Cinco princípios de projeto seguro", cabecalho: ["Princípio", "Ideia", "Na prática"], linhas: [
      ["Menor privilégio", "Cada pessoa e cada programa tem só as permissões de que precisa, pelo tempo de que precisa.", "Usuário do banco da aplicação sem permissão de DROP; chave de API com escopo mínimo."],
      ["Defesa em profundidade", "Várias camadas independentes, de modo que a falha de uma não derrube tudo.", "Validação de entrada, consulta parametrizada, usuário de banco restrito e monitoramento, todos juntos."],
      ["Falhar de forma segura", "Quando algo dá errado, o sistema nega o acesso, em vez de liberar.", "Se o serviço de autorização cair, a resposta é \"negado\", e não \"permitido\"."],
      ["Seguro por padrão", "A configuração inicial é a mais restritiva; abrir exige uma decisão.", "Bucket privado, cadastro sem perfil de administrador, CORS sem origens liberadas."],
      ["Simplicidade", "Menos código e menos recursos significam menos erros e menos superfície.", "Não implemente a sua própria criptografia; use bibliotecas consagradas."],
    ] },
    { tipo: "p", texto: "A defesa em profundidade merece um exemplo. Imagine um campo de busca de uma loja. A primeira camada valida a entrada (tamanho máximo, formato esperado). A segunda é a consulta parametrizada, que impede que o texto digitado vire parte do comando SQL. A terceira é o usuário do banco da aplicação, que só pode ler as tabelas necessárias. A quarta é o monitoramento, que avisa quando alguém faz centenas de buscas estranhas. Se um programador esquecer a primeira camada, as outras seguram o ataque; se esquecer duas, o dano ainda é limitado. É por isso que \"já temos um firewall\" nunca é resposta suficiente." },
    { tipo: "dica", titulo: "A pergunta que vale ouro", texto: "Diante de uma funcionalidade nova, pergunte: \"o que o pior usuário possível faria aqui?\" Quem tenta usar o sistema de forma maliciosa (mandando entradas absurdas, trocando ids, repetindo requisições, pulando passos) encontra falhas que os testes do caminho feliz nunca encontram." },

    { tipo: "h", texto: "O OWASP Top 10: um mapa, não uma lista de verificação" },
    { tipo: "p", texto: "A OWASP (Open Worldwide Application Security Project) é uma comunidade sem fins lucrativos que publica material aberto sobre segurança de aplicações. Seu documento mais famoso, o OWASP Top 10, lista as categorias de risco mais frequentes em aplicações web, com base em dados de milhares de aplicações, e é atualizado de tempos em tempos. As categorias que aparecem de forma consistente, em todas as edições, são as que você vai estudar nesta trilha." },
    { tipo: "lista", itens: [
      "Controle de acesso quebrado: acessar dados ou ações que não deveriam ser permitidos (o IDOR, por exemplo). Costuma ser a categoria mais frequente.",
      "Falhas criptográficas: dados sensíveis sem criptografia, algoritmos fracos, senhas com hash inadequado.",
      "Injeção: dados de entrada interpretados como comando (SQL, comandos do sistema, scripts no navegador).",
      "Projeto inseguro: falhas de arquitetura, e não de código, como não ter limite de tentativas de login.",
      "Configuração incorreta de segurança: padrões inseguros, mensagens de erro detalhadas, serviços desnecessários ligados.",
      "Componentes vulneráveis e desatualizados: bibliotecas com falhas conhecidas.",
      "Falhas de identificação e autenticação: senhas fracas, sessões mal gerenciadas, ausência de MFA.",
      "Falhas de integridade de software e dados: atualizações e pipelines sem verificação, dados serializados em que não se pode confiar.",
      "Falhas de registro e monitoramento: ataques que ninguém percebe porque não há logs nem alertas.",
      "Falsificação de requisição do lado do servidor (SSRF): fazer o servidor acessar endereços internos a mando do atacante.",
    ] },
    { tipo: "alerta", titulo: "Não confie só na lista", texto: "O Top 10 é uma porta de entrada, e não uma garantia. Uma aplicação pode \"passar\" em todas as categorias e ainda ter uma falha de lógica própria do seu negócio (como um cupom que pode ser usado duas vezes). Use a lista para aprender o vocabulário e para uma primeira revisão, e complemente com o modelo de ameaças do seu próprio sistema." },

    { tipo: "h", texto: "Modelando ameaças em uma hora" },
    { tipo: "p", texto: "Um modelo de ameaças é uma conversa estruturada sobre o que pode dar errado, e dá para fazer uma versão útil em uma hora, com a equipe em volta de um desenho. A forma clássica de organizar as perguntas é o STRIDE, uma sigla de seis tipos de ameaça: falsificação de identidade (Spoofing), adulteração (Tampering), repúdio (Repudiation, alguém nega ter feito algo e não há como provar), vazamento de informação (Information disclosure), negação de serviço (Denial of service) e elevação de privilégio (Elevation of privilege). Para cada parte do desenho (um usuário, uma API, um banco, uma fila), passe pelas seis letras e anote o que for plausível." },
    { tipo: "numerada", itens: [
      "Desenhe o sistema: usuários, aplicações, bancos, serviços externos e o caminho dos dados entre eles.",
      "Marque as fronteiras de confiança: onde os dados passam de um lado não confiável (a internet) para um confiável (o seu servidor). As falhas costumam estar nelas.",
      "Para cada componente e fluxo, pergunte o que pode dar errado em cada letra do STRIDE.",
      "Dê notas de probabilidade e impacto, ordene como no exemplo e escolha o que tratar primeiro.",
      "Registre as decisões e transforme as defesas escolhidas em tarefas e em testes.",
    ] },
    { tipo: "codigo", linguagem: "text", legenda: "STRIDE aplicado à API da loja (trecho)", texto: `Componente: API da loja
  S (falsificação)       Alguém usa o token de outra pessoa            -> sessões curtas, MFA
  T (adulteração)        Preço alterado no corpo da requisição         -> calcular o total no servidor
  R (repúdio)            "Eu não fiz esse pedido"                      -> trilha de auditoria com data e IP
  I (vazamento)          Pedido de outra pessoa lido pela URL (IDOR)   -> autorização por objeto
  D (negação de serviço) Milhares de buscas por segundo                -> limite de requisições por cliente
  E (elevação)           Usuário comum chama rota de administração     -> negar por padrão, papéis mínimos` },
    { tipo: "p", texto: "Os desafios da área Segurança do Koda funcionam como treino desses dois lados. Os de análise de logs mostram como um ataque aparece para quem defende, e os de segredos vazados e de web mostram o erro comum, em primeira pessoa, antes de você aprender a corrigi-lo nos próximos módulos." },
  ],
  questoes: [
    {
      enunciado: "Um atacante altera, no navegador, o preço de um item de 500 para 5 reais, e o servidor aceita. Qual propriedade da tríade CIA foi quebrada?",
      opcoes: ["Confidencialidade", "Disponibilidade", "Nenhuma: foi só um erro de interface", "Integridade"],
      correta: 3,
      explicacao: "A integridade garante que os dados só mudam por quem pode e de forma legítima. Aceitar o preço enviado pelo cliente, sem validar no servidor, permitiu a alteração indevida.",
    },
    {
      enunciado: "Uma loja sofre um ataque que derruba o site durante uma promoção. Qual propriedade foi atingida?",
      opcoes: ["Disponibilidade", "Confidencialidade", "Integridade", "Autenticidade"],
      correta: 0,
      explicacao: "Disponibilidade é o serviço funcionar quando necessário. Ataques de negação de serviço e ransomware quebram essa propriedade.",
    },
    {
      enunciado: "O que é a superfície de ataque de um sistema?",
      opcoes: ["O conjunto de pontos em que um atacante pode interagir com o sistema (rotas, portas, campos, dependências e pessoas)", "A quantidade de linhas de código", "O tamanho do servidor", "A lista de todos os usuários"],
      correta: 0,
      explicacao: "Quanto mais pontos de entrada, mais chances de falha. Reduzir a superfície (remover rotas e serviços desnecessários) é uma das defesas mais baratas.",
    },
    {
      enunciado: "Pelo método simples de risco (probabilidade × impacto), qual ameaça tem a maior prioridade?",
      opcoes: ["Probabilidade 2 e impacto 5", "Probabilidade 1 e impacto 5", "Probabilidade 5 e impacto 4", "Probabilidade 3 e impacto 3"],
      correta: 2,
      explicacao: "O produto de 5 × 4 é 20, o maior entre as opções (as outras dão 10, 5 e 9). Ameaças prováveis e graves merecem atenção primeiro.",
    },
    {
      enunciado: "Uma empresa decide não guardar mais o número do cartão dos clientes e passa a usar um provedor de pagamentos certificado. Qual tratamento de risco isso representa?",
      opcoes: ["Aceitar o risco", "Evitar ou transferir o risco, eliminando o dado do sistema e deixando-o com quem é especializado", "Ignorar o risco", "Aumentar a probabilidade"],
      correta: 1,
      explicacao: "O que não é armazenado não pode vazar. Deixar os cartões com um provedor especializado elimina e transfere o risco, em vez de apenas tentar proteger os dados.",
    },
    {
      enunciado: "O que significa o princípio \"falhar de forma segura\"?",
      opcoes: ["O sistema nunca falha", "O sistema reinicia sozinho", "Os erros são exibidos em detalhe ao usuário", "Quando algo dá errado (por exemplo, o serviço de autorização cai), o sistema nega o acesso em vez de liberá-lo"],
      correta: 3,
      explicacao: "Em caso de dúvida ou de falha, a resposta padrão deve ser a mais restritiva. Liberar o acesso quando a verificação falha transforma qualquer pane em uma brecha.",
    },
    {
      enunciado: "Por que \"já temos um firewall\" não é suficiente como estratégia de segurança?",
      opcoes: ["Porque firewalls não funcionam", "Porque uma única camada vira ponto único de falha; é preciso defesa em profundidade, com várias camadas independentes", "Porque firewalls são proibidos", "Porque só protegem contra vírus"],
      correta: 1,
      explicacao: "Se a única defesa falhar ou for contornada, nada mais protege o sistema. Camadas independentes (validação, consultas parametrizadas, permissões mínimas, monitoramento) fazem uma falha não se tornar um desastre.",
    },
  ],
  desafio: {
    titulo: "O modelo de ameaças de um sistema que você conhece",
    enunciado: "Escolha um sistema que você conhece bem (um projeto seu, o de um estágio ou um aplicativo conhecido) e faça o seu modelo de ameaças simples, adaptando o risco.py. Não é preciso testar nada em sistemas reais: o foco é raciocinar sobre o que pode dar errado e o que fazer a respeito.",
    requisitos: [
      "Desenhe o sistema em texto (usuários, aplicações, bancos, serviços externos) e marque as fronteiras de confiança.",
      "Liste os 5 ativos mais importantes e, para cada um, qual propriedade da tríade CIA é a mais crítica.",
      "Para três componentes do desenho, passe pelas seis letras do STRIDE e escreva ao menos uma ameaça plausível para cada uma de pelo menos quatro letras.",
      "Adapte o script risco.py com as suas 8 ameaças, com probabilidade, impacto e o controle proposto, e rode-o para ordenar a lista.",
      "Para as três ameaças de maior risco, escolha o tratamento (mitigar, evitar, transferir ou aceitar) e justifique em uma frase, indicando em qual camada de defesa ele atua.",
    ],
    criterios: [
      "As ameaças são específicas do sistema, e não frases genéricas como \"hackers atacam\".",
      "As notas de probabilidade e impacto têm uma justificativa curta, e não são todas iguais.",
      "Os controles propostos agem em camadas diferentes, e não repetem a mesma defesa.",
      "Há pelo menos uma ameaça de cada propriedade da tríade.",
      "Você consegue explicar a lista em dois minutos para alguém que não é da área técnica.",
    ],
    dica: "Se travar, comece pelas fronteiras de confiança: pense em tudo o que entra no sistema vindo de fora (formulários, arquivos enviados, chamadas de API, e-mails) e, para cada entrada, pergunte o que aconteceria se ela fosse escrita por um atacante.",
  },
  referencias: [
    { titulo: "OWASP Top 10 (em inglês)", url: "https://owasp.org/www-project-top-ten/" },
    { titulo: "OWASP: guia de modelagem de ameaças (em inglês)", url: "https://cheatsheetseries.owasp.org/cheatsheets/Threat_Modeling_Cheat_Sheet.html" },
    { titulo: "OWASP: guia de projeto seguro de produtos (em inglês)", url: "https://cheatsheetseries.owasp.org/cheatsheets/Secure_Product_Design_Cheat_Sheet.html" },
  ],
};
