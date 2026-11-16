import { getLegislativesHemicycleData } from "@/lib/data";
import { LegislativesClient } from "@/components/LegislativesClient";

export const revalidate = 3600;

export const metadata = {
  title: "Législatives & Hémicycle (2002–2024) — Le Votomètre",
  description:
    "Analyse de la répartition des 577 sièges de l'Assemblée nationale : projections des sondeurs face aux députés réellement élus lors des deuxièmes tours.",
};

const CONTEXTES: Record<number, string> = {
  2024: "Législatives anticipées consécutives à la dissolution de l'Assemblée nationale. Malgré les sondages annonçant le RN en tête avec 175-205 sièges, les désistements républicains massifs inversent la donne : le Nouveau Front Populaire devient le 1er bloc (193 sièges) devant Ensemble (166) et le RN (142). Hémicycle tripolarisé sans majorité absolue.",
  2022: "Emmanuel Macron perd la majorité absolue au second tour (245 députés, en-dessous des 289 requis). Percée historique inattendue du Rassemblement National (89 députés, alors que les sondages le plafonnaient entre 20 et 50). La NUPES constitue la première force d'opposition avec 131 sièges.",
  2017: "Raz-de-marée d'En Marche après l'élection présidentielle : LREM et le MoDem obtiennent une large majorité absolue de 350 sièges, mais restent nettement sous les projections des sondeurs qui prévoyaient un score écrasant de 440 à 470 sièges en raison de l'abstention record (57,36%).",
  2012: "Victoire de la gauche plurielle portée par l'élection de François Hollande. Le Parti Socialiste et ses alliés atteignent la majorité absolue avec 314 députés. Projections en sièges très fidèles.",
  2007: "L'UMP de Nicolas Sarkozy remporte la majorité absolue avec 345 députés, mais subit le contrecoup du débat sur la 'TVA sociale' entre les deux tours, sauvant de nombreux députés socialistes par rapport aux premières projections de raz-de-marée (qui prévoyaient plus de 400 sièges).",
  2002: "Vague bleue consécutive à la réélection de Jacques Chirac. L'UMP nouvellement créée rafle 399 sièges, offrant une écrasante majorité absolue au gouvernement Raffarin. Prévisions fidèles.",
};

export default async function LegislativesPage() {
  const years = [2024, 2022, 2017, 2012, 2007, 2002];

  const yearsData: Record<number, any> = {};

  for (const yr of years) {
    const data = await getLegislativesHemicycleData(yr);
    if (!data) continue;

    // Build comparisons
    const comparisons = data.predictedBlocs.map((pb: any) => {
      // Find matching real group or coalition
      const matchingReal = data.realGroups.find(
        (rg: any) =>
          rg.nom.toLowerCase().includes(pb.nom.toLowerCase().slice(0, 10)) ||
          pb.nom.toLowerCase().includes(rg.nom.toLowerCase().slice(0, 10))
      );

      const siegesReels = matchingReal ? matchingReal.sieges : pb.siegesEstimes;
      const dansFourchette = siegesReels >= pb.siegesMin && siegesReels <= pb.siegesMax;
      const ecart = siegesReels - pb.siegesEstimes;

      return {
        bloc: pb.nom,
        siegesMin: pb.siegesMin,
        siegesMax: pb.siegesMax,
        siegesReels,
        dansFourchette,
        ecart,
        couleurHex: pb.couleurHex,
      };
    });

    yearsData[yr] = {
      annee: yr,
      realGroups: data.realGroups,
      predictedBlocs: data.predictedBlocs,
      comparaisons: comparisons,
      contexte: CONTEXTES[yr] || "",
    };
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <LegislativesClient yearsData={yearsData} />
    </div>
  );
}
