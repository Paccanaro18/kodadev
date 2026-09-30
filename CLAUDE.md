# Koda

## Objetivo do produto

Koda (antes DevForge) é um SaaS para devs praticarem em cenários reais. O usuário conecta um repositório GitHub, a plataforma analisa a estrutura e usa IA para gerar tickets técnicos baseados no próprio código, no estilo Jira/Linear. A plataforma nunca entrega a solução.

MVP: somente backend Java/Spring Boot, nível Júnior, repositórios públicos.

## Metas

1. Etapa 4: analisador de repositório (detectores, estrutura, persistência, orquestrador e endpoints) e integração com o front.
2. Etapa 5: Project Context.
3. Etapa 6: Challenge Engine (IA).
4. Etapa 7: Challenge Validator.
5. Etapa 8: produto (status, dicas, histórico).
6. Etapa 9: qualidade.

Prioridades permanentes: segurança, código simples e testado, commits pequenos e legíveis.

## Quem é o dev

Artur, dev backend júnior em São Paulo, estuda ADS na FMU, cofundador da Compila. Está aprendendo e vai revisar tudo que for escrito. Comunicação em português do Brasil, direta e natural, sem linguagem de IA.

## Stack e ambiente

- Java 26, Spring Boot 4.1.1, Hibernate 7, Flyway, PostgreSQL 16, Maven.
- Pacote base: `com.koda.v1`. Módulos (pastas em inglês): `auth`, `user`, `github`, `challenge`, `shared`, `analyzer`.
- Front em `frontend/`: Next.js 15, React 19, Tailwind 4, Lucide, fonte Sora.
- Windows, PowerShell, IntelliJ. Repositório local em `C:\Developer\v1`.
- Banco via Docker Compose (container `koda-postgres`, porta 5433).
- Acessar sempre por `localhost`, nunca `127.0.0.1` (o cookie de sessão é por host).

## Regras de código

- Não escrever comentários no código. Nenhum: nem em linha, nem em bloco, nem Javadoc, nem nos testes. O código deve se explicar pelos nomes.
- Classes, variáveis, tabelas e colunas em português. Exceções: termos de framework (`Service`, `Repository`, `Controller`) e métodos derivados do Spring Data (`findByGithubId`).
- Nomes de arquivos de migration em inglês (`V5__create_..._table.sql`).
- Sem Lombok. Sem setters públicos. Entidades com métodos de domínio (`iniciar`, `concluir`, `falhar`).
- Records imutáveis com construtor compacto e `List.copyOf` para fichas e DTOs.
- Entidade JPA nunca sai do módulo. Entre módulos, trafegam DTOs. Sem `@ManyToOne` cruzando módulos: guardar só o id.
- Exceções de domínio em vez de `IllegalStateException` genérica.
- Migration já aplicada nunca é editada. Cria-se a próxima versão.
- `spring.jpa.hibernate.ddl-auto` é `validate`: o Flyway é a única fonte de verdade do banco.
- Não adicionar dependência nova sem avisar o motivo.

## Testes

- Lógica pura: sem Spring, só `new Classe()` e AssertJ, recebendo texto ou ficha e devolvendo ficha.
- Banco: `@SpringBootTest` + `@Transactional` (rollback no fim), gravando, chamando `entityManager.clear()` e relendo.
- Toda lógica nova nasce com teste. Rodar os testes antes de dizer que terminou.
- Anotações de teste do Spring Boot 4 mudaram de pacote em relação ao Boot 3. Usar `@SpringBootTest`, que não mudou.

## Segurança (regras inegociáveis)

- Nunca ler, abrir, imprimir ou copiar o conteúdo do `.env` ou de qualquer arquivo de segredo. O `.env` na raiz nunca é versionado.
- Nunca escrever senha, token, chave de API ou segredo em código, teste, log, migration, documentação ou mensagem de commit.
- Nunca logar token do GitHub, cookie de sessão ou dado pessoal do usuário.
- Token do GitHub sempre criptografado em repouso (AES-256-GCM, `CriptografiaToken` em `shared`).
- O usuário vem sempre da sessão, nunca da URL nem do corpo da requisição. Todo endpoint confere que o recurso pertence ao usuário da sessão.
- Rotas `/api/**` sem sessão devolvem 401. CSRF ativo.
- Todo dado vindo de fora (GitHub, YAML, XML, JSON) é hostil: limitar tamanho, proteger contra XXE e aliases de YAML, validar antes de usar.
- Queries sempre parametrizadas. Nunca concatenar texto do usuário em SQL.
- Mensagens de erro para o cliente não expõem stack trace, caminho de arquivo nem detalhe interno.
- Antes de qualquer coisa destrutiva (apagar dados, `DROP`, `git reset --hard`, `git push --force`, apagar branch), parar e pedir confirmação.
- Se encontrar um segredo exposto no código ou no histórico do git, avisar imediatamente.

