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

Branch: `feat/challenge-engine` (Etapa 6; a Etapa 5 já foi para a `main`). A Etapa 4 do backend já está na `main` (PR #6). A 4.5 (front das análises, branch `feat/front-analises`) ainda não foi mergeada na `main`: esta branch a contém por merge, então o PR da Etapa 5 leva os commits dela junto, a menos que a 4.5 entre antes.

Pronto:
- Etapas 0 a 3: projeto, login GitHub, token criptografado, `GithubClient`/`GithubService`, endpoints de repositórios, árvore e blob.
- 4.1 a 4.3: detectores (`DetectorPom`, `DetectorDockerCompose`, `DetectorEndpoints`, `DetectorEntidade`), `AnalisadorEstrutura`, tabelas `repositorios` e `analises_projeto`, entidades e repositories.
- 4.4a: `ResultadoAnalise` e `MontadorResultado`, com 6 testes verdes.
- 4.4b: `SelecaoArquivos` (tetos de 30 controllers e 30 candidatas a entidade, `pom.xml` e compose só na raiz, arquivos até 256 KB), `SerializadorResultado` (Jackson 3), `RegistroAnalise` (transições em transações curtas), `AnalisadorRepositorio`, `FilaAnalises` (2 threads, fila de 10, cheia vira `FilaDeAnaliseCheiaException`), `IniciadorAnalise` e `RecuperadorAnalises` (marca `FALHOU` o que ficou em aberto ao subir). `ResultadoAnalise` tem o campo `parcial`.
- Regras do analisador: sem código Java, sem `pom.xml` na raiz ou sem Spring Boot gera `FALHOU` com mensagem fixa. Arquivo isolado ilegível ou grande demais é pulado e o resultado sai `parcial`. Erro inesperado grava só uma mensagem genérica, nunca `getMessage()`. Prazo máximo de 2 minutos por análise (`koda.analise.prazo-maximo`).
- Hardening: detectores sem regex quadrática (`RemovedorComentarios`), blob com teto de 512 KB de resposta e 256 KB de arquivo (`ArquivoGrandeDemaisException`, 413), `AnaliseProjeto` valida a ordem das transições.
- 4.4c: `POST /api/analises` (corpo `{dono, nome}`, devolve 202 com `Location` e `{id, status: PENDENTE}`) e `GET /api/analises/{id}`. O usuário vem da sessão. O repositório é conferido no GitHub: precisa ser público e da conta do usuário (dono vem do `full_name` do GitHub, não do corpo). `RegistroAnalise.registrarNovaAnalise` cria ou atualiza a linha em `repositorios` e a análise `PENDENTE`. Erros: 404 (análise inexistente ou de outro usuário, mesma resposta), 409 (já há análise em aberto, garantido por índice único parcial da V5), 422 (repositório privado ou de outra conta), 429 (fila cheia, a análise vira `FALHOU`), 400 (corpo inválido).
- 4.5: `GET /api/analises` devolve a análise mais recente de cada repositório do usuário (até 20, resumo sem endpoints). No front, "Conectar" chama `POST /api/analises`; `/analisando?analise=<id>` acompanha por polling a cada 1,5 s (limite de 3 min) e mostra a mensagem de erro se falhar; `/projeto?analise=<id>` mostra stack, estrutura, dependências, domínios (nomes dos controllers e entidades) e endpoints reais, e sem o parâmetro abre a última análise concluída; o dashboard lista "Repositórios conectados" reais. Os desafios da tela do projeto e o restante do dashboard continuam de exemplo (Etapas 6 e 8).
- Etapa 5 (Project Context): documento JSON versionado e sanitizado, guardado em `analises_projeto.contexto` (migrations V6 e V7, com `versao_esquema_contexto`). O `MontadorContexto` (lógica pura) recebe o `ResultadoAnalise` e os caminhos da árvore e calcula arquitetura (`EM_CAMADAS`, `POR_FEATURE`, `HEXAGONAL` ou `INDEFINIDA`), domínios, features, endpoints (até 100), componentes, DTOs, exceções, tratador de erros, services e controllers sem teste e infra. O `SanitizadorIdentificador` barra tudo que não for identificador, caminho, método HTTP ou versão válidos. O `AnalisadorRepositorio` monta e grava o contexto junto do resultado, sem leitura extra no GitHub, e `AnaliseProjeto.concluir` exige o contexto. `GET /api/analises/{id}` devolve `contexto` (nulo em análise antiga ou ainda em andamento). O front mostra os domínios do contexto e o cartão "Arquitetura e qualidade" (arquitetura, features, tratador de erros, Dockerfile, Compose e classes sem teste); análise antiga mostra um aviso para reanalisar.

- Etapa 6 (Challenge Engine): o código escolhe ângulo e alvo, a IA só redige, e lê apenas o `ContextoProjeto` sanitizado. Migration V8 (`desafios`, índice único parcial: uma geração aberta por usuário). Catálogo de 36 ângulos (`CatalogoAngulos`, com regras de aplicabilidade pelo contexto), `SeletorDeDesafio` (ângulo menos usado, alvo ainda não usado; combinações esgotadas viram 422), `DetectorSimilaridade` (Jaccard, limite 0.70 em `koda.desafio.similaridade-maxima`; ticket parecido reseleciona outro ângulo), rotação de perspectivas e títulos recentes no prompt. `MontadorPrompt` tem prompt de sistema fixo; `VerificadorConteudo` trata a saída da IA como não confiável (limites, remove caracteres de controle, rejeita cercas de código). `GeradorDesafio` faz no máximo 2 chamadas por ticket (retry só para conteúdo inválido), prazo `koda.desafio.prazo-maximo`, mensagens de falha fixas. Geração em segundo plano (`FilaDesafios`, 1 thread, fila de 5, `RecuperadorDesafios` ao subir). Cota diária de 5 (`koda.desafio.limite-diario`).
- API: `POST /api/analises/{id}/desafios` (corpo `{tipo: FEATURE|BUG|TESTING|ALEATORIO}`, 202 + `Location`), `GET /api/analises/{id}/desafios`, `GET /api/desafios/{id}`. Erros: 404 (dono errado), 409 (análise não concluída ou geração em aberto), 422 (sem combinação disponível), 429 (cota ou fila cheia). Sem dica nem status de progresso no ticket (Etapa 8).
- Provedor de IA plugável (`koda.ia.provedor`): `falso` (padrão, títulos com prefixo "[Simulado]") ou `openai` (compatível com OpenAI, como o FreeLLMAPI; `KODA_IA_URL`, `KODA_IA_CHAVE`, `KODA_IA_MODELO` por variável de ambiente, veja `.env.example`). URL só https, ou http em localhost; sem redirects; resposta até 256 KB; prompts e chave nunca vão para log.
- Front: `/desafio/novo?analise=<id>` (escolha do tipo), `/desafio/gerando?desafio=<id>` (polling 1,5 s), `/desafio/<id>` (ticket real) e lista de desafios reais na tela do projeto. Os dados de exemplo dos desafios foram removidos; o dashboard ainda tem trechos de exemplo (Etapa 8).
- Medição com IA real (FreeLLMAPI, 13 gerações): os 9 tickets reais tiveram ângulos e títulos distintos, similaridade máxima 0,24 (mediana 0,06) contra o limite de 0,70, que foi mantido. 3 falharam por o provedor não responder em 60 s (modelos lentos escolhidos pelo `auto`); por isso `GeradorDesafio` tenta uma segunda vez quando o provedor não responde e registra no log só o motivo da tentativa descartada. Sugestão de uso: `KODA_IA_MODELO=auto:fast`. A segunda bateria foi dispensada.

- Etapa 7 (Challenge Validator): `ValidadorDesafio` (pacote `challenge/validacao`, só regras de código, sem IA e sem migration) roda depois do `VerificadorConteudo` e da similaridade. Reprova por `MotivoReprovacao`: `SOLUCAO_ENTREGUE` (chamada de método, setas, frases como "basta" ou "a solução"), `REFERENCIA_INEXISTENTE` (classe do projeto ou endpoint que não está no contexto, a menos que algum trecho do ticket diga que deve ser criado), `CRITERIO_VAGO` (termos vagos ou menos de 4 palavras), `TIPO_INCOERENTE` (Testing sem menção a teste; Bug sem sinal de defeito), `FORA_DO_ALVO` (alvo não citado) e `ESCOPO_GRANDE` (mais de 6 classes do projeto). A reprovação conta como uma das 2 chamadas; a segunda leva no prompt as orientações fixas do enum (nunca texto da IA). Falha final: mensagem fixa e log só com os nomes dos motivos. As regras foram calibradas com os 9 tickets reais da medição (fixtures em `src/test/resources/validacao/`), todos aprovados. O provedor falso foi ajustado para produzir tickets que passam no validador.
- Home: `GET /api/desafios` devolve `totalGerados` e os 10 últimos tickets (com habilidades); a home usa só dados reais (último desafio, atividades, total gerado, habilidades mais frequentes). Progresso de conclusão e recomendações ficam para a Etapa 8.
- Menu lateral: `/configuracoes` é real (perfil do GitHub, cota diária de `GET /api/desafios` com `cotaUsada` e `cotaLimite`, sair); `/progresso` e `/comunidade` são telas "Em breve" (Progresso chega com o status dos tickets na Etapa 8; Comunidade ainda sem definição de produto). A busca do topo filtra repositórios e desafios do usuário no front. O sino não tem notificações reais ainda e não mostra ponto vermelho.
- O backend lê o `.env` da raiz pelo `spring.config.import`, que NÃO remove aspas: valores como `KODA_IA_PROVEDOR="openai"` ficam com as aspas e quebram o provedor e os testes. Escrever sem aspas.

## Dívidas conhecidas

- POST sem sessão devolve 403 (falta `AccessDeniedHandler`); Postgres na porta 5433 em todas as interfaces; backend escuta em todas as interfaces; `FilaDesafios` duplica `FilaAnalises`; alguns commits antigos com assunto acima de 72 caracteres.

## Project Context: regras

- Entram só nomes de classes, caminhos de endpoint, método HTTP, versões, tecnologias e contagens. Nunca entram caminhos de arquivo, código, README, comentários, campos de entidade, textos livres nem segredos: nomes de arquivo de repositório de terceiros são hostis e vão virar entrada de um LLM.
- `parcial`, `truncado` e `itensDescartados` são sinais de qualidade do contexto. A Etapa 6 deve considerá-los (por exemplo, recusar gerar ticket com contexto parcial).
- Mudar o formato do `ContextoProjeto` exige subir `VERSAO_ESQUEMA` e tratar as versões antigas na leitura. Nunca mudar o formato em silêncio: campo primitivo novo quebra a leitura das linhas antigas (o Jackson falha com `null` em `int`/`boolean`) e a consulta daria 500.

## Limitações conhecidas dos detectores

- Pom multi-módulo (só o pai) devolve quase nada.
- Compose: `image: ${VARIAVEL}` não é resolvida.
- Endpoints por regex: não pega constantes no caminho, vários caminhos em `{}`, anotação na mesma linha do `class`, nem mapeamento em interface. Se incomodar, trocar por JavaParser.

- Arquitetura pelos nomes de pastas e sufixos de classe: `HEXAGONAL` só com `adapter`/`port` junto de `domain`/`application`; `POR_FEATURE` exige ao menos duas pastas com mais de uma camada; projeto pequeno cai em `EM_CAMADAS` ou `INDEFINIDA`.
- Domínios são os nomes de controllers e entidades sem sufixo (máximo de 15). "Sem teste" é por nome (`FooServiceTest`, `FooServiceTests`, `FooServiceIT`): teste com outro nome conta como ausente. DTOs, exceções e tratador de erros são detectados pelo sufixo do nome do arquivo.
- Candidatas a entidade vêm só da convenção de pastas (`entity`, `model`, `domain`): projeto organizado por feature (`user/Usuario.java`) fica sem entidades. Melhorar preenchendo as vagas com outras classes de `src/main`.

## Armadilhas já encontradas

- Jackson 3: `tools.jackson.databind.json.JsonMapper` e `tools.jackson.core.JacksonException` (não checked). As annotations continuam em `com.fasterxml.jackson.annotation`.
- O `java` do PATH é o 1.8. Para rodar os testes: `JAVA_HOME=C:/Users/pacsss/.jdks/openjdk-26.0.2 ./mvnw test`.

- Spring Boot 4: `RestClient.Builder` não vem auto-configurado. Usar `RestClient.builder()`.
- Tailwind 4: estilos base em `@layer base`. Erros "Unknown at-rule" no `globals.css` são só do IntelliJ.
- O `[Fatal Error]` no log dos testes do pom é só o parser imprimindo antes de lançar a exceção.
- `CHECK` com `NULL`: `NULL > 0` é desconhecido e o `CHECK` aceita. Escrever `IS NOT NULL` explícito (a V7 corrige isso na V6).
- Não rodar `next lint`: abre um assistente de ESLint e o projeto não configura ESLint. Validar o front com `npx tsc --noEmit` e `npm run build`.

## Dívida técnica

- Tratamento global de erros (trocar `IllegalStateException` provisórios por exceções de domínio).
- Paginação completa dos repositórios (hoje só os 100 mais recentes).
- Testes de integração da segurança.
- Senha do banco fixa no `application.yml`: mover para variável de ambiente antes de qualquer deploy.
- Menu do front sem destino (Progresso, Comunidade, Configurações).
- `ON DELETE` das chaves estrangeiras (decidir quando existir "excluir conta").
- Coluna `branch_padrao`: remover numa migration nova se o `GithubService` não precisar.
- `listarRepositorios` e `buscarArvore` leem a resposta do GitHub inteira, sem teto de bytes.
- Recuperação de análises em aberto no startup assume uma única instância do servidor.
- Remover o Lombok do `pom.xml` (não é usado) e alinhar `java.version` (21) com o Java 26 do ambiente.
- Postgres do compose publicado em todas as interfaces (`5433:5432`): restringir a `127.0.0.1`.
- Cookie de sessão sem `Secure` e `SameSite` explícitos; sessão em memória.
- Validar `dono`, `repositorio` e `sha` das rotas `/api/repositorios` com regex (o `POST /api/analises` já valida o corpo).
- POST sem sessão devolve 403 (o CSRF recusa antes da autenticação), não 401 como diz a regra de segurança. Decidir se vale um `AccessDeniedHandler` que devolva 401 quando não há usuário.
- Análises anteriores à V6 ficam sem contexto: a tela pede para reanalisar e não mostra domínios nem o cartão de arquitetura.
