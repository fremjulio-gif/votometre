"use client";

import { InstitutMetrics } from "@/lib/stats";
import { formaterPrecisionMoyenne, formaterTendanceInstitut } from "@/lib/metrics";
import { Award, ShieldCheck, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

interface PodiumInstitutsProps {
  instituts: InstitutMetrics[];
}

export function PodiumInstituts({ instituts }: PodiumInstitutsProps) {
  const top3 = instituts.slice(0, 3);

  return (
    <div className="space-y-10">
      {/* Editorial Introduction */}
      <div className="max-w-2xl">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary mb-2">
          <Award className="w-4 h-4" />
          <span>Palmarès 2002–2024</span>
        </div>
        <h2 className="text-xl sm:text-3xl font-extrabold tracking-tight text-foreground">
          Le Podium de la Fiabilité
        </h2>
        <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
          Sur les 20 dernières années d'élections en France, quel sondeur s'est le plus souvent approché du résultat officiel ?
          Voici le classement basé sur la marge d'erreur moyenne réelle constatée au dépouillement.
        </p>
      </div>

      {/* Top 3 Podium Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {top3.map((inst, index) => {
          const rankNames = ["1ère place (Le plus précis)", "2ème place", "3ème place"];
          const medalIcons = ["🥇", "🥈", "🥉"];
          const medalAccents = [
            "border-amber-400/80 bg-gradient-to-b from-amber-50/60 to-transparent dark:from-amber-950/20 shadow-sm",
            "border-slate-300 dark:border-slate-700 bg-gradient-to-b from-slate-50/60 to-transparent dark:from-slate-900/40",
            "border-amber-700/30 bg-gradient-to-b from-amber-900/10 to-transparent dark:from-amber-950/10",
          ];
          const badgeColors = [
            "bg-amber-100 text-amber-900 dark:bg-amber-950/80 dark:text-amber-300 border-amber-300 dark:border-amber-800",
            "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700",
            "bg-amber-50 text-amber-800 dark:bg-amber-950/50 dark:text-amber-400 border-amber-200 dark:border-amber-900",
          ];

          const tendance = formaterTendanceInstitut(inst.biaisMoyen);

          return (
            <motion.div
              key={inst.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: index * 0.1 }}
              whileHover={{ y: -4 }}
              className={`editorial-card p-6 border-2 flex flex-col justify-between relative overflow-hidden transition-all duration-300 ${medalAccents[index]}`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span
                    className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full inline-flex items-center gap-1 border ${badgeColors[index]}`}
                  >
                    <span>{medalIcons[index]}</span>
                    <span>{rankNames[index]}</span>
                  </span>
                  <span className="text-xs font-mono font-bold text-muted-foreground">
                    Score: {inst.scoreFiabilite}/100
                  </span>
                </div>

                <h3 className="text-2xl font-black text-foreground tracking-tight mb-1">
                  {inst.nom}
                </h3>

                <div className="text-3xl font-black text-foreground font-mono my-3 tracking-tight">
                  ± {inst.mae.toFixed(1).replace(".", ",")} pt
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed">
                  {formaterPrecisionMoyenne(inst.mae)} sur {inst.totalMesures} prévisions auditées.
                </p>

                {/* Progress bar of within margin */}
                <div className="mt-4 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-muted-foreground">
                    <span>Dans la marge habituelle</span>
                    <span className="font-mono text-foreground font-bold">{inst.tauxDansMarge}%</span>
                  </div>
                  <div className="w-full h-2 bg-muted/80 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-500"
                      style={{ width: `${inst.tauxDansMarge}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-border space-y-1.5 text-xs">
                <div className="flex items-center gap-1 text-muted-foreground text-[10px] font-bold uppercase tracking-wider">
                  <TrendingUp className="w-3 h-3 text-primary" />
                  <span>Tendance historique constatée :</span>
                </div>
                <span className="font-bold text-foreground block">
                  {tendance.libelle}
                </span>
                <p className="text-[11px] text-muted-foreground leading-snug">
                  {tendance.description}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Comparison List (Mobile & Desktop Clean Stack) */}
      <div className="editorial-card p-5 sm:p-7 shadow-sm">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-border">
          <div>
            <h3 className="text-lg font-bold text-foreground">
              Tous les Instituts Passés au Crible
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Classement complet des organismes de sondage du plus précis au moins précis.
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-muted-foreground bg-muted px-2.5 py-1 rounded-md">
            {instituts.length} instituts audités
          </span>
        </div>

        <div className="divide-y divide-border">
          {instituts.map((inst, idx) => {
            const tendance = formaterTendanceInstitut(inst.biaisMoyen);

            return (
              <div
                key={inst.id}
                className="py-4 px-2 -mx-2 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs transition-colors hover:bg-muted/40"
              >
                {/* Name and Rank */}
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-lg bg-muted text-muted-foreground font-mono font-bold flex items-center justify-center text-xs shrink-0 border border-border/60">
                    {idx + 1}
                  </span>
                  <div>
                    <span className="font-extrabold text-sm text-foreground block tracking-tight">
                      {inst.nom}
                    </span>
                    <span className="text-muted-foreground text-[11px]">
                      {inst.totalMesures} prévisions auditées • {inst.tauxDansMarge}% dans la marge
                    </span>
                  </div>
                </div>

                {/* Precision (Human term) */}
                <div className="flex items-center gap-6 sm:justify-end">
                  <div className="text-left sm:text-right">
                    <span className="font-bold text-sm text-foreground font-mono block">
                      ± {inst.mae.toFixed(1).replace(".", ",")} pt
                    </span>
                    <span className="text-muted-foreground text-[11px]">
                      écart moyen
                    </span>
                  </div>

                  {/* Tendency Badge */}
                  <div className="sm:text-right min-w-[140px]">
                    <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-secondary text-secondary-foreground border border-border inline-block">
                      {tendance.libelle}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
