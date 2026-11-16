"use client";

import { useState } from "react";
import { InteractiveHemicycle } from "@/components/dataviz/InteractiveHemicycle";
import { Landmark, CheckCircle2, XCircle, AlertTriangle, ArrowRight } from "lucide-react";
import { formatNumber } from "@/lib/utils";

interface LegislativesData {
  annee: number;
  realGroups: {
    nom: string;
    parti: string;
    famille: string;
    couleurHex: string;
    sieges: number;
    pct?: number;
    statut?: string | null;
  }[];
  predictedBlocs: {
    nom: string;
    parti: string;
    famille: string;
    couleurHex: string;
    siegesMin: number;
    siegesMax: number;
    siegesEstimes: number;
  }[];
  comparaisons: {
    bloc: string;
    siegesMin: number;
    siegesMax: number;
    siegesReels: number;
    dansFourchette: boolean;
    ecart: number;
    couleurHex: string;
  }[];
  contexte: string;
}

interface LegislativesClientProps {
  yearsData: Record<number, LegislativesData>;
}

export function LegislativesClient({ yearsData }: LegislativesClientProps) {
  const years = [2024, 2022, 2017, 2012, 2007, 2002];
  const [selectedYear, setSelectedYear] = useState<number>(2024);

  const current = yearsData[selectedYear] || yearsData[2024];

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-zinc-800">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-950/80 text-amber-300 text-xs font-semibold mb-2 border border-amber-700/60">
            <Landmark className="w-3.5 h-3.5" />
            <span>Élections Législatives & Assemblée Nationale</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            L'Observatoire des Législatives (2002–2024)
          </h1>
          <p className="text-sm text-zinc-400 mt-1 max-w-2xl">
            La bataille des 577 circonscriptions : découvrez si les instituts ont correctement anticipé la majorité absolue (seuil de 289 députés) et les bascules de pouvoir.
          </p>
        </div>

        {/* Year Tabs */}
        <div className="flex flex-wrap items-center gap-2 bg-zinc-900 p-1.5 rounded-2xl border border-zinc-800">
          {years.map((year) => (
            <button
              key={year}
              onClick={() => setSelectedYear(year)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedYear === year
                  ? "bg-amber-600 text-white shadow-md shadow-amber-600/30"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
              }`}
            >
              {year === 2024 ? "2024 (Dissolution)" : year}
            </button>
          ))}
        </div>
      </div>

      {/* Historical context note */}
      {current?.contexte && (
        <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-900/50 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <p className="text-xs text-zinc-300 leading-relaxed">
            <strong>Contexte politique ({selectedYear}) :</strong> {current.contexte}
          </p>
        </div>
      )}

      {/* The 577-Seat Interactive Hemicycle */}
      {current && (
        <InteractiveHemicycle
          annee={selectedYear}
          realGroups={current.realGroups}
          predictedBlocs={current.predictedBlocs}
        />
      )}

      {/* Seat bracket coverage verification table */}
      <div className="glass-panel rounded-2xl border border-zinc-800 overflow-hidden shadow-2xl">
        <div className="p-5 border-b border-zinc-800 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white">
              Vérification des Fourchettes de Sièges ({selectedYear})
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Le résultat officiel est-il tombé dans la fourchette [Min - Max] annoncée par les sondeurs avant le 2d tour ?
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-900/80 text-zinc-400 uppercase font-semibold text-[11px] border-b border-zinc-800">
              <tr>
                <th className="py-3 px-4">Bloc ou Coalition</th>
                <th className="py-3 px-4 text-center">Fourchette Sondée</th>
                <th className="py-3 px-4 text-right">Sièges Réels Obtenus</th>
                <th className="py-3 px-4 text-right">Écart vs Moyenne Sondée</th>
                <th className="py-3 px-4 text-center">Dans la Fourchette ?</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {current?.comparaisons.map((c, idx) => (
                <tr key={idx} className="hover:bg-zinc-800/30 transition-colors">
                  <td className="py-3 px-4 font-semibold text-white flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: c.couleurHex }}
                    />
                    <span>{c.bloc}</span>
                  </td>
                  <td className="py-3 px-4 text-center font-mono text-zinc-300">
                    [{c.siegesMin} – {c.siegesMax}]
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-white text-sm">
                    {c.siegesReels} sièges
                  </td>
                  <td
                    className={`py-3 px-4 text-right font-mono font-bold ${
                      c.ecart > 0
                        ? "text-emerald-400"
                        : c.ecart < 0
                        ? "text-rose-400"
                        : "text-zinc-300"
                    }`}
                  >
                    {c.ecart > 0 ? `+${c.ecart}` : c.ecart} sièges
                  </td>
                  <td className="py-3 px-4 text-center">
                    {c.dansFourchette ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-800/60">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Fourchette exacte</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-400 bg-rose-950/60 px-2.5 py-0.5 rounded-full border border-rose-800/60">
                        <XCircle className="w-3 h-3" />
                        <span>Hors fourchette</span>
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
