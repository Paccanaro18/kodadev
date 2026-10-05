import type { Modulo } from "../tipos";

export const LLM_MODULO_3: Modulo = {
  tipo: "modulo",
  slug: "mcp-model-context-protocol",
  titulo: "MCP: o protocolo que liga modelos a ferramentas e dados",
  resumo: "O que é o Model Context Protocol, como hosts, clientes e servidores se organizam, as três primitivas e como construir e proteger o seu primeiro servidor.",
  nivel: "Júnior",
  leitura: "55 min",
  objetivos: [
    "Explicar o problema que o MCP resolve e como hosts, clientes e servidores se relacionam.",
    "Diferenciar ferramentas (tools), recursos (resources) e prompts, e quem controla cada um.",
    "Descrever os dois transportes (stdio e HTTP com streaming) e quando usar cada um.",
    "Construir um servidor MCP em Python e testá-lo com um cliente.",
    "Aplicar as principais práticas de segurança: menor privilégio, consentimento, validação e cuidado com autenticação.",
  ],
  preRequisitos: [
    "Ter feito o módulo sobre uso de LLMs por API e ferramentas (tool use).",
    "Saber Python e async/await básicos.",
  ],
  pontosChave: [
    "O MCP padroniza como aplicações de IA se conectam a ferramentas e dados: escreva um servidor uma vez e use-o em vários clientes.",
    "O host (a aplicação de IA) cria um cliente para cada servidor; o servidor expõe ferramentas, recursos e prompts.",
    "Ferramentas são controladas pelo modelo, recursos pela aplicação e prompts pelo usuário.",
    "Em servidores stdio, nunca escreva na saída padrão: ela é o canal do protocolo.",
    "Um servidor MCP é código que roda com permissões reais: aplique menor privilégio e peça consentimento para ações sensíveis.",
  ],
  blocos: [
    { tipo: "p", texto: "No módulo anterior, você deu ferramentas a um modelo escrevendo o laço do agente e descrevendo cada ferramenta à mão. Isso funciona, mas tem um custo: cada aplicação de IA (um editor de código, um assistente de conversa, o seu produto) precisa de integrações próprias com cada sistema (o banco, o GitHub, o calendário), e cada integração é escrita de novo. Com N aplicações e M sistemas, são N vezes M integrações. O Model Context Protocol (MCP) é um padrão aberto criado para trocar essa conta por N mais M: cada sistema ganha um servidor MCP, cada aplicação aprende a falar MCP, e tudo se conecta." },
    { tipo: "alerta", titulo: "O protocolo evolui, confira a versão", texto: "O MCP é novo e muda com frequência. As versões da especificação são identificadas por data, e, quando este módulo foi escrito, a mais recente era a de 2026-07-28. Os SDKs também mudam: no SDK de Python, a versão 2 renomeou a classe FastMCP para MCPServer. Os exemplos deste módulo foram executados com o SDK mcp 2.3.0 em Python. Sempre consulte a documentação oficial para a versão que você for usar, e fixe a versão do SDK no seu projeto." },

    { tipo: "h", texto: "A arquitetura: host, cliente e servidor" },
    { tipo: "p", texto: "O MCP segue uma arquitetura cliente-servidor com três participantes. O host é a aplicação de IA que o usuário usa, como um assistente de conversa ou um editor de código. O cliente é um componente dentro do host que mantém a conexão com um servidor. O servidor é o programa que fornece contexto e capacidades. O host cria um cliente separado para cada servidor a que se conecta: se o seu editor usa um servidor de arquivos e um de banco de dados, são dois clientes, duas conexões independentes." },
    { tipo: "codigo", linguagem: "text", legenda: "Participantes do MCP", texto: `Host (aplicação de IA: assistente, editor de código, seu produto)
├── Cliente A ──── conexão ──── Servidor de arquivos     (local, stdio)
├── Cliente B ──── conexão ──── Servidor de banco de dados (local, stdio)
└── Cliente C ──── conexão ──── Servidor de issues        (remoto, HTTP)` },
    { tipo: "p", texto: "\"Servidor\" aqui descreve o papel, e não o lugar onde roda. Um servidor local é iniciado pelo host na própria máquina do usuário e conversa com ele por entrada e saída padrão (stdio). Um servidor remoto roda em outra máquina, acessível pela internet, e atende vários clientes. O protocolo se divide em duas camadas: a camada de dados, que define as mensagens (baseadas em JSON-RPC 2.0), e a camada de transporte, que define como elas trafegam. O MCP suporta dois transportes principais." },
    { tipo: "tabela", legenda: "Os transportes do MCP", cabecalho: ["Transporte", "Como funciona", "Quando usar"], linhas: [
      ["stdio", "O host inicia o servidor como um processo e troca mensagens pela entrada e saída padrão.", "Servidores locais, usados por uma pessoa: arquivos, ferramentas de desenvolvimento, scripts."],
      ["HTTP com streaming (Streamable HTTP)", "Mensagens por requisições HTTP POST, com respostas em fluxo quando necessário. Aceita autenticação HTTP, e a recomendada é OAuth.", "Servidores remotos, compartilhados por muitos usuários e clientes."],
    ] },
    { tipo: "p", texto: "A especificação mais recente também torna o protocolo sem estado (stateless): cada requisição carrega a versão do protocolo e as capacidades relevantes, e o servidor se anuncia por meio de uma requisição de descoberta (server/discover). Na prática, os SDKs cuidam disso para você, e é por isso que, ao construir, você raramente toca nessas mensagens." },

    { tipo: "h", texto: "As três primitivas do servidor" },
    { tipo: "p", texto: "O que um servidor oferece se resume a três blocos, cada um com um dono diferente. Entender quem controla cada um é o que evita desenhos confusos." },
    { tipo: "tabela", legenda: "Ferramentas, recursos e prompts", cabecalho: ["Primitiva", "O que é", "Quem controla", "Exemplos"], linhas: [
      ["Ferramentas (tools)", "Funções que o modelo pode chamar para agir ou consultar.", "O modelo decide quando usar, com consentimento do usuário quando necessário.", "Buscar voos, criar um evento, consultar um banco."],
      ["Recursos (resources)", "Dados de leitura, identificados por um URI, que dão contexto.", "A aplicação decide quais incluir.", "Conteúdo de arquivos, esquema de um banco, documentação."],
      ["Prompts", "Modelos de instrução reutilizáveis e parametrizados.", "O usuário os escolhe explicitamente.", "\"Planejar uma viagem\", \"Resumir minhas reuniões\"."],
    ] },
    { tipo: "p", texto: "Cada primitiva tem operações de descoberta e de uso: o cliente pergunta o que existe (tools/list, resources/list, prompts/list) e depois usa (tools/call, resources/read, prompts/get). Como a lista é consultada em tempo real, um servidor pode mudar o que oferece sem que o cliente precise ser reescrito. Os servidores também podem pedir informações ao usuário por meio de um recurso do cliente chamado elicitation, usado, por exemplo, para confirmar uma ação." },
    { tipo: "dica", titulo: "Ferramenta ou recurso?", texto: "Se é uma ação ou uma consulta que o modelo deve decidir fazer durante a conversa, é uma ferramenta. Se é um dado que a aplicação (ou o usuário) quer anexar como contexto, é um recurso. Quando houver dúvida, comece por uma ferramenta, que é a primitiva com suporte mais amplo nos clientes." },

    { tipo: "h", texto: "Construindo um servidor em Python" },
    { tipo: "p", texto: "O SDK oficial de Python usa dicas de tipo e docstrings para gerar automaticamente a definição de cada ferramenta: o nome vem da função, a descrição vem da docstring e o esquema dos argumentos vem dos tipos. Instale com pip install mcp (de preferência fixando a versão, em um ambiente virtual). O servidor a seguir expõe duas ferramentas, um recurso e um prompt para um bloco de notas." },
    { tipo: "p", texto: "Para poder rodar tudo em um único arquivo, o programa também inclui um cliente que se conecta ao servidor em memória, sem processo separado nem rede. É o mesmo cliente que o seu host usaria, e é uma ótima forma de testar o servidor." },
    { tipo: "codigo", linguagem: "python", legenda: "notas_mcp.py", texto: `import asyncio

from mcp import Client
from mcp.server import MCPServer
from mcp.server.mcpserver.exceptions import ToolError

mcp = MCPServer("notas")

NOTAS: dict[str, str] = {
    "reuniao": "Revisar o orçamento na sexta.",
    "ideias": "Experimentar o MCP no projeto novo.",
}


@mcp.tool()
def buscar_nota(titulo: str) -> str:
    """Devolve o texto de uma nota pelo título.

    Args:
        titulo: O título exato da nota (por exemplo, reuniao).
    """
    if titulo not in NOTAS:
        raise ToolError(f"nota não encontrada: {titulo}. Notas existentes: {', '.join(sorted(NOTAS))}")
    return NOTAS[titulo]


@mcp.tool()
def criar_nota(titulo: str, texto: str) -> str:
    """Cria uma nota nova. Falha se o título já existir."""
    if titulo in NOTAS:
        raise ToolError(f"já existe uma nota chamada {titulo}")
    NOTAS[titulo] = texto
    return f"nota '{titulo}' criada"


@mcp.resource("notas://lista")
def listar_notas() -> str:
    """Os títulos de todas as notas, um por linha."""
    return "\\n".join(sorted(NOTAS))


@mcp.prompt()
def resumir_notas(foco: str) -> str:
    """Pede um resumo das notas com um foco específico."""
    return f"Leia as notas disponíveis e resuma o que for relevante para: {foco}."


async def demonstrar() -> None:
    async with Client(mcp) as cliente:
        for ferramenta in (await cliente.list_tools()).tools:
            print("ferramenta:", ferramenta.name)
        print("parâmetros:", (await cliente.list_tools()).tools[0].input_schema["required"])

        achada = await cliente.call_tool("buscar_nota", {"titulo": "reuniao"})
        print("achada:", achada.content[0].text, "| erro:", achada.is_error)

        perdida = await cliente.call_tool("buscar_nota", {"titulo": "nada"})
        print("perdida:", perdida.content[0].text, "| erro:", perdida.is_error)

        await cliente.call_tool("criar_nota", {"titulo": "compras", "texto": "Café e pão."})
        lista = await cliente.read_resource("notas://lista")
        print("recurso:", lista.contents[0].text.replace("\\n", ", "))

        prompt = await cliente.get_prompt("resumir_notas", {"foco": "a semana"})
        print("prompt:", prompt.messages[0].content.text)


if __name__ == "__main__":
    asyncio.run(demonstrar())` },
    { tipo: "codigo", linguagem: "text", legenda: "Saída", texto: `ferramenta: buscar_nota
ferramenta: criar_nota
parâmetros: ['titulo']
achada: Revisar o orçamento na sexta. | erro: False
perdida: Error executing tool buscar_nota: nota não encontrada: nada. Notas existentes: ideias, reuniao | erro: True
recurso: compras, ideias, reuniao
prompt: Leia as notas disponíveis e resuma o que for relevante para: a semana.` },
    { tipo: "p", texto: "Vale entender cada parte. O decorador @mcp.tool() registra a função como ferramenta, e o cliente a descobre com list_tools. Quando a ferramenta falha de um jeito esperado, lança ToolError: a chamada volta com is_error verdadeiro e a sua mensagem, para o modelo ler e se corrigir (aqui, ele fica sabendo quais notas existem). Qualquer outra exceção é tratada como bug e o modelo só vê uma mensagem genérica, o que protege detalhes internos, mas torna o erro inútil para ele, então prefira erros previstos e claros. O @mcp.resource(\"notas://lista\") expõe dados de leitura em um URI, e o @mcp.prompt() oferece um modelo de instrução parametrizado." },
    { tipo: "codigo", linguagem: "python", legenda: "Rodando como servidor de verdade (trecho)", texto: `# No fim do arquivo do servidor, em vez de executar o cliente de teste:
if __name__ == "__main__":
    mcp.run(transport="stdio")` },
    { tipo: "p", texto: "Com mcp.run(transport=\"stdio\"), o servidor passa a ouvir a entrada padrão, esperando que um host o inicie. Você não o executa para conversar com ele no terminal: é o host que o executa como um processo filho." },
    { tipo: "alerta", titulo: "Em servidores stdio, nunca use print()", texto: "A saída padrão é o canal por onde as mensagens do protocolo trafegam. Um print() solto injeta texto no meio do fluxo e quebra a comunicação. Para registrar o que acontece, use o módulo logging, que escreve na saída de erro (stderr), ou grave em arquivo. Em servidores HTTP, a saída padrão pode ser usada normalmente." },

    { tipo: "h", texto: "Conectando o servidor a um host" },
    { tipo: "p", texto: "Cada host tem a sua forma de configurar servidores locais. Em vários deles, incluindo o aplicativo de desktop da Anthropic, é um arquivo JSON com a chave mcpServers, em que cada servidor tem um nome, o comando para iniciá-lo e os argumentos. O host executa o comando como um processo filho e se comunica por stdio." },
    { tipo: "codigo", linguagem: "json", legenda: "claude_desktop_config.json", texto: `{
  "mcpServers": {
    "notas": {
      "command": "python",
      "args": ["C:\\\\caminho\\\\para\\\\notas_servidor.py"]
    }
  }
}` },
    { tipo: "p", texto: "Use caminhos absolutos, e confirme qual Python (ou ambiente virtual) o host vai executar, porque é ele que precisa ter o SDK instalado. Depois de salvar a configuração, reinicie o host. Para desenvolver sem um host, o MCP Inspector, ferramenta oficial de teste (npx @modelcontextprotocol/inspector), permite listar e chamar as ferramentas, os recursos e os prompts de um servidor em uma interface no navegador, e é a primeira coisa a usar quando algo não funciona." },

    { tipo: "h", texto: "Segurança: o servidor é código com poder" },
    { tipo: "p", texto: "Um servidor MCP não é um simples \"plugin\": é um programa que roda com as permissões de quem o instalou e que passa a ser guiado por um modelo de linguagem, que pode ser enganado por texto malicioso. As recomendações oficiais de segurança e as boas práticas do módulo anterior se somam em uma lista curta." },
    { tipo: "numerada", itens: [
      "Menor privilégio: dê ao servidor acesso apenas ao que ele precisa. Um servidor de arquivos deve enxergar só as pastas indicadas, e um servidor de banco de dados deve usar um usuário com permissão de leitura, quando a tarefa for de consulta.",
      "Consentimento do usuário: mostre quais ferramentas existem, peça confirmação antes de ações com efeito (escrever, enviar, apagar, pagar) e mantenha um registro do que foi executado.",
      "Valide tudo na entrada: os argumentos vêm de um modelo, e o modelo pode ser manipulado. Trate-os como entrada de um usuário não confiável (nomes de arquivo com .., SQL, URLs internas).",
      "Cuidado com o que a ferramenta devolve: o texto que a ferramenta retorna entra no contexto do modelo, e pode conter instruções escondidas (injeção de prompt indireta). Não devolva conteúdo externo sem necessidade.",
      "Só instale servidores em que você confia: um servidor local pode executar comandos no seu computador. Prefira código aberto, fixe versões e leia o que ele faz.",
      "Autenticação em servidores remotos: use OAuth, valide o público (audience) dos tokens recebidos e nunca repasse o token do cliente a outro serviço (a especificação proíbe esse \"token passthrough\").",
      "Reduza os escopos: peça o mínimo de permissões ao autorizar acesso a um serviço externo, e não um escopo amplo \"para facilitar\".",
    ] },
    { tipo: "alerta", titulo: "Servidores remotos e SSRF", texto: "Se o seu servidor faz requisições a URLs fornecidas pelo modelo (uma ferramenta de \"buscar página\", por exemplo), ele pode ser induzido a acessar endereços internos, como serviços de metadados da nuvem, na chamada falsificação de requisição do lado do servidor (SSRF). Bloqueie endereços privados e de loopback, limite os protocolos e prefira uma lista de domínios permitidos." },

    { tipo: "h", texto: "Quando criar um servidor MCP" },
    { tipo: "p", texto: "Nem toda integração precisa de MCP. Se o seu produto chama uma única API e você controla o código, uma função comum no laço do agente basta. O MCP compensa quando o mesmo conjunto de capacidades deve servir a vários clientes (o editor da equipe, o assistente de conversa, um agente seu), quando outras pessoas vão usar o seu servidor sem alterar o código deles ou quando você quer aproveitar a lista crescente de servidores prontos, como os de arquivos, bancos de dados, repositórios e ferramentas de produtividade. A pergunta é a de sempre: o ganho de padronização compensa o custo de manter mais uma peça, com os riscos que ela traz." },
  ],
  questoes: [
    {
      enunciado: "Qual problema o MCP resolve?",
      opcoes: ["Treinar modelos maiores", "Padronizar a conexão entre aplicações de IA e ferramentas e dados, evitando uma integração diferente para cada par", "Compactar o texto dos prompts", "Substituir os bancos de dados"],
      correta: 1,
      explicacao: "Sem um padrão, cada aplicação precisa de integrações próprias com cada sistema (N vezes M). Com o MCP, cada sistema ganha um servidor e cada aplicação fala o protocolo, o que reduz o esforço para N mais M.",
    },
    {
      enunciado: "Qual a relação entre host, cliente e servidor MCP?",
      opcoes: ["O host cria um cliente para cada servidor a que se conecta, e cada cliente mantém uma conexão com o seu servidor", "O servidor cria hosts sob demanda", "Há um único cliente para todos os servidores", "O cliente executa as ferramentas e o servidor guarda o histórico"],
      correta: 0,
      explicacao: "O host é a aplicação de IA; dentro dele, cada cliente cuida da conexão com um servidor. O servidor é quem expõe ferramentas, recursos e prompts.",
    },
    {
      enunciado: "Qual primitiva do MCP é controlada pelo modelo, que decide quando usá-la?",
      opcoes: ["Recursos (resources)", "Prompts", "Ferramentas (tools)", "Logs"],
      correta: 2,
      explicacao: "Ferramentas são funções que o modelo decide chamar. Os recursos são escolhidos pela aplicação, e os prompts, pelo usuário.",
    },
    {
      enunciado: "Por que um servidor MCP com transporte stdio não deve usar print()?",
      opcoes: ["Porque o print é lento", "Porque a saída padrão é o canal das mensagens do protocolo e texto extra corrompe a comunicação", "Porque o Python proíbe o print em servidores", "Porque o print apaga o histórico"],
      correta: 1,
      explicacao: "No stdio, as mensagens JSON-RPC trafegam pela saída padrão. Qualquer texto adicional quebra o formato. Use logging (stderr) ou arquivos para registrar eventos.",
    },
    {
      enunciado: "Em qual cenário o transporte HTTP com streaming é o mais adequado?",
      opcoes: ["Um script local, usado só por uma pessoa", "Um servidor remoto compartilhado por muitos usuários, com autenticação", "Um teste unitário sem rede", "Um servidor que só funciona com entrada de teclado"],
      correta: 1,
      explicacao: "O stdio é indicado para servidores locais iniciados pelo host. Servidores remotos, que atendem vários clientes pela rede e precisam de autenticação (como OAuth), usam HTTP com streaming.",
    },
    {
      enunciado: "O que um servidor MCP bem projetado deve fazer ao receber argumentos de uma ferramenta?",
      opcoes: ["Confiar neles, porque vêm do modelo", "Validá-los como qualquer entrada não confiável, porque o modelo pode ser manipulado por texto malicioso", "Ignorá-los e usar valores padrão", "Executá-los diretamente como código"],
      correta: 1,
      explicacao: "Os argumentos são produzidos por um modelo que pode ter sido induzido por conteúdo malicioso. Valide caminhos, consultas e URLs, e aplique o menor privilégio no que a ferramenta pode fazer.",
    },
    {
      enunciado: "O que é o \"token passthrough\", proibido nas recomendações de segurança do MCP?",
      opcoes: ["Gerar tokens de acesso novos para cada chamada", "O servidor aceitar um token do cliente sem validar que foi emitido para ele e repassá-lo a um serviço externo", "Cobrar por token consumido", "Dividir o texto em tokens"],
      correta: 1,
      explicacao: "Repassar o token do cliente sem validar o público (audience) permite que tokens emitidos para outros serviços sejam reaproveitados e quebra controles de segurança, abrindo caminho para o problema do \"deputado confuso\". O servidor deve validar os tokens e usar credenciais próprias ao falar com serviços externos.",
    },
  ],
  desafio: {
    titulo: "Um servidor MCP para as suas tarefas",
    enunciado: "Crie um servidor MCP em Python para gerenciar uma lista de tarefas, com testes feitos por um cliente em memória e, se possível, conexão a um host real ou ao MCP Inspector.",
    requisitos: [
      "Implemente as ferramentas adicionar_tarefa, listar_tarefas, concluir_tarefa e remover_tarefa, com tipos e docstrings que descrevam cada argumento.",
      "Use ToolError com mensagens claras para os erros previstos (tarefa inexistente, título vazio, título duplicado).",
      "Exponha um recurso com o resumo das tarefas pendentes e um prompt \"planejar o dia\" que receba a data como parâmetro.",
      "Escreva um teste com o cliente em memória que cubra o caminho feliz e cada erro, imprimindo o resultado.",
      "Registre eventos com logging (nunca com print), pense em quais ações pediriam confirmação do usuário e documente isso em um comentário.",
    ],
    criterios: [
      "Cada ferramenta valida os próprios argumentos e falha com mensagens que ajudem o modelo a corrigir a chamada.",
      "Nenhuma ferramenta tem mais poder do que o necessário (por exemplo, não executa comandos nem acessa arquivos).",
      "O servidor não escreve na saída padrão ao rodar com stdio.",
      "O teste roda do início ao fim sem intervenção e termina com a saída esperada.",
      "Você consegue explicar a diferença entre ferramenta, recurso e prompt, e dar um exemplo de cada neste projeto.",
    ],
    dica: "Se tiver o MCP Inspector (npx @modelcontextprotocol/inspector), use-o para chamar as ferramentas à mão antes de escrever o teste. Muita coisa que o teste automatizado vai pegar você vê primeiro com os próprios olhos.",
  },
  referencias: [
    { titulo: "Model Context Protocol: introdução e arquitetura (em inglês)", url: "https://modelcontextprotocol.io/docs/learn/architecture" },
    { titulo: "Model Context Protocol: construir um servidor (em inglês)", url: "https://modelcontextprotocol.io/docs/develop/build-server" },
    { titulo: "Model Context Protocol: boas práticas de segurança (em inglês)", url: "https://modelcontextprotocol.io/docs/tutorials/security/security_best_practices" },
  ],
};
