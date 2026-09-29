import { LoginCard, LoginHero } from "@/components/Login";
import { RedirecionarSeLogado } from "@/components/RedirecionarSeLogado";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ erro?: string }>;
}) {
  const { erro } = await searchParams;

  return (
    <div className="grid min-h-screen lg:grid-cols-[1.54fr_1fr]">
      <RedirecionarSeLogado />
      <LoginHero />
      <LoginCard erro={Boolean(erro)} />
    </div>
  );
}
