export interface StatPoint {
  nom: string;
  parti: string;
  famille: string;
  couleurHex: string;
  scoreSonde: number;
  scoreReel: number;
  delta: number; // Signed error: Reel - Sonde
  absDelta: number;
  dansMarge: boolean;
  statutMarge: "SOUS_ESTIME" | "SUR_ESTIME" | "DANS_MARGE";
  institut?: string;
  sondageCode?: string;
  datePublication?: string;
  siegesMin?: number | null;
  siegesMax?: number | null;
  siegesReels?: number | null;
  siegesDansFourchette?: boolean | null;
  electionSlug?: string;
  electionAnnee?: number;
  electionType?: string;
}

export interface InstitutMetrics {
  id: string;
  nom: string;
  mae: number; // Mean Absolute Error
  biaisMoyen: number; // Signed Mean Error: > 0 = sous-estime, < 0 = sur-estime
  totalMesures: number;
  tauxDansMarge: number; // % within +/- 1.5 pts
  rang: number;
  scoreFiabilite: number; // 0 to 100 index
  sparkline: { annee: number; mae: number }[];
}

export function computeSignedError(scoreReel: number, scoreSonde: number): number {
  return Math.round((scoreReel - scoreSonde) * 100) / 100;
}

export function computeMargeDErreur(pct: number, echantillon = 1000, confidence = 1.96): number {
  const p = Math.max(0.01, Math.min(0.99, pct / 100));
  const moe = confidence * Math.sqrt((p * (1 - p)) / echantillon) * 100;
  return Math.round(moe * 100) / 100;
}

export function classifyDelta(delta: number, threshold = 1.5): "SOUS_ESTIME" | "SUR_ESTIME" | "DANS_MARGE" {
  if (delta > threshold) return "SOUS_ESTIME";
  if (delta < -threshold) return "SUR_ESTIME";
  return "DANS_MARGE";
}

export function calculateMAE(points: { scoreReel: number; scoreSonde: number }[]): number {
  if (!points || points.length === 0) return 0;
  const sum = points.reduce((acc, p) => acc + Math.abs(p.scoreReel - p.scoreSonde), 0);
  return Math.round((sum / points.length) * 100) / 100;
}

export function calculateSignedMean(points: { scoreReel: number; scoreSonde: number }[]): number {
  if (!points || points.length === 0) return 0;
  const sum = points.reduce((acc, p) => acc + (p.scoreReel - p.scoreSonde), 0);
  return Math.round((sum / points.length) * 100) / 100;
}

export function testSeatCoverage(siegesReels: number | null, min: number | null, max: number | null): boolean | null {
  if (siegesReels === null || min === null || max === null) return null;
  return siegesReels >= min && siegesReels <= max;
}

export const HISTORICAL_SHOCKS = [
  {
    titre: "Séisme du 21 avril 2002",
    annee: 2002,
    scrutin: "Présidentielle (1er tour)",
    candidat: "Jean-Marie Le Pen (FN)",
    scoreSonde: 13.0,
    scoreReel: 16.86,
    delta: +3.86,
    impact: "Sous-estimation majeure du vote contestataire entraînant l'élimination de Lionel Jospin au 1er tour.",
    type: "SOUS_ESTIMATION",
    badge: "Séisme politique",
  },
  {
    titre: "Le 'mirage' de la vague LREM en 2017",
    annee: 2017,
    scrutin: "Législatives (Projection sièges)",
    candidat: "La République en Marche (LREM - MoDem)",
    scoreSonde: 455, // projected seats average
    scoreReel: 350,
    delta: -105,
    impact: "Sur-estimation spectaculaire de 105 sièges de la majorité présidentielle due à une participation historiquement basse.",
    type: "SUR_ESTIMATION",
    badge: "Sur-estimation sièges",
  },
  {
    titre: "Dissolution 2024 : L'échec du 'Raz-de-marée' RN",
    annee: 2024,
    scrutin: "Législatives (2nd tour)",
    candidat: "Rassemblement National et alliés (RN - RAD)",
    scoreSonde: 190, // average projection
    scoreReel: 142,
    delta: -48,
    impact: "Sur-estimation de 48 sièges du bloc RN/Ciotti face au front républicain et aux désistements massifs.",
    type: "SUR_ESTIMATION",
    badge: "Sur-estimation RN",
  },
  {
    titre: "Dissolution 2024 : La surprise du Nouveau Front Populaire",
    annee: 2024,
    scrutin: "Législatives (2nd tour)",
    candidat: "Nouveau Front Populaire (NFP)",
    scoreSonde: 160,
    scoreReel: 193,
    delta: +33,
    impact: "Le NFP dépasse le plafond haut des fourchettes sondeurs (+18 sièges au-delà du max sondé) et devient 1er bloc.",
    type: "SOUS_ESTIMATION",
    badge: "Percée inattendue",
  },
  {
    titre: "Présidentielle 2022 : La dynamique Mélenchon",
    annee: 2022,
    scrutin: "Présidentielle (1er tour)",
    candidat: "Jean-Luc Mélenchon (LFI)",
    scoreSonde: 17.5,
    scoreReel: 21.95,
    delta: +4.45,
    impact: "Vote utile massif de dernière minute sous-estimé de 4,45 points par les instituts à la veille du scrutin.",
    type: "SOUS_ESTIMATION",
    badge: "Vote utile express",
  },
];
