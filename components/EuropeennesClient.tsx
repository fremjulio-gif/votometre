"use client";

import { useState } from "react";
import { ScoreBarChart } from "./ScoreBarChart";
import { TruthScatter } from "./TruthScatter";
import { StatPoint } from "@/lib/stats";
import { formaterPct } from "@/lib/metrics";
import { motion, AnimatePresence } from "framer-motion";

interface EuroElection {
  annee: number;
  slug: string;
  cadre: string;
  siegesFrance: number;
  points: StatPoint[];
  tauxAbstention: number | null;
  contexte: string;
}

interface EuropeennesClientProps {
  elections: EuroElection[];
}

export function EuropeennesClient({ elections }: EuropeennesClientProps) {
  const [selectedYear, setSelectedYear] = useState<number>(2024);

  const current = elections.find((e) => e.annee === selectedYear) || elections[0];

  return (
    <div className="space-y-10">
      {/* Header & Year Selector with Sliding Pill */}
      <div className="flex flex-col md:flex-row md:items-baseline justify-between gap-4 pb-6 border-b border-border">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
            Élections Européennes
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-foreground tracking-tight">
            L'Urne contre le Sondage
          </h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-xl">
            Du scrutin interrégional à la circonscription nationale unique : comment les listes ont performé face au seuil éliminatoire de 5%.
          </p>
        </div>

        {/* Clean Pill Selector */}
        <div className="flex flex-wrap items-center gap-1 bg-muted/60 p-1 rounded-xl self-start md:self-auto border border-border/50">
          {[2024, 2019, 2014, 2009, 2004].map((year) => (
            <button
              key={year}
              onClick={() => setSelectedYear(year)}
              className="relative px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors z-10 text-muted-foreground hover:text-foreground"
            >
              {selectedYear === year && (
                <motion.div
                  layoutId="euroYearPill"
                  className="absolute inset-0 bg-card rounded-lg shadow-sm border border-border -z-10"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <span className={selectedYear === year ? "text-foreground font-black" : ""}>
                {year}
              </span>
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={`euro-${selectedYear}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.25 }}
          className="space-y-8"
        >
          {/* Institutional Context banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-card border border-border text-xs shadow-sm">
            <div>
              <span className="font-bold text-foreground">
                Cadre électoral ({selectedYear}) :
              </span>{" "}
              <span className="text-muted-foreground">{current.cadre}</span>
            </div>
            <div className="flex items-center gap-4 text-muted-foreground">
              <span>
                Sièges alloués à la France : <strong>{current.siegesFrance}</strong>
              </span>
              {current.tauxAbstention && (
                <span>
                  Abstention : <strong>{formaterPct(current.tauxAbstention)}</strong>
                </span>
              )}
            </div>
          </div>

          {/* Editorial context brief */}
          {current.contexte && (
            <div className="p-4 rounded-xl border border-border bg-card text-xs text-muted-foreground leading-relaxed shadow-sm">
              <strong className="text-foreground font-semibold">Ce qu'il s'est passé en {selectedYear} :</strong> {current.contexte}
            </div>
          )}

          {/* 1. Baromètre horizontal d'écart */}
          <ScoreBarChart
            points={current.points}
            title={`Qui a créé la surprise aux Européennes ${selectedYear} ?`}
            subtitle="Listes ayant fait mieux (à droite) ou moins bien (à gauche) que les dernières prévisions"
          />

          {/* 2. Nuage de corrélation allégé */}
          <TruthScatter
            points={current.points}
            title={`La Confrontation Directe — Européennes ${selectedYear}`}
            subtitle="Chaque point correspond à une liste nationale face à la ligne de vérité"
          />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
