import type { Modulo } from "../tipos";

export const SEG_MODULO_7: Modulo = {
  tipo: "modulo",
  slug: "dependencias-e-cadeia-de-suprimentos",
  titulo: "Dependências e a cadeia de suprimentos de software",
  resumo: "Como o código de terceiros vira risco: vulnerabilidades conhecidas, pacotes maliciosos, typosquatting, verificação de integridade, SBOM e hábitos de atualização.",
  nivel: "Júnior",
  leitura: "50 min",
  objetivos: [
    "Explicar por que a maior parte do código de uma aplicação não é escrita pela equipe e o que isso significa para a segurança.",
    "Auditar dependências em busca de vulnerabilidades conhecidas e priorizar as atualizações.",
    "Reconhecer os ataques à cadeia de suprimentos: typosquatting, confusão de dependências, pacotes comprometidos e scripts de instalação maliciosos.",
    "Verificar a integridade de pacotes com arquivos de trava e hashes, e entender o que é um SBOM.",
    "Montar uma rotina sustentável de atualização de dependências no CI.",
  ],
  preRequisitos: [
    "Ter feito os módulos anteriores da trilha ou conhecer o básico de segurança de aplicações.",
    "Saber usar um gerenciador de pacotes (npm, pip ou Maven).",
  ],
  pontosChave: [
    "Em um projeto típico, a maior parte do código executado é de terceiros: cada dependência é confiança delegada.",
    "A maioria dos ataques via bibliotecas explora vulnerabilidades conhecidas e já corrigidas: atualizar é a defesa principal.",
    "O arquivo de trava e a verificação de hashes garantem que você instala o mesmo que testou.",
    "Pacotes com nome parecido com os populares, ou publicados com o mesmo nome que um pacote interno, são armadilhas.",
    "Segurança de dependências é rotina (automação e prazos), e não um evento isolado.",
  ],
  blocos: [
    { tipo: "p", texto: "Ninguém escreve uma aplicação do zero. Um projeto web típico depende de dezenas de bibliotecas diretas, que dependem de centenas de outras (as dependências transitivas), e o que roda em produção é, em sua maior parte, código que a equipe nunca leu. Cada uma dessas peças é uma decisão de confiança: o autor é cuidadoso? Responde a problemas de segurança? Pode ser invadido? Quando uma biblioteca popular tem uma falha, milhares de aplicações ficam vulneráveis ao mesmo tempo, e quando um atacante consegue publicar código malicioso em um pacote popular, ele chega a todos que o instalam. Esse é o território da segurança da cadeia de suprimentos de software, e entrou no OWASP Top 10 por causa do aumento de incidentes dessa natureza." },

    { tipo: "h", texto: "Vulnerabilidades conhecidas: o risco mais comum" },
    { tipo: "p", texto: "O cenário mais frequente é também o mais simples: a biblioteca tem uma vulnerabilidade pública, já corrigida em uma versão nova, e a aplicação continua usando a antiga. As falhas são catalogadas com identificadores CVE (Common Vulnerabilities and Exposures) e descritas em bases de dados como o NVD, o GitHub Advisory Database e o OSV. Um incidente famoso ilustra a escala: em 2017, uma empresa de análise de crédito foi invadida por uma falha de um framework web que já tinha correção disponível havia semanas, e os dados de mais de 140 milhões de pessoas foram expostos. O erro não foi a falha em si, e sim o atraso em atualizar." },
    { tipo: "p", texto: "A auditoria compara as versões que você usa com os avisos publicados. As ferramentas fazem isso por você (npm audit, pip-audit, a verificação de dependências do OWASP e o Dependabot do GitHub), e o código a seguir reproduz a ideia central em miniatura, com avisos fictícios. Repare em um detalhe sutil e frequente: as versões precisam ser comparadas como números, parte por parte, e não como texto." },
    { tipo: "codigo", linguagem: "python", legenda: "auditoria.py", texto: `from dataclasses import dataclass


def versao(texto: str) -> tuple[int, ...]:
    return tuple(int(parte) for parte in texto.split("."))


@dataclass(frozen=True)
class Aviso:
    identificador: str
    pacote: str
    corrigido_em: str
    gravidade: str


AVISOS = [
    Aviso("EXEMPLO-2026-0001", "biblioteca-web", "2.4.5", "ALTA"),
    Aviso("EXEMPLO-2026-0002", "analisador-xml", "1.9.0", "CRÍTICA"),
    Aviso("EXEMPLO-2026-0003", "biblioteca-web", "2.3.0", "BAIXA"),
]
DEPENDENCIAS = {"biblioteca-web": "2.4.1", "analisador-xml": "1.9.0", "formatador": "0.8.2", "cliente-http": "5.1.0"}


def auditar(dependencias: dict[str, str]) -> list[tuple[str, str, str, str]]:
    achados = []
    for aviso in AVISOS:
        instalada = dependencias.get(aviso.pacote)
        if instalada is not None and versao(instalada) < versao(aviso.corrigido_em):
            achados.append((aviso.gravidade, aviso.pacote, instalada, aviso.corrigido_em))
    return sorted(achados)


for gravidade, pacote, instalada, corrigida in auditar(DEPENDENCIAS):
    print(f"{gravidade}: {pacote} {instalada} -> atualizar para {corrigida} ou mais novo")
print("versões comparadas como números, e não como texto:", versao("2.10.0") > versao("2.9.0"), "| como texto:", "2.10.0" > "2.9.0")` },
    { tipo: "codigo", linguagem: "text", legenda: "Saída", texto: `ALTA: biblioteca-web 2.4.1 -> atualizar para 2.4.5 ou mais novo
versões comparadas como números, e não como texto: True | como texto: False` },
    { tipo: "p", texto: "A auditoria acusa a biblioteca-web 2.4.1, que é anterior à correção 2.4.5 do aviso de gravidade alta. O aviso de gravidade baixa (corrigido em 2.3.0) não se aplica, porque 2.4.1 é mais nova, e o analisador-xml, na versão 1.9.0, já está na versão corrigida. A última linha mostra a armadilha: como texto, \"2.10.0\" é menor que \"2.9.0\" (o \"1\" vem antes do \"9\"), o que faria uma comparação ingênua concluir exatamente o contrário. As ferramentas reais seguem as regras de versionamento do ecossistema." },
    { tipo: "h3", texto: "Como priorizar o que atualizar" },
    { tipo: "lista", itens: [
      "Gravidade e explorabilidade: uma falha crítica com exploração pública ativa vem antes de uma baixa que exige condições raras. A pontuação CVSS ajuda, e o EPSS estima a probabilidade de exploração.",
      "Alcance real: a função vulnerável é chamada pelo seu código? Está exposta à internet? Uma falha em uma biblioteca de testes pesa menos do que uma na camada de entrada.",
      "Existência de correção: se a atualização está disponível, aplique. Se não, procure mitigações (desativar o recurso afetado, regras no WAF) e planeje a troca da biblioteca.",
      "Dependências transitivas: a vulnerabilidade pode estar em uma biblioteca que você nunca importou. As ferramentas listam a cadeia e o que deve ser atualizado para resolvê-la.",
    ] },

    { tipo: "h", texto: "Ataques à cadeia de suprimentos" },
    { tipo: "p", texto: "Além das falhas acidentais, há atacantes que usam os gerenciadores de pacotes como canal de distribuição de código malicioso. As técnicas principais se repetem em todos os ecossistemas (npm, PyPI, Maven, RubyGems)." },
    { tipo: "tabela", legenda: "Técnicas de ataque a pacotes", cabecalho: ["Técnica", "Como funciona", "Defesa"], linhas: [
      ["Typosquatting", "Publicar um pacote com nome parecido com um popular (reqeusts no lugar de requests), esperando um erro de digitação.", "Conferir o nome ao instalar, usar arquivos de trava e listas de pacotes permitidos."],
      ["Confusão de dependências", "Publicar em um registro público um pacote com o mesmo nome de um pacote interno da empresa, com versão mais alta, para o gerenciador preferi-lo.", "Registro privado com prioridade, escopos de nome (@empresa/pacote) e reivindicação dos nomes internos no registro público."],
      ["Comprometimento de um mantenedor", "Roubar a conta de quem mantém um pacote e publicar uma versão maliciosa.", "Travar versões, esperar um tempo antes de adotar versões novas e monitorar mudanças inesperadas."],
      ["Scripts de instalação", "O pacote executa código no momento da instalação (postinstall, setup.py), antes de qualquer revisão.", "Desativar scripts de instalação quando possível (npm ci --ignore-scripts) e instalar em ambientes isolados."],
      ["Pacotes abandonados e capturados", "Um pacote sem manutenção é assumido por outra pessoa, que o altera.", "Preferir pacotes mantidos e avaliar o histórico de mantenedores."],
      ["Código malicioso discreto em CI", "Uma ação ou plugin de pipeline comprometido rouba os segredos do build.", "Fixar ações por hash de commit e dar às pipelines o menor acesso possível."],
    ] },
    { tipo: "p", texto: "Algumas dessas armadilhas podem ser detectadas por regras simples. O programa a seguir calcula o hash de um pacote para verificar se é o esperado, e usa a semelhança entre nomes para sinalizar candidatos a typosquatting em uma lista de pacotes novos." },
    { tipo: "codigo", linguagem: "python", legenda: "integridade.py", texto: `import difflib
import hashlib

pacote = b"conteudo do pacote baixado"
hash_publicado = hashlib.sha256(pacote).hexdigest()
print("pacote íntegro confere:", hashlib.sha256(pacote).hexdigest() == hash_publicado)
print("pacote adulterado confere:", hashlib.sha256(pacote + b" + codigo malicioso").hexdigest() == hash_publicado)

POPULARES = ["requests", "numpy", "pandas", "flask", "django", "urllib3", "cryptography"]


def parecido_com_popular(nome: str) -> str | None:
    if nome in POPULARES:
        return None
    parecidos = difflib.get_close_matches(nome, POPULARES, n=1, cutoff=0.8)
    return parecidos[0] if parecidos else None


for candidato in ["requests", "reqeusts", "numpyy", "djang0", "minha-lib-interna", "pandas"]:
    suspeito = parecido_com_popular(candidato)
    print(f"{candidato:<18}", "ok" if suspeito is None else f"SUSPEITO: parece com {suspeito}")` },
    { tipo: "codigo", linguagem: "text", legenda: "Saída", texto: `pacote íntegro confere: True
pacote adulterado confere: False
requests           ok
reqeusts           SUSPEITO: parece com requests
numpyy             SUSPEITO: parece com numpy
djang0             SUSPEITO: parece com django
minha-lib-interna  ok
pandas             ok` },
    { tipo: "p", texto: "A primeira parte mostra a verificação de integridade: o hash publicado do pacote só confere com o conteúdo original, e qualquer acréscimo malicioso muda o hash. Na segunda, \"reqeusts\", \"numpyy\" e \"djang0\" são marcados como parecidos com pacotes populares, e os nomes legítimos e o interno passam. É uma heurística simples, e as plataformas reais combinam muitos sinais (idade do pacote, número de downloads, comportamento na instalação), mas a ideia é a mesma: nome quase igual ao de um pacote famoso merece um segundo olhar antes de ser instalado." },

    { tipo: "h", texto: "Arquivos de trava, hashes e SBOM" },
    { tipo: "p", texto: "A primeira defesa prática é garantir que o que você testa é o que você instala. Os arquivos de trava (package-lock.json, poetry.lock, requirements.txt com versões fixas, o pom.xml com versões explícitas) registram a versão exata de cada dependência, direta e transitiva. Sem eles, a instalação de amanhã pode trazer versões diferentes das testadas hoje, inclusive uma versão comprometida publicada no meio tempo. Em CI e em produção, instale a partir do arquivo de trava (npm ci, pip install -r requirements.txt, e não npm install), que falha se houver divergência." },
    { tipo: "lista", itens: [
      "Hashes: o pip permite exigir o hash de cada pacote (pip install --require-hashes), e o npm guarda um campo integrity no lock. Se o conteúdo mudar, a instalação falha, e é a verificação de integridade do exemplo, automatizada.",
      "SBOM (Software Bill of Materials): uma lista legível por máquina de todos os componentes de um software, com versões e origens (nos formatos CycloneDX ou SPDX). Quando uma nova vulnerabilidade é anunciada, o SBOM responde em minutos \"estamos afetados, e onde?\". Ferramentas como o Syft e o CycloneDX geram um SBOM a cada build.",
      "Proveniência e assinatura: projetos como o Sigstore e as atestações do SLSA permitem verificar quem construiu um artefato e a partir de qual código, para que um binário publicado possa ser ligado ao seu repositório de origem.",
      "Registro interno: um espelho privado dos pacotes (Artifactory, Nexus, CodeArtifact) permite aprovar o que entra na empresa e protege da confusão de dependências.",
    ] },
    { tipo: "codigo", linguagem: "bash", legenda: "Ferramentas de auditoria (exemplos de comandos)", texto: `# JavaScript: instala exatamente o que está no lock e audita
npm ci
npm audit --omit=dev

# Python: audita o ambiente e exige hashes na instalação
pip-audit
pip install --require-hashes -r requirements.txt

# Java (Maven): verifica dependências contra bases de vulnerabilidades
./mvnw org.owasp:dependency-check-maven:check

# Qualquer linguagem: lista os componentes em formato SBOM
syft dir:. -o cyclonedx-json > sbom.json` },
    { tipo: "p", texto: "Os comandos acima variam de projeto para projeto e as ferramentas evoluem, então confira a documentação de cada uma. O que importa é a rotina: rodar a auditoria a cada mudança e em um agendamento semanal, porque novas vulnerabilidades são publicadas todos os dias para código que não mudou." },

    { tipo: "h", texto: "Uma rotina que funciona" },
    { tipo: "numerada", itens: [
      "Automatize as atualizações: ative o Dependabot ou o Renovate, que abrem pull requests com as versões novas, agrupando as de baixo risco.",
      "Rode os testes em cada atualização. Boa cobertura de testes é o que permite atualizar sem medo, e é o motivo de muitas equipes adiarem para sempre: não deixe isso acontecer.",
      "Defina prazos por gravidade (por exemplo, críticas em 48 horas, altas em uma semana, médias em um mês) e acompanhe o cumprimento.",
      "Falhe o CI quando surgir uma vulnerabilidade de gravidade alta sem justificativa registrada, com uma lista de exceções temporárias, com dono e data de revisão.",
      "Reduza a superfície: remova dependências que não usa, prefira bibliotecas pequenas e mantidas e evite adicionar uma biblioteca inteira por causa de uma função simples.",
      "Avalie antes de adicionar: o pacote é mantido? Tem muitos usuários? Quem o publica? Qual o histórico de falhas corrigidas? O que ele faz na instalação?",
      "Guarde um SBOM de cada versão em produção, para responder rápido quando surgir a próxima falha famosa.",
    ] },
    { tipo: "alerta", titulo: "Atualizar às cegas também é um risco", texto: "Adotar toda versão nova no mesmo minuto em que sai expõe você a pacotes comprometidos que ainda não foram descobertos. Um equilíbrio comum é esperar alguns dias para versões não urgentes (a maioria dos pacotes maliciosos é removida em poucos dias), e acelerar quando a atualização é uma correção de segurança conhecida e verificada." },
  ],
  questoes: [
    {
      enunciado: "Qual é a causa mais comum de invasões por meio de bibliotecas de terceiros?",
      opcoes: ["Pacotes criados por hackers com nomes aleatórios", "Uso de versões com vulnerabilidades conhecidas e já corrigidas, que não foram atualizadas", "O uso de linguagens interpretadas", "O tamanho do projeto"],
      correta: 1,
      explicacao: "A maioria dos ataques explora falhas públicas, para as quais já existe correção. Manter as dependências atualizadas, com auditoria contínua, é a defesa principal.",
    },
    {
      enunciado: "O que é typosquatting em um gerenciador de pacotes?",
      opcoes: ["Um erro de digitação do código-fonte", "Um tipo de compressão", "Publicar um pacote malicioso com nome parecido com o de um popular, esperando que alguém erre a digitação", "Uma técnica de teste"],
      correta: 2,
      explicacao: "Quem digita requests errado pode instalar reqeusts, e o código do atacante é executado. Conferir o nome e usar arquivos de trava reduz o risco.",
    },
    {
      enunciado: "Uma empresa tem um pacote interno chamado \"financeiro-core\". Um atacante publica no registro público um pacote com o mesmo nome e versão mais alta. Qual ataque é esse e qual defesa ajuda?",
      opcoes: ["Confusão de dependências; registro privado com prioridade, escopos de nome e reivindicação dos nomes internos", "Typosquatting; digitar com cuidado", "XSS; escapar a saída", "CSRF; token anti-CSRF"],
      correta: 0,
      explicacao: "Se o gerenciador procura também no registro público e prefere a versão mais alta, instala o pacote do atacante. Escopos de nome e um registro interno com prioridade fecham a brecha.",
    },
    {
      enunciado: "Qual a função do arquivo de trava (lock file)?",
      opcoes: ["Impedir que outras pessoas editem o código", "Registrar as versões exatas de todas as dependências, para instalar sempre o que foi testado", "Criptografar o projeto", "Aumentar a velocidade do build"],
      correta: 1,
      explicacao: "Com o lock, a instalação é reproduzível, inclusive para as dependências transitivas, e uma versão nova (ou comprometida) publicada depois não entra sem querer.",
    },
    {
      enunciado: "Por que as versões não devem ser comparadas como texto em uma auditoria?",
      opcoes: ["Porque números são mais bonitos", "Porque textos não podem ser comparados", "Porque as versões são secretas", "Porque, como texto, \"2.10.0\" seria menor que \"2.9.0\", e a conclusão ficaria errada"],
      correta: 3,
      explicacao: "A ordem alfabética não representa a ordem das versões. É preciso comparar cada parte numérica, seguindo as regras de versionamento do ecossistema.",
    },
    {
      enunciado: "O que é um SBOM?",
      opcoes: ["Um tipo de teste de carga", "Uma lista legível por máquina de todos os componentes de um software, com versões e origens", "Um protocolo de rede", "Um certificado digital"],
      correta: 1,
      explicacao: "Quando uma nova vulnerabilidade é anunciada, o SBOM permite saber rapidamente quais sistemas e versões estão afetados.",
    },
    {
      enunciado: "Qual comando é mais adequado em um pipeline de CI para instalar dependências de JavaScript de forma reproduzível?",
      opcoes: ["npm install, que pode atualizar versões", "npm update", "npm ci, que instala exatamente o que está no package-lock.json e falha se houver divergência", "npm audit fix --force, em todo build"],
      correta: 2,
      explicacao: "O npm ci usa o arquivo de trava e é determinístico. O install e o update podem trazer versões diferentes das testadas.",
    },
  ],
  desafio: {
    titulo: "A auditoria de dependências de um projeto",
    enunciado: "Escolha um projeto seu (ou crie um pequeno, em Node, Python ou Java) e faça uma auditoria completa das dependências, com um relatório e uma rotina automatizada. Se não tiver um projeto, use um dos exemplos dos módulos anteriores da trilha de Python ou de TypeScript.",
    requisitos: [
      "Liste as dependências diretas e transitivas (com npm ls, pip list ou mvn dependency:tree) e conte quantas são, comparando diretas e indiretas.",
      "Rode a ferramenta de auditoria do ecossistema (npm audit, pip-audit ou o dependency-check do OWASP) e registre as vulnerabilidades encontradas, com gravidade e a versão que corrige.",
      "Para duas vulnerabilidades, avalie o alcance real (a função afetada é usada? está exposta?) e decida: atualizar, mitigar ou aceitar, justificando.",
      "Configure o Dependabot (ou o Renovate) no repositório e uma etapa de auditoria no CI que falhe com vulnerabilidades altas ou críticas, com uma lista de exceções com dono e data.",
      "Gere um SBOM (Syft ou CycloneDX), guarde-o como artefato do build e escreva um script curto que responde, a partir do SBOM, \"este projeto usa a biblioteca X em qual versão?\".",
    ],
    criterios: [
      "O relatório distingue gravidade de risco real, e não apenas copia a saída da ferramenta.",
      "O CI instala a partir do arquivo de trava e falha para vulnerabilidades altas sem justificativa.",
      "O SBOM é gerado automaticamente a cada build, e o script de consulta funciona.",
      "Há uma política escrita de prazos por gravidade, curta e realista.",
      "Você explica, para cada dependência que decidiu remover ou substituir, por que o benefício compensa.",
    ],
    dica: "Comece pelas dependências diretas mais usadas e mais antigas: elas costumam concentrar a maior parte das vulnerabilidades, e a atualização de uma delas costuma resolver várias transitivas de uma só vez.",
  },
  referencias: [
    { titulo: "OWASP: guia de segurança da cadeia de suprimentos de software (em inglês)", url: "https://cheatsheetseries.owasp.org/cheatsheets/Software_Supply_Chain_Security_Cheat_Sheet.html" },
    { titulo: "OWASP: verificação de componentes vulneráveis e desatualizados (em inglês)", url: "https://cheatsheetseries.owasp.org/cheatsheets/Vulnerable_Dependency_Management_Cheat_Sheet.html" },
    { titulo: "OSV: banco de vulnerabilidades de código aberto (em inglês)", url: "https://osv.dev/" },
    { titulo: "GitHub: sobre o Dependabot (em inglês)", url: "https://docs.github.com/en/code-security/dependabot/dependabot-alerts/about-dependabot-alerts" },
  ],
};
