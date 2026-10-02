import type { ReactNode } from "react";
import PaginaPublica from "@/components/publico/PaginaPublica";

export default function Layout({ children }: { children: ReactNode }) {
  return <PaginaPublica>{children}</PaginaPublica>;
}
