"use client";

import { useState } from "react";
import { ScoreBarChart } from "./ScoreBarChart";
import { TruthScatter } from "./TruthScatter";
import { StatPoint } from "@/lib/stats";
import { formaterPct } from "@/lib/metrics";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, Calendar, Users, FileText, Vote } from "lucide-react";

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
    dateDebut?: string | null;
    dateFin?: string | null;
    tailleEchantillon?: number | null;
    methode?: string | null;
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

  // Filter state for Prospectif 2027
  const [selectedHypotheseFilter, setSelectedHypotheseFilter] = useState<"tous" | "philippe" | "attal" | "autres">("tous");
  const [selectedInstitutFilter, setSelectedInstitutFilter] = useState<string>("tous");

  const currentElection =
    electionsData.find((e) => e.annee === selectedTab && e.tour === selectedTour) ||
    electionsData.find((e) => e.annee === selectedTab) ||
    electionsData[0];

  // Filtered 2027 waves
  const filteredVagues = prospectifData.vagues.filter((v) => {
    if (selectedInstitutFilter !== "tous" && v.institut !== selectedInstitutFilter) {
      return false;
    }
    const h = v.hypothese.toLowerCase();
    if (selectedHypotheseFilter === "philippe") {
      return h.includes("philippe") && !h.includes("concurrence") && !h.includes("fragmentation");
    }
    if (selectedHypotheseFilter === "attal") {
      return h.includes("attal") && !h.includes("concurrence") && !h.includes("fragmentation");
    }
    if (selectedHypotheseFilter === "autres") {
      return h.includes("concurrence") || h.includes("fragmentation") || h.includes("pluralité");
    }
    return true;
  });

  // Calculate average scores across filtered 2027 waves
  const candidateScores: Record<string, { nom: string; parti: string; couleurHex: string; sum: number; count: number }> = {};
  filteredVagues.forEach((v) => {
    v.mesures.forEach((m) => {
      if (!candidateScores[m.candidatNom]) {
        candidateScores[m.candidatNom] = {
          nom: m.candidatNom,
          parti: m.parti,
          couleurHex: m.couleurHex,
          sum: 0,
          count: 0,
        };
      }
      candidateScores[m.candidatNom].sum += m.intentionPct;
      candidateScores[m.candidatNom].count += 1;
    });
  });

  const averageScores = Object.values(candidateScores)
    .map((c) => ({
      nom: c.nom,
      parti: c.parti,
      couleurHex: c.couleurHex,
      avgPct: Math.round((c.sum / c.count) * 10) / 10,
      count: c.count,
    }))
    .sort((a, b) => b.avgPct - a.avgPct);

  const institutsList = Array.from(new Set(prospectifData.vagues.map((v) => v.institut)));

  return (
    <div className="space-y-10">
      {/* Header & Tactile Year Selector with Sliding Pill */}
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

        {/* Clean Pill Selector with LayoutId */}
        <div className="flex flex-wrap items-center gap-1 bg-muted/60 p-1 rounded-xl self-start md:self-auto border border-border/50">
          {[2022, 2017, 2012, 2007, 2002].map((year) => (
            <button
              key={year}
              onClick={() => setSelectedTab(year)}
              className="relative px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors z-10 text-muted-foreground hover:text-foreground"
            >
              {selectedTab === year && (
                <motion.div
                  layoutId="presiYearPill"
                  className="absolute inset-0 bg-card rounded-lg shadow-sm border border-border -z-10"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <span className={selectedTab === year ? "text-foreground font-black" : ""}>
                {year}
              </span>
            </button>
          ))}
          <button
            onClick={() => setSelectedTab("2027")}
            className="relative px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors z-10 text-muted-foreground hover:text-foreground"
          >
            {selectedTab === "2027" && (
              <motion.div
                layoutId="presiYearPill"
                className="absolute inset-0 bg-card rounded-lg shadow-sm border border-border -z-10"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            <span className={selectedTab === "2027" ? "text-foreground font-black" : ""}>
              Prospectif 2027
            </span>
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {selectedTab !== "2027" ? (
          <motion.div
            key={`tab-${selectedTab}-${selectedTour}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="space-y-10"
          >
            {/* Sub-bar: Tour 1 vs Tour 2 & Abstention Context */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-card border border-border text-xs shadow-sm">
              <div className="flex items-center gap-2">
                <span className="font-bold text-foreground">Tour de scrutin :</span>
                <div className="flex items-center bg-muted/70 rounded-lg p-0.5 border border-border/50">
                  <button
                    onClick={() => setSelectedTour(1)}
                    className="relative px-3.5 py-1 rounded-md text-xs font-medium transition-colors z-10 text-muted-foreground hover:text-foreground"
                  >
                    {selectedTour === 1 && (
                      <motion.div
                        layoutId="presiTourPill"
                        className="absolute inset-0 bg-card rounded-md shadow-sm border border-border/80 -z-10"
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      />
                    )}
                    <span className={selectedTour === 1 ? "text-foreground font-bold" : ""}>
                      1er Tour
                    </span>
                  </button>
                  <button
                    onClick={() => setSelectedTour(2)}
                    className="relative px-3.5 py-1 rounded-md text-xs font-medium transition-colors z-10 text-muted-foreground hover:text-foreground"
                  >
                    {selectedTour === 2 && (
                      <motion.div
                        layoutId="presiTourPill"
                        className="absolute inset-0 bg-card rounded-md shadow-sm border border-border/80 -z-10"
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      />
                    )}
                    <span className={selectedTour === 2 ? "text-foreground font-bold" : ""}>
                      2d Tour (Duel final)
                    </span>
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-4 text-muted-foreground">
                <span>Date officielle : <strong>{currentElection?.date}</strong></span>
                {currentElection?.tauxAbstention && (
                  <span>
                    Abstention : <strong className="text-foreground">{formaterPct(currentElection.tauxAbstention)}</strong>
                  </span>
                )}
              </div>
            </div>

            {/* Context brief note */}
            {currentElection?.resume && (
              <div className="p-4 rounded-xl border border-border bg-card text-xs text-muted-foreground leading-relaxed shadow-sm">
                <strong className="text-foreground font-semibold">Ce qu'il s'est passé :</strong> {currentElection.resume}
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
          </motion.div>
        ) : (
          /* PROSPECTIF 2027 */
          <motion.div
            key="tab-2027"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="space-y-8"
          >
            {/* Header Card with Civic Context */}
            <div className="editorial-card p-6 sm:p-8 space-y-3 shadow-sm relative overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <h2 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
                  Baromètre des Intentions de Vote — Présidentielle 2027
                </h2>
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold text-xs border border-emerald-500/20 self-start sm:self-auto">
                  <ShieldCheck className="w-4 h-4" />
                  <span>{prospectifData.vagues.length} enquêtes réelles certifiées</span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-4xl">
                Toutes les enquêtes d'opinion officielles publiées par les instituts de sondage certifiés (Elabe, Ifop-Fiducial, Harris Interactive, Odoxa) et déposées auprès de la Commission nationale des sondages. Les instituts testent différentes hypothèses de candidatures au sein du camp présidentiel (Renaissance / Horizons) et de la droite républicaine.
              </p>
              <div className="pt-3 text-xs text-muted-foreground border-t border-border flex flex-wrap items-center gap-x-5 gap-y-1.5">
                <span>⚖️ <strong>Rappel déontologique :</strong> Une enquête d'opinion mesure un état instantané et ne constitue en aucun cas un pronostic électoral.</span>
                <span>📊 <strong>Marge d'erreur :</strong> ± 2,0 à 2,5 points pour les échantillons usuels de 1 000 à 1 500 personnes.</span>
              </div>
            </div>

            {/* Filters Bar: Hypothèses & Instituts */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl bg-card border border-border shadow-sm">
              {/* Hypothèses buttons with animated pill */}
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-muted-foreground block">
                  Scénario testé au centre et à droite :
                </span>
                <div className="flex flex-wrap gap-1 bg-muted/60 p-1 rounded-xl border border-border/50">
                  {[
                    { id: "tous", label: "Toutes les hypothèses" },
                    { id: "philippe", label: "Édouard Philippe (Candidat unique centre)" },
                    { id: "attal", label: "Gabriel Attal (Candidat Renaissance)" },
                    { id: "autres", label: "Concurrence & Fragmentation" },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setSelectedHypotheseFilter(tab.id as any)}
                      className="relative px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors z-10 text-muted-foreground hover:text-foreground"
                    >
                      {selectedHypotheseFilter === tab.id && (
                        <motion.div
                          layoutId="presi2027HypoPill"
                          className="absolute inset-0 bg-card rounded-lg shadow-sm border border-border -z-10"
                          transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        />
                      )}
                      <span className={selectedHypotheseFilter === tab.id ? "text-foreground font-bold" : ""}>
                        {tab.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Institut selector */}
              <div className="space-y-1.5 md:self-end">
                <span className="text-xs font-bold text-muted-foreground block">
                  Institut :
                </span>
                <select
                  value={selectedInstitutFilter}
                  onChange={(e) => setSelectedInstitutFilter(e.target.value)}
                  className="bg-muted border border-border rounded-xl px-3 py-2 text-xs font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-primary shadow-sm"
                >
                  <option value="tous">Tous les instituts ({prospectifData.vagues.length})</option>
                  {institutsList.map((inst) => (
                    <option key={inst} value={inst}>
                      {inst}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Average Consensus Summary Box */}
            {averageScores.length > 0 && (
              <div className="editorial-card p-6 space-y-4 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-border">
                  <div>
                    <h3 className="text-sm sm:text-base font-extrabold text-foreground tracking-tight">
                      Consensus moyen des intentions de vote
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Moyenne calculée sur les {filteredVagues.length} enquête(s) correspondant à votre sélection
                    </p>
                  </div>
                  <span className="text-xs font-mono font-bold text-muted-foreground bg-muted px-2.5 py-1 rounded-md">
                    Échelle 0 à 40 %
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3.5 pt-1">
                  {averageScores.slice(0, 10).map((cand) => (
                    <div key={cand.nom} className="space-y-1.5 text-xs">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-3 h-3 rounded-full shrink-0 shadow-sm"
                            style={{ backgroundColor: cand.couleurHex }}
                          />
                          <span className="font-bold text-foreground">
                            {cand.nom}
                          </span>
                          <span className="text-muted-foreground text-[11px] font-medium">
                            ({cand.parti})
                          </span>
                        </div>
                        <span className="font-extrabold text-foreground font-mono text-sm">
                          {formaterPct(cand.avgPct)}
                        </span>
                      </div>
                      <div className="w-full h-2.5 bg-muted/80 rounded-full overflow-hidden p-0.5 shadow-inner">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(100, (cand.avgPct / 40) * 100)}%` }}
                          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                          className="h-full rounded-full shadow-sm relative overflow-hidden"
                          style={{ backgroundColor: cand.couleurHex }}
                        >
                          <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent" />
                        </motion.div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Grid of Verified Polling Waves */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-foreground">
                  Détail des Enquêtes de Terrain ({filteredVagues.length})
                </h3>
                <span className="text-xs text-muted-foreground">
                  Classées par date de publication décroissante
                </span>
              </div>

              {filteredVagues.length === 0 ? (
                <div className="p-8 text-center text-sm text-muted-foreground bg-card rounded-xl border border-border">
                  Aucun sondage ne correspond aux filtres sélectionnés.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredVagues.map((vague, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: idx * 0.05 }}
                      whileHover={{ y: -3 }}
                      className="editorial-card p-6 space-y-4 flex flex-col justify-between shadow-sm hover:shadow-md transition-all duration-300"
                    >
                      <div>
                        {/* Card Header: Institut, Sponsor, Date */}
                        <div className="flex items-start justify-between pb-3 border-b border-border text-xs gap-2">
                          <div>
                            <div className="font-black text-foreground text-base tracking-tight">
                              {vague.institut}
                            </div>
                            {vague.commanditaire && (
                              <div className="text-muted-foreground text-[11px] mt-0.5">
                                pour <strong>{vague.commanditaire}</strong>
                              </div>
                            )}
                          </div>
                          <div className="text-right">
                            <span className="font-mono text-foreground font-bold block text-sm">
                              {vague.datePublication}
                            </span>
                            {vague.tailleEchantillon && (
                              <span className="text-muted-foreground text-[11px] font-mono block">
                                N = {vague.tailleEchantillon.toLocaleString("fr-FR")} pers.
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Scenario Tag & Certification Pill */}
                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          <div className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-secondary text-foreground inline-block border border-border/60">
                            {vague.hypothese}
                          </div>
                        </div>

                        {/* Fieldwork dates & method note */}
                        {(vague.dateDebut || vague.methode) && (
                          <div className="text-[11px] text-muted-foreground mt-2 flex items-center gap-1.5">
                            <FileText className="w-3 h-3 text-muted-foreground shrink-0" />
                            <span>
                              {vague.dateDebut && vague.dateFin ? `Terrain : ${vague.dateDebut} au ${vague.dateFin} • ` : ""}
                              {vague.methode || "Méthode des quotas"}
                            </span>
                          </div>
                        )}

                        {/* Candidate Progress Bars */}
                        <div className="space-y-2.5 pt-4">
                          {vague.mesures.map((m) => (
                            <div key={m.candidatNom} className="space-y-1 text-xs">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span
                                    className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm"
                                    style={{ backgroundColor: m.couleurHex }}
                                  />
                                  <span className="font-bold text-foreground">
                                    {m.candidatNom}
                                  </span>
                                  <span className="text-muted-foreground text-[11px]">
                                    ({m.parti})
                                  </span>
                                </div>
                                <span className="font-black text-foreground font-mono text-sm">
                                  {formaterPct(m.intentionPct)}
                                </span>
                              </div>
                              <div className="w-full h-2.5 bg-muted/80 rounded-full overflow-hidden p-0.5 shadow-inner">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${Math.min(100, (m.intentionPct / 40) * 100)}%` }}
                                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                                  className="h-full rounded-full shadow-sm relative overflow-hidden"
                                  style={{ backgroundColor: m.couleurHex }}
                                >
                                  <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent" />
                                </motion.div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
