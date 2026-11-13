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
  ShieldCheck,
  CheckCircle2,
  BarChart3,
  Flame,
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

  const quickSymbols = ["RELIANCE", "TRENT", "DIXON", "KAYNES", "TCS", "HDFCBANK", "ZOMATO"];

  const launchCards = [
    {
      title: "The Warmup Cockpit",
      subtitle: "Morning Market Breadth & Sentiment",
      description:
        "Comprehensive market diagnostic cockpit featuring % of stocks above 20/50/200 SMA, composite RME Sentiment Index, and Stan Weinstein 4-Stage market lifecycle distribution.",
      href: "/warmup",
      icon: Activity,
      badge: "Market Breadth",
      badgeColor: "bg-amber-500/10 text-amber-400 border-amber-500/20",
      cta: "Launch The Warmup",
      features: ["50 SMA Participation Dial", "RME Sentiment Meter (0-100)", "Stage 2 vs Stage 4 Ratio", "Pre-Market Global Cues"],
    },
    {
      title: "Institutional Scanners",
      subtitle: "5 High-Conviction Momentum Scanners",
      description:
        "Instant, pre-computed EOD scanners powered by vectorized Polars expressions. Scans 2,500+ NSE stocks in under 15ms without scraping.",
      href: "/scanners/trend-template",
      icon: Zap,
      badge: "5 Pre-Computed Scanners",
      badgeColor: "bg-accent/10 text-accent border-accent/20",
      cta: "Explore Scanners",
      features: ["Minervini 8-Point Trend Template", "4%+ Volume Climax Breakouts", "Recent Pivot Breakouts", "High RVOL & 1M Top Gainers"],
    },
    {
      title: "TradingView Charting Suite",
      subtitle: "60 FPS Canvas & Financial Statements",
      description:
        "Hardware-accelerated candlestick charts with SMA 10/20/50/200 overlays, IBD-style Relative Strength line relative to NIFTY 50, and 5-year quarterly financials.",
      href: "/stock/RELIANCE",
      icon: LineChart,
      badge: "Lightweight Charts v4",
      badgeColor: "bg-blue-500/10 text-blue-400 border-blue-500/20",
      cta: "Open Stock Detail",
      features: ["Candlesticks + Volume Surge Histograms", "RS Line vs NIFTY 50 Overlay", "Screener 5-Year Quarterly P&L", "FII/DII Shareholding Trends"],
    },
    {
      title: "Watchlists & Trader Journal",
      subtitle: "Direct Persistence & Zero-Friction Storage",
      description:
        "Single-user persistent watchlists backed by PostgreSQL 16 with in-memory fallback. Add symbols with global 'W' key, track 20D sparklines, and auto-save notes.",
      href: "/watchlists",
      icon: Star,
      badge: "Single-User Persistence",
      badgeColor: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
      cta: "Manage Watchlists",
      features: ["Multi-Watchlist Tabs & CSV Export", "20-Day Mini Canvas Sparklines", "Star Favourites Quick Toggle", "Debounced Private Notes Sync"],
    },
    {
      title: "Relative Rotation Graph (RRG)",
      subtitle: "Vectorized Sector & Stock Rotation",
      description:
        "Interactive 4-quadrant scatter chart plotting JdK RS-Ratio vs RS-Momentum with clockwise cyclical trailing tails across 5D, 10D, and 20D horizons.",
      href: "/rrg",
      icon: Compass,
      badge: "JdK Rotational Model",
      badgeColor: "bg-purple-500/10 text-purple-400 border-purple-500/20",
      cta: "Open Rotation Graph",
      features: ["Leading, Weakening, Lagging, Improving", "Sector Index Rotations vs NIFTY 50", "Top Momentum Rotational Leaders", "5D / 10D / 20D Trailing Tails"],
    },
    {
      title: "Market Cap Treemap Heatmap",
      subtitle: "Hierarchical Sector & Stock Performance",
      description:
        "Cap-weighted recursive treemap visualizing daily percentage returns across NIFTY 50, NIFTY NEXT 50, NIFTY MIDCAP 100, and NIFTY 500.",
      href: "/heatmap",
      icon: LayoutGrid,
      badge: "Treemap Visualizer",
      badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
      cta: "Open Market Heatmap",
      features: ["Recursive Cap-Weighted Layout", "Cyan (+Gain) & Red (-Loss) Heatmap", "Index Filtering (N50, Midcap, N500)", "Instant Stock Inspection Tooltip"],
    },
  ];

  return (
    <main className="min-h-screen py-8 sm:py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
      {/* Hero Cockpit Header */}
      <section className="text-center space-y-6 pt-4 pb-2">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-accent/10 border border-accent/25 text-accent shadow-sm">
          <Sparkles className="h-3.5 w-3.5" /> Institutional Indian Equity Swing Trading Engine
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground max-w-4xl mx-auto leading-tight sm:leading-none">
          Precision market breadth & <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent via-blue-400 to-indigo-400">
            high-speed scanners
          </span>{" "}
          for NSE.
        </h1>

        <p className="max-w-2xl mx-auto text-sm sm:text-base text-muted-foreground leading-relaxed">
          Inspired by ScanTheCharts. Engineered with pure Rust-backed Polars expressions, sub-15ms pre-computed Redis caches, hardware-accelerated TradingView charts, and direct database persistence.
        </p>

        {/* Hero Quick Search & Symbol Jump */}
        <div className="max-w-xl mx-auto pt-2 space-y-3">
          <form onSubmit={handleSearch} className="relative flex items-center shadow-lg shadow-accent/5">
            <input
              type="text"
              value={searchSymbol}
              onChange={(e) => setSearchSymbol(e.target.value)}
              placeholder="Search or jump to any NSE stock (e.g. RELIANCE, TRENT, DIXON)..."
              className="w-full pl-11 pr-24 py-3 text-sm rounded-xl border border-border bg-card/90 text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-accent font-mono"
            />
            <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground pointer-events-none" />
            <button
              type="submit"
              className="absolute right-2 px-4 py-1.5 rounded-lg bg-accent text-white font-medium text-xs hover:bg-accent/90 transition-colors cursor-pointer"
            >
              Search
            </button>
          </form>

          {/* Quick Symbol Pills */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 text-xs text-muted-foreground">
            <span className="font-medium mr-1 text-[11px]">Popular:</span>
            {quickSymbols.map((sym) => (
              <button
                key={sym}
                onClick={() => router.push(`/stock/${sym}`)}
                className="px-2 py-0.5 rounded-md border border-border/70 bg-card hover:bg-accent/15 hover:text-accent hover:border-accent/40 font-mono text-[11px] transition-colors cursor-pointer"
              >
                {sym}
              </button>
            ))}
          </div>
        </div>

        {/* Primary Launch Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link
            href="/warmup"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent text-white font-semibold text-sm shadow-md shadow-accent/20 hover:bg-accent/90 transition-all cursor-pointer"
          >
            <Activity className="h-4 w-4" />
            <span>Launch The Warmup</span>
            <ArrowRight className="h-4 w-4" />
          </Link>

          <Link
            href="/scanners/trend-template"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border bg-card text-foreground font-semibold text-sm hover:bg-muted/80 transition-all cursor-pointer"
          >
            <Zap className="h-4 w-4 text-accent" />
            <span>Open Scanners</span>
          </Link>

          <Link
            href="/watchlists"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border bg-card text-foreground font-semibold text-sm hover:bg-muted/80 transition-all cursor-pointer"
          >
            <Star className="h-4 w-4 text-yellow-400" />
            <span>My Watchlists</span>
          </Link>
        </div>
      </section>

      {/* Quick Scanner Shortcut Strip */}
      <section className="p-4 rounded-2xl border border-border bg-card/60 backdrop-blur-sm space-y-3">
        <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
          <span className="flex items-center gap-1.5 text-foreground">
            <Zap className="h-4 w-4 text-accent" /> Direct Scanner Shortcuts
          </span>
          <Link href="/scanners/trend-template" className="text-accent hover:underline text-[11px]">
            View all scanners &rarr;
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          {[
            { name: "Trend Template", slug: "trend-template", desc: "Minervini 8-Pt Criteria" },
            { name: "Recent Breakouts", slug: "recent-breakout", desc: "Consolidation Pivots" },
            { name: "4%+ Expansion", slug: "4pct-breakout", desc: "Volume Surges" },
            { name: "High RVOL", slug: "high-volume", desc: "Institutional Flow" },
            { name: "1M Gainers", slug: "1m-gainers", desc: "Top Relative Strength" },
          ].map((sc) => (
            <Link
              key={sc.slug}
              href={`/scanners/${sc.slug}`}
              className="p-2.5 rounded-xl border border-border bg-background hover:border-accent/40 hover:bg-accent/5 transition-all group"
            >
              <div className="font-semibold text-xs text-foreground group-hover:text-accent flex items-center justify-between">
                <span>{sc.name}</span>
                <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="text-[10px] text-muted-foreground truncate">{sc.desc}</div>
            </Link>
          ))}
        </div>
      </section>

      {/* 6 Feature Launchpad Cards Grid */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-accent" /> Platform Features & Visualizations
          </h2>
          <span className="text-xs text-muted-foreground">6 Institutional Modules</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {launchCards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.href}
                className="flex flex-col justify-between p-6 rounded-2xl border border-border bg-card hover:border-accent/50 hover:shadow-xl hover:shadow-accent/5 transition-all group"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="h-10 w-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent group-hover:scale-105 transition-transform">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className={`text-[11px] font-mono px-2 py-0.5 rounded-full border font-semibold ${card.badgeColor}`}>
                      {card.badge}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <h3 className="font-bold text-lg text-foreground group-hover:text-accent transition-colors">
                      {card.title}
                    </h3>
                    <p className="text-xs font-medium text-accent/90">{card.subtitle}</p>
                    <p className="text-xs text-muted-foreground leading-relaxed pt-1">{card.description}</p>
                  </div>

                  <ul className="text-xs space-y-1.5 font-mono text-muted-foreground border-t border-border/60 pt-3">
                    {card.features.map((feat, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <CheckCircle2 className="h-3.5 w-3.5 text-bull shrink-0" />
                        <span className="truncate">{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-5 mt-auto">
                  <Link
                    href={card.href}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-accent text-white text-xs font-semibold hover:bg-accent/90 transition-colors shadow-sm cursor-pointer"
                  >
                    <span>{card.cta}</span>
                    <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}
