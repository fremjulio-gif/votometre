"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Landmark, ArrowRightLeft, ShieldAlert } from "lucide-react";

interface ParliamentaryGroup {
  nom: string;
  parti: string;
  famille: string;
  couleurHex: string;
  sieges: number;
  pct?: number;
  statut?: string | null;
}

interface PredictedBloc {
  nom: string;
  parti: string;
  famille: string;
  couleurHex: string;
  siegesMin: number;
  siegesMax: number;
  siegesEstimes: number;
}

interface InteractiveHemicycleProps {
  annee: number;
  realGroups: ParliamentaryGroup[];
  predictedBlocs: PredictedBloc[];
}

// Generate the 577 seat coordinates for the National Assembly semicircle
function generateHemicycleCoords(totalSeats = 577) {
  // Typical distribution of rows in the French hemicycle: 8 concentric rows
  const rows = [40, 50, 60, 70, 80, 89, 94, 94]; // sum = 577
  const rMin = 100;
  const rMax = 220;
  const dr = (rMax - rMin) / (rows.length - 1);

  const dots: { x: number; y: number; index: number }[] = [];
  let seatIndex = 0;

  rows.forEach((count, rowIndex) => {
    const r = rMin + rowIndex * dr;
    // Angle from PI (left) to 0 (right)
    for (let c = 0; c < count; c++) {
      const angle = Math.PI - (c / (count - 1)) * Math.PI;
      const x = 250 + r * Math.cos(angle);
      const y = 240 - r * Math.sin(angle);
      dots.push({ x, y, index: seatIndex++ });
    }
  });

  return dots;
}

