import DetalheProjeto from "@/components/DetalheProjeto";

export default async function Projeto({ searchParams }: { searchParams: Promise<{ analise?: string }> }) {
  const { analise } = await searchParams;

  return <DetalheProjeto id={analise ?? null} />;
}
