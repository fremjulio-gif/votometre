import Link from "next/link";
import { ShieldCheck, Database, Scale, BarChart2 } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full border-t border-zinc-800/80 bg-zinc-950 text-zinc-400 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2 text-white font-bold text-base">
              <BarChart2 className="w-5 h-5 text-indigo-400" />
              <span>LE VOTOMÈTRE</span>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Observatoire citoyen indépendant dédié à la mesure scientifique et statistique de la précision des sondages électoraux en France (2002–2024 & prospective 2027).
            </p>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-zinc-200 uppercase tracking-wider mb-3">
              Scrutins analysés
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/presidentielles" className="hover:text-white transition-colors">
                  Présidentielles (2002–2022 & 2027)
                </Link>
              </li>
              <li>
                <Link href="/legislatives" className="hover:text-white transition-colors">
                  Législatives & Hémicycle (577 sièges)
                </Link>
              </li>
              <li>
                <Link href="/europeennes" className="hover:text-white transition-colors">
                  Élections Européennes (2004–2024)
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-zinc-200 uppercase tracking-wider mb-3">
              Analyses & Rigueur
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/instituts" className="hover:text-white transition-colors">
                  Leaderboard des 12 Instituts
                </Link>
              </li>
              <li>
                <Link href="/methodologie" className="hover:text-white transition-colors">
                  Méthode statistique & Marges d'erreur
                </Link>
              </li>
              <li>
                <span className="text-zinc-400">
                  Formule MAE & Biais systématique
                </span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-zinc-200 uppercase tracking-wider mb-3">
              Sources officielles certifiées
            </h4>
            <p className="text-xs text-zinc-400 leading-relaxed mb-2">
              Données de proclamation officielle du <strong>Conseil constitutionnel</strong>, du <strong>Ministère de l'Intérieur</strong> et de l'<strong>Assemblée nationale</strong>.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-zinc-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Garantie de neutralité politique</span>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-zinc-800/60 flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-400 gap-4">
          <p>© 2002–2026 Le Votomètre (levotometre.fr) — Tous droits réservés.</p>
          <div className="flex items-center gap-4 text-zinc-400">
            <span>Données certifiées open-data</span>
            <span>•</span>
            <span>Next.js 15 App Router</span>
            <span>•</span>
            <span>Tailwind & Recharts</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
