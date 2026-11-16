"use client";

import { useState, useMemo } from "react";
import { SociologieAbstentionData } from "@/lib/data";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  GraduationCap,
  Briefcase,
  MapPin,
  AlertCircle,
  CheckCircle2,
  TrendingDown,
  TrendingUp,
  FileText,
  Sliders,
  Sparkles,
  Vote,
  Clock,
  HelpCircle,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AbstentionClientProps {
  data: SociologieAbstentionData;
}

export function AbstentionClient({ data }: AbstentionClientProps) {
  // Simulator State
  const [selectedAge, setSelectedAge] = useState<string>("25-34");
  const [selectedDiplome, setSelectedDiplome] = useState<string>("bac2");
  const [selectedCsp, setSelectedCsp] = useState<string>("cadre");

  // Fracture view toggle
  const [fractureView, setFractureView] = useState<"AGE" | "DIPLOME">("AGE");

  // Participation history filter
  const [historyScrutinFilter, setHistoryScrutinFilter] = useState<string>("ALL");

  // ==========================================
  // SIMULATOR ECONOMETRIC ENGINE (INSEE / IPSOS)
  // ==========================================
  const simulation = useMemo(() => {
    // Base participation rate at national presidential sequence = 74%
    let partScore = 74;
    let malInscritRate = 16.5;
    let explanationAge = "";
    let explanationDiplome = "";
    let explanationCsp = "";

    // 1. Age Factor
    switch (selectedAge) {
      case "18-24":
        partScore -= 16;
        malInscritRate = 34;
        explanationAge =
          "Les 18-24 ans subissent une forte abstention (42% en 2022), amplifiée par les déménagements d'études.";
        break;
      case "25-34":
        partScore -= 20;
        malInscritRate = 43;
        explanationAge =
          "Pic national de mal-inscription (43%) : 4 jeunes actifs sur 10 ne sont plus inscrits là où ils vivent.";
        break;
      case "35-49":
        partScore += 4;
        malInscritRate = 18;
        explanationAge =
          "Stabilisation résidentielle et ancrage civique : l'abstention tombe à 22%.";
        break;
      case "50-64":
        partScore += 7;
        malInscritRate = 12;
        explanationAge =
          "Génération hautement assidue avec un taux de participation moyen de 80%.";
        break;
      case "65+":
        partScore += 11;
        malInscritRate = 7;
        explanationAge =
          "Les plus de 65 ans forment le socle civique du pays (85% de participation, sédentarité maximale).";
        break;
    }

    // 2. Diplome Factor
    switch (selectedDiplome) {
      case "sans_bac":
        partScore -= 7;
        explanationDiplome =
          "L'absence de diplôme est le 1er accélérateur d'abstention systématique (30,4% selon l'Insee).";
        break;
      case "bac":
        partScore -= 1;
        explanationDiplome =
          "Les bacheliers se situent dans la moyenne nationale, avec un vote intermittent prédominant (51,5%).";
        break;
      case "bac2":
        partScore += 1;
        explanationDiplome =
          "Niveau intermédiaire : participation régulière (75%) et bon recours aux démarches citoyennes.";
        break;
      case "superieur":
        partScore += 5;
        explanationDiplome =
          "Les diplômés du supérieur votent massivement (l'abstention systématique n'est que de 9,5%).";
        break;
    }

    // 3. CSP Factor
    switch (selectedCsp) {
      case "cadre":
        partScore += 3;
        explanationCsp =
          "Les cadres bénéficient d'un recours 4 fois plus élevé au vote par procuration (17%).";
        break;
      case "intermediaire":
        partScore += 0;
        explanationCsp =
          "Participation stable proche de la médiane nationale (73% de votants).";
        break;
      case "employe":
        partScore -= 1;
        explanationCsp =
          "Participation mitigée, sensible au pouvoir d'achat et aux horaires décalés.";
        break;
      case "ouvrier":
        partScore -= 7;
        explanationCsp =
          "Les ouvriers affichent le taux d'abstention le plus haut des actifs (33%), avec très peu de procurations (4,5%).";
        break;
      case "retraite":
        partScore += 7;
        explanationCsp =
          "Les retraités votent à plus de 81%, représentant près d'un tiers des suffrages exprimés.";
        break;
      case "chomeur":
        partScore -= 9;
        explanationCsp =
          "Sentiment de relégation et fort décrochage civique : 35% d'abstention constatée.";
        break;
      case "independant":
        partScore += 1;
        explanationCsp =
          "Comportement civique régulier et sensibilité forte aux échéances locales et fiscales.";
        break;
    }

    // Clamp score between 32% and 94%
    const participationRate = Math.max(32, Math.min(94, partScore));
    const abstentionRate = 100 - participationRate;

    // Synthetic humanized insight
    let insightPhrase = "";
    if (selectedAge === "18-24" || selectedAge === "25-34") {
      insightPhrase = `Dans votre tranche d'âge, ${malInscritRate} % des électeurs sont mal-inscrits : c'est le facteur n°1 d'abstention non-choisie le dimanche du scrutin.`;
    } else if (selectedDiplome === "sans_bac") {
      insightPhrase =
        "Le fossé éducatif s'est creusé de +13,8 points en 20 ans : 30,4 % des non-diplômés ne votent à aucun tour, contre 9,5 % pour l'enseignement supérieur.";
    } else if (selectedCsp === "cadre") {
      insightPhrase =
        "Les cadres pallient la mobilité par un usage massif des procurations (17 %), quadruplant leurs chances de voter en cas de déplacement.";
    } else if (selectedCsp === "ouvrier") {
      insightPhrase =
        "Avec 33 % d'abstention et seulement 4,5 % de procurations, les catégories ouvrières subissent un cumul d'obstacles logistiques et civiques.";
    } else {
      insightPhrase =
        "Le vote intermittent est désormais la norme : près d'un électeur sur deux (47,2 %) choisit ses scrutins à la carte au lieu de voter systématiquement.";
    }

    return {
      participationRate,
      abstentionRate,
      malInscritRate,
      explanationAge,
      explanationDiplome,
      explanationCsp,
      insightPhrase,
    };
  }, [selectedAge, selectedDiplome, selectedCsp]);

  // Filtered participation history
  const filteredHistory = useMemo(() => {
    if (historyScrutinFilter === "ALL") return data.participationHistory;
    return data.participationHistory.filter((h) =>
      h.scrutin.toLowerCase().includes(historyScrutinFilter.toLowerCase())
    );
  }, [data.participationHistory, historyScrutinFilter]);

  return (
    <div className="space-y-12">
      {/* ========================================================
          1. HERO & CHIFFRES CLÉS DE L'ABSTENTION
      ======================================================== */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2 border-b border-border/80">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
              Observatoire Sociologique &amp; Civique
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-foreground">
              Sociologie du Vote &amp; Abstention
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-1 max-w-2xl leading-relaxed">
              Vingt ans de données officielles (Insee, Ipsos, Conseil d'Analyse Économique) : délitement du vote assidu, creusement des fractures de classe et l'angle mort des 7,7 millions de mal-inscrits.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
            <span className="px-2 py-1 bg-muted rounded border border-border">Insee Première n°1929</span>
            <span className="px-2 py-1 bg-muted rounded border border-border">Ipsos 2022</span>
          </div>
        </div>

        {/* 4 Macro KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          <motion.div
            whileHover={{ y: -2 }}
            className="editorial-card p-4 sm:p-5 flex flex-col justify-between"
          >
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Les Mal-Inscrits
            </span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-foreground font-mono">
                7,7 M
              </span>
              <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                16,5%
              </span>
            </div>
            <span className="text-[11px] text-muted-foreground mt-1">
              Électeurs inscrits loin de leur domicile réel
            </span>
          </motion.div>

          <motion.div
            whileHover={{ y: -2 }}
            className="editorial-card p-4 sm:p-5 flex flex-col justify-between"
          >
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Vote Intermittent
            </span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-indigo-600 dark:text-indigo-400 font-mono">
                47,2%
              </span>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                +7,1 pts
              </span>
            </div>
            <span className="text-[11px] text-muted-foreground mt-1">
              Votent à la carte selon l'élection
            </span>
          </motion.div>

          <motion.div
            whileHover={{ y: -2 }}
            className="editorial-card p-4 sm:p-5 flex flex-col justify-between"
          >
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Fracture Éducative
            </span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-rose-600 dark:text-rose-400 font-mono">
                30,4%
              </span>
              <span className="text-xs font-bold text-rose-600 dark:text-rose-400">
                vs 9,5%
              </span>
            </div>
            <span className="text-[11px] text-muted-foreground mt-1">
              Abstention systématique sans diplôme vs supérieur
            </span>
          </motion.div>

          <motion.div
            whileHover={{ y: -2 }}
            className="editorial-card p-4 sm:p-5 flex flex-col justify-between"
          >
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Pic 25–29 Ans
            </span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-foreground font-mono">
                43%
              </span>
              <span className="text-xs font-medium text-muted-foreground">
                mal-inscrits
              </span>
            </div>
            <span className="text-[11px] text-muted-foreground mt-1">
              1er frein logistique au déplacement dans l'urne
            </span>
          </motion.div>
        </div>
      </section>

      {/* ========================================================
          2. LE SIMULATEUR DE PROFIL ÉLECTORAL INTERACTIF
      ======================================================== */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-1">
              <Sliders className="w-3.5 h-3.5" />
              <span>Simulateur Économétrique</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Quel est le profil de votre participation électorale ?
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Sélectionnez vos caractéristiques sociologiques pour observer les probabilités moyennes mesurées par l'Insee et Ipsos
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 editorial-card p-5 sm:p-7">
          {/* Selectors Column */}
          <div className="lg:col-span-7 space-y-5">
            {/* 1. Age Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-primary" />
                <span>1. Votre Tranche d'Âge</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 bg-muted/60 p-1 rounded-xl border border-border/50 text-xs">
                {[
                  { id: "18-24", label: "18–24 ans" },
                  { id: "25-34", label: "25–34 ans" },
                  { id: "35-49", label: "35–49 ans" },
                  { id: "50-64", label: "50–64 ans" },
                  { id: "65+", label: "65 ans et +" },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setSelectedAge(item.id)}
                    className={cn(
                      "py-2 px-2 rounded-lg font-semibold transition-all text-center",
                      selectedAge === item.id
                        ? "bg-card text-foreground shadow-sm border border-border"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Diplome Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-primary" />
                <span>2. Votre Niveau de Diplôme</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 bg-muted/60 p-1 rounded-xl border border-border/50 text-xs">
                {[
                  { id: "sans_bac", label: "Sans diplôme / < Bac" },
                  { id: "bac", label: "Baccalauréat" },
                  { id: "bac2", label: "Bac +2" },
                  { id: "superieur", label: "Supérieur (Bac +3+)" },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setSelectedDiplome(item.id)}
                    className={cn(
                      "py-2 px-2 rounded-lg font-semibold transition-all text-center",
                      selectedDiplome === item.id
                        ? "bg-card text-foreground shadow-sm border border-border"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 3. CSP Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-primary" />
                <span>3. Votre Catégorie Socio-Professionnelle (CSP)</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 bg-muted/60 p-1 rounded-xl border border-border/50 text-xs">
                {[
                  { id: "cadre", label: "Cadre / Libéral" },
                  { id: "intermediaire", label: "Prof. Intermédiaire" },
                  { id: "employe", label: "Employé(e)" },
                  { id: "ouvrier", label: "Ouvrier(ère)" },
                  { id: "retraite", label: "Retraité(e)" },
                  { id: "chomeur", label: "Demandeur d'emploi" },
                  { id: "independant", label: "Indépendant / Artisan" },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setSelectedCsp(item.id)}
                    className={cn(
                      "py-2 px-2 rounded-lg font-semibold transition-all text-center",
                      selectedCsp === item.id
                        ? "bg-card text-foreground shadow-sm border border-border"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Personalized Micro-analysis Badges */}
            <div className="space-y-2 pt-2 border-t border-border/60 text-xs">
              <div className="flex items-start gap-2 text-muted-foreground">
                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                <span>{simulation.explanationAge}</span>
              </div>
              <div className="flex items-start gap-2 text-muted-foreground">
                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                <span>{simulation.explanationDiplome}</span>
              </div>
              <div className="flex items-start gap-2 text-muted-foreground">
                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                <span>{simulation.explanationCsp}</span>
              </div>
            </div>
          </div>

          {/* Results Gauge Column */}
          <div className="lg:col-span-5 bg-muted/30 rounded-2xl p-5 sm:p-6 border border-border/70 flex flex-col justify-between space-y-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                Résultat de la Simulation
              </span>
              <h3 className="text-lg font-bold text-foreground">
                Probabilité de Vote vs Risque d'Abstention
              </h3>
            </div>

            {/* Animated Gauges */}
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-bold text-foreground flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    Participation Estimée
                  </span>
                  <span className="font-mono font-extrabold text-base text-emerald-600 dark:text-emerald-400">
                    {simulation.participationRate}%
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                  <motion.div
                    className="h-full bg-emerald-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${simulation.participationRate}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-bold text-foreground flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 text-rose-500" />
                    Risque d'Abstention
                  </span>
                  <span className="font-mono font-extrabold text-base text-rose-600 dark:text-rose-400">
                    {simulation.abstentionRate}%
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                  <motion.div
                    className="h-full bg-rose-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${simulation.abstentionRate}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  />
                </div>
              </div>
            </div>

            {/* Dynamic Insight Card */}
            <div className="p-3.5 rounded-xl bg-card border border-border shadow-sm space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-primary">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Le saviez-vous ?</span>
              </div>
              <p className="text-xs text-foreground font-medium leading-relaxed">
                {simulation.insightPhrase}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          3. FRACTURE ÉDUCATIVE & GÉNÉRATIONNELLE (2002 VS 2022)
      ======================================================== */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider mb-1">
              <TrendingDown className="w-3.5 h-3.5" />
              <span>Creusement des Inégalités</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              La Fracture Éducative &amp; Générationnelle
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Comparaison sur 20 ans (2002–2022) issue de l'enquête Insee Première n° 1929
            </p>
          </div>

          {/* Toggle Age vs Diplôme */}
          <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-xl text-xs border border-border/50 self-start sm:self-auto">
            {[
              { id: "AGE", label: "Par Tranche d'Âge" },
              { id: "DIPLOME", label: "Par Niveau de Diplôme" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFractureView(tab.id as any)}
                className="relative px-3 py-1.5 rounded-lg font-semibold transition-colors text-xs z-10 text-muted-foreground hover:text-foreground"
              >
                {fractureView === tab.id && (
                  <motion.div
                    layoutId="fractureTabPill"
                    className="absolute inset-0 bg-card rounded-lg shadow-sm border border-border -z-10"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <span className={fractureView === tab.id ? "text-foreground font-bold" : ""}>
                  {tab.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Fracture Cards */}
        <div className="editorial-card p-5 sm:p-7 space-y-6">
          {fractureView === "AGE" ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* 18-29 ans */}
                <div className="p-4 rounded-xl bg-card border border-border space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-foreground text-sm">
                      18–29 ans
                    </h4>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-rose-500/10 text-rose-600 dark:text-rose-400 font-bold">
                      Décrochage sévère
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div>
                      <div className="flex justify-between text-muted-foreground mb-1">
                        <span>Vote systématique (2002 ➔ 2022)</span>
                        <span className="font-mono font-bold text-foreground">
                          31,4% ➔ 17,3%
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div className="bg-rose-500 h-2 rounded-full w-[17.3%]" />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-muted-foreground mb-1">
                        <span>Abstention systématique</span>
                        <span className="font-mono font-bold text-foreground">
                          16,4% ➔ 23,7%
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div className="bg-amber-500 h-2 rounded-full w-[23.7%]" />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-muted-foreground mb-1">
                        <span>Législatives T1 (effondrement)</span>
                        <span className="font-mono font-bold text-rose-600 dark:text-rose-400">
                          50,7% ➔ 27,9%
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div className="bg-indigo-500 h-2 rounded-full w-[27.9%]" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* 30-64 ans */}
                <div className="p-4 rounded-xl bg-card border border-border space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-foreground text-sm">
                      30–64 ans
                    </h4>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold">
                      Participation médiane
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div>
                      <div className="flex justify-between text-muted-foreground mb-1">
                        <span>Vote systématique</span>
                        <span className="font-mono font-bold text-foreground">
                          49,1% ➔ 37,2%
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div className="bg-indigo-500 h-2 rounded-full w-[37.2%]" />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-muted-foreground mb-1">
                        <span>Abstention systématique</span>
                        <span className="font-mono font-bold text-foreground">
                          10,3% ➔ 12,7%
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div className="bg-amber-500 h-2 rounded-full w-[12.7%]" />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-muted-foreground mb-1">
                        <span>Présidentielle 1er tour</span>
                        <span className="font-mono font-bold text-foreground">
                          75,9% ➔ 81,7%
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div className="bg-emerald-500 h-2 rounded-full w-[81.7%]" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* 65 ans et plus */}
                <div className="p-4 rounded-xl bg-card border border-border space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-foreground text-sm">
                      65 ans et plus
                    </h4>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold">
                      Socle de participation
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div>
                      <div className="flex justify-between text-muted-foreground mb-1">
                        <span>Vote systématique</span>
                        <span className="font-mono font-bold text-foreground">
                          55,7% ➔ 47,7%
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div className="bg-emerald-500 h-2 rounded-full w-[47.7%]" />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-muted-foreground mb-1">
                        <span>Abstention systématique</span>
                        <span className="font-mono font-bold text-foreground">
                          14,3% ➔ 17,1%
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div className="bg-amber-500 h-2 rounded-full w-[17.1%]" />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-muted-foreground mb-1">
                        <span>Législatives 1er tour</span>
                        <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                          71,5% ➔ 61,0%
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div className="bg-emerald-500 h-2 rounded-full w-[61%]" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Sans diplôme */}
                <div className="p-4 rounded-xl bg-card border border-border space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-foreground text-sm">
                      Aucun diplôme
                    </h4>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-rose-500/10 text-rose-600 dark:text-rose-400 font-bold">
                      Abstention record
                    </span>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Abstention systématique 2002 :</span>
                      <span className="font-mono font-bold">16,6%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-foreground font-semibold">Abstention systématique 2022 :</span>
                      <span className="font-mono font-bold text-rose-600 dark:text-rose-400">30,4% (+13,8 pts)</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-rose-500 h-2 rounded-full w-[30.4%]" />
                    </div>
                  </div>
                </div>

                {/* Enseignement Supérieur */}
                <div className="p-4 rounded-xl bg-card border border-border space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-foreground text-sm">
                      Diplômés de l'enseignement supérieur
                    </h4>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold">
                      Vote assidu
                    </span>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Abstention systématique 2002 :</span>
                      <span className="font-mono font-bold">5,9%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-foreground font-semibold">Abstention systématique 2022 :</span>
                      <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">9,5% (seulement)</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-emerald-500 h-2 rounded-full w-[9.5%]" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-muted/40 border border-border text-xs text-muted-foreground italic">
                Source : Insee Première n° 1929 — Enquête Participation électorale 2002–2022 (France métropolitaine, hors étudiants).
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ========================================================
          4. LE BAROMÈTRE DU "VOTE INTERMITTENT"
      ======================================================== */}
      <section className="space-y-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-1">
            <Vote className="w-3.5 h-3.5" />
            <span>Changement d'Époque</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            Le Baromètre du "Vote Intermittent"
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            L'effacement du citoyen régulier au profit de l'électeur intermittent qui choisit ses élections
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 editorial-card p-5 sm:p-7">
          {/* Evolution Bar Chart */}
          <div className="lg:col-span-7 space-y-4">
            <h3 className="text-sm font-bold text-foreground">
              Comportement électoral sur 20 ans (Insee)
            </h3>

            <div className="space-y-3">
              {data.typologie.evolution.map((item) => (
                <div key={item.annee} className="space-y-1">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="font-bold text-foreground">{item.annee}</span>
                    <span className="text-muted-foreground">
                      Systématique {item.voteSystematique}% | Intermittent {item.voteIntermittent}% | Abstention {item.abstentionSystematique}%
                    </span>
                  </div>

                  {/* Stacked Bar */}
                  <div className="w-full h-5 rounded-lg overflow-hidden flex bg-muted text-[10px] font-bold text-white font-mono leading-5">
                    <div
                      style={{ width: `${item.voteSystematique}%` }}
                      className="bg-emerald-600 pl-2"
                    >
                      {item.voteSystematique}%
                    </div>
                    <div
                      style={{ width: `${item.voteIntermittent}%` }}
                      className="bg-indigo-600 pl-2"
                    >
                      {item.voteIntermittent}%
                    </div>
                    <div
                      style={{ width: `${item.abstentionSystematique}%` }}
                      className="bg-rose-600 pl-1"
                    >
                      {item.abstentionSystematique}%
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap items-center gap-4 text-xs font-medium pt-2 border-t border-border">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-emerald-600" />
                <span>Vote systématique</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-indigo-600" />
                <span>Vote intermittent</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-rose-600" />
                <span>Abstention systématique</span>
              </div>
            </div>
          </div>

          {/* Décrochage Focus Card */}
          <div className="lg:col-span-5 bg-muted/40 rounded-2xl p-5 sm:p-6 border border-border/80 flex flex-col justify-between space-y-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-primary block mb-1">
                Le Décrochage Majeur
              </span>
              <h3 className="text-base sm:text-lg font-bold text-foreground">
                Présidentielle ➔ Législatives : le grand fossé
              </h3>
              <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                Le comportement qui a le plus progressé en 20 ans : voter aux deux tours de l'élection présidentielle et <strong>déserter totalement les deux tours des législatives</strong> deux mois plus tard.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-card border border-border space-y-2">
              <div className="flex justify-between items-baseline">
                <span className="text-xs font-semibold text-muted-foreground">Part en 2002 :</span>
                <span className="font-mono text-sm font-bold text-muted-foreground">8,6%</span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-xs font-bold text-foreground">Part en 2022 :</span>
                <span className="font-mono text-xl font-black text-rose-600 dark:text-rose-400">18,3%</span>
              </div>
              <span className="block text-[11px] text-muted-foreground font-medium pt-1 border-t border-border/60">
                Près d'un électeur sur cinq ne se déplace plus que pour choisir le chef de l'État.
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          5. COMPOSANT FOCUS : L'ANGLE MORT DES SONDAGES (MAL-INSCRITS)
      ======================================================== */}
      <section className="space-y-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-1">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Enquête Méthodologique</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            L'Angle Mort des Sondages : les 7,7 millions de Mal-Inscrits
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Pourquoi les instituts de sondage sur-estiment systématiquement la mobilisation électorale des jeunes
          </p>
        </div>

        <div className="editorial-card p-5 sm:p-7 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Pilier 1 */}
            <div className="p-4 rounded-xl bg-card border border-border space-y-2">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold font-mono text-sm">
                1
              </div>
              <h4 className="font-bold text-sm text-foreground">
                L'ampleur du phénomène
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                <strong>7,7 millions de Français</strong> sont inscrits dans une autre commune que celle où ils résident (16,5% du corps électoral), auxquels s'ajoutent <strong>2,5 millions de non-inscrits</strong>.
              </p>
            </div>

            {/* Pilier 2 */}
            <div className="p-4 rounded-xl bg-card border border-border space-y-2">
              <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold font-mono text-sm">
                2
              </div>
              <h4 className="font-bold text-sm text-foreground">
                Le pic chez les 25–29 ans
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                <strong>43 % des 25–29 ans sont mal-inscrits</strong> (chiffre Insee / CAE). Mobilité étudiante et début de carrière font qu'ils restent souvent inscrits chez leurs parents à des centaines de kilomètres.
              </p>
            </div>

            {/* Pilier 3 */}
            <div className="p-4 rounded-xl bg-card border border-border space-y-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold font-mono text-sm">
                3
              </div>
              <h4 className="font-bold text-sm text-foreground">
                L'inégalité des procurations
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Seuls <strong>4,5 % des ouvriers</strong> recourent au vote par procuration, contre <strong>17 % des cadres supérieurs</strong> (rapport de 1 à 4). L'empêchement logistique frappe de plein fouet les milieux populaires.
              </p>
            </div>
          </div>

          {/* Explication du biais de sondage */}
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-foreground space-y-1.5 leading-relaxed">
            <span className="font-bold flex items-center gap-1.5 text-amber-800 dark:text-amber-300">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              Pourquoi cela biaise-t-il les intentions de vote publiées ?
            </span>
            <p className="text-amber-900/90 dark:text-amber-200/90">
              Lorsqu'un sondeur demande par téléphone ou internet <em>« Avez-vous l'intention d'aller voter dimanche ? »</em>, le citoyen interrogé répond en toute bonne foi qu'il le souhaite. Mais le jour J, s'il est inscrit à 300 kilomètres sans procuration validée en commissariat, il renonce. Ce décalage mécanique constitue l'une des explications scientifiques majeures des écarts constatés sur les listes de jeunesse ou de rupture.
            </p>
          </div>
        </div>
      </section>

      {/* ========================================================
          6. HISTORIQUE OFFICIEL DE LA PARTICIPATION (2002–2026)
      ======================================================== */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-primary uppercase tracking-wider mb-1">
              <Clock className="w-3.5 h-3.5" />
              <span>Archives Électorales</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Historique Officiel de la Participation (2002–2026)
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Données certifiées de participation, d'abstention et de votes blancs/nuls pour chaque scrutin
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-xl text-xs border border-border/50 self-start sm:self-auto">
            {[
              { id: "ALL", label: "Tous les scrutins" },
              { id: "Présidentielle", label: "Présidentielles" },
              { id: "Législatives", label: "Législatives" },
              { id: "Européennes", label: "Européennes" },
              { id: "Municipales", label: "Municipales" },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setHistoryScrutinFilter(f.id)}
                className="relative px-3 py-1.5 rounded-lg font-semibold transition-colors text-xs z-10 text-muted-foreground hover:text-foreground"
              >
                {historyScrutinFilter === f.id && (
                  <motion.div
                    layoutId="historyFilterPill"
                    className="absolute inset-0 bg-card rounded-lg shadow-sm border border-border -z-10"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <span className={historyScrutinFilter === f.id ? "text-foreground font-bold" : ""}>
                  {f.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* History Table */}
        <div className="editorial-card overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-border flex items-center justify-between text-xs text-muted-foreground font-semibold uppercase tracking-wider">
            <span>Scrutin &amp; Tour</span>
            <div className="flex items-center gap-8 sm:gap-12 text-right">
              <span className="w-20">Participation</span>
              <span className="w-20">Abstention</span>
              <span className="w-24 hidden sm:inline">Blancs &amp; Nuls</span>
            </div>
          </div>

          <div className="divide-y divide-border">
            {filteredHistory.map((item) => (
              <div
                key={`${item.scrutin}-${item.annee}-t${item.tour}`}
                className="p-4 sm:p-5 flex items-center justify-between hover:bg-muted/40 transition-colors text-xs sm:text-sm"
              >
                <div>
                  <span className="font-bold text-foreground block">
                    {item.scrutin} {item.annee} — Tour {item.tour}
                  </span>
                  <span className="text-xs text-muted-foreground font-mono">
                    {item.date} • {(item.inscrits / 1000000).toFixed(1)} M inscrits
                  </span>
                </div>

                <div className="flex items-center gap-8 sm:gap-12 text-right font-mono">
                  <div className="w-20">
                    <span className="font-extrabold text-foreground block">
                      {item.tauxParticipation.toFixed(1)}%
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {(item.votants / 1000000).toFixed(1)}M votants
                    </span>
                  </div>

                  <div className="w-20">
                    <span className="font-bold text-rose-600 dark:text-rose-400 block">
                      {item.tauxAbstention.toFixed(1)}%
                    </span>
                  </div>

                  <div className="w-24 hidden sm:block">
                    <span className="font-semibold text-muted-foreground block">
                      {item.partBlancsNulsVotants.toFixed(1)}%
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {(item.blancsNulsTotal / 1000).toFixed(0)}k bulletins
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
