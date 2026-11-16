"use client";

import { useState, useMemo } from "react";
import { ArrowRightLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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

function generateHemicycleCoords(totalSeats = 577) {
  const rows = [40, 50, 60, 70, 80, 89, 94, 94]; // 577 seats
  const rMin = 95;
  const rMax = 215;
  const dr = (rMax - rMin) / (rows.length - 1);

  const dots: { x: number; y: number; index: number }[] = [];
  let seatIndex = 0;

  rows.forEach((count, rowIndex) => {
    const r = rMin + rowIndex * dr;
    for (let c = 0; c < count; c++) {
      const angle = Math.PI - (c / (count - 1)) * Math.PI;
      const x = 250 + r * Math.cos(angle);
      const y = 235 - r * Math.sin(angle);
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
  const [hoveredGroupName, setHoveredGroupName] = useState<string | null>(null);
  const [activeInfo, setActiveInfo] = useState<{
    nom: string;
    sieges: number;
    pct?: number;
    fourchette?: string;
    couleurHex?: string;
  } | null>(null);

  const dots = useMemo(() => generateHemicycleCoords(577), []);

  const realSeatAssignments = useMemo(() => {
    const assignments: { group: ParliamentaryGroup }[] = [];
    let currentSeat = 0;
    for (const grp of realGroups) {
      for (let s = 0; s < grp.sieges; s++) {
        if (currentSeat < 577) {
          assignments.push({ group: grp });
          currentSeat++;
        }
      }
    }
    while (assignments.length < 577) {
      assignments.push({
        group: {
          nom: "Autres",
          parti: "DIV",
          famille: "Autre",
          couleurHex: "#94a3b8",
          sieges: 1,
        },
      });
    }
    return assignments;
  }, [realGroups]);

  const predictedSeatAssignments = useMemo(() => {
    const assignments: { bloc: PredictedBloc }[] = [];
    let currentSeat = 0;
    for (const bloc of predictedBlocs) {
      for (let s = 0; s < bloc.siegesEstimes; s++) {
        if (currentSeat < 577) {
          assignments.push({ bloc });
          currentSeat++;
        }
      }
    }
    while (assignments.length < 577) {
      assignments.push({
        bloc: {
          nom: "Autres",
          parti: "DIV",
          famille: "Autre",
          couleurHex: "#94a3b8",
          siegesMin: 0,
          siegesMax: 0,
          siegesEstimes: 1,
        },
      });
    }
    return assignments;
  }, [predictedBlocs]);

  const renderHalfHemicycle = (title: string, subtitle: string, isPredicted: boolean) => (
    <div className="editorial-card p-5 sm:p-6 flex flex-col items-center relative overflow-hidden">
      <div className="w-full flex items-baseline justify-between mb-3 pb-3 border-b border-border">
        <div>
          <h4 className="font-extrabold text-sm sm:text-base text-foreground tracking-tight">{title}</h4>
          <p className="text-[11px] text-muted-foreground">{subtitle}</p>
        </div>
        <span className="text-xs font-mono font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded-md">
          577 sièges
        </span>
      </div>

      <div className="w-full max-w-[440px] relative py-2">
        <svg viewBox="0 0 500 260" className="w-full h-auto select-none overflow-visible">
          {/* Ligne rouge de la majorité absolue (289 sièges) */}
          <line
            x1="250"
            y1="235"
            x2="250"
            y2="15"
            stroke="#ef4444"
            strokeWidth="1.5"
            strokeDasharray="4 3"
            className="opacity-80"
          />
          <text
            x="250"
            y="10"
            textAnchor="middle"
            className="fill-red-500 dark:fill-red-400 text-[10px] font-bold tracking-wider uppercase"
          >
            Majorité : 289
          </text>

          {/* Semicircle tribune floor */}
          <path
            d="M 185,235 A 65,65 0 0,1 315,235"
            fill="none"
            stroke="currentColor"
            className="text-border"
            strokeWidth="1.5"
          />

          {/* 577 points with dynamic opacity and hover pulse */}
          {dots.map((dot, idx) => {
            const groupName = isPredicted
              ? predictedSeatAssignments[idx]?.bloc?.nom
              : realSeatAssignments[idx]?.group?.nom;

            const color = isPredicted
              ? predictedSeatAssignments[idx]?.bloc?.couleurHex || "#94a3b8"
              : realSeatAssignments[idx]?.group?.couleurHex || "#94a3b8";

            const isDimmed = hoveredGroupName !== null && hoveredGroupName !== groupName;
            const isHighlighted = hoveredGroupName !== null && hoveredGroupName === groupName;

            return (
              <circle
                key={idx}
                cx={dot.x}
                cy={dot.y}
                r={isHighlighted ? "3.8" : "3.0"}
                fill={color}
                opacity={isDimmed ? 0.25 : 1}
                className="cursor-pointer transition-all duration-150"
                onMouseEnter={() => {
                  if (groupName) setHoveredGroupName(groupName);
                  if (isPredicted) {
                    const b = predictedSeatAssignments[idx]?.bloc;
                    if (b) setActiveInfo({ nom: b.nom, sieges: b.siegesEstimes, fourchette: `Entre ${b.siegesMin} et ${b.siegesMax} sièges`, couleurHex: b.couleurHex });
                  } else {
                    const g = realSeatAssignments[idx]?.group;
                    if (g) setActiveInfo({ nom: g.nom, sieges: g.sieges, pct: g.pct, couleurHex: g.couleurHex });
                  }
                }}
                onMouseLeave={() => setHoveredGroupName(null)}
                onClick={() => {
                  if (groupName) setHoveredGroupName(groupName);
                }}
              />
            );
          })}
        </svg>
      </div>

      {/* Legend list below */}
      <div className="w-full mt-4 space-y-1.5 pt-3 border-t border-border">
        {isPredicted
          ? predictedBlocs.slice(0, 5).map((b) => {
              const isHovered = hoveredGroupName === b.nom;
              return (
                <div
                  key={b.nom}
                  onMouseEnter={() => {
                    setHoveredGroupName(b.nom);
                    setActiveInfo({ nom: b.nom, sieges: b.siegesEstimes, fourchette: `Entre ${b.siegesMin} et ${b.siegesMax} sièges`, couleurHex: b.couleurHex });
                  }}
                  onMouseLeave={() => setHoveredGroupName(null)}
                  className={`flex items-center justify-between text-xs py-1 px-2 rounded-lg transition-colors cursor-pointer ${
                    isHovered ? "bg-muted/80 font-bold" : "hover:bg-muted/40"
                  }`}
                >
                  <div className="flex items-center gap-2 truncate max-w-[220px]">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm"
                      style={{ backgroundColor: b.couleurHex }}
                    />
                    <span className="truncate text-foreground font-medium">{b.nom}</span>
                  </div>
                  <div className="flex items-center gap-2 font-mono">
                    <span className="text-[11px] text-muted-foreground">
                      [{b.siegesMin}–{b.siegesMax}]
                    </span>
                    <span className="font-bold text-foreground">
                      ~{b.siegesEstimes}
                    </span>
                  </div>
                </div>
              );
            })
          : realGroups.slice(0, 6).map((g) => {
              const isHovered = hoveredGroupName === g.nom;
              return (
                <div
                  key={g.nom}
                  onMouseEnter={() => {
                    setHoveredGroupName(g.nom);
                    setActiveInfo({ nom: g.nom, sieges: g.sieges, pct: g.pct, couleurHex: g.couleurHex });
                  }}
                  onMouseLeave={() => setHoveredGroupName(null)}
                  className={`flex items-center justify-between text-xs py-1 px-2 rounded-lg transition-colors cursor-pointer ${
                    isHovered ? "bg-muted/80 font-bold" : "hover:bg-muted/40"
                  }`}
                >
                  <div className="flex items-center gap-2 truncate max-w-[220px]">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm"
                      style={{ backgroundColor: g.couleurHex }}
                    />
                    <span className="truncate text-foreground font-medium">{g.nom}</span>
                  </div>
                  <span className="font-mono font-bold text-foreground">
                    {g.sieges} sièges
                  </span>
                </div>
              );
            })}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Switcher header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border">
        <div>
          <h3 className="text-lg font-bold text-foreground tracking-tight">
            L'Hémicycle : Ce que prévoyaient les sondages vs La réalité élue ({annee})
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground">
            La ligne rouge centrale matérialise le seuil critique de la majorité absolue (289 sièges sur 577).
          </p>
        </div>

        <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-xl text-xs self-start sm:self-auto border border-border/50">
          {[
            { id: "dual", label: "Face-à-Face", icon: ArrowRightLeft },
            { id: "predicted", label: "Sondages", icon: null },
            { id: "real", label: "Réalité élue", icon: null },
          ].map((mode) => {
            const Icon = mode.icon;
            return (
              <button
                key={mode.id}
                onClick={() => setViewMode(mode.id as any)}
                className="relative px-3 py-1.5 rounded-lg font-semibold transition-colors text-xs z-10 text-muted-foreground hover:text-foreground flex items-center gap-1.5"
              >
                {viewMode === mode.id && (
                  <motion.div
                    layoutId="hemicycleModePill"
                    className="absolute inset-0 bg-card rounded-lg shadow-sm border border-border -z-10"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                {Icon && <Icon className="w-3.5 h-3.5" />}
                <span className={viewMode === mode.id ? "text-foreground font-bold" : ""}>
                  {mode.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected item highlight banner with fluid animation */}
      <AnimatePresence>
        {activeInfo && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="p-3.5 rounded-xl bg-card border border-border/80 shadow-sm text-xs flex items-center justify-between"
          >
            <div className="flex items-center gap-2.5">
              {activeInfo.couleurHex && (
                <span
                  className="w-3.5 h-3.5 rounded-full shrink-0 shadow-sm"
                  style={{ backgroundColor: activeInfo.couleurHex }}
                />
              )}
              <span className="font-extrabold text-foreground">{activeInfo.nom}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-mono font-bold text-foreground">
                {activeInfo.fourchette || `${activeInfo.sieges} sièges`}
              </span>
              <span className="text-[11px] text-muted-foreground">
                ({((activeInfo.sieges / 577) * 100).toFixed(1)}% de l'Assemblée)
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Grid */}
      <div
        className={`grid gap-6 ${
          viewMode === "dual" ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1 max-w-xl mx-auto"
        }`}
      >
        {(viewMode === "dual" || viewMode === "predicted") &&
          renderHalfHemicycle(
            "Ce que prévoyaient les sondages",
            "Moyenne des dernières fourchettes publiées avant le vote",
            true
          )}

        {(viewMode === "dual" || viewMode === "real") &&
          renderHalfHemicycle(
            "La composition réelle élue",
            "Résultats officiels proclamés après le second tour",
            false
          )}
      </div>
    </div>
  );
}
