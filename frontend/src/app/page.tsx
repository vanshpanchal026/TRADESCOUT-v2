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
  Layers,
  Calendar,
  Newspaper,
  Clock,
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

  const launchCards = [
    {
      title: "The Warmup Cockpit",
      subtitle: "Morning Market Breadth & Pre-Market Read",
      description:
        "Comprehensive market diagnostic cockpit featuring % of stocks above 20/50/200 SMA, composite RME Sentiment Index, FII/DII net cash flow tracking, and Stan Weinstein 4-Stage market lifecycle distribution.",
      href: "/warmup",
      icon: Activity,
      badge: "Market Breadth",
      badgeColor: "bg-amber-500/10 text-amber-500 border-amber-500/20",
      cta: "Launch The Warmup",
      features: ["50 SMA Participation Dial", "RME Sentiment Meter (0-100)", "Stage 2 vs Stage 4 Ratio", "FII/DII 22-Session Flows"],
    },
    {
      title: "Intraday Screener",
      subtitle: "3-Column Real-Time Momentum Radar",
      description:
        "Ergonomic 3-column structured grid tracking live index trend cards, real-time Advance/Decline (533 vs 972), VWAP positioning, unusual Relative Volume (RVol) surges, and quick intraday triggers.",
      href: "/intraday",
      icon: Zap,
      badge: "Real-Time Intraday",
      badgeColor: "bg-primary/10 text-primary border-primary/20",
      cta: "Open Intraday Screener",
      features: ["3-Column Ergonomic Grid", "VWAP Above/Below Counts", "+21,902% RVol Detection", "One-Click Quick Screens"],
    },
    {
      title: "Market Breadth & Major Indices",
      subtitle: "In-Depth Stage Breakdown & Multi-Chart Grid",
      description:
        "Deep structural stage analysis (Stage 1 Base, Stage 2 Markup, Stage 3 Top, Stage 4 Downtrend), constituent participation vs Nifty 500, cumulative advance/decline line, and responsive 6-index chart grid.",
      href: "/markets",
      icon: BarChart3,
      badge: "NSE Universe Breadth",
      badgeColor: "bg-blue-500/10 text-blue-500 border-blue-500/20",
      cta: "View Market Breadth",
      features: ["Weinstein 4-Stage Breakdown", "Cumulative Advance/Decline Line", "68% Breakout Success Rate", "Major Indices Multi-Chart Grid"],
    },
    {
      title: "Institutional Scanners",
      subtitle: "11 Curated Classic Screening Presets",
      description:
        "Split-pane technical execution hub combining sub-15ms vectorized Polars queries with real-time charting. Includes Minervini Trend Template, Stage 2 Breakouts, 4%+ Volume Climaxes, and 20-SMA Pullbacks.",
      href: "/scanners/trend-template",
      icon: Zap,
      badge: "11 Pre-Computed Scanners",
      badgeColor: "bg-primary/10 text-primary border-primary/20",
      cta: "Explore Scanners",
      features: ["Minervini 8-Point Trend Template", "4%+ High-Volume Breakouts", "Recent Pivot Breakouts", "High RVOL & 1M Top Gainers"],
    },
    {
      title: "Market Leaders Hub",
      subtitle: "Top 150 Sector Leaders & Quarterly Trends",
      description:
        "Split-panel architecture categorizing top 150 leading stocks by sectoral themes with OHLC candlestick charts, SMA 10/20/50/200 overlays, Volume HVE markers, and 5-quarter financial statement grids with CSV export.",
      href: "/leaders",
      icon: Flame,
      badge: "Top 150 Leaders",
      badgeColor: "bg-amber-500/10 text-amber-500 border-amber-500/20",
      cta: "Open Market Leaders",
      features: ["Sectoral Theme Categorization", "Moving Averages Overlays", "High Volume Event (HVE) Markers", "Copy Table & CSV Export"],
    },
    {
      title: "Relative Rotation Graph (RRG)",
      subtitle: "Vectorized Sector & Stock Rotation",
      description:
        "Interactive 4-quadrant scatter chart plotting JdK RS-Ratio vs RS-Momentum with clockwise cyclical trailing tails across 5D, 10D, and 20D horizons with custom benchmark baseline.",
      href: "/rrg",
      icon: Compass,
      badge: "JdK Rotational Model",
      badgeColor: "bg-blue-500/10 text-blue-500 border-blue-500/20",
      cta: "Open Rotation Graph",
      features: ["Leading, Weakening, Lagging, Improving", "Sector Index Rotations vs NIFTY 50", "Top Momentum Rotational Leaders", "5D / 10D / 20D Trailing Tails"],
    },
    {
      title: "Market Cap Treemap Heatmap",
      subtitle: "Hierarchical Sector & Stock Performance",
      description:
        "Cap-weighted recursive treemap visualizing daily percentage returns across Nifty 200, Nifty 500, and Smallcap 250 with smooth dynamic red/green gradients.",
      href: "/heatmap",
      icon: LayoutGrid,
      badge: "Treemap Visualizer",
      badgeColor: "bg-bull/10 text-bull border-bull/20",
      cta: "Open Market Heatmap",
      features: ["Recursive Cap-Weighted Layout", "-2% to +3% Dynamic Gradient", "Index Filtering (N200, N500, Smallcap)", "Sector Breakdown Ribbon"],
    },
    {
      title: "Groups / Sectors / Themes",
      subtitle: "3-Level Hierarchical Drilldown",
      description:
        "Deep drilldown navigating from 23 Core Sectors down to 172 Refined Industries and 96 Focused Thematic Clusters with multi-timeframe sorting pills (1D, 1W, 1M, 3M, 1Y, YTD).",
      href: "/groups",
      icon: Layers,
      badge: "3-Level Hierarchy",
      badgeColor: "bg-primary/10 text-primary border-primary/20",
      cta: "Explore Groups & Themes",
      features: ["23 Core Sectors Breakdown", "172 Refined Industries", "96 Thematic Clusters", "1D to YTD Timeframe Sorting"],
    },
    {
      title: "Earnings Results Calendar",
      subtitle: "Automated Quality Scorecards & Calendar",
      description:
        "Day column calendar view with fast 'Today' jump button and Q2 FY27 progress tracker. Features automated quality badges (Excellent, Good, Weak) and side financial details panel.",
      href: "/results",
      icon: Calendar,
      badge: "Quarterly Calendar",
      badgeColor: "bg-bull/10 text-bull border-bull/20",
      cta: "Open Results Calendar",
      features: ["Day Column Calendar Grid", "Excellent / Good / Weak Badges", "Q2 FY27 Season Progress Tracker", "YoY / QoQ Financial Metrics Panel"],
    },
    {
      title: "Market News Feed",
      subtitle: "Categorized Corporate Disclosures & Wires",
      description:
        "Focused news streams (Stock news, Global, Orders & deals, My watchlist) filtered by category tags: Earnings (E), Orders (O), Corp Action (C), Regulatory (R), and Management (M).",
      href: "/news",
      icon: Newspaper,
      badge: "Exchange News Feed",
      badgeColor: "bg-primary/10 text-primary border-primary/20",
      cta: "Open News Feed",
      features: ["Stock, Global & Orders Streams", "Event Category Filter Chips", "Exchange Disclosures Wires", "Impact Badges & Timestamps"],
    },
    {
      title: "Watchlists & Trader Journal",
      subtitle: "3-Pane Layout with Integrated TradingView Charts",
      description:
        "Single-user persistent watchlists backed by direct storage with zero-friction persistence. Add symbols with global search, inspect 20D trend sparklines, and auto-save private trading thesis notes.",
      href: "/watchlists",
      icon: Star,
      badge: "Single-User Persistence",
      badgeColor: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
      cta: "Manage Watchlists",
      features: ["3-Pane Integrated Layout", "20-Day Mini Canvas Sparklines", "Star Favourites Quick Toggle", "Debounced Private Notes Sync"],
    },
    {
      title: "Stock Detail & Analysis Suite",
      subtitle: "Hardware-Accelerated Charts & Screener P&L",
      description:
        "Candlestick charts with SMA 10/20/50/200 overlays, IBD-style Relative Strength line relative to NIFTY 50, and Screener-style 5-year quarterly financial statements.",
      href: "/stock/RELIANCE",
      icon: LineChart,
      badge: "Lightweight Charts v5",
      badgeColor: "bg-blue-500/10 text-blue-500 border-blue-500/20",
      cta: "Open Stock Detail",
      features: ["Candlesticks + Volume Surge Histograms", "RS Line vs NIFTY 50 Overlay", "Screener 5-Year Quarterly P&L", "FII/DII Shareholding Trends"],
    },
  ];

  return (
    <div className="min-h-screen py-8 sm:py-12 px-4 sm:px-6 lg:px-8 max-w-[1600px] mx-auto space-y-12">
      {/* Hero Cockpit Header */}
      <section className="text-center space-y-6 pt-4 pb-2">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-primary/10 border border-primary/25 text-primary shadow-xs">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Scan The Charts (TRADESCOUT) • Indian Equity Terminal</span>
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground max-w-4xl mx-auto leading-tight sm:leading-none">
          Precision market breadth &amp; <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-highlight to-indigo-500">
            high-speed scanners
          </span>{" "}
          for NSE.
        </h1>

        <p className="max-w-2xl mx-auto text-sm sm:text-base text-muted-foreground leading-relaxed">
          All-in-one equity market analytics, technical stock scanning, institutional cash-flow tracking, and market breadth platform engineered specifically for Indian National Stock Exchange (NSE) swing and intraday traders.
        </p>

        {/* Hero Quick Search & Symbol Jump */}
        <div className="max-w-xl mx-auto pt-2 space-y-3">
          <form onSubmit={handleSearch} className="relative flex items-center shadow-lg shadow-primary/5">
            <input
              type="text"
              value={searchSymbol}
              onChange={(e) => setSearchSymbol(e.target.value)}
              placeholder="Search or jump to any NSE stock (e.g. RELIANCE, TRENT, DIXON)..."
              className="w-full pl-11 pr-24 py-3 text-sm rounded-2xl border border-border bg-card/90 text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-primary font-mono"
            />
            <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground pointer-events-none" />
            <button
              type="submit"
              className="absolute right-2 px-4 py-1.5 rounded-xl bg-primary text-white font-medium text-xs hover:bg-primary/90 transition-colors cursor-pointer shadow-xs"
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
                className="px-2 py-0.5 rounded-md border border-border/70 bg-card hover:bg-primary/15 hover:text-primary hover:border-primary/40 font-mono text-[11px] transition-colors cursor-pointer"
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
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white font-semibold text-sm shadow-md shadow-primary/20 hover:bg-primary/90 transition-all cursor-pointer"
          >
            <Activity className="h-4 w-4" />
            <span>Launch The Warmup</span>
            <ArrowRight className="h-4 w-4" />
          </Link>

          <Link
            href="/intraday"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border bg-card text-foreground font-semibold text-sm hover:bg-muted/80 transition-all cursor-pointer shadow-xs"
          >
            <Zap className="h-4 w-4 text-primary" />
            <span>Intraday Screener</span>
          </Link>

          <Link
            href="/scanners/trend-template"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border bg-card text-foreground font-semibold text-sm hover:bg-muted/80 transition-all cursor-pointer shadow-xs"
          >
            <Flame className="h-4 w-4 text-amber-500" />
            <span>11+ Scanners</span>
          </Link>

          <Link
            href="/watchlists"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border bg-card text-foreground font-semibold text-sm hover:bg-muted/80 transition-all cursor-pointer shadow-xs"
          >
            <Star className="h-4 w-4 text-yellow-500" />
            <span>Watchlists</span>
          </Link>
        </div>
      </section>

      {/* Quick Scanner Shortcut Strip */}
      <section className="p-4 rounded-2xl border border-border bg-card/60 backdrop-blur-sm space-y-3 shadow-xs">
        <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
          <span className="flex items-center gap-1.5 text-foreground">
            <Zap className="h-4 w-4 text-primary" /> Curated Classic Scans Dropdown &amp; Presets
          </span>
          <Link href="/scanners/trend-template" className="text-primary hover:underline text-[11px] font-semibold">
            View all 11 presets &rarr;
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {[
            { name: "Trend Template", slug: "trend-template", count: "326 stocks" },
            { name: "Stage 2 Breakout", slug: "stage-2-breakout", count: "66 stocks" },
            { name: "Recent Breakout", slug: "recent-breakout", count: "12 stocks" },
            { name: "4% Breakout", slug: "4pct-breakout", count: "38 stocks" },
            { name: "High Volume", slug: "high-volume", count: "28 stocks" },
            { name: "1M Gainers", slug: "1m-gainers", count: "36 stocks" },
          ].map((sc) => (
            <Link
              key={sc.slug}
              href={`/scanners/${sc.slug}`}
              className="p-2.5 rounded-xl border border-border bg-background hover:border-primary/40 hover:bg-primary/5 transition-all group"
            >
              <div className="font-semibold text-xs text-foreground group-hover:text-primary flex items-center justify-between">
                <span>{sc.name}</span>
                <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="text-[10px] text-muted-foreground font-mono mt-0.5">{sc.count}</div>
            </Link>
          ))}
        </div>
      </section>

      {/* Feature Modules Grid */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" /> Complete Platform Architecture &amp; Modules
          </h2>
          <span className="text-xs font-mono text-muted-foreground">12 Core Workspaces</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {launchCards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.href}
                className="flex flex-col justify-between p-6 rounded-2xl border border-border bg-card hover:border-primary/50 hover:shadow-xl hover:shadow-primary/5 transition-all group"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className={`text-[11px] font-mono px-2 py-0.5 rounded-full border font-semibold ${card.badgeColor}`}>
                      {card.badge}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <h3 className="font-bold text-base text-foreground group-hover:text-primary transition-colors">
                      {card.title}
                    </h3>
                    <p className="text-xs font-medium text-primary/90">{card.subtitle}</p>
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
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary/90 transition-colors shadow-xs cursor-pointer"
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
    </div>
  );
}
