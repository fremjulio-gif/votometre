import { getSociologieAbstentionData } from "@/lib/data";
import { AbstentionClient } from "@/components/AbstentionClient";

export const revalidate = 3600;

export const metadata = {
  title: "Sociologie du Vote & Abstention — Le Votomètre",
  description:
    "Observatoire officiel de la participation électorale, de l'abstention, du vote intermittent (Insee) et du phénomène des 7,7 millions de mal-inscrits en France (2002–2026).",
};

export default async function AbstentionPage() {
  const data = await getSociologieAbstentionData();

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <AbstentionClient data={data} />
    </div>
  );
}
