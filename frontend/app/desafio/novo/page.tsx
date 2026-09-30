import NovoDesafio from "@/components/NovoDesafio";

export default async function Page({ searchParams }: { searchParams: Promise<{ analise?: string }> }) {
  const { analise } = await searchParams;

  return <NovoDesafio analiseId={analise ?? null} />;
}
