import { exigirCampanha } from "@/lib/campanha";

export default async function CampanhaLayout({ children, params }) {
  const { id } = await params;
  await exigirCampanha(id);

  return <>{children}</>;
}