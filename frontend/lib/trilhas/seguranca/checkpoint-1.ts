import type { Checkpoint } from "../tipos";

export const SEG_CHECKPOINT_1: Checkpoint = {
  tipo: "checkpoint",
  slug: "checkpoint-fundamentos-de-seguranca",
  titulo: "Checkpoint: fundamentos de segurança de aplicações",
  resumo: "Nove questões sobre risco, senhas e MFA, injeção, sessões e controle de acesso.",
  cobre: [
    "ameacas-risco-e-defesa-em-camadas",
    "senhas-e-autenticacao",
    "entrada-hostil-e-injecao",
    "sessoes-tokens-e-controle-de-acesso",
  ],
  notaMinima: 0.7,
  questoes: [
    {
      enunciado: "Um atacante derruba o site de uma loja durante uma promoção. Qual propriedade da tríade CIA foi atingida?",
      opcoes: ["Confidencialidade", "Integridade", "Disponibilidade", "Nenhuma"],
      correta: 2,
      explicacao: "Disponibilidade é o serviço funcionar quando necessário. A negação de serviço quebra essa propriedade.",
    },
    {
      enunciado: "Por que a defesa em profundidade é preferível a depender de uma única proteção forte?",
      opcoes: ["Porque é mais barata", "Porque dispensa testes", "Porque camadas independentes fazem a falha de uma não ser a falha de todas", "Porque funciona só em redes internas"],
      correta: 2,
      explicacao: "Uma única barreira é um ponto único de falha. Com validação, consultas parametrizadas, permissões mínimas e monitoramento juntos, um erro isolado não vira um incidente completo.",
    },
    {
      enunciado: "Como as senhas devem ser guardadas no banco de dados?",
      opcoes: ["Em texto puro, mas com o banco protegido", "Com MD5, para ser rápido", "Com um hash lento (Argon2id, scrypt ou bcrypt) e sal único por usuário", "Codificadas em Base64"],
      correta: 2,
      explicacao: "Hashes lentos com sal encarecem cada tentativa do atacante e inutilizam as tabelas pré-calculadas. Base64 não protege nada, e MD5 é rápido demais.",
    },
    {
      enunciado: "Qual a vantagem do MFA por TOTP ou chave de segurança sobre usar só a senha?",
      opcoes: ["A senha deixa de existir", "Uma senha roubada, adivinhada ou reaproveitada de outro vazamento sozinha não basta para entrar", "O login fica mais rápido", "Dispensa o HTTPS"],
      correta: 1,
      explicacao: "O segundo fator exige algo que o atacante não tem. É a defesa mais eficaz contra o preenchimento de credenciais e o roubo de senhas.",
    },
    {
      enunciado: "O que a consulta parametrizada faz que a concatenação de strings não faz?",
      opcoes: ["Torna a consulta mais curta", "Criptografa o banco", "Remove as aspas do dado", "Envia ao banco o comando e os dados separadamente, de modo que o dado nunca é interpretado como SQL"],
      correta: 3,
      explicacao: "A separação estrutural entre comando e dados é o que impede a injeção. Não é um escape que pode falhar, e sim a ausência da mistura.",
    },
    {
      enunciado: "Um comentário com <script> digitado por um usuário é mostrado a todos os visitantes e executa nos navegadores deles. Que ataque é esse, e qual a defesa principal?",
      opcoes: ["CSRF; token anti-CSRF", "XSS armazenado; codificação de saída conforme o contexto (e CSP como camada extra)", "SQL injection; parâmetros", "Path traversal; resolver o caminho"],
      correta: 1,
      explicacao: "O conteúdo malicioso é guardado e exibido depois a outras pessoas. Escapar a saída conforme o contexto neutraliza o script, e uma CSP restritiva reduz o dano caso algo escape.",
    },
    {
      enunciado: "Qual a forma mais robusta de impedir que \"../../etc/passwd\" leia arquivos fora da pasta de uploads?",
      opcoes: ["Resolver o caminho final e conferir se ele ainda está dentro da pasta base", "Remover a sequência \"../\" uma vez", "Permitir só letras no nome", "Converter para minúsculas"],
      correta: 0,
      explicacao: "A canonicalização trata todas as variações de uma vez (.., links simbólicos, caminhos absolutos). Remover \"../\" é contornável.",
    },
    {
      enunciado: "Um token JWT é recusado pelo servidor quando o papel no corpo é trocado de cliente para admin, mesmo mantendo o resto igual. Por quê?",
      opcoes: ["Porque o corpo é criptografado", "Porque a assinatura foi calculada sobre o corpo original e não confere mais com o corpo alterado", "Porque o admin não existe", "Porque o JWT expirou"],
      correta: 1,
      explicacao: "A assinatura (HMAC) cobre o cabeçalho e o corpo. Qualquer alteração faz a verificação falhar, desde que o servidor recalcule a assinatura e fixe o algoritmo esperado.",
    },
    {
      enunciado: "Uma API só confere se o usuário está logado e devolve o pedido pelo número da URL, qualquer que seja o dono. Qual a correção?",
      opcoes: ["Usar números aleatórios nos pedidos como única defesa", "Verificar no servidor, a cada requisição, se o objeto pertence ao usuário da sessão (ou se o papel dele permite), com negação por padrão", "Esconder o botão na interface", "Aumentar o tamanho do cookie"],
      correta: 1,
      explicacao: "Esse é o IDOR, a forma mais comum de controle de acesso quebrado. Ids imprevisíveis ajudam como camada extra, mas a defesa é a autorização por objeto no servidor.",
    },
  ],
};
