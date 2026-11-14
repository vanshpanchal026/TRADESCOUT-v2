"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserSwitcher } from "@/components/common/UserSwitcher";
import { CommandPalette } from "@/components/common/CommandPalette";
import { StockSearchBar } from "@/components/common/StockSearchBar";
import {
  Activity,
  Zap,
  LineChart,
  Star,
  Compass,
  LayoutGrid,
  Menu,
  X,
  TrendingUp,
} from "lucide-react";

export function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    {
      name: "The Warmup",
      href: "/warmup",
      icon: Activity,
      description: "Morning market breadth & sentiment",
    },
    {
      name: "Scanners",
      href: "/scanners/trend-template",
      icon: Zap,
      matchPrefix: "/scanners",
      description: "Minervini, Breakouts, Volume",
    },
    {
      name: "Stocks",
      href: "/stock/RELIANCE",
      icon: LineChart,
      matchPrefix: "/stock",
      description: "TradingView charts & fundamentals",
    },
    {
      name: "Watchlists",
      href: "/watchlists",
      icon: Star,
      description: "Saved stocks & private notes",
    },
    {
      name: "RRG",
      href: "/rrg",
      icon: Compass,
      description: "Relative Rotation Graph",
    },
    {
      name: "Heatmap",
      href: "/heatmap",
      icon: LayoutGrid,
      description: "Market cap treemap",
    },
  ];

  const isItemActive = (item: (typeof navItems)[0]) => {
    if (item.matchPrefix) {
      return pathname.startsWith(item.matchPrefix);
    }
    return pathname === item.href;
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-card/85 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-2.5 group cursor-pointer"
            >
              <div className="h-9 w-9 rounded-xl bg-accent flex items-center justify-center font-bold text-white shadow-md shadow-accent/25 group-hover:scale-105 transition-transform">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-base font-bold tracking-tight text-foreground flex items-center gap-1.5">
                  TRADESCOUT
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-accent/15 text-accent font-semibold">
                    PRO
                  </span>
                </span>
                <span className="text-[10px] text-muted-foreground font-medium hidden sm:inline">
                  NSE Technical Screener
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const active = isItemActive(item);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    active
                      ? "bg-accent/15 text-accent font-semibold border border-accent/30 shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/70"
                  }`}
                >
                  <Icon
                    className={`h-3.5 w-3.5 ${active ? "text-accent" : "text-muted-foreground"}`}
                  />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>

          {/* Search Bar & Right Controls */}
          <div className="flex items-center gap-2.5">
            {/* Quick Symbol Jump Input with Cmd+K hint & live prediction dropdown */}
            <div className="hidden sm:block">
              <StockSearchBar variant="compact" placeholder="Jump to symbol..." />
            </div>

            {/* High Performance L1 Cache Badge */}
            <div className="hidden xl:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border border-bull/30 bg-bull/10 text-bull">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-bull opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-bull"></span>
              </span>
              <span>⚡ 4ms Redis L1</span>
            </div>

            {/* User Account */}
            <UserSwitcher />

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Mobile Menu Hamburger Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Navigation */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-border py-3 px-2 space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
            {/* Mobile Symbol Search */}
            <div className="pb-2">
              <StockSearchBar
                className="w-full"
                placeholder="Search symbol (e.g. TRENT)..."
              />
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              {navItems.map((item) => {
                const active = isItemActive(item);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-2 p-2 rounded-lg text-xs font-medium ${
                      active
                        ? "bg-accent/15 text-accent font-semibold border border-accent/30"
                        : "text-muted-foreground hover:bg-muted text-foreground"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <div className="flex flex-col">
                      <span>{item.name}</span>
                      <span className="text-[10px] text-muted-foreground/70 font-normal truncate">
                        {item.description}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
      <CommandPalette />
    </nav>
  );
}

export default Navbar;
