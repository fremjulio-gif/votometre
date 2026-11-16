"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { StatPoint } from "@/lib/stats";
import { formatPct, formatPoints } from "@/lib/utils";
import { Info, Filter, ShieldAlert, Sparkles } from "lucide-react";

interface ScatterTruthProps {
  points: StatPoint[];
  title?: string;
  subtitle?: string;
}

export function ScatterTruth({
  points,
  title = "Le Nuage de Vérité (The Scatter Truth)",
  subtitle = "Confrontation systématique entre les intentions de vote sondées et les résultats officiels proclamés",
}: ScatterTruthProps) {
  const [selectedFamily, setSelectedFamily] = useState<string>("ALL");
  const [showConfidenceBand, setShowConfidenceBand] = useState<boolean>(true);
  const [hoveredPoint, setHoveredPoint] = useState<StatPoint | null>(null);

  // Extract distinct political families
  const families = useMemo(() => {
    const set = new Set<string>();
    points.forEach((p) => p.famille && set.add(p.famille));
    return ["ALL", ...Array.from(set).sort()];
  }, [points]);

  // Filtered points
  const filteredPoints = useMemo(() => {
    if (selectedFamily === "ALL") return points;
    return points.filter((p) => p.famille === selectedFamily);
  }, [points, selectedFamily]);

  // Dimensions for SVG coordinate mapping (0% to 45% or max score)
  const maxScore = useMemo(() => {
    const maxVal = Math.max(
      ...points.map((p) => Math.max(p.scoreReel, p.scoreSonde)),
      35
    );
    return Math.ceil(maxVal / 5) * 5 + 2; // e.g., 40% or 45%
  }, [points]);

  const width = 760;
  const height = 560;
  const padding = { top: 30, right: 40, bottom: 60, left: 60 };

  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;

  const scaleX = (val: number) => padding.left + (val / maxScore) * innerWidth;
  const scaleY = (val: number) => height - padding.bottom - (val / maxScore) * innerHeight;

  // Grid tick values (e.g. 0, 5, 10, 15, 20, 25, 30, 35, 40)
  const ticks = useMemo(() => {
    const list: number[] = [];
    for (let i = 0; i <= maxScore; i += 5) {
      list.push(i);
    }
    return list;
  }, [maxScore]);

  return (
    <div className="glass-panel p-6 sm:p-8 rounded-2xl shadow-2xl relative border border-zinc-800/80">
      {/* Header and Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-400" />
              {title}
            </h3>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700">
              {filteredPoints.length} mesures
            </span>
          </div>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">{subtitle}</p>
        </div>

        {/* Action Toggles */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Confidence band toggle */}
          <button
            onClick={() => setShowConfidenceBand(!showConfidenceBand)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 border ${
              showConfidenceBand
                ? "bg-indigo-950/80 border-indigo-700/60 text-indigo-300 shadow-sm"
                : "bg-zinc-800/40 border-zinc-700/60 text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Marge d'erreur (±1.5 pt)</span>
          </button>

          {/* Family Filter Dropdown */}
          <div className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-700/80 rounded-lg px-2.5 py-1.5 text-xs">
            <Filter className="w-3.5 h-3.5 text-zinc-400" />
            <select
              value={selectedFamily}
              onChange={(e) => setSelectedFamily(e.target.value)}
              className="bg-transparent text-zinc-200 font-medium focus:outline-none cursor-pointer"
            >
              <option value="ALL">Toutes familles ({points.length})</option>
              {families
                .filter((f) => f !== "ALL")
                .map((f) => (
                  <option key={f} value={f} className="bg-zinc-900 text-zinc-200">
                    {f}
                  </option>
                ))}
            </select>
          </div>
        </div>
      </div>

      {/* Legend banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800 text-[11px] mb-4">
        <div className="flex items-center gap-2 text-emerald-400">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          <span>
            <strong>Au-dessus de la diagonale :</strong> Candidat sous-estimé (vote caché)
          </span>
        </div>
        <div className="flex items-center gap-2 text-zinc-400">
          <div className="w-4 h-0.5 border-t border-dashed border-zinc-400" />
          <span>
            <strong>Diagonale y = x :</strong> Vérité parfaite (0,0 pt d'écart)
          </span>
        </div>
        <div className="flex items-center gap-2 text-rose-400">
          <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
          <span>
            <strong>En-dessous de la diagonale :</strong> Candidat sur-estimé (bulle)
          </span>
        </div>
      </div>

      {/* Interactive SVG Chart */}
      <div className="relative w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto min-w-[580px] select-none"
        >
          {/* Background zones for Sous-estimation (top) and Sur-estimation (bottom) */}
          <defs>
            <linearGradient id="underEstGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.05" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.01" />
            </linearGradient>
            <linearGradient id="overEstGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.01" />
              <stop offset="100%" stopColor="#ef4444" stopOpacity="0.05" />
            </linearGradient>
          </defs>

          {/* Underestimated zone (polygon above diagonal) */}
          <polygon
            points={`${scaleX(0)},${scaleY(0)} ${scaleX(0)},${scaleY(maxScore)} ${scaleX(maxScore)},${scaleY(maxScore)}`}
            fill="url(#underEstGrad)"
          />
          {/* Overestimated zone (polygon below diagonal) */}
          <polygon
            points={`${scaleX(0)},${scaleY(0)} ${scaleX(maxScore)},${scaleY(0)} ${scaleX(maxScore)},${scaleY(maxScore)}`}
            fill="url(#overEstGrad)"
          />

          {/* Confidence corridor (±1.5 pt band around y = x) */}
          {showConfidenceBand && (
            <polygon
              points={`
                ${scaleX(0)},${scaleY(1.5)}
                ${scaleX(maxScore - 1.5)},${scaleY(maxScore)}
                ${scaleX(maxScore)},${scaleY(maxScore)}
                ${scaleX(maxScore)},${scaleY(maxScore - 1.5)}
                ${scaleX(1.5)},${scaleY(0)}
                ${scaleX(0)},${scaleY(0)}
              `}
              fill="#6366f1"
              fillOpacity="0.08"
              stroke="#6366f1"
              strokeOpacity="0.25"
              strokeDasharray="3 3"
            />
          )}

          {/* Grid lines and Ticks */}
          {ticks.map((t) => (
            <g key={`grid-${t}`}>
              {/* Horizontal grid lines */}
              <line
                x1={padding.left}
                y1={scaleY(t)}
                x2={width - padding.right}
                y2={scaleY(t)}
                stroke="#27272a"
                strokeWidth="1"
              />
              {/* Vertical grid lines */}
              <line
                x1={scaleX(t)}
                y1={padding.top}
                x2={scaleX(t)}
                y2={height - padding.bottom}
                stroke="#27272a"
                strokeWidth="1"
              />
              {/* Y Axis labels */}
              <text
                x={padding.left - 10}
                y={scaleY(t) + 4}
                textAnchor="end"
                className="fill-zinc-400 text-[11px] font-mono"
              >
                {t}%
              </text>
              {/* X Axis labels */}
              <text
                x={scaleX(t)}
                y={height - padding.bottom + 18}
                textAnchor="middle"
                className="fill-zinc-400 text-[11px] font-mono"
              >
                {t}%
              </text>
            </g>
          ))}

          {/* Diagonal Line of Truth (y = x) */}
          <line
            x1={scaleX(0)}
            y1={scaleY(0)}
            x2={scaleX(maxScore)}
            y2={scaleY(maxScore)}
            stroke="#94a3b8"
            strokeWidth="2"
            strokeDasharray="5 5"
          />

          {/* Axis Titles */}
          <text
            x={padding.left + innerWidth / 2}
            y={height - 12}
            textAnchor="middle"
            className="fill-zinc-300 text-xs font-semibold uppercase tracking-wider"
          >
            ← Score Moyen Sondé (%)
          </text>
          <text
            transform={`rotate(-90) translate(-${padding.top + innerHeight / 2}, 18)`}
            textAnchor="middle"
            className="fill-zinc-300 text-xs font-semibold uppercase tracking-wider"
          >
            Score Réel Officiel (%) →
          </text>

          {/* Scatter Points */}
          {filteredPoints.map((p, idx) => {
            const cx = scaleX(p.scoreSonde);
            const cy = scaleY(p.scoreReel);
            const isHovered = hoveredPoint === p;
            const radius = isHovered ? 8 : p.scoreReel >= 20 ? 6.5 : 5;

            return (
              <g
                key={`${p.nom}-${p.scoreSonde}-${idx}`}
                className="cursor-pointer transition-all"
                onMouseEnter={() => setHoveredPoint(p)}
                onMouseLeave={() => setHoveredPoint(null)}
              >
                {/* Glow ring if hovered */}
                {isHovered && (
                  <circle
                    cx={cx}
                    cy={cy}
                    r={radius + 6}
                    fill={p.couleurHex}
                    fillOpacity="0.3"
                    className="animate-pulse"
                  />
                )}

                {/* Point circle */}
                <circle
                  cx={cx}
                  cy={cy}
                  r={radius}
                  fill={p.couleurHex}
                  stroke={isHovered ? "#ffffff" : "#18181b"}
                  strokeWidth={isHovered ? 2.5 : 1.5}
                />

                {/* Candidate label for prominent candidates or hovered */}
                {(isHovered || p.scoreReel >= 22 || Math.abs(p.delta) >= 3.5) && (
                  <text
                    x={cx}
                    y={cy - radius - 5}
                    textAnchor="middle"
                    className="fill-zinc-200 text-[10px] font-semibold tracking-tight pointer-events-none drop-shadow"
                  >
                    {p.nom.split(" ").slice(-1)[0]} ({p.delta > 0 ? "+" : ""}
                    {p.delta.toFixed(1)}pt)
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        {/* Rich Hover Floating Tooltip */}
        <AnimatePresence>
          {hoveredPoint && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 5 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="absolute top-4 right-4 z-20 w-72 p-3.5 rounded-xl bg-zinc-900/95 border border-zinc-700 shadow-2xl backdrop-blur-md text-xs pointer-events-none"
            >
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-zinc-800">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: hoveredPoint.couleurHex }}
                  />
                  <span className="font-bold text-white text-sm">
                    {hoveredPoint.nom}
                  </span>
                </div>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 font-mono text-zinc-300">
                  {hoveredPoint.parti}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-2 text-zinc-300">
                <div className="bg-zinc-950/60 p-2 rounded-lg border border-zinc-800/80">
                  <span className="text-[10px] text-zinc-400 block uppercase">
                    Sondé
                  </span>
                  <span className="font-bold text-sm text-zinc-100">
                    {formatPct(hoveredPoint.scoreSonde)}
                  </span>
                </div>
                <div className="bg-zinc-950/60 p-2 rounded-lg border border-zinc-800/80">
                  <span className="text-[10px] text-zinc-400 block uppercase">
                    Résultat officiel
                  </span>
                  <span className="font-bold text-sm text-white">
                    {formatPct(hoveredPoint.scoreReel)}
                  </span>
                </div>
              </div>

              {/* Exact Signed Error */}
              <div
                className={`p-2 rounded-lg border flex items-center justify-between font-semibold ${
                  hoveredPoint.delta > 1.5
                    ? "bg-emerald-950/40 border-emerald-800/60 text-emerald-300"
                    : hoveredPoint.delta < -1.5
                    ? "bg-rose-950/40 border-rose-800/60 text-rose-300"
                    : "bg-indigo-950/40 border-indigo-800/60 text-indigo-300"
                }`}
              >
                <span>Écart réel vs sondé :</span>
                <span className="font-mono text-sm">
                  {formatPoints(hoveredPoint.delta)}
                </span>
              </div>

              <div className="mt-2 text-[10px] text-zinc-400 flex items-center justify-between">
                <span>Institut : {hoveredPoint.institut || "Consensus"}</span>
                {hoveredPoint.datePublication && (
                  <span>Publié : {hoveredPoint.datePublication}</span>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
