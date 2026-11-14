"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Activity,
  Zap,
  LineChart,
  Star,
  Compass,
  LayoutGrid,
  Search,
  ArrowRight,
  TrendingUp,
  BarChart3,
  Flame,
  Layers,
  Calendar,
  Newspaper,
  ChevronRight,
  Sparkles,
} from "lucide-react";

export default function Home() {
  const router = useRouter();
  const [searchSymbol, setSearchSymbol] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const sym = searchSymbol.trim().toUpperCase();
    if (sym) {
      router.push(`/stock/${sym}`);
    }
  };

  const quickSymbols = ["RELIANCE", "TRENT", "DIXON", "KAYNES", "TCS", "HDFCBANK", "ZOMATO", "BEL"];

  const bentoWorkspaces = [
    {
      title: "The Warmup Cockpit",
      description: "Morning market readiness, 20/50/200 SMA breadth, RME sentiment & FII/DII net flows.",
      href: "/warmup",
      icon: Activity,
      badge: "Morning Routine",
      badgeColor: "bg-blue-50 text-blue-700 border-blue-200/60 dark:bg-blue-950/40 dark:text-blue-300",
      stats: "74.4% Broad • +20.6 pts/wk",
      colSpan: "lg:col-span-6",
    },
    {
      title: "Market Breadth & Indices",
      description: "Stan Weinstein 4-Stage breakdown, 6 regime pillars, and advance/decline internals.",
      href: "/markets",
      icon: BarChart3,
      badge: "NSE Universe Breadth",
      badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200/60 dark:bg-emerald-950/40 dark:text-emerald-300",
      stats: "+180 Net Highs • 38.7% Stage 2",
      colSpan: "lg:col-span-6",
    },
    {
      title: "Intraday Screener",
      description: "3-column live radar tracking VWAP positioning, unusual RVol & momentum screens.",
      href: "/intraday",
      icon: Zap,
      badge: "Live Session",
      badgeColor: "bg-amber-50 text-amber-700 border-amber-200/60 dark:bg-amber-950/40 dark:text-amber-300",
      stats: "568 Above VWAP • 211 20D Highs",
      colSpan: "lg:col-span-4",
    },
    {
      title: "Technical Scanners Hub",
      description: "Sub-15ms vectorized Polars queries for Trend Template, VCP, IPO Bases & Pivot Breakouts.",
      href: "/scanners/trend-template",
      icon: TrendingUp,
      badge: "11+ Presets",
      badgeColor: "bg-indigo-50 text-indigo-700 border-indigo-200/60 dark:bg-indigo-950/40 dark:text-indigo-300",
      stats: "Minervini & O'Neil Filters",
      colSpan: "lg:col-span-4",
    },
    {
      title: "Relative Rotation Graph",
      description: "JdK rotational quadrant model plotting RS-Ratio vs RS-Momentum with trailing tails.",
      href: "/rrg",
      icon: Compass,
      badge: "Sector Rotation",
      badgeColor: "bg-purple-50 text-purple-700 border-purple-200/60 dark:bg-purple-950/40 dark:text-purple-300",
      stats: "4-Quadrant Cyclical Model",
      colSpan: "lg:col-span-4",
    },
    {
      title: "Market Cap Treemap Heatmap",
      description: "Cap-weighted recursive treemap visualizing daily returns across Nifty 200 & 500.",
      href: "/heatmap",
      icon: LayoutGrid,
      badge: "Visualizer",
      badgeColor: "bg-rose-50 text-rose-700 border-rose-200/60 dark:bg-rose-950/40 dark:text-rose-300",
      stats: "Cap-Weighted Hierarchies",
      colSpan: "lg:col-span-4",
    },
    {
      title: "Top 150 Sector Leaders",
      description: "Leading growth stocks with 5-quarter financial statements & volume surge markers.",
      href: "/leaders",
      icon: Flame,
      badge: "Market Leaders",
      badgeColor: "bg-orange-50 text-orange-700 border-orange-200/60 dark:bg-orange-950/40 dark:text-orange-300",
      stats: "Institutional High Volume (HVE)",
      colSpan: "lg:col-span-4",
    },
    {
      title: "Corporate News & Wires",
      description: "Categorized corporate disclosures: Earnings, Orders, Corp actions, and Regulatory.",
      href: "/news",
      icon: Newspaper,
      badge: "Exchange Wires",
      badgeColor: "bg-cyan-50 text-cyan-700 border-cyan-200/60 dark:bg-cyan-950/40 dark:text-cyan-300",
      stats: "Timestamps & Tag Badges",
      colSpan: "lg:col-span-4",
    },
  ];

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto space-y-8">
      {/* ================= HERO SEARCH & HEADER ================= */}
      <div className="text-center space-y-4 pt-2 pb-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-950/50 text-primary border border-blue-200/60 dark:border-blue-900/50 shadow-2xs">
          <Sparkles className="h-3.5 w-3.5" />
          <span>TRADESCOUT (Inspired by Scan The Charts) • Indian Equity Analytics</span>
        </div>

        <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-foreground max-w-2xl mx-auto leading-tight">
          Precision market breadth &amp; modular scanners for NSE
        </h1>

        <p className="max-w-xl mx-auto text-xs sm:text-sm text-muted-foreground leading-relaxed">
          Clean minimalist, modular card (Bento-style) layout designed specifically for Indian National Stock Exchange (NSE) equity traders.
        </p>

        {/* Search Bar */}
        <div className="max-w-md mx-auto pt-1 space-y-2.5">
          <form onSubmit={handleSearch} className="relative flex items-center shadow-xs">
            <input
              type="text"
              value={searchSymbol}
              onChange={(e) => setSearchSymbol(e.target.value)}
              placeholder="Search ticker (e.g. RELIANCE, TRENT, DIXON)..."
              className="w-full pl-10 pr-20 py-2.5 text-xs rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary font-mono"
            />
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground pointer-events-none" />
            <button
              type="submit"
              className="absolute right-1.5 px-3 py-1.5 rounded-lg bg-primary text-white font-semibold text-xs hover:bg-primary/90 transition-colors cursor-pointer"
            >
              Search
            </button>
          </form>

          {/* Popular ticker pills */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 text-xs text-muted-foreground">
            <span className="text-[11px] font-medium mr-1">Popular:</span>
            {quickSymbols.map((sym) => (
              <button
                key={sym}
                onClick={() => router.push(`/stock/${sym}`)}
                className="px-2 py-0.5 rounded-md border border-border/80 bg-card hover:bg-primary/10 hover:text-primary font-mono text-[11px] transition-colors cursor-pointer"
              >
                {sym}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ================= MODULAR BENTO WORKSPACE TILES ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {bentoWorkspaces.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.title}
              href={card.href}
              className={`${card.colSpan} rounded-2xl bg-card border border-border/80 shadow-xs p-5 hover:border-primary/50 transition-all flex flex-col justify-between group space-y-3 cursor-pointer`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="h-8 w-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${card.badgeColor}`}>
                    {card.badge}
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors flex items-center gap-1">
                    <span>{card.title}</span>
                    <ChevronRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                    {card.description}
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-border/50 flex items-center justify-between text-[11px] font-mono text-muted-foreground">
                <span>{card.stats}</span>
                <span className="text-primary font-bold group-hover:translate-x-0.5 transition-transform">
                  Launch &rarr;
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}