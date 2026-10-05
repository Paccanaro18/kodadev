import type { Modulo } from "../tipos";

export const TS_MODULO_3: Modulo = {
  tipo: "modulo",
  slug: "classes-modulos-e-projeto",
  titulo: "Classes, módulos e organização de um projeto",
  resumo: "Classes com modificadores de acesso, interfaces, composição, módulos ES e a estrutura de um projeto Node com npm.",
  nivel: "Iniciante",
  leitura: "45 min",
  objetivos: [
    "Escrever classes em TypeScript com atributos tipados, construtores e modificadores de acesso.",
    "Usar interfaces para descrever contratos e depender delas em vez de implementações.",
    "Preferir composição a herança e explicar por quê.",
    "Dividir o código em módulos com import e export, e entender o que muda entre named e default exports.",
    "Ler um package.json e organizar as pastas de um projeto Node.",
  ],
  preRequisitos: [
    "Ter feito os módulos anteriores da trilha de TypeScript ou conhecer tipos, funções e async/await.",
    "Ter Node.js instalado e saber rodar um arquivo .ts.",
  ],
  pontosChave: [
    "Em TypeScript, private e readonly são checagens do compilador; para privacidade real em tempo de execução, use #campo.",
    "Interfaces descrevem o que algo faz; classes descrevem como. Dependa da interface.",
    "Composição (ter um objeto) costuma ser mais flexível que herança (ser um tipo de objeto).",
    "Cada arquivo é um módulo: o que não é exportado fica invisível para os outros.",
    "O package.json descreve o projeto: nome, scripts, dependências e se os arquivos são módulos ES.",
  ],
  blocos: [
    { tipo: "p", texto: "Até aqui, você escreveu funções e tipos soltos. Em um projeto de verdade, o código precisa de organização: agrupar dados e comportamento, esconder o que é detalhe interno e dividir o programa em arquivos que se encaixam. Este módulo cobre as ferramentas de TypeScript para isso (classes, interfaces e módulos) e mostra como um projeto Node é montado em volta delas." },

    { tipo: "h", texto: "Classes em TypeScript" },
    { tipo: "p", texto: "Uma classe agrupa atributos e métodos. A sintaxe é parecida com a de Java ou Python, com um acréscimo importante: os tipos dos atributos precisam ser declarados, e os modificadores de acesso (public, private, protected) e readonly são verificados pelo compilador." },
    { tipo: "p", texto: "O exemplo abaixo declara cada campo e o atribui no construtor, a forma mais explícita." },
    { tipo: "codigo", linguagem: "typescript", legenda: "Conta.ts", texto: `class Conta {
  readonly titular: string;
  private saldo: number;

  constructor(titular: string, saldoInicial: number) {
    if (saldoInicial < 0) {
      throw new Error("saldo inicial não pode ser negativo");
    }
    this.titular = titular;
    this.saldo = saldoInicial;
  }

  depositar(valor: number): void {
    if (valor <= 0) throw new Error("valor deve ser positivo");
    this.saldo += valor;
  }

  sacar(valor: number): void {
    if (valor > this.saldo) throw new Error("saldo insuficiente");
    this.saldo -= valor;
  }

  get resumo(): string {
    return \`\${this.titular}: \${this.saldo}\`;
  }
}

const conta = new Conta("Ana", 100);
conta.depositar(25);
console.log(conta.resumo);

try {
  conta.sacar(500);
} catch (erro) {
  console.log("Recusado:", (erro as Error).message);
}` },
    { tipo: "codigo", linguagem: "text", legenda: "Saída", texto: `Ana: 125
Recusado: saldo insuficiente` },
    { tipo: "p", texto: "Você verá muito código com um atalho: parâmetros do construtor com modificador viram atributos automaticamente (parameter properties). As duas formas são equivalentes para o compilador." },
    { tipo: "codigo", linguagem: "typescript", legenda: "atalho (trecho)", texto: `class Conta {
  constructor(
    readonly titular: string,
    private saldo: number,
  ) {}
}` },
    { tipo: "alerta", titulo: "O atalho não roda direto no Node", texto: "O Node executa arquivos .ts apagando só as anotações de tipo, e por isso não aceita construções que geram código, como os parameter properties e os enums. Nos exemplos executáveis deste módulo, os campos são declarados por extenso. Em um projeto com build (tsc) ou com ferramentas como tsx e Vitest, o atalho funciona normalmente, e também com a opção --experimental-transform-types do Node." },
    { tipo: "p", texto: "O titular é readonly: recebe valor no construtor e nunca mais muda. O saldo é private, então só a própria classe o altera, e as regras de depósito e saque ficam todas ali dentro. É o mesmo princípio de encapsulamento de outras linguagens: o objeto protege o próprio estado. A palavra get define uma propriedade calculada, que se lê sem parênteses (conta.resumo)." },
    { tipo: "alerta", titulo: "private do TypeScript não existe em tempo de execução", texto: "O modificador private é apagado na compilação: no JavaScript gerado, o campo é um campo comum, e qualquer código que ignore o compilador (como um cast para any) consegue acessá-lo. Quando a privacidade precisa ser real, use a sintaxe nativa do JavaScript, com cerquilha: #saldo. Esses campos são inacessíveis de fora mesmo em tempo de execução." },
    { tipo: "codigo", linguagem: "typescript", legenda: "Privado.ts", texto: `class Cofre {
  #segredo: string;

  constructor(segredo: string) {
    this.#segredo = segredo;
  }

  confere(tentativa: string): boolean {
    return tentativa === this.#segredo;
  }
}

const cofre = new Cofre("abracadabra");
console.log(cofre.confere("abracadabra"));
console.log(Object.keys(cofre).length);
console.log(JSON.stringify(cofre));` },
    { tipo: "codigo", linguagem: "text", legenda: "Saída", texto: `true
0
{}` },
    { tipo: "p", texto: "Veja o efeito prático: o campo # não aparece em Object.keys nem em JSON.stringify. Isso é útil para evitar vazar, sem querer, um dado sensível ao serializar um objeto para uma resposta de API." },

    { tipo: "h", texto: "Interfaces: o contrato" },
    { tipo: "p", texto: "Uma interface descreve a forma de um objeto, ou seja, quais membros ele precisa ter, sem dizer como funcionam. Em TypeScript, o encaixe é estrutural: qualquer objeto que tenha os membros pedidos é aceito, mesmo sem declarar que implementa a interface. Isso permite escrever código que depende de um contrato, e não de uma implementação concreta, e trocar uma peça pela outra sem mexer em quem a usa." },
    { tipo: "p", texto: "Um caso clássico é o armazenamento de dados. O serviço de usuários precisa de algo que guarde e busque usuários; se esse algo é um array em memória, um arquivo ou um banco, o serviço não deveria saber. Nos testes, você usa a versão em memória; em produção, a do banco." },
    { tipo: "codigo", linguagem: "typescript", legenda: "Repositorio.ts", texto: `interface Usuario {
  id: number;
  nome: string;
}

interface RepositorioDeUsuarios {
  salvar(usuario: Usuario): void;
  buscar(id: number): Usuario | undefined;
}

class RepositorioEmMemoria implements RepositorioDeUsuarios {
  private usuarios = new Map<number, Usuario>();

  salvar(usuario: Usuario): void {
    this.usuarios.set(usuario.id, usuario);
  }

  buscar(id: number): Usuario | undefined {
    return this.usuarios.get(id);
  }
}

class ServicoDeUsuarios {
  private readonly repositorio: RepositorioDeUsuarios;

  constructor(repositorio: RepositorioDeUsuarios) {
    this.repositorio = repositorio;
  }

  cadastrar(id: number, nome: string): Usuario {
    if (this.repositorio.buscar(id)) {
      throw new Error(\`já existe o usuário \${id}\`);
    }
    const usuario = { id, nome };
    this.repositorio.salvar(usuario);
    return usuario;
  }
}

const servico = new ServicoDeUsuarios(new RepositorioEmMemoria());
console.log(servico.cadastrar(1, "Ana"));
try {
  servico.cadastrar(1, "Outra Ana");
} catch (erro) {
  console.log((erro as Error).message);
}` },
    { tipo: "codigo", linguagem: "text", legenda: "Saída", texto: `{ id: 1, nome: 'Ana' }
já existe o usuário 1` },
    { tipo: "p", texto: "O ServicoDeUsuarios recebe o repositório pelo construtor, em vez de criá-lo por dentro. Essa técnica se chama injeção de dependência: quem usa o serviço decide qual implementação entrega. Ela vai reaparecer em frameworks como NestJS e Spring, mas aqui você vê que é só passar a dependência como argumento. Nada de mágica." },
    { tipo: "dica", titulo: "interface ou type?", texto: "Para descrever formas de objetos, os dois funcionam e a diferença prática é pequena. Uma convenção comum é usar interface para contratos que classes implementam e type para uniões, aliases e combinações. O importante é escolher uma regra e manter no projeto inteiro." },

    { tipo: "h", texto: "Composição ou herança" },
    { tipo: "p", texto: "TypeScript tem herança, com extends: uma classe filha ganha tudo da classe mãe. Parece um bom jeito de reaproveitar código, mas cria um acoplamento forte: qualquer mudança na mãe afeta todas as filhas, e a hierarquia vira uma camisa de força quando os casos de uso mudam. A alternativa é a composição: em vez de ser um tipo de coisa, o objeto tem uma coisa que sabe fazer o trabalho." },
    { tipo: "codigo", linguagem: "typescript", legenda: "Composicao.ts", texto: `interface Notificador {
  enviar(mensagem: string): string;
}

class PorEmail implements Notificador {
  enviar(mensagem: string): string {
    return \`email: \${mensagem}\`;
  }
}

class PorSms implements Notificador {
  enviar(mensagem: string): string {
    return \`sms: \${mensagem}\`;
  }
}

class Pedido {
  private readonly id: number;
  private readonly notificador: Notificador;

  constructor(id: number, notificador: Notificador) {
    this.id = id;
    this.notificador = notificador;
  }

  confirmar(): string {
    return this.notificador.enviar(\`pedido \${this.id} confirmado\`);
  }
}

console.log(new Pedido(7, new PorEmail()).confirmar());
console.log(new Pedido(8, new PorSms()).confirmar());` },
    { tipo: "codigo", linguagem: "text", legenda: "Saída", texto: `email: pedido 7 confirmado
sms: pedido 8 confirmado` },
    { tipo: "p", texto: "O Pedido não herda de ninguém: ele tem um Notificador. Para mudar a forma de avisar, basta passar outro objeto, sem criar PedidoComEmail e PedidoComSms. Um bom critério: use herança só quando a relação for realmente de tipo (um Gato é um Animal) e a classe filha respeitar tudo o que a mãe promete. Na dúvida, componha." },

    { tipo: "h", texto: "Módulos: um arquivo, um assunto" },
    { tipo: "p", texto: "Em Node moderno, cada arquivo é um módulo com escopo próprio: nada do que ele declara fica visível para os outros, a menos que seja exportado. Quem quer usar importa explicitamente. Isso evita colisões de nomes e deixa claro de onde cada coisa vem." },
    { tipo: "p", texto: "Existem dois jeitos de exportar. O export nomeado permite várias exportações por arquivo, e quem importa usa o mesmo nome entre chaves. O export default permite uma exportação principal, que quem importa pode batizar como quiser. A recomendação mais segura é preferir os nomeados: renomear fica explícito, o editor completa os nomes e os erros de digitação são pegos pelo compilador." },
    { tipo: "tabela", legenda: "Formas de importar e exportar", cabecalho: ["Situação", "Escrita"], linhas: [
      ["Exportar uma coisa com nome", "export function calcular() {}"],
      ["Importar por nome", "import { calcular } from \"./calculo.js\";"],
      ["Importar com outro nome", "import { calcular as calc } from \"./calculo.js\";"],
      ["Importar tudo como um objeto", "import * as calculo from \"./calculo.js\";"],
      ["Importar só o tipo", "import type { Usuario } from \"./tipos.js\";"],
    ] },
    { tipo: "alerta", titulo: "A extensão no import", texto: "Com módulos ES no Node, o caminho do import precisa incluir a extensão do arquivo. Mesmo escrevendo um arquivo .ts, o import costuma usar .js (ou .ts, conforme a configuração do projeto), porque é o nome que existirá depois da compilação. O erro \"Cannot find module\" ao importar um arquivo local quase sempre tem essa causa." },

    { tipo: "h", texto: "A estrutura de um projeto Node" },
    { tipo: "p", texto: "Um projeto Node começa com um arquivo chamado package.json, na raiz. Ele diz o nome do projeto, que comandos existem (scripts), de quais pacotes ele depende e como interpretar os arquivos. Os pacotes são instalados na pasta node_modules, que nunca vai para o Git. O arquivo package-lock.json, ao contrário, vai: ele trava as versões exatas que você testou, para que todo mundo e o servidor de produção instalem o mesmo que você." },
    { tipo: "codigo", linguagem: "json", legenda: "package.json", texto: `{
  "name": "meu-servico",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "node --watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "test": "vitest run"
  },
  "dependencies": {
    "express": "^5.0.0"
  },
  "devDependencies": {
    "typescript": "^5.6.0",
    "@types/node": "^22.0.0"
  }
}` },
    { tipo: "p", texto: "Os campos mais importantes: \"type\": \"module\" liga os módulos ES; scripts são atalhos que você executa com npm run nome; dependencies são o que o programa precisa para rodar em produção, e devDependencies são só ferramentas de desenvolvimento (compilador, testes, tipos). O ^ antes da versão permite atualizações compatíveis (do 5.0.0 ao 5.x.x), e o lock garante que a instalação seja reproduzível." },
    { tipo: "p", texto: "Quanto às pastas, não há uma regra única, mas uma organização simples e comum para uma API é separar por responsabilidade dentro de src." },
    { tipo: "codigo", linguagem: "text", legenda: "Estrutura de pastas", texto: `meu-servico/
├── package.json
├── package-lock.json
├── tsconfig.json
├── src/
│   ├── index.ts            ponto de entrada: sobe o servidor
│   ├── usuarios/
│   │   ├── usuario.ts      tipos e regras do domínio
│   │   ├── repositorio.ts  acesso aos dados
│   │   └── servico.ts      casos de uso
│   └── comum/
│       └── erros.ts        código compartilhado
└── dist/                   gerado pelo build (fora do Git)` },
    { tipo: "p", texto: "Agrupar por assunto (tudo de usuários junto) tende a funcionar melhor que agrupar por tipo técnico (uma pasta só de repositórios, outra só de serviços), porque as mudanças costumam acontecer por funcionalidade: quando você mexe em usuários, quer abrir uma pasta, e não cinco." },

    { tipo: "h", texto: "Dependências com cuidado" },
    { tipo: "lista", itens: [
      "Cada pacote instalado é código de terceiros rodando com as permissões do seu programa. Prefira pacotes populares, mantidos e com poucas dependências.",
      "Use npm audit para listar vulnerabilidades conhecidas nas dependências e atualize com regularidade.",
      "Nunca apague o package-lock.json para \"resolver\" um problema de instalação sem entender a causa: você perde a garantia de versões.",
      "Em CI e produção, instale com npm ci, que segue exatamente o lock e falha se ele estiver fora de sincronia.",
      "Fique atento a pacotes com nomes parecidos com os populares (typosquatting): confira o nome antes de instalar.",
    ] },
  ],
  questoes: [
    {
      enunciado: "O que faz o modificador private em uma propriedade de classe TypeScript?",
      opcoes: ["Torna o campo inacessível em tempo de execução, em qualquer circunstância", "Faz o compilador recusar acessos de fora da classe, mas é apagado no JavaScript gerado", "Impede que o campo seja lido dentro da própria classe", "Faz o campo ser salvo criptografado"],
      correta: 1,
      explicacao: "O private é uma checagem do compilador e desaparece no JavaScript gerado. Para privacidade real em tempo de execução, usa-se a sintaxe nativa #campo.",
    },
    {
      enunciado: "O que o código abaixo faz?\n\nclass A {\n  constructor(private readonly x: number) {}\n}",
      opcoes: ["Nada: o x é só um parâmetro e some depois do construtor", "Dá erro, porque parâmetros não aceitam modificadores", "Declara o atributo x, privado e somente leitura, e o preenche com o argumento recebido", "Cria um método chamado x"],
      correta: 2,
      explicacao: "Em TypeScript, um parâmetro de construtor com modificador vira um atributo da classe, já atribuído. É um atalho para declarar o campo e copiar o parâmetro.",
    },
    {
      enunciado: "Qual a vantagem de o ServicoDeUsuarios receber um RepositorioDeUsuarios (interface) pelo construtor?",
      opcoes: ["O código roda mais rápido", "Dá para trocar a implementação (por exemplo, uma em memória nos testes) sem alterar o serviço", "O TypeScript exige que dependências venham pelo construtor", "Evita que o repositório seja usado em outro lugar"],
      correta: 1,
      explicacao: "Dependendo do contrato e recebendo a implementação de fora (injeção de dependência), o serviço fica desacoplado: nos testes entra uma versão em memória e, em produção, a do banco, sem mexer em uma linha do serviço.",
    },
    {
      enunciado: "Em qual situação a herança é mais apropriada do que a composição?",
      opcoes: ["Quando existe uma relação real de tipo e a filha respeita tudo o que a mãe promete", "Sempre que duas classes compartilham algum código", "Quando se quer trocar o comportamento em tempo de execução", "Quando a classe não tem atributos"],
      correta: 0,
      explicacao: "Herança expressa uma relação de tipo (é um) e acopla fortemente filha e mãe. Para apenas reaproveitar comportamento ou permitir trocas, a composição é mais flexível. Compartilhar código não basta como justificativa.",
    },
    {
      enunciado: "Qual a diferença entre dependencies e devDependencies no package.json?",
      opcoes: ["Nenhuma, é só organização visual", "dependencies são necessárias para o programa rodar em produção; devDependencies são ferramentas de desenvolvimento, como compilador e testes", "devDependencies são instaladas só no servidor", "dependencies só aceitam pacotes oficiais do Node"],
      correta: 1,
      explicacao: "dependencies contêm o que o programa precisa em execução. devDependencies são usadas para construir e testar (TypeScript, Vitest, tipos), e podem ficar de fora de uma instalação de produção.",
    },
    {
      enunciado: "Por que o package-lock.json deve ser versionado no Git?",
      opcoes: ["Porque ele contém as senhas do projeto", "Porque o Node não funciona sem ele", "Porque substitui o package.json", "Porque ele trava as versões exatas testadas, tornando a instalação reproduzível para todos"],
      correta: 3,
      explicacao: "O lock registra a versão exata de cada pacote (inclusive os indiretos). Com ele, você, seus colegas e o servidor instalam o mesmo conjunto, e o npm ci falha se estiver fora de sincronia. Já a pasta node_modules não vai para o Git.",
    },
    {
      enunciado: "Por que se costuma preferir exports nomeados a export default?",
      opcoes: ["Porque o default não funciona com módulos ES", "Porque o nome fica fixo em todo o projeto, o editor completa e erros de digitação são pegos pelo compilador", "Porque o default deixa o código mais lento", "Porque só se pode ter um arquivo com export default"],
      correta: 1,
      explicacao: "Com o export default, cada arquivo que importa pode usar um nome diferente para a mesma coisa, o que dificulta buscas e refatorações. Com exports nomeados, o nome é o mesmo em todo lugar e o compilador avisa quando está errado.",
    },
  ],
  desafio: {
    titulo: "Biblioteca de tarefas em módulos",
    enunciado: "Monte um pequeno projeto Node em TypeScript que gerencia uma lista de tarefas em memória, dividido em módulos e com a persistência atrás de uma interface. O foco é organização e contratos, e não funcionalidade.",
    requisitos: [
      "Crie um package.json com \"type\": \"module\" e um script dev que rode o programa.",
      "Defina uma interface RepositorioDeTarefas (adicionar, listar, concluir) e uma implementação em memória em um arquivo separado.",
      "Crie uma classe ServicoDeTarefas que receba o repositório pelo construtor e valide as regras (título não vazio, não concluir duas vezes).",
      "Use readonly e private para impedir que código de fora altere o estado interno diretamente.",
      "Escreva um src/index.ts que use o serviço, imprima o resultado de algumas operações e trate o erro de uma operação inválida.",
    ],
    criterios: [
      "Cada arquivo tem uma responsabilidade clara e usa apenas exports nomeados.",
      "O serviço depende da interface, e não da classe concreta.",
      "O compilador não reclama em modo estrito (tsc --strict) e não há uso de any.",
      "Não há dependências instaladas sem necessidade e o package-lock.json está versionado.",
      "Você consegue trocar a implementação em memória por outra sem editar o serviço.",
    ],
    dica: "Escreva o index.ts primeiro, como se tudo já existisse, e deixe o compilador listar o que falta. É um jeito bom de descobrir quais métodos a interface realmente precisa ter.",
  },
  referencias: [
    { titulo: "TypeScript Handbook: Classes (em inglês)", url: "https://www.typescriptlang.org/docs/handbook/2/classes.html" },
    { titulo: "TypeScript Handbook: Modules (em inglês)", url: "https://www.typescriptlang.org/docs/handbook/2/modules.html" },
    { titulo: "Documentação do Node.js: módulos ECMAScript (em inglês)", url: "https://nodejs.org/api/esm.html" },
  ],
};
