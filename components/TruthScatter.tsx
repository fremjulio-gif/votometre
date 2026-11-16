"use client";

import { useState, useMemo } from "react";
import { StatPoint } from "@/lib/stats";
import { qualifierEcart, formaterPct, formaterPoints } from "@/lib/metrics";

interface TruthScatterProps {
  points: StatPoint[];
  title?: string;
  subtitle?: string;
}

export function TruthScatter({
  points,
  title = "La Confrontation Directe : Le Sondage face à l'Urne",
  subtitle = "Chaque point représente un candidat. Plus il est proche de la ligne pointillée, plus la prévision était exacte.",
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
  const padding = { top: 30, right: 30, bottom: 50, left: 50 };

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
    <div className="editorial-card p-5 sm:p-7">
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
          {/* Grid lines and horizontal labels */}
          {ticks.map((t) => (
            <g key={`tick-${t}`}>
              <line
                x1={padding.left}
                y1={scaleY(t)}
                x2={width - padding.right}
                y2={scaleY(t)}
                stroke="currentColor"
                className="text-border"
                strokeWidth="1"
              />
              <line
                x1={scaleX(t)}
                y1={padding.top}
                x2={scaleX(t)}
                y2={height - padding.bottom}
                stroke="currentColor"
                className="text-border"
                strokeWidth="1"
              />
              {/* Y Axis (Horizontal label) */}
              <text
                x={padding.left - 10}
                y={scaleY(t) + 4}
                textAnchor="end"
                className="fill-muted-foreground text-[11px] font-mono"
              >
                {t}%
              </text>
              {/* X Axis (Horizontal label) */}
              <text
                x={scaleX(t)}
                y={height - padding.bottom + 18}
                textAnchor="middle"
                className="fill-muted-foreground text-[11px] font-mono"
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
          />

          {/* Label on Truth Line */}
          <text
            x={scaleX(maxScore * 0.75) + 8}
            y={scaleY(maxScore * 0.75) - 8}
            className="fill-slate-500 dark:fill-slate-400 text-[10px] font-medium"
          >
            Ligne de vérité (Prévision parfaite)
          </text>

          {/* Points */}
          {points.map((p, idx) => {
            const cx = scaleX(p.scoreSonde);
            const cy = scaleY(p.scoreReel);
            const isSelected = activePoint === p;
            const r = isSelected ? 8 : 6;

            return (
              <g
                key={`${p.nom}-${idx}`}
                className="cursor-pointer"
                onClick={() => setActivePoint(p)}
                onMouseEnter={() => setActivePoint(p)}
              >
                {/* Subtle highlight ring if selected */}
                {isSelected && (
                  <circle
                    cx={cx}
                    cy={cy}
                    r={r + 5}
                    fill={p.couleurHex}
                    fillOpacity="0.25"
                  />
                )}

                <circle
                  cx={cx}
                  cy={cy}
                  r={r}
                  fill={p.couleurHex}
                  stroke="#ffffff"
                  strokeWidth="1.5"
                />

                {/* Candidate name label (horizontal) */}
                {(isSelected || p.scoreReel >= 18 || Math.abs(p.delta) >= 3.0) && (
                  <text
                    x={cx}
                    y={cy - r - 4}
                    textAnchor="middle"
                    className="fill-foreground text-[10px] font-semibold pointer-events-none"
                  >
                    {p.nom.split(" ").slice(-1)[0]}
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        {/* Selected / Hovered Card Details (Accessible on Mobile and Desktop) */}
        <div className="mt-4 p-4 rounded-xl bg-muted/50 border border-border">
          {activePoint ? (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5">
                <div
                  className="w-3.5 h-3.5 rounded-full shrink-0"
                  style={{ backgroundColor: activePoint.couleurHex }}
                />
                <div>
                  <span className="font-bold text-sm text-foreground">
                    {activePoint.nom}
                  </span>
                  <span className="text-muted-foreground ml-1.5">
                    ({activePoint.parti})
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs">
                <div>
                  <span className="text-muted-foreground block text-[10px] uppercase font-medium">
                    Sondé (J-1)
                  </span>
                  <span className="font-bold text-foreground">
                    {formaterPct(activePoint.scoreSonde)}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px] uppercase font-medium">
                    Résultat dans l'urne
                  </span>
                  <span className="font-bold text-foreground">
                    {formaterPct(activePoint.scoreReel)}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px] uppercase font-medium">
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
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium border inline-block ${
                    qualifierEcart(activePoint.delta).badgeClass
                  }`}
                >
                  {qualifierEcart(activePoint.delta).libelle}
                </span>
              </div>
            </div>
          ) : (
            <div className="text-xs text-muted-foreground text-center py-1">
              Touchez ou survolez un point sur le graphique pour afficher les détails du candidat.
            </div>
          )}
        </div>
      </div>

      {/* Axis explanation */}
      <div className="mt-4 flex flex-col sm:flex-row items-center justify-between text-xs text-muted-foreground pt-3 border-t border-border gap-2">
        <span>Axe horizontal : Ce que disaient les sondages la veille du vote</span>
        <span>Axe vertical : Le score officiel certifié</span>
      </div>
    </div>
  );
}
