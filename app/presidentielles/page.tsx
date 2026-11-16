import { prisma } from "@/lib/prisma";
import { getConsensusPointsByElection, getProspectif2027Data } from "@/lib/data";
import { PresidentiellesClient } from "@/components/PresidentiellesClient";
import { ScrutinType } from "@prisma/client";

export const revalidate = 3600;

export const metadata = {
  title: "Présidentielles (2002–2027) — Le Votomètre",
  description:
    "Historique des prédictions des instituts vs résultats officiels proclamés par le Conseil constitutionnel pour toutes les présidentielles de 2002 à 2022 et hypothèses 2027.",
};

const RESUMES: Record<string, string> = {
  "presi-2002-t1":
    "Le 21 avril 2002 constitue la plus grande surprise de la Ve République : Jean-Marie Le Pen est sous-estimé de +3,86 points par les sondeurs (sondé à 13%, fait 16,86%), devançant Lionel Jospin sur-estimé de 2 points.",
  "presi-2002-t2":
    "Après le choc du 21 avril, réflexe républicain massif : Jacques Chirac est réélu avec 82,21% des suffrages face à Jean-Marie Le Pen (17,79%).",
  "presi-2007-t1":
    "Campagne d'une participation record (83,77%). Nicolas Sarkozy en tête avec 31,18%, suivi de Ségolène Royal (25,87%) et la percée centriste de François Bayrou (18,57%). Estimations très proches des urnes.",
  "presi-2007-t2":
    "Victoire de Nicolas Sarkozy avec 53,06% des voix face à Ségolène Royal (46,94%). Sondeurs dans la marge d'erreur parfaite.",
  "presi-2012-t1":
    "François Hollande devance Nicolas Sarkozy (28,63% vs 27,18%). Percée de Marine Le Pen à 17,90% (légèrement sous-estimée) et Jean-Luc Mélenchon à 11,10%.",
  "presi-2012-t2":
    "Élection de François Hollande (51,64%) face à Nicolas Sarkozy (48,36%). Précision au dixième de point des instituts.",
  "presi-2017-t1":
    "Recomposition historique : élimination conjointe du PS (Benoît Hamon 6,36%) et de LR (François Fillon 20,01%). Emmanuel Macron se qualifie (24,01%) face à Marine Le Pen (21,30%). Jean-Luc Mélenchon réalise 19,58% grâce à une dynamique finale fulgurante.",
  "presi-2017-t2":
    "Emmanuel Macron est élu avec 66,10% face à Marine Le Pen (33,90%). Prédictions des instituts extrêmement fiables.",
  "presi-2022-t1":
    "Campagne marquée par la dynamique finale de Jean-Luc Mélenchon (21,95%, sous-estimé de plus de 4 points par les instituts) et la qualification d'Emmanuel Macron (27,85%) et Marine Le Pen (23,15%). Effondrement historique de LR (4,78%) et du PS (1,75%).",
  "presi-2022-t2":
    "Réélection d'Emmanuel Macron avec 58,55% face à Marine Le Pen (41,45%). Sondages très précis à la veille du vote.",
};

export default async function PresidentiellesPage() {
  const elections = await prisma.election.findMany({
    where: {
      type: ScrutinType.PRESIDENTIELLE,
      annee: { lte: 2024 },
    },
    orderBy: [{ annee: "desc" }, { tour: "asc" }],
  });

  const electionsData = await Promise.all(
    elections.map(async (el) => {
      const points = await getConsensusPointsByElection(el.slug);
      return {
        annee: el.annee,
        tour: el.tour,
        slug: el.slug,
        date: el.dateScrutin.toISOString().split("T")[0],
        inscrits: el.inscrits,
        votants: el.votants,
        exprimes: el.exprimes,
        tauxAbstention: el.tauxAbstention,
        points,
        resume: RESUMES[el.slug] || "",
      };
    })
  );

  const rawProspectif = await getProspectif2027Data();
  const prospectifData = {
    annee: 2027,
    vagues:
      rawProspectif?.sondages?.map((s: any) => ({
        institut: s.institut?.nom || s.institut,
        commanditaire: s.commanditaire,
        datePublication: s.datePublication instanceof Date ? s.datePublication.toISOString().split("T")[0] : String(s.datePublication).split("T")[0],
        dateDebut: s.dateDebut ? (s.dateDebut instanceof Date ? s.dateDebut.toISOString().split("T")[0] : String(s.dateDebut).split("T")[0]) : null,
        dateFin: s.dateFin ? (s.dateFin instanceof Date ? s.dateFin.toISOString().split("T")[0] : String(s.dateFin).split("T")[0]) : null,
        tailleEchantillon: s.tailleEchantillon,
        methode: s.methode,
        hypothese: s.statut || s.hypothese || "Hypothèse 2027",
        mesures: s.mesures?.map((m: any) => ({
          candidatNom: m.candidat?.nom || m.candidatNom,
          parti: m.candidat?.parti || m.parti,
          famille: m.candidat?.famille || m.famille,
          couleurHex: m.candidat?.couleurHex || m.couleurHex,
          intentionPct: m.intentionVotePct || m.intentionPct,
        })) || [],
      })) || [],
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <PresidentiellesClient
        electionsData={electionsData}
        prospectifData={prospectifData}
      />
    </div>
  );
}
