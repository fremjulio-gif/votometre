"use client";

import Link from "next/link";
import { ScoreBarChart } from "@/components/ScoreBarChart";
import { ArrowRight, AlertCircle, CheckCircle2, Zap, Vote, Landmark, Globe, Award, Sparkles, Building2 } from "lucide-react";
import { motion } from "framer-motion";
import { StatPoint } from "@/lib/stats";

interface HomeClientProps {
  pointsToDisplay: StatPoint[];
}

export function HomeClient({ pointsToDisplay }: HomeClientProps) {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14 space-y-14">
      {/* Editorial Hero Header with Fade-up */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="space-y-4 max-w-3xl"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/80 border border-border text-xs font-semibold text-foreground/80 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-primary" />
          <span>Données officielles vérifiées (2002–2024 & prospectif 2027)</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-foreground leading-[1.15]">
          Depuis 20 ans, les sondages voient-ils juste le jour du vote ?
        </h1>

        <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
          Le Votomètre est un observatoire citoyen indépendant. Nous confrontons scientifiquement les dernières intentions de vote publiées par les instituts aux résultats réels proclamés dans les urnes.
        </p>
      </motion.div>

      {/* Les 3 Cartes Synthétiques Grand Format with Staggered Entrance */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Carte 1 : Plus grand écart */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.1 }}
          whileHover={{ y: -4 }}
          className="editorial-card p-6 flex flex-col justify-between space-y-4 border-l-4 border-l-amber-500 relative overflow-hidden group shadow-sm hover:shadow-md transition-all duration-300"
        >
          <div className="space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              <AlertCircle className="w-4 h-4 transition-transform duration-200 group-hover:scale-110" />
              <span>Le plus grand écart</span>
            </div>
            <h2 className="text-xl font-extrabold text-foreground tracking-tight">
              2002 : Le séisme Le Pen
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Jean-Marie Le Pen est sondé à 13% la veille du vote. Il obtient 16,9% dans l'urne (+3,9 points au-delà des sondages) et élimine Lionel Jospin au 1er tour.
            </p>
          </div>
          <div className="pt-3 border-t border-border flex items-center justify-between text-xs font-medium">
            <span className="text-muted-foreground">Présidentielle 2002</span>
            <span className="text-amber-600 dark:text-amber-400 font-bold font-mono">+3,9 points d'écart</span>
          </div>
        </motion.div>

        {/* Carte 2 : Élection la plus fidèle */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.15 }}
          whileHover={{ y: -4 }}
          className="editorial-card p-6 flex flex-col justify-between space-y-4 border-l-4 border-l-emerald-500 relative overflow-hidden group shadow-sm hover:shadow-md transition-all duration-300"
        >
          <div className="space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-4 h-4 transition-transform duration-200 group-hover:scale-110" />
              <span>L'élection la plus fidèle</span>
            </div>
            <h2 className="text-xl font-extrabold text-foreground tracking-tight">
              2017 : Quasi sans faute
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Pour le duel Macron / Le Pen, les instituts estiment le score final à moins de 1,3 point d'écart en moyenne. Tous les sondeurs prédisent fidèlement l'ordre d'arrivée.
            </p>
          </div>
          <div className="pt-3 border-t border-border flex items-center justify-between text-xs font-medium">
            <span className="text-muted-foreground">Présidentielle 2017</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold font-mono">Marge : ±1,2 pt</span>
          </div>
        </motion.div>

        {/* Carte 3 : Séisme le plus inattendu */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.2 }}
          whileHover={{ y: -4 }}
          className="editorial-card p-6 flex flex-col justify-between space-y-4 border-l-4 border-l-indigo-500 relative overflow-hidden group shadow-sm hover:shadow-md transition-all duration-300"
        >
          <div className="space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              <Zap className="w-4 h-4 transition-transform duration-200 group-hover:scale-110" />
              <span>Le séisme inattendu</span>
            </div>
            <h2 className="text-xl font-extrabold text-foreground tracking-tight">
              2024 : La dissolution surprise
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Annoncé à plus de 200 sièges, le RN termine à 142 députés. Les désistements républicains massifs propulsent le Nouveau Front Populaire en tête (193 sièges).
            </p>
          </div>
          <div className="pt-3 border-t border-border flex items-center justify-between text-xs font-medium">
            <span className="text-muted-foreground">Législatives 2024</span>
            <span className="text-indigo-600 dark:text-indigo-400 font-bold font-mono">Inversion des 3 blocs</span>
          </div>
        </motion.div>
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

      {/* Explorer les scrutins : 4 Liens directs élégants */}
      <div className="space-y-3">
        <h3 className="text-base font-bold text-foreground">
          Explorer l'Observatoire
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          <Link
            href="/presidentielles"
            className="editorial-card p-5 hover:bg-secondary/40 transition-all flex flex-col justify-between group active:scale-[0.98]"
          >
            <div className="space-y-1.5">
              <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center mb-2">
                <Vote className="w-4 h-4" />
              </div>
              <span className="font-bold text-foreground block text-sm group-hover:text-primary transition-colors">
                Présidentielles
              </span>
              <span className="text-xs text-muted-foreground block">
                2002 à 2022 &amp; Prospectif 2027
              </span>
            </div>
            <div className="pt-4 flex items-center justify-between text-xs text-muted-foreground group-hover:text-foreground">
              <span>Consulter</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link
            href="/legislatives"
            className="editorial-card p-5 hover:bg-secondary/40 transition-all flex flex-col justify-between group active:scale-[0.98]"
          >
            <div className="space-y-1.5">
              <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-2">
                <Landmark className="w-4 h-4" />
              </div>
              <span className="font-bold text-foreground block text-sm group-hover:text-primary transition-colors">
                Législatives
              </span>
              <span className="text-xs text-muted-foreground block">
                Hémicycle &amp; seuil de 289 sièges
              </span>
            </div>
            <div className="pt-4 flex items-center justify-between text-xs text-muted-foreground group-hover:text-foreground">
              <span>Consulter</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link
            href="/europeennes"
            className="editorial-card p-5 hover:bg-secondary/40 transition-all flex flex-col justify-between group active:scale-[0.98]"
          >
            <div className="space-y-1.5">
              <div className="w-8 h-8 rounded-lg bg-sky-100 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center mb-2">
                <Globe className="w-4 h-4" />
              </div>
              <span className="font-bold text-foreground block text-sm group-hover:text-primary transition-colors">
                Européennes
              </span>
              <span className="text-xs text-muted-foreground block">
                2004 à 2024 &amp; seuil de 5%
              </span>
            </div>
            <div className="pt-4 flex items-center justify-between text-xs text-muted-foreground group-hover:text-foreground">
              <span>Consulter</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link
            href="/municipales"
            className="editorial-card p-5 hover:bg-secondary/40 transition-all flex flex-col justify-between group active:scale-[0.98]"
          >
            <div className="space-y-1.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-2">
                <Building2 className="w-4 h-4" />
              </div>
              <span className="font-bold text-foreground block text-sm group-hover:text-primary transition-colors">
                Municipales
              </span>
              <span className="text-xs text-muted-foreground block">
                2026 : 42 métropoles &amp; enjeux
              </span>
            </div>
            <div className="pt-4 flex items-center justify-between text-xs text-muted-foreground group-hover:text-foreground">
              <span>Consulter</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link
            href="/instituts"
            className="editorial-card p-5 hover:bg-secondary/40 transition-all flex flex-col justify-between group active:scale-[0.98]"
          >
            <div className="space-y-1.5">
              <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-2">
                <Award className="w-4 h-4" />
              </div>
              <span className="font-bold text-foreground block text-sm group-hover:text-primary transition-colors">
                Podium Instituts
              </span>
              <span className="text-xs text-muted-foreground block">
                Qui est le plus précis sur 20 ans ?
              </span>
            </div>
            <div className="pt-4 flex items-center justify-between text-xs text-muted-foreground group-hover:text-foreground">
              <span>Consulter</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
