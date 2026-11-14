"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import {
  BarChart3,
  Layers,
  TrendingUp,
  TrendingDown,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  Calendar,
  Compass,
  LineChart,
} from "lucide-react";

function MarketsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const activeTab = searchParams.get("tab") === "major-indices" ? "major-indices" : "breadth";

  const handleTabChange = (tab: "breadth" | "major-indices") => {
    if (tab === "major-indices") {
      router.push("/markets?tab=major-indices");
    } else {
      router.push("/markets");
    }
  };

  const majorIndices = [
    {
      name: "NIFTY 50",
      description: "Top 50 large-cap bluechips",
      price: "24,150.20",
      change: "+0.45%",
      isUp: true,
      high52: "26,277.35",
      low52: "18,837.85",
      stage: "Stage 2 Uptrend",
      sparkline: "M0,25 Q20,22 40,24 T80,18 T120,10 T160,12 T200,5",
    },
    {
      name: "NIFTY NEXT 50",
      description: "High-growth large caps (Rank 51-100)",
      price: "71,480.15",
      change: "+0.78%",
      isUp: true,
      high52: "77,430.00",
      low52: "43,800.50",
      stage: "Stage 2 Markup",
      sparkline: "M0,28 Q20,25 40,26 T80,20 T120,12 T160,8 T200,3",
    },
    {
      name: "NIFTY 100",
      description: "Top 100 NSE large cap companies",
      price: "25,180.40",
      change: "+0.52%",
      isUp: true,
      high52: "27,390.10",
      low52: "19,540.20",
      stage: "Stage 2 Uptrend",
      sparkline: "M0,26 Q20,24 40,25 T80,19 T120,14 T160,10 T200,6",
    },
    {
      name: "NIFTY 200",
      description: "Broad liquid universe",
      price: "13,620.80",
      change: "+0.64%",
      isUp: true,
      high52: "14,880.00",
      low52: "10,210.00",
      stage: "Stage 2 Uptrend",
      sparkline: "M0,27 Q20,23 40,24 T80,18 T120,11 T160,7 T200,4",
    },
    {
      name: "NIFTY 500",
      description: "Complete broad Indian equity market",
      price: "22,640.85",
      change: "+0.62%",
      isUp: true,
      high52: "24,850.30",
      low52: "16,420.90",
      stage: "Stage 2 Markup",
      sparkline: "M0,26 Q20,24 40,22 T80,17 T120,12 T160,8 T200,4",
    },
    {
      name: "NIFTY MIDCAP 50",
      description: "High-beta mid-cap leaders",
      price: "15,840.60",
      change: "+1.08%",
      isUp: true,
      high52: "17,210.40",
      low52: "11,540.00",
      stage: "Stage 2 Momentum",
      sparkline: "M0,29 Q20,26 40,22 T80,15 T120,8 T160,5 T200,2",
    },
  ];

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header and Tab Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Market Breadth &amp; Major Indices
            </h1>
            <span className="text-xs font-mono font-semibold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
              NSE 2,500+ Universe
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            In-depth stage analysis, broad participation, cumulative advance/decline line &amp; index grids
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-1.5 p-1 bg-muted/60 rounded-2xl border border-border">
          <button
            type="button"
            onClick={() => handleTabChange("breadth")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === "breadth"
                ? "bg-card text-primary shadow-sm border border-border/80"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Activity className="h-4 w-4" />
            <span>Market Breadth</span>
          </button>
          <button
            type="button"
            onClick={() => handleTabChange("major-indices")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === "major-indices"
                ? "bg-card text-primary shadow-sm border border-border/80"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <LineChart className="h-4 w-4" />
            <span>Major Indices Multi-Chart Grid</span>
          </button>
        </div>
      </div>

      {activeTab === "breadth" ? (
        /* Market Breadth Tab Content */
        <div className="space-y-6">
          {/* Stage Analysis Breakdown (Stan Weinstein 4-Stage Model) */}
          <div className="p-6 rounded-2xl bg-card border border-border shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-foreground">Stage Analysis Breakdown</h3>
                <p className="text-xs text-muted-foreground">
                  Structural phase distribution across the complete broad market based on Stan Weinstein lifecycle rules
                </p>
              </div>
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-muted text-foreground">
                2,480 Active Equities
              </span>
            </div>

            {/* Stage Progress Bar */}
            <div className="space-y-2">
              <div className="w-full h-4 rounded-xl overflow-hidden flex bg-muted shadow-inner">
                <div style={{ width: "3.7%" }} className="bg-blue-500 h-full" title="Stage 1 Base (3.7%)" />
                <div style={{ width: "38.7%" }} className="bg-bull h-full" title="Stage 2 Uptrend (38.7%)" />
                <div style={{ width: "11.5%" }} className="bg-amber-500 h-full" title="Stage 3 Top (11.5%)" />
                <div style={{ width: "46.1%" }} className="bg-bear h-full" title="Stage 4 Downtrend (46.1%)" />
              </div>

              {/* Stage Cards Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
                <div className="p-3.5 rounded-xl bg-background border border-border">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-blue-500">Stage 1 Base</span>
                    <span className="text-xs font-mono font-bold text-foreground">3.7%</span>
                  </div>
                  <span className="text-[11px] text-muted-foreground font-mono mt-0.5 block">92 Stocks</span>
                  <p className="text-[10px] text-muted-foreground mt-1">Accumulation bases forming</p>
                </div>

                <div className="p-3.5 rounded-xl bg-background border border-border">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-bull">Stage 2 Uptrend</span>
                    <span className="text-xs font-mono font-bold text-bull">38.7%</span>
                  </div>
                  <span className="text-[11px] text-muted-foreground font-mono mt-0.5 block">960 Stocks</span>
                  <p className="text-[10px] text-muted-foreground mt-1">Institutional markup phase</p>
                </div>

                <div className="p-3.5 rounded-xl bg-background border border-border">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-500">Stage 3 Top</span>
                    <span className="text-xs font-mono font-bold text-foreground">11.5%</span>
                  </div>
                  <span className="text-[11px] text-muted-foreground font-mono mt-0.5 block">285 Stocks</span>
                  <p className="text-[10px] text-muted-foreground mt-1">Distribution &amp; churning</p>
                </div>

                <div className="p-3.5 rounded-xl bg-background border border-border">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-bear">Stage 4 Downtrend</span>
                    <span className="text-xs font-mono font-bold text-bear">46.1%</span>
                  </div>
                  <span className="text-[11px] text-muted-foreground font-mono mt-0.5 block">1,143 Stocks</span>
                  <p className="text-[10px] text-muted-foreground mt-1">Capitulation / liquidation</p>
                </div>
              </div>
            </div>
          </div>

          {/* Two-Column: Participation vs Nifty 500 & Cumulative Advance/Decline Line */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Participation vs Nifty 500 */}
            <div className="p-5 rounded-2xl bg-card border border-border shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-foreground">Participation vs Nifty 500</h3>
                  <p className="text-[11px] text-muted-foreground">
                    Multi-line plot charting constituent breadth strength against the baseline Nifty 500 index
                  </p>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-bull/10 text-bull border border-bull/20 font-bold">
                  BREADTH EXPANDING
                </span>
              </div>

              {/* Plot visual */}
              <div className="h-44 p-3 rounded-xl bg-background border border-border relative flex flex-col justify-between">
                <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-1 bg-primary rounded-full" /> % Stocks &gt; 50 EMA (65%)
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-1 bg-bull rounded-full" /> Nifty 500 Baseline (Normalized)
                  </span>
                </div>
                {/* Visual SVG chart */}
                <svg className="w-full h-28" viewBox="0 0 500 100" preserveAspectRatio="none">
                  {/* Grid lines */}
                  <line x1="0" y1="25" x2="500" y2="25" stroke="currentColor" strokeOpacity="0.1" />
                  <line x1="0" y1="50" x2="500" y2="50" stroke="currentColor" strokeOpacity="0.1" />
                  <line x1="0" y1="75" x2="500" y2="75" stroke="currentColor" strokeOpacity="0.1" />

                  {/* Nifty 500 path */}
                  <path
                    d="M0,70 Q100,65 200,60 T350,45 T500,30"
                    fill="none"
                    stroke="#16A34A"
                    strokeWidth="2.5"
                  />
                  {/* Breadth participation path */}
                  <path
                    d="M0,80 Q80,75 180,50 T320,35 T500,20"
                    fill="none"
                    stroke="#4F46E5"
                    strokeWidth="2.5"
                    strokeDasharray="4 2"
                  />
                </svg>
                <div className="flex items-center justify-between text-[10px] text-muted-foreground font-mono">
                  <span>30 Days Ago</span>
                  <span>15 Days Ago</span>
                  <span>Today (Broad Expansion)</span>
                </div>
              </div>
            </div>

            {/* Cumulative Advance / Decline Line */}
            <div className="p-5 rounded-2xl bg-card border border-border shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-foreground">Cumulative Advance/Decline Line</h3>
                  <p className="text-[11px] text-muted-foreground">
                    Tracks underlying market momentum and flags breadth divergences
                  </p>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 font-bold">
                  NO DIVERGENCE
                </span>
              </div>

              {/* Cumulative A/D Plot */}
              <div className="h-44 p-3 rounded-xl bg-background border border-border relative flex flex-col justify-between">
                <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground">
                  <span>Cumulative Net Advances (+14,280 YTD)</span>
                  <span className="text-bull font-bold">+180 Today</span>
                </div>
                <svg className="w-full h-28" viewBox="0 0 500 100" preserveAspectRatio="none">
                  <path
                    d="M0,85 L50,80 L100,75 L150,78 L200,65 L250,60 L300,50 L350,55 L400,40 L450,30 L500,22"
                    fill="none"
                    stroke="#3B82F6"
                    strokeWidth="2.5"
                  />
                </svg>
                <div className="flex items-center justify-between text-[10px] text-muted-foreground font-mono">
                  <span>Healthy participation supporting index new highs</span>
                </div>
              </div>
            </div>
          </div>

          {/* Expansion / Contraction Metrics */}
          <div className="p-5 rounded-2xl bg-card border border-border shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-foreground">Expansion / Contraction Metrics</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-background border border-border">
                <span className="text-[10px] font-semibold text-muted-foreground uppercase">
                  4% Daily Movers Ratio
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-xl font-bold font-mono text-bull">38 Up</span>
                  <span className="text-xs text-muted-foreground">vs</span>
                  <span className="text-xl font-bold font-mono text-bear">9 Down</span>
                </div>
                <p className="text-[11px] text-muted-foreground mt-1">
                  Strong net expansion in extreme positive momentum thrusts (4.2:1 ratio)
                </p>
              </div>

              <div className="p-4 rounded-xl bg-background border border-border">
                <span className="text-[10px] font-semibold text-muted-foreground uppercase">
                  Historical Breakout Success Rate
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-xl font-bold font-mono text-primary">68% Success</span>
                </div>
                <p className="text-[11px] text-muted-foreground mt-1">
                  68% of breakouts held above pivot over the trailing 30 sessions without stop breach
                </p>
              </div>

              <div className="p-4 rounded-xl bg-background border border-border">
                <span className="text-[10px] font-semibold text-muted-foreground uppercase">
                  50-Day Moving Average Breadth
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-xl font-bold font-mono text-foreground">58% Above</span>
                  <span className="text-xs text-bull font-bold font-mono">(+4.2%)</span>
                </div>
                <p className="text-[11px] text-muted-foreground mt-1">
                  Primary trend participation moving decisively above the 50% equilibrium threshold
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Major Indices Multi-Chart Grid */
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">
              Real-time multi-chart grid tracking primary NSE broad market indices
            </span>
            <div className="flex items-center gap-1.5 text-[11px] font-mono text-muted-foreground">
              <span>Timeframe: 1D</span>
              <span>•</span>
              <span className="text-bull font-bold">All 6 Above 50 EMA</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {majorIndices.map((idx) => (
              <div
                key={idx.name}
                className="p-5 rounded-2xl bg-card border border-border shadow-xs hover:border-primary/40 transition-all space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-base font-extrabold text-foreground font-mono">{idx.name}</h3>
                    <p className="text-xs text-muted-foreground">{idx.description}</p>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-bull/10 text-bull border border-bull/20">
                    {idx.stage}
                  </span>
                </div>

                <div className="flex items-baseline justify-between pt-1">
                  <span className="text-xl font-extrabold font-mono text-foreground">{idx.price}</span>
                  <span className="text-xs font-bold font-mono text-bull flex items-center">
                    <ArrowUpRight className="h-4 w-4" />
                    {idx.change}
                  </span>
                </div>

                {/* Mini sparkline chart */}
                <div className="h-16 w-full bg-background/50 rounded-xl p-2 border border-border/60">
                  <svg className="w-full h-full" viewBox="0 0 200 35" preserveAspectRatio="none">
                    <path
                      d={idx.sparkline}
                      fill="none"
                      stroke="#4F46E5"
                      strokeWidth="2.5"
                    />
                  </svg>
                </div>

                <div className="flex items-center justify-between text-[11px] font-mono text-muted-foreground pt-1 border-t border-border/60">
                  <span>52W H: {idx.high52}</span>
                  <span>52W L: {idx.low52}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}


export default function MarketsPage() {
  return (
    <React.Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center"><p className="text-sm text-muted-foreground">Loading market breadth...</p></div>}>
      <MarketsContent />
    </React.Suspense>
  );
}
