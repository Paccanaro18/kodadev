import { notFound } from "next/navigation";
import DetalheDaIdeia from "@/components/ideias/DetalheDaIdeia";
import { ideiaPorSlug } from "@/lib/ideias";

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!ideiaPorSlug(slug)) notFound();

  return <DetalheDaIdeia slug={slug} />;
}
