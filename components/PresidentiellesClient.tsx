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
        <div className="space-y-8">
          {/* Header Card with Civic Context */}
          <div className="editorial-card p-6 sm:p-8 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h2 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
                Baromètre des Intentions de Vote — Présidentielle 2027
              </h2>
              <span className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary font-semibold self-start sm:self-auto">
                {prospectifData.vagues.length} enquêtes réelles recensées
              </span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-4xl">
              Toutes les enquêtes d'opinion officielles publiées par les instituts de sondage certifiés (Elabe, Ifop-Fiducial, Harris Interactive, Odoxa) et déposées auprès de la Commission nationale des sondages. Les instituts testent différentes hypothèses de candidatures au sein du camp présidentiel (Renaissance / Horizons) et de la droite républicaine.
            </p>
            <div className="pt-2 text-xs text-muted-foreground border-t border-border/60 flex flex-wrap items-center gap-x-4 gap-y-1">
              <span>⚖️ <strong>Rappel déontologique :</strong> Une enquête d'opinion mesure un état des forces à l'instant T et ne constitue en aucun cas un pronostic du scrutin de 2027.</span>
              <span>📊 <strong>Marge d'erreur :</strong> ± 2,0 à 2,5 points pour les échantillons usuels de 1 000 à 1 500 personnes.</span>
            </div>
          </div>

          {/* Filters Bar: Hypothèses & Instituts */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl bg-card border border-border">
            {/* Hypothèses buttons */}
            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-muted-foreground block">
                Hypothèse testée dans le camp présidentiel / droite :
              </span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { id: "tous", label: "Toutes les hypothèses" },
                  { id: "philippe", label: "Édouard Philippe (Candidat unique centre)" },
                  { id: "attal", label: "Gabriel Attal (Candidat Renaissance)" },
                  { id: "autres", label: "Concurrence & Fragmentation" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setSelectedHypotheseFilter(tab.id as any)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      selectedHypotheseFilter === tab.id
                        ? "bg-foreground text-background shadow-sm"
                        : "bg-muted text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Institut selector */}
            <div className="space-y-1.5 md:self-end">
              <span className="text-xs font-semibold text-muted-foreground block">
                Institut :
              </span>
              <select
                value={selectedInstitutFilter}
                onChange={(e) => setSelectedInstitutFilter(e.target.value)}
                className="bg-muted border border-border rounded-lg px-3 py-1.5 text-xs font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
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
            <div className="editorial-card p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-border">
                <div>
                  <h3 className="text-sm font-bold text-foreground">
                    Consensus moyen des intentions de vote
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Moyenne des {filteredVagues.length} enquête(s) correspondant à la sélection active
                  </p>
                </div>
                <span className="text-xs font-mono text-muted-foreground">
                  Échelle 0 à 40 %
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 pt-1">
                {averageScores.slice(0, 10).map((cand) => (
                  <div key={cand.nom} className="space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: cand.couleurHex }}
                        />
                        <span className="font-semibold text-foreground">
                          {cand.nom}
                        </span>
                        <span className="text-muted-foreground text-[11px]">
                          ({cand.parti})
                        </span>
                      </div>
                      <span className="font-bold text-foreground font-mono">
                        {formaterPct(cand.avgPct)}
                      </span>
                    </div>
                    <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${Math.min(100, (cand.avgPct / 40) * 100)}%`,
                          backgroundColor: cand.couleurHex,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Grid of Verified Polling Waves */}
          <div className="space-y-4">
            <h3 className="text-base font-bold text-foreground">
              Détail des Enquêtes de Terrain ({filteredVagues.length})
            </h3>

            {filteredVagues.length === 0 ? (
              <div className="p-8 text-center text-sm text-muted-foreground bg-card rounded-xl border border-border">
                Aucun sondage ne correspond aux filtres sélectionnés.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredVagues.map((vague, idx) => (
                  <div key={idx} className="editorial-card p-6 space-y-4 flex flex-col justify-between">
                    <div>
                      {/* Card Header: Institut, Sponsor, Date */}
                      <div className="flex items-start justify-between pb-3 border-b border-border text-xs gap-2">
                        <div>
                          <div className="font-bold text-foreground text-sm">
                            {vague.institut}
                          </div>
                          {vague.commanditaire && (
                            <div className="text-muted-foreground text-[11px]">
                              pour <strong>{vague.commanditaire}</strong>
                            </div>
                          )}
                        </div>
                        <div className="text-right">
                          <span className="font-mono text-foreground font-semibold block">
                            {vague.datePublication}
                          </span>
                          {vague.tailleEchantillon && (
                            <span className="text-muted-foreground text-[11px] block">
                              N = {vague.tailleEchantillon.toLocaleString("fr-FR")} pers.
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Scenario Tag */}
                      <div className="mt-3 text-xs font-semibold px-2.5 py-1 rounded-md bg-secondary text-foreground inline-block">
                        {vague.hypothese}
                      </div>

                      {/* Fieldwork dates & method note */}
                      {(vague.dateDebut || vague.methode) && (
                        <div className="text-[11px] text-muted-foreground mt-1.5">
                          {vague.dateDebut && vague.dateFin ? `Terrain : ${vague.dateDebut} au ${vague.dateFin} • ` : ""}
                          {vague.methode || "Méthode des quotas"}
                        </div>
                      )}

                      {/* Candidate Progress Bars */}
                      <div className="space-y-2.5 pt-4">
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
                                  width: `${Math.min(100, (m.intentionPct / 40) * 100)}%`,
                                  backgroundColor: m.couleurHex,
                                }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
