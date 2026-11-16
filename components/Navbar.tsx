"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ThemeToggle } from "./ThemeToggle";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { label: "Accueil", href: "/" },
  { label: "Présidentielles", href: "/presidentielles" },
  { label: "Législatives", href: "/legislatives" },
  { label: "Européennes", href: "/europeennes" },
  { label: "Instituts", href: "/instituts" },
  { label: "Méthode", href: "/methodologie" },
];

export function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur-sm transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Logo Brand : Clean & Editorial */}
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-foreground text-background font-black flex items-center justify-center text-sm tracking-tighter">
              V
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-base tracking-tight text-foreground">
                LE VOTOMÈTRE
              </span>
              <span className="text-[10px] text-muted-foreground hidden sm:inline -mt-1 font-medium">
                L'observatoire citoyen des sondages
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
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
                    "px-3 py-1.5 rounded-md transition-colors",
                    isActive
                      ? "bg-secondary text-foreground font-semibold"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                  )}
                >
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
              className="md:hidden p-2 rounded-lg bg-secondary text-foreground"
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-border bg-background px-4 py-3 space-y-1">
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
                  "block px-3 py-2 rounded-md text-sm font-medium",
                  isActive
                    ? "bg-secondary text-foreground font-semibold"
                    : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}
