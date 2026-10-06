import { notFound } from "next/navigation";
import LaboratorioDeRedes from "@/components/redes/LaboratorioDeRedes";
import { laboratorioPorSlug } from "@/lib/redes/laboratorios";

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!laboratorioPorSlug(slug)) notFound();

  return <LaboratorioDeRedes slug={slug} />;
}
