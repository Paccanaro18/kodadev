import type { Metadata } from "next";
import { Sora } from "next/font/google";
import "./globals.css";

const sora = Sora({ subsets: ["latin"], variable: "--font-sora", weight: ["400", "500", "600", "700", "800"] });

export const metadata: Metadata = { title: "Koda", description: "Transforme seu repositório em desafios reais." };

/** Aplica o tema salvo antes da primeira pintura, para a página não piscar no tema errado. O padrão é o preto. */
const SCRIPT_DO_TEMA = `try{var t=localStorage.getItem("koda-tema");document.documentElement.dataset.tema=t==="claro"||t==="roxo"?t:"preto"}catch(e){}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={sora.variable} data-tema="preto" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: SCRIPT_DO_TEMA }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
