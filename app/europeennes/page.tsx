import { prisma } from "@/lib/prisma";
import { getConsensusPointsByElection } from "@/lib/data";
import { EuropeennesClient } from "@/components/EuropeennesClient";
import { ScrutinType } from "@prisma/client";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Élections Européennes (2004–2024) — Le Votomètre",
  description:
    "Analyse de la précision des sondages aux élections européennes en France de 2004 à 2024. Comparaison des intentions de vote et des projections en sièges au Parlement européen.",
};

const CADRES: Record<number, { cadre: string; sieges: number; contexte: string }> = {
  2024: {
    cadre: "Circonscription nationale unique",
    sieges: 81,
    contexte:
      "Victoire écrasante du Rassemblement National mené par Jordan Bardella (31,37%, 30 sièges), fidèlement annoncée par les sondeurs. Surprise sur le score de Raphaël Glucksmann (13,83%) qui talonne la liste présidentielle de Valérie Hayer (14,60%).",
  },
  2019: {
    cadre: "Circonscription nationale unique",
    sieges: 79,
    contexte:
      "Premier scrutin national unique depuis 1999. Duel au sommet entre le RN de Jordan Bardella (23,34%) et Renaissance (22,42%). Surprise écologiste : Yannick Jadot fait 13,48% alors qu'il était sondé autour de 9%.",
  },
  2014: {
    cadre: "8 circonscriptions interrégionales",
    sieges: 74,
    contexte:
      "Le Front National arrive en tête d'un scrutin national pour la première fois de son histoire (24,86%, 24 sièges). L'UMP est deuxième (20,81%) et le PS s'effondre (13,98%).",
  },
  2009: {
    cadre: "8 circonscriptions interrégionales",
    sieges: 72,
    contexte:
      "Succès historique d'Europe Écologie (Daniel Cohn-Bendit / Eva Joly) qui égale presque le Parti Socialiste (16,28% vs 16,48%). L'UMP arrive largement en tête (27,88%).",
  },
  2004: {
    cadre: "8 circonscriptions interrégionales",
    sieges: 78,
    contexte:
      "Large victoire du Parti Socialiste de François Hollande (28,90%, 31 sièges) face à l'UMP (16,64%, 17 sièges).",
  },
};

export default async function EuropeennesPage() {
  const euroElections = await prisma.election.findMany({
    where: { type: ScrutinType.EUROPEENNE },
    orderBy: { annee: "desc" },
  });

  const elections = await Promise.all(
    euroElections.map(async (el) => {
      const points = await getConsensusPointsByElection(el.slug);
      const meta = CADRES[el.annee] || {
        cadre: "Circonscription nationale",
        sieges: 79,
        contexte: "",
      };

      return {
        annee: el.annee,
        slug: el.slug,
        cadre: meta.cadre,
        siegesFrance: meta.sieges,
        points,
        tauxAbstention: el.tauxAbstention,
        contexte: meta.contexte,
      };
    })
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <EuropeennesClient elections={elections} />
    </div>
  );
}
