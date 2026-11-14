"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import {
  Zap,
  TrendingUp,
  TrendingDown,
  Layers,
  Activity,
  Flame,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  Star,
  ExternalLink,
  Clock,
  Sparkles,
  Search,
} from "lucide-react";

interface IntradayStock {
  symbol: string;
  name: string;
  change: string;
  price: string;
  volume: string;
  rvol: string;
  tags?: string[];
}

const quickScreens = [
  { id: "strong-start", label: "Strong start", count: 42 },
  { id: "gap-up", label: "Gap up & sustain", count: 28 },
  { id: "orb", label: "Opening range breakout (ORB)", count: 35 },
  { id: "recovering", label: "Recovering from day low", count: 19 },
  { id: "up-4-high-vol", label: "Up 4% on high volume", count: 38 },
  { id: "near-52w", label: "Near 52-Week high/low", count: 54 },
];

const topGainers: IntradayStock[] = [
  {
    symbol: "MSTCLTD",
    name: "MSTC Limited",
    change: "+20.00%",
    price: "₹884.20",
    volume: "1.42M",
    rvol: "8.4x",
    tags: ["strong-start", "gap-up", "orb", "up-4-high-vol", "near-52w", "near-high", "volume-burst"],
  },
  {
    symbol: "ANUP",
    name: "Anup Engineering Ltd",
    change: "+20.00%",
    price: "₹2,640.00",
    volume: "890K",
    rvol: "9.2x",
    tags: ["strong-start", "orb", "up-4-high-vol", "near-52w", "near-high", "volume-burst"],
  },
  {
    symbol: "ALICON",
    name: "Alicon Castalloy Ltd",
    change: "+17.32%",
    price: "₹1,240.50",
    volume: "1.85M",
    rvol: "6.8x",
    tags: ["strong-start", "gap-up", "up-4-high-vol", "volume-burst"],
  },
  {
    symbol: "DIXON",
    name: "Dixon Technologies",
    change: "+8.92%",
    price: "₹14,920.00",
    volume: "920K",
    rvol: "4.1x",
    tags: ["orb", "up-4-high-vol", "near-52w", "near-high", "recovering", "pullback", "reversal"],
  },
  {
    symbol: "KAYNES",
    name: "Kaynes Technology",
    change: "+7.84%",
    price: "₹5,410.00",
    volume: "680K",
    rvol: "3.7x",
    tags: ["gap-up", "up-4-high-vol", "near-52w", "near-high"],
  },
  {
    symbol: "BEL",
    name: "Bharat Electronics",
    change: "+6.40%",
    price: "₹312.40",
    volume: "18.4M",
    rvol: "2.9x",
    tags: ["up-4-high-vol", "recovering", "pullback", "reversal", "near-52w", "near-high"],
  },
];

const topLosers: IntradayStock[] = [
  {
    symbol: "V2RETAIL",
    name: "V2 Retail Limited",
    change: "-11.83%",
    price: "₹1,180.00",
    volume: "640K",
    rvol: "3.2x",
    tags: ["strong-start", "orb", "volume-burst"],
  },
  {
    symbol: "SPARC",
    name: "Sun Pharma Advanced",
    change: "-7.45%",
    price: "₹220.10",
    volume: "850K",
    rvol: "1.8x",
    tags: ["gap-up", "pullback"],
  },
  {
    symbol: "NETWORK18",
    name: "Network18 Media",
    change: "-6.12%",
    price: "₹78.40",
    volume: "1.2M",
    rvol: "1.5x",
    tags: ["orb", "recovering", "reversal"],
  },
  {
    symbol: "IDEA",
    name: "Vodafone Idea Ltd",
    change: "-5.88%",
    price: "₹7.20",
    volume: "84.5M",
    rvol: "2.1x",
    tags: ["up-4-high-vol", "volume-burst", "near-52w", "near-high"],
  },
  {
    symbol: "RBLBANK",
    name: "RBL Bank Limited",
    change: "-4.90%",
    price: "₹168.30",
    volume: "4.1M",
    rvol: "1.4x",
    tags: ["recovering", "reversal", "pullback", "near-52w", "near-high"],
  },
];

