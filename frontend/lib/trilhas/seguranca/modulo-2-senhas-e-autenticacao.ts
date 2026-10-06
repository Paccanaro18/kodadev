import type { Modulo } from "../tipos";

export const SEG_MODULO_2: Modulo = {
  tipo: "modulo",
  slug: "senhas-e-autenticacao",
  titulo: "Senhas, autenticação e MFA",
  resumo: "Como guardar senhas sem desastres (sal, hash lento), limitar tentativas, usar autenticação em dois fatores com TOTP e desenhar a recuperação de conta sem abrir brechas.",
  nivel: "Iniciante",
  leitura: "50 min",
  objetivos: [
    "Explicar por que senhas não podem ser guardadas em texto, com MD5 ou com SHA simples.",
    "Guardar e conferir senhas com um hash lento e com sal, comparando em tempo constante.",
    "Implementar um limite de tentativas contra força bruta e preenchimento de credenciais.",
    "Entender como funciona o TOTP (códigos de 6 dígitos) e por que o MFA barra a maioria dos ataques a contas.",
    "Desenhar fluxos de login e de recuperação de senha que não revelam se uma conta existe.",
  ],
  preRequisitos: [
    "Ter feito o módulo \"Ameaças, risco e defesa em camadas\" ou conhecer a tríade CIA.",
    "Saber ler Python básico (os exemplos usam só a biblioteca padrão).",
  ],
  pontosChave: [
    "Uma senha nunca é guardada: guarda-se um hash lento, com sal único, que não pode ser revertido.",
    "MD5 e SHA simples são rápidos demais: um atacante testa bilhões de senhas por segundo.",
    "Sem limite de tentativas, qualquer senha fraca cai; com MFA, a senha roubada sozinha não basta.",
    "Compare segredos em tempo constante e devolva a mesma mensagem para usuário inexistente e senha errada.",
    "A recuperação de conta é parte do login: se for fraca, é por ela que o atacante entra.",
  ],
  blocos: [
    { tipo: "p", texto: "A autenticação responde à pergunta \"quem é você?\", e é a porta de entrada de quase toda aplicação. Também é onde se concentram os erros mais caros: bancos de dados que vazam com senhas em texto ou com hashes fracos, contas invadidas por senhas reaproveitadas de outros vazamentos, e telas de \"esqueci a senha\" que entregam a conta a quem pede. Este módulo mostra como fazer essa parte do jeito certo, com exemplos que rodam em Python sem instalar nada." },

    { tipo: "h", texto: "Como as senhas vazam e como são quebradas" },
    { tipo: "p", texto: "Quando um banco de dados vaza, o atacante leva a tabela de usuários. O que ele consegue fazer com ela depende de como as senhas estavam guardadas. Em texto puro, a conta de todos está perdida na hora. Com um hash simples (MD5, SHA-1 ou SHA-256 direto), o atacante não \"desfaz\" o hash, mas calcula o hash de milhões de palavras e senhas conhecidas e compara. Placas de vídeo modernas calculam bilhões de hashes MD5 por segundo, então qualquer senha comum cai em minutos. Pior: sem sal, a mesma senha gera sempre o mesmo hash, e uma tabela pré-calculada serve para todos os usuários de todos os sites." },
    { tipo: "p", texto: "Existe ainda o ataque que nem precisa do vazamento: o preenchimento de credenciais (credential stuffing). O atacante pega pares de e-mail e senha vazados de outro site e tenta cada um no seu, apostando que as pessoas reaproveitam senhas, o que é muito comum. Não é uma falha técnica do seu sistema, mas ele sofre as consequências, e as defesas (limite de tentativas, MFA, detecção de comportamento estranho) são suas." },

    { tipo: "h", texto: "Guardando senhas do jeito certo" },
    { tipo: "p", texto: "Três ingredientes formam a resposta moderna. O primeiro é um hash específico para senhas, projetado para ser lento e para consumir memória, o que torna cada tentativa do atacante cara: Argon2id (a recomendação atual da OWASP), scrypt ou bcrypt. O segundo é o sal (salt): um valor aleatório de pelo menos 16 bytes, único por usuário e guardado junto do hash, que faz a mesma senha gerar hashes diferentes e inutiliza as tabelas pré-calculadas. O terceiro é a comparação em tempo constante, que impede que o tempo de resposta revele quantos caracteres estavam certos. O código abaixo usa o scrypt da biblioteca padrão do Python, que dispensa instalação." },
    { tipo: "codigo", linguagem: "python", legenda: "senhas.py", texto: `import hashlib
import hmac
import os

N, R, P = 2**14, 8, 1


def guardar(senha: str) -> str:
    sal = os.urandom(16)
    resumo = hashlib.scrypt(senha.encode(), salt=sal, n=N, r=R, p=P, dklen=32)
    return f"scrypt\${N}\${R}\${P}\${sal.hex()}\${resumo.hex()}"


def conferir(senha: str, guardado: str) -> bool:
    _, n, r, p, sal, esperado = guardado.split("$")
    calculado = hashlib.scrypt(senha.encode(), salt=bytes.fromhex(sal), n=int(n), r=int(r), p=int(p), dklen=32)
    return hmac.compare_digest(calculado, bytes.fromhex(esperado))


primeira = guardar("correto cavalo bateria grampo")
segunda = guardar("correto cavalo bateria grampo")

print("mesma senha, registros diferentes:", primeira != segunda)
print("formato:", primeira.split("$")[0], primeira.count("$") + 1, "campos")
print("senha certa:", conferir("correto cavalo bateria grampo", primeira))
print("senha errada:", conferir("senha123", primeira))
print("md5 de senha123:", hashlib.md5(b"senha123").hexdigest())
print("md5 de novo:    ", hashlib.md5(b"senha123").hexdigest())` },
    { tipo: "codigo", linguagem: "text", legenda: "Saída", texto: `mesma senha, registros diferentes: True
formato: scrypt 6 campos
senha certa: True
senha errada: False
md5 de senha123: e7d80ffeefa212b7c5c55700e4f7193e
md5 de novo:     e7d80ffeefa212b7c5c55700e4f7193e` },
    { tipo: "p", texto: "Observe os resultados. A mesma senha, guardada duas vezes, gera registros diferentes por causa do sal aleatório. O registro guarda tudo o que é preciso para conferir depois (algoritmo, parâmetros, sal e hash), o que permite aumentar o custo no futuro sem quebrar as contas antigas: no próximo login bem-sucedido, você recalcula com parâmetros mais fortes e atualiza o registro. As últimas duas linhas mostram, por contraste, o MD5: o hash de senha123 é sempre o mesmo, em qualquer lugar do mundo, e qualquer tabela de hashes conhecidos o identifica de imediato. O hmac.compare_digest faz a comparação em tempo constante, e não o operador ==." },
    { tipo: "alerta", titulo: "Não invente a sua própria criptografia", texto: "Escreva o mínimo possível de código de segurança. Use as funções prontas das bibliotecas consagradas (os frameworks de web, como Spring Security, Django e FastAPI com bibliotecas de autenticação, já trazem o hash de senhas correto). O exemplo acima serve para entender o mecanismo, e em um sistema real você deve usar a implementação do framework, configurada com os parâmetros atuais recomendados." },
    { tipo: "h3", texto: "O que mais importa na política de senhas" },
    { tipo: "lista", itens: [
      "Comprimento vale mais que complexidade: frases longas (\"correto cavalo bateria grampo\") são mais fortes e mais fáceis de lembrar do que \"P@ssw0rd!\".",
      "Aceite senhas longas (ao menos 64 caracteres) e todos os caracteres, inclusive espaços e Unicode, e permita colar do gerenciador de senhas.",
      "Recuse senhas conhecidas: confira contra listas de senhas vazadas (como a base do serviço Have I Been Pwned, que permite a consulta sem enviar a senha completa) e contra termos óbvios do próprio sistema.",
      "Não obrigue a troca periódica sem motivo: ela leva a senhas piores (Senha1, Senha2). Peça a troca quando houver suspeita de vazamento.",
      "Incentive gerenciadores de senhas e senhas únicas para cada site.",
    ] },

    { tipo: "h", texto: "Limitando tentativas" },
    { tipo: "p", texto: "Sem limite, um atacante pode testar milhares de senhas por minuto contra uma conta. O limite de tentativas é uma das defesas mais eficazes e mais baratas: depois de algumas falhas em uma janela de tempo, o login daquele usuário (e daquele endereço IP) é bloqueado por um tempo, ou passa a exigir uma prova extra. O exemplo mostra uma versão mínima, com um relógio simulado para o resultado ser previsível." },
    { tipo: "codigo", linguagem: "python", legenda: "limite.py", texto: `class LimiteDeTentativas:
    def __init__(self, maximo: int, janela: int) -> None:
        self.maximo = maximo
        self.janela = janela
        self.falhas: dict[str, list[int]] = {}

    def bloqueado(self, chave: str, agora: int) -> bool:
        recentes = [t for t in self.falhas.get(chave, []) if agora - t < self.janela]
        self.falhas[chave] = recentes
        return len(recentes) >= self.maximo

    def registrar_falha(self, chave: str, agora: int) -> None:
        self.falhas.setdefault(chave, []).append(agora)


limite = LimiteDeTentativas(maximo=5, janela=600)
agora = 1000
for tentativa in range(1, 8):
    if limite.bloqueado("ana", agora):
        print(f"tentativa {tentativa}: bloqueada")
        continue
    limite.registrar_falha("ana", agora)
    print(f"tentativa {tentativa}: senha errada")
    agora += 10

print("outra conta livre:", not limite.bloqueado("bruno", agora))
print("depois de 11 minutos:", not limite.bloqueado("ana", agora + 660))` },
    { tipo: "codigo", linguagem: "text", legenda: "Saída", texto: `tentativa 1: senha errada
tentativa 2: senha errada
tentativa 3: senha errada
tentativa 4: senha errada
tentativa 5: senha errada
tentativa 6: bloqueada
tentativa 7: bloqueada
outra conta livre: True
depois de 11 minutos: True` },
    { tipo: "p", texto: "Cinco falhas em dez minutos bloqueiam a conta \"ana\", enquanto \"bruno\" continua livre, e depois da janela o bloqueio expira. Há uma sutileza de projeto: bloquear permanentemente a conta de quem erra muitas vezes permite que um atacante tranque as contas dos outros de propósito (negação de serviço). Prefira bloqueios temporários e crescentes (1 minuto, 5 minutos, 30 minutos), limite também por endereço IP, e considere um desafio extra (como um CAPTCHA) depois de algumas falhas. Em produção, o contador não pode ficar na memória de um servidor só: use um armazenamento compartilhado, como o Redis." },

    { tipo: "h", texto: "Autenticação em dois fatores (MFA)" },
    { tipo: "p", texto: "A autenticação multifator exige duas provas de categorias diferentes: algo que você sabe (a senha), algo que você tem (o celular, uma chave de segurança) ou algo que você é (a biometria). Com ela, uma senha roubada ou adivinhada não basta: o atacante também precisa do segundo fator. Os dados de grandes empresas apontam que o MFA bloqueia a imensa maioria dos ataques automatizados a contas, e por isso ele é a recomendação número um para qualquer conta importante." },
    { tipo: "tabela", legenda: "Os métodos de segundo fator", cabecalho: ["Método", "Como funciona", "Observações"], linhas: [
      ["Código por SMS", "Um código chega por mensagem de texto.", "Melhor que nada, mas vulnerável à troca de chip (SIM swap) e a interceptação."],
      ["TOTP (aplicativo autenticador)", "Um código de 6 dígitos que muda a cada 30 segundos, calculado a partir de um segredo compartilhado e da hora.", "Funciona offline, é padronizado (RFC 6238) e é bom como padrão."],
      ["Chave de segurança e passkeys (WebAuthn)", "Criptografia de chave pública: o dispositivo prova a identidade para o site específico.", "Resistente a phishing, porque a prova só funciona no site verdadeiro. A melhor opção atual."],
      ["Códigos de recuperação", "Lista de códigos de uso único, guardados pela pessoa.", "Necessários para quando o dispositivo se perde; devem ser guardados com hash, como senhas."],
    ] },
    { tipo: "p", texto: "O TOTP é simples de entender, e o código a seguir o implementa do zero, com a biblioteca padrão. O servidor e o aplicativo do usuário compartilham um segredo. A cada 30 segundos, ambos calculam um HMAC desse segredo com o número do período de tempo atual (hora dividida por 30) e extraem dele um número de 6 dígitos. Para validar, o servidor recalcula e compara. A implementação foi conferida com os vetores de teste oficiais do RFC 6238, que usa o segredo \"12345678901234567890\" e códigos de 8 dígitos." },
    { tipo: "codigo", linguagem: "python", legenda: "totp.py", texto: `import hashlib
import hmac
import struct


def hotp(segredo: bytes, contador: int, digitos: int = 6) -> str:
    mac = hmac.new(segredo, struct.pack(">Q", contador), hashlib.sha1).digest()
    deslocamento = mac[-1] & 0x0F
    codigo = (struct.unpack(">I", mac[deslocamento:deslocamento + 4])[0] & 0x7FFFFFFF) % (10 ** digitos)
    return str(codigo).zfill(digitos)


def totp(segredo: bytes, agora: int, passo: int = 30, digitos: int = 6) -> str:
    return hotp(segredo, agora // passo, digitos)


def verificar(segredo: bytes, informado: str, agora: int, janela: int = 1) -> bool:
    validos = [totp(segredo, agora + deslocamento * 30) for deslocamento in range(-janela, janela + 1)]
    return any(hmac.compare_digest(informado, valido) for valido in validos)


SEGREDO_DO_RFC = b"12345678901234567890"

print("RFC 6238, t=59 (8 dígitos):", totp(SEGREDO_DO_RFC, 59, digitos=8))
print("RFC 6238, t=1111111109 (8 dígitos):", totp(SEGREDO_DO_RFC, 1111111109, digitos=8))
codigo = totp(SEGREDO_DO_RFC, 1_700_000_000)
print("código de 6 dígitos:", codigo)
print("aceito na hora:", verificar(SEGREDO_DO_RFC, codigo, 1_700_000_000))
print("aceito 30 s depois:", verificar(SEGREDO_DO_RFC, codigo, 1_700_000_030))
print("recusado 2 min depois:", verificar(SEGREDO_DO_RFC, codigo, 1_700_000_120))` },
    { tipo: "codigo", linguagem: "text", legenda: "Saída", texto: `RFC 6238, t=59 (8 dígitos): 94287082
RFC 6238, t=1111111109 (8 dígitos): 07081804
código de 6 dígitos: 921300
aceito na hora: True
aceito 30 s depois: True
recusado 2 min depois: False` },
    { tipo: "p", texto: "As duas primeiras linhas batem com os valores publicados no RFC (94287082 e 07081804), o que mostra que o código está correto. Depois, a verificação aceita o código no período atual e em um vizinho, a janela de tolerância que compensa pequenas diferenças de relógio entre o servidor e o celular, e recusa um código de dois minutos antes. Detalhes que importam em produção: guarde o segredo de cada usuário criptografado, aplique o limite de tentativas também ao código de MFA (são só um milhão de combinações) e registre o último período aceito, para que o mesmo código não possa ser usado duas vezes." },

    { tipo: "h", texto: "Login e recuperação de conta sem brechas" },
    { tipo: "p", texto: "A tela de login não deve revelar demais. Uma mensagem como \"usuário não encontrado\" para um e-mail inexistente e \"senha incorreta\" para um existente permite que um atacante descubra quais e-mails têm conta (a enumeração de usuários), o que alimenta ataques de phishing e de preenchimento de credenciais. A resposta deve ser a mesma nos dois casos (\"e-mail ou senha incorretos\"), e o tempo de resposta também: se o usuário inexistente responde instantaneamente e o existente demora por causa do hash lento, a diferença de tempo vaza a mesma informação. A boa prática é calcular um hash fictício quando o usuário não existe." },
    { tipo: "p", texto: "A recuperação de senha é, muitas vezes, o elo mais fraco, porque é uma segunda porta de entrada. As regras de um fluxo seguro são simples de listar." },
    { tipo: "numerada", itens: [
      "Responda sempre com a mesma mensagem (\"se existir uma conta com este e-mail, enviamos as instruções\"), exista ou não a conta.",
      "Gere o token de recuperação com um gerador criptograficamente seguro (secrets.token_urlsafe, em Python), com pelo menos 128 bits.",
      "Guarde apenas o hash do token no banco, como se fosse uma senha: quem lê o banco não consegue usar os tokens pendentes.",
      "Dê ao token validade curta (15 a 60 minutos) e uso único: depois de usado, ele é invalidado.",
      "Envie o link só para o e-mail cadastrado, nunca para um endereço informado na hora, e nunca reenvie a senha atual.",
      "Depois da troca, encerre as outras sessões abertas e avise a pessoa por e-mail de que a senha mudou.",
      "Não use \"perguntas secretas\" (nome do cachorro, cidade natal): são respostas fáceis de pesquisar ou de adivinhar.",
    ] },
    { tipo: "dica", titulo: "Registre, mas sem vazar", texto: "Registre os eventos de autenticação (logins, falhas, trocas de senha, uso de MFA) com data, endereço IP e identificador da conta, para detectar ataques e investigar incidentes. Nunca registre a senha, o código de MFA nem o token de recuperação, nem mesmo as tentativas erradas: elas costumam ser a senha certa digitada no campo errado." },
  ],
  questoes: [
    {
      enunciado: "Por que guardar senhas com MD5 (ou SHA-256 simples) é considerado inseguro?",
      opcoes: ["Porque o MD5 não gera hashes", "Porque são hashes rápidos: um atacante testa bilhões de senhas por segundo e usa tabelas pré-calculadas, já que não há sal", "Porque o hash pode ser desfeito por uma fórmula simples", "Porque ocupam muito espaço"],
      correta: 1,
      explicacao: "Hashes de uso geral foram feitos para velocidade, o oposto do que se quer para senhas. Sem sal e sem lentidão, um vazamento revela a maioria das senhas rapidamente.",
    },
    {
      enunciado: "Qual é a função do sal (salt) no armazenamento de senhas?",
      opcoes: ["Criptografar o banco de dados", "Acelerar a verificação da senha", "Substituir o hash", "Fazer a mesma senha gerar hashes diferentes para cada usuário, inutilizando tabelas pré-calculadas"],
      correta: 3,
      explicacao: "O sal é um valor aleatório e único por usuário, guardado junto do hash. Ele impede que um mesmo cálculo sirva para todas as contas e que duas pessoas com a mesma senha tenham o mesmo registro.",
    },
    {
      enunciado: "Qual algoritmo é adequado para guardar senhas?",
      opcoes: ["MD5", "SHA-1", "Argon2id, scrypt ou bcrypt", "Base64"],
      correta: 2,
      explicacao: "Argon2id, scrypt e bcrypt são hashes lentos e (alguns) intensivos em memória, feitos para encarecer cada tentativa do atacante. Base64 nem é um hash: é só uma codificação reversível.",
    },
    {
      enunciado: "Por que usar hmac.compare_digest em vez de == ao comparar hashes ou tokens?",
      opcoes: ["Porque a comparação leva o mesmo tempo independentemente de onde os valores diferem, evitando vazar informação pelo tempo de resposta", "Porque é mais curto", "Porque == não funciona com texto", "Porque criptografa o valor"],
      correta: 0,
      explicacao: "O operador == pode parar no primeiro byte diferente, e a diferença de tempo, medida com muitas repetições, ajuda o atacante a adivinhar o valor aos poucos. A comparação em tempo constante elimina esse sinal.",
    },
    {
      enunciado: "Qual a principal defesa contra o preenchimento de credenciais (credential stuffing)?",
      opcoes: ["Esconder a tela de login", "MFA, limite de tentativas e detecção de comportamento anormal, além de checar senhas vazadas", "Trocar o logotipo", "Usar uma senha de 4 dígitos"],
      correta: 1,
      explicacao: "O atacante usa pares válidos de outros vazamentos. Como a senha, sozinha, é legítima, o que barra é o segundo fator, o limite de tentativas e a recusa de senhas já vazadas.",
    },
    {
      enunciado: "O que é o TOTP, usado em aplicativos autenticadores de segundo fator?",
      opcoes: ["Uma senha fixa de 6 dígitos", "Um tipo de hash de senhas", "Um código de uso único calculado a partir de um segredo compartilhado e da hora, que muda a cada 30 segundos", "Um protocolo de e-mail"],
      correta: 2,
      explicacao: "No TOTP, o servidor e o aplicativo calculam, de forma independente, um HMAC do segredo com o período de tempo atual. Como os dois chegam ao mesmo número, o código prova a posse do segredo.",
    },
    {
      enunciado: "A tela de \"esqueci a senha\" responde \"este e-mail não está cadastrado\" quando a conta não existe. Qual o problema?",
      opcoes: ["Nenhum, é uma boa prática de usabilidade", "O e-mail ficou com letras maiúsculas", "A mensagem é longa demais", "A resposta diferente revela quais e-mails têm conta (enumeração de usuários); a mensagem deve ser a mesma nos dois casos"],
      correta: 3,
      explicacao: "Permitir descobrir quem é cliente alimenta phishing e ataques de preenchimento de credenciais. A resposta deve ser idêntica (e levar o mesmo tempo) exista ou não a conta.",
    },
  ],
  desafio: {
    titulo: "Um módulo de autenticação completo",
    enunciado: "Construa, em Python e usando só a biblioteca padrão, um pequeno módulo de autenticação (autenticacao.py) com cadastro, login, limite de tentativas, MFA por TOTP e recuperação de senha, mais um arquivo de testes (test_autenticacao.py, com pytest ou unittest) que mostra cada defesa funcionando. Os dados ficam em memória.",
    requisitos: [
      "Cadastro: valide o comprimento mínimo da senha (12 caracteres), recuse as 20 senhas mais óbvias de uma lista sua e guarde apenas o hash scrypt com sal, nos moldes do exemplo.",
      "Login: devolva a mesma mensagem para usuário inexistente e senha errada, calcule um hash fictício quando o usuário não existe e use comparação em tempo constante.",
      "Limite de tentativas: bloqueie o usuário após 5 falhas em 10 minutos, com um relógio injetável para os testes, e prove que outro usuário não é afetado.",
      "MFA: gere um segredo aleatório por usuário, valide códigos TOTP com janela de ±1 período e impeça o reuso do mesmo código.",
      "Recuperação: gere o token com secrets.token_urlsafe, guarde só o hash, dê validade de 30 minutos e uso único, e invalide as sessões existentes ao trocar a senha.",
    ],
    criterios: [
      "Nenhuma senha, código de MFA ou token aparece em texto no estado guardado ou em mensagens de log.",
      "Os testes cobrem o caminho feliz e cada defesa: sal diferente por registro, mensagem idêntica, bloqueio e liberação, reuso de código e token expirado.",
      "O cálculo do TOTP bate com os vetores do RFC 6238 em um teste.",
      "O tempo e o aleatório são injetáveis, para os testes não dependerem do relógio real.",
      "Você consegue explicar, para cada defesa, qual ataque ela barra.",
    ],
    dica: "Escreva os testes dos ataques primeiro (tentar a mesma senha em 6 tentativas, reusar um token, usar um código antigo) e veja-os falhar. Cada teste vermelho é uma defesa que falta implementar.",
  },
  referencias: [
    { titulo: "OWASP: guia de armazenamento de senhas (em inglês)", url: "https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html" },
    { titulo: "OWASP: guia de autenticação (em inglês)", url: "https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html" },
    { titulo: "RFC 6238: TOTP, senha de uso único baseada em tempo (em inglês)", url: "https://datatracker.ietf.org/doc/html/rfc6238" },
    { titulo: "NIST SP 800-63B: diretrizes de identidade digital (em inglês)", url: "https://pages.nist.gov/800-63-3/sp800-63b.html" },
  ],
};
