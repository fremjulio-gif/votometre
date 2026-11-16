"use client";

import { useState } from "react";
import { ScatterTruth } from "@/components/dataviz/ScatterTruth";
import { DivergingShockBar } from "@/components/dataviz/DivergingShockBar";
import { StatPoint } from "@/lib/stats";
import { formatPct, formatPoints } from "@/lib/utils";
import {
  Vote,
  Sparkles,
  Calendar,
  Users,
  ShieldCheck,
  TrendingUp,
  AlertCircle,
  Clock,
} from "lucide-react";

interface ElectionMeta {
  annee: number;
  tour: number;
  slug: string;
  date: string;
  inscrits?: number | null;
  votants?: number | null;
  exprimes?: number | null;
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

  // Current selected election for 2002-2022
  const currentElection = electionsData.find(
    (e) => e.annee === selectedTab && e.tour === selectedTour
  ) || electionsData.find((e) => e.annee === selectedTab) || electionsData[0];

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-zinc-800">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-950/80 text-indigo-300 text-xs font-semibold mb-2 border border-indigo-700/60">
            <Vote className="w-3.5 h-3.5" />
            <span>Élection Présidentielle de la République Française</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            L'Observatoire des Présidentielles (2002–2027)
          </h1>
          <p className="text-sm text-zinc-400 mt-1 max-w-2xl">
            Du séisme de 2002 aux duels du second tour et aux premières hypothèses pour 2027 : analyse rigoureuse de la marge d'erreur des 12 instituts.
          </p>
        </div>

