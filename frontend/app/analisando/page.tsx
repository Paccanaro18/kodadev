import Wait from "@/components/Wait";
import { analysisSteps, project } from "@/lib/data";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ repo?: string }>;
}) {
  const { repo } = await searchParams;
  const nome = repo?.split("/")[1] ?? project.name;
  const proxima = repo ? `/projeto?repo=${encodeURIComponent(repo)}` : "/projeto";

  return (
    <Wait
      mascot="terminal"
      title={"Analisando " + nome}
      subtitle="A Koda está lendo seu código. Leva alguns segundos."
      steps={analysisSteps}
      next={proxima}
    />
  );
}
