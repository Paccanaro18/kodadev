import type { Trilha } from "../tipos";
import { REDES_CHECKPOINT_1 } from "./checkpoint-1";
import { REDES_CHECKPOINT_2 } from "./checkpoint-2";
import { REDES_MODULO_1 } from "./modulo-1-enderecos-ip-mascaras-e-ping";
import { REDES_MODULO_2 } from "./modulo-2-switches-mac-e-vlans";
import { REDES_MODULO_3 } from "./modulo-3-roteadores-gateways-e-rotas";
import { REDES_MODULO_4 } from "./modulo-4-dhcp-e-dns";
import { REDES_MODULO_5 } from "./modulo-5-acls-e-firewall";

export const TRILHA_REDES: Trilha = {
  slug: "redes-de-computadores",
  grupo: "redes",
  titulo: "Redes de computadores",
  descricao: "Como os computadores se falam: endereços IP e máscaras, switches e VLANs, roteadores e rotas, DHCP e DNS. Cada aula tem um laboratório no simulador de redes do Koda, para montar, quebrar e consertar redes de verdade.",
  publico: "Para quem desenvolve software e quer entender a rede por baixo das aplicações, e para quem está começando em infraestrutura, nuvem ou segurança. Não exige conhecimento prévio. Os laboratórios ficam na área Redes e rodam no navegador.",
  etapas: [
    {
      titulo: "Fundamentos da rede local e do roteamento",
      descricao: "Do endereço IP ao roteador, sempre com um laboratório para praticar cada conceito.",
      itens: [REDES_MODULO_1, REDES_MODULO_2, REDES_MODULO_3, REDES_CHECKPOINT_1],
    },
    {
      titulo: "Serviços que automatizam a rede",
      descricao: "Endereços e nomes que se resolvem sozinhos, e o controle de quem pode falar com quem.",
      itens: [REDES_MODULO_4, REDES_MODULO_5, REDES_CHECKPOINT_2],
    },
  ],
  planejados: [
    { titulo: "NAT e acesso à internet", resumo: "Traduzir endereços privados em públicos e entender como uma rede inteira sai por um único endereço." },
    { titulo: "Redes na nuvem: VPC, sub-redes e grupos de segurança", resumo: "Aplicar tudo o que foi visto a redes da AWS, com tabelas de rotas, gateways e regras de acesso." },
    { titulo: "Wi-Fi e IPv6", resumo: "Como funciona a rede sem fio e o endereçamento de 128 bits que substitui o IPv4." },
  ],
};
