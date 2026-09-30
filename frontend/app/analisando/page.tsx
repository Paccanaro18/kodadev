import AcompanharAnalise from "@/components/AcompanharAnalise";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ analise?: string }>;
}) {
  const { analise } = await searchParams;

  return <AcompanharAnalise id={analise ?? null} />;
}