export default function IntradayPage() {
  const [activeFilter, setActiveFilter] = useState("all");

  const filteredGainers = useMemo(() => {
    if (activeFilter === "all") return topGainers;
    return topGainers.filter((g) => {
      if (g.tags?.includes(activeFilter)) return true;
      const numChange = parseFloat(g.change.replace(/[+%]/g, "")) || 0;
      const numRvol = parseFloat(g.rvol.replace(/x/g, "")) || 0;
      switch (activeFilter) {
        case "strong-start":
          return numChange >= 15 || numRvol >= 7;
        case "gap-up":
          return numChange >= 7;
        case "orb":
          return numRvol >= 4;
        case "recovering":
        case "pullback":
        case "reversal":
          return numChange < 10;
        case "up-4-high-vol":
        case "volume-burst":
          return numChange >= 4 && numRvol >= 2.5;
        case "near-52w":
        case "near-high":
          return numChange >= 6;
        default:
          return true;
      }
    });
  }, [activeFilter]);

  const filteredLosers = useMemo(() => {
    if (activeFilter === "all") return topLosers;
    return topLosers.filter((l) => {
      if (l.tags?.includes(activeFilter)) return true;
      const numChange = Math.abs(parseFloat(l.change.replace(/[%]/g, "")) || 0);
      const numRvol = parseFloat(l.rvol.replace(/x/g, "")) || 0;
      switch (activeFilter) {
        case "strong-start":
          return numChange >= 10 || numRvol >= 3;
        case "gap-up":
          return numChange >= 7;
        case "orb":
          return numRvol >= 2;
        case "recovering":
        case "pullback":
        case "reversal":
          return numChange <= 6;
        case "up-4-high-vol":
        case "volume-burst":
          return numRvol >= 2;
        case "near-52w":
        case "near-high":
          return numChange <= 6;
        default:
          return true;
      }
    });
  }, [activeFilter]);

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Intraday Screener</h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-bull/10 border border-bull/20 text-bull">
              <span className="h-1.5 w-1.5 rounded-full bg-bull animate-pulse" />
              LIVE 3-COLUMN RADAR
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            High-frequency intraday momentum, VWAP positioning, unusual institutional relative volume &amp; breakouts
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs font-mono text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-xl border border-border">
            <Clock className="h-3.5 w-3.5 text-primary" />
            <span>Market Session: 09:15 - 15:30 IST</span>
          </div>
        </div>
      </div>

      {/* Ergonomic 3-Column Structured Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ================= COLUMN 1 (Left - Macro & Breadth Summary) ================= */}
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              <span>Macro &amp; Breadth Summary</span>
            </h2>
            <span className="text-[10px] text-muted-foreground font-mono">NSE Cash Market</span>
          </div>

          {/* Broad Index Trend Cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 rounded-2xl bg-card border border-border shadow-xs">
              <span className="text-[10px] font-semibold text-muted-foreground uppercase">Nifty 50</span>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-sm font-bold font-mono text-foreground">24,150.20</span>
                <span className="text-xs font-bold font-mono text-bull flex items-center">
                  <ArrowUpRight className="h-3.5 w-3.5" /> +0.45%
                </span>
              </div>
              <span className="text-[10px] text-muted-foreground block mt-0.5">Above 20 &amp; 50 EMA</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-card border border-border shadow-xs">
              <span className="text-[10px] font-semibold text-muted-foreground uppercase">Nifty 500</span>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-sm font-bold font-mono text-foreground">22,640.85</span>
                <span className="text-xs font-bold font-mono text-bull flex items-center">
                  <ArrowUpRight className="h-3.5 w-3.5" /> +0.62%
                </span>
              </div>
              <span className="text-[10px] text-muted-foreground block mt-0.5">Stage 2 Uptrend</span>
            </div>
          </div>

          {/* Advance / Decline Real-Time Metric */}
          <div className="p-4 rounded-2xl bg-card border border-border shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-foreground">Advance / Decline Ratio</span>
              <span className="text-[11px] font-mono font-bold text-bear">Bearish Bias (0.55)</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="p-2.5 rounded-xl bg-bull/5 border border-bull/20">
                <span className="text-[10px] text-muted-foreground block">Advancing</span>
                <span className="text-base font-bold font-mono text-bull">533</span>
              </div>
              <div className="p-2.5 rounded-xl bg-bear/5 border border-bear/20">
                <span className="text-[10px] text-muted-foreground block">Declining</span>
                <span className="text-base font-bold font-mono text-bear">972</span>
              </div>
            </div>
            {/* Advance/Decline bar */}
            <div className="w-full h-2 rounded-full bg-muted overflow-hidden flex">
              <div style={{ width: "35.4%" }} className="bg-bull h-full" />
              <div style={{ width: "64.6%" }} className="bg-bear h-full" />
            </div>
          </div>

          {/* Intraday Positioning Against VWAP */}
          <div className="p-4 rounded-2xl bg-card border border-border shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-foreground">Intraday Positioning vs VWAP</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-muted text-muted-foreground">
                Institutional Cut
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="p-2.5 rounded-xl bg-background border border-border">
                <span className="text-[10px] text-muted-foreground block">Above VWAP (Strong)</span>
                <span className="text-base font-bold font-mono text-bull">568</span>
                <span className="text-[10px] text-muted-foreground font-mono">38.2%</span>
              </div>
              <div className="p-2.5 rounded-xl bg-background border border-border">
                <span className="text-[10px] text-muted-foreground block">Below VWAP (Weak)</span>
                <span className="text-base font-bold font-mono text-bear">917</span>
                <span className="text-[10px] text-muted-foreground font-mono">61.8%</span>
              </div>
            </div>
          </div>

          {/* Pinned Active Watchlist Empty State Container */}
          <div className="p-5 rounded-2xl bg-card border border-dashed border-border shadow-xs text-center space-y-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
              <Star className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-foreground">Pinned Intraday Watchlist</h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Pin stocks from Column 2 or 3 to track their tick-by-tick VWAP deviations and breakouts.
              </p>
            </div>
            <Link
              href="/watchlists"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-muted hover:bg-muted/80 text-foreground text-xs font-medium transition-colors"
            >
              <span>Open Watchlist Manager</span>
              <ExternalLink className="h-3 w-3 text-muted-foreground" />
            </Link>
          </div>
        </div>

        {/* ================= COLUMN 2 (Middle - High Volume Movers) ================= */}
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Flame className="h-4 w-4 text-primary" />
              <span>High Volume Movers &amp; Gainers</span>
            </h2>
            <span className="text-[10px] font-mono text-bull font-bold">+20% Upper Circuit Alerts</span>
          </div>

          {/* Exceptional Relative Volume (RVol) Alert Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-primary/15 via-highlight/10 to-transparent border border-primary/30 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-primary">
                <Sparkles className="h-4 w-4" />
                <span>EXCEPTIONAL RVOL DETECTOR</span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-primary text-white text-[10px] font-mono font-bold">
                UNUSUAL ACCUMULATION
              </span>
            </div>
            <div className="flex items-center justify-between pt-1">
              <div>
                <Link
                  href="/stock/BFUTILITIE"
                  className="text-base font-extrabold text-foreground hover:text-primary transition-colors font-mono flex items-center gap-1.5"
                >
                  <span>BFUTILITIE</span>
                  <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                </Link>
                <span className="text-[11px] text-muted-foreground">BF Utilities Limited • Heavy Buy Blocks</span>
              </div>
              <div className="text-right">
                <span className="text-base font-extrabold font-mono text-primary block">
                  +21,902% RVol
                </span>
                <span className="text-[10px] font-mono text-bull font-semibold">+14.2% Today</span>
              </div>
            </div>
          </div>

          {/* Top Gainers Feed */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {activeFilter !== "all" ? `Filtered Gainers (${filteredGainers.length})` : "Top Gainers"}
              </span>
              {activeFilter !== "all" && (
                <button
                  type="button"
                  onClick={() => setActiveFilter("all")}
                  className="text-[10px] text-primary hover:underline font-mono"
                >
                  Clear Filter
                </button>
              )}
            </div>
            {filteredGainers.length === 0 ? (
              <div className="p-4 rounded-2xl bg-card border border-dashed border-border text-center text-xs text-muted-foreground">
                No gainers qualify under &apos;{activeFilter}&apos;.
              </div>
            ) : (
              filteredGainers.map((g) => (
                <div
                  key={g.symbol}
                  className="p-3.5 rounded-2xl bg-card border border-border shadow-xs flex items-center justify-between hover:border-primary/40 transition-colors"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/stock/${g.symbol}`}
                        className="text-xs font-bold font-mono text-foreground hover:text-primary transition-colors"
                      >
                        {g.symbol}
                      </Link>
                      <span className="text-[10px] text-muted-foreground font-sans truncate max-w-[130px]">
                        {g.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-mono text-muted-foreground">
                      <span>Vol: {g.volume}</span>
                      <span>•</span>
                      <span className="text-primary font-semibold">RVOL: {g.rvol}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-bold font-mono text-foreground block">{g.price}</span>
                    <span className="text-xs font-bold font-mono text-bull flex items-center justify-end">
                      <ArrowUpRight className="h-3 w-3" />
                      {g.change}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* ================= COLUMN 3 (Right - Top Losers & Quick Intraday Screens) ================= */}
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-bear" />
              <span>Top Losers &amp; Quick Screens</span>
            </h2>
            <span className="text-[10px] text-muted-foreground font-mono">1-Click Scanners</span>
          </div>

          {/* One-Click Pre-Filtered Intraday Screen Triggers */}
          <div className="p-4 rounded-2xl bg-card border border-border shadow-xs space-y-3">
            <span className="text-xs font-semibold text-foreground block">
              One-Click Intraday Screen Triggers
            </span>
            <div className="grid grid-cols-2 gap-2">
              {quickScreens.map((qs) => {
                const isSelected = activeFilter === qs.id;
                return (
                  <button
                    key={qs.id}
                    onClick={() => setActiveFilter(isSelected ? "all" : qs.id)}
                    className={`p-2.5 rounded-xl border text-left text-xs font-medium transition-all flex items-center justify-between ${
                      isSelected
                        ? "border-primary bg-primary/10 text-primary font-bold shadow-xs"
                        : "border-border hover:border-border/80 hover:bg-muted text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <span className="truncate pr-1">{qs.label}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-muted text-muted-foreground">
                      {qs.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Top Losers Real-Time Feed */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {activeFilter !== "all" ? `Filtered Losers (${filteredLosers.length})` : "Severe Intraday Pullbacks"}
              </span>
              {activeFilter !== "all" && (
                <button
                  type="button"
                  onClick={() => setActiveFilter("all")}
                  className="text-[10px] text-primary hover:underline font-mono"
                >
                  Clear Filter
                </button>
              )}
            </div>
            {filteredLosers.length === 0 ? (
              <div className="p-4 rounded-2xl bg-card border border-dashed border-border text-center text-xs text-muted-foreground">
                No pullback candidates under &apos;{activeFilter}&apos;.
              </div>
            ) : (
              filteredLosers.map((l) => (
                <div
                  key={l.symbol}
                  className="p-3.5 rounded-2xl bg-card border border-border shadow-xs flex items-center justify-between hover:border-bear/40 transition-colors"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/stock/${l.symbol}`}
                        className="text-xs font-bold font-mono text-foreground hover:text-bear transition-colors"
                      >
                        {l.symbol}
                      </Link>
                      <span className="text-[10px] text-muted-foreground font-sans truncate max-w-[130px]">
                        {l.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-mono text-muted-foreground">
                      <span>Vol: {l.volume}</span>
                      <span>•</span>
                      <span>RVOL: {l.rvol}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-bold font-mono text-foreground block">{l.price}</span>
                    <span className="text-xs font-bold font-mono text-bear flex items-center justify-end">
                      <ArrowDownRight className="h-3 w-3" />
                      {l.change}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
