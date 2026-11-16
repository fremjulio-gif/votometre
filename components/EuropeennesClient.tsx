"use client";

import { useState } from "react";
import { ScatterTruth } from "@/components/dataviz/ScatterTruth";
import { DivergingShockBar } from "@/components/dataviz/DivergingShockBar";
import { StatPoint } from "@/lib/stats";
import { formatPct, formatPoints } from "@/lib/utils";
import { Globe2, ShieldAlert, Award, Calendar, CheckCircle2 } from "lucide-react";

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
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-zinc-800">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-950/80 text-sky-300 text-xs font-semibold mb-2 border border-sky-700/60">
            <Globe2 className="w-3.5 h-3.5" />
            <span>Parlement Européen & Circonscription France</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            L'Observatoire des Européennes (2004–2024)
          </h1>
          <p className="text-sm text-zinc-400 mt-1 max-w-2xl">
            Du scrutin interrégional à la circonscription nationale unique : analyse de la précision des projections en % et des sièges alloués à Strasbourg (seuil éliminatoire de 5%).
          </p>
        </div>

        {/* Year Selector */}
        <div className="flex flex-wrap items-center gap-2 bg-zinc-900 p-1.5 rounded-2xl border border-zinc-800">
          {[2024, 2019, 2014, 2009, 2004].map((year) => (
            <button
              key={year}
              onClick={() => setSelectedYear(year)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedYear === year
                  ? "bg-sky-600 text-white shadow-md shadow-sky-600/30"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
              }`}
            >
              {year}
            </button>
          ))}
        </div>
      </div>

      {/* Cadre institutionnel banner */}
      <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-white font-semibold">
            <ShieldAlert className="w-4 h-4 text-sky-400" />
            <span>Cadre électoral ({selectedYear}) : {current.cadre}</span>
          </div>
          <p className="text-zinc-400">
            {selectedYear >= 2019
              ? "Circonscription nationale unique avec seuil de 5% des suffrages exprimés."
              : "8 grandes euro-régions interrégionales (Île-de-France, Nord-Ouest, Ouest, Est, Massif Central-Centre, Sud-Ouest, Sud-Est, Outre-Mer)."}
          </p>
        </div>

        <div className="flex items-center gap-5 text-zinc-300">
          <div className="flex items-center gap-1.5">
            <span className="text-zinc-400">Sièges France :</span>
            <span className="font-bold text-white font-mono text-sm">
              {current.siegesFrance}
            </span>
          </div>
          {current.tauxAbstention && (
            <div className="flex items-center gap-1.5">
              <span className="text-zinc-400">Abstention :</span>
              <span className="font-bold text-white font-mono">
                {formatPct(current.tauxAbstention)}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Dataviz 1 : Scatter Truth for Europeans */}
      <ScatterTruth
        points={current.points}
        title={`Le Nuage de Vérité — Élections Européennes ${selectedYear}`}
        subtitle="Confrontation des listes nationales : intentions de vote sondées vs scores officiels proclamés"
      />

      {/* Dataviz 2 : Diverging Shock Bar for Europeans */}
      <DivergingShockBar
        points={current.points}
        title={`Le Baromètre d'Écart — Élections Européennes ${selectedYear}`}
        subtitle="Quelles listes ont surperformé ou sous-performé par rapport aux derniers sondages ?"
      />

      {/* Seats Comparison Table */}
      <div className="glass-panel rounded-2xl border border-zinc-800 overflow-hidden shadow-2xl">
        <div className="p-5 border-b border-zinc-800">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-400" />
            Scores et Sièges au Parlement Européen ({selectedYear})
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-900/80 text-zinc-400 uppercase font-semibold text-[11px] border-b border-zinc-800">
              <tr>
                <th className="py-3 px-4">Liste & Tête de Liste</th>
                <th className="py-3 px-4 text-right">Score Sondé</th>
                <th className="py-3 px-4 text-right">Score Réel</th>
                <th className="py-3 px-4 text-right">Écart</th>
                <th className="py-3 px-4 text-center">Fourchette Sièges</th>
                <th className="py-3 px-4 text-right">Sièges Réels</th>
                <th className="py-3 px-4 text-center">Seuil 5%</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {current.points.map((p, idx) => {
                const franchise5 = p.scoreReel >= 5.0;

                return (
                  <tr key={idx} className="hover:bg-zinc-800/30 transition-colors">
                    <td className="py-3 px-4 font-semibold text-white flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: p.couleurHex }}
                      />
                      <span>{p.nom}</span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-zinc-300">
                      {formatPct(p.scoreSonde)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-white text-sm">
                      {formatPct(p.scoreReel)}
                    </td>
                    <td
                      className={`py-3 px-4 text-right font-mono font-bold ${
                        p.delta > 1.5
                          ? "text-emerald-400"
                          : p.delta < -1.5
                          ? "text-rose-400"
                          : "text-zinc-300"
                      }`}
                    >
                      {formatPoints(p.delta)}
                    </td>
                    <td className="py-3 px-4 text-center font-mono text-zinc-400">
                      {p.siegesMin !== null && p.siegesMax !== null
                        ? `[${p.siegesMin} – ${p.siegesMax}]`
                        : "—"}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-white text-sm">
                      {p.siegesReels ?? 0} sièges
                    </td>
                    <td className="py-3 px-4 text-center">
                      {franchise5 ? (
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-950/60 text-emerald-300 border border-emerald-800/60">
                          Élus (&gt; 5%)
                        </span>
                      ) : (
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-zinc-800 text-zinc-400 border border-zinc-700">
                          Non éligible (&lt; 5%)
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
