"use client";

import { useMemo, useState } from "react";
import { StatPoint } from "@/lib/stats";
import { qualifierEcart, formaterPct, formaterPoints } from "@/lib/metrics";

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
    <div className="editorial-card p-5 sm:p-7">
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

        {/* Filter Switcher */}
        <div className="flex items-center gap-1 bg-muted p-1 rounded-lg text-xs self-start sm:self-auto">
          <button
            onClick={() => setFilterMode("ALL")}
            className={`px-2.5 py-1 rounded-md font-medium transition-all ${
              filterMode === "ALL"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Tous les candidats
          </button>
          <button
            onClick={() => setFilterMode("SURPRISE")}
            className={`px-2.5 py-1 rounded-md font-medium transition-all ${
              filterMode === "SURPRISE"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Surprises uniquement (&gt; 1,5 pt)
          </button>
        </div>
      </div>

      {/* Visual Guide Header */}
      <div className="grid grid-cols-2 text-xs font-medium text-muted-foreground mb-4 pb-2 border-b border-border text-center">
        <div className="flex items-center justify-end pr-4 text-amber-600 dark:text-amber-400">
          <span>← A fait moins bien que prévu</span>
        </div>
        <div className="flex items-center justify-start pl-4 text-emerald-600 dark:text-emerald-400">
          <span>A fait mieux que prévu →</span>
        </div>
      </div>

      {/* Bars Stack */}
      <div className="space-y-4">
        {displayPoints.map((p, idx) => {
          const q = qualifierEcart(p.delta);
          const isMore = p.delta > 0;
          const isLess = p.delta < 0;
          const barWidth = Math.min(100, (Math.abs(p.delta) / maxDelta) * 100);

          return (
            <div
              key={`${p.nom}-${idx}`}
              className="p-3 rounded-lg hover:bg-muted/40 transition-colors border border-transparent hover:border-border"
            >
              {/* Candidate Info line (Mobile & Desktop) */}
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: p.couleurHex }}
                  />
                  <span className="font-semibold text-foreground text-sm">
                    {p.nom}
                  </span>
                  <span className="text-xs text-muted-foreground hidden sm:inline">
                    ({p.parti})
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <span className={`px-2 py-0.5 rounded-md text-[11px] font-medium border ${q.badgeClass}`}>
                    {q.libelle}
                  </span>
                </div>
              </div>

              {/* Score comparisons details */}
              <div className="text-xs text-muted-foreground flex items-center justify-between mb-2">
                <span>
                  Sondé à <strong>{formaterPct(p.scoreSonde)}</strong>
                </span>
                <span>
                  Résultat officiel : <strong>{formaterPct(p.scoreReel)}</strong>
                </span>
              </div>

              {/* Diverging Bar Track */}
              <div className="relative h-5 bg-muted/60 rounded-md overflow-hidden flex items-center">
                {/* Margin of Error Zone: Central ±1.5 pt strip */}
                <div
                  className="absolute top-0 bottom-0 bg-slate-300/40 dark:bg-slate-700/40 z-0"
                  style={{
                    left: `${50 - (1.5 / maxDelta) * 50}%`,
                    width: `${(3 / maxDelta) * 50}%`,
                  }}
                  title="Zone de marge d'erreur normale (±1,5 pt)"
                />

                {/* Central Zero Axis Line */}
                <div className="absolute top-0 bottom-0 left-1/2 w-px bg-slate-400 dark:bg-slate-500 z-10" />

                {/* Left Bar (Less than projected) */}
                <div className="w-1/2 h-full flex justify-end items-center pr-px relative z-10">
                  {isLess && (
                    <div
                      className="h-3.5 rounded-l bg-amber-500/90 transition-all duration-300"
                      style={{ width: `${barWidth}%` }}
                    />
                  )}
                </div>

                {/* Right Bar (More than projected) */}
                <div className="w-1/2 h-full flex justify-start items-center pl-px relative z-10">
                  {isMore && (
                    <div
                      className="h-3.5 rounded-r bg-emerald-500/90 transition-all duration-300"
                      style={{ width: `${barWidth}%` }}
                    />
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend Footer */}
      <div className="mt-6 pt-4 border-t border-border flex flex-wrap items-center justify-between text-xs text-muted-foreground gap-3">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-slate-300 dark:bg-slate-700 rounded-sm" />
          <span>Bande grise centrale = Marge de tolérance habituelle (±1,5 pt)</span>
        </div>
        <span>Source certifiée : Proclamation officielle</span>
      </div>
    </div>
  );
}
