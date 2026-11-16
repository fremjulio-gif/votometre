"use client";

import { InstitutMetrics } from "@/lib/stats";
import { formaterPrecisionMoyenne, formaterTendanceInstitut } from "@/lib/metrics";

interface PodiumInstitutsProps {
  instituts: InstitutMetrics[];
}

export function PodiumInstituts({ instituts }: PodiumInstitutsProps) {
  const top3 = instituts.slice(0, 3);
  const others = instituts.slice(3);

  return (
    <div className="space-y-10">
      {/* Editorial Introduction */}
      <div className="max-w-2xl">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
          Le Podium de la Fiabilité
        </h2>
        <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
          Sur les 20 dernières années, quel sondeur s'est le plus souvent approché du résultat final ?
          Voici le classement basé sur la marge d'erreur moyenne réelle constatée au dépouillement.
        </p>
      </div>

      {/* Top 3 Podium Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {top3.map((inst, index) => {
          const rankNames = ["1ère place (Le plus précis)", "2ème place", "3ème place"];
          const medalColors = [
            "border-amber-400 bg-amber-50/50 dark:bg-amber-950/20 text-amber-800 dark:text-amber-300",
            "border-slate-300 bg-slate-50/50 dark:bg-slate-900/40 text-slate-700 dark:text-slate-300",
            "border-amber-700/40 bg-amber-900/10 text-amber-900 dark:text-amber-400",
          ];

          const tendance = formaterTendanceInstitut(inst.biaisMoyen);

          return (
            <div
              key={inst.id}
              className={`editorial-card p-6 border-2 flex flex-col justify-between ${
                index === 0 ? "border-amber-400 shadow-sm" : "border-border"
              }`}
            >
              <div>
                <span
                  className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full inline-block mb-3 border ${medalColors[index]}`}
                >
                  {rankNames[index]}
                </span>

                <h3 className="text-xl font-extrabold text-foreground mb-1">
                  {inst.nom}
                </h3>

                <div className="text-2xl font-black text-foreground font-mono my-3">
                  ± {inst.mae.toFixed(1).replace(".", ",")} pt
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed">
                  {formaterPrecisionMoyenne(inst.mae)} sur {inst.totalMesures} prévisions auditées.
                </p>
              </div>

              <div className="mt-5 pt-4 border-t border-border space-y-1.5 text-xs">
                <span className="text-muted-foreground block text-[11px] font-medium uppercase">
                  Tendance observée :
                </span>
                <span className="font-semibold text-foreground">
                  {tendance.libelle}
                </span>
                <p className="text-[11px] text-muted-foreground">
                  {tendance.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Comparison List (Mobile & Desktop Clean Stack) */}
      <div className="editorial-card p-5 sm:p-7">
        <h3 className="text-lg font-bold text-foreground mb-1">
          Tous les Instituts Passés au Crible
        </h3>
        <p className="text-xs sm:text-sm text-muted-foreground mb-6">
          Classement complet des organismes de sondage du plus précis au moins précis.
        </p>

        <div className="divide-y divide-border">
          {instituts.map((inst, idx) => {
            const tendance = formaterTendanceInstitut(inst.biaisMoyen);

            return (
              <div
                key={inst.id}
                className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                {/* Name and Rank */}
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-muted text-muted-foreground font-mono font-bold flex items-center justify-center text-xs shrink-0">
                    {idx + 1}
                  </span>
                  <div>
                    <span className="font-bold text-sm text-foreground block">
                      {inst.nom}
                    </span>
                    <span className="text-muted-foreground text-[11px]">
                      {inst.totalMesures} prévisions vérifiées
                    </span>
                  </div>
                </div>

                {/* Precision (Human term) */}
                <div className="flex flex-col sm:items-end">
                  <span className="font-bold text-sm text-foreground font-mono">
                    ± {inst.mae.toFixed(1).replace(".", ",")} pt d'écart typique
                  </span>
                  <span className="text-muted-foreground text-[11px]">
                    {inst.tauxDansMarge}% des mesures dans la marge habituelle
                  </span>
                </div>

                {/* Tendency Badge */}
                <div className="sm:text-right">
                  <span className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-muted text-muted-foreground inline-block">
                    {tendance.libelle}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
