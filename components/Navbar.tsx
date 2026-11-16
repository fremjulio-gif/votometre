"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ThemeToggle } from "./ThemeToggle";
import { Menu, X, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { label: "Accueil", href: "/" },
  { label: "Présidentielles", href: "/presidentielles" },
  { label: "Législatives", href: "/legislatives" },
  { label: "Européennes", href: "/europeennes" },
  { label: "Municipales", href: "/municipales" },
  { label: "Sociologie", href: "/abstention" },
  { label: "Instituts", href: "/instituts" },
  { label: "Méthode", href: "/methodologie" },
];

export function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/80 bg-background/80 backdrop-blur-md transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Logo Brand : Clean & Tactile */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-foreground text-background font-black flex items-center justify-center text-sm tracking-tighter shadow-sm transition-transform duration-200 group-hover:scale-105 group-active:scale-95">
              V
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base tracking-tight text-foreground">
                  LE VOTOMÈTRE
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block dot-pulse" />
              </div>
              <span className="text-[10px] text-muted-foreground hidden sm:inline -mt-1 font-medium tracking-wide">
                L'observatoire citoyen des sondages
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links with Sliding Pill */}
          <nav className="hidden md:flex items-center gap-1 text-sm font-medium relative p-1 bg-muted/50 rounded-xl border border-border/50">
            {NAV_ITEMS.map((item) => {
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "relative px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors z-10",
                    isActive
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="navbar-active-pill"
                      className="absolute inset-0 bg-card rounded-lg shadow-sm border border-border -z-10"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Controls */}
          <div className="flex items-center gap-2">
            <ThemeToggle />

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg bg-secondary text-foreground hover:bg-muted transition-colors active:scale-95"
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer with AnimatePresence */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="md:hidden border-b border-border bg-background/95 backdrop-blur-md px-4 py-3 space-y-1 overflow-hidden"
          >
            {NAV_ITEMS.map((item) => {
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
                    "block px-3 py-2 rounded-md text-sm font-medium transition-all active:scale-[0.98]",
                    isActive
                      ? "bg-secondary text-foreground font-semibold"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
