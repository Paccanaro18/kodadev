import type { Modulo } from "../tipos";

export const AWS_MODULO_4: Modulo = {
  tipo: "modulo",
  slug: "armazenamento-s3-ebs-e-efs",
  titulo: "Armazenamento: S3, EBS, EFS e classes de armazenamento",
  resumo: "Os três tipos de armazenamento (objetos, blocos e arquivos), as classes e o ciclo de vida do S3, a proteção de buckets e como escolher e reduzir custos.",
  nivel: "Iniciante",
  leitura: "55 min",
  objetivos: [
    "Diferenciar armazenamento de objetos, de blocos e de arquivos e associar cada um ao serviço certo.",
    "Escolher a classe de armazenamento do S3 pelo padrão de acesso e configurar regras de ciclo de vida.",
    "Proteger um bucket: bloqueio de acesso público, políticas, criptografia e versionamento.",
    "Descrever EBS, EFS e FSx e quando usar cada um.",
    "Explicar como mover dados e protegê-los com Storage Gateway, a família Snow e o AWS Backup.",
  ],
  preRequisitos: [
    "Ter feito os módulos de conceitos de nuvem, IAM e computação.",
  ],
  pontosChave: [
    "Objetos (S3), blocos (EBS) e arquivos (EFS, FSx) resolvem problemas diferentes: escolha pelo modo de acesso.",
    "O S3 é durável (onze noves) e escalável; a classe de armazenamento define custo e tempo de acesso.",
    "Regras de ciclo de vida movem objetos para classes mais baratas e apagam os que não servem mais.",
    "Buckets novos são privados por padrão: cuidado com políticas que abrem o acesso ao público.",
    "Um volume EBS vive em uma só Zona de Disponibilidade e se liga a instâncias EC2; o EFS é compartilhado entre instâncias de várias AZs.",
  ],
  blocos: [
    { tipo: "p", texto: "Todo sistema guarda dados, e a AWS oferece vários serviços de armazenamento porque dados diferentes pedem acessos diferentes: fotos de usuários, o disco do sistema operacional de um servidor, uma pasta compartilhada entre dezenas de máquinas e um backup que ninguém abre há cinco anos. O exame cobra que você reconheça o tipo de armazenamento a partir da descrição e que escolha a opção mais barata que ainda atenda à necessidade." },
    { tipo: "tabela", legenda: "Os três modelos de armazenamento", cabecalho: ["Modelo", "Como se acessa", "Serviço na AWS", "Exemplos de uso"], linhas: [
      ["Objetos", "Pela API HTTP, por nome (chave), cada arquivo é um objeto inteiro.", "Amazon S3", "Imagens, vídeos, backups, logs, sites estáticos, data lakes."],
      ["Blocos", "Como um disco ligado a um servidor; o sistema operacional formata e usa.", "Amazon EBS", "Disco do sistema, bancos de dados em instâncias EC2."],
      ["Arquivos", "Como uma pasta de rede compartilhada entre vários servidores.", "Amazon EFS, Amazon FSx", "Conteúdo compartilhado, diretórios de usuários, aplicações legadas."],
    ] },

    { tipo: "h", texto: "Amazon S3: armazenamento de objetos" },
    { tipo: "p", texto: "O Amazon Simple Storage Service (S3) guarda objetos (um arquivo mais seus metadados) em recipientes chamados buckets. O nome do bucket é único no mundo todo, e cada objeto é identificado por uma chave, como relatorios/2026/janeiro.pdf. Embora o console mostre pastas, o S3 não tem hierarquia de verdade: o \"relatorios/2026/\" é só um prefixo na chave. Um objeto pode ter até 5 terabytes, e o S3 não tem limite de quantidade de objetos nem exige que você planeje a capacidade." },
    { tipo: "p", texto: "O S3 é projetado para durabilidade de 99,999999999% (onze noves): os dados são copiados automaticamente entre vários dispositivos em pelo menos três Zonas de Disponibilidade da Região (exceto na classe One Zone). Isso não é o mesmo que disponibilidade, que é a chance de conseguir acessá-los em um dado momento e varia conforme a classe. Os dados ficam na Região escolhida e só saem dela se você os copiar, o que importa para conformidade." },
    { tipo: "codigo", linguagem: "bash", legenda: "Operações básicas no S3 pela CLI", texto: `aws s3 mb s3://meu-bucket-exemplo --region sa-east-1          # cria o bucket
aws s3 cp relatorio.pdf s3://meu-bucket-exemplo/relatorios/   # envia um arquivo
aws s3 ls s3://meu-bucket-exemplo/relatorios/                 # lista por prefixo
aws s3 sync ./site s3://meu-bucket-exemplo/site/ --delete      # sincroniza uma pasta
aws s3 presign s3://meu-bucket-exemplo/relatorios/relatorio.pdf --expires-in 600` },
    { tipo: "p", texto: "O último comando gera uma URL pré-assinada: um link temporário (aqui, de 10 minutos) que dá acesso a um objeto privado sem tornar o bucket público, ideal para compartilhar um arquivo com alguém sem conta na AWS." },

    { tipo: "h3", texto: "Classes de armazenamento" },
    { tipo: "p", texto: "A classe de armazenamento é a principal alavanca de custo do S3: quanto menos você precisa acessar um dado, mais barato é guardá-lo, e mais caro (ou mais lento) é recuperá-lo. A escolha pelo padrão de acesso é um dos temas mais frequentes da prova." },
    { tipo: "tabela", legenda: "Classes do S3, da mais acessível à mais fria", cabecalho: ["Classe", "Para quê", "Detalhes que a prova cobra"], linhas: [
      ["S3 Standard", "Dados acessados com frequência.", "Baixa latência, alta disponibilidade, sem taxa de recuperação."],
      ["S3 Intelligent-Tiering", "Padrão de acesso desconhecido ou que muda.", "Move os objetos entre camadas automaticamente conforme o uso, sem taxas de recuperação."],
      ["S3 Standard-IA", "Acesso infrequente, mas que precisa ser imediato.", "Armazenamento mais barato, com taxa por recuperação e permanência mínima de 30 dias."],
      ["S3 One Zone-IA", "Acesso infrequente, dados que podem ser recriados.", "Guarda em uma única AZ: mais barato, e os dados se perdem se a AZ for destruída."],
      ["S3 Glacier Instant Retrieval", "Arquivo acessado raramente, mas que precisa de acesso imediato.", "Recuperação em milissegundos."],
      ["S3 Glacier Flexible Retrieval", "Arquivos que podem esperar minutos a horas.", "Muito barato; recuperação em minutos a horas."],
      ["S3 Glacier Deep Archive", "Retenção de longo prazo (anos), acesso raríssimo.", "A mais barata; recuperação em horas (até cerca de dois dias)."],
    ] },
    { tipo: "alerta", titulo: "Mais barato para guardar nem sempre é mais barato no total", texto: "Classes frias cobram por recuperação e têm tempo mínimo de permanência. Mover para uma classe fria um dado que será lido toda semana sai mais caro do que deixá-lo no Standard. Escolha pelo padrão de acesso real, e use o Intelligent-Tiering quando ele for desconhecido." },

    { tipo: "h3", texto: "Ciclo de vida: automatizando a economia" },
    { tipo: "p", texto: "Um relatório é consultado todo dia no primeiro mês, de vez em quando nos três meses seguintes e quase nunca depois, mas precisa ser guardado por sete anos por exigência legal. Mover cada arquivo à mão seria impraticável. As regras de ciclo de vida do S3 fazem isso por você: transições para classes mais baratas depois de certo número de dias e expiração (exclusão) quando a retenção acabou. A simulação abaixo reproduz a lógica das regras da configuração que vem em seguida." },
    { tipo: "codigo", linguagem: "python", legenda: "ciclo_de_vida.py", texto: `REGRAS = [
    (30, "STANDARD_IA"),
    (90, "GLACIER_FLEXIBLE"),
    (365, "DEEP_ARCHIVE"),
]
EXPIRA_EM_DIAS = 2555  # cerca de sete anos


def classe_do_objeto(dias_desde_a_criacao: int) -> str:
    if dias_desde_a_criacao >= EXPIRA_EM_DIAS:
        return "EXPIRADO (apagado)"
    classe = "STANDARD"
    for dias, destino in REGRAS:
        if dias_desde_a_criacao >= dias:
            classe = destino
    return classe


for dias in (0, 29, 30, 120, 400, 3000):
    print(f"{dias:>4} dias -> {classe_do_objeto(dias)}")` },
    { tipo: "codigo", linguagem: "text", legenda: "Saída", texto: `   0 dias -> STANDARD
  29 dias -> STANDARD
  30 dias -> STANDARD_IA
 120 dias -> GLACIER_FLEXIBLE
 400 dias -> DEEP_ARCHIVE
3000 dias -> EXPIRADO (apagado)` },
    { tipo: "codigo", linguagem: "json", legenda: "ciclo-de-vida.json", texto: `{
  "Rules": [
    {
      "ID": "ArquivarRelatorios",
      "Status": "Enabled",
      "Filter": { "Prefix": "relatorios/" },
      "Transitions": [
        { "Days": 30, "StorageClass": "STANDARD_IA" },
        { "Days": 90, "StorageClass": "GLACIER" },
        { "Days": 365, "StorageClass": "DEEP_ARCHIVE" }
      ],
      "Expiration": { "Days": 2555 }
    }
  ]
}` },
    { tipo: "p", texto: "A configuração se aplica aos objetos com o prefixo relatorios/ e é aplicada com aws s3api put-bucket-lifecycle-configuration. (No JSON, GLACIER é o nome da classe Glacier Flexible Retrieval.)" },

    { tipo: "h3", texto: "Protegendo os dados no S3" },
    { tipo: "lista", itens: [
      "Bloqueio de acesso público (Block Public Access): um interruptor, por bucket ou por conta, que impede que políticas ou ACLs deixem os dados abertos à internet. Mantenha-o ligado, a menos que haja um motivo muito claro.",
      "Políticas de bucket e do IAM: definem quem pode fazer o quê. Prefira políticas a ACLs, que são um mecanismo antigo e hoje vêm desativadas por padrão em buckets novos.",
      "Criptografia: todos os objetos novos são criptografados em repouso por padrão, com chaves gerenciadas pelo S3 (SSE-S3). Para controlar as chaves e auditar o uso, use o AWS KMS (SSE-KMS). A criptografia em trânsito é feita com HTTPS.",
      "Versionamento: guarda todas as versões de um objeto, o que protege contra exclusões e sobrescritas acidentais, e permite recuperar uma versão anterior.",
      "Replicação entre Regiões ou na mesma Região: copia os objetos automaticamente, para recuperação de desastres ou conformidade.",
      "Registros de acesso e eventos: o CloudTrail registra as chamadas de API, e o S3 pode avisar uma função Lambda quando um objeto chega.",
    ] },
    { tipo: "codigo", linguagem: "json", legenda: "politica-somente-https.json", texto: `{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "SomenteConexoesSeguras",
      "Effect": "Deny",
      "Principal": "*",
      "Action": "s3:*",
      "Resource": [
        "arn:aws:s3:::meu-bucket-exemplo",
        "arn:aws:s3:::meu-bucket-exemplo/*"
      ],
      "Condition": {
        "Bool": { "aws:SecureTransport": "false" }
      }
    }
  ]
}` },
    { tipo: "p", texto: "Essa política de bucket nega qualquer acesso que não use HTTPS (aws:SecureTransport igual a false). Repare que o Principal é \"*\", mas o efeito é Deny: o asterisco aqui significa \"qualquer pessoa\", e, como é uma negação, a política só restringe, e não abre o bucket ao público. Distinguir um Allow com Principal \"*\" (perigoso) de um Deny com Principal \"*\" (restritivo) é uma habilidade importante." },
    { tipo: "alerta", titulo: "O vazamento mais comum da nuvem", texto: "Buckets públicos por engano estão entre as maiores causas de vazamentos de dados. Um Allow com Principal \"*\" em um bucket sem o bloqueio de acesso público dá a qualquer pessoa na internet acesso aos seus objetos. Revise regularmente, ative o bloqueio de acesso público e use o IAM Access Analyzer para apontar buckets compartilhados fora da conta." },
    { tipo: "p", texto: "O S3 também hospeda sites estáticos (HTML, CSS, JavaScript) diretamente de um bucket, e, combinado com o CloudFront, serve o conteúdo com HTTPS e baixa latência. O S3 Transfer Acceleration acelera envios de longa distância usando os pontos de presença da AWS, e o envio em partes (multipart upload) é recomendado para arquivos grandes." },

    { tipo: "h", texto: "Amazon EBS: discos para as instâncias" },
    { tipo: "p", texto: "O Amazon Elastic Block Store (EBS) fornece volumes de bloco, que se comportam como discos conectados a uma instância EC2. É o que guarda o sistema operacional e os dados de um servidor, e persiste independentemente da instância: parar ou apagar a instância não precisa apagar o volume. Cada volume existe em uma única Zona de Disponibilidade e só pode ser ligado a instâncias da mesma AZ. Os snapshots são cópias incrementais do volume, guardadas pela AWS com durabilidade do S3, e servem de backup e para recriar o volume em outra AZ ou Região." },
    { tipo: "tabela", legenda: "Principais tipos de volume EBS", cabecalho: ["Tipo", "Mídia", "Uso"], linhas: [
      ["gp3 (e gp2)", "SSD de uso geral", "A escolha padrão: sistemas de arquivos, aplicações, desenvolvimento."],
      ["io2 (io1)", "SSD de IOPS provisionadas", "Bancos de dados que exigem desempenho alto e consistente."],
      ["st1", "HDD otimizado para vazão", "Processamento de grandes volumes sequenciais, como logs e data warehouses."],
      ["sc1", "HDD frio", "Dados acessados raramente, com o menor custo."],
    ] },
    { tipo: "p", texto: "Algumas instâncias têm também armazenamento local, chamado instance store. Ele é muito rápido, mas efêmero: os dados se perdem se a instância for parada ou terminada, ou se o hardware falhar. Serve para cache e dados temporários, nunca para o que precisa ser guardado." },

    { tipo: "h", texto: "Armazenamento de arquivos: EFS e FSx" },
    { tipo: "p", texto: "Quando vários servidores precisam enxergar as mesmas pastas e arquivos ao mesmo tempo, usa-se um sistema de arquivos compartilhado. O Amazon EFS (Elastic File System) é um sistema de arquivos NFS para Linux, elástico (cresce e encolhe sozinho conforme o uso) e distribuído por várias Zonas de Disponibilidade, que pode ser montado por milhares de instâncias EC2. Para outras necessidades, há a família Amazon FSx, com sistemas gerenciados de terceiros: o FSx for Windows File Server (compartilhamentos SMB, integrado ao Active Directory), o FSx for Lustre (computação de alto desempenho e aprendizado de máquina), além de versões para NetApp ONTAP e OpenZFS." },
    { tipo: "tabela", legenda: "Qual armazenamento escolher", cabecalho: ["Necessidade", "Serviço"], linhas: [
      ["Imagens, vídeos, backups e arquivos acessados por HTTP, com escala praticamente ilimitada", "Amazon S3"],
      ["Disco de uma única instância EC2, de alto desempenho (banco de dados, sistema operacional)", "Amazon EBS"],
      ["Pasta compartilhada entre várias instâncias Linux em várias AZs", "Amazon EFS"],
      ["Compartilhamento de arquivos Windows (SMB) com Active Directory", "Amazon FSx for Windows File Server"],
      ["Sistema de arquivos para computação de alto desempenho", "Amazon FSx for Lustre"],
    ] },

    { tipo: "h", texto: "Movendo e protegendo dados" },
    { tipo: "lista", itens: [
      "AWS Storage Gateway: conecta o ambiente local à nuvem, apresentando arquivos, volumes ou fitas virtuais que, por baixo, são guardados no S3. É a ponte clássica da nuvem híbrida.",
      "Família AWS Snow (como o Snowball Edge): dispositivos físicos enviados a você para mover grandes volumes de dados para a AWS, quando a rede seria lenta demais, e para computação em locais remotos.",
      "AWS DataSync: transfere dados de forma automatizada e rápida entre o ambiente local e o armazenamento da AWS.",
      "AWS Backup: serviço central para definir políticas de backup e retenção para vários serviços (EBS, EFS, RDS, DynamoDB e outros), em um único lugar.",
    ] },
    { tipo: "h3", texto: "Como o exame pergunta isso" },
    { tipo: "lista", itens: [
      "\"Armazenar imagens e vídeos, com escala ilimitada e baixo custo\": S3.",
      "\"Dados que raramente são acessados, mas devem ser mantidos por anos, ao menor custo\": S3 Glacier Deep Archive.",
      "\"Padrão de acesso desconhecido ou imprevisível\": S3 Intelligent-Tiering.",
      "\"Mover automaticamente os objetos para classes mais baratas com o tempo\": regras de ciclo de vida.",
      "\"Proteger contra a exclusão acidental de objetos\": versionamento.",
      "\"Disco para uma instância EC2\": EBS. \"Pasta compartilhada entre muitas instâncias Linux\": EFS.",
      "\"Transferir petabytes de dados sem depender da rede\": família Snow.",
    ] },
  ],
  questoes: [
    {
      enunciado: "Uma empresa quer guardar milhões de fotos de usuários, com escala quase ilimitada e acesso por HTTP. Qual serviço é o mais adequado?",
      opcoes: ["Amazon EBS", "Amazon S3", "Instance store", "Amazon EFS"],
      correta: 1,
      explicacao: "O S3 é o armazenamento de objetos da AWS, escalável e durável, acessado por HTTP. O EBS é de blocos para uma instância, e o EFS é um sistema de arquivos compartilhado.",
    },
    {
      enunciado: "Qual classe do S3 é a mais indicada para dados que precisam ficar guardados por anos e quase nunca são acessados, com o menor custo?",
      opcoes: ["S3 Standard", "S3 Standard-IA", "S3 Intelligent-Tiering", "S3 Glacier Deep Archive"],
      correta: 3,
      explicacao: "O Deep Archive é a classe mais barata, voltada para retenção de longo prazo e acesso raríssimo, com recuperação em horas. As demais são mais caras de guardar, por serem mais acessíveis.",
    },
    {
      enunciado: "Uma empresa não sabe como será o acesso a um grande conjunto de dados, que muda com o tempo. Que classe evita ter que prever o padrão de uso?",
      opcoes: ["S3 One Zone-IA", "S3 Intelligent-Tiering", "S3 Glacier Flexible Retrieval", "S3 Standard"],
      correta: 1,
      explicacao: "O Intelligent-Tiering move automaticamente os objetos entre camadas de acesso conforme o uso observado, sem taxas de recuperação, ideal para padrões desconhecidos ou variáveis.",
    },
    {
      enunciado: "O que as regras de ciclo de vida do S3 permitem fazer?",
      opcoes: ["Replicar objetos para outra conta", "Mover objetos automaticamente para classes mais baratas e apagá-los após um período", "Criptografar objetos com uma chave nova a cada dia", "Aumentar o limite de tamanho dos objetos"],
      correta: 1,
      explicacao: "As regras de ciclo de vida definem transições entre classes de armazenamento e expirações com base na idade dos objetos, automatizando a redução de custos.",
    },
    {
      enunciado: "Como proteger objetos contra a exclusão ou sobrescrita acidental no S3?",
      opcoes: ["Ativar o versionamento do bucket", "Usar apenas a classe Standard", "Colocar o bucket em outra Região", "Desativar a criptografia"],
      correta: 0,
      explicacao: "Com o versionamento, cada alteração ou exclusão cria uma nova versão, e as anteriores continuam recuperáveis. A classe, a Região e a criptografia não impedem exclusões acidentais.",
    },
    {
      enunciado: "Qual das alternativas descreve corretamente um volume Amazon EBS?",
      opcoes: ["É um sistema de arquivos compartilhado entre várias Regiões", "É um armazenamento de objetos acessado por HTTP", "É um volume de bloco que vive em uma única Zona de Disponibilidade e se liga a instâncias EC2", "Se perde sempre que a instância é parada"],
      correta: 2,
      explicacao: "O EBS fornece discos de bloco persistentes, ligados a instâncias da mesma AZ. Os volumes persistem após parar a instância; quem perde os dados é o instance store.",
    },
    {
      enunciado: "Várias instâncias Linux, em Zonas de Disponibilidade diferentes, precisam acessar as mesmas pastas ao mesmo tempo. Qual serviço usar?",
      opcoes: ["Amazon EBS", "AWS Snowball", "Instance store", "Amazon EFS"],
      correta: 3,
      explicacao: "O EFS é um sistema de arquivos NFS elástico, montável por muitas instâncias em várias AZs. O EBS liga-se a uma instância de uma AZ, e o instance store é local e efêmero.",
    },
  ],
  desafio: {
    titulo: "Plano de armazenamento de uma empresa de mídia",
    enunciado: "Uma produtora de vídeo guarda vídeos brutos (muito grandes, editados na primeira semana e raramente consultados depois), arquivos finais (acessados por clientes por links temporários), projetos de edição (pasta compartilhada por estações Linux) e backups legais (guardados por dez anos). Monte um plano de armazenamento na AWS, com configurações e um esboço de custo qualitativo.",
    requisitos: [
      "Escolha o serviço e a classe de armazenamento para cada tipo de dado, justificando pelo padrão de acesso.",
      "Escreva uma regra de ciclo de vida (em JSON) para os vídeos brutos, com transições e expiração, e valide o JSON.",
      "Escreva uma política de bucket que negue o acesso sem HTTPS, e explique por que o Principal \"*\" não torna o bucket público nesse caso.",
      "Defina como os clientes baixarão os arquivos finais sem que o bucket seja público (URLs pré-assinadas ou CloudFront).",
      "Descreva a proteção dos backups: versionamento, replicação para outra Região e o AWS Backup, e diga o que é responsabilidade da empresa.",
    ],
    criterios: [
      "Cada tipo de dado tem um serviço e uma classe coerentes com o seu acesso.",
      "O bloqueio de acesso público está ligado em todos os buckets, e isso aparece no plano.",
      "Os arquivos JSON são válidos e usam as chaves corretas do S3.",
      "O plano considera o custo de recuperação das classes frias, e não só o de armazenamento.",
      "A criptografia (em repouso e em trânsito) é tratada para todos os dados.",
    ],
    dica: "Monte uma tabela com quatro colunas (dado, serviço, classe, motivo) antes de escrever as configurações. Se alguma linha não tiver um motivo claro, é sinal de que a escolha ainda não está pronta.",
  },
  referencias: [
    { titulo: "AWS: classes de armazenamento do Amazon S3", url: "https://aws.amazon.com/s3/storage-classes/" },
    { titulo: "AWS: gerenciamento do ciclo de vida de objetos do S3", url: "https://docs.aws.amazon.com/AmazonS3/latest/userguide/object-lifecycle-mgmt.html" },
    { titulo: "AWS: tipos de volume do Amazon EBS", url: "https://docs.aws.amazon.com/ebs/latest/userguide/ebs-volume-types.html" },
    { titulo: "AWS: o que é o Amazon EFS", url: "https://docs.aws.amazon.com/efs/latest/ug/whatisefs.html" },
  ],
};
