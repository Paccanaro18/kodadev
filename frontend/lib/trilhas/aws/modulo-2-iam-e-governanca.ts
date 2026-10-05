import type { Modulo } from "../tipos";

export const AWS_MODULO_2: Modulo = {
  tipo: "modulo",
  slug: "iam-e-governanca-de-contas",
  titulo: "Identidade e acesso: IAM, políticas e AWS Organizations",
  resumo: "Usuários, grupos, funções e políticas do IAM, o menor privilégio na prática, credenciais temporárias e a governança de várias contas.",
  nivel: "Iniciante",
  leitura: "45 min",
  objetivos: [
    "Diferenciar o usuário raiz, usuários, grupos e funções (roles) do IAM e saber quando usar cada um.",
    "Ler e escrever uma política IAM em JSON, identificando efeito, ação, recurso e condição.",
    "Explicar como a AWS decide permitir ou negar um acesso, incluindo a regra do negar explícito.",
    "Aplicar o princípio do menor privilégio e as boas práticas de proteção de credenciais.",
    "Explicar o papel do AWS Organizations, das unidades organizacionais e das políticas de controle de serviço.",
  ],
  preRequisitos: [
    "Ter feito o módulo \"Nuvem, infraestrutura global e responsabilidade compartilhada\".",
    "Saber ler um JSON simples.",
  ],
  pontosChave: [
    "Toda requisição na AWS é negada por padrão: só passa com um Allow explícito e sem Deny explícito.",
    "O usuário raiz tem poder total e deve ser protegido com MFA e usado só nas poucas tarefas que exigem.",
    "Para aplicações e serviços, use funções (roles) com credenciais temporárias, e não chaves de acesso fixas.",
    "Dê só as permissões necessárias para a tarefa (menor privilégio) e revise-as com frequência.",
    "SCPs do Organizations definem o limite máximo de permissões de uma conta, mas não concedem acesso sozinhas.",
  ],
  blocos: [
    { tipo: "p", texto: "Segurança e conformidade é o maior domínio do exame (30%), e o AWS Identity and Access Management (IAM) está no centro dele. O IAM responde a duas perguntas sobre qualquer requisição que chega à AWS: quem é você (autenticação) e o que você pode fazer (autorização). Ele é um serviço global, sem custo adicional, e é a primeira coisa que você deve entender antes de criar qualquer recurso." },

    { tipo: "h", texto: "As identidades do IAM" },
    { tipo: "p", texto: "Ao criar uma conta AWS, você recebe uma identidade chamada usuário raiz (root), o e-mail com que a conta foi aberta. Ela tem acesso total a tudo e não pode ser limitada por políticas comuns. Por isso, a regra é protegê-la com uma senha forte e autenticação multifator (MFA), não criar chaves de acesso para ela e deixá-la de lado no dia a dia. Poucas tarefas exigem o usuário raiz, como alterar o plano de suporte ou fechar a conta." },
    { tipo: "p", texto: "No dia a dia, as pessoas e os sistemas usam outras identidades. O IAM oferece quatro conceitos principais." },
    { tipo: "tabela", legenda: "As identidades do IAM", cabecalho: ["Conceito", "O que é", "Quando usar"], linhas: [
      ["Usuário", "Uma identidade permanente, com nome e credenciais próprias, que representa uma pessoa ou uma aplicação.", "Acessos individuais de longa duração, quando não há uma alternativa melhor."],
      ["Grupo", "Um conjunto de usuários que compartilham as mesmas permissões. Um grupo contém usuários, não outros grupos.", "Dar permissões a equipes (desenvolvedores, financeiro) de uma só vez."],
      ["Função (role)", "Uma identidade sem credenciais permanentes, que quem precisa \"assume\" e recebe credenciais temporárias.", "Aplicações no EC2 ou no Lambda, acesso entre contas e acesso de usuários externos."],
      ["Política", "Um documento JSON que lista o que é permitido ou negado.", "Anexada a usuários, grupos e funções (e a recursos como buckets)."],
    ] },
    { tipo: "p", texto: "A diferença entre um usuário e uma função é a chave para a prova e para a prática. Um usuário tem uma senha ou uma chave de acesso que vale até ser removida; se vazar, o estrago dura. Uma função não tem credencial fixa: quando uma instância EC2 ou uma função Lambda precisa acessar um bucket do S3, ela assume uma função e recebe, do AWS Security Token Service (STS), credenciais temporárias que expiram sozinhas em horas. Não há segredo para guardar nem para vazar." },
    { tipo: "dica", titulo: "Aplicação na AWS? Use uma função", texto: "Se a pergunta descreve uma aplicação em execução na AWS que precisa acessar outro serviço, a resposta quase sempre é uma função IAM anexada ao recurso (um perfil de instância no EC2, a função de execução no Lambda), e nunca chaves de acesso gravadas no código ou em um arquivo de configuração." },

    { tipo: "h", texto: "Políticas: o documento que decide" },
    { tipo: "p", texto: "Uma política IAM é um documento JSON com uma lista de instruções (Statement). Cada instrução responde a quatro perguntas: qual o efeito (Effect: Allow ou Deny), sobre quais ações (Action), em quais recursos (Resource) e, opcionalmente, sob qual condição (Condition). O exemplo abaixo dá acesso somente de leitura a um bucket do Amazon S3." },
    { tipo: "codigo", linguagem: "json", legenda: "politica-leitura-s3.json", texto: `{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "LeituraDoBucket",
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::meu-bucket-exemplo",
        "arn:aws:s3:::meu-bucket-exemplo/*"
      ]
    }
  ]
}` },
    { tipo: "p", texto: "Leia a política em português: \"permitir buscar objetos e listar o conteúdo do bucket meu-bucket-exemplo\". Repare que há dois recursos: o bucket em si (necessário para listar) e os objetos dentro dele, indicados pelo /* no fim (necessário para ler cada objeto). Esquecer um dos dois é um dos erros mais frequentes. O campo Version é sempre 2012-10-17, a versão atual da linguagem de políticas, e não é uma data de criação." },
    { tipo: "h3", texto: "Condições: permissão com contexto" },
    { tipo: "p", texto: "O bloco Condition restringe quando uma instrução vale. É assim que se exige MFA para ações sensíveis, se limita o acesso a uma faixa de IPs ou a certas Regiões. A política a seguir permite parar instâncias EC2 somente se a pessoa se autenticou com MFA." },
    { tipo: "codigo", linguagem: "json", legenda: "politica-com-mfa.json", texto: `{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": "ec2:StopInstances",
      "Resource": "*",
      "Condition": {
        "Bool": { "aws:MultiFactorAuthPresent": "true" }
      }
    }
  ]
}` },
    { tipo: "h3", texto: "Funções: quem pode assumir" },
    { tipo: "p", texto: "Uma função tem dois tipos de política. As políticas de permissão dizem o que quem assumiu a função pode fazer. A política de confiança (trust policy) diz quem pode assumi-la. Para uma função que o serviço EC2 vai usar, a confiança aponta para o próprio serviço." },
    { tipo: "codigo", linguagem: "json", legenda: "politica-de-confianca-ec2.json", texto: `{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": { "Service": "ec2.amazonaws.com" },
      "Action": "sts:AssumeRole"
    }
  ]
}` },

    { tipo: "h", texto: "Como a AWS decide: negado por padrão" },
    { tipo: "p", texto: "A avaliação segue regras simples que o exame cobra com frequência. Primeira: tudo é negado por padrão, ou seja, sem um Allow explícito, o acesso não acontece. Segunda: se algum Deny explícito se aplicar, ele vence, mesmo que haja um Allow em outra política. Terceira: se não há Deny e há um Allow, o acesso é permitido. A ordem de leitura das políticas não importa; só o resultado combinado." },
    { tipo: "tabela", legenda: "Como as permissões se combinam", cabecalho: ["Situação", "Resultado"], linhas: [
      ["Nenhuma política menciona a ação", "Negado (negado por padrão)"],
      ["Uma política tem Allow e nenhuma tem Deny", "Permitido"],
      ["Uma política tem Allow e outra tem Deny para a mesma ação", "Negado (o Deny explícito sempre vence)"],
    ] },
    { tipo: "alerta", titulo: "Um Allow não é um \"sempre\"", texto: "Se sua política permite a ação mas o acesso foi negado, procure um Deny explícito em outra política (inclusive uma política de controle de serviço do Organizations, no fim deste módulo), uma política de recurso que não concede acesso à sua identidade ou uma condição que não foi atendida." },

    { tipo: "h", texto: "Menor privilégio e boas práticas" },
    { tipo: "p", texto: "O princípio do menor privilégio diz que cada identidade deve ter apenas as permissões necessárias para a tarefa, e por apenas o tempo necessário. Parece óbvio, mas o caminho mais fácil é dar acesso total (AdministratorAccess ou \"Action\": \"*\") \"só para funcionar\", e esse atalho vira o maior risco da conta. Comece com pouco, adicione conforme a necessidade e use as ferramentas da AWS para descobrir o que realmente é usado." },
    { tipo: "lista", itens: [
      "Proteja o usuário raiz: MFA, sem chaves de acesso e uso só nas tarefas que exigem.",
      "Exija MFA para os usuários, em especial os com permissões administrativas.",
      "Use grupos para atribuir permissões e funções para aplicações e acesso temporário.",
      "Não compartilhe credenciais e não as grave em código ou repositórios.",
      "Defina uma política de senhas e troque ou desative chaves de acesso antigas.",
      "Revise permissões com regularidade: o IAM Access Advisor mostra os últimos acessos a serviços, o relatório de credenciais lista as credenciais da conta e o IAM Access Analyzer aponta recursos compartilhados fora da conta.",
    ] },
    { tipo: "p", texto: "Para pessoas da empresa, a recomendação atual é não criar um usuário IAM para cada uma, e sim centralizar o acesso no AWS IAM Identity Center (o antigo AWS Single Sign-On). Ele permite que as pessoas entrem com a identidade da empresa, em um portal único, e recebam credenciais temporárias para as contas e funções que lhes foram atribuídas." },
    { tipo: "codigo", linguagem: "bash", legenda: "Exemplo: grupo, usuário e permissão pela CLI", texto: `aws iam create-group --group-name desenvolvedores
aws iam attach-group-policy --group-name desenvolvedores \\
    --policy-arn arn:aws:iam::aws:policy/ReadOnlyAccess

aws iam create-user --user-name maria
aws iam add-user-to-group --user-name maria --group-name desenvolvedores` },
    { tipo: "p", texto: "O comando acima usa uma política gerenciada pela AWS (ReadOnlyAccess), mantida pela própria AWS. Há ainda as políticas gerenciadas pelo cliente, criadas e reutilizáveis por você, e as políticas em linha (inline), embutidas em uma única identidade, que só se justificam quando a permissão é estritamente específica daquela identidade." },

    { tipo: "h", texto: "AWS Organizations: governança de várias contas" },
    { tipo: "p", texto: "Quando a empresa cresce, uma conta única fica pequena: ambientes de produção e de testes se misturam, as permissões ficam complexas e o impacto de um erro é grande. A boa prática é usar várias contas, e o AWS Organizations as gerencia em conjunto. Ele permite criar contas por API, agrupá-las em unidades organizacionais (OUs), aplicar regras a grupos inteiros e receber uma única fatura consolidada." },
    { tipo: "lista", itens: [
      "Conta de gerenciamento: a conta que criou a organização e paga as despesas de todas.",
      "Unidades organizacionais (OUs): agrupamentos hierárquicos de contas, como Produção, Desenvolvimento e Segurança.",
      "Cobrança consolidada: uma só fatura para todas as contas e a soma dos usos, que pode render descontos por volume.",
      "Políticas de controle de serviço (SCPs): regras que definem o limite máximo de permissões das contas em uma OU.",
    ] },
    { tipo: "p", texto: "As SCPs são a ferramenta de governança mais cobrada. Uma SCP não concede permissão a ninguém: ela apenas limita o que pode ser concedido. Se uma SCP negar uma ação, nem o administrador da conta consegue executá-la, mesmo que uma política IAM a permita. A SCP abaixo impede o uso de qualquer Região diferente de São Paulo, com exceção de alguns serviços globais." },
    { tipo: "codigo", linguagem: "json", legenda: "scp-somente-sao-paulo.json", texto: `{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "NegarForaDeSaoPaulo",
      "Effect": "Deny",
      "NotAction": [
        "iam:*",
        "organizations:*",
        "route53:*",
        "cloudfront:*",
        "support:*"
      ],
      "Resource": "*",
      "Condition": {
        "StringNotEquals": {
          "aws:RequestedRegion": ["sa-east-1"]
        }
      }
    }
  ]
}` },
    { tipo: "alerta", titulo: "SCP não dá permissão", texto: "Para uma ação ser permitida em uma conta de uma organização, ela precisa ser permitida pela SCP (o limite) e também por uma política IAM da identidade (a concessão). A SCP é o teto, e a política IAM é o que de fato se concede. As SCPs também não afetam a conta de gerenciamento." },

    { tipo: "h", texto: "Como o exame pergunta isso" },
    { tipo: "lista", itens: [
      "\"Dar permissão a uma aplicação no EC2 sem guardar chaves\": função IAM com perfil de instância.",
      "\"Dar a uma equipe as mesmas permissões\": grupo IAM.",
      "\"Proteger a conta contra o roubo de uma senha\": autenticação multifator (MFA).",
      "\"Limitar as ações permitidas em todas as contas de uma OU\": SCP do Organizations.",
      "\"Ver quais permissões um usuário realmente usou\": IAM Access Advisor.",
      "\"Uma fatura para todas as contas\": cobrança consolidada do Organizations.",
    ] },
  ],
  questoes: [
    {
      enunciado: "Qual é a recomendação para o usuário raiz (root) de uma conta AWS?",
      opcoes: ["Usá-lo para todas as tarefas do dia a dia", "Protegê-lo com MFA, sem chaves de acesso, e usá-lo só nas tarefas que exigem", "Compartilhar a senha com a equipe de TI", "Apagá-lo depois de criar os usuários IAM"],
      correta: 1,
      explicacao: "O usuário raiz tem poder total e não pode ser limitado por políticas comuns. Deve ter MFA, não deve ter chaves de acesso e deve ficar reservado às poucas tarefas que só ele pode fazer. Ele não pode ser apagado.",
    },
    {
      enunciado: "Uma aplicação em uma instância EC2 precisa ler arquivos de um bucket S3. Qual é a forma recomendada de dar a permissão?",
      opcoes: ["Gravar uma chave de acesso de um usuário IAM no código", "Tornar o bucket público", "Anexar à instância uma função (role) IAM com a permissão necessária", "Usar as credenciais do usuário raiz"],
      correta: 2,
      explicacao: "Funções fornecem credenciais temporárias, entregues automaticamente à instância, sem segredos no código. Chaves fixas podem vazar, o usuário raiz tem poder demais e um bucket público expõe os dados a todos.",
    },
    {
      enunciado: "Um usuário tem uma política com Allow para s3:DeleteObject, mas outra política aplicada a ele tem Deny para a mesma ação. Qual o resultado?",
      opcoes: ["Permitido, porque o Allow vem primeiro", "Negado, porque o Deny explícito sempre prevalece", "Depende da data de criação das políticas", "Permitido apenas com MFA"],
      correta: 1,
      explicacao: "Na avaliação do IAM, um Deny explícito vence qualquer Allow. A ordem das políticas não importa.",
    },
    {
      enunciado: "O que significa o princípio do menor privilégio?",
      opcoes: ["Conceder apenas as permissões necessárias para a tarefa, e nada além disso", "Dar a todos as permissões de administrador para evitar chamados", "Usar apenas contas com poucos recursos", "Cobrar menos dos usuários com menos acesso"],
      correta: 0,
      explicacao: "Cada identidade deve ter somente o que precisa para cumprir a sua função. Isso reduz o estrago caso a credencial vaze ou haja um erro humano.",
    },
    {
      enunciado: "Qual a função de uma SCP (política de controle de serviço) no AWS Organizations?",
      opcoes: ["Conceder permissões aos usuários das contas", "Criar usuários IAM em todas as contas", "Consolidar a fatura", "Definir o limite máximo de permissões das contas de uma OU, sem conceder acesso"],
      correta: 3,
      explicacao: "As SCPs funcionam como um teto: limitam o que as contas podem fazer, mas quem concede as permissões são as políticas IAM. A consolidação da fatura é outro recurso do Organizations.",
    },
    {
      enunciado: "O que uma política IAM contém obrigatoriamente em cada instrução (Statement)?",
      opcoes: ["Apenas o nome do usuário", "Efeito (Effect), ação (Action) e recurso (Resource)", "A senha do usuário", "A Região e a Zona de Disponibilidade"],
      correta: 1,
      explicacao: "Cada instrução diz se permite ou nega (Effect), quais ações (Action) e sobre quais recursos (Resource). A Condition é opcional, e Principal só aparece em políticas de recurso e de confiança.",
    },
    {
      enunciado: "Qual ferramenta ajuda a identificar quais serviços um usuário IAM realmente acessou, para reduzir permissões em excesso?",
      opcoes: ["AWS Shield", "Amazon Route 53", "IAM Access Advisor", "AWS Direct Connect"],
      correta: 2,
      explicacao: "O IAM Access Advisor mostra, para cada identidade, os serviços permitidos e quando foram acessados pela última vez. Isso apoia o ajuste para o menor privilégio. Shield protege contra DDoS, e o Route 53 é o serviço de DNS.",
    },
  ],
  desafio: {
    titulo: "Desenhando o acesso de uma equipe",
    enunciado: "Uma empresa tem três grupos: desenvolvedores (precisam ler e escrever em um bucket de testes), analistas (só leem relatórios em outro bucket) e administradores (gerenciam o IAM). Escreva, em arquivos JSON, as políticas que implementam o menor privilégio e um plano de proteção das credenciais. Não é preciso uma conta AWS para este desafio, mas, se tiver uma, teste no simulador de políticas do IAM.",
    requisitos: [
      "Escreva a política dos desenvolvedores: leitura e escrita (GetObject, PutObject, ListBucket) somente no bucket de testes.",
      "Escreva a política dos analistas: só leitura, só no bucket de relatórios, e com exigência de MFA por uma condição.",
      "Escreva a política de confiança de uma função para uma aplicação no Lambda (o serviço lambda.amazonaws.com).",
      "Escreva uma SCP que negue a desativação do CloudTrail para todas as contas de uma OU de produção.",
      "Descreva em cinco linhas como o usuário raiz será protegido e quando ele poderá ser usado.",
    ],
    criterios: [
      "Todos os arquivos são JSON válidos e usam Version 2012-10-17.",
      "As políticas não usam \"Action\": \"*\" nem \"Resource\": \"*\" sem uma justificativa clara.",
      "Os recursos distinguem o bucket (ListBucket) dos objetos (/*), como no exemplo do módulo.",
      "A política dos analistas usa a condição aws:MultiFactorAuthPresent corretamente.",
      "Você consegue explicar a diferença entre a política de permissão e a política de confiança de uma função.",
    ],
    dica: "Depois de escrever, leia cada instrução em voz alta em português (\"permitir ... em ... somente se ...\"). Se algo soar largo demais, ele provavelmente está.",
  },
  referencias: [
    { titulo: "AWS: melhores práticas de segurança no IAM", url: "https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html" },
    { titulo: "AWS: referência da linguagem de políticas JSON do IAM", url: "https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_grammar.html" },
    { titulo: "AWS: políticas de controle de serviço (SCPs)", url: "https://docs.aws.amazon.com/organizations/latest/userguide/orgs_manage_policies_scps.html" },
  ],
};
