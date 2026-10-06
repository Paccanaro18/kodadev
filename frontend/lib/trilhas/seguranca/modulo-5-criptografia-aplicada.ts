import type { Modulo } from "../tipos";

export const SEG_MODULO_5: Modulo = {
  tipo: "modulo",
  slug: "criptografia-aplicada",
  titulo: "Criptografia aplicada: o que usar, quando e como",
  resumo: "Hash, HMAC, criptografia autenticada (AES-GCM), assinaturas, acordo de chaves e TLS: para que serve cada peça e os erros que as tornam inúteis.",
  nivel: "Júnior",
  leitura: "55 min",
  objetivos: [
    "Escolher a primitiva certa para cada necessidade: sigilo, integridade, autenticidade ou troca de chaves.",
    "Diferenciar hash, HMAC, criptografia simétrica, criptografia de chave pública e assinatura digital.",
    "Usar criptografia autenticada (AES-GCM) e entender por que o nonce nunca pode se repetir.",
    "Assinar e verificar dados com Ed25519 e derivar chaves de sessão com acordo de chaves e HKDF.",
    "Configurar TLS com validação de certificado e evitar os atalhos que o desligam.",
  ],
  preRequisitos: [
    "Ter feito os módulos de autenticação e de entrada hostil, ou conhecer hash de senhas e HMAC.",
    "Saber ler Python básico. Os exemplos usam a biblioteca padrão e o pacote cryptography (pip install cryptography).",
  ],
  pontosChave: [
    "Não existe uma \"criptografia\" só: cada primitiva resolve um problema (sigilo, integridade, autenticidade).",
    "Nunca invente algoritmos nem monte esquemas à mão: use bibliotecas consagradas e as suas interfaces de alto nível.",
    "Criptografia sem autenticação (ECB, CBC, CTR puros) permite adulteração: prefira modos autenticados, como o AES-GCM.",
    "A segurança está na chave, e não no algoritmo: gerar, guardar, rotacionar e proteger chaves é o difícil.",
    "Desligar a verificação do certificado para \"fazer funcionar\" anula o TLS inteiro.",
  ],
  blocos: [
    { tipo: "p", texto: "A criptografia é a ferramenta mais poderosa e a mais mal usada da segurança. Os algoritmos modernos são sólidos: quase nenhum sistema é quebrado porque o AES foi derrotado. Os sistemas são quebrados porque alguém usou o modo errado, reutilizou um valor que não podia, guardou a chave ao lado do dado, desligou a verificação de um certificado para o teste passar ou escreveu a própria cifra. Este módulo apresenta as peças essenciais, para que servem e como usá-las do jeito que tem poucas armadilhas." },
    { tipo: "alerta", titulo: "A regra de ouro: não invente criptografia", texto: "Nunca crie o seu próprio algoritmo ou protocolo, e evite montar esquemas combinando peças de baixo nível. Use as interfaces de alto nível das bibliotecas reconhecidas (como a cryptography, em Python; a Java Cryptography Architecture e o Bouncy Castle, em Java; o módulo crypto do Node ou o libsodium), com os parâmetros recomendados atuais. Um esquema que \"parece seguro\" para quem o inventou costuma ser o primeiro a cair." },

    { tipo: "h", texto: "Qual problema você está resolvendo?" },
    { tipo: "tabela", legenda: "Cada necessidade tem a sua primitiva", cabecalho: ["Necessidade", "Primitiva", "Exemplo de uso"], linhas: [
      ["Impressão digital de um dado (detectar mudança acidental)", "Função de hash (SHA-256)", "Verificar se um arquivo baixado é o esperado."],
      ["Garantir que a mensagem não foi alterada, entre quem compartilha uma chave", "HMAC", "Assinar cookies, tokens de CSRF, webhooks."],
      ["Manter o conteúdo em segredo e detectar adulteração", "Criptografia simétrica autenticada (AES-GCM, ChaCha20-Poly1305)", "Criptografar dados sensíveis no banco ou em arquivos."],
      ["Provar a origem e a integridade, sem compartilhar segredo com o verificador", "Assinatura digital (Ed25519, ECDSA, RSA-PSS)", "Assinar releases de software, tokens, certificados."],
      ["Combinar uma chave secreta com alguém pela rede", "Acordo de chaves (X25519, ECDH)", "Estabelecer uma sessão TLS, mensageiros."],
      ["Guardar senhas", "Hash lento com sal (Argon2id, scrypt, bcrypt)", "Veja o módulo de autenticação."],
    ] },

    { tipo: "h", texto: "Hash e HMAC: integridade" },
    { tipo: "p", texto: "Uma função de hash transforma qualquer entrada em uma saída de tamanho fixo (32 bytes no SHA-256) de forma determinística e de via única: dá para calcular o hash de um dado, mas não recuperar o dado a partir do hash, e uma pequena mudança na entrada muda a saída inteira. Serve para verificar integridade quando o hash chega por um canal confiável (o hash publicado de um instalador, por exemplo). O hash sozinho, porém, não autentica nada: um atacante que adultera a mensagem simplesmente calcula o novo hash. Para isso existe o HMAC, que mistura uma chave secreta ao cálculo: só quem tem a chave produz uma etiqueta válida." },
    { tipo: "codigo", linguagem: "python", legenda: "hash_hmac.py", texto: `import hashlib
import hmac

mensagem = b"transferir 100 para a conta 42"
print("SHA-256:", hashlib.sha256(mensagem).hexdigest()[:32] + "...")
print("1 byte muda tudo:", hashlib.sha256(b"transferir 900 para a conta 42").hexdigest()[:32] + "...")

chave = b"chave-compartilhada-de-exemplo"
etiqueta = hmac.new(chave, mensagem, hashlib.sha256).hexdigest()
print("HMAC:", etiqueta[:32] + "...")
print("mensagem íntegra:", hmac.compare_digest(etiqueta, hmac.new(chave, mensagem, hashlib.sha256).hexdigest()))
adulterada = b"transferir 900 para a conta 42"
print("mensagem adulterada:", hmac.compare_digest(etiqueta, hmac.new(chave, adulterada, hashlib.sha256).hexdigest()))
print("quem não tem a chave forja?", hmac.compare_digest(etiqueta, hashlib.sha256(adulterada).hexdigest()))` },
    { tipo: "codigo", linguagem: "text", legenda: "Saída", texto: `SHA-256: d81b907d1bab5672669ff8a6a5b698db...
1 byte muda tudo: d7828be08b563b58889894b4a530a28e...
HMAC: 1ee53835ecedb973570d0baaaaf05ced...
mensagem íntegra: True
mensagem adulterada: False
quem não tem a chave forja? False` },
    { tipo: "p", texto: "Trocar \"100\" por \"900\" muda o hash por completo. O HMAC detecta a adulteração (mensagem adulterada: False), e, na última linha, quem tenta forjar uma etiqueta usando apenas o hash simples, sem a chave, também falha. Lembre-se de comparar etiquetas com hmac.compare_digest, em tempo constante. Nunca use MD5 ou SHA-1 para segurança: ambos têm colisões demonstradas, ou seja, dois dados diferentes com o mesmo hash, o que permite fraudes." },

    { tipo: "h", texto: "Criptografia simétrica autenticada" },
    { tipo: "p", texto: "Na criptografia simétrica, a mesma chave cifra e decifra. O AES é o algoritmo padrão, mas ele é só um bloco de construção: o modo de operação em que se usa decide se o esquema é seguro. Modos antigos, como o ECB (que cifra blocos iguais de forma igual e deixa padrões visíveis) e o CBC ou o CTR sem autenticação, protegem o sigilo mas não impedem que um atacante altere o texto cifrado de forma controlada. A resposta moderna é a criptografia autenticada com dados associados (AEAD), representada pelo AES-GCM e pelo ChaCha20-Poly1305: ela cifra e, ao mesmo tempo, gera uma etiqueta de autenticação, e a decifração só funciona se nada foi alterado." },
    { tipo: "codigo", linguagem: "python", legenda: "aesgcm.py", texto: `import os

from cryptography.exceptions import InvalidTag
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.primitives.ciphers.aead import AESGCM

chave = AESGCM.generate_key(bit_length=256)
cofre = AESGCM(chave)
nonce = os.urandom(12)
dados_associados = b"usuario=ana"
cifrado = cofre.encrypt(nonce, "cartão 4111 1111 1111 1111".encode(), dados_associados)
print("tamanho do texto cifrado:", len(cifrado), "bytes (texto + 16 de etiqueta)")
print("decifra:", cofre.decrypt(nonce, cifrado, dados_associados).decode())

adulterado = bytearray(cifrado)
adulterado[0] ^= 1
for rotulo, tentativa, associados in [("bit alterado", bytes(adulterado), dados_associados), ("contexto trocado", cifrado, b"usuario=bruno")]:
    try:
        cofre.decrypt(nonce, tentativa, associados)
        print(rotulo, "-> aceito (ruim)")
    except InvalidTag:
        print(rotulo, "-> recusado")

chave_fixa = bytes(range(32))
nonce_fixo = bytes(16)


def ctr(texto: bytes) -> bytes:
    cifrador = Cipher(algorithms.AES(chave_fixa), modes.CTR(nonce_fixo)).encryptor()
    return cifrador.update(texto) + cifrador.finalize()


a = b"senha do banco: pao123"
b = b"senha do admin: ouro99"
c1, c2 = ctr(a), ctr(b)
xor_cifrados = bytes(x ^ y for x, y in zip(c1, c2))
xor_textos = bytes(x ^ y for x, y in zip(a, b))
print("nonce repetido vaza o XOR dos textos:", xor_cifrados == xor_textos)` },
    { tipo: "codigo", linguagem: "text", legenda: "Saída", texto: `tamanho do texto cifrado: 43 bytes (texto + 16 de etiqueta)
decifra: cartão 4111 1111 1111 1111
bit alterado -> recusado
contexto trocado -> recusado
nonce repetido vaza o XOR dos textos: True` },
    { tipo: "p", texto: "O que o programa mostra. A chave tem 256 bits e é gerada pela própria biblioteca, de forma criptograficamente segura. O nonce (12 bytes aleatórios) acompanha cada mensagem, e é guardado junto do texto cifrado (não é segredo). Os dados associados (aqui, \"usuario=ana\") não são cifrados, mas ficam amarrados à etiqueta: tentar decifrar com outro contexto, como \"usuario=bruno\", falha, o que impede que um texto cifrado de uma pessoa seja \"transplantado\" para outra. E trocar um único bit do texto cifrado faz a decifração ser recusada, em vez de devolver lixo ou um texto adulterado." },
    { tipo: "p", texto: "A última linha mostra o erro mais perigoso: reutilizar a combinação chave e nonce. No exemplo, que usa o modo CTR (a base do GCM) com uma chave e um nonce fixos, o XOR dos dois textos cifrados é igual ao XOR dos textos originais: o atacante, sem conhecer a chave, descobre as relações entre as duas mensagens e, com palpites, recupera ambas. No AES-GCM, a repetição é ainda pior: vaza também a chave de autenticação, e o atacante passa a forjar mensagens. A regra é gerar um nonce novo, aleatório (12 bytes) ou por contador, a cada mensagem cifrada com a mesma chave, e nunca repeti-lo." },
    { tipo: "lista", itens: [
      "Gere chaves com o gerador da biblioteca (AESGCM.generate_key), nunca a partir de uma senha digitada ou de um texto fixo. Se a chave vier de uma senha, derive-a com um algoritmo próprio (scrypt, Argon2, PBKDF2) e sal.",
      "Guarde a chave separada do dado: em um cofre de segredos ou em um serviço de gerenciamento de chaves (KMS), nunca ao lado do banco que ela protege.",
      "Planeje a rotação: um identificador de versão da chave junto do texto cifrado permite trocar a chave sem perder o acesso aos dados antigos.",
      "Criptografar dados em repouso protege contra o roubo do disco ou do backup, mas não contra uma aplicação invadida, que tem acesso à chave. Decida a ameaça antes de decidir o mecanismo.",
    ] },

    { tipo: "h", texto: "Chave pública: assinaturas e acordo de chaves" },
    { tipo: "p", texto: "Na criptografia de chave pública, cada pessoa ou sistema tem um par de chaves: uma privada, que nunca sai de seu dono, e uma pública, que pode ser distribuída livremente. Dois usos são essenciais. A assinatura digital: quem tem a chave privada assina um dado, e qualquer pessoa com a chave pública verifica que a assinatura é válida (o dado não mudou e veio do dono da chave), sem precisar de um segredo compartilhado. É como se assinam atualizações de software, tokens e certificados. O acordo de chaves: duas partes, cada uma com seu par, combinam a chave pública da outra com a sua privada e chegam ao mesmo segredo compartilhado, sem enviá-lo pela rede. Esse segredo vira a chave simétrica de uma sessão (é como o TLS funciona)." },
    { tipo: "codigo", linguagem: "python", legenda: "assinatura.py", texto: `from cryptography.exceptions import InvalidSignature
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.asymmetric.ed25519 import Ed25519PrivateKey
from cryptography.hazmat.primitives.asymmetric.x25519 import X25519PrivateKey
from cryptography.hazmat.primitives.kdf.hkdf import HKDF

privada = Ed25519PrivateKey.generate()
publica = privada.public_key()
documento = b"versao=2.4.1;sha256=ab12cd34"
assinatura = privada.sign(documento)
print("assinatura:", len(assinatura), "bytes")
for rotulo, texto in [("documento original", documento), ("documento alterado", b"versao=2.4.1;sha256=ffffffff")]:
    try:
        publica.verify(assinatura, texto)
        print(rotulo, "-> assinatura válida")
    except InvalidSignature:
        print(rotulo, "-> assinatura inválida")

ana = X25519PrivateKey.generate()
bruno = X25519PrivateKey.generate()
segredo_da_ana = ana.exchange(bruno.public_key())
segredo_do_bruno = bruno.exchange(ana.public_key())
print("acordo de chaves igual nos dois lados:", segredo_da_ana == segredo_do_bruno)
chave_de_sessao = HKDF(algorithm=hashes.SHA256(), length=32, salt=None, info=b"chat v1").derive(segredo_da_ana)
print("chave de sessão derivada:", len(chave_de_sessao), "bytes")` },
    { tipo: "codigo", linguagem: "text", legenda: "Saída", texto: `assinatura: 64 bytes
documento original -> assinatura válida
documento alterado -> assinatura inválida
acordo de chaves igual nos dois lados: True
chave de sessão derivada: 32 bytes` },
    { tipo: "p", texto: "A assinatura Ed25519 tem 64 bytes e confere com o documento original, mas é recusada para o documento em que o hash foi alterado. No acordo de chaves, Ana e Bruno geram cada um o seu par X25519, trocam apenas as chaves públicas e chegam ao mesmo segredo. Esse segredo bruto não deve ser usado direto como chave: a função de derivação HKDF o transforma em uma chave de sessão uniforme, com um rótulo de contexto (\"chat v1\") que separa os usos. Para novos sistemas, as curvas modernas (Ed25519 e X25519) são a escolha padrão, mais simples e menos propensas a erros do que o RSA; se usar RSA, empregue chaves de pelo menos 2048 bits (de preferência 3072) com os preenchimentos modernos (OAEP e PSS)." },
    { tipo: "alerta", titulo: "Como saber que a chave pública é mesmo de quem se pensa?", texto: "A criptografia de chave pública prova a posse da chave, e não a identidade. Se um atacante trocar a chave pública no caminho, você verifica a assinatura dele com a chave dele. É por isso que existem os certificados e as autoridades certificadoras (o assunto da próxima seção): um terceiro confiável assina a ligação entre um nome (o domínio) e uma chave pública." },

    { tipo: "h", texto: "TLS e HTTPS: a criptografia no transporte" },
    { tipo: "p", texto: "O TLS junta todas as peças em um protocolo. Na conexão, o servidor apresenta o seu certificado (uma chave pública assinada por uma autoridade que o seu sistema já confia), o cliente verifica essa cadeia e o nome do site, as duas pontas fazem um acordo de chaves e, daí em diante, trocam dados cifrados e autenticados com uma chave de sessão. Resultado: quem está no meio do caminho não lê nem altera o tráfego, e o cliente sabe que está falando com o dono do domínio. O HTTPS é o HTTP dentro do TLS. Todo o tráfego de uma aplicação (inclusive entre os próprios serviços, quando atravessam redes não confiáveis) deve usá-lo, com a versão 1.2 como mínimo e preferência pela 1.3." },
    { tipo: "codigo", linguagem: "python", legenda: "tls.py", texto: `import ssl

contexto = ssl.create_default_context()
print("verifica certificado:", contexto.verify_mode == ssl.CERT_REQUIRED)
print("verifica nome do host:", contexto.check_hostname)
print("versão mínima:", contexto.minimum_version.name)

perigoso = ssl.SSLContext(ssl.PROTOCOL_TLS_CLIENT)
perigoso.check_hostname = False
perigoso.verify_mode = ssl.CERT_NONE
print("contexto 'para funcionar rápido' verifica certificado?", perigoso.verify_mode == ssl.CERT_REQUIRED)` },
    { tipo: "codigo", linguagem: "text", legenda: "Saída", texto: `verifica certificado: True
verifica nome do host: True
versão mínima: TLSv1_2
contexto 'para funcionar rápido' verifica certificado? False` },
    { tipo: "p", texto: "O contexto padrão do Python já vem seguro: exige certificado, confere o nome do host e recusa versões antigas do protocolo. A última linha é a armadilha: o código que desliga check_hostname e coloca verify_mode como CERT_NONE (o famoso \"verify=False\" do requests, o \"rejectUnauthorized: false\" do Node, o TrustManager que aceita tudo, em Java) continua cifrando, mas com qualquer um do outro lado, inclusive um atacante no meio do caminho (man-in-the-middle). Esse atalho é comum em testes e escapa para a produção. Se um certificado interno não é reconhecido, a solução é instalar a autoridade certificadora interna como confiável, e não desligar a verificação." },
    { tipo: "lista", itens: [
      "Ative o HSTS (Strict-Transport-Security) para o navegador usar sempre HTTPS com o seu site.",
      "Renove os certificados automaticamente (o Let's Encrypt e os serviços de nuvem fazem isso), para nunca expirarem por esquecimento.",
      "Guarde a chave privada do certificado com permissões restritas, e troque-a se houver suspeita de vazamento.",
      "Desative versões antigas (SSL 3, TLS 1.0 e 1.1) e cifras fracas. Ferramentas como o SSL Labs testam a configuração de um site.",
    ] },

    { tipo: "h", texto: "Os erros que acabam com a criptografia" },
    { tipo: "tabela", legenda: "Os deslizes mais comuns", cabecalho: ["Erro", "Consequência", "Correção"], linhas: [
      ["Chave no código ou ao lado dos dados", "Quem rouba o código ou o banco rouba tudo.", "Cofre de segredos ou KMS; chave separada dos dados."],
      ["Nonce ou IV repetido", "Vazamento de dados e, no GCM, de chaves de autenticação.", "Nonce novo e aleatório a cada mensagem."],
      ["Cifrar sem autenticar (ECB, CBC, CTR puros)", "Adulteração silenciosa do texto cifrado.", "Modos AEAD: AES-GCM ou ChaCha20-Poly1305."],
      ["Aleatoriedade fraca (random, rand())", "Tokens e chaves previsíveis.", "secrets, os.urandom, SecureRandom: geradores criptográficos."],
      ["MD5 ou SHA-1 para segurança", "Colisões permitem fraudes.", "SHA-256 ou superior; hashes lentos para senhas."],
      ["Verificação de certificado desligada", "Interceptação do tráfego.", "Manter a validação e instalar a CA interna, se preciso."],
      ["Algoritmo próprio", "Quase sempre quebrado.", "Bibliotecas e padrões consagrados."],
    ] },
  ],
  questoes: [
    {
      enunciado: "Qual primitiva permite que quem NÃO conhece nenhum segredo verifique que um software foi publicado por quem se diz autor?",
      opcoes: ["Hash SHA-256", "HMAC", "Assinatura digital com chave pública", "AES-GCM"],
      correta: 2,
      explicacao: "Na assinatura digital, a chave privada assina e a pública verifica, sem segredo compartilhado. O hash sozinho não autentica, e o HMAC exige que o verificador conheça a mesma chave secreta.",
    },
    {
      enunciado: "Por que um hash simples (SHA-256) não basta para proteger uma mensagem contra adulteração por um atacante?",
      opcoes: ["Porque o SHA-256 é lento", "Porque o hash é reversível", "Porque o hash ocupa muito espaço", "Porque o atacante pode alterar a mensagem e calcular o novo hash; o HMAC resolve usando uma chave secreta"],
      correta: 3,
      explicacao: "O hash não tem segredo: qualquer um o calcula. O HMAC incorpora uma chave, de modo que só quem a possui produz uma etiqueta válida.",
    },
    {
      enunciado: "Qual a vantagem do AES-GCM sobre o AES-CBC sem autenticação?",
      opcoes: ["Cifra e autentica ao mesmo tempo, detectando qualquer adulteração do texto cifrado", "É mais antigo", "Dispensa chave", "Gera textos cifrados menores"],
      correta: 0,
      explicacao: "Modos AEAD, como o GCM, produzem uma etiqueta de autenticação. Se um único bit for alterado, a decifração falha, em vez de devolver dados corrompidos ou manipulados.",
    },
    {
      enunciado: "O que acontece se o mesmo par chave e nonce for reutilizado para cifrar duas mensagens no AES-GCM (ou CTR)?",
      opcoes: ["Nada, o nonce é opcional", "O XOR dos textos cifrados vaza o XOR dos textos originais, e no GCM a chave de autenticação também se compromete", "O programa fica mais lento", "A segunda mensagem é recusada"],
      correta: 1,
      explicacao: "O nonce garante que o fluxo de chave seja diferente a cada mensagem. Repeti-lo permite relacionar as mensagens e recuperar informação sem conhecer a chave.",
    },
    {
      enunciado: "Para que serve o parâmetro \"dados associados\" (AAD) no AES-GCM?",
      opcoes: ["Para cifrar um dado extra", "Para aumentar a chave", "Para amarrar à etiqueta um contexto que fica em claro (como o usuário), impedindo transplantar o texto cifrado para outro contexto", "Para gerar o nonce"],
      correta: 2,
      explicacao: "Os dados associados não são cifrados, mas fazem parte da autenticação. Decifrar com um contexto diferente falha, o que previne reutilizações indevidas do mesmo texto cifrado.",
    },
    {
      enunciado: "Qual é o papel de um certificado digital no TLS?",
      opcoes: ["Cifrar o tráfego", "Ligar um nome (o domínio) a uma chave pública, com a assinatura de uma autoridade em que o cliente confia", "Armazenar a senha do usuário", "Comprimir os dados"],
      correta: 1,
      explicacao: "O certificado permite ao cliente saber que a chave pública pertence mesmo ao domínio acessado. A cifragem é feita depois, com a chave de sessão acordada.",
    },
    {
      enunciado: "Uma equipe usa verify=False em chamadas HTTPS \"porque o certificado interno dá erro\". Qual o problema?",
      opcoes: ["Nenhum: o tráfego continua cifrado, então é seguro", "O tráfego é cifrado, mas sem verificar com quem se fala; um atacante no meio do caminho se passa pelo servidor. O correto é confiar na CA interna", "O desempenho piora", "Só funciona em Python"],
      correta: 1,
      explicacao: "Sem validação do certificado, a criptografia protege contra espionagem passiva, mas não contra o homem no meio. Instalar a autoridade certificadora interna resolve o erro sem abrir mão da segurança.",
    },
  ],
  desafio: {
    titulo: "Um cofre de notas cifradas",
    enunciado: "Construa, em Python com o pacote cryptography, um pequeno \"cofre de notas\" (cofre.py) que guarda textos cifrados em um arquivo JSON, com chaves versionadas e assinatura de integridade do arquivo. O objetivo é praticar o uso correto das primitivas e provar, com testes, que cada defesa funciona.",
    requisitos: [
      "Cifre cada nota com AES-GCM, nonce aleatório novo a cada nota e dados associados com o identificador do dono e da nota.",
      "Guarde, junto de cada nota, o identificador da versão da chave usada, e implemente a rotação: uma função que recifra todas as notas com a chave nova e mantém as antigas decifráveis até a migração terminar.",
      "Derive a chave-mestra a partir de uma senha, usando scrypt com sal, e guarde só o sal (nunca a senha nem a chave).",
      "Assine o índice do arquivo com HMAC-SHA256 (ou Ed25519) e recuse carregar um arquivo cujo índice foi alterado.",
      "Escreva testes para: decifrar o que foi cifrado, recusar um bit alterado, recusar contexto trocado (nota de outro dono), nonces diferentes em notas iguais e a rotação de chaves.",
    ],
    criterios: [
      "Nenhuma chave, senha ou texto em claro é gravado em disco ou aparece em logs e mensagens de erro.",
      "O nonce é gerado a cada cifragem, e há um teste que prova que duas notas iguais geram textos cifrados diferentes.",
      "As comparações de etiquetas usam comparação em tempo constante.",
      "A rotação funciona sem perder nenhuma nota, e o teste cobre a mistura de versões.",
      "Você explica, para cada decisão, qual dos erros da tabela do módulo ela evita.",
    ],
    dica: "Comece escrevendo só as funções cifrar e decifrar, com os testes de adulteração. Só depois acrescente o versionamento das chaves e a assinatura do arquivo, uma camada de cada vez.",
  },
  referencias: [
    { titulo: "OWASP: guia de armazenamento criptográfico (em inglês)", url: "https://cheatsheetseries.owasp.org/cheatsheets/Cryptographic_Storage_Cheat_Sheet.html" },
    { titulo: "OWASP: proteção da camada de transporte (em inglês)", url: "https://cheatsheetseries.owasp.org/cheatsheets/Transport_Layer_Security_Cheat_Sheet.html" },
    { titulo: "Documentação do pacote cryptography (em inglês)", url: "https://cryptography.io/en/latest/" },
    { titulo: "MDN: TLS, segurança na camada de transporte (em inglês)", url: "https://developer.mozilla.org/en-US/docs/Web/Security/Transport_Layer_Security" },
  ],
};
