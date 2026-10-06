import type { Modulo } from "../tipos";

export const SEG_MODULO_6: Modulo = {
  tipo: "modulo",
  slug: "segredos-e-configuracao-segura",
  titulo: "Segredos e configuração segura",
  resumo: "Onde os segredos vazam, como mantê-los fora do código, validar a configuração na partida, rotacioná-los e o que fazer na primeira hora depois de um vazamento.",
  nivel: "Júnior",
  leitura: "50 min",
  objetivos: [
    "Identificar o que é um segredo e os lugares por onde ele costuma vazar.",
    "Guardar e entregar segredos à aplicação sem colocá-los no código, nos logs ou nas imagens.",
    "Validar a configuração na inicialização e impedir que segredos apareçam em mensagens e registros.",
    "Detectar segredos em código com varredura de padrões e de entropia, e prevenir commits indevidos.",
    "Aplicar o roteiro de resposta a um vazamento: revogar primeiro, investigar depois, limpar por último.",
  ],
  preRequisitos: [
    "Ter feito os módulos anteriores da trilha, em especial o de criptografia aplicada.",
    "Saber o que são variáveis de ambiente e o básico de Git.",
  ],
  pontosChave: [
    "Um segredo vazado é um segredo comprometido: o conserto é revogá-lo e trocá-lo, não apagá-lo do repositório.",
    "O lugar de um segredo é um cofre ou o ambiente de execução, nunca o código, a imagem ou o front-end.",
    "A configuração deve falhar cedo e alto: faltou uma variável? A aplicação nem sobe.",
    "Dê a cada segredo o menor poder possível, uma vida curta e um dono: assim, o estrago de um vazamento é pequeno.",
    "Registros, mensagens de erro e capturas de tela são rotas de vazamento tão frequentes quanto o Git.",
  ],
  blocos: [
    { tipo: "p", texto: "Um segredo é qualquer valor que dá poder a quem o possui: senhas, chaves de API, tokens de acesso, chaves de criptografia, certificados privados, strings de conexão com senha. Quando um deles vaza, quem o encontra faz tudo o que ele autoriza, e o ataque nem parece um ataque: é um login legítimo. É por isso que vazamentos de credenciais estão entre as causas mais frequentes de incidentes graves, e que existem robôs que varrem repositórios públicos continuamente atrás de chaves. Uma chave da nuvem enviada ao GitHub por engano costuma ser usada por terceiros em minutos." },
    { tipo: "alerta", titulo: "Todos os exemplos usam valores fictícios", texto: "Os segredos que aparecem nos códigos deste módulo são inventados e montados em partes, para não parecerem credenciais reais a ferramentas de varredura. Nunca coloque uma credencial verdadeira em um exemplo, em um teste, em um README ou em uma captura de tela." },

    { tipo: "h", texto: "Por onde os segredos vazam" },
    { tipo: "tabela", legenda: "As rotas de vazamento mais comuns", cabecalho: ["Rota", "Como acontece", "Prevenção"], linhas: [
      ["Repositório Git", "Um .env ou uma chave é commitado, e fica no histórico mesmo depois de apagado.", ".gitignore desde o início, varredura antes do commit e no CI, e secret scanning com bloqueio de push."],
      ["Código do front-end", "Chaves embutidas no JavaScript, que qualquer visitante lê.", "Segredos só no servidor; o front chama a sua API. Chaves públicas restritas por domínio."],
      ["Imagens Docker e artefatos", "Segredos copiados na construção ficam em uma camada da imagem.", "Segredos de build (--mount=type=secret), imagens multi-estágio e injeção em tempo de execução."],
      ["Logs e mensagens de erro", "A aplicação imprime a requisição, a configuração ou a URL do banco com senha.", "Mascarar campos sensíveis; nunca registrar cabeçalhos de autorização ou corpos com credenciais."],
      ["CI/CD", "Variáveis impressas no log de uma pipeline ou expostas a código de contribuidores externos.", "Segredos mascarados pela plataforma, escopo mínimo e nada de segredos em pipelines de forks."],
      ["Chat, e-mail, tickets e capturas de tela", "Alguém cola uma chave para \"ajudar a depurar\".", "Cultura de nunca colar segredos; revogar na hora quando acontecer."],
      ["Backups e dumps do banco", "Cópias com dados e credenciais, sem a mesma proteção do original.", "Criptografar backups e controlar quem pode lê-los."],
    ] },

    { tipo: "h", texto: "Onde guardar e como entregar à aplicação" },
    { tipo: "p", texto: "A regra é uma só: o código descreve que a aplicação precisa de um segredo, e quem o fornece é o ambiente onde ela roda. Isso separa o que é público (o código, que várias pessoas leem e versionam) do que é restrito (os valores), e permite trocar um segredo sem mexer em nenhuma linha de código. Há três níveis de maturidade, e vale subir gradualmente." },
    { tipo: "numerada", itens: [
      "Variáveis de ambiente, definidas na plataforma de execução (e não em arquivos versionados). É o mínimo aceitável, e o que a metodologia dos doze fatores recomenda. Um arquivo .env serve para desenvolvimento local, sempre no .gitignore, com um .env.example sem valores reais versionado para documentar o que é preciso.",
      "Cofres de segredos (AWS Secrets Manager, HashiCorp Vault, Azure Key Vault, Google Secret Manager): armazenamento criptografado, com controle de acesso por identidade, auditoria de cada leitura e rotação automática. A aplicação busca o segredo na partida, com uma identidade própria.",
      "Credenciais de curta duração e sem segredo guardado: papéis de serviço da nuvem (como as funções IAM do módulo da AWS) e federação por OIDC nas pipelines. Nesse modelo, não há uma chave de longa duração para vazar, porque a identidade da própria carga de trabalho obtém credenciais temporárias.",
    ] },
    { tipo: "h3", texto: "Configuração que falha cedo e não conta segredos" },
    { tipo: "p", texto: "A configuração deve ser lida e validada uma única vez, na partida: se faltar uma variável ou houver um valor perigoso (uma chave de teste em produção), a aplicação nem deve subir, com uma mensagem clara que diga o que falta, sem nunca imprimir os valores. Descobrir só no meio da madrugada, quando a primeira requisição usa a variável, que ela estava vazia é o pior cenário. Outra defesa pequena e eficaz é fazer o objeto de configuração esconder os segredos na sua representação em texto, para que um log ou uma exceção descuidada (print(config)) não os revele." },
    { tipo: "codigo", linguagem: "python", legenda: "configuracao.py", texto: `from dataclasses import dataclass


class ConfiguracaoInvalida(Exception):
    pass


@dataclass(frozen=True)
class Configuracao:
    ambiente: str
    url_do_banco: str
    chave_da_api: str

    def __repr__(self) -> str:
        return f"Configuracao(ambiente={self.ambiente!r}, url_do_banco='***', chave_da_api='***')"


def carregar(variaveis: dict[str, str]) -> Configuracao:
    faltando = [nome for nome in ("AMBIENTE", "URL_DO_BANCO", "CHAVE_DA_API") if not variaveis.get(nome)]
    if faltando:
        raise ConfiguracaoInvalida("variáveis ausentes: " + ", ".join(faltando))
    if variaveis["AMBIENTE"] == "producao" and variaveis["CHAVE_DA_API"].startswith("teste-"):
        raise ConfiguracaoInvalida("chave de teste em produção")
    return Configuracao(variaveis["AMBIENTE"], variaveis["URL_DO_BANCO"], variaveis["CHAVE_DA_API"])


boa = carregar({"AMBIENTE": "producao", "URL_DO_BANCO": "postgres://u:p@db/loja", "CHAVE_DA_API": "valor-secreto-de-exemplo"})
print(boa)
print("segredo vazou no log?", "valor-secreto" in repr(boa) or "valor-secreto" in str(boa))
for ruim in [{"AMBIENTE": "producao"}, {"AMBIENTE": "producao", "URL_DO_BANCO": "x", "CHAVE_DA_API": "teste-123"}]:
    try:
        carregar(ruim)
    except ConfiguracaoInvalida as erro:
        print("recusada:", erro)` },
    { tipo: "codigo", linguagem: "text", legenda: "Saída", texto: `Configuracao(ambiente='producao', url_do_banco='***', chave_da_api='***')
segredo vazou no log? False
recusada: variáveis ausentes: URL_DO_BANCO, CHAVE_DA_API
recusada: chave de teste em produção` },
    { tipo: "p", texto: "O objeto mostra os campos sensíveis como asteriscos, mesmo que alguém o imprima. A função carregar lista todas as variáveis ausentes de uma vez (poupando várias tentativas) e recusa uma combinação perigosa, a chave de teste em um ambiente de produção. Em frameworks, o mesmo papel é cumprido por bibliotecas como o pydantic-settings, em Python, e o @ConfigurationProperties com validação, no Spring Boot." },

    { tipo: "h", texto: "Encontrando segredos antes que alguém encontre" },
    { tipo: "p", texto: "Se os robôs de terceiros varrem o seu código, você deve varrer antes. As ferramentas de detecção de segredos (gitleaks, trufflehog, o secret scanning do GitHub) usam duas ideias que o exemplo abaixo reproduz em miniatura: padrões conhecidos (cada provedor tem um formato de chave reconhecível, como o prefixo AKIA das chaves de acesso da AWS ou o ghp_ dos tokens do GitHub) e entropia, a medida de aleatoriedade de um texto, que destaca sequências longas e caóticas, típicas de chaves." },
    { tipo: "codigo", linguagem: "python", legenda: "varredura.py", texto: `import math
import re
from collections import Counter

PADROES = {
    "chave de acesso da AWS": re.compile(r"\\bAKIA[0-9A-Z]{16}\\b"),
    "token do GitHub": re.compile(r"\\bgh[pousr]_[A-Za-z0-9]{36}\\b"),
    "chave privada": re.compile(r"-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----"),
    "URL de banco com senha": re.compile(r"\\b[a-z]+://[^\\s:/@]+:[^\\s@]+@[^\\s/]+"),
    "atribuição de segredo": re.compile(r"(?i)\\b(?:senha|password|secret|token|api[_-]?key)\\b\\s*[:=]\\s*['\\"]?([^\\s'\\"]{8,})"),
}


def entropia(texto: str) -> float:
    contagem = Counter(texto)
    return -sum(n / len(texto) * math.log2(n / len(texto)) for n in contagem.values())


def varrer(linhas: list[str]) -> list[tuple[int, str]]:
    achados = []
    for numero, linha in enumerate(linhas, start=1):
        for nome, padrao in PADROES.items():
            if padrao.search(linha):
                achados.append((numero, nome))
        for palavra in re.findall(r"[A-Za-z0-9+/=_-]{24,}", linha):
            if entropia(palavra) > 4.3:
                achados.append((numero, "texto aleatório longo (possível segredo)"))
    return achados


FALSA_CHAVE_AWS = "AKIA" + "ABCDEFGHIJKLMNOP"
FALSO_TOKEN = "gh" + "p_" + "a1B2c3D4e5F6g7H8i9J0k1L2m3N4o5P6q7R8"
codigo = [
    "import os",
    f'aws_key = "{FALSA_CHAVE_AWS}"',
    f"headers = {{'Authorization': 'token {FALSO_TOKEN}'}}",
    "DATABASE_URL = 'postgres://loja:Sup3rS3nha@db.interno:5432/loja'",
    'senha = "mudar-isto-ja-123"',
    "porta = os.environ['PORT']",
    "mensagem = 'olá, mundo'",
]
for numero, nome in varrer(codigo):
    print(f"linha {numero}: {nome}")
print("linhas limpas:", [n for n in range(1, len(codigo) + 1) if n not in {a for a, _ in varrer(codigo)}])` },
    { tipo: "codigo", linguagem: "text", legenda: "Saída", texto: `linha 2: chave de acesso da AWS
linha 3: token do GitHub
linha 3: texto aleatório longo (possível segredo)
linha 4: URL de banco com senha
linha 5: atribuição de segredo
linhas limpas: [1, 6, 7]` },
    { tipo: "p", texto: "O scanner pega as chaves de formato conhecido, a URL de banco com usuário e senha embutidos, a atribuição de uma variável chamada senha e, pela entropia, o texto aleatório longo da linha 3. As linhas 1, 6 e 7 (uma importação, a leitura de uma variável de ambiente e um texto comum) saem limpas, e é esse equilíbrio que importa: um scanner que acusa tudo é ignorado, e um que acusa pouco deixa passar. Ferramentas reais têm milhares de padrões e listas de exceções." },
    { tipo: "lista", itens: [
      "Pré-commit: um hook local (como o pre-commit com gitleaks) barra o segredo antes de ele entrar no histórico. É a defesa mais barata.",
      "Proteção de push do GitHub: bloqueia o envio de segredos de formato conhecido, e deve ser ativada em todos os repositórios.",
      "CI: uma etapa de varredura em cada pull request, que falha a pipeline se achar algo.",
      "Varredura do histórico inteiro de repositórios antigos: um segredo de três anos atrás ainda vale, se nunca foi trocado.",
    ] },

    { tipo: "h", texto: "Poder mínimo, vida curta, um dono" },
    { tipo: "p", texto: "Parte da defesa é aceitar que algum segredo vai vazar um dia e limitar o estrago de antemão. Cada segredo deve ter o menor poder possível: uma chave que só lê um bucket, e não uma chave de administrador; um token do GitHub com o escopo de um repositório, e não de toda a conta; um usuário de banco só com as tabelas de que a aplicação precisa. Deve ter vida curta, com validade e rotação regular (de preferência automática), de modo que um vazamento antigo já esteja morto quando alguém o encontrar. E deve ter um dono e um inventário: saber quem criou, para que serve e onde está usado é o que permite trocá-lo rápido e revogar o que ninguém usa mais." },
    { tipo: "dica", titulo: "Ambientes separados, segredos separados", texto: "Desenvolvimento, testes e produção devem ter segredos diferentes, e o acesso à produção deve ser restrito a poucas pessoas e sistemas. Assim, o vazamento do notebook de uma pessoa ou de um banco de testes não entrega o ambiente real, e o código de teste jamais toca em dados de clientes." },

    { tipo: "h", texto: "O segredo vazou: o que fazer na primeira hora" },
    { tipo: "p", texto: "Quando alguém commita uma chave por engano, o instinto é apagar o arquivo e fazer outro commit. Isso não resolve: o histórico guarda cada versão, e, se o repositório for público ou tiver sido clonado, cópias já existem (inclusive as de robôs). A ordem certa é a inversa do instinto: primeiro tornar o segredo inútil, e só depois limpar." },
    { tipo: "numerada", itens: [
      "Revogar e substituir o segredo imediatamente, no sistema de origem (apagar a chave de acesso na nuvem, rotacionar a senha do banco, revogar o token). Considere o segredo como já usado por um atacante.",
      "Gerar um novo valor e entregá-lo à aplicação pelo caminho correto (o cofre ou o ambiente), e confirmar que tudo voltou a funcionar.",
      "Investigar o uso indevido: examine os registros do provedor (como o CloudTrail, no caso da AWS) no período em que o segredo ficou exposto, procurando acessos de origens, regiões e horários estranhos, recursos novos e dados lidos.",
      "Contar o incidente à equipe e, se houver dados de pessoas envolvidos, avaliar as obrigações legais (a LGPD exige comunicação à ANPD e aos titulares quando há risco relevante).",
      "Só então limpar o histórico (git filter-repo ou o BFG), forçar o envio, pedir que todos reclonem e, em repositórios públicos, solicitar a remoção das visualizações em cache. Lembre que isso reduz, mas não elimina, a exposição.",
      "Descobrir a causa e fechar a brecha de processo: por que o segredo chegou ao repositório? Falta um hook, uma varredura, um modelo de .gitignore?",
    ] },
    { tipo: "alerta", titulo: "Sem culpar a pessoa", texto: "Quem cometeu o erro deve avisar o quanto antes, e isso só acontece em uma cultura que trata o vazamento como falha do processo, e não da pessoa. Se avisar significa ser punido, os incidentes passam a ser escondidos, e o segredo vazado continua válido por semanas." },
  ],
  questoes: [
    {
      enunciado: "Uma chave de API foi commitada por engano. A pessoa apagou o arquivo em um novo commit. O problema está resolvido?",
      opcoes: ["Sim, o arquivo não existe mais", "Sim, desde que o repositório seja privado", "Não: o histórico guarda a versão antiga, e a chave deve ser considerada comprometida, revogada e substituída", "Sim, se ninguém reclamar"],
      correta: 2,
      explicacao: "O histórico do Git preserva cada versão, e cópias podem já existir. O que resolve é tornar a chave inútil (revogar e trocar). Limpar o histórico é um passo posterior e complementar.",
    },
    {
      enunciado: "Qual a primeira ação ao descobrir que um segredo vazou?",
      opcoes: ["Reescrever o histórico do Git", "Revogar e substituir o segredo no sistema de origem", "Avisar apenas no fim da semana", "Apagar os logs"],
      correta: 1,
      explicacao: "Enquanto o segredo estiver válido, qualquer um que o tenha pode usá-lo. Revogar é o que interrompe o risco; investigar e limpar vêm depois.",
    },
    {
      enunciado: "Por que segredos não devem ficar no código do front-end?",
      opcoes: ["Porque o JavaScript é lento", "Porque tudo o que é enviado ao navegador pode ser lido por qualquer visitante, mesmo ofuscado", "Porque o navegador apaga as variáveis", "Porque o TypeScript não aceita strings longas"],
      correta: 1,
      explicacao: "Para o navegador usar a chave, ela precisa estar no código que ele recebe, então qualquer pessoa a obtém. Chaves secretas ficam no servidor, que é chamado pelo front.",
    },
    {
      enunciado: "Qual a vantagem de validar toda a configuração na partida da aplicação?",
      opcoes: ["Falhas de configuração (variável ausente, chave de teste em produção) aparecem imediatamente, em vez de só no meio do uso", "O programa fica mais rápido", "Não é mais preciso testar", "Os segredos são criptografados"],
      correta: 0,
      explicacao: "Falhar cedo e com uma mensagem clara evita descobrir o erro em plena operação. A mensagem deve dizer o que falta, sem imprimir valores.",
    },
    {
      enunciado: "Para que serve a entropia na detecção de segredos?",
      opcoes: ["Para criptografar o arquivo", "Para destacar textos longos e muito aleatórios, típicos de chaves, mesmo sem um formato conhecido", "Para medir o tamanho do repositório", "Para ordenar os commits"],
      correta: 1,
      explicacao: "Chaves e tokens são sequências com alta aleatoriedade. A entropia complementa os padrões de formato conhecido e pega segredos de provedores que o scanner não conhece.",
    },
    {
      enunciado: "Qual das práticas reduz mais o estrago de um vazamento de chave que ainda vai acontecer?",
      opcoes: ["Dar à chave permissões de administrador, para evitar erros de acesso", "Compartilhar a mesma chave entre todos os sistemas", "Guardar a chave em um arquivo chamado segredo.txt", "Poder mínimo, validade curta com rotação e uma chave por ambiente"],
      correta: 3,
      explicacao: "Uma chave de poder mínimo, que expira e é trocada regularmente, e que existe só para um ambiente, limita o que um atacante faz e por quanto tempo.",
    },
    {
      enunciado: "Por que a imagem Docker não é um lugar seguro para copiar uma credencial durante a construção?",
      opcoes: ["Porque a imagem é grande", "Porque o arquivo copiado fica gravado em uma camada da imagem, que qualquer pessoa com acesso à imagem consegue extrair", "Porque o Docker criptografa tudo", "Porque a credencial expira ao fim da construção"],
      correta: 1,
      explicacao: "Mesmo que um comando posterior apague o arquivo, a camada anterior continua na imagem. Use segredos de build, imagens multi-estágio e a injeção em tempo de execução.",
    },
  ],
  desafio: {
    titulo: "Um guardião de segredos para o seu repositório",
    enunciado: "Construa uma ferramenta de linha de comando em Python (guardiao.py) que varre os arquivos de uma pasta atrás de segredos e bloqueia um commit simulado, além de um carregador de configuração seguro para uma aplicação de exemplo. Use apenas valores fictícios, montados em partes nos seus testes.",
    requisitos: [
      "Implemente a varredura com ao menos 6 padrões (chave da AWS, token do GitHub, chave privada, URL com senha, atribuição de segredo, segredo de JWT) e a verificação por entropia, com um limite configurável.",
      "Ignore arquivos binários, a pasta .git e uma lista de exceções registrada em um arquivo (com o motivo de cada exceção), e imprima só o arquivo, a linha e o tipo do achado, nunca o valor completo (mostre apenas o início, mascarado).",
      "Termine com código de saída diferente de zero se houver achados, para poder ser usado como hook de pré-commit e etapa de CI.",
      "Escreva o carregador de configuração com validação na partida, mensagem que lista todas as variáveis ausentes, recusa de chaves de teste em produção e representação que esconde os segredos.",
      "Escreva testes com amostras limpas e com amostras com segredos fictícios (montados por concatenação), incluindo casos que NÃO devem ser acusados (hashes de commit, UUIDs, textos comuns).",
    ],
    criterios: [
      "A ferramenta acha todos os segredos fictícios das amostras e não acusa as amostras limpas.",
      "Nenhum segredo encontrado é impresso por inteiro, nem nos logs nem na saída.",
      "O código de saída é usado por um script de hook que impede o commit, e o teste prova isso.",
      "A configuração falha cedo, com mensagem clara, e a sua representação em texto não contém os valores.",
      "Você descreve, em um parágrafo, o roteiro que a sua equipe seguiria se a ferramenta encontrasse uma chave real.",
    ],
    dica: "Ajuste o limite de entropia olhando exemplos: textos em português têm entropia baixa, hashes de commit têm entropia média e chaves aleatórias têm a mais alta. Teste os três tipos antes de escolher o número.",
  },
  referencias: [
    { titulo: "OWASP: guia de gerenciamento de segredos (em inglês)", url: "https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html" },
    { titulo: "Os doze fatores: configuração", url: "https://12factor.net/pt_br/config" },
    { titulo: "GitHub: proteção de push contra segredos (em inglês)", url: "https://docs.github.com/en/code-security/secret-scanning/introduction/about-push-protection" },
    { titulo: "AWS: AWS Secrets Manager", url: "https://docs.aws.amazon.com/secretsmanager/latest/userguide/intro.html" },
  ],
};
