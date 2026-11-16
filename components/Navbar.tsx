"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ThemeToggle } from "./ThemeToggle";
import {
  Activity,
  BarChart3,
  Vote,
  Landmark,
  Globe2,
  Award,
  Menu,
  X,
  Compass,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/", icon: Activity },
  { label: "Présidentielles", href: "/presidentielles", icon: Vote },
  { label: "Législatives", href: "/legislatives", icon: Landmark },
  { label: "Européennes", href: "/europeennes", icon: Globe2 },
  { label: "Leaderboard Sondeurs", href: "/instituts", icon: Award },
  { label: "Méthodologie", href: "/methodologie", icon: Compass },
];

export function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-xl transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo Brand */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 via-indigo-600 to-amber-500 p-[1.5px] shadow-lg shadow-indigo-500/10 group-hover:shadow-indigo-500/30 transition-all">
              <div className="w-full h-full bg-zinc-950 rounded-[10px] flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-indigo-400 group-hover:scale-110 transition-transform" />
              </div>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight text-white">
                  LE VOTOMÈTRE
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-indigo-950/80 text-indigo-300 border border-indigo-700/40">
                  2002–2027
                </span>
              </div>
              <span className="text-[11px] text-zinc-400 hidden sm:inline">
                L'observatoire de précision des sondages
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
                    isActive
                      ? "bg-zinc-800/90 text-white shadow-sm border border-zinc-700/60"
                      : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/40"
                  )}
                >
                  <Icon className={cn("w-4 h-4", isActive ? "text-indigo-400" : "text-zinc-400")} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Right controls */}
          <div className="flex items-center gap-3">
            <ThemeToggle />

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl bg-zinc-800/60 text-zinc-300 hover:text-white border border-zinc-700/50"
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-zinc-800 bg-zinc-950/95 backdrop-blur-2xl px-4 pt-2 pb-6 space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                  isActive
                    ? "bg-zinc-800 text-white border border-zinc-700"
                    : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900"
                )}
              >
                <Icon className={cn("w-4 h-4", isActive ? "text-indigo-400" : "text-zinc-400")} />
                {item.label}
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}
