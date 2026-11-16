import Link from "next/link";

export function Footer() {
  return (
    <footer className="w-full border-t border-border bg-background text-muted-foreground py-10 mt-16 text-xs">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row items-baseline justify-between gap-6 pb-6 border-b border-border">
          <div className="space-y-1 max-w-sm">
            <span className="font-bold text-foreground text-sm tracking-tight block">
              LE VOTOMÈTRE
            </span>
            <p className="leading-relaxed">
              Observatoire indépendant de mesure statistique des sondages électoraux face aux urnes en France (2002–2024 & prospective 2027).
            </p>
          </div>

          <div className="flex flex-wrap gap-6 font-medium">
            <Link href="/presidentielles" className="hover:text-foreground transition-colors">
              Présidentielles
            </Link>
            <Link href="/legislatives" className="hover:text-foreground transition-colors">
              Législatives
            </Link>
            <Link href="/europeennes" className="hover:text-foreground transition-colors">
              Européennes
            </Link>
            <Link href="/municipales" className="hover:text-foreground transition-colors">
              Municipales
            </Link>
            <Link href="/instituts" className="hover:text-foreground transition-colors">
              Instituts
            </Link>
            <Link href="/methodologie" className="hover:text-foreground transition-colors">
              Méthodologie
            </Link>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px]">
          <p>© Le Votomètre — Données publiques certifiées par le Conseil constitutionnel et le Ministère de l'Intérieur.</p>
          <div className="flex items-center gap-3">
            <span>Données ouvertes</span>
            <span>•</span>
            <span>Projet citoyen non-partisan</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