        {/* Year Tabs */}
        <div className="flex flex-wrap items-center gap-2 bg-zinc-900 p-1.5 rounded-2xl border border-zinc-800">
          {[2022, 2017, 2012, 2007, 2002].map((year) => (
            <button
              key={year}
              onClick={() => setSelectedTab(year)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedTab === year
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
              }`}
            >
              {year}
            </button>
          ))}
          <button
            onClick={() => setSelectedTab("2027")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              selectedTab === "2027"
                ? "bg-amber-600 text-white shadow-md shadow-amber-600/30"
                : "text-amber-400 hover:text-amber-300 hover:bg-zinc-800"
            }`}
          >
            <Sparkles className="w-3 h-3" />
            <span>Prospectif 2027</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {selectedTab !== "2027" ? (
        <div className="space-y-10">
          {/* Tour selector and Context Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800">
            <div className="flex items-center gap-3">
              <span className="text-xs uppercase font-bold text-zinc-400 tracking-wider">
                Scrutin :
              </span>
              <div className="flex items-center rounded-lg bg-zinc-950 border border-zinc-800 p-1">
                <button
                  onClick={() => setSelectedTour(1)}
                  className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                    selectedTour === 1
                      ? "bg-zinc-800 text-white"
                      : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  1er Tour
                </button>
                <button
                  onClick={() => setSelectedTour(2)}
                  className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                    selectedTour === 2
                      ? "bg-zinc-800 text-white"
                      : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  2d Tour (Duel)
                </button>
              </div>
            </div>

            {/* Context Participation Metrics */}
            <div className="flex items-center gap-6 text-xs text-zinc-300">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-zinc-400" />
                <span>{currentElection?.date}</span>
              </div>
              {currentElection?.tauxAbstention && (
                <div className="flex items-center gap-1.5 font-mono">
                  <span className="text-zinc-400">Abstention :</span>
                  <span className="font-bold text-white">
                    {formatPct(currentElection.tauxAbstention)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Historical contextual highlight */}
          {currentElection?.resume && (
            <div className="p-4 rounded-xl bg-indigo-950/30 border border-indigo-900/50 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
              <p className="text-xs text-zinc-300 leading-relaxed">
                <strong>Analyse historique :</strong> {currentElection.resume}
              </p>
            </div>
          )}

          {/* 1. The Scatter Truth for this election */}
          <ScatterTruth
            points={currentElection?.points || []}
            title={`Le Nuage de Vérité — Présidentielle ${selectedTab} (Tour ${selectedTour})`}
            subtitle={`Confrontation point par point de chaque candidat face à la diagonale de vérité`}
          />

          {/* 2. Diverging Shock Bar for this election */}
          <DivergingShockBar
            points={currentElection?.points || []}
            title={`Le Baromètre d'Écart — Présidentielle ${selectedTab} (Tour ${selectedTour})`}
            subtitle="Sous-estimations (vert/bleu) vs Sur-estimations (rouge)"
            limit={15}
          />

          {/* Detailed table of results vs polls */}
          <div className="glass-panel rounded-2xl border border-zinc-800 overflow-hidden shadow-2xl">
            <div className="p-5 border-b border-zinc-800">
              <h3 className="text-base font-bold text-white">
                Tableau Détaillé des Écarts — {selectedTab} (Tour {selectedTour})
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-900/80 text-zinc-400 uppercase font-semibold text-[11px] border-b border-zinc-800">
                  <tr>
                    <th className="py-3 px-4">Candidat</th>
                    <th className="py-3 px-4">Parti / Nuance</th>
                    <th className="py-3 px-4 text-right">Score Sondé</th>
                    <th className="py-3 px-4 text-right">Résultat Officiel</th>
                    <th className="py-3 px-4 text-right">Écart Réel vs Sondé</th>
                    <th className="py-3 px-4 text-center">Diagnostic Statistique</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60">
                  {currentElection?.points.map((p, idx) => (
                    <tr key={idx} className="hover:bg-zinc-800/30 transition-colors">
                      <td className="py-3 px-4 font-semibold text-white flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: p.couleurHex }}
                        />
                        <span>{p.nom}</span>
                      </td>
                      <td className="py-3 px-4 text-zinc-400">{p.parti}</td>
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
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                            p.statutMarge === "SOUS_ESTIME"
                              ? "bg-emerald-950/60 text-emerald-300 border border-emerald-800/50"
                              : p.statutMarge === "SUR_ESTIME"
                              ? "bg-rose-950/60 text-rose-300 border border-rose-800/50"
                              : "bg-indigo-950/60 text-indigo-300 border border-indigo-800/50"
                          }`}
                        >
                          {p.statutMarge === "SOUS_ESTIME"
                            ? "Sous-estimé (Vote caché)"
                            : p.statutMarge === "SUR_ESTIME"
                            ? "Sur-estimé (Bulle)"
                            : "Dans la marge (±1.5 pt)"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* SPECIAL SECTION: PROSPECTIF 2027 */
        <div className="space-y-8">
          <div className="p-6 rounded-2xl bg-gradient-to-r from-amber-950/30 via-zinc-900 to-zinc-900 border border-amber-600/40">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-sm mb-2">
              <Sparkles className="w-4 h-4" />
              <span>Sondages Prospectifs — Élection Présidentielle 2027</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white mb-2">
              Les hypothèses de candidatures testées par les instituts
            </h3>
            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed max-w-3xl">
              À ce stade du cycle électoral, les instituts testent différents scénarios au centre et à droite (hypothèse Édouard Philippe vs hypothèse Gabriel Attal) face au bloc nationaliste (Marine Le Pen) et aux gauches divisées.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {prospectifData.vagues.map((vague, idx) => (
              <div
                key={idx}
                className="glass-panel p-6 rounded-2xl border border-zinc-800 shadow-2xl flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between pb-3 mb-4 border-b border-zinc-800 text-xs">
                    <div>
                      <span className="font-bold text-white text-sm">
                        {vague.institut}
                      </span>
                      {vague.commanditaire && (
                        <span className="text-zinc-400 ml-1.5">
                          pour {vague.commanditaire}
                        </span>
                      )}
                    </div>
                    <span className="text-zinc-400 font-mono">
                      {vague.datePublication}
                    </span>
                  </div>

                  <div className="mb-4">
                    <span className="text-xs uppercase font-extrabold tracking-wider text-amber-400 bg-amber-950/60 px-2.5 py-1 rounded-md border border-amber-800/40">
                      {vague.hypothese}
                    </span>
                  </div>

                  {/* Horizontal Bar Chart for this hypothesis */}
                  <div className="space-y-3">
                    {vague.mesures.map((m) => (
                      <div key={m.candidatNom} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-1.5 font-semibold text-white">
                            <span
                              className="w-2.5 h-2.5 rounded-full"
                              style={{ backgroundColor: m.couleurHex }}
                            />
                            <span>{m.candidatNom}</span>
                            <span className="text-[10px] text-zinc-400 font-normal">
                              ({m.parti})
                            </span>
                          </div>
                          <span className="font-mono font-bold text-white text-xs">
                            {formatPct(m.intentionPct)}
                          </span>
                        </div>
                        <div className="w-full h-3 bg-zinc-800 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
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

                <div className="mt-6 pt-4 border-t border-zinc-800 flex items-center justify-between text-[11px] text-zinc-400">
                  <span>Enquête d'intentions de vote 1er tour</span>
                  <span>Marge d'erreur standard : ±2.5 pts</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
