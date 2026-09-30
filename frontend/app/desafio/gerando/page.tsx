import AcompanharDesafio from "@/components/AcompanharDesafio";

export default async function Page({ searchParams }: { searchParams: Promise<{ desafio?: string }> }) {
  const { desafio } = await searchParams;

  return <AcompanharDesafio id={desafio ?? null} />;
}
