"use client";

import { useState } from "react";
import { ScoreBarChart } from "./ScoreBarChart";
import { TruthScatter } from "./TruthScatter";
import { StatPoint } from "@/lib/stats";
import { formaterPct } from "@/lib/metrics";

interface ElectionMeta {
  annee: number;
  tour: number;
  slug: string;
  date: string;
  tauxAbstention?: number | null;
  points: StatPoint[];
  resume: string;
}

interface ProspectifData {
  annee: number;
  vagues: {
    institut: string;
    commanditaire?: string | null;
    datePublication: string;
    hypothese: string;
    mesures: {
      candidatNom: string;
      parti: string;
      famille: string;
      couleurHex: string;
      intentionPct: number;
    }[];
  }[];
}

interface PresidentiellesClientProps {
  electionsData: ElectionMeta[];
  prospectifData: ProspectifData;
}

export function PresidentiellesClient({
  electionsData,
  prospectifData,
}: PresidentiellesClientProps) {
  const [selectedTab, setSelectedTab] = useState<number | "2027">(2022);
  const [selectedTour, setSelectedTour] = useState<1 | 2>(1);

  const currentElection =
    electionsData.find((e) => e.annee === selectedTab && e.tour === selectedTour) ||
    electionsData.find((e) => e.annee === selectedTab) ||
    electionsData[0];

  return (
    <div className="space-y-10">
      {/* Header & Sober Year Selector */}
      <div className="flex flex-col md:flex-row md:items-baseline justify-between gap-4 pb-6 border-b border-border">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
            Élection Présidentielle
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-foreground tracking-tight">
            L'Urne contre le Sondage
          </h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-xl">
            Comparez ce que les sondages annonçaient à la veille du vote avec les résultats officiels certifiés par le Conseil constitutionnel.
          </p>
        </div>

        {/* Clean Pill Selector */}
        <div className="flex flex-wrap items-center gap-1.5 bg-muted p-1 rounded-xl self-start md:self-auto">
          {[2022, 2017, 2012, 2007, 2002].map((year) => (
            <button
              key={year}
              onClick={() => setSelectedTab(year)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                selectedTab === year
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {year}
            </button>
          ))}
          <button
            onClick={() => setSelectedTab("2027")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              selectedTab === "2027"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Prospectif 2027
          </button>
        </div>
      </div>

      {selectedTab !== "2027" ? (
        <div className="space-y-10">
          {/* Sub-bar: Tour 1 vs Tour 2 & Abstention Context */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-muted/40 border border-border text-xs">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-foreground">Tour de scrutin :</span>
              <div className="flex items-center bg-card rounded-lg p-0.5 border border-border">
                <button
                  onClick={() => setSelectedTour(1)}
                  className={`px-3 py-1 rounded-md font-medium transition-all ${
                    selectedTour === 1
                      ? "bg-muted text-foreground font-bold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  1er Tour
                </button>
                <button
                  onClick={() => setSelectedTour(2)}
                  className={`px-3 py-1 rounded-md font-medium transition-all ${
                    selectedTour === 2
                      ? "bg-muted text-foreground font-bold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  2d Tour (Duel final)
                </button>
              </div>
            </div>

            <div className="flex items-center gap-4 text-muted-foreground">
              <span>Date : {currentElection?.date}</span>
              {currentElection?.tauxAbstention && (
                <span>
                  Abstention : <strong>{formaterPct(currentElection.tauxAbstention)}</strong>
                </span>
              )}
            </div>
          </div>

          {/* Context brief note */}
          {currentElection?.resume && (
            <div className="p-4 rounded-xl border border-border bg-card text-xs text-muted-foreground leading-relaxed">
              <strong className="text-foreground">Ce qu'il s'est passé :</strong> {currentElection.resume}
            </div>
          )}

          {/* 1. Baromètre d'Écart Horizontal */}
          <ScoreBarChart
            points={currentElection?.points || []}
            title={`Qui a créé la surprise en ${selectedTab} (Tour ${selectedTour}) ?`}
            subtitle="Candidats ayant fait mieux (à droite) ou moins bien (à gauche) que les sondages de veille"
          />

          {/* 2. Nuage de Corrélation Allégé */}
          <TruthScatter
            points={currentElection?.points || []}
            title={`La Confrontation Directe — Présidentielle ${selectedTab}`}
            subtitle="Chaque point correspond à un candidat face à la ligne de vérité"
          />
        </div>
      ) : (
        /* PROSPECTIF 2027 */
        <div className="space-y-6">
          <div className="editorial-card p-6">
            <h2 className="text-xl font-bold text-foreground mb-1">
              Sondages Prospectifs — Élection Présidentielle 2027
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              À ce stade du quinquennat, les instituts mesurent les rapports de force en testant différentes hypothèses de candidatures au centre et à droite.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {prospectifData.vagues.map((vague, idx) => (
              <div key={idx} className="editorial-card p-6 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-border text-xs">
                  <span className="font-bold text-foreground">
                    {vague.institut} {vague.commanditaire ? `(pour ${vague.commanditaire})` : ""}
                  </span>
                  <span className="text-muted-foreground font-mono">
                    {vague.datePublication}
                  </span>
                </div>

                <div className="text-xs font-semibold px-2.5 py-1 rounded-md bg-secondary text-foreground inline-block">
                  {vague.hypothese}
                </div>

                <div className="space-y-2.5 pt-2">
                  {vague.mesures.map((m) => (
                    <div key={m.candidatNom} className="space-y-1 text-xs">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: m.couleurHex }}
                          />
                          <span className="font-semibold text-foreground">
                            {m.candidatNom}
                          </span>
                          <span className="text-muted-foreground text-[11px]">
                            ({m.parti})
                          </span>
                        </div>
                        <span className="font-bold text-foreground font-mono">
                          {formaterPct(m.intentionPct)}
                        </span>
                      </div>
                      <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${(m.intentionPct / 40) * 100}%`,
                            backgroundColor: m.couleurHex,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
