import Link from "next/link";
import {
  getMacroMetrics,
  getAllStatPoints,
  getLeaderboardInstituts,
} from "@/lib/data";
import { HISTORICAL_SHOCKS } from "@/lib/stats";
import { ScatterTruth } from "@/components/dataviz/ScatterTruth";
import { DivergingShockBar } from "@/components/dataviz/DivergingShockBar";
import { LeaderboardPodium } from "@/components/dataviz/LeaderboardPodium";
import {
  Activity,
  ArrowRight,
  Award,
  BarChart3,
  CheckCircle2,
  Compass,
  Landmark,
  ShieldCheck,
  Sparkles,
  Vote,
  Zap,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [macro, allPoints, instituts] = await Promise.all([
    getMacroMetrics(),
    getAllStatPoints(),
    getLeaderboardInstituts(),
  ]);

  return (
    <div className="space-y-16 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-16 border-b border-zinc-800/60 bg-gradient-to-b from-indigo-950/20 via-zinc-950 to-zinc-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col items-center text-center max-w-3xl mx-auto space-y-5">
            {/* Tag / Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-950/80 border border-indigo-700/60 text-indigo-300 text-xs font-semibold shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Observatoire Citoyen & Analytique des Élections Françaises</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
              Les sondages face au{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-indigo-400 to-amber-300">
                verdict des urnes
              </span>
            </h1>

            {/* Subhead */}
            <p className="text-base sm:text-lg text-zinc-300 leading-relaxed max-w-2xl">
              Depuis 20 ans, nous confrontons systématiquement les dernières enquêtes d'opinion aux résultats officiels proclamés.
              Mesure scientifique des marges d'erreur, biais systématiques et surprises électorales (2002–2024 & prospective 2027).
            </p>

            {/* CTA Navigation buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
              <Link
                href="/presidentielles"
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-all shadow-lg shadow-indigo-600/20 flex items-center gap-2 group"
              >
                <Vote className="w-4 h-4" />
                <span>Explorer les Présidentielles</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/legislatives"
                className="px-5 py-2.5 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 text-zinc-200 hover:text-white font-semibold text-sm transition-all border border-zinc-700 flex items-center gap-2"
              >
                <Landmark className="w-4 h-4 text-amber-400" />
                <span>Hémicycle des Législatives</span>
              </Link>
              <Link
                href="/instituts"
                className="px-5 py-2.5 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 text-zinc-200 hover:text-white font-semibold text-sm transition-all border border-zinc-700 flex items-center gap-2"
              >
                <Award className="w-4 h-4 text-yellow-400" />
                <span>Podium des Sondeurs</span>
              </Link>
            </div>
          </div>

          {/* Macro KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-14">
            {/* Card 1 */}
            <div className="glass-panel p-5 rounded-2xl border border-zinc-800 flex flex-col items-center text-center">
              <div className="w-9 h-9 rounded-xl bg-indigo-950 text-indigo-400 flex items-center justify-center mb-2 border border-indigo-800/40">
                <BarChart3 className="w-5 h-5" />
              </div>
              <span className="text-3xl font-extrabold text-white font-mono">
                {macro.totalConfrontations}
              </span>
              <span className="text-xs text-zinc-400 font-medium mt-1">
                Confrontations Sondages vs Urnes
              </span>
            </div>

            {/* Card 2 */}
            <div className="glass-panel p-5 rounded-2xl border border-zinc-800 flex flex-col items-center text-center">
              <div className="w-9 h-9 rounded-xl bg-amber-950 text-amber-400 flex items-center justify-center mb-2 border border-amber-800/40">
                <Activity className="w-5 h-5" />
              </div>
              <span className="text-3xl font-extrabold text-white font-mono">
                {macro.maeGlobal.toFixed(2)}{" "}
                <span className="text-sm font-normal text-zinc-400">pts</span>
              </span>
              <span className="text-xs text-zinc-400 font-medium mt-1">
                Erreur Absolue Moyenne (MAE)
              </span>
            </div>

            {/* Card 3 */}
            <div className="glass-panel p-5 rounded-2xl border border-zinc-800 flex flex-col items-center text-center">
              <div className="w-9 h-9 rounded-xl bg-emerald-950 text-emerald-400 flex items-center justify-center mb-2 border border-emerald-800/40">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <span className="text-3xl font-extrabold text-emerald-400 font-mono">
                {macro.tauxDansMarge}%
              </span>
              <span className="text-xs text-zinc-400 font-medium mt-1">
                Mesures dans la marge (±1.5 pt)
              </span>
            </div>

            {/* Card 4 */}
            <div className="glass-panel p-5 rounded-2xl border border-zinc-800 flex flex-col items-center text-center">
              <div className="w-9 h-9 rounded-xl bg-sky-950 text-sky-400 flex items-center justify-center mb-2 border border-sky-800/40">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <span className="text-3xl font-extrabold text-sky-300 font-mono">
                {macro.totalInstituts}
              </span>
              <span className="text-xs text-zinc-400 font-medium mt-1">
                Instituts audités de 2002 à 2024
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Component 2 : Le Baromètre d'Écart Créatif */}
        <section>
          <DivergingShockBar
            points={allPoints}
            title="Le Baromètre d'Écart Historique (2002–2024)"
            subtitle="Les plus fortes distorsions constatées entre les dernières estimations publiées et les scores réels sortis des urnes"
            limit={12}
          />
        </section>

        {/* Focus : Les 5 Chocs Historiques */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                <Zap className="w-6 h-6 text-amber-400" />
                Les 5 Grands Séismes de la Dataviz Électorale
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400 mt-1">
                Les moments charnières où les sondeurs n'ont pas vu venir le résultat ou ont sur-estimé un phénomène
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {HISTORICAL_SHOCKS.map((shock, idx) => (
              <div
                key={idx}
                className="glass-panel p-5 rounded-2xl border border-zinc-800/80 hover:border-zinc-700 transition-all flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700 uppercase tracking-wider">
                      {shock.scrutin}
                    </span>
                    <span
                      className={`text-xs font-mono font-extrabold px-2 py-0.5 rounded ${
                        shock.delta > 0
                          ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                          : "bg-rose-950 text-rose-300 border border-rose-800"
                      }`}
                    >
                      {shock.delta > 0 ? `+${shock.delta}` : shock.delta} pts
                    </span>
                  </div>
                  <h3 className="font-bold text-white text-sm mb-1">{shock.titre}</h3>
                  <div className="text-xs text-zinc-300 font-semibold mb-2">
                    {shock.candidat}
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    {shock.impact}
                  </p>
                </div>

                <div className="pt-3 border-t border-zinc-800/60 flex items-center justify-between text-[11px] font-mono text-zinc-400">
                  <span>Sondé : {shock.scoreSonde}</span>
                  <span className="font-bold text-white">Réel : {shock.scoreReel}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Component 1 : Le Nuage de Corrélation ("The Scatter Truth") */}
        <section>
          <ScatterTruth
            points={allPoints}
            title="Le Nuage de Vérité National (The Scatter Truth)"
            subtitle="Confrontation globale de chaque candidat ou liste : positionnez votre curseur pour lire l'écart exact"
          />
        </section>

        {/* Component 3 : Podium des Sondeurs */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                <Award className="w-6 h-6 text-amber-400" />
                Le Podium de Précision des Instituts
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400 mt-1">
                Qui a été le plus proche de la réalité sur l'ensemble des 20 dernières années ?
              </p>
            </div>
            <Link
              href="/instituts"
              className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-white border border-zinc-700 flex items-center gap-1.5 self-start sm:self-auto"
            >
              <span>Voir le classement détaillé</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <LeaderboardPodium instituts={instituts} />
        </section>

        {/* Section Navigation vers les Scrutins */}
        <section className="p-8 rounded-3xl bg-gradient-to-tr from-indigo-950/40 via-zinc-900/60 to-zinc-950 border border-zinc-800/80">
          <div className="max-w-2xl mb-6">
            <h3 className="text-2xl font-bold text-white mb-2">
              Explorez les 3 Grands Scrutins Républicains
            </h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Consultez les visualisations dédiées pour chaque scrutin : sélecteur par année, simulation de l'hémicycle parlementaire et sondages prospectifs pour 2027.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link
              href="/presidentielles"
              className="glass-panel p-6 rounded-2xl hover:border-indigo-600/60 transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-indigo-950 text-indigo-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Vote className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-white text-base mb-1">
                Présidentielles (2002–2027)
              </h4>
              <p className="text-xs text-zinc-400 leading-relaxed mb-4">
                De la surprise Le Pen en 2002 aux duels Macron-Le Pen de 2017/2022 et hypothèses 2027.
              </p>
              <span className="text-xs font-semibold text-indigo-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                Consulter les 5 éditions →
              </span>
            </Link>

            <Link
              href="/legislatives"
              className="glass-panel p-6 rounded-2xl hover:border-amber-600/60 transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-amber-950 text-amber-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Landmark className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-white text-base mb-1">
                Législatives & Hémicycle
              </h4>
              <p className="text-xs text-zinc-400 leading-relaxed mb-4">
                La bataille des 577 sièges : projections en sièges vs composition finale de l'Assemblée nationale.
              </p>
              <span className="text-xs font-semibold text-amber-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                Explorer l'hémicycle 3D →
              </span>
            </Link>

            <Link
              href="/europeennes"
              className="glass-panel p-6 rounded-2xl hover:border-sky-600/60 transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-sky-950 text-sky-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Compass className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-white text-base mb-1">
                Européennes (2004–2024)
              </h4>
              <p className="text-xs text-zinc-400 leading-relaxed mb-4">
                Scrutin proportionnel national et interrégional : seuil de 5% et sièges envoyés à Strasbourg.
              </p>
              <span className="text-xs font-semibold text-sky-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                Comparer les listes européennes →
              </span>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
