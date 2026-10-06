import type { Trilha } from "../tipos";
import { SEG_CHECKPOINT_1 } from "./checkpoint-1";
import { SEG_MODULO_1 } from "./modulo-1-ameacas-e-risco";
import { SEG_MODULO_2 } from "./modulo-2-senhas-e-autenticacao";
import { SEG_MODULO_3 } from "./modulo-3-entrada-hostil-e-injecao";
import { SEG_MODULO_4 } from "./modulo-4-sessoes-e-controle-de-acesso";

export const TRILHA_SEGURANCA: Trilha = {
  slug: "seguranca-de-aplicacoes",
  grupo: "seguranca",
  titulo: "Segurança de aplicações",
  descricao: "Como as aplicações são atacadas e como construí-las seguras: ameaças, senhas e MFA, injeção, sessões e controle de acesso, com desafios para praticar no estilo CTF.",
  publico: "Para quem desenvolve software e quer escrever código seguro, e para quem quer começar em segurança. Os exemplos usam Python e rodam sem instalar nada. Os desafios práticos ficam na área Segurança do Koda.",
  etapas: [
    {
      titulo: "Fundamentos de segurança de aplicações",
      descricao: "Do raciocínio sobre risco às defesas contra os ataques mais comuns à web.",
      itens: [SEG_MODULO_1, SEG_MODULO_2, SEG_MODULO_3, SEG_MODULO_4, SEG_CHECKPOINT_1],
    },
  ],
  planejados: [
    { titulo: "Criptografia aplicada: o que usar, quando e como", resumo: "Hash, HMAC, criptografia simétrica e de chave pública, TLS e gestão de chaves." },
    { titulo: "Segredos e configuração segura", resumo: "Cofres, variáveis de ambiente, varredura de repositórios e o que fazer quando um segredo vaza." },
    { titulo: "Dependências e cadeia de suprimentos", resumo: "Vulnerabilidades em bibliotecas, SBOM, verificação de pacotes e atualizações seguras." },
    { titulo: "Segurança de APIs", resumo: "Autenticação de máquina para máquina, limites de uso, validação de esquemas e a lista de riscos de APIs da OWASP." },
    { titulo: "Registro, monitoramento e resposta a incidentes", resumo: "O que registrar, como detectar um ataque nos logs e o que fazer na primeira hora." },
    { titulo: "Nuvem e contêineres: segurança na prática", resumo: "Permissões mínimas, imagens seguras, redes privadas e erros de configuração clássicos." },
    { titulo: "Revisão de código com olhar de atacante", resumo: "Um roteiro para encontrar vulnerabilidades lendo código, com exemplos reais." },
  ],
};