## Git

- Uma branch por etapa, um PR por etapa. Nunca commitar direto na `main`.
- Commits pequenos e separados, em Conventional Commits em português (`feat(analyzer): ...`, `test(analyzer): ...`, `build: ...`, `fix: ...`).
- Usar `git add` com arquivo ou pasta específica, nunca `git add .`.
- Não fazer commit nem push sem o Artur pedir. Mostrar o que mudou e propor a mensagem.
- Não reescrever histórico já enviado.

## Como trabalhar

- Antes de escrever código que depende de arquivos, ler esses arquivos. Não chutar assinatura, campo nem versão de biblioteca.
- Para tarefas grandes, propor o plano em partes pequenas e esperar aprovação antes de codar.
- Ao terminar uma tarefa, dar um resumo curto em português (fora do código): o que mudou, por que, o que rodou e o resultado dos testes.
- Dizer com honestidade o que não foi possível verificar e o que depende de versão (Spring Boot 4, Hibernate 7, Tailwind 4, Jackson).
- Se algo no código existente ou em decisão anterior estiver errado, dizer.

## Estado atual

Branch: `feat/analisador-repositorio` (o PR só sai quando a Etapa 4 fechar).

Pronto:
- Etapas 0 a 3: projeto, login GitHub, token criptografado, `GithubClient`/`GithubService`, endpoints de repositórios, árvore e blob.
- 4.1 a 4.3: detectores (`DetectorPom`, `DetectorDockerCompose`, `DetectorEndpoints`, `DetectorEntidade`), `AnalisadorEstrutura`, tabelas `repositorios` e `analises_projeto`, entidades e repositories.
- 4.4a: `ResultadoAnalise` e `MontadorResultado`, com 6 testes verdes.

Em andamento: 4.4b, `AnalisadorRepositorio`.
- `SelecaoArquivos`: lógica pura que decide quais arquivos abrir, com tetos (ideia: cerca de 30 controllers e 30 candidatas a entidade).
- `AnalisadorRepositorio`: pega a árvore no GitHub, recusa cedo se não há código Java, abre os arquivos escolhidos, roda os detectores, monta o resultado e grava na análise (`concluir(json)` ou `falhar(msg)`).
- Execução em segundo plano: o endpoint devolve na hora um `analiseId` com status `PENDENTE`. A execução em segundo plano não tem sessão de usuário.
- Decisões em aberto: tratar árvore truncada do GitHub (marcar resultado como parcial); recusar ou aceitar repositório Java sem Spring Boot (proposta: recusar, gravando `FALHOU` com mensagem clara).
- Antes de escrever a serialização para JSON, conferir qual Jackson está no classpath (Spring Boot 4 usa geração nova, com pacote diferente).

Depois: 4.4c (endpoints para iniciar análise e consultar status, só o dono vê) e 4.5 (front com dados reais).

## Limitações conhecidas dos detectores

- Pom multi-módulo (só o pai) devolve quase nada.
- Compose: `image: ${VARIAVEL}` não é resolvida.
- Endpoints por regex: não pega constantes no caminho, vários caminhos em `{}`, anotação na mesma linha do `class`, nem mapeamento em interface. Se incomodar, trocar por JavaParser.

## Armadilhas já encontradas

- Spring Boot 4: `RestClient.Builder` não vem auto-configurado. Usar `RestClient.builder()`.
- Tailwind 4: estilos base em `@layer base`. Erros "Unknown at-rule" no `globals.css` são só do IntelliJ.
- O `[Fatal Error]` no log dos testes do pom é só o parser imprimindo antes de lançar a exceção.

## Dívida técnica

- Tratamento global de erros (trocar `IllegalStateException` provisórios por exceções de domínio).
- Paginação completa dos repositórios (hoje só os 100 mais recentes).
- Testes de integração da segurança.
- Senha do banco fixa no `application.yml`: mover para variável de ambiente antes de qualquer deploy.
- Menu do front sem destino (Progresso, Comunidade, Configurações).
- `ON DELETE` das chaves estrangeiras (decidir quando existir "excluir conta").
- Coluna `branch_padrao`: remover numa V5 se o `GithubService` não precisar.
- Validar a ordem das transições de `AnaliseProjeto`.