export function InteractiveHemicycle({
  annee,
  realGroups,
  predictedBlocs,
}: InteractiveHemicycleProps) {
  const [viewMode, setViewMode] = useState<"dual" | "real" | "predicted">("dual");
  const [hoveredItem, setHoveredItem] = useState<{
    nom: string;
    sieges: number;
    pct?: number;
    couleur: string;
    fourchette?: string;
  } | null>(null);

  const dots = useMemo(() => generateHemicycleCoords(577), []);

  // Map seats to parliamentary groups for Real Assembly
  const realSeatAssignments = useMemo(() => {
    const assignments: { group: ParliamentaryGroup; seatNum: number }[] = [];
    let currentSeat = 0;
    for (const grp of realGroups) {
      for (let s = 0; s < grp.sieges; s++) {
        if (currentSeat < 577) {
          assignments.push({ group: grp, seatNum: currentSeat });
          currentSeat++;
        }
      }
    }
    // Fill remaining with unassigned if any
    while (assignments.length < 577) {
      assignments.push({
        group: {
          nom: "Non attribué",
          parti: "NI",
          famille: "Autre",
          couleurHex: "#52525b",
          sieges: 1,
        },
        seatNum: assignments.length,
      });
    }
    return assignments;
  }, [realGroups]);

  // Map seats to coalitions for Predicted Assembly
  const predictedSeatAssignments = useMemo(() => {
    const assignments: { bloc: PredictedBloc; seatNum: number }[] = [];
    let currentSeat = 0;
    for (const bloc of predictedBlocs) {
      for (let s = 0; s < bloc.siegesEstimes; s++) {
        if (currentSeat < 577) {
          assignments.push({ bloc, seatNum: currentSeat });
          currentSeat++;
        }
      }
    }
    while (assignments.length < 577) {
      assignments.push({
        bloc: {
          nom: "Autres / Non attribué",
          parti: "DIV",
          famille: "Autre",
          couleurHex: "#52525b",
          siegesMin: 0,
          siegesMax: 0,
          siegesEstimes: 1,
        },
        seatNum: assignments.length,
      });
    }
    return assignments;
  }, [predictedBlocs]);

  const renderHemicycle = (
    title: string,
    subtitle: string,
    isPredicted: boolean
  ) => {
    return (
      <div className="flex flex-col items-center p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/80 w-full relative">
        <div className="flex items-center justify-between w-full mb-3 px-2">
          <div>
            <h4 className="font-bold text-sm text-white flex items-center gap-1.5">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  isPredicted ? "bg-amber-400" : "bg-emerald-400"
                }`}
              />
              {title}
            </h4>
            <p className="text-[11px] text-zinc-400">{subtitle}</p>
          </div>
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-300">
              577 sièges
            </span>
          </div>
        </div>

        {/* SVG Hemicycle */}
        <div className="relative w-full max-w-[460px]">
          <svg viewBox="0 0 500 270" className="w-full h-auto select-none overflow-visible">
            {/* Majority threshold dividing indicator line at seat 289 (top vertical) */}
            <line
              x1="250"
              y1="240"
              x2="250"
              y2="15"
              stroke="#ef4444"
              strokeWidth="1.5"
              strokeDasharray="4 4"
            />
            <text
              x="250"
              y="10"
              textAnchor="middle"
              className="fill-red-400 text-[9px] font-bold uppercase tracking-wider"
            >
              Majorité : 289
            </text>

            {/* Semicircle tribune floor */}
            <path
              d="M 180,240 A 70,70 0 0,1 320,240"
              fill="none"
              stroke="#27272a"
              strokeWidth="2"
            />

            {/* 577 seat dots */}
            {dots.map((dot, idx) => {
              const color = isPredicted
                ? predictedSeatAssignments[idx]?.bloc?.couleurHex || "#71717a"
                : realSeatAssignments[idx]?.group?.couleurHex || "#71717a";

              return (
                <circle
                  key={`dot-${idx}`}
                  cx={dot.x}
                  cy={dot.y}
                  r="3.2"
                  fill={color}
                  className="transition-all hover:scale-150 cursor-pointer"
                  onMouseEnter={() => {
                    if (isPredicted) {
                      const b = predictedSeatAssignments[idx]?.bloc;
                      if (b) {
                        setHoveredItem({
                          nom: b.nom,
                          sieges: b.siegesEstimes,
                          couleur: b.couleurHex,
                          fourchette: `${b.siegesMin} à ${b.siegesMax} sièges`,
                        });
                      }
                    } else {
                      const g = realSeatAssignments[idx]?.group;
                      if (g) {
                        setHoveredItem({
                          nom: g.nom,
                          sieges: g.sieges,
                          pct: g.pct,
                          couleur: g.couleurHex,
                        });
                      }
                    }
                  }}
                  onMouseLeave={() => setHoveredItem(null)}
                />
              );
            })}
          </svg>
        </div>

        {/* Legend list below */}
        <div className="w-full mt-4 space-y-1.5 border-t border-zinc-800/80 pt-3">
          {isPredicted
            ? predictedBlocs.slice(0, 5).map((b) => (
                <div
                  key={b.nom}
                  className="flex items-center justify-between text-xs py-1 px-2 rounded hover:bg-zinc-800/40"
                >
                  <div className="flex items-center gap-2 truncate max-w-[220px]">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: b.couleurHex }}
                    />
                    <span className="truncate text-zinc-200 font-medium">{b.nom}</span>
                  </div>
                  <div className="flex items-center gap-2 font-mono">
                    <span className="text-[11px] text-zinc-400">
                      [{b.siegesMin} - {b.siegesMax}]
                    </span>
                    <span className="font-bold text-white text-xs">
                      ~{b.siegesEstimes}
                    </span>
                  </div>
                </div>
              ))
            : realGroups.slice(0, 6).map((g) => (
                <div
                  key={g.nom}
                  className="flex items-center justify-between text-xs py-1 px-2 rounded hover:bg-zinc-800/40"
                >
                  <div className="flex items-center gap-2 truncate max-w-[220px]">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: g.couleurHex }}
                    />
                    <span className="truncate text-zinc-200 font-medium">{g.nom}</span>
                  </div>
                  <div className="flex items-center gap-2 font-mono">
                    <span className="font-bold text-white text-xs">
                      {g.sieges} sièges
                    </span>
                    {g.pct && (
                      <span className="text-[11px] text-zinc-400">
                        ({g.pct.toFixed(1)}%)
                      </span>
                    )}
                  </div>
                </div>
              ))}
        </div>
      </div>
    );
  };

  return (
    <div className="glass-panel p-6 sm:p-8 rounded-2xl shadow-2xl relative border border-zinc-800/80">
      {/* Header & Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <Landmark className="w-5 h-5 text-indigo-400" />
              L'Hémicycle Réactif des Législatives ({annee})
            </h3>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-700/50">
              577 sièges
            </span>
          </div>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Confrontation visuelle de l'Assemblée nationale prédite par les sondeurs vs l'Assemblée réellement élue
          </p>
        </div>

        {/* View mode toggle */}
        <div className="flex items-center rounded-lg bg-zinc-900 border border-zinc-800 p-0.5 text-xs">
          <button
            onClick={() => setViewMode("dual")}
            className={`px-3 py-1.5 rounded-md font-medium transition-all flex items-center gap-1.5 ${
              viewMode === "dual"
                ? "bg-zinc-700 text-white shadow-sm"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
            <span>Face-à-Face</span>
          </button>
          <button
            onClick={() => setViewMode("predicted")}
            className={`px-3 py-1.5 rounded-md font-medium transition-all ${
              viewMode === "predicted"
                ? "bg-amber-950 text-amber-300 border border-amber-800/50 shadow-sm"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            Sondages
          </button>
          <button
            onClick={() => setViewMode("real")}
            className={`px-3 py-1.5 rounded-md font-medium transition-all ${
              viewMode === "real"
                ? "bg-emerald-950 text-emerald-300 border border-emerald-800/50 shadow-sm"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            Réel officiel
          </button>
        </div>
      </div>

      {/* Dynamic Hover Tooltip Banner */}
      <div className="min-h-[44px] mb-4 p-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800 flex items-center justify-between text-xs">
        {hoveredItem ? (
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: hoveredItem.couleur }}
              />
              <span className="font-bold text-white">{hoveredItem.nom}</span>
            </div>
            <div className="flex items-center gap-3 font-mono">
              {hoveredItem.fourchette && (
                <span className="text-zinc-400">
                  Fourchette sondeurs : {hoveredItem.fourchette}
                </span>
              )}
              <span className="font-bold text-white text-sm">
                {hoveredItem.sieges} sièges{" "}
                {hoveredItem.pct ? `(${hoveredItem.pct.toFixed(1)}%)` : ""}
              </span>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-zinc-400 text-xs">
            <ShieldAlert className="w-4 h-4 text-zinc-400" />
            <span>
              Survolez les sièges ou la légende pour explorer la composition des blocs et la majorité absolue (≥ 289)
            </span>
          </div>
        )}
      </div>

      {/* Hemicycle Grids */}
      <div
        className={`grid gap-6 ${
          viewMode === "dual" ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1 max-w-2xl mx-auto"
        }`}
      >
        {(viewMode === "dual" || viewMode === "predicted") &&
          renderHemicycle(
            "Projection Moyenne des Sondages",
            "Moyenne des dernières fourchettes publiées avant le 2nd tour",
            true
          )}

        {(viewMode === "dual" || viewMode === "real") &&
          renderHemicycle(
            "Hémicycle Réel Officiel",
            "Composition issue de la proclamation des résultats du 2nd tour",
            false
          )}
      </div>
    </div>
  );
}
