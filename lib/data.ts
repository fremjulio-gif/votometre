import { prisma } from "./prisma";
import {
  StatPoint,
  InstitutMetrics,
  calculateMAE,
  calculateSignedMean,
  classifyDelta,
  computeSignedError,
  testSeatCoverage,
} from "./stats";
import { ScrutinType } from "@prisma/client";

export interface ElectionSummary {
  id: string;
  slug: string;
  type: string;
  annee: number;
  tour: number;
  dateScrutin: string;
  tauxAbstention: number | null;
  totalVagues: number;
  mae: number;
  topSousEstime?: { nom: string; delta: number; couleur: string };
  topSurEstime?: { nom: string; delta: number; couleur: string };
}

export async function getMacroMetrics() {
  const [totalElections, totalInstituts, totalVagues, totalMesures] = await Promise.all([
    prisma.election.count(),
    prisma.institut.count(),
    prisma.sondageVague.count(),
    prisma.sondageMesure.count(),
  ]);

  const allPoints = await getAllStatPoints();
  const maeGlobal = calculateMAE(allPoints);
  const biaisGlobal = calculateSignedMean(allPoints);
  const pointsDansMarge = allPoints.filter((p) => p.dansMarge).length;
  const tauxDansMarge = allPoints.length > 0 ? Math.round((pointsDansMarge / allPoints.length) * 100) : 0;

  return {
    totalElections,
    totalInstituts,
    totalVagues,
    totalMesures,
    maeGlobal,
    biaisGlobal,
    tauxDansMarge,
    totalConfrontations: allPoints.length,
  };
}

export async function getAllStatPoints(filterType?: ScrutinType, filterSlug?: string): Promise<StatPoint[]> {
  const whereElection: any = {};
  if (filterType) whereElection.type = filterType;
  if (filterSlug) whereElection.slug = filterSlug;

  const vagues = await prisma.sondageVague.findMany({
    where: {
      election: whereElection,
    },
    include: {
      election: true,
      institut: true,
      mesures: {
        include: {
          candidat: {
            include: {
              resultats: true,
            },
          },
        },
      },
    },
    orderBy: { datePublication: "desc" },
  });

  const points: StatPoint[] = [];

  for (const v of vagues) {
    if (v.election.annee === 2027) continue; // 2027 has no real results yet
    for (const m of v.mesures) {
      // Find matching real result in this election
      const res = m.candidat.resultats.find((r) => r.electionId === v.electionId);
      if (res && (res.pourcentage > 0 || (res.sieges && res.sieges > 0))) {
        const delta = computeSignedError(res.pourcentage, m.intentionVotePct);
        const absDelta = Math.abs(delta);
        const statutMarge = classifyDelta(delta);
        const dansMarge = statutMarge === "DANS_MARGE";

        points.push({
          nom: m.candidat.nom,
          parti: m.candidat.parti,
          famille: m.candidat.famille,
          couleurHex: m.candidat.couleurHex,
          scoreSonde: m.intentionVotePct,
          scoreReel: res.pourcentage,
          delta,
          absDelta,
          dansMarge,
          statutMarge,
          institut: v.institut.nom,
          sondageCode: v.codeSondage || undefined,
          datePublication: v.datePublication.toISOString().split("T")[0],
          siegesMin: m.siegesMin,
          siegesMax: m.siegesMax,
          siegesReels: res.sieges,
          siegesDansFourchette: testSeatCoverage(res.sieges, m.siegesMin, m.siegesMax),
          electionSlug: v.election.slug,
          electionAnnee: v.election.annee,
          electionType: v.election.type,
        });
      }
    }
  }

  return points;
}

