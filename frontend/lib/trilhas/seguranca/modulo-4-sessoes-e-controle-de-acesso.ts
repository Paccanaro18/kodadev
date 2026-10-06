import type { Modulo } from "../tipos";

export const SEG_MODULO_4: Modulo = {
  tipo: "modulo",
  slug: "sessoes-tokens-e-controle-de-acesso",
  titulo: "Sessões, tokens e controle de acesso",
  resumo: "Cookies de sessão, CSRF, JWT, CORS e o controle de acesso por objeto: como garantir que cada requisição é de quem diz ser e só faz o que pode.",
  nivel: "Júnior",
  leitura: "55 min",
  objetivos: [
    "Configurar cookies de sessão com os atributos de segurança corretos e explicar o que cada um impede.",
    "Explicar o CSRF e aplicar as defesas: SameSite, token por sessão e verificação de origem.",
    "Reconhecer as armadilhas dos JWT (alg none, segredo fraco, falta de expiração) e validá-los corretamente.",
    "Configurar o CORS com uma lista de origens, entendendo o que ele protege e o que não protege.",
    "Implementar autorização no servidor, por objeto e por função, com negação por padrão, evitando o IDOR.",
  ],
  preRequisitos: [
    "Ter feito os módulos anteriores da trilha, em especial o de autenticação.",
    "Conhecer o básico de HTTP: métodos, cabeçalhos e cookies.",
  ],
  pontosChave: [
    "Depois do login, o que prova quem você é é a sessão ou o token: protegê-lo é tão importante quanto proteger a senha.",
    "Toda decisão de autorização acontece no servidor, a cada requisição: nada do que vem do cliente é confiável.",
    "Controle de acesso quebrado é a categoria de risco mais frequente em aplicações web.",
    "Um JWT é assinado, não secreto: qualquer pessoa lê o conteúdo, e só a assinatura impede a adulteração.",
    "CORS limita o que o navegador deixa um site ler; não protege o servidor de quem não usa navegador.",
  ],
  blocos: [
    { tipo: "p", texto: "Depois que a pessoa se autentica, a aplicação não pede a senha a cada clique. Em vez disso, entrega um comprovante (um identificador de sessão em um cookie, ou um token assinado) que o navegador envia em cada requisição. Quem possui o comprovante é tratado como a pessoa, e por isso roubá-lo ou forjá-lo é tão bom quanto roubar a senha. A segunda metade do problema é a autorização: sabendo quem é, o que essa pessoa pode fazer? É aqui que mora a falha mais frequente das aplicações web, segundo o OWASP: o controle de acesso quebrado." },

    { tipo: "h", texto: "Cookies de sessão bem configurados" },
    { tipo: "p", texto: "O jeito clássico de manter o login é a sessão no servidor: ao autenticar, a aplicação cria um registro de sessão, gera um identificador longo e aleatório e o envia ao navegador em um cookie. A cada requisição, o navegador devolve o cookie, e o servidor consulta o registro. Esse identificador precisa ser imprevisível (use um gerador criptográfico, como secrets.token_urlsafe, com pelo menos 128 bits) e trocado depois do login, para evitar a fixação de sessão, em que o atacante planta um identificador conhecido e espera a vítima se autenticar com ele. Os atributos do cookie fazem boa parte da defesa." },
    { tipo: "tabela", legenda: "Atributos de segurança de um cookie de sessão", cabecalho: ["Atributo", "O que faz", "Ataque que dificulta"], linhas: [
      ["HttpOnly", "O JavaScript da página não consegue ler o cookie.", "Roubo da sessão por XSS."],
      ["Secure", "O cookie só é enviado por HTTPS.", "Interceptação em redes abertas."],
      ["SameSite=Lax (ou Strict)", "O navegador não envia o cookie em requisições disparadas por outros sites (a maioria delas).", "CSRF."],
      ["Path e Domain restritos", "Limita em quais caminhos e domínios o cookie é enviado.", "Vazamento para subdomínios e aplicações vizinhas."],
      ["Max-Age curto, e prefixo __Host-", "Define a validade; o prefixo exige Secure, Path=/ e proíbe o atributo Domain.", "Sessões esquecidas; cookies sobrescritos por subdomínios."],
    ] },
    { tipo: "p", texto: "Os próximos exemplos reúnem as demonstrações do módulo em um só programa. O primeiro trecho do resultado mostra os atributos de um cookie gerado com a biblioteca padrão." },
    { tipo: "codigo", linguagem: "python", legenda: "sessao.py", texto: `import base64
import hashlib
import hmac
import json
import secrets
from http.cookies import SimpleCookie

cookie = SimpleCookie()
cookie["sessao"] = secrets.token_urlsafe(24)
cookie["sessao"]["httponly"] = True
cookie["sessao"]["secure"] = True
cookie["sessao"]["samesite"] = "Lax"
cookie["sessao"]["path"] = "/"
cookie["sessao"]["max-age"] = 3600
atributos = sorted(parte.strip().split("=")[0] for parte in cookie.output(header="").split(";")[1:])
print("atributos do cookie:", atributos)

CHAVE = b"chave-so-do-servidor-de-exemplo"


def gerar_token_csrf(id_da_sessao: str) -> str:
    return hmac.new(CHAVE, id_da_sessao.encode(), hashlib.sha256).hexdigest()


def csrf_valido(id_da_sessao: str, token: str) -> bool:
    return hmac.compare_digest(gerar_token_csrf(id_da_sessao), token)


token = gerar_token_csrf("sessao-da-ana")
print("CSRF certo:", csrf_valido("sessao-da-ana", token))
print("CSRF de outra sessão:", csrf_valido("sessao-do-bruno", token))
print("sem token:", csrf_valido("sessao-da-ana", ""))


def b64(dados: bytes) -> str:
    return base64.urlsafe_b64encode(dados).rstrip(b"=").decode()


def criar_jwt(corpo: dict[str, object], algoritmo: str = "HS256") -> str:
    cabecalho = b64(json.dumps({"alg": algoritmo, "typ": "JWT"}).encode())
    carga = b64(json.dumps(corpo).encode())
    assinatura = b64(hmac.new(CHAVE, f"{cabecalho}.{carga}".encode(), hashlib.sha256).digest()) if algoritmo == "HS256" else ""
    return f"{cabecalho}.{carga}.{assinatura}"


def decodificar(parte: str) -> dict[str, object]:
    resultado: dict[str, object] = json.loads(base64.urlsafe_b64decode(parte + "=" * (-len(parte) % 4)))
    return resultado


def verificar_jwt(token: str) -> dict[str, object] | None:
    cabecalho, carga, assinatura = token.split(".")
    if decodificar(cabecalho).get("alg") != "HS256":
        return None
    esperada = b64(hmac.new(CHAVE, f"{cabecalho}.{carga}".encode(), hashlib.sha256).digest())
    return decodificar(carga) if hmac.compare_digest(esperada, assinatura) else None


legitimo = criar_jwt({"sub": "ana", "papel": "cliente"})
forjado_sem_assinatura = criar_jwt({"sub": "ana", "papel": "admin"}, algoritmo="none")
adulterado = legitimo.split(".")[0] + "." + b64(json.dumps({"sub": "ana", "papel": "admin"}).encode()) + "." + legitimo.split(".")[2]

print("token legítimo:", verificar_jwt(legitimo))
print("alg none:", verificar_jwt(forjado_sem_assinatura))
print("corpo adulterado:", verificar_jwt(adulterado))

ORIGENS_CONFIAVEIS = {"https://app.exemplo.dev", "https://admin.exemplo.dev"}


def cabecalhos_cors(origem: str | None) -> dict[str, str]:
    if origem in ORIGENS_CONFIAVEIS:
        return {"Access-Control-Allow-Origin": origem, "Access-Control-Allow-Credentials": "true", "Vary": "Origin"}
    return {"Vary": "Origin"}


print("origem confiável:", cabecalhos_cors("https://app.exemplo.dev"))
print("origem do atacante:", cabecalhos_cors("https://evil.example"))` },
    { tipo: "codigo", linguagem: "text", legenda: "Saída", texto: `atributos do cookie: ['HttpOnly', 'Max-Age', 'Path', 'SameSite', 'Secure']
CSRF certo: True
CSRF de outra sessão: False
sem token: False
token legítimo: {'sub': 'ana', 'papel': 'cliente'}
alg none: None
corpo adulterado: None
origem confiável: {'Access-Control-Allow-Origin': 'https://app.exemplo.dev', 'Access-Control-Allow-Credentials': 'true', 'Vary': 'Origin'}
origem do atacante: {'Vary': 'Origin'}` },
    { tipo: "p", texto: "A primeira linha confirma que o cookie sai com HttpOnly, Secure, SameSite, Path e Max-Age. As demais linhas ilustram as três seções seguintes, uma de cada vez." },

    { tipo: "h", texto: "CSRF: a requisição que a vítima faz sem saber" },
    { tipo: "p", texto: "O navegador anexa automaticamente os cookies de um site a toda requisição para ele, inclusive quando a requisição é disparada por outra página. O ataque de falsificação de requisição entre sites (CSRF) explora isso: o atacante cria uma página com um formulário que envia, por exemplo, uma transferência para o site do banco. Se a vítima, logada no banco, abrir essa página, o navegador envia o formulário com o cookie dela, e o banco acha que foi ela. O atacante não vê a resposta, mas não precisa: o estrago está na ação executada. O CSRF afeta ações que mudam estado (POST, PUT, DELETE), e por isso GET nunca deve alterar dados." },
    { tipo: "lista", itens: [
      "SameSite nos cookies de sessão: com Lax (o padrão atual dos navegadores) ou Strict, o cookie não acompanha formulários e requisições de outros sites. É a primeira linha de defesa, e funciona na grande maioria dos casos.",
      "Token anti-CSRF: um valor imprevisível, ligado à sessão, que a página legítima envia em cada requisição que muda estado (em um campo oculto ou cabeçalho), e que o servidor confere. O atacante não consegue obtê-lo, porque a política de mesma origem do navegador o impede de ler a página. É o que o Spring Security e o Django fazem por padrão. No exemplo, o token é um HMAC do identificador da sessão: o de outra sessão não vale, e a falta de token também é recusada.",
      "Verificação de origem: conferir os cabeçalhos Origin e Referer nas requisições que mudam estado, recusando as de origens desconhecidas.",
      "Exigir cabeçalhos personalizados em APIs usadas por JavaScript (por exemplo, Content-Type: application/json ou X-Requested-With), que formulários comuns não conseguem enviar entre sites sem passar pelo CORS.",
    ] },

    { tipo: "h", texto: "JWT: assinado não é secreto" },
    { tipo: "p", texto: "O JSON Web Token (JWT) é um formato de token com três partes, cabeçalho, corpo e assinatura, separadas por pontos. É muito usado em APIs, porque o servidor pode validar o token sem consultar um registro de sessão. Mas é cercado de armadilhas, e a primeira é conceitual: o corpo do JWT é apenas codificado em Base64, e não criptografado. Qualquer pessoa que tenha o token lê o que está dentro, então nunca coloque dados sensíveis nele. A assinatura garante a integridade (ninguém mudou o corpo), mas não o sigilo." },
    { tipo: "tabela", legenda: "As falhas clássicas de JWT", cabecalho: ["Falha", "Como é explorada", "Defesa"], linhas: [
      ["alg: none", "O atacante troca o algoritmo por \"none\" (sem assinatura), e bibliotecas ingênuas aceitam o token.", "Fixar no servidor os algoritmos permitidos e recusar qualquer outro, inclusive none."],
      ["Segredo fraco (HS256)", "Um segredo curto ou comum é descoberto por força bruta offline, e o atacante forja tokens.", "Segredos aleatórios de 256 bits ou mais, guardados em um cofre. Considere algoritmos assimétricos (RS256, EdDSA)."],
      ["Corpo adulterado", "O atacante altera papel: cliente para admin, mantendo a assinatura antiga.", "Sempre verificar a assinatura antes de ler qualquer informação do corpo."],
      ["Sem expiração", "Um token roubado vale para sempre.", "Expiração curta (exp), com renovação por um refresh token guardado e revogável."],
      ["Confusão de algoritmos", "Trocar RS256 por HS256 e assinar com a chave pública como se fosse segredo.", "Atrelar a chave ao algoritmo esperado."],
    ] },
    { tipo: "p", texto: "No exemplo, a função verificar_jwt só aceita HS256 e recalcula a assinatura. O token legítimo passa. O token com alg none é recusado, e o token em que o papel foi trocado para admin, mantendo a assinatura antiga, também é recusado, porque a assinatura não bate mais com o corpo. Outra limitação importante: um JWT válido continua válido até expirar, e o servidor não consegue \"cancelá-lo\" sem manter uma lista de revogação, o que anula parte da vantagem. Por isso, para aplicações web tradicionais, a sessão com cookie HttpOnly costuma ser mais simples e mais segura do que guardar JWT no armazenamento do navegador (localStorage), que um XSS consegue ler." },

    { tipo: "h", texto: "CORS: o que ele protege, e o que não protege" },
    { tipo: "p", texto: "Por padrão, os navegadores aplicam a política de mesma origem: um script de uma página só pode ler respostas do mesmo site (mesmo protocolo, domínio e porta). O CORS (compartilhamento de recursos entre origens) é o mecanismo que permite relaxar essa regra, por meio de cabeçalhos que o servidor devolve dizendo \"aceito que o site X leia as minhas respostas\". O erro clássico é abrir demais: devolver Access-Control-Allow-Origin igual à origem recebida (refletir) e ainda Allow-Credentials true. Assim, qualquer site malicioso consegue chamar a API com o cookie da vítima e ler a resposta, exatamente como no desafio \"O CORS generoso\" da área Segurança do Koda. A defesa é uma lista fixa de origens confiáveis, como na função cabecalhos_cors: a origem confiável recebe a liberação, e a do atacante não recebe nada." },
    { tipo: "alerta", titulo: "CORS não é um controle de acesso", texto: "O CORS é uma regra aplicada pelo navegador, para proteger o usuário. Um atacante que usa curl, um script ou qualquer cliente fora do navegador ignora completamente o CORS. Ele não substitui a autenticação e a autorização no servidor: nunca o use para decidir quem pode acessar um recurso." },

    { tipo: "h", texto: "Controle de acesso: a categoria mais frequente" },
    { tipo: "p", texto: "Autenticação diz quem você é. Autorização diz o que você pode fazer. Controle de acesso quebrado é a falha em que uma pessoa consegue ler ou fazer o que não deveria, e é a categoria de risco mais comum nas aplicações web. Suas variantes mais conhecidas são o IDOR (referência insegura direta a objeto), em que trocar um número na URL mostra o recurso de outra pessoa, a escalada vertical (um usuário comum acessa funções de administrador) e a escalada horizontal (um usuário acessa os recursos de outro do mesmo nível). A causa quase sempre é a mesma: a aplicação confiou em algo que veio do cliente, ou simplesmente esqueceu de verificar." },
    { tipo: "codigo", linguagem: "python", legenda: "acesso.py", texto: `from dataclasses import dataclass


@dataclass(frozen=True)
class Pedido:
    id: int
    dono: str
    total: float


PEDIDOS = {1001: Pedido(1001, "ana", 120.0), 1002: Pedido(1002, "bruno", 89.9), 1003: Pedido(1003, "ana", 45.0)}
PERMISSOES = {"cliente": {"pedido:ler_proprio"}, "atendente": {"pedido:ler_proprio", "pedido:ler_qualquer"}, "admin": {"pedido:ler_proprio", "pedido:ler_qualquer", "pedido:apagar"}}


class NaoEncontrado(Exception):
    pass


class Proibido(Exception):
    pass


def tem(papel: str, permissao: str) -> bool:
    return permissao in PERMISSOES.get(papel, set())


def ler_pedido_inseguro(pedido_id: int) -> Pedido:
    return PEDIDOS[pedido_id]


def ler_pedido(usuario: str, papel: str, pedido_id: int) -> Pedido:
    pedido = PEDIDOS.get(pedido_id)
    if pedido is None:
        raise NaoEncontrado()
    if pedido.dono == usuario and tem(papel, "pedido:ler_proprio"):
        return pedido
    if tem(papel, "pedido:ler_qualquer"):
        return pedido
    raise NaoEncontrado()


print("inseguro, Ana pede o pedido do Bruno:", ler_pedido_inseguro(1002))
for usuario, papel, pedido_id in [("ana", "cliente", 1001), ("ana", "cliente", 1002), ("ana", "cliente", 9999), ("carla", "atendente", 1002), ("ana", "papel-inventado", 1001)]:
    try:
        print(f"{usuario}/{papel} pede {pedido_id}:", ler_pedido(usuario, papel, pedido_id))
    except NaoEncontrado:
        print(f"{usuario}/{papel} pede {pedido_id}: 404")
print("cliente pode apagar?", tem("cliente", "pedido:apagar"), "| admin pode apagar?", tem("admin", "pedido:apagar"))` },
    { tipo: "codigo", linguagem: "text", legenda: "Saída", texto: `inseguro, Ana pede o pedido do Bruno: Pedido(id=1002, dono='bruno', total=89.9)
ana/cliente pede 1001: Pedido(id=1001, dono='ana', total=120.0)
ana/cliente pede 1002: 404
ana/cliente pede 9999: 404
carla/atendente pede 1002: Pedido(id=1002, dono='bruno', total=89.9)
ana/papel-inventado pede 1001: 404
cliente pode apagar? False | admin pode apagar? True` },
    { tipo: "p", texto: "A primeira linha é o IDOR: a função ler_pedido_inseguro devolve qualquer pedido pelo número, e a Ana lê o do Bruno. A versão correta confere duas coisas a cada requisição: o dono do objeto e a permissão do papel. A Ana lê o próprio pedido (1001), mas recebe 404 para o do Bruno (1002), e a resposta é idêntica à de um pedido que não existe (9999), de modo que o atacante não descobre quais números existem. A atendente, cujo papel inclui ler_qualquer, lê o pedido do Bruno. E um papel inventado, que não está na tabela, não tem permissão nenhuma: é a negação por padrão." },
    { tipo: "numerada", itens: [
      "Negue por padrão: toda rota exige autenticação, e o acesso só existe onde uma regra o concede. Esquecer de proteger uma rota nova não pode significar deixá-la aberta.",
      "Verifique no servidor, a cada requisição, e no nível do objeto: \"este usuário pode ver este pedido?\", e não apenas \"este usuário está logado?\".",
      "Nunca confie em dados do cliente para decidir a permissão (um campo papel=admin no corpo, um id de usuário na URL em vez do da sessão): o usuário vem da sessão.",
      "Centralize a lógica em um só lugar (um serviço de autorização, anotações do framework), em vez de repetir ifs pelo código, onde um será esquecido.",
      "Prefira recursos por permissões (pedido:ler_proprio) a papéis rígidos, e dê o mínimo necessário a cada papel.",
      "Registre as negações de acesso: uma sequência delas de uma mesma conta é o sinal de uma sondagem em andamento.",
      "Teste a autorização: para cada rota, escreva testes com um usuário sem permissão e com o usuário de outra conta, e espere 403 ou 404.",
    ] },
    { tipo: "dica", titulo: "Identificadores imprevisíveis ajudam, mas não substituem a verificação", texto: "Trocar ids sequenciais (1001, 1002) por UUIDs dificulta adivinhar o recurso alheio, e é uma boa camada extra. Mas um UUID vazado (em um e-mail, em um log, em uma URL compartilhada) volta a ser um IDOR se não houver a verificação de propriedade. A defesa é checar a autorização, e o id imprevisível é só uma camada." },

    { tipo: "h", texto: "Cabeçalhos de segurança: defesas de uma linha" },
    { tipo: "p", texto: "Além dos cookies, o servidor pode instruir o navegador a ligar proteções com cabeçalhos de resposta, que custam quase nada e fecham classes inteiras de ataque." },
    { tipo: "tabela", legenda: "Cabeçalhos que toda aplicação web deveria enviar", cabecalho: ["Cabeçalho", "Para que serve"], linhas: [
      ["Strict-Transport-Security (HSTS)", "Manda o navegador usar sempre HTTPS com o site, impedindo o rebaixamento para HTTP."],
      ["Content-Security-Policy", "Restringe de onde vêm scripts, estilos e imagens, reduzindo o estrago do XSS."],
      ["X-Content-Type-Options: nosniff", "Impede o navegador de \"adivinhar\" o tipo de um arquivo e executá-lo como script."],
      ["Referrer-Policy", "Controla o quanto da URL de origem é enviado a outros sites."],
      ["frame-ancestors (na CSP) ou X-Frame-Options", "Impede que o seu site seja exibido dentro de uma moldura em outra página (clickjacking)."],
      ["Permissions-Policy", "Desliga recursos do navegador de que a página não precisa (câmera, geolocalização)."],
    ] },
  ],
  questoes: [
    {
      enunciado: "Qual atributo de cookie impede que um script injetado por XSS leia o identificador de sessão?",
      opcoes: ["Secure", "HttpOnly", "SameSite", "Path"],
      correta: 1,
      explicacao: "O HttpOnly esconde o cookie do JavaScript da página. O Secure só exige HTTPS, e o SameSite restringe o envio em requisições de outros sites (defesa contra CSRF).",
    },
    {
      enunciado: "Como funciona o ataque de CSRF?",
      opcoes: ["Uma página do atacante faz o navegador da vítima enviar uma requisição ao site alvo, e o navegador anexa o cookie de sessão automaticamente", "O atacante lê o banco de dados", "O atacante descobre a senha por força bruta", "O atacante troca o certificado do site"],
      correta: 0,
      explicacao: "O navegador inclui os cookies de um site em qualquer requisição para ele, mesmo disparada por outra página. O site alvo acredita que a ação veio da vítima logada.",
    },
    {
      enunciado: "Qual combinação de defesas é a mais usada contra CSRF?",
      opcoes: ["Cookie SameSite (Lax ou Strict) e token anti-CSRF nas requisições que mudam estado", "Apenas HTTPS", "Apenas senhas fortes", "Esconder a URL"],
      correta: 0,
      explicacao: "O SameSite impede que o navegador envie o cookie em requisições de outros sites, e o token garante que a requisição veio de uma página legítima da própria aplicação.",
    },
    {
      enunciado: "Qual afirmação sobre o JWT é correta?",
      opcoes: ["O corpo é criptografado, então pode guardar dados sensíveis", "A assinatura é opcional em qualquer caso", "O corpo é apenas codificado em Base64, então qualquer pessoa o lê; a assinatura garante a integridade, e não o sigilo", "Um JWT pode ser cancelado a qualquer momento sem esforço extra"],
      correta: 2,
      explicacao: "Em um JWT comum, o conteúdo é legível por quem tiver o token. Só a assinatura impede a alteração. E, como o servidor não guarda estado, cancelar um token antes de expirar exige uma lista de revogação.",
    },
    {
      enunciado: "Por que a verificação de um JWT deve fixar o algoritmo esperado no servidor?",
      opcoes: ["Para ganhar velocidade", "Porque o algoritmo muda a cada hora", "Porque o JWT só funciona com um algoritmo", "Para impedir que o atacante troque o algoritmo (por exemplo, para none) e faça o servidor aceitar um token sem assinatura válida"],
      correta: 3,
      explicacao: "Se o servidor obedece ao campo alg que vem no próprio token, o atacante escolhe o que lhe convém. Fixar o algoritmo permitido fecha esse caminho.",
    },
    {
      enunciado: "Uma API devolve Access-Control-Allow-Origin igual à origem recebida e Access-Control-Allow-Credentials: true para qualquer origem. Qual o risco?",
      opcoes: ["Nenhum, é uma configuração prática", "Qualquer site malicioso consegue chamar a API com as credenciais da vítima e ler a resposta", "A API fica mais lenta", "O certificado deixa de valer"],
      correta: 1,
      explicacao: "Refletir a origem com credenciais equivale a liberar todos os sites. A defesa é uma lista fixa de origens confiáveis.",
    },
    {
      enunciado: "Ana, logada, acessa /api/pedidos/1002 e recebe os dados de um pedido do Bruno. Qual falha isso demonstra, e qual a correção?",
      opcoes: ["IDOR (controle de acesso quebrado); verificar no servidor se o pedido pertence ao usuário da sessão a cada requisição", "Injeção de SQL; usar parâmetros", "XSS; escapar a saída", "CSRF; usar SameSite"],
      correta: 0,
      explicacao: "A aplicação só conferiu que Ana estava logada, e não que o objeto era dela. A correção é a autorização por objeto, com negação por padrão, e de preferência a mesma resposta para o que não existe e o que não pode ser visto.",
    },
  ],
  desafio: {
    titulo: "Autorização e sessões em uma API de notas",
    enunciado: "Construa, em Python (um arquivo, sem frameworks), o núcleo de segurança de uma pequena API de notas pessoais: sessões, CSRF, autorização por objeto e cabeçalhos. A \"API\" pode ser funções que recebem um dicionário de requisição e devolvem um dicionário de resposta, com testes que simulam um atacante.",
    requisitos: [
      "Sessões: gere identificadores com secrets.token_urlsafe, guarde-os em memória com expiração, regenere o identificador no login e devolva o cookie com HttpOnly, Secure e SameSite=Lax.",
      "CSRF: gere um token por sessão (HMAC do identificador) e recuse requisições POST, PUT e DELETE sem o token correto, com comparação em tempo constante.",
      "Autorização: cada nota tem um dono; implemente ler, editar e apagar com verificação de propriedade, uma tabela de permissões por papel (cliente, moderador) e negação por padrão, devolvendo a mesma resposta (404) para nota inexistente e nota de outra pessoa.",
      "Cabeçalhos: toda resposta deve incluir CSP restritiva, nosniff, Referrer-Policy e frame-ancestors, e a função de CORS deve usar uma lista fixa de origens.",
      "Testes de ataque: escreva ao menos 8 testes, incluindo IDOR (ler, editar e apagar a nota de outra pessoa), CSRF sem token, sessão expirada, papel inventado, origem CORS não confiável e tentativa de fixação de sessão.",
    ],
    criterios: [
      "Cada teste de ataque falha (o ataque é barrado) e há um teste do caminho legítimo correspondente que passa.",
      "Nenhuma decisão de permissão usa dados vindos do corpo da requisição: o usuário e o papel vêm só da sessão.",
      "Uma rota nova, sem regra explícita, é negada por padrão, e há um teste que prova isso.",
      "As respostas de erro não distinguem \"não existe\" de \"não é seu\".",
      "Você explica, para cada defesa, qual ataque da lista do módulo ela barra.",
    ],
    dica: "Escreva primeiro a versão ingênua das funções e os testes de ataque que a quebram. Ver o IDOR funcionar na sua própria API é a melhor forma de entender por que a verificação por objeto é indispensável.",
  },
  referencias: [
    { titulo: "OWASP: guia de gerenciamento de sessões (em inglês)", url: "https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html" },
    { titulo: "OWASP: prevenção de CSRF (em inglês)", url: "https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html" },
    { titulo: "OWASP: guia de JWT (em inglês)", url: "https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_Cheat_Sheet.html" },
    { titulo: "MDN: CORS", url: "https://developer.mozilla.org/pt-BR/docs/Web/HTTP/Guides/CORS" },
    { titulo: "OWASP: autorização (em inglês)", url: "https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html" },
  ],
};
