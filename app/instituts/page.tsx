import { getLeaderboardInstituts } from "@/lib/data";
import { PodiumInstituts } from "@/components/PodiumInstituts";

export const revalidate = 3600;

export const metadata = {
  title: "Qui est le plus précis ? Le Podium des Instituts — Le Votomètre",
  description:
    "Audit de fiabilité des sondeurs en France (Ipsos, Ifop, Elabe, Harris, BVA, OpinionWay, etc.). Mesure de la marge d'erreur typique et des tendances observées sur 20 ans d'élections.",
};

export default async function InstitutsPage() {
  const instituts = await getLeaderboardInstituts();

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14 space-y-12">
      {/* Editorial Header */}
      <div className="space-y-3 max-w-2xl">
        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
          Audit Indépendant
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
          Qui est le plus précis ?
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
          Sur les 20 dernières années, chaque vague de sondage a été comparée au résultat réel officiel. Découvrez quel institut a été le plus proche de la vérité des urnes.
        </p>
      </div>

      {/* Clean Podium and Comparison List */}
      <PodiumInstituts instituts={instituts} />
    </div>
  );
}
