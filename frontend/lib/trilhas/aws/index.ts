import type { Trilha } from "../tipos";
import { AWS_CHECKPOINT_1 } from "./checkpoint-1";
import { AWS_MODULO_1 } from "./modulo-1-nuvem-e-responsabilidade";
import { AWS_MODULO_2 } from "./modulo-2-iam-e-governanca";
import { AWS_MODULO_3 } from "./modulo-3-computacao";
import { AWS_MODULO_4 } from "./modulo-4-armazenamento";

export const TRILHA_AWS: Trilha = {
  slug: "aws-cloud-practitioner",
  grupo: "certificacao",
  titulo: "AWS Cloud Practitioner (CLF-C02)",
  descricao: "O roteiro de estudo para a certificação de entrada da AWS: conceitos de nuvem, segurança, serviços principais, custos e suporte.",
  publico: "Para quem está começando em nuvem, de qualquer área, e para quem quer a primeira certificação AWS. Não exige experiência técnica.",
  etapas: [
    {
      titulo: "Conceitos de nuvem e segurança",
      descricao: "A base da prova: o que é a nuvem, como a AWS é organizada, quem protege o quê e como controlar o acesso.",
      itens: [AWS_MODULO_1, AWS_MODULO_2, AWS_CHECKPOINT_1],
    },
    {
      titulo: "Computação e armazenamento",
      descricao: "Onde o código roda e onde os dados vivem: EC2, contêineres, Lambda, S3, EBS e EFS.",
      itens: [AWS_MODULO_3, AWS_MODULO_4],
    },
  ],
  planejados: [
    { titulo: "Redes: VPC, Route 53 e CloudFront", resumo: "Redes privadas, DNS e entrega de conteúdo perto do usuário." },
    { titulo: "Bancos de dados: RDS, Aurora, DynamoDB e outros", resumo: "Relacional, chave-valor, em memória e analíticos." },
    { titulo: "Segurança avançada: Shield, WAF, KMS, GuardDuty, CloudTrail e Config", resumo: "Proteção, criptografia, detecção e auditoria." },
    { titulo: "Monitoramento e governança: CloudWatch, Trusted Advisor e Control Tower", resumo: "Observabilidade e boas práticas contínuas." },
    { titulo: "Custos, preços e planos de suporte", resumo: "Modelos de preço, Cost Explorer, Budgets, Pricing Calculator e os planos de suporte." },
    { titulo: "Well-Architected, CAF e migração", resumo: "Os pilares da boa arquitetura e as estratégias de migração para a nuvem." },
    { titulo: "IA e machine learning na AWS", resumo: "Os serviços de IA que o exame cobra e quando usar cada um." },
    { titulo: "Simulado final do exame", resumo: "65 questões nos quatro domínios, com revisão do que errou." },
  ],
};