export async function getConsensusPointsByElection(electionSlug: string): Promise<StatPoint[]> {
  const election = await prisma.election.findUnique({
    where: { slug: electionSlug },
    include: {
      resultats: {
        include: { candidat: true },
        orderBy: { pourcentage: "desc" },
      },
      sondages: {
        where: { estDernierSondage: true },
        include: {
          mesures: true,
        },
      },
    },
  });

  if (!election) return [];

  // If no "estDernierSondage", take all polls for this election
  const pollWaves = election.sondages.length > 0
    ? election.sondages
    : await prisma.sondageVague.findMany({
        where: { electionId: election.id },
        include: { mesures: true },
      });

  const points: StatPoint[] = [];

  for (const res of election.resultats) {
    if (res.pourcentage <= 0 && (!res.sieges || res.sieges <= 0)) continue;

    // Collect all poll measures for this candidate
    const measures = pollWaves.flatMap((v) =>
      v.mesures.filter((m) => m.candidatId === res.candidatId)
    );

    if (measures.length === 0) continue;

    const avgSonde =
      Math.round(
        (measures.reduce((acc, m) => acc + m.intentionVotePct, 0) / measures.length) * 100
      ) / 100;

    const delta = computeSignedError(res.pourcentage, avgSonde);
    const absDelta = Math.abs(delta);
    const statutMarge = classifyDelta(delta);

    // Min and max seat estimates across waves if available
    const minSeats = measures.some((m) => m.siegesMin !== null)
      ? Math.min(...measures.map((m) => m.siegesMin ?? 999).filter((x) => x !== 999))
      : null;
    const maxSeats = measures.some((m) => m.siegesMax !== null)
      ? Math.max(...measures.map((m) => m.siegesMax ?? 0))
      : null;

    points.push({
      nom: res.candidat.nom,
      parti: res.candidat.parti,
      famille: res.candidat.famille,
      couleurHex: res.candidat.couleurHex,
      scoreSonde: avgSonde,
      scoreReel: res.pourcentage,
      delta,
      absDelta,
      dansMarge: statutMarge === "DANS_MARGE",
      statutMarge,
      siegesMin: minSeats,
      siegesMax: maxSeats,
      siegesReels: res.sieges,
      siegesDansFourchette: testSeatCoverage(res.sieges, minSeats, maxSeats),
      electionSlug: election.slug,
      electionAnnee: election.annee,
      electionType: election.type,
    });
  }

  return points.sort((a, b) => b.scoreReel - a.scoreReel);
}

export async function getElectionsList(type: ScrutinType): Promise<ElectionSummary[]> {
  const elections = await prisma.election.findMany({
    where: { type },
    orderBy: [{ annee: "desc" }, { tour: "desc" }],
    include: {
      sondages: true,
    },
  });

  const summaries: ElectionSummary[] = [];

  for (const el of elections) {
    const points = await getConsensusPointsByElection(el.slug);
    const mae = calculateMAE(points);

    // find top sous-estimé and sur-estimé
    const sous = [...points].sort((a, b) => b.delta - a.delta)[0];
    const sur = [...points].sort((a, b) => a.delta - b.delta)[0];

    summaries.push({
      id: el.id,
      slug: el.slug,
      type: el.type,
      annee: el.annee,
      tour: el.tour,
      dateScrutin: el.dateScrutin.toISOString().split("T")[0],
      tauxAbstention: el.tauxAbstention,
      totalVagues: el.sondages.length,
      mae,
      topSousEstime: sous && sous.delta > 0.5 ? { nom: sous.nom, delta: sous.delta, couleur: sous.couleurHex } : undefined,
      topSurEstime: sur && sur.delta < -0.5 ? { nom: sur.nom, delta: sur.delta, couleur: sur.couleurHex } : undefined,
    });
  }

  return summaries;
}

