"use client";

import { useState } from "react";
import { ScoreBarChart } from "./ScoreBarChart";
import { TruthScatter } from "./TruthScatter";
import { StatPoint } from "@/lib/stats";
import { formaterPct, formaterPoints } from "@/lib/metrics";

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
      {/* Header & Year Selector */}
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
        <div className="flex flex-wrap items-center gap-1.5 bg-muted p-1 rounded-xl self-start md:self-auto">
          {[2024, 2019, 2014, 2009, 2004].map((year) => (
            <button
              key={year}
              onClick={() => setSelectedYear(year)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                selectedYear === year
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {year}
            </button>
          ))}
        </div>
      </div>

      {/* Institutional Context banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-muted/40 border border-border text-xs">
        <div>
          <span className="font-semibold text-foreground">
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
        <div className="p-4 rounded-xl border border-border bg-card text-xs text-muted-foreground leading-relaxed">
          <strong className="text-foreground">Ce qu'il s'est passé en {selectedYear} :</strong> {current.contexte}
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

      {/* 3. Tableau épuré des sièges envoyés à Strasbourg */}
      <div className="editorial-card p-5 sm:p-7">
        <h3 className="text-base sm:text-lg font-bold text-foreground mb-1">
          Résultats Officiels &amp; Sièges Décrochés ({selectedYear})
        </h3>
        <p className="text-xs sm:text-sm text-muted-foreground mb-5">
          Seules les listes ayant franchi le seuil légal de 5% des suffrages obtiennent des députés au Parlement européen.
        </p>

        <div className="divide-y divide-border">
          {current.points.map((p, idx) => {
            const franchise5 = p.scoreReel >= 5.0;

            return (
              <div
                key={idx}
                className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: p.couleurHex }}
                  />
                  <span className="font-semibold text-foreground text-sm">
                    {p.nom}
                  </span>
                </div>

                <div className="flex items-center gap-5 text-muted-foreground font-mono">
                  <span>
                    Sondé : <strong>{formaterPct(p.scoreSonde)}</strong>
                  </span>
                  <span>
                    Réel : <strong className="text-foreground">{formaterPct(p.scoreReel)}</strong>
                  </span>
                  <span
                    className={`font-bold ${
                      p.delta > 1.5
                        ? "text-emerald-600 dark:text-emerald-400"
                        : p.delta < -1.5
                        ? "text-amber-600 dark:text-amber-400"
                        : "text-muted-foreground"
                    }`}
                  >
                    ({formaterPoints(p.delta)})
                  </span>
                </div>

                <div className="flex items-center gap-3 sm:justify-end">
                  <span className="font-bold text-foreground font-mono">
                    {p.siegesReels ?? 0} sièges
                  </span>
                  {franchise5 ? (
                    <span className="text-[10px] px-2 py-0.5 rounded-md font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/70 dark:text-emerald-300 dark:border-emerald-800">
                      Élus (&gt; 5%)
                    </span>
                  ) : (
                    <span className="text-[10px] px-2 py-0.5 rounded-md font-medium bg-muted text-muted-foreground">
                      Sous le seuil
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
