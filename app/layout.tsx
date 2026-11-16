import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Le Votomètre — Observatoire de Précision des Sondages Électoraux (2002–2027)",
  description:
    "Observatoire citoyen et analytique qui confronte systématiquement les sondages d'opinion aux résultats réels des élections en France sur 20 ans (2002–2024 & prospective 2027). Mesure scientifique des marges d'erreur et des biais d'instituts.",
  keywords: [
    "sondages",
    "élections",
    "présidentielles",
    "législatives",
    "européennes",
    "dataviz",
    "marge d'erreur",
    "précision",
    "instituts",
    "Ipsos",
    "Ifop",
    "Elabe",
  ],
  authors: [{ name: "Le Votomètre Data Lab" }],
  openGraph: {
    title: "Le Votomètre — Les Sondages face aux Urnes",
    description: "20 ans d'élections passées au crible : qui s'est trompé, et de combien ?",
    url: "https://levotometre.fr",
    siteName: "Le Votomètre",
    locale: "fr_FR",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen flex flex-col bg-background text-foreground antialiased selection:bg-slate-200 dark:selection:bg-slate-800`}>
        <ThemeProvider>
          <Navbar />
          <main className="flex-1 w-full">{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
