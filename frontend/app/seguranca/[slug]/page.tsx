import DetalheDeSeguranca from "@/components/seguranca/DetalheDeSeguranca";

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  return <DetalheDeSeguranca slug={slug} />;
}
