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
import dataCache from "./data-cache.json";

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
  try {
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
  } catch (error) {
    console.warn("Using fallback cache for getMacroMetrics:", error);
    return dataCache.macro;
  }
}

export async function getAllStatPoints(filterType?: ScrutinType, filterSlug?: string): Promise<StatPoint[]> {
  try {
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
      if (v.election.annee === 2027) continue;
      for (const m of v.mesures) {
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

    if (points.length === 0 && dataCache.allPoints) {
      return (dataCache.allPoints as StatPoint[]).filter((p) => {
        if (filterType && p.electionType !== filterType) return false;
        if (filterSlug && p.electionSlug !== filterSlug) return false;
        return true;
      });
    }

    return points;
  } catch (error) {
    console.warn("Using fallback cache for getAllStatPoints:", error);
    return (dataCache.allPoints as StatPoint[]).filter((p) => {
      if (filterType && p.electionType !== filterType) return false;
      if (filterSlug && p.electionSlug !== filterSlug) return false;
      return true;
    });
  }
}

export async function getConsensusPointsByElection(electionSlug: string): Promise<StatPoint[]> {
  try {
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

    if (!election) {
      const cached = (dataCache.consensusMap as Record<string, StatPoint[]>)[electionSlug];
      return cached || [];
    }

    const pollWaves =
      election.sondages.length > 0
        ? election.sondages
        : await prisma.sondageVague.findMany({
            where: { electionId: election.id },
            include: { mesures: true },
          });

    const points: StatPoint[] = [];

    for (const res of election.resultats) {
      if (res.pourcentage <= 0 && (!res.sieges || res.sieges <= 0)) continue;

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

    if (points.length === 0 && (dataCache.consensusMap as Record<string, StatPoint[]>)[electionSlug]) {
      return (dataCache.consensusMap as Record<string, StatPoint[]>)[electionSlug];
    }

    return points.sort((a, b) => b.scoreReel - a.scoreReel);
  } catch (error) {
    console.warn(`Using fallback cache for getConsensusPointsByElection(${electionSlug}):`, error);
    const cached = (dataCache.consensusMap as Record<string, StatPoint[]>)[electionSlug];
    return cached || [];
  }
}

export async function getElectionsList(type: ScrutinType): Promise<ElectionSummary[]> {
  try {
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
  } catch (error) {
    console.warn(`Using fallback cache for getElectionsList(${type}):`, error);
    const cachedElections = (dataCache.elections as any[]).filter((e) => e.type === type);
    return cachedElections.map((el) => ({
      id: el.id,
      slug: el.slug,
      type: el.type,
      annee: el.annee,
      tour: el.tour,
      dateScrutin: el.dateScrutin ? el.dateScrutin.split("T")[0] : `${el.annee}-05-01`,
      tauxAbstention: el.tauxAbstention,
      totalVagues: 5,
      mae: 1.2,
    }));
  }
}

export async function getLeaderboardInstituts(): Promise<InstitutMetrics[]> {
  try {
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

      const years = Array.from(new Set(points.map((p) => p.annee))).sort((a, b) => a - b);
      const sparkline = years.map((annee) => {
        const yearPoints = points.filter((p) => p.annee === annee);
        return { annee, mae: calculateMAE(yearPoints) };
      });

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

    if (metricsList.length === 0 && dataCache.instituts) {
      return dataCache.instituts as InstitutMetrics[];
    }

    metricsList.sort((a, b) => a.mae - b.mae);
    metricsList.forEach((m, idx) => {
      m.rang = idx + 1;
    });

    return metricsList;
  } catch (error) {
    console.warn("Using fallback cache for getLeaderboardInstituts:", error);
    return dataCache.instituts as InstitutMetrics[];
  }
}

export async function getProspectif2027Data() {
  try {
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

    if (!election2027 && dataCache.prospectif) {
      return dataCache.prospectif as any;
    }

    return election2027;
  } catch (error) {
    console.warn("Using fallback cache for getProspectif2027Data:", error);
    return dataCache.prospectif as any;
  }
}

export async function getLegislativesHemicycleData(annee = 2024) {
  try {
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

    if (!election) {
      return (dataCache.hemicycleMap as Record<number, any>)[annee] || null;
    }

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
  } catch (error) {
    console.warn(`Using fallback cache for getLegislativesHemicycleData(${annee}):`, error);
    return (dataCache.hemicycleMap as Record<number, any>)[annee] || null;
  }
}

// ==========================================
// MUNICIPALES 2026 DATA & TYPES
// ==========================================

export interface MunicipaleParticipation {
  tour1: {
    inscrits: number;
    votants: number;
    tauxVotants: number;
    abstentions: number;
    tauxAbstention: number;
    exprimes: number;
    blancs: number;
    nuls: number;
  };
  tour2: {
    inscrits: number;
    votants: number;
    tauxVotants: number;
    abstentions: number;
    tauxAbstention: number;
    exprimes: number;
    blancs: number;
    nuls: number;
  };
  horaires: Array<{
    horaire: string;
    t1_2026: number;
    t2_2026: number;
    t1_2020: number;
    t2_2020: number;
    ecart_t1: number;
    ecart_t2: number;
  }>;
}

export interface MunicipaleEnjeu {
  thematique: string;
  institut: string;
  importance: number;
  commentaire: string;
}

export interface MunicipaleWitnessCandidate {
  nom: string;
  parti: string;
  nuance: string;
  sondagePct: number;
  reelPct: number;
  delta: number;
  absDelta: number;
  couleurHex: string;
  statutMarge: "SOUS_ESTIME" | "SUR_ESTIME" | "DANS_MARGE";
}

export interface MunicipaleWitnessCity {
  id: string;
  ville: string;
  tour: number;
  label: string;
  candidates: MunicipaleWitnessCandidate[];
}

export interface MunicipaleVille100k {
  commune: string;
  departement: string;
  maireSortant: string;
  partiSortant: string;
  maireElu: string;
  partiElu: string;
  evolution: string;
  categorie: "maintien" | "gauche" | "droite" | "centre" | "rn" | "autre";
  scoreVainqueur: string;
  detail: string;
}

export interface MunicipaleNuance {
  nuance: string;
  sigle: string;
  pctT1: number;
  voixT1: number;
  siegesT1: number;
  villesT1: number;
  pctT2: number;
  voixT2: number;
  siegesT2: number;
  villesT2: number;
  totalSieges: number;
  totalVilles: number;
  couleurHex: string;
}

export interface MunicipalesData {
  participation: MunicipaleParticipation;
  enjeux: MunicipaleEnjeu[];
  witnessCities: MunicipaleWitnessCity[];
  villes100k: MunicipaleVille100k[];
  nuances: MunicipaleNuance[];
}

function resolveNuanceColor(nuance: string): string {
  const n = nuance.toUpperCase();
  if (n.includes("PS") || n.includes("SOC") || n.includes("UG") || n.includes("GAUCHE") || n.includes("DVG")) {
    if (n.includes("LFI") || n.includes("FI")) return "#991B1B";
    if (n.includes("PCF") || n.includes("COM")) return "#DC2626";
    return "#E11D48";
  }
  if (n.includes("LÉ") || n.includes("VEC") || n.includes("ECO")) return "#059669";
  if (n.includes("HOR")) return "#0284C7";
  if (n.includes("MODEM") || n.includes("MDM")) return "#D97706";
  if (n.includes("DVC") || n.includes("CENTRE") || n.includes("UC") || n.includes("RE")) return "#F59E0B";
  if (n.includes("RN") || n.includes("EXD") || n.includes("UXD")) return "#1E293B";
  if (n.includes("REC")) return "#7E22CE";
  if (n.includes("LR") || n.includes("DVD") || n.includes("UD") || n.includes("DROITE")) return "#2563EB";
  if (n.includes("UDI")) return "#0EA5E9";
  return "#64748B";
}

export async function getMunicipales2026Data(): Promise<MunicipalesData> {
  if ((dataCache as any)?.municipales) {
    return (dataCache as any).municipales;
  }

  try {
    const fs = await import("fs");
    const path = await import("path");
    const xlsxMod = await import("xlsx");
    const XLSX = (xlsxMod as any).default || xlsxMod;

    const filePath = path.join(process.cwd(), "data", "resultats_municipales_2026.xlsx");
    if (!fs.existsSync(filePath)) {
      throw new Error("No municipals data file available");
    }

    const wb = XLSX.readFile(filePath);

    // 1. Synthese Participation
    const participation: MunicipaleParticipation = {
      tour1: {
        inscrits: 48474213,
        votants: 27678488,
        tauxVotants: 57.10,
        abstentions: 20795725,
        tauxAbstention: 42.90,
        exprimes: 26182365,
        blancs: 734805,
        nuls: 761318,
      },
      tour2: {
        inscrits: 16879356,
        votants: 9625762,
        tauxVotants: 57.03,
        abstentions: 7253594,
        tauxAbstention: 42.97,
        exprimes: 9391407,
        blancs: 139617,
        nuls: 94738,
      },
      horaires: [
        { horaire: "12h00", t1_2026: 19.37, t2_2026: 20.33, t1_2020: 18.38, t2_2020: 15.29, ecart_t1: +0.99, ecart_t2: +5.04 },
        { horaire: "17h00", t1_2026: 48.90, t2_2026: 48.10, t1_2020: 38.77, t2_2020: 34.67, ecart_t1: +10.13, ecart_t2: +13.43 },
        { horaire: "Final (20h)", t1_2026: 57.10, t2_2026: 57.03, t1_2020: 44.66, t2_2020: 41.86, ecart_t1: +12.44, ecart_t2: +15.17 },
      ],
    };

    // 2. Enjeux du vote
    const enjeuxSheet: any[] = XLSX.utils.sheet_to_json(wb.Sheets["Enjeux_Sondages_2026"], { range: 4 });
    const enjeux: MunicipaleEnjeu[] = enjeuxSheet.slice(0, 4).map((r) => ({
      thematique: String(r["Thématique d'enjeu"] || ""),
      institut: String(r["Institut de sondage"] || ""),
      importance: Math.round(Number(r["Niveau d'importance mesuré"]) * 100),
      commentaire: String(r["Commentaire analytique"] || ""),
    }));

    // 3. Nuances Nationales
    const nuancesRaw: any[] = XLSX.utils.sheet_to_json(wb.Sheets["Resultats_Nuances_National"], { range: 3 });
    const nuances: MunicipaleNuance[] = nuancesRaw
      .filter((r) => r["Nuance Politique"] && !String(r["Nuance Politique"]).includes("TOTAL"))
      .map((r) => {
        const sigle = String(r["Sigle"] || "DIV");
        const pctT1 = r["% Exprimés T1"] ? Math.round(Number(r["% Exprimés T1"]) * 10000) / 100 : 0;
        const pctT2 = r["% Exprimés T2"] ? Math.round(Number(r["% Exprimés T2"]) * 10000) / 100 : 0;
        const voixT1 = r["Voix T1"] ? Number(r["Voix T1"]) : 0;
        const voixT2 = r["Voix T2"] ? Number(r["Voix T2"]) : 0;
        const siegesT1 = r["Sièges T1"] ? Number(r["Sièges T1"]) : 0;
        const siegesT2 = r["Sièges T2"] ? Number(r["Sièges T2"]) : 0;
        const villesT1 = r["Villes Gagnées T1"] ? Number(r["Villes Gagnées T1"]) : 0;
        const villesT2 = r["Villes Gagnées T2"] ? Number(r["Villes Gagnées T2"]) : 0;
        return {
          nuance: String(r["Nuance Politique"]),
          sigle,
          pctT1,
          voixT1,
          siegesT1,
          villesT1,
          pctT2,
          voixT2,
          siegesT2,
          villesT2,
          totalSieges: siegesT1 + siegesT2,
          totalVilles: villesT1 + villesT2,
          couleurHex: resolveNuanceColor(sigle),
        };
      })
      .sort((a, b) => (b.pctT1 + b.pctT2) - (a.pctT1 + a.pctT2));

    // 4. 42 Métropoles (+100k hab)
    const villesRaw: any[] = XLSX.utils.sheet_to_json(wb.Sheets["Grandes_Villes_100k"], { range: 3 });
    const villes100k: MunicipaleVille100k[] = villesRaw.map((r) => {
      const evo = String(r["Évolution Politique"] || "Maintien");
      let cat: MunicipaleVille100k["categorie"] = "autre";
      const evoLower = evo.toLowerCase();
      if (evoLower.includes("maintien")) cat = "maintien";
      else if (evoLower.includes("gauche") || evoLower.includes("ps") || evoLower.includes("lfi") || evoLower.includes("écologiste")) cat = "gauche";
      else if (evoLower.includes("droite") && !evoLower.includes("nationale")) cat = "droite";
      else if (evoLower.includes("centre") || evoLower.includes("majorité pres.")) cat = "centre";
      else if (evoLower.includes("rn") || evoLower.includes("nationale")) cat = "rn";

      return {
        commune: String(r["Commune"]),
        departement: String(r["Département"] || ""),
        maireSortant: String(r["Maire Sortant(e)"] || ""),
        partiSortant: String(r["Parti Sortant"] || ""),
        maireElu: String(r["Maire Élu(e) 2026"] || ""),
        partiElu: String(r["Parti Élu 2026"] || ""),
        evolution: evo,
        categorie: cat,
        scoreVainqueur: String(r["Score Vainqueur"] || "-"),
        detail: String(r["Détail / Configuration de Vote"] || ""),
      };
    });

    // 5. Métropoles témoins (Sondage vs Réel)
    const witnessRaw: any[] = XLSX.utils.sheet_to_json(wb.Sheets["Enjeux_Sondages_2026"], { range: 12 });
    const cityGroupMap = new Map<string, MunicipaleWitnessCity>();

    for (const w of witnessRaw) {
      const ville = String(w["Ville"]);
      const tourStr = String(w["Tour"] || "1er tour");
      const tour = tourStr.includes("2") ? 2 : 1;
      const key = `${ville}-t${tour}`;

      if (!cityGroupMap.has(key)) {
        cityGroupMap.set(key, {
          id: key,
          ville,
          tour,
          label: `${ville} (${tour === 1 ? "1er tour" : "2nd tour"})`,
          candidates: [],
        });
      }

      const sondage = Math.round(Number(w["Estimation Sondeur"]) * 1000) / 10;
      const reel = Math.round(Number(w["Résultat Proclamé"]) * 1000) / 10;
      const delta = Math.round((reel - sondage) * 10) / 10;
      const absDelta = Math.abs(delta);
      const nuance = String(w["Nuance"] || "DIV");

      let statutMarge: MunicipaleWitnessCandidate["statutMarge"] = "DANS_MARGE";
      if (absDelta > 2.0) {
        statutMarge = delta > 0 ? "SOUS_ESTIME" : "SUR_ESTIME";
      }

      cityGroupMap.get(key)!.candidates.push({
        nom: String(w["Candidat / Tête de liste"]),
        parti: nuance,
        nuance,
        sondagePct: sondage,
        reelPct: reel,
        delta,
        absDelta,
        couleurHex: resolveNuanceColor(nuance),
        statutMarge,
      });
    }

    const witnessCities = Array.from(cityGroupMap.values());

    return {
      participation,
      enjeux,
      witnessCities,
      villes100k,
      nuances,
    };
  } catch (error) {
    console.warn("Using fallback cache for getMunicipales2026Data:", error);
    if ((dataCache as any).municipales) {
      return (dataCache as any).municipales;
    }
    throw error;
  }
}

// ==========================================
// SOCIOLOGIE DU VOTE & ABSTENTION DATA & TYPES
// ==========================================

export interface ParticipationHistoryRow {
  scrutin: string;
  annee: number;
  tour: number;
  date: string;
  inscrits: number;
  votants: number;
  tauxParticipation: number;
  abstentionnistes: number;
  tauxAbstention: number;
  votesBlancs: number;
  votesNuls: number;
  blancsNulsTotal: number;
  partBlancsNulsVotants: number;
  exprimes: number;
}

export interface TypologieInseeEvolution {
  annee: number;
  voteSystematique: number;
  voteIntermittent: number;
  abstentionSystematique: number;
}

export interface TypologieInseeDetail {
  comportement: string;
  part2002: number;
  part2022: number;
  ecart: number;
}

export interface FractureAgeRow {
  trancheAge: string;
  indicateur: string;
  val2002: number;
  val2007: number;
  val2012: number;
  val2017: number;
  val2022: number;
}

export interface FractureDiplomeRow {
  diplome: string;
  indicateur: string;
  val2002: number;
  val2012: number;
  val2017: number;
  val2022: number;
}

export interface ProfilIpsosRow {
  categorie: string;
  sousGroupe: string;
  votantsPct: number;
  abstentionPct: number;
}

export interface MalInscriptionVolume {
  indicateur: string;
  source: string;
  annee: number;
  volume: number;
  partPct: number;
  commentaire: string;
}

export interface MalInscriptionAge {
  trancheAge: string;
  tauxPct: number;
  source: string;
  impact: string;
}

export interface ProcurationInegalite {
  groupe: string;
  tauxPct: number;
  source: string;
  rapport: string;
}

export interface SociologieAbstentionData {
  participationHistory: ParticipationHistoryRow[];
  typologie: {
    evolution: TypologieInseeEvolution[];
    details: TypologieInseeDetail[];
  };
  fractures: {
    ages: FractureAgeRow[];
    diplomes: FractureDiplomeRow[];
  };
  profilIpsos: ProfilIpsosRow[];
  malInscription: {
    volumes: MalInscriptionVolume[];
    parAge: MalInscriptionAge[];
    procurations: ProcurationInegalite[];
  };
}

export async function getSociologieAbstentionData(): Promise<SociologieAbstentionData> {
  if ((dataCache as any)?.abstention) {
    return (dataCache as any).abstention;
  }

  try {
    const fs = await import("fs");
    const path = await import("path");
    const xlsxMod = await import("xlsx");
    const XLSX = (xlsxMod as any).default || xlsxMod;

    const filePath = path.join(process.cwd(), "data", "statistiques_participation_abstention.xlsx");
    if (!fs.existsSync(filePath)) {
      throw new Error("No participation statistics file available");
    }

    const wb = XLSX.readFile(filePath);

    // 1. History
    const partRaw: any[] = XLSX.utils.sheet_to_json(wb.Sheets["Evolution_Participation"], { range: 3 });
    const participationHistory: ParticipationHistoryRow[] = partRaw.map((r) => {
      const inscrits = Number(r["Inscrits"] || 0);
      const votants = Number(r["Votants"] || 0);
      const exprimes = Number(r["Suffrages Exprimés"] || 0);
      const blancs = Number(r["Votes Blancs"] || 0);
      const nuls = Number(r["Votes Nuls"] || 0);
      const blancsNuls = blancs + nuls;
      return {
        scrutin: String(r["Scrutin"]),
        annee: Number(r["Année"]),
        tour: Number(r["Tour"]),
        date: String(r["Date"] || ""),
        inscrits,
        votants,
        tauxParticipation: inscrits > 0 ? Math.round((votants / inscrits) * 1000) / 10 : 0,
        abstentionnistes: inscrits - votants,
        tauxAbstention: inscrits > 0 ? Math.round(((inscrits - votants) / inscrits) * 1000) / 10 : 0,
        votesBlancs: blancs,
        votesNuls: nuls,
        blancsNulsTotal: blancsNuls,
        partBlancsNulsVotants: votants > 0 ? Math.round((blancsNuls / votants) * 1000) / 10 : 0,
        exprimes,
      };
    });

    // 2. Typologie
    const typologieRaw: any[] = XLSX.utils.sheet_to_json(wb.Sheets["Typologie_Vote_Insee"], { range: 4 });
    const typologieEvolution: TypologieInseeEvolution[] = typologieRaw.slice(0, 5).map((r) => ({
      annee: Number(r["Année Électorale"]),
      voteSystematique: Math.round(Number(r["Vote Systématique (%)"]) * 1000) / 10,
      voteIntermittent: Math.round(Number(r["Vote Intermittent (%)"]) * 1000) / 10,
      abstentionSystematique: Math.round(Number(r["Abstention Systématique (%)"]) * 1000) / 10,
    }));

    const detailsRaw: any[] = XLSX.utils.sheet_to_json(wb.Sheets["Typologie_Vote_Insee"], { range: 13 });
    const typologieDetails: TypologieInseeDetail[] = detailsRaw.slice(0, 7).map((r) => ({
      comportement: String(r["Comportement Électoral Détaillé"]),
      part2002: Math.round(Number(r["2002"]) * 1000) / 10,
      part2022: Math.round(Number(r["2022"]) * 1000) / 10,
      ecart: Math.round((Number(r["2022"]) - Number(r["2002"])) * 1000) / 10,
    }));

    // 3. Fractures
    const ageRaw: any[] = XLSX.utils.sheet_to_json(wb.Sheets["Sociologie_Age_Diplome"], { range: 4 });
    const fractureAges: FractureAgeRow[] = ageRaw
      .filter((r) => r["Tranche d'Âge"] && r["Indicateur Électoral"])
      .map((r) => ({
        trancheAge: String(r["Tranche d'Âge"]),
        indicateur: String(r["Indicateur Électoral"]),
        val2002: Math.round(Number(r["2002"] || 0) * 1000) / 10,
        val2007: Math.round(Number(r["2007"] || 0) * 1000) / 10,
        val2012: Math.round(Number(r["2012"] || 0) * 1000) / 10,
        val2017: Math.round(Number(r["2017"] || 0) * 1000) / 10,
        val2022: Math.round(Number(r["2022"] || 0) * 1000) / 10,
      }));

    const diplomeRaw: any[] = XLSX.utils.sheet_to_json(wb.Sheets["Sociologie_Age_Diplome"], { range: 27 });
    const fractureDiplomes: FractureDiplomeRow[] = diplomeRaw
      .filter((r) => r["Niveau de Diplôme"] && r["Indicateur"])
      .map((r) => ({
        diplome: String(r["Niveau de Diplôme"]),
        indicateur: String(r["Indicateur"]),
        val2002: Math.round(Number(r["2002"] || 0) * 1000) / 10,
        val2012: Math.round(Number(r["2012"] || 0) * 1000) / 10,
        val2017: Math.round(Number(r["2017"] || 0) * 1000) / 10,
        val2022: Math.round(Number(r["2022"] || 0) * 1000) / 10,
      }));

    // 4. Ipsos
    const ipsosRaw: any[] = XLSX.utils.sheet_to_json(wb.Sheets["Profil_Abstention_Ipsos"], { range: 3 });
    const profilIpsos: ProfilIpsosRow[] = ipsosRaw
      .filter((r) => r["Catégorie Sociologique"] && r["Sous-Groupe"] && r["Abstentionnistes (%)"] !== undefined)
      .map((r) => ({
        categorie: String(r["Catégorie Sociologique"]),
        sousGroupe: String(r["Sous-Groupe"]),
        votantsPct: Math.round(Number(r["Votants (%)"] || 0) * 1000) / 10,
        abstentionPct: Math.round(Number(r["Abstentionnistes (%)"] || 0) * 1000) / 10,
      }));

    // 5. Mal inscription
    const miVolRaw: any[] = XLSX.utils.sheet_to_json(wb.Sheets["Mal_Inscription"], { range: 4 }).slice(0, 4);
    const miAgeRaw: any[] = XLSX.utils.sheet_to_json(wb.Sheets["Mal_Inscription"], { range: 12 }).slice(0, 3);
    const miProcRaw: any[] = XLSX.utils.sheet_to_json(wb.Sheets["Mal_Inscription"], { range: 19 }).slice(0, 4);

    const malInscription = {
      volumes: miVolRaw.map((r) => ({
        indicateur: String(r["Indicateur"]),
        source: String(r["Source Institutionnelle"]),
        annee: Number(r["Année de Mesure"]),
        volume: Number(r["Volume Estimé (Nombre de Citoyens)"]),
        partPct: Math.round(Number(r["Part du Corps Électoral / Inscrits (%)"] || 0) * 1000) / 10,
        commentaire: String(r["Commentaire & Portée Démocratique"] || ""),
      })),
      parAge: miAgeRaw.map((r) => ({
        trancheAge: String(r["Tranche d'Âge"]),
        tauxPct: Math.round(Number(r["Taux de Mal-inscription (%)"] || 0) * 1000) / 10,
        source: String(r["Source Électorale"] || ""),
        impact: String(r["Impact sur la Participation"] || ""),
      })),
      procurations: miProcRaw.map((r) => ({
        groupe: String(r["Groupe Social / Revenu"]),
        tauxPct: Math.round(Number(r["Taux de Vote par Procuration (%)"] || 0) * 1000) / 10,
        source: String(r["Source & Auteur"] || ""),
        rapport: String(r["Rapport d'Inégalité"] || ""),
      })),
    };

    return {
      participationHistory,
      typologie: {
        evolution: typologieEvolution,
        details: typologieDetails,
      },
      fractures: {
        ages: fractureAges,
        diplomes: fractureDiplomes,
      },
      profilIpsos,
      malInscription,
    };
  } catch (error) {
    console.warn("Using fallback cache for getSociologieAbstentionData:", error);
    if ((dataCache as any).abstention) {
      return (dataCache as any).abstention;
    }
    throw error;
  }
}
