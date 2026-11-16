"use client";

import { useState, useMemo } from "react";
import { ArrowRightLeft } from "lucide-react";

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
  const [activeInfo, setActiveInfo] = useState<{
    nom: string;
    sieges: number;
    pct?: number;
    fourchette?: string;
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
    <div className="editorial-card p-5 flex flex-col items-center">
      <div className="w-full flex items-baseline justify-between mb-2 pb-2 border-b border-border">
        <div>
          <h4 className="font-bold text-sm text-foreground">{title}</h4>
          <p className="text-[11px] text-muted-foreground">{subtitle}</p>
        </div>
        <span className="text-xs font-mono font-bold text-muted-foreground">
          577 sièges
        </span>
      </div>

      <div className="w-full max-w-[420px] relative">
        <svg viewBox="0 0 500 260" className="w-full h-auto select-none overflow-visible">
          {/* Ligne rouge de la majorité absolue (289 sièges) */}
          <line
            x1="250"
            y1="235"
            x2="250"
            y2="15"
            stroke="#ef4444"
            strokeWidth="1.5"
            strokeDasharray="3 3"
          />
          <text
            x="250"
            y="10"
            textAnchor="middle"
            className="fill-red-500 dark:fill-red-400 text-[10px] font-bold"
          >
            Seuil de majorité absolue : 289
          </text>

          {/* Semicircle tribune floor */}
          <path
            d="M 185,235 A 65,65 0 0,1 315,235"
            fill="none"
            stroke="currentColor"
            className="text-border"
            strokeWidth="1.5"
          />

          {/* 577 points */}
          {dots.map((dot, idx) => {
            const color = isPredicted
              ? predictedSeatAssignments[idx]?.bloc?.couleurHex || "#94a3b8"
              : realSeatAssignments[idx]?.group?.couleurHex || "#94a3b8";

            return (
              <circle
                key={idx}
                cx={dot.x}
                cy={dot.y}
                r="3.2"
                fill={color}
                className="cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => {
                  if (isPredicted) {
                    const b = predictedSeatAssignments[idx]?.bloc;
                    if (b) setActiveInfo({ nom: b.nom, sieges: b.siegesEstimes, fourchette: `Entre ${b.siegesMin} et ${b.siegesMax} sièges` });
                  } else {
                    const g = realSeatAssignments[idx]?.group;
                    if (g) setActiveInfo({ nom: g.nom, sieges: g.sieges, pct: g.pct });
                  }
                }}
              />
            );
          })}
        </svg>
      </div>

      {/* Legend list below */}
      <div className="w-full mt-4 space-y-1.5 pt-3 border-t border-border">
        {isPredicted
          ? predictedBlocs.slice(0, 5).map((b) => (
              <div
                key={b.nom}
                className="flex items-center justify-between text-xs py-0.5"
              >
                <div className="flex items-center gap-2 truncate max-w-[200px]">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
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
            ))
          : realGroups.slice(0, 6).map((g) => (
              <div
                key={g.nom}
                className="flex items-center justify-between text-xs py-0.5"
              >
                <div className="flex items-center gap-2 truncate max-w-[200px]">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: g.couleurHex }}
                  />
                  <span className="truncate text-foreground font-medium">{g.nom}</span>
                </div>
                <span className="font-mono font-bold text-foreground">
                  {g.sieges} sièges
                </span>
              </div>
            ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Switcher header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border">
        <div>
          <h3 className="text-lg font-bold text-foreground">
            L'Hémicycle : Ce que prévoyaient les sondages vs La réalité élue ({annee})
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground">
            La ligne rouge centrale matérialise le seuil critique de la majorité absolue (289 sièges).
          </p>
        </div>

        <div className="flex items-center gap-1 bg-muted p-1 rounded-lg text-xs self-start sm:self-auto">
          <button
            onClick={() => setViewMode("dual")}
            className={`px-2.5 py-1 rounded-md font-medium transition-all flex items-center gap-1 ${
              viewMode === "dual"
                ? "bg-card text-foreground shadow-sm font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
            <span>Face-à-Face</span>
          </button>
          <button
            onClick={() => setViewMode("predicted")}
            className={`px-2.5 py-1 rounded-md font-medium transition-all ${
              viewMode === "predicted"
                ? "bg-card text-foreground shadow-sm font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Sondages
          </button>
          <button
            onClick={() => setViewMode("real")}
            className={`px-2.5 py-1 rounded-md font-medium transition-all ${
              viewMode === "real"
                ? "bg-card text-foreground shadow-sm font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Réalité élue
          </button>
        </div>
      </div>

      {/* Selected item highlight banner */}
      {activeInfo && (
        <div className="p-3 rounded-lg bg-secondary/80 border border-border text-xs flex items-center justify-between">
          <span className="font-bold text-foreground">{activeInfo.nom}</span>
          <span className="font-mono font-bold text-foreground">
            {activeInfo.fourchette || `${activeInfo.sieges} sièges`}
          </span>
        </div>
      )}

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
