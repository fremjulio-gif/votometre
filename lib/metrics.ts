export interface EcartQualification {
  libelle: string;
  sousTitre: string;
  badgeClass: string;
  texteClass: string;
  statut: "DANS_MARGE" | "SOUS_ESTIME" | "SUR_ESTIME";
}

/**
 * Traduit un écart numérique en langage humain et vulgarisé
 * @param ecart Écart signé (Score Réel - Score Sondé)
 */
export function qualifierEcart(ecart: number): EcartQualification {
  const abs = Math.abs(ecart);

  if (abs <= 1.5) {
    return {
      libelle: "Dans la marge habituelle",
      sousTitre: "Prévision réussie (±1,5 pt)",
      badgeClass: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
      texteClass: "text-slate-600 dark:text-slate-400",
      statut: "DANS_MARGE",
    };
  }

  if (ecart > 0) {
    return {
      libelle: `Sous-estimé (+${ecart.toFixed(1).replace(".", ",")} pt)`,
      sousTitre: "A fait mieux que prévu dans les urnes",
      badgeClass: "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/70 dark:text-emerald-300 dark:border-emerald-800",
      texteClass: "text-emerald-700 dark:text-emerald-400",
      statut: "SOUS_ESTIME",
    };
  }

  return {
    libelle: `Sur-estimé (${ecart.toFixed(1).replace(".", ",")} pt)`,
    sousTitre: "A fait moins bien que prévu dans les urnes",
    badgeClass: "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/70 dark:text-amber-300 dark:border-amber-800",
    texteClass: "text-amber-700 dark:text-amber-400",
    statut: "SUR_ESTIME",
  };
}

/**
 * Traduit une MAE (Mean Absolute Error) en libellé grand public
 */
export function formaterPrecisionMoyenne(mae: number): string {
  return `Marge d'erreur moyenne : ± ${mae.toFixed(1).replace(".", ",")} pt`;
}

/**
 * Analyse la tendance globale d'un institut (biais moyen)
 */
export function formaterTendanceInstitut(biais: number): {
  libelle: string;
  description: string;
} {
  const abs = Math.abs(biais);
  if (abs <= 0.25) {
    return {
      libelle: "Très équilibré",
      description: "Aucun biais systématique notable en 20 ans",
    };
  }
  if (biais > 0) {
    return {
      libelle: `Tendance à sous-estimer (+${biais.toFixed(1).replace(".", ",")} pt)`,
      description: "Les candidats font légèrement mieux que prévu dans les urnes",
    };
  }
  return {
    libelle: `Tendance à sur-estimer (${biais.toFixed(1).replace(".", ",")} pt)`,
    description: "Les intentions sondées ont tendance à dépasser le vote réel",
  };
}

export function formaterPct(val: number | null | undefined): string {
  if (val === null || val === undefined || isNaN(val)) return "—";
  return `${val.toFixed(1).replace(".", ",")} %`;
}

export function formaterPoints(val: number | null | undefined): string {
  if (val === null || val === undefined || isNaN(val)) return "—";
  const sign = val > 0 ? "+" : val < 0 ? "-" : "";
  return `${sign}${Math.abs(val).toFixed(1).replace(".", ",")} pt`;
}
