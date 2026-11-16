import Link from "next/link";
import { Download, CheckCircle2, HelpCircle } from "lucide-react";

export const metadata = {
  title: "Les Règles du Jeu : Comprendre la Méthode — Le Votomètre",
  description:
    "Pourquoi les sondages ne sont pas des prédictions magiques, qu'est-ce qu'une marge d'erreur, et pourquoi 1 point d'écart n'est pas une erreur.",
};

export default function MethodologiePage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-14 space-y-12">
      {/* Editorial Title */}
      <div className="space-y-3 border-b border-border pb-6">
        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
          Pédagogie &amp; Rigueur
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
          Les Règles du Jeu
        </h1>
        <p className="text-base text-muted-foreground leading-relaxed">
          Un guide simple pour comprendre ce que les sondages peuvent dire — et ce qu'ils ne pourront jamais prédire.
        </p>
      </div>

      {/* Article Body */}
      <article className="space-y-10 text-sm sm:text-base text-foreground/90 leading-relaxed">
        {/* Section 1 */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-foreground tracking-tight">
            1. Pourquoi un sondage n'est pas une prédiction magique
          </h2>
          <p className="text-muted-foreground">
            Un sondage n'est pas une boule de cristal : c'est une <strong>photographie instantanée</strong> de l'opinion à un instant T, réalisée auprès d'un échantillon représentatif d'environ 1 000 à 2 000 personnes.
          </p>
          <p className="text-muted-foreground">
            Entre le moment où l'enquête est réalisée (souvent 48h à 72h avant le vote) et le moment où l'électeur glisse son bulletin dans l'urne, beaucoup de choses peuvent basculer : l'effet du dernier débat télévisé, le choix stratégique du vote utile, ou encore la météo et l'abstention différentielle.
          </p>
        </section>

        {/* Section 2 */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-foreground tracking-tight">
            2. Qu'est-ce qu'une marge d'erreur statistique ?
          </h2>
          <p className="text-muted-foreground">
            Interroger 1 000 personnes pour connaître le choix de 48 millions de citoyens induit mathématiquement une incertitude incompressible. C'est ce qu'on appelle la <strong>marge d'erreur</strong> (ou intervalle de confiance à 95%).
          </p>
          <div className="p-4 rounded-xl bg-muted/60 border border-border space-y-2 text-sm">
            <span className="font-bold text-foreground block">
              La règle simple à retenir :
            </span>
            <p className="text-muted-foreground text-xs leading-relaxed">
              Pour un candidat crédité de <strong>20%</strong> dans un sondage de 1 000 personnes, son score réel a 95% de chances de se situer entre <strong>17,5% et 22,5%</strong> (soit une fourchette de ±2,5 points).
            </p>
          </div>
        </section>

        {/* Section 3 */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-foreground tracking-tight">
            3. Pourquoi 1 point d'écart n'est pas une "erreur", mais 4 points changent l'Histoire
          </h2>
          <p className="text-muted-foreground">
            Lorsqu'un candidat est sondé à 24% et obtient 24,8% le dimanche soir, <strong>le sondage a parfaitement vu juste</strong> : l'écart de 0,8 point est totalement normal sur le plan statistique.
          </p>
          <p className="text-muted-foreground">
            En revanche, lorsqu'un candidat comme Jean-Marie Le Pen en 2002 est sondé à 13% et termine à 16,9% (+3,9 points au-delà des prévisions), il s'agit d'une <strong>sous-estimation majeure</strong>. Dans un scrutin uninominal à deux tours, ces 4 points d'écart ont provoqué l'élimination du Premier ministre sortant Lionel Jospin et bouleversé l'histoire politique française.
          </p>
        </section>

        {/* Section 4 */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-foreground tracking-tight">
            4. Comment nous calculons la précision
          </h2>
          <p className="text-muted-foreground">
            Plutôt que des formules complexes, Le Votomètre utilise la <strong>marge d'erreur moyenne</strong> (appelée MAE par les statisticiens) :
          </p>
          <div className="p-4 rounded-xl border border-border bg-card space-y-1.5 text-xs text-muted-foreground">
            <p>
              Pour chaque élection et chaque institut, nous mesurons l'écart en points absolu pour chaque candidat. Nous faisons ensuite la moyenne de tous ces écarts.
            </p>
            <p className="font-semibold text-foreground">
              Plus ce chiffre est proche de 0, plus le sondeur a vu clair.
            </p>
          </div>
        </section>

        {/* Section 5 : Sources et Open Data */}
        <section className="space-y-4 pt-4 border-t border-border">
          <h2 className="text-xl font-bold text-foreground tracking-tight">
            5. Sources certifiées &amp; Fichiers ouverts
          </h2>
          <p className="text-muted-foreground text-sm">
            Toutes les données utilisées sont publiques, vérifiables et téléchargeables au format Excel (.xlsx) :
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-lg border border-border bg-card flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-foreground block">
                  Résultats officiels proclamés
                </span>
                <span className="text-muted-foreground text-[11px]">
                  Conseil constitutionnel &amp; Ministère de l'Intérieur (2002–2024)
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-lg border border-border bg-card flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-foreground block">
                  Notices des sondages certifiées
                </span>
                <span className="text-muted-foreground text-[11px]">
                  Commission des sondages &amp; instituts adhérents SYNTEC
                </span>
              </div>
            </div>
          </div>
        </section>
      </article>

      {/* Return to Home CTA */}
      <div className="pt-6 border-t border-border text-center">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-foreground text-background font-semibold text-xs transition-opacity hover:opacity-90"
        >
          <span>Retourner au Flash Électoral</span>
        </Link>
      </div>
    </div>
  );
}
