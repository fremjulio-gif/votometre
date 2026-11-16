import Link from "next/link";
import { getConsensusPointsByElection } from "@/lib/data";
import { ScoreBarChart } from "@/components/ScoreBarChart";
import { ArrowRight, AlertCircle, CheckCircle2, Zap } from "lucide-react";

export const revalidate = 3600;

export default async function HomePage() {
  // Get recent 2024 legislative or european points for the recent barometer
  const points2024 = await getConsensusPointsByElection("legis-2024-t2");
  const pointsToDisplay = points2024.length > 0
    ? points2024
    : await getConsensusPointsByElection("euro-2024");

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14 space-y-14">
      {/* Editorial Header */}
      <div className="space-y-4 max-w-3xl">
        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
          Le Flash Électoral
        </span>
        <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-foreground leading-tight">
          Depuis 20 ans, les sondages voient-ils juste le jour du vote ?
        </h1>
        <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
          Le Votomètre est un observatoire citoyen indépendant. Nous confrontons scientifiquement les dernières intentions de vote publiées par les instituts aux résultats réels proclamés dans les urnes (2002–2024 &amp; prospective 2027).
        </p>
      </div>

      {/* Les 3 Cartes Synthétiques Grand Format */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Carte 1 : Plus grand écart */}
        <div className="editorial-card p-6 flex flex-col justify-between space-y-4 border-l-4 border-l-amber-500">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              <AlertCircle className="w-4 h-4" />
              <span>Le plus grand écart</span>
            </div>
            <h2 className="text-xl font-extrabold text-foreground">
              2002 : Le séisme Le Pen
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Jean-Marie Le Pen est sondé à 13% la veille du vote. Il obtient 16,9% dans l'urne (+3,9 points au-delà des sondages) et élimine Lionel Jospin au 1er tour.
            </p>
          </div>
          <div className="pt-3 border-t border-border flex items-center justify-between text-xs font-medium">
            <span className="text-muted-foreground">Présidentielle 2002</span>
            <span className="text-amber-600 dark:text-amber-400 font-bold">+3,9 points d'écart</span>
          </div>
        </div>

        {/* Carte 2 : Élection la plus fidèle */}
        <div className="editorial-card p-6 flex flex-col justify-between space-y-4 border-l-4 border-l-emerald-500">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
              <span>L'élection la plus fidèle</span>
            </div>
            <h2 className="text-xl font-extrabold text-foreground">
              2017 : Quasi sans faute
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Pour le duel Macron / Le Pen, les instituts estiment le score final à moins de 1,3 point d'écart en moyenne. Tous les sondeurs prédisent fidèlement l'ordre d'arrivée.
            </p>
          </div>
          <div className="pt-3 border-t border-border flex items-center justify-between text-xs font-medium">
            <span className="text-muted-foreground">Présidentielle 2017</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">Marge : ±1,2 pt</span>
          </div>
        </div>

        {/* Carte 3 : Séisme le plus inattendu */}
        <div className="editorial-card p-6 flex flex-col justify-between space-y-4 border-l-4 border-l-indigo-500">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              <Zap className="w-4 h-4" />
              <span>Le séisme inattendu</span>
            </div>
            <h2 className="text-xl font-extrabold text-foreground">
              2024 : La dissolution surprise
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Annoncé à plus de 200 sièges, le RN termine à 142 députés. Les désistements républicains massifs propulsent le Nouveau Front Populaire en tête (193 sièges).
            </p>
          </div>
          <div className="pt-3 border-t border-border flex items-center justify-between text-xs font-medium">
            <span className="text-muted-foreground">Législatives 2024</span>
            <span className="text-indigo-600 dark:text-indigo-400 font-bold">Inversion des 3 blocs</span>
          </div>
        </div>
      </div>

      {/* Section : Le Baromètre d'Écart Récent */}
      <section className="space-y-4">
        <ScoreBarChart
          points={pointsToDisplay}
          title="Le Baromètre d'Écart Récent (Dernier scrutin 2024)"
          subtitle="Confrontation entre les projections de veille et les résultats sortis des urnes lors du dernier vote national"
          limit={8}
        />
      </section>

      {/* Explorer les scrutins : 3 Liens directes aérés */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
        <Link
          href="/presidentielles"
          className="editorial-card p-5 hover:bg-secondary/40 transition-colors flex items-center justify-between group"
        >
          <div>
            <span className="font-bold text-foreground block text-sm">
              Présidentielles
            </span>
            <span className="text-xs text-muted-foreground">
              2002 à 2022 &amp; Hypothèses 2027
            </span>
          </div>
          <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 group-hover:text-foreground transition-all" />
        </Link>

        <Link
          href="/legislatives"
          className="editorial-card p-5 hover:bg-secondary/40 transition-colors flex items-center justify-between group"
        >
          <div>
            <span className="font-bold text-foreground block text-sm">
              Législatives &amp; Hémicycle
            </span>
            <span className="text-xs text-muted-foreground">
              La bataille des 577 sièges
            </span>
          </div>
          <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 group-hover:text-foreground transition-all" />
        </Link>

        <Link
          href="/instituts"
          className="editorial-card p-5 hover:bg-secondary/40 transition-colors flex items-center justify-between group"
        >
          <div>
            <span className="font-bold text-foreground block text-sm">
              Podium des Instituts
            </span>
            <span className="text-xs text-muted-foreground">
              Qui est le plus précis sur 20 ans ?
            </span>
          </div>
          <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 group-hover:text-foreground transition-all" />
        </Link>
      </div>
    </div>
  );
}