export async function getLeaderboardInstituts(): Promise<InstitutMetrics[]> {
  const instituts = await prisma.institut.findMany({
    include: {
      sondages: {
        include: {
          election: true,
          mesures: {
            include: {
              candidat: {
                include: {
                  resultats: true,
                },
              },
            },
          },
        },
      },
    },
  });

  const metricsList: InstitutMetrics[] = [];

  for (const inst of instituts) {
    const points: { scoreReel: number; scoreSonde: number; annee: number }[] = [];

    for (const v of inst.sondages) {
      if (v.election.annee === 2027) continue;
      for (const m of v.mesures) {
        const res = m.candidat.resultats.find((r) => r.electionId === v.electionId);
        if (res && res.pourcentage > 0) {
          points.push({
            scoreReel: res.pourcentage,
            scoreSonde: m.intentionVotePct,
            annee: v.election.annee,
          });
        }
      }
    }

    if (points.length === 0) continue;

    const mae = calculateMAE(points);
    const biaisMoyen = calculateSignedMean(points);
    const inMargin = points.filter((p) => Math.abs(p.scoreReel - p.scoreSonde) <= 1.5).length;
    const tauxDansMarge = Math.round((inMargin / points.length) * 100);

    // Sparkline of MAE by election year
    const years = Array.from(new Set(points.map((p) => p.annee))).sort((a, b) => a - b);
    const sparkline = years.map((annee) => {
      const yearPoints = points.filter((p) => p.annee === annee);
      return { annee, mae: calculateMAE(yearPoints) };
    });

    // Score de fiabilité: 100 - (mae * 15) clamped to 40..98
    const scoreFiabilite = Math.max(45, Math.min(99, Math.round(100 - mae * 14)));

    metricsList.push({
      id: inst.id,
      nom: inst.nom,
      mae,
      biaisMoyen,
      totalMesures: points.length,
      tauxDansMarge,
      rang: 0,
      scoreFiabilite,
      sparkline,
    });
  }

  // Sort by MAE ascending (lowest error first)
  metricsList.sort((a, b) => a.mae - b.mae);
  metricsList.forEach((m, idx) => {
    m.rang = idx + 1;
  });

  return metricsList;
}

export async function getProspectif2027Data() {
  const election2027 = await prisma.election.findUnique({
    where: { slug: "presi-2027-t1" },
    include: {
      sondages: {
        include: {
          institut: true,
          mesures: {
            include: {
              candidat: true,
            },
            orderBy: { intentionVotePct: "desc" },
          },
        },
        orderBy: { datePublication: "desc" },
      },
    },
  });

  return election2027;
}

export async function getLegislativesHemicycleData(annee = 2024) {
  const slug = `legis-${annee}-t2`;
  const election = await prisma.election.findFirst({
    where: {
      type: ScrutinType.LEGISLATIVE,
      annee,
      tour: 2,
    },
    include: {
      resultats: {
        include: { candidat: true },
      },
      sondages: {
        include: {
          mesures: {
            include: { candidat: true },
          },
        },
      },
    },
  });

  if (!election) return null;

  // Real assembly groups
  const realGroups = election.resultats
    .filter((r) => r.sieges && r.sieges > 0 && !r.candidat.nom.includes("Coalition"))
    .map((r) => ({
      nom: r.candidat.nom,
      parti: r.candidat.parti,
      famille: r.candidat.famille,
      couleurHex: r.candidat.couleurHex,
      sieges: r.sieges || 0,
      pct: r.pourcentage,
      statut: r.statut,
    }))
    .sort((a, b) => b.sieges - a.sieges);

  // Poll coalition projections
  const lastPoll = election.sondages[0];
  const predictedBlocs = (lastPoll ? lastPoll.mesures : [])
    .filter((m) => m.siegesMin !== null && m.siegesMax !== null)
    .map((m) => {
      const avgSieges = Math.round(((m.siegesMin || 0) + (m.siegesMax || 0)) / 2);
      return {
        nom: m.candidat.nom,
        parti: m.candidat.parti,
        famille: m.candidat.famille,
        couleurHex: m.candidat.couleurHex,
        siegesMin: m.siegesMin || 0,
        siegesMax: m.siegesMax || 0,
        siegesEstimes: avgSieges,
      };
    })
    .sort((a, b) => b.siegesEstimes - a.siegesEstimes);

  return {
    annee,
    election,
    realGroups,
    predictedBlocs,
    totalSieges: 577,
    seuilMajorite: 289,
  };
}
