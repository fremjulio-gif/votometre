"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { StatPoint } from "@/lib/stats";
import { formatPct, formatPoints } from "@/lib/utils";
import { AlertTriangle, ArrowUpDown, Filter, Zap } from "lucide-react";

interface DivergingShockBarProps {
  points: StatPoint[];
  title?: string;
  subtitle?: string;
  limit?: number;
}

export function DivergingShockBar({
  points,
  title = "Le Baromètre d'Écart (Diverging Shock Bar)",
  subtitle = "Mesure des sous-estimations (vote caché) et sur-estimations (bulles médiatiques) en points d'écart absolus",
  limit = 15,
}: DivergingShockBarProps) {
  const [sortBy, setSortBy] = useState<"absDelta" | "deltaAsc" | "deltaDesc">("absDelta");
  const [selectedFamily, setSelectedFamily] = useState<string>("ALL");

  const families = useMemo(() => {
    const set = new Set<string>();
    points.forEach((p) => p.famille && set.add(p.famille));
    return ["ALL", ...Array.from(set).sort()];
  }, [points]);

  const sortedPoints = useMemo(() => {
    let list = [...points];
    if (selectedFamily !== "ALL") {
      list = list.filter((p) => p.famille === selectedFamily);
    }

    if (sortBy === "absDelta") {
      list.sort((a, b) => b.absDelta - a.absDelta);
    } else if (sortBy === "deltaAsc") {
      // biggest overestimations first (negative deltas)
      list.sort((a, b) => a.delta - b.delta);
    } else if (sortBy === "deltaDesc") {
      // biggest underestimations first (positive deltas)
      list.sort((a, b) => b.delta - a.delta);
    }

    return list.slice(0, limit);
  }, [points, sortBy, selectedFamily, limit]);

  // Max absolute delta for scaling
  const maxAbsDelta = useMemo(() => {
    const maxVal = Math.max(...points.map((p) => p.absDelta), 5);
    return Math.ceil(maxVal);
  }, [points]);

  return (
    <div className="glass-panel p-6 sm:p-8 rounded-2xl shadow-2xl relative border border-zinc-800/80">
      {/* Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-400" />
              {title}
            </h3>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700">
              Top {sortedPoints.length}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">{subtitle}</p>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Family Filter */}
          <div className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-700/80 rounded-lg px-2.5 py-1.5 text-xs">
            <Filter className="w-3.5 h-3.5 text-zinc-400" />
            <select
              value={selectedFamily}
              onChange={(e) => setSelectedFamily(e.target.value)}
              className="bg-transparent text-zinc-200 font-medium focus:outline-none cursor-pointer"
            >
              <option value="ALL">Toutes familles</option>
              {families
                .filter((f) => f !== "ALL")
                .map((f) => (
                  <option key={f} value={f} className="bg-zinc-900 text-zinc-200">
                    {f}
                  </option>
                ))}
            </select>
          </div>

          {/* Sort Switcher */}
          <div className="flex items-center rounded-lg bg-zinc-900 border border-zinc-800 p-0.5 text-xs">
            <button
              onClick={() => setSortBy("absDelta")}
              className={`px-2.5 py-1 rounded-md transition-all ${
                sortBy === "absDelta"
                  ? "bg-zinc-700 text-white font-semibold"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              Écart choc
            </button>
            <button
              onClick={() => setSortBy("deltaDesc")}
              className={`px-2.5 py-1 rounded-md transition-all ${
                sortBy === "deltaDesc"
                  ? "bg-emerald-950/80 text-emerald-300 font-semibold"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              Sous-estimés (+)
            </button>
            <button
              onClick={() => setSortBy("deltaAsc")}
              className={`px-2.5 py-1 rounded-md transition-all ${
                sortBy === "deltaAsc"
                  ? "bg-rose-950/80 text-rose-300 font-semibold"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              Sur-estimés (-)
            </button>
          </div>
        </div>
      </div>

      {/* Axis Banner */}
      <div className="grid grid-cols-2 text-xs font-semibold uppercase tracking-wider mb-4 pb-2 border-b border-zinc-800 text-center">
        <div className="text-rose-400 flex items-center justify-end pr-8 gap-2">
          <span>← Sur-estimation (Bulle sondière)</span>
        </div>
        <div className="text-emerald-400 flex items-center justify-start pl-8 gap-2">
          <span>Sous-estimation (Dynamique / Vote caché) →</span>
        </div>
      </div>

      {/* Bars List */}
      <div className="space-y-3.5 relative">
        {/* Central 0-line running vertically */}
        <div className="absolute top-0 bottom-0 left-1/2 w-px bg-zinc-700/80 dashed -translate-x-1/2 pointer-events-none z-10" />

        {sortedPoints.map((p, index) => {
          const isOver = p.delta < 0;
          const isUnder = p.delta > 0;
          const barWidthPct = Math.min(100, (p.absDelta / maxAbsDelta) * 100);

          return (
            <motion.div
              key={`${p.nom}-${p.electionSlug}-${index}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
              className="group relative flex items-center text-xs hover:bg-zinc-800/30 p-2 rounded-xl transition-colors"
            >
              {/* Left Column: Overestimation Bars (spread towards left from center) */}
              <div className="w-1/2 flex items-center justify-end pr-4 relative">
                {isOver && (
                  <div className="flex items-center gap-2 w-full justify-end">
                    <span className="text-[11px] font-mono font-bold text-rose-400">
                      {formatPoints(p.delta)}
                    </span>
                    <div
                      className="h-6 rounded-l-md bg-gradient-to-l from-rose-600 to-rose-900/60 shadow-sm border-y border-l border-rose-500/30 transition-all group-hover:brightness-125"
                      style={{ width: `${barWidthPct}%` }}
                    />
                  </div>
                )}
                {!isOver && (
                  <span className="text-[11px] text-zinc-400 font-mono hidden sm:inline">
                    {p.electionAnnee}
                  </span>
                )}
              </div>

              {/* Center Pivot Label */}
              <div className="w-48 shrink-0 text-center z-20 px-2">
                <div className="flex items-center justify-center gap-1.5">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: p.couleurHex }}
                  />
                  <span className="font-semibold text-white truncate max-w-[130px]" title={p.nom}>
                    {p.nom}
                  </span>
                </div>
                <div className="text-[10px] text-zinc-400 flex items-center justify-center gap-1 mt-0.5">
                  <span>{p.parti}</span>
                  <span>•</span>
                  <span>{p.electionAnnee}</span>
                </div>
              </div>

              {/* Right Column: Underestimation Bars (spread towards right from center) */}
              <div className="w-1/2 flex items-center justify-start pl-4 relative">
                {isUnder && (
                  <div className="flex items-center gap-2 w-full justify-start">
                    <div
                      className="h-6 rounded-r-md bg-gradient-to-r from-emerald-600 to-emerald-900/60 shadow-sm border-y border-r border-emerald-500/30 transition-all group-hover:brightness-125"
                      style={{ width: `${barWidthPct}%` }}
                    />
                    <span className="text-[11px] font-mono font-bold text-emerald-400">
                      {formatPoints(p.delta)}
                    </span>
                  </div>
                )}
                {!isUnder && (
                  <span className="text-[11px] text-zinc-400 font-mono hidden sm:inline">
                    {p.electionAnnee}
                  </span>
                )}
              </div>

              {/* Dynamic badge on extreme shocks */}
              {p.absDelta >= 3.5 && (
                <div className="absolute right-2 top-2 hidden lg:flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-950/60 text-amber-300 border border-amber-800/60">
                  <AlertTriangle className="w-3 h-3 text-amber-400" />
                  <span>Écart majeur &gt; 3.5 pts</span>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
