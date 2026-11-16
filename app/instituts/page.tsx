import { getLeaderboardInstituts } from "@/lib/data";
import { LeaderboardPodium } from "@/components/dataviz/LeaderboardPodium";
import { Award, ShieldCheck, HelpCircle, Activity, Info, BarChart2 } from "lucide-react";

export const revalidate = 3600;

export const metadata = {
  title: "Leaderboard des Instituts de Sondage — Le Votomètre",
  description:
    "Classement scientifique et audit de fiabilité des 12 grands sondeurs en France (Ipsos, Ifop, Elabe, Harris, BVA, OpinionWay, etc.). Calcul de la MAE et des biais systématiques de 2002 à 2024.",
};

export default async function InstitutsPage() {
  const instituts = await getLeaderboardInstituts();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-zinc-800">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-950/80 text-amber-300 text-xs font-semibold mb-2 border border-amber-700/60">
            <Award className="w-3.5 h-3.5" />
            <span>Audit Indépendant des Sondeurs</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Le Leaderboard de Précision des Instituts
          </h1>
          <p className="text-sm text-zinc-400 mt-1 max-w-2xl">
            Qui prédit le mieux les élections en France ? Classement sans concession des sondeurs selon l'Erreur Absolue Moyenne (MAE) sur les scrutins présidentiels, législatifs et européens depuis 2002.
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs bg-zinc-900 p-3 rounded-2xl border border-zinc-800">
          <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-zinc-300">
            Audit purement statistique sans sponsor ni affiliation
          </span>
        </div>
      </div>

      {/* Main Leaderboard & Podium Component */}
      <LeaderboardPodium instituts={instituts} />

      {/* Explanatory Cards on Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
        <div className="glass-panel p-6 rounded-2xl border border-zinc-800 space-y-2">
          <div className="w-9 h-9 rounded-xl bg-indigo-950 text-indigo-400 flex items-center justify-center mb-3">
            <Activity className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-white text-sm">
            Erreur Absolue Moyenne (MAE)
          </h4>
          <p className="text-xs text-zinc-400 leading-relaxed">
            La MAE mesure l'écart arithmétique absolu moyen entre les intentions publiées par l'institut et le vote officiel proclamé. Plus cette valeur est faible, plus l'institut colle à la réalité.
          </p>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-zinc-800 space-y-2">
          <div className="w-9 h-9 rounded-xl bg-emerald-950 text-emerald-400 flex items-center justify-center mb-3">
            <BarChart2 className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-white text-sm">
            Indicateur de Biais Systématique
          </h4>
          <p className="text-xs text-zinc-400 leading-relaxed">
            La moyenne signée des écarts indique si l'institut a une tendance répétée à sur-estimer ou sous-estimer les dynamiques électorales. Un biais proche de 0,0 pt traduit une neutralité statistique exemplaire.
          </p>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-zinc-800 space-y-2">
          <div className="w-9 h-9 rounded-xl bg-amber-950 text-amber-400 flex items-center justify-center mb-3">
            <Info className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-white text-sm">
            Taux dans la Marge de Confiance
          </h4>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Proportion de mesures tombées dans la fourchette de tolérance de ±1,5 point de pourcentage (seuil de confiance statistique usuel de 95% pour des échantillons de 1 000 personnes).
          </p>
        </div>
      </div>
    </div>
  );
}
