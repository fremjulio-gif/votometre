import { Compass, ShieldCheck, Database, CheckCircle2, Scale } from "lucide-react";

export const metadata = {
  title: "Méthodologie & Formules Statistiques — Le Votomètre",
  description:
    "Comprendre le calcul de la MAE, la formule des marges d'erreur de Bernoulli et les critères d'évaluation des sondages électoraux sur Le Votomètre.",
};

export default function MethodologiePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Header */}
      <div className="border-b border-zinc-800 pb-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-950/80 text-indigo-300 text-xs font-semibold mb-2 border border-indigo-700/60">
          <Compass className="w-3.5 h-3.5" />
          <span>Rigueur &amp; Réfutabilité Scientifique</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Méthodologie &amp; Moteur Statistique
        </h1>
        <p className="text-sm text-zinc-400 mt-2 leading-relaxed">
          Le Votomètre est un observatoire citoyen et non partisan. Notre démarche est strictement analytique : elle repose sur des données officielles proclamées et des métriques statistiques éprouvées.
        </p>
      </div>

      {/* Section 1 : Les 3 Métriques Fondamentales */}
      <section className="space-y-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Scale className="w-5 h-5 text-indigo-400" />
          1. Les 3 Métriques Mathématiques
        </h2>

        <div className="space-y-6">
          {/* Formule 1 : Signed Error */}
          <div className="glass-panel p-6 rounded-2xl border border-zinc-800 space-y-3">
            <h3 className="font-bold text-white text-base">
              A. L'Écart Simple ou Erreur Signée (Signed Error)
            </h3>
            <p className="text-xs text-zinc-300 leading-relaxed">
              Pour chaque candidat ou liste mesuré par un institut sur une élection donnée :
            </p>
            <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800/80 font-mono text-sm text-indigo-300 text-center">
              {"Δ = Score Réel (%) - Score Sondé (%)"}
            </div>
            <ul className="text-xs text-zinc-400 space-y-1.5 list-disc pl-5">
              <li>
                <strong className="text-emerald-400">Δ &gt; 0 (Sous-estimation) :</strong> Le candidat a réalisé un score supérieur aux intentions sondées (dynamique tardive, vote utile ou vote caché).
              </li>
              <li>
                <strong className="text-rose-400">Δ &lt; 0 (Sur-estimation) :</strong> Le candidat a réalisé un score inférieur aux intentions sondées (bulle médiatique, déperdition de participation).
              </li>
              <li>
                <strong className="text-indigo-400">|Δ| ≤ 1.5 pt :</strong> L'estimation se situe dans l'intervalle d'incertitude statistique standard.
              </li>
            </ul>
          </div>

          {/* Formule 2 : MAE */}
          <div className="glass-panel p-6 rounded-2xl border border-zinc-800 space-y-3">
            <h3 className="font-bold text-white text-base">
              B. L'Erreur Absolue Moyenne (MAE — Mean Absolute Error)
            </h3>
            <p className="text-xs text-zinc-300 leading-relaxed">
              La MAE constitue le standard d'or international (adopté par Nate Silver et FiveThirtyEight) pour mesurer la précision globale d'un institut sur un ensemble de N mesures :
            </p>
            <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800/80 font-mono text-sm text-amber-300 text-center">
              {"MAE_k = (1 / N) * Σ |Score Réel_i - Score Sondé_{i,k}|"}
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Contrairement à la moyenne simple qui compense artificiellement les sous-estimations par les sur-estimations, la MAE pénalise chaque point d'écart à sa juste valeur.
            </p>
          </div>

          {/* Formule 3 : Bernoulli */}
          <div className="glass-panel p-6 rounded-2xl border border-zinc-800 space-y-3">
            <h3 className="font-bold text-white text-base">
              C. La Marge d'Erreur Théorique (Intervalle de Bernoulli à 95%)
            </h3>
            <p className="text-xs text-zinc-300 leading-relaxed">
              Pour un échantillon aléatoire simple de taille n et une proportion observée p :
            </p>
            <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800/80 font-mono text-sm text-emerald-300 text-center">
              {"Marge d'erreur = ± 1.96 * √[p * (1 - p) / n]"}
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Pour un score à 20% mesuré sur un échantillon classique de 1 000 électeurs, la marge théorique est de <strong>±2,47 points</strong>.
            </p>
          </div>
        </div>
      </section>

      {/* Section 2 : Sources certifiées */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Database className="w-5 h-5 text-indigo-400" />
          2. Sources Officielles et Périmètre
        </h2>
        <div className="glass-panel p-6 rounded-2xl border border-zinc-800 space-y-4">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-white">
                Conseil constitutionnel &amp; Ministère de l'Intérieur
              </h4>
              <p className="text-xs text-zinc-400 leading-relaxed mt-0.5">
                Les scores officiels retenus sont exclusivement les résultats définitifs proclamés par le Conseil constitutionnel (pour les présidentielles) et validés par le Ministère de l'Intérieur (pour les législatives et européennes).
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-white">
                Notices de la Commission des sondages
              </h4>
              <p className="text-xs text-zinc-400 leading-relaxed mt-0.5">
                Tous les sondages recensés sont issus des vagues enregistrées auprès de la Commission des sondages, garantissant le respect de la législation française (taille d'échantillon, méthode des quotas, date de terrain).
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Neutrality pledge */}
      <section className="p-6 rounded-2xl bg-zinc-900/90 border border-zinc-700/60 flex items-center gap-4">
        <ShieldCheck className="w-8 h-8 text-emerald-400 shrink-0" />
        <div>
          <h4 className="text-sm font-bold text-white">
            Engagement d'Impartialité &amp; Réfutabilité
          </h4>
          <p className="text-xs text-zinc-400 leading-relaxed mt-1">
            Le Votomètre n'est financé par aucun parti politique ni aucun institut de sondage. L'ensemble des données, formules et codes sources est vérifiable et auditable.
          </p>
        </div>
      </section>
    </div>
  );
}
