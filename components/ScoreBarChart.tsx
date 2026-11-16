"use client";

import { useMemo, useState } from "react";
import { StatPoint } from "@/lib/stats";
import { qualifierEcart, formaterPct, formaterPoints } from "@/lib/metrics";
import { motion, AnimatePresence } from "framer-motion";

interface ScoreBarChartProps {
  points: StatPoint[];
  title?: string;
  subtitle?: string;
  limit?: number;
}

export function ScoreBarChart({
  points,
  title = "Qui a créé la surprise face aux sondages ?",
  subtitle = "Écart en points entre le score officiel dans l'urne et la dernière prévision des sondages",
  limit = 12,
}: ScoreBarChartProps) {
  const [filterMode, setFilterMode] = useState<"ALL" | "SURPRISE">("ALL");
  const [hoveredCandidate, setHoveredCandidate] = useState<string | null>(null);

  const displayPoints = useMemo(() => {
    let list = [...points];
    if (filterMode === "SURPRISE") {
      list = list.filter((p) => Math.abs(p.delta) > 1.5);
    }
    // Sort by absolute delta descending (biggest gap first)
    return list.sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta)).slice(0, limit);
  }, [points, filterMode, limit]);

  const maxDelta = useMemo(() => {
    const maxVal = Math.max(...points.map((p) => Math.abs(p.delta)), 4);
    return Math.ceil(maxVal) + 0.5;
  }, [points]);

  return (
    <div className="editorial-card p-5 sm:p-7 relative overflow-hidden">
      {/* Editorial Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-3 mb-6 pb-4 border-b border-border">
        <div>
          <h3 className="text-lg sm:text-xl font-bold tracking-tight text-foreground">
            {title}
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            {subtitle}
          </p>
        </div>

        {/* Filter Switcher with Animated Pill */}
        <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-xl text-xs self-start sm:self-auto border border-border/50">
          {[
            { id: "ALL", label: "Tous les candidats" },
            { id: "SURPRISE", label: "Surprises uniquement (> 1,5 pt)" },
          ].map((mode) => (
            <button
              key={mode.id}
              onClick={() => setFilterMode(mode.id as any)}
              className="relative px-3 py-1.5 rounded-lg font-semibold transition-colors text-xs z-10 text-muted-foreground hover:text-foreground"
            >
              {filterMode === mode.id && (
                <motion.div
                  layoutId="barChartFilter"
                  className="absolute inset-0 bg-card rounded-lg shadow-sm border border-border -z-10"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <span className={filterMode === mode.id ? "text-foreground font-bold" : ""}>
                {mode.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Visual Guide Header */}
      <div className="grid grid-cols-2 text-xs font-semibold text-muted-foreground mb-4 pb-2 border-b border-border text-center">
        <div className="flex items-center justify-end pr-4 text-amber-600 dark:text-amber-400 gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block" />
          <span>← A fait moins bien que prévu (Sur-estimé)</span>
        </div>
        <div className="flex items-center justify-start pl-4 text-emerald-600 dark:text-emerald-400 gap-1.5">
          <span>A fait mieux que prévu (Sous-estimé) →</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
        </div>
      </div>

      {/* Bars Stack with AnimatePresence */}
      <motion.div layout className="space-y-3">
        <AnimatePresence mode="popLayout">
          {displayPoints.map((p, idx) => {
            const q = qualifierEcart(p.delta);
            const isMore = p.delta > 0;
            const isLess = p.delta < 0;
            const barWidth = Math.min(100, (Math.abs(p.delta) / maxDelta) * 100);
            const isHovered = hoveredCandidate === p.nom;

            return (
              <motion.div
                key={`${p.nom}-${idx}`}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                onMouseEnter={() => setHoveredCandidate(p.nom)}
                onMouseLeave={() => setHoveredCandidate(null)}
                className={`p-3.5 rounded-xl transition-all duration-200 border ${
                  isHovered
                    ? "bg-muted/70 border-border/80 shadow-sm"
                    : "hover:bg-muted/40 border-transparent hover:border-border/50"
                }`}
              >
                {/* Candidate Info line (Mobile & Desktop) */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full shrink-0 shadow-sm transition-transform duration-200"
                      style={{
                        backgroundColor: p.couleurHex,
                        transform: isHovered ? "scale(1.2)" : "scale(1)",
                      }}
                    />
                    <span className="font-bold text-foreground text-sm tracking-tight">
                      {p.nom}
                    </span>
                    <span className="text-xs text-muted-foreground hidden sm:inline font-medium">
                      ({p.parti})
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-mono font-bold text-foreground bg-muted/80 px-2 py-0.5 rounded-md border border-border/50">
                      {formaterPoints(p.delta)}
                    </span>
                    <span className={`px-2 py-0.5 rounded-md text-[11px] font-semibold border ${q.badgeClass}`}>
                      {q.libelle}
                    </span>
                  </div>
                </div>

                {/* Score comparisons details */}
                <div className="text-xs text-muted-foreground flex items-center justify-between mb-2 font-mono">
                  <span>
                    Sondé à <strong className="text-foreground">{formaterPct(p.scoreSonde)}</strong>
                  </span>
                  <span>
                    Résultat officiel : <strong className="text-foreground">{formaterPct(p.scoreReel)}</strong>
                  </span>
                </div>

                {/* Diverging Bar Track */}
                <div className="relative h-6 bg-muted/70 rounded-lg overflow-hidden flex items-center p-0.5 shadow-inner">
                  {/* Margin of Error Zone: Central ±1.5 pt strip */}
                  <div
                    className="absolute top-0 bottom-0 bg-slate-300/40 dark:bg-slate-700/40 z-0 border-x border-slate-300/60 dark:border-slate-600/60"
                    style={{
                      left: `${50 - (1.5 / maxDelta) * 50}%`,
                      width: `${(3 / maxDelta) * 50}%`,
                    }}
                    title="Zone de marge d'erreur normale (±1,5 pt)"
                  />

                  {/* Central Zero Axis Line with Glow */}
                  <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-slate-400 dark:bg-slate-500 z-20 shadow-[0_0_4px_rgba(100,116,139,0.5)]" />

                  {/* Left Bar (Less than projected) */}
                  <div className="w-1/2 h-full flex justify-end items-center pr-0.5 relative z-10">
                    {isLess && (
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${barWidth}%` }}
                        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                        className="h-4 rounded-l-md bg-gradient-to-l from-amber-500 to-amber-600 shadow-sm relative overflow-hidden"
                      >
                        <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent" />
                      </motion.div>
                    )}
                  </div>

                  {/* Right Bar (More than projected) */}
                  <div className="w-1/2 h-full flex justify-start items-center pl-0.5 relative z-10">
                    {isMore && (
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${barWidth}%` }}
                        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                        className="h-4 rounded-r-md bg-gradient-to-r from-emerald-500 to-emerald-600 shadow-sm relative overflow-hidden"
                      >
                        <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent" />
                      </motion.div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>

      {/* Legend Footer */}
      <div className="mt-6 pt-4 border-t border-border flex flex-wrap items-center justify-between text-xs text-muted-foreground gap-3">
        <div className="flex items-center gap-2">
          <div className="w-3.5 h-3.5 bg-slate-300 dark:bg-slate-700 rounded-sm border border-border" />
          <span>Bande grise centrale = Marge de tolérance usuelle (± 1,5 pt)</span>
        </div>
        <span className="font-medium">Source certifiée : Conseil constitutionnel / Ministère de l'Intérieur</span>
      </div>
    </div>
  );
}
