export interface PoliticalFamilyMeta {
  famille: string;
  couleurHex: string;
  badgeBg: string;
  badgeText: string;
  borderCol: string;
}

export const POLITICAL_FAMILIES: Record<string, PoliticalFamilyMeta> = {
  "Extrême gauche": {
    famille: "Extrême gauche",
    couleurHex: "#922B21",
    badgeBg: "bg-red-950/30",
    badgeText: "text-red-400",
    borderCol: "border-red-800",
  },
  "Gauche radicale": {
    famille: "Gauche radicale",
    couleurHex: "#C0392B",
    badgeBg: "bg-red-900/30",
    badgeText: "text-red-400",
    borderCol: "border-red-700",
  },
  "Parti communiste": {
    famille: "Parti communiste",
    couleurHex: "#CB4335",
    badgeBg: "bg-red-900/20",
    badgeText: "text-red-300",
    borderCol: "border-red-700",
  },
  "Union de la gauche": {
    famille: "Union de la gauche",
    couleurHex: "#C0392B",
    badgeBg: "bg-red-900/30",
    badgeText: "text-red-400",
    borderCol: "border-red-600",
  },
  "Gauche républicaine": {
    famille: "Gauche républicaine",
    couleurHex: "#E74C3C",
    badgeBg: "bg-rose-900/20",
    badgeText: "text-rose-400",
    borderCol: "border-rose-600",
  },
  "Écologiste": {
    famille: "Écologiste",
    couleurHex: "#27AE60",
    badgeBg: "bg-emerald-900/20",
    badgeText: "text-emerald-400",
    borderCol: "border-emerald-600",
  },
  "Bloc central": {
    famille: "Bloc central",
    couleurHex: "#F39C12",
    badgeBg: "bg-amber-900/20",
    badgeText: "text-amber-400",
    borderCol: "border-amber-600",
  },
  "Droite républicaine": {
    famille: "Droite républicaine",
    couleurHex: "#2980B9",
    badgeBg: "bg-blue-900/20",
    badgeText: "text-blue-400",
    borderCol: "border-blue-600",
  },
  "Reconquête": {
    famille: "Reconquête",
    couleurHex: "#8E44AD",
    badgeBg: "bg-purple-900/20",
    badgeText: "text-purple-400",
    borderCol: "border-purple-600",
  },
  "Rassemblement National": {
    famille: "Rassemblement National",
    couleurHex: "#1B4F72",
    badgeBg: "bg-slate-900/30",
    badgeText: "text-sky-400",
    borderCol: "border-sky-800",
  },
  "Souverainistes & Divers": {
    famille: "Souverainistes & Divers",
    couleurHex: "#7F8C8D",
    badgeBg: "bg-zinc-800/40",
    badgeText: "text-zinc-300",
    borderCol: "border-zinc-700",
  },
  "Autre": {
    famille: "Autre",
    couleurHex: "#7F8C8D",
    badgeBg: "bg-zinc-800/40",
    badgeText: "text-zinc-400",
    borderCol: "border-zinc-700",
  },
};

export function getFamilyMeta(famille?: string): PoliticalFamilyMeta {
  if (!famille || !POLITICAL_FAMILIES[famille]) {
    return POLITICAL_FAMILIES["Autre"];
  }
  return POLITICAL_FAMILIES[famille];
}
