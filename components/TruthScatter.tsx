"use client";

import { useState, useMemo } from "react";
import { StatPoint } from "@/lib/stats";
import { qualifierEcart, formaterPct, formaterPoints } from "@/lib/metrics";
import { motion, AnimatePresence } from "framer-motion";

interface TruthScatterProps {
  points: StatPoint[];
  title?: string;
  subtitle?: string;
}

export function TruthScatter({
  points,
  title = "La Confrontation Directe : Le Sondage face à l'Urne",
  subtitle = "Chaque point représente un candidat. Plus il est proche de la diagonale pointillée, plus la prévision était exacte.",
}: TruthScatterProps) {
  const [activePoint, setActivePoint] = useState<StatPoint | null>(null);

  // Maximum value for the grid
  const maxScore = useMemo(() => {
    const maxVal = Math.max(
      ...points.map((p) => Math.max(p.scoreReel, p.scoreSonde)),
      35
    );
    return Math.ceil(maxVal / 5) * 5;
  }, [points]);

  const width = 680;
  const height = 480;
  const padding = { top: 30, right: 30, bottom: 50, left: 55 };

  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;

  const scaleX = (val: number) => padding.left + (val / maxScore) * innerWidth;
  const scaleY = (val: number) => height - padding.bottom - (val / maxScore) * innerHeight;

  // Grid ticks
  const ticks = useMemo(() => {
    const list = [];
    for (let i = 0; i <= maxScore; i += 10) {
      list.push(i);
    }
    return list;
  }, [maxScore]);

  return (
    <div className="editorial-card p-5 sm:p-7 relative">
      {/* Editorial Header */}
      <div className="mb-6 pb-4 border-b border-border">
        <h3 className="text-lg sm:text-xl font-bold tracking-tight text-foreground">
          {title}
        </h3>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
          {subtitle}
        </p>
      </div>

      {/* Interactive Chart Container */}
      <div className="relative w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto min-w-[500px] select-none"
        >
          {/* Subtle Zone Shading */}
          <polygon
            points={`${scaleX(0)},${scaleY(0)} ${scaleX(0)},${scaleY(maxScore)} ${scaleX(maxScore)},${scaleY(maxScore)}`}
            fill="currentColor"
            className="text-emerald-500/[0.03] dark:text-emerald-500/[0.05]"
          />
          <polygon
            points={`${scaleX(0)},${scaleY(0)} ${scaleX(maxScore)},${scaleY(0)} ${scaleX(maxScore)},${scaleY(maxScore)}`}
            fill="currentColor"
            className="text-amber-500/[0.03] dark:text-amber-500/[0.05]"
          />

          {/* Grid lines and horizontal labels */}
          {ticks.map((t) => (
            <g key={`tick-${t}`}>
              <line
                x1={padding.left}
                y1={scaleY(t)}
                x2={width - padding.right}
                y2={scaleY(t)}
                stroke="currentColor"
                className="text-border/60"
                strokeWidth="1"
              />
              <line
                x1={scaleX(t)}
                y1={padding.top}
                x2={scaleX(t)}
                y2={height - padding.bottom}
                stroke="currentColor"
                className="text-border/60"
                strokeWidth="1"
              />
              {/* Y Axis (Horizontal label) */}
              <text
                x={padding.left - 10}
                y={scaleY(t) + 4}
                textAnchor="end"
                className="fill-muted-foreground text-[11px] font-mono font-medium"
              >
                {t}%
              </text>
              {/* X Axis (Horizontal label) */}
              <text
                x={scaleX(t)}
                y={height - padding.bottom + 20}
                textAnchor="middle"
                className="fill-muted-foreground text-[11px] font-mono font-medium"
              >
                {t}%
              </text>
            </g>
          ))}

          {/* Diagonale de Vérité (y = x) */}
          <line
            x1={scaleX(0)}
            y1={scaleY(0)}
            x2={scaleX(maxScore)}
            y2={scaleY(maxScore)}
            stroke="#94a3b8"
            strokeWidth="1.5"
            strokeDasharray="4 4"
            className="opacity-70"
          />

          {/* Label on Truth Line */}
          <text
            x={scaleX(maxScore * 0.72) + 8}
            y={scaleY(maxScore * 0.72) - 8}
            className="fill-slate-500 dark:fill-slate-400 text-[10px] font-semibold tracking-wide"
          >
            Ligne de vérité (Prévision parfaite)
          </text>

          {/* Active Guide Projection Lines */}
          {activePoint && (
            <g className="transition-opacity duration-200">
              {/* Vertical line to X axis */}
              <line
                x1={scaleX(activePoint.scoreSonde)}
                y1={scaleY(activePoint.scoreReel)}
                x2={scaleX(activePoint.scoreSonde)}
                y2={height - padding.bottom}
                stroke={activePoint.couleurHex}
                strokeWidth="1.5"
                strokeDasharray="3 3"
                opacity="0.6"
              />
              {/* Horizontal line to Y axis */}
              <line
                x1={padding.left}
                y1={scaleY(activePoint.scoreReel)}
                x2={scaleX(activePoint.scoreSonde)}
                y2={scaleY(activePoint.scoreReel)}
                stroke={activePoint.couleurHex}
                strokeWidth="1.5"
                strokeDasharray="3 3"
                opacity="0.6"
              />
            </g>
          )}

          {/* Points */}
          {points.map((p, idx) => {
            const cx = scaleX(p.scoreSonde);
            const cy = scaleY(p.scoreReel);
            const isSelected = activePoint?.nom === p.nom;
            const r = isSelected ? 8 : 5.5;

            return (
              <g
                key={`${p.nom}-${idx}`}
                className="cursor-pointer transition-transform"
                onClick={() => setActivePoint(p)}
                onMouseEnter={() => setActivePoint(p)}
              >
                {/* Subtle highlight ring if selected */}
                {isSelected && (
                  <circle
                    cx={cx}
                    cy={cy}
                    r={r + 6}
                    fill={p.couleurHex}
                    fillOpacity="0.25"
                    className="animate-pulse"
                  />
                )}

                <circle
                  cx={cx}
                  cy={cy}
                  r={r}
                  fill={p.couleurHex}
                  stroke="#ffffff"
                  strokeWidth={isSelected ? "2" : "1.5"}
                  className="transition-all duration-200 shadow-sm"
                />

                {/* Candidate name label (horizontal) */}
                {(isSelected || p.scoreReel >= 18 || Math.abs(p.delta) >= 3.0) && (
                  <text
                    x={cx}
                    y={cy - r - 5}
                    textAnchor="middle"
                    className={`text-[11px] font-bold pointer-events-none drop-shadow-sm ${
                      isSelected ? "fill-foreground font-black" : "fill-foreground/80"
                    }`}
                  >
                    {p.nom.split(" ").slice(-1)[0]}
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        {/* Selected / Hovered Card Details with smooth animation */}
        <div className="mt-4 p-4 rounded-xl bg-card border border-border shadow-sm min-h-[72px] flex items-center">
          <AnimatePresence mode="wait">
            {activePoint ? (
              <motion.div
                key={activePoint.nom}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.15 }}
                className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded-full shrink-0 shadow-sm"
                    style={{ backgroundColor: activePoint.couleurHex }}
                  />
                  <div>
                    <span className="font-extrabold text-sm text-foreground">
                      {activePoint.nom}
                    </span>
                    <span className="text-muted-foreground ml-1.5 font-medium">
                      ({activePoint.parti})
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-5 text-xs font-mono">
                  <div>
                    <span className="text-muted-foreground block text-[10px] uppercase font-sans font-semibold">
                      Sondé (Veille)
                    </span>
                    <span className="font-bold text-foreground">
                      {formaterPct(activePoint.scoreSonde)}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[10px] uppercase font-sans font-semibold">
                      Résultat officiel
                    </span>
                    <span className="font-bold text-foreground">
                      {formaterPct(activePoint.scoreReel)}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[10px] uppercase font-sans font-semibold">
                      Écart constaté
                    </span>
                    <span
                      className={`font-bold ${
                        activePoint.delta > 0
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-amber-600 dark:text-amber-400"
                      }`}
                    >
                      {formaterPoints(activePoint.delta)}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={`px-3 py-1 rounded-md text-[11px] font-semibold border inline-block ${
                      qualifierEcart(activePoint.delta).badgeClass
                    }`}
                  >
                    {qualifierEcart(activePoint.delta).libelle}
                  </span>
                </div>
              </motion.div>
            ) : (
              <div className="w-full text-xs text-muted-foreground text-center py-1 flex items-center justify-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-primary/40 animate-ping" />
                <span>Touchez ou survolez un point sur le graphique pour afficher les détails du candidat.</span>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Axis explanation */}
      <div className="mt-4 flex flex-col sm:flex-row items-center justify-between text-xs text-muted-foreground pt-3 border-t border-border gap-2">
        <span>Axe horizontal (X) : Score prévu la veille par les sondages</span>
        <span>Axe vertical (Y) : Score réel sorti des urnes</span>
      </div>
    </div>
  );
}
