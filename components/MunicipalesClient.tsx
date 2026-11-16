"use client";

import { useState, useMemo } from "react";
import {
  MunicipalesData,
  MunicipaleWitnessCity,
  MunicipaleVille100k,
  MunicipaleNuance,
} from "@/lib/data";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2,
  MapPin,
  TrendingUp,
  Search,
  Users,
  Leaf,
  Shield,
  Sparkles,
  ArrowRight,
  ChevronRight,
  Vote,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MunicipalesClientProps {
  data: MunicipalesData;
}

export function MunicipalesClient({ data }: MunicipalesClientProps) {
  // Witness cities selector
  const [selectedCityId, setSelectedCityId] = useState<string>(
    data.witnessCities[0]?.id || "Paris-t1"
  );

  // 42 Métropoles filters
  const [citySearch, setCitySearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  // Nuances tab
  const [nuanceTour, setNuanceTour] = useState<1 | 2>(1);

  // Active witness city
  const activeWitnessCity = useMemo(() => {
    return (
      data.witnessCities.find((c) => c.id === selectedCityId) ||
      data.witnessCities[0]
    );
  }, [data.witnessCities, selectedCityId]);

  // Filtered 42 métropoles
  const filteredVilles = useMemo(() => {
    return data.villes100k.filter((v) => {
      const matchSearch =
        v.commune.toLowerCase().includes(citySearch.toLowerCase()) ||
        v.departement.toLowerCase().includes(citySearch.toLowerCase()) ||
        v.maireElu.toLowerCase().includes(citySearch.toLowerCase()) ||
        v.partiElu.toLowerCase().includes(citySearch.toLowerCase());

      const matchCat =
        categoryFilter === "all" ? true : v.categorie === categoryFilter;

      return matchSearch && matchCat;
    });
  }, [data.villes100k, citySearch, categoryFilter]);

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {
      all: data.villes100k.length,
      maintien: 0,
      gauche: 0,
      droite: 0,
      centre: 0,
      rn: 0,
    };
    for (const v of data.villes100k) {
      if (counts[v.categorie] !== undefined) {
        counts[v.categorie]++;
      }
    }
    return counts;
  }, [data.villes100k]);

  // Icon mapping for civic issues
  const getEnjeuIcon = (thematique: string) => {
    const t = thematique.toLowerCase();
    if (t.includes("énergie") || t.includes("écologique") || t.includes("transition")) {
      return <Leaf className="w-5 h-5 text-emerald-500" />;
    }
    if (t.includes("sécurité")) {
      return <Shield className="w-5 h-5 text-indigo-500" />;
    }
    if (t.includes("propreté")) {
      return <Sparkles className="w-5 h-5 text-amber-500" />;
    }
    return <TrendingUp className="w-5 h-5 text-blue-500" />;
  };

  return (
    <div className="space-y-12">
      {/* ========================================================
          1. HERO & PARTICIPATION SYNTHESIS
      ======================================================== */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2 border-b border-border/80">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Scrutin Local Officiel &amp; Baromètres 2026
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-foreground">
              Élections Municipales 2026
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-1 max-w-2xl leading-relaxed">
              Bilan certifié du ministère de l'Intérieur, retour massif aux urnes et confrontation des sondages d'intention de vote au verdict électoral dans les 42 métropoles françaises.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
            <span className="px-2 py-1 bg-muted rounded border border-border">15 &amp; 22 mars 2026</span>
            <span className="px-2 py-1 bg-muted rounded border border-border">42 Métropoles</span>
          </div>
        </div>

        {/* Macro KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          <motion.div
            whileHover={{ y: -2 }}
            className="editorial-card p-4 sm:p-5 flex flex-col justify-between"
          >
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Participation T1
            </span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-foreground font-mono">
                {data.participation.tour1.tauxVotants.toFixed(1)}%
              </span>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                +12,4 pts
              </span>
            </div>
            <span className="text-[11px] text-muted-foreground mt-1">
              27,7 M de votants (vs 44,7% en 2020)
            </span>
          </motion.div>

          <motion.div
            whileHover={{ y: -2 }}
            className="editorial-card p-4 sm:p-5 flex flex-col justify-between"
          >
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Participation T2
            </span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-foreground font-mono">
                {data.participation.tour2.tauxVotants.toFixed(1)}%
              </span>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                +15,2 pts
              </span>
            </div>
            <span className="text-[11px] text-muted-foreground mt-1">
              9,6 M de votants (vs 41,9% en 2020)
            </span>
          </motion.div>

          <motion.div
            whileHover={{ y: -2 }}
            className="editorial-card p-4 sm:p-5 flex flex-col justify-between"
          >
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Grandes Villes
            </span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-foreground font-mono">
                42
              </span>
              <span className="text-xs font-medium text-muted-foreground">
                métropoles
              </span>
            </div>
            <span className="text-[11px] text-muted-foreground mt-1">
              Communes de plus de 100 000 habitants
            </span>
          </motion.div>

          <motion.div
            whileHover={{ y: -2 }}
            className="editorial-card p-4 sm:p-5 flex flex-col justify-between"
          >
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Précision Sondeurs
            </span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-indigo-600 dark:text-indigo-400 font-mono">
                ± 1,9 pt
              </span>
            </div>
            <span className="text-[11px] text-muted-foreground mt-1">
              Marge d'erreur moyenne constatée
            </span>
          </motion.div>
        </div>
      </section>

      {/* ========================================================
          2. LES ENJEUX CITOYENS & MOBILISATION HORAIRE
      ======================================================== */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Les Enjeux Citoyens du Scrutin
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Priorités thématiques mesurées par Ipsos et Odoxa à la veille du vote municipal
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Gauges des 4 Enjeux */}
          <div className="lg:col-span-7 space-y-3.5">
            {data.enjeux.map((enjeu, idx) => (
              <motion.div
                key={enjeu.thematique}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.08 }}
                className="editorial-card p-4 sm:p-5 space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-muted/80 border border-border">
                      {getEnjeuIcon(enjeu.thematique)}
                    </div>
                    <div>
                      <h4 className="text-sm sm:text-base font-bold text-foreground">
                        {enjeu.thematique}
                      </h4>
                      <span className="text-xs text-muted-foreground">
                        Baromètre {enjeu.institut}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xl sm:text-2xl font-black font-mono text-foreground">
                      {enjeu.importance}%
                    </span>
                    <span className="block text-[10px] text-muted-foreground uppercase font-semibold">
                      Déterminant
                    </span>
                  </div>
                </div>

                {/* Animated progress gauge */}
                <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
                  <motion.div
                    className={cn(
                      "h-full rounded-full",
                      enjeu.importance >= 80
                        ? "bg-emerald-500"
                        : enjeu.importance >= 60
                        ? "bg-indigo-500"
                        : enjeu.importance >= 50
                        ? "bg-amber-500"
                        : "bg-blue-500"
                    )}
                    initial={{ width: 0 }}
                    animate={{ width: `${enjeu.importance}%` }}
                    transition={{ duration: 0.7, ease: "easeOut", delay: 0.15 * idx }}
                  />
                </div>

                <p className="text-xs text-muted-foreground italic leading-relaxed">
                  « {enjeu.commentaire} »
                </p>
              </motion.div>
            ))}
          </div>

          {/* Participation Horaire Comparative */}
          <div className="lg:col-span-5 editorial-card p-5 sm:p-6 flex flex-col justify-between space-y-5">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
                <Clock className="w-4 h-4 text-primary" />
                <span>Décompte Horaire National</span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-foreground">
                Dynamique de vote : 2026 vs 2020
              </h3>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                Après l'abstention historique des municipales 2020 en plein déclenchement du Covid-19, l'affluence en bureau de vote retrouve son élan dès la mi-journée.
              </p>
            </div>

            <div className="space-y-3">
              {data.participation.horaires.map((h) => (
                <div
                  key={h.horaire}
                  className="p-3 rounded-xl bg-muted/40 border border-border/60 flex items-center justify-between text-xs"
                >
                  <div className="space-y-0.5">
                    <span className="font-bold text-foreground block text-sm">
                      {h.horaire}
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      2020 : {h.t1_2020.toFixed(1)}% (T1) / {h.t2_2020.toFixed(1)}% (T2)
                    </span>
                  </div>

                  <div className="text-right space-y-0.5">
                    <div className="flex items-center gap-2 justify-end">
                      <span className="font-mono font-bold text-foreground">
                        T1 : {h.t1_2026.toFixed(1)}%
                      </span>
                      <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                        (+{h.ecart_t1.toFixed(1)} pt)
                      </span>
                    </div>
                    <div className="flex items-center gap-2 justify-end text-[11px]">
                      <span className="font-mono text-muted-foreground">
                        T2 : {h.t2_2026.toFixed(1)}%
                      </span>
                      <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                        (+{h.ecart_t2.toFixed(1)} pt)
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>
                Participation finale à <strong>57,10%</strong> (+12,4 pts au T1) et <strong>57,03%</strong> (+15,2 pts au T2).
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          3. LE BAROMÈTRE SONDAGES VS RÉEL LOCAL (MÉTROPOLES TÉMOINS)
      ======================================================== */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-1">
              <MapPin className="w-3.5 h-3.5" />
              <span>Confrontation Locale</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Le Baromètre Sondage vs Réel par Ville
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Comparaison entre les estimations publiées à la veille du vote et le score officiel proclamé
            </p>
          </div>

          {/* Interactive City Selector (Segmented Pills) */}
          <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-xl text-xs overflow-x-auto border border-border/50 max-w-full">
            {data.witnessCities.map((city) => {
              const isSelected = city.id === selectedCityId;
              return (
                <button
                  key={city.id}
                  onClick={() => setSelectedCityId(city.id)}
                  className="relative px-3 py-1.5 rounded-lg font-semibold transition-colors text-xs whitespace-nowrap z-10 text-muted-foreground hover:text-foreground"
                >
                  {isSelected && (
                    <motion.div
                      layoutId="witnessCityPill"
                      className="absolute inset-0 bg-card rounded-lg shadow-sm border border-border -z-10"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span className={isSelected ? "text-foreground font-bold" : ""}>
                    {city.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* City Detail Card with Diverging Bar Chart */}
        <div className="editorial-card p-5 sm:p-7 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border">
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-foreground flex items-center gap-2">
                <Building2 className="w-5 h-5 text-primary" />
                <span>{activeWitnessCity.ville}</span>
                <span className="text-xs font-normal text-muted-foreground">
                  — {activeWitnessCity.tour === 1 ? "Premier Tour" : "Second Tour"}
                </span>
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {activeWitnessCity.candidates.length} têtes de liste mesurées dans les sondages de veille
              </p>
            </div>

            {/* Légende rapide */}
            <div className="flex items-center gap-4 text-xs font-medium text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-muted-foreground/30 border border-border" />
                <span>Sondage veille</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-primary" />
                <span>Score officiel</span>
              </div>
            </div>
          </div>

          {/* Diverging candidate bars */}
          <div className="space-y-5">
            {activeWitnessCity.candidates.map((cand, idx) => {
              const isUnderestimated = cand.delta > 0;
              const isOverestimated = cand.delta < 0;
              const isAccurate = Math.abs(cand.delta) <= 2.0;

              return (
                <div
                  key={cand.nom}
                  className="p-4 rounded-xl bg-card border border-border hover:border-foreground/30 transition-all space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: cand.couleurHex }}
                      />
                      <span className="font-bold text-sm sm:text-base text-foreground">
                        {cand.nom}
                      </span>
                      <span className="px-2 py-0.5 text-xs font-semibold rounded bg-muted text-muted-foreground border border-border">
                        {cand.parti}
                      </span>
                    </div>

                    {/* Human phrasing badge */}
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "px-2.5 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1",
                          isAccurate
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                            : isUnderestimated
                            ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20"
                            : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                        )}
                      >
                        {isAccurate ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Prévision réussie (± {Math.abs(cand.delta)} pt)</span>
                          </>
                        ) : isUnderestimated ? (
                          <>
                            <TrendingUp className="w-3.5 h-3.5" />
                            <span>Sous-estimé de +{cand.delta.toFixed(1)} pt</span>
                          </>
                        ) : (
                          <>
                            <AlertTriangle className="w-3.5 h-3.5" />
                            <span>Sur-estimé de {cand.delta.toFixed(1)} pt</span>
                          </>
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Horizontal Bar Comparison */}
                  <div className="space-y-1.5">
                    {/* Sondage Bar */}
                    <div className="flex items-center gap-3 text-xs">
                      <span className="w-20 text-muted-foreground shrink-0 text-right">
                        Sondage :
                      </span>
                      <div className="flex-1 bg-muted/60 rounded-full h-4 relative overflow-hidden flex items-center">
                        <motion.div
                          className="h-full bg-muted-foreground/30 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(cand.sondagePct * 1.5, 100)}%` }}
                          transition={{ duration: 0.5, delay: idx * 0.05 }}
                        />
                        <span className="absolute left-2 text-[10px] font-mono font-bold text-foreground">
                          {cand.sondagePct.toFixed(1)}%
                        </span>
                      </div>
                    </div>

                    {/* Résultat Bar */}
                    <div className="flex items-center gap-3 text-xs">
                      <span className="w-20 font-bold text-foreground shrink-0 text-right">
                        Réel :
                      </span>
                      <div className="flex-1 bg-muted/60 rounded-full h-5 relative overflow-hidden flex items-center">
                        <motion.div
                          className="h-full rounded-full"
                          style={{ backgroundColor: cand.couleurHex }}
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(cand.reelPct * 1.5, 100)}%` }}
                          transition={{ duration: 0.6, delay: 0.1 + idx * 0.05 }}
                        />
                        <span className="absolute left-2 text-[11px] font-mono font-extrabold text-white drop-shadow-sm">
                          {cand.reelPct.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========================================================
          4. GRILLE INTERACTIVE DES 42 MÉTROPOLES (+100k hab)
      ======================================================== */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-1">
              <Building2 className="w-3.5 h-3.5" />
              <span>Panorama National</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Les 42 Métropoles de plus de 100 000 habitants
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Maires sortants vs maires élus, équilibres partisans et bascules politiques
            </p>
          </div>

          <span className="text-xs font-medium text-muted-foreground self-start sm:self-auto">
            {filteredVilles.length} métropole{filteredVilles.length > 1 ? "s" : ""} affichée{filteredVilles.length > 1 ? "s" : ""}
          </span>
        </div>

        {/* Filter bar: Search + Category Pills */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={citySearch}
              onChange={(e) => setCitySearch(e.target.value)}
              placeholder="Rechercher une ville, un maire, un département..."
              className="w-full pl-9 pr-4 py-2 bg-muted/60 border border-border rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground placeholder:text-muted-foreground transition-all"
            />
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-xl text-xs overflow-x-auto border border-border/50">
            {[
              { id: "all", label: `Toutes (${categoryCounts.all})` },
              { id: "maintien", label: `Maintien (${categoryCounts.maintien})` },
              { id: "gauche", label: `Bascule Gauche (${categoryCounts.gauche})` },
              { id: "droite", label: `Bascule Droite (${categoryCounts.droite})` },
              { id: "centre", label: `Bascule Centre (${categoryCounts.centre})` },
              { id: "rn", label: `RN (${categoryCounts.rn})` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setCategoryFilter(tab.id)}
                className="relative px-3 py-1.5 rounded-lg font-semibold transition-colors text-xs whitespace-nowrap z-10 text-muted-foreground hover:text-foreground"
              >
                {categoryFilter === tab.id && (
                  <motion.div
                    layoutId="cityCategoryPill"
                    className="absolute inset-0 bg-card rounded-lg shadow-sm border border-border -z-10"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <span className={categoryFilter === tab.id ? "text-foreground font-bold" : ""}>
                  {tab.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* 42 Cities Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {filteredVilles.map((ville) => {
              const isMaintien = ville.categorie === "maintien";
              const isGauche = ville.categorie === "gauche";
              const isDroite = ville.categorie === "droite";
              const isCentre = ville.categorie === "centre";
              const isRN = ville.categorie === "rn";

              return (
                <motion.div
                  key={ville.commune}
                  layout
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                  whileHover={{ y: -3, scale: 1.01 }}
                  className="editorial-card p-5 flex flex-col justify-between space-y-4 shadow-sm hover:shadow-md transition-all duration-200 border-border group"
                >
                  <div className="space-y-3">
                    {/* Header: Commune + Evolution badge */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-extrabold text-base text-foreground group-hover:text-primary transition-colors">
                          {ville.commune}
                        </h4>
                        <span className="text-xs text-muted-foreground block">
                          {ville.departement}
                        </span>
                      </div>

                      <span
                        className={cn(
                          "px-2 py-0.5 rounded-full text-[11px] font-bold shrink-0 border",
                          isMaintien
                            ? "bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-500/20"
                            : isGauche
                            ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
                            : isDroite
                            ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20"
                            : isCentre
                            ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                            : "bg-indigo-950/20 text-indigo-400 border-indigo-800"
                        )}
                      >
                        {ville.evolution}
                      </span>
                    </div>

                    {/* Maires Sortant vs Élu */}
                    <div className="space-y-2 pt-2 border-t border-border/60 text-xs">
                      <div className="flex items-center justify-between text-muted-foreground">
                        <span>Sortant (2020) :</span>
                        <span className="font-medium text-foreground">
                          {ville.maireSortant}{" "}
                          <span className="text-[10px] text-muted-foreground">
                            ({ville.partiSortant})
                          </span>
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="font-bold text-foreground">
                          Maire Élu 2026 :
                        </span>
                        <span className="font-bold text-foreground">
                          {ville.maireElu}{" "}
                          <span className="text-[10px] px-1.5 py-0.5 bg-muted rounded font-semibold text-primary">
                            {ville.partiElu}
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Context snippet footer */}
                  <div className="pt-2.5 border-t border-border/50 text-[11px] text-muted-foreground flex items-center justify-between">
                    <span className="italic truncate">{ville.detail}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-muted-foreground shrink-0 group-hover:translate-x-1 transition-transform" />
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </section>

      {/* ========================================================
          5. NUANCES POLITIQUES NATIONALES (COMMUNES >= 3500 HAB)
      ======================================================== */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-primary uppercase tracking-wider mb-1">
              <Vote className="w-3.5 h-3.5" />
              <span>Agrégat National</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Résultats Nationaux par Nuance Politique
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Voix, pourcentages et répartition des sièges dans les communes de 3 500 habitants et plus
            </p>
          </div>

          {/* Tour 1 / Tour 2 Switcher */}
          <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-xl text-xs border border-border/50 self-start sm:self-auto">
            {[
              { id: 1, label: "Premier Tour (15 mars)" },
              { id: 2, label: "Second Tour (22 mars)" },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setNuanceTour(t.id as 1 | 2)}
                className="relative px-3 py-1.5 rounded-lg font-semibold transition-colors text-xs z-10 text-muted-foreground hover:text-foreground"
              >
                {nuanceTour === t.id && (
                  <motion.div
                    layoutId="nuanceTourPill"
                    className="absolute inset-0 bg-card rounded-lg shadow-sm border border-border -z-10"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <span className={nuanceTour === t.id ? "text-foreground font-bold" : ""}>
                  {t.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Nuances Table / Card List */}
        <div className="editorial-card overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-border flex items-center justify-between text-xs text-muted-foreground font-semibold uppercase tracking-wider">
            <span>Nuance &amp; Sigle</span>
            <div className="flex items-center gap-8 sm:gap-12 text-right">
              <span className="w-16">Suffrages</span>
              <span className="w-16">Sièges</span>
              <span className="w-20 hidden sm:inline">Villes Gagnées</span>
            </div>
          </div>

          <div className="divide-y divide-border">
            {data.nuances.map((nuance) => {
              const pct = nuanceTour === 1 ? nuance.pctT1 : nuance.pctT2;
              const voix = nuanceTour === 1 ? nuance.voixT1 : nuance.voixT2;
              const sieges = nuanceTour === 1 ? nuance.siegesT1 : nuance.siegesT2;
              const villes = nuanceTour === 1 ? nuance.villesT1 : nuance.villesT2;

              if (pct <= 0 && voix <= 0) return null;

              return (
                <div
                  key={nuance.sigle}
                  className="p-4 sm:p-5 flex items-center justify-between hover:bg-muted/40 transition-colors text-xs sm:text-sm"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: nuance.couleurHex }}
                    />
                    <div>
                      <span className="font-bold text-foreground block">
                        {nuance.nuance}
                      </span>
                      <span className="text-xs text-muted-foreground font-mono">
                        {nuance.sigle}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-8 sm:gap-12 text-right font-mono">
                    <div className="w-16">
                      <span className="font-bold text-foreground block">
                        {pct.toFixed(2)}%
                      </span>
                      <span className="text-[10px] text-muted-foreground hidden sm:block">
                        {(voix / 1000).toFixed(0)}k voix
                      </span>
                    </div>

                    <div className="w-16">
                      <span className="font-bold text-foreground">
                        {sieges.toLocaleString("fr-FR")}
                      </span>
                    </div>

                    <div className="w-20 hidden sm:block">
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                        {villes} ville{villes > 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
