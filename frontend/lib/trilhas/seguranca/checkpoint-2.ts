import type { Checkpoint } from "../tipos";

export const SEG_CHECKPOINT_2: Checkpoint = {
  tipo: "checkpoint",
  slug: "checkpoint-criptografia-segredos-e-dependencias",
  titulo: "Checkpoint: criptografia, segredos e dependências",
  resumo: "Nove questões sobre as primitivas criptográficas, TLS, gestão de segredos e segurança da cadeia de suprimentos.",
  cobre: [
    "criptografia-aplicada",
    "segredos-e-configuracao-segura",
    "dependencias-e-cadeia-de-suprimentos",
  ],
  notaMinima: 0.7,
  questoes: [
    {
      enunciado: "Qual primitiva é a adequada para detectar que uma mensagem foi alterada por quem não tem a chave secreta compartilhada?",
      opcoes: ["Hash SHA-256 simples", "Base64", "HMAC", "Compressão"],
      correta: 2,
      explicacao: "O HMAC mistura uma chave secreta ao cálculo, e só quem a possui gera uma etiqueta válida. O hash simples pode ser recalculado por qualquer atacante.",
    },
    {
      enunciado: "Qual a regra de ouro sobre o nonce ao usar AES-GCM?",
      opcoes: ["Pode ser sempre o mesmo, pois não é segredo", "Nunca repetir um nonce com a mesma chave: gerar um novo a cada mensagem", "Deve ser igual à chave", "Deve ser curto"],
      correta: 1,
      explicacao: "A repetição de chave e nonce permite relacionar as mensagens e, no GCM, comprometer a autenticação. O nonce não é secreto, mas precisa ser único.",
    },
    {
      enunciado: "Para que serve uma assinatura digital?",
      opcoes: ["Para provar a origem e a integridade de um dado, com a chave privada assinando e a pública verificando", "Para cifrar o conteúdo", "Para comprimir arquivos", "Para gerar senhas"],
      correta: 0,
      explicacao: "Quem tem a chave pública verifica a assinatura sem conhecer nenhum segredo. É como se assinam releases, tokens e certificados.",
    },
    {
      enunciado: "Qual o risco de usar verify=False (ou equivalente) em chamadas HTTPS?",
      opcoes: ["O tráfego deixa de ser cifrado", "O tráfego continua cifrado, mas não se confirma a identidade do servidor, o que permite um ataque do homem no meio", "A conexão fica mais lenta", "O certificado expira"],
      correta: 1,
      explicacao: "Sem validar o certificado, qualquer um do outro lado serve, inclusive um atacante. O correto é confiar na autoridade certificadora interna, e não desligar a verificação.",
    },
    {
      enunciado: "Uma chave de API foi commitada e depois apagada. Qual a ação correta e prioritária?",
      opcoes: ["Reescrever o histórico e esperar", "Trocar o nome do repositório", "Tornar o repositório privado e esquecer", "Revogar e substituir a chave imediatamente, investigar o uso e só depois limpar o histórico"],
      correta: 3,
      explicacao: "A chave deve ser considerada comprometida. Tornar o segredo inútil vem primeiro. A limpeza do histórico reduz a exposição, mas não substitui a revogação.",
    },
    {
      enunciado: "Qual das práticas mantém os segredos fora do código?",
      opcoes: ["Constantes no arquivo de configuração versionado", "Variáveis de ambiente ou um cofre de segredos, com .env fora do Git e um .env.example sem valores reais", "Comentários no código", "Strings em Base64"],
      correta: 1,
      explicacao: "O código descreve o que precisa, e o ambiente fornece os valores. Base64 não protege nada, e arquivos versionados vazam junto com o código.",
    },
    {
      enunciado: "Uma pipeline instala dependências com npm install, e hoje o build quebrou sem nenhuma mudança no código. Qual a causa provável e a correção?",
      opcoes: ["O servidor está lento; esperar", "Uma dependência trouxe uma versão nova no meio do caminho; usar npm ci com o arquivo de trava", "O arquivo de trava é desnecessário; apagá-lo", "O Node mudou de nome"],
      correta: 1,
      explicacao: "Sem trava, a instalação pode trazer versões diferentes a cada execução. O npm ci instala exatamente o que está no lock e falha se houver divergência.",
    },
    {
      enunciado: "Um pacote chamado \"reqeusts\" aparece nas dependências de um projeto. O que fazer?",
      opcoes: ["Nada, deve funcionar igual", "Atualizar para a última versão", "Desconfiar de typosquatting: conferir o nome, a origem e o histórico antes de instalar, e usar o pacote legítimo", "Instalar também o requests"],
      correta: 2,
      explicacao: "Nomes quase iguais aos de pacotes populares são armadilhas clássicas. Confira o nome oficial, o mantenedor e o histórico do pacote.",
    },
    {
      enunciado: "Qual a utilidade de um SBOM quando uma nova vulnerabilidade famosa é anunciada?",
      opcoes: ["Corrigir automaticamente a falha", "Responder rapidamente quais sistemas usam o componente afetado e em qual versão", "Aumentar o desempenho", "Criptografar o código"],
      correta: 1,
      explicacao: "O SBOM é o inventário de componentes. Com ele, a resposta a \"estamos afetados, e onde?\" sai em minutos, em vez de dias de busca manual.",
    },
  ],
};
