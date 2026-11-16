"use client";

import { motion } from "framer-motion";
import { InstitutMetrics } from "@/lib/stats";
import { formatPoints } from "@/lib/utils";
import { Trophy, Medal, Award, TrendingUp, TrendingDown, Target, HelpCircle } from "lucide-react";

interface LeaderboardPodiumProps {
  instituts: InstitutMetrics[];
}

export function LeaderboardPodium({ instituts }: LeaderboardPodiumProps) {
  const top3 = instituts.slice(0, 3);
  const remaining = instituts.slice(3);

  return (
    <div className="space-y-8">
      {/* Top 3 Podium Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end pt-4">
        {/* 2nd place (Silver) */}
        {top3[1] && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-panel p-6 rounded-2xl border border-zinc-700/60 relative overflow-hidden flex flex-col items-center text-center order-2 md:order-1"
          >
            <div className="w-12 h-12 rounded-2xl bg-zinc-800 text-zinc-300 border border-zinc-600 flex items-center justify-center mb-3 shadow-lg">
              <Medal className="w-6 h-6 text-slate-300" />
            </div>
            <span className="text-xs uppercase font-extrabold tracking-widest text-slate-300 bg-zinc-800/80 px-2.5 py-0.5 rounded-full border border-zinc-600 mb-2">
              2e Place — Argent
            </span>
            <h4 className="text-lg font-bold text-white mb-1">{top3[1].nom}</h4>
            <div className="text-3xl font-extrabold text-white font-mono my-2">
              {top3[1].mae.toFixed(2)}{" "}
              <span className="text-xs font-sans text-zinc-400 font-normal">pts MAE</span>
            </div>
            <p className="text-xs text-zinc-400">
              {top3[1].totalMesures} mesures vérifiées • {top3[1].tauxDansMarge}% dans la marge
            </p>
            <div className="w-full mt-4 pt-4 border-t border-zinc-800 flex items-center justify-between text-xs">
              <span className="text-zinc-400">Biais moyen :</span>
              <span
                className={`font-mono font-semibold ${
                  top3[1].biaisMoyen > 0 ? "text-emerald-400" : "text-rose-400"
                }`}
              >
                {formatPoints(top3[1].biaisMoyen)}
              </span>
            </div>
          </motion.div>
        )}

        {/* 1st place (Gold) */}
        {top3[0] && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0 }}
            className="glass-panel p-7 rounded-2xl border-2 border-amber-500/60 bg-gradient-to-b from-amber-500/10 via-zinc-900/90 to-zinc-950 relative overflow-hidden flex flex-col items-center text-center order-1 md:order-2 shadow-2xl shadow-amber-500/10"
          >
            <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center justify-center mb-3 shadow-lg shadow-amber-500/20">
              <Trophy className="w-8 h-8 text-amber-400" />
            </div>
            <span className="text-xs uppercase font-extrabold tracking-widest text-amber-300 bg-amber-950/80 px-3 py-1 rounded-full border border-amber-600/60 mb-2 shadow-sm">
              1re Place — Or
            </span>
            <h4 className="text-xl font-extrabold text-white mb-1">{top3[0].nom}</h4>
            <div className="text-4xl font-black text-amber-400 font-mono my-2">
              {top3[0].mae.toFixed(2)}{" "}
              <span className="text-sm font-sans text-zinc-300 font-normal">pts MAE</span>
            </div>
            <p className="text-xs text-zinc-300">
              {top3[0].totalMesures} mesures vérifiées • {top3[0].tauxDansMarge}% dans la marge
            </p>
            <div className="w-full mt-5 pt-4 border-t border-amber-500/20 flex items-center justify-between text-xs">
              <span className="text-zinc-300 font-medium">Biais moyen systématique :</span>
              <span
                className={`font-mono font-bold ${
                  top3[0].biaisMoyen > 0 ? "text-emerald-400" : "text-rose-400"
                }`}
              >
                {formatPoints(top3[0].biaisMoyen)}
              </span>
            </div>
          </motion.div>
        )}

        {/* 3rd place (Bronze) */}
        {top3[2] && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-panel p-6 rounded-2xl border border-amber-900/40 relative overflow-hidden flex flex-col items-center text-center order-3"
          >
            <div className="w-12 h-12 rounded-2xl bg-amber-950/40 text-amber-600 border border-amber-800/60 flex items-center justify-center mb-3 shadow-lg">
              <Award className="w-6 h-6 text-amber-600" />
            </div>
            <span className="text-xs uppercase font-extrabold tracking-widest text-amber-500 bg-amber-950/60 px-2.5 py-0.5 rounded-full border border-amber-900 mb-2">
              3e Place — Bronze
            </span>
            <h4 className="text-lg font-bold text-white mb-1">{top3[2].nom}</h4>
            <div className="text-3xl font-extrabold text-white font-mono my-2">
              {top3[2].mae.toFixed(2)}{" "}
              <span className="text-xs font-sans text-zinc-400 font-normal">pts MAE</span>
            </div>
            <p className="text-xs text-zinc-400">
              {top3[2].totalMesures} mesures vérifiées • {top3[2].tauxDansMarge}% dans la marge
            </p>
            <div className="w-full mt-4 pt-4 border-t border-zinc-800 flex items-center justify-between text-xs">
              <span className="text-zinc-400">Biais moyen :</span>
              <span
                className={`font-mono font-semibold ${
                  top3[2].biaisMoyen > 0 ? "text-emerald-400" : "text-rose-400"
                }`}
              >
                {formatPoints(top3[2].biaisMoyen)}
              </span>
            </div>
          </motion.div>
        )}
      </div>

      {/* Complete Interactive Table */}
      <div className="glass-panel rounded-2xl border border-zinc-800/80 overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Target className="w-5 h-5 text-indigo-400" />
              Classement Général de Précision des Instituts
            </h3>
            <p className="text-xs text-zinc-400 mt-1">
              Classé par Erreur Absolue Moyenne (MAE) la plus faible sur l'ensemble des 20 dernières années
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-zinc-400 bg-zinc-900 px-3 py-1.5 rounded-lg border border-zinc-800">
            <HelpCircle className="w-3.5 h-3.5 text-zinc-400" />
            <span>Plus la MAE est basse, plus l'institut est précis</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-900/80 border-b border-zinc-800 text-zinc-400 uppercase font-semibold tracking-wider text-[11px]">
              <tr>
                <th className="py-3.5 px-4 text-center w-16">Rang</th>
                <th className="py-3.5 px-4">Institut</th>
                <th className="py-3.5 px-4 text-center">Score Fiabilité</th>
                <th className="py-3.5 px-4 text-right">MAE (Erreur Moyenne)</th>
                <th className="py-3.5 px-4 text-center">Biais Systématique</th>
                <th className="py-3.5 px-4 text-center">Dans la Marge (±1.5 pt)</th>
                <th className="py-3.5 px-4 text-center">Évolution (Sparkline)</th>
                <th className="py-3.5 px-4 text-right">Échantillons</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {instituts.map((inst) => {
                const isTop3 = inst.rang <= 3;

                return (
                  <tr
                    key={inst.id}
                    className="hover:bg-zinc-800/30 transition-colors group"
                  >
                    {/* Rank */}
                    <td className="py-3.5 px-4 text-center font-mono font-bold">
                      <span
                        className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs ${
                          inst.rang === 1
                            ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                            : inst.rang === 2
                            ? "bg-zinc-700/40 text-slate-300 border border-zinc-600"
                            : inst.rang === 3
                            ? "bg-amber-900/30 text-amber-500 border border-amber-800"
                            : "text-zinc-400"
                        }`}
                      >
                        {inst.rang}
                      </span>
                    </td>

                    {/* Name */}
                    <td className="py-3.5 px-4 font-semibold text-white">
                      <div className="flex items-center gap-2">
                        <span>{inst.nom}</span>
                        {isTop3 && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-950 text-indigo-300 border border-indigo-800/50">
                            Top Sondeur
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Reliability Index Gauge */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="inline-flex items-center gap-2">
                        <div className="w-16 h-2 bg-zinc-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 rounded-full"
                            style={{ width: `${inst.scoreFiabilite}%` }}
                          />
                        </div>
                        <span className="font-mono text-zinc-300 font-bold">
                          {inst.scoreFiabilite}/100
                        </span>
                      </div>
                    </td>

                    {/* MAE */}
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-white text-sm">
                      {inst.mae.toFixed(2)} pts
                    </td>

                    {/* Bias Indicator */}
                    <td className="py-3.5 px-4 text-center font-mono">
                      <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] bg-zinc-900 border border-zinc-800">
                        {inst.biaisMoyen > 0 ? (
                          <>
                            <TrendingUp className="w-3 h-3 text-emerald-400" />
                            <span className="text-emerald-400">
                              Sous-estime (+{inst.biaisMoyen.toFixed(2)} pt)
                            </span>
                          </>
                        ) : inst.biaisMoyen < 0 ? (
                          <>
                            <TrendingDown className="w-3 h-3 text-rose-400" />
                            <span className="text-rose-400">
                              Sur-estime ({inst.biaisMoyen.toFixed(2)} pt)
                            </span>
                          </>
                        ) : (
                          <span className="text-zinc-400">Neutre (0,0 pt)</span>
                        )}
                      </div>
                    </td>

                    {/* Within Margin */}
                    <td className="py-3.5 px-4 text-center">
                      <span className="font-mono font-semibold text-zinc-200">
                        {inst.tauxDansMarge} %
                      </span>
                    </td>

                    {/* Mini Sparkline SVG */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="inline-flex items-center justify-center">
                        <svg className="w-20 h-6 overflow-visible">
                          {inst.sparkline.length > 1 && (
                            <polyline
                              fill="none"
                              stroke="#6366f1"
                              strokeWidth="1.5"
                              points={inst.sparkline
                                .map((sp, idx) => {
                                  const x = (idx / (inst.sparkline.length - 1)) * 70 + 5;
                                  const y = Math.max(3, Math.min(21, (sp.mae / 3) * 20));
                                  return `${x},${24 - y}`;
                                })
                                .join(" ")}
                            />
                          )}
                          {inst.sparkline.map((sp, idx) => {
                            const x = (idx / (inst.sparkline.length - 1 || 1)) * 70 + 5;
                            const y = Math.max(3, Math.min(21, (sp.mae / 3) * 20));
                            return (
                              <circle
                                key={idx}
                                cx={x}
                                cy={24 - y}
                                r="2"
                                fill="#a5b4fc"
                              />
                            );
                          })}
                        </svg>
                      </div>
                    </td>

                    {/* Total Checks */}
                    <td className="py-3.5 px-4 text-right font-mono text-zinc-400">
                      {inst.totalMesures}
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
