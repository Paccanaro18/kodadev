import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Roteiro from "@/components/trilhas/Roteiro";
import { resumirTrilha, slugsDeTrilha, trilhaPorSlug } from "@/lib/trilhas";

type Parametros = { params: Promise<{ trilha: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return slugsDeTrilha().map((trilha) => ({ trilha }));
}

export async function generateMetadata({ params }: Parametros): Promise<Metadata> {
  const { trilha: slug } = await params;
  const trilha = trilhaPorSlug(slug);
  return trilha ? { title: `${trilha.titulo} | Koda`, description: trilha.descricao } : {};
}

export default async function Page({ params }: Parametros) {
  const { trilha: slug } = await params;
  const trilha = trilhaPorSlug(slug);
  if (!trilha) notFound();

  return (
    <>
      <Link href="/aprenda" className="text-sm font-semibold text-koda-texto">← Aprenda aqui</Link>
      <div className="mt-6">
        <Roteiro trilha={resumirTrilha(trilha)} />
      </div>
    </>
  );
}
