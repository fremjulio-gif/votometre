"use client";

import { useState } from "react";
import { InteractiveHemicycle } from "./dataviz/InteractiveHemicycle";
import { CheckCircle2, XCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface LegislativesData {
  annee: number;
  realGroups: {
    nom: string;
    parti: string;
    famille: string;
    couleurHex: string;
    sieges: number;
    pct?: number;
    statut?: string | null;
  }[];
  predictedBlocs: {
    nom: string;
    parti: string;
    famille: string;
    couleurHex: string;
    siegesMin: number;
    siegesMax: number;
    siegesEstimes: number;
  }[];
  comparaisons: {
    bloc: string;
    siegesMin: number;
    siegesMax: number;
    siegesReels: number;
    dansFourchette: boolean;
    ecart: number;
    couleurHex: string;
  }[];
  contexte: string;
}

interface LegislativesClientProps {
  yearsData: Record<number, LegislativesData>;
}

export function LegislativesClient({ yearsData }: LegislativesClientProps) {
  const years = [2024, 2022, 2017, 2012, 2007, 2002];
  const [selectedYear, setSelectedYear] = useState<number>(2024);

  const current = yearsData[selectedYear] || yearsData[2024];

  return (
    <div className="space-y-10">
      {/* Header & Year Selector with Sliding Pill */}
      <div className="flex flex-col md:flex-row md:items-baseline justify-between gap-4 pb-6 border-b border-border">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
            Élections Législatives
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-foreground tracking-tight">
            L'Assemblée Prédite vs L'Assemblée Élue
          </h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-xl">
            La bataille des 577 sièges : les sondages ont-ils correctement anticipé la majorité absolue (seuil de 289 députés) ?
          </p>
        </div>

        {/* Clean Pill Selector */}
        <div className="flex flex-wrap items-center gap-1 bg-muted/60 p-1 rounded-xl self-start md:self-auto border border-border/50">
          {years.map((year) => (
            <button
              key={year}
              onClick={() => setSelectedYear(year)}
              className="relative px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors z-10 text-muted-foreground hover:text-foreground"
            >
              {selectedYear === year && (
                <motion.div
                  layoutId="legisYearPill"
                  className="absolute inset-0 bg-card rounded-lg shadow-sm border border-border -z-10"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <span className={selectedYear === year ? "text-foreground font-black" : ""}>
                {year === 2024 ? "2024 (Dissolution)" : year}
              </span>
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={`legis-${selectedYear}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.25 }}
          className="space-y-8"
        >
          {/* Context Editorial Note */}
          {current?.contexte && (
            <div className="p-4 rounded-xl border border-border bg-card text-xs text-muted-foreground leading-relaxed shadow-sm">
              <strong className="text-foreground font-semibold">Ce qu'il s'est passé en {selectedYear} :</strong> {current.contexte}
            </div>
          )}

          {/* 1. L'Hémicycle Réactif */}
          {current && (
            <InteractiveHemicycle
              annee={selectedYear}
              realGroups={current.realGroups}
              predictedBlocs={current.predictedBlocs}
            />
          )}

          {/* 2. Tableau de validation des fourchettes épuré */}
          <div className="editorial-card p-5 sm:p-7 shadow-sm">
            <h3 className="text-base sm:text-lg font-bold text-foreground mb-1 tracking-tight">
              Le Test des Fourchettes de Sièges ({selectedYear})
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground mb-5">
              Le résultat réel est-il tombé dans la fourchette annoncée par les sondeurs avant le 2nd tour ?
            </p>

            <div className="divide-y divide-border">
              {current?.comparaisons.map((c, idx) => (
                <div
                  key={idx}
                  className="py-3.5 px-2 -mx-2 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className="w-3 h-3 rounded-full shrink-0 shadow-sm"
                      style={{ backgroundColor: c.couleurHex }}
                    />
                    <span className="font-bold text-sm text-foreground">
                      {c.bloc}
                    </span>
                  </div>

                  <div className="flex items-center gap-6 font-mono text-muted-foreground">
                    <span>
                      Fourchette sondée : <strong>[{c.siegesMin}–{c.siegesMax}]</strong>
                    </span>
                    <span>
                      Résultat réel : <strong className="text-foreground text-sm font-bold">{c.siegesReels} sièges</strong>
                    </span>
                  </div>

                  <div>
                    {c.dansFourchette ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/70 dark:text-emerald-300 dark:border-emerald-800">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Prévision réussie (dans la fourchette)</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200 dark:bg-amber-950/70 dark:text-amber-300 dark:border-amber-800">
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Hors fourchette ({c.ecart > 0 ? `+${c.ecart}` : c.ecart} sièges)</span>
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
