import { getMunicipales2026Data } from "@/lib/data";
import { MunicipalesClient } from "@/components/MunicipalesClient";

export const revalidate = 3600;

export const metadata = {
  title: "Élections Municipales 2026 — Le Votomètre",
  description:
    "Résultats officiels proclamés des élections municipales de mars 2026, participation citoyenne record, dynamique des 42 métropoles et confrontation locale des sondages d'opinion.",
};

export default async function MunicipalesPage() {
  const data = await getMunicipales2026Data();

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <MunicipalesClient data={data} />
    </div>
  );
}
