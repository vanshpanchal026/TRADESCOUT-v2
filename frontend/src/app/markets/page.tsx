"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Activity,
  LineChart,
  Info,
  ChevronDown,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  SlidersHorizontal,
} from "lucide-react";

function MarketsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const activeTab = searchParams.get("tab") === "major-indices" ? "major-indices" : "breadth";

  const [participationTf, setParticipationTf] = useState<"20D" | "50D" | "200D">("50D");
  const [adTf, setAdTf] = useState<"20D" | "40D" | "A-D line">("20D");
  const [highsLowsTf, setHighsLowsTf] = useState<"20D" | "52W">("20D");
  const [moversTf, setMoversTf] = useState<"Daily" | "5D ratio" | "10D ratio">("Daily");
  const [globalHorizon, setGlobalHorizon] = useState<"1M" | "3M" | "1Y">("3M");

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
    <div className="min-h-screen p-3 sm:p-5 lg:p-6 max-w-[1600px] mx-auto space-y-4">
      {/* Top Tab Switcher Strip */}
      <div className="flex items-center justify-between pb-2 border-b border-border/60">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleTabChange("breadth")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === "breadth"
                ? "bg-white dark:bg-card text-primary shadow-xs border border-blue-200/60 dark:border-border"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Activity className="h-3.5 w-3.5" />
            <span>Market Breadth</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange("major-indices")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === "major-indices"
                ? "bg-white dark:bg-card text-primary shadow-xs border border-blue-200/60 dark:border-border"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <LineChart className="h-3.5 w-3.5" />
            <span>Major Indices</span>
          </button>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground">
          <span className="font-mono">Liquid stocks: 1,508</span>
          <span>•</span>
          <span>Data as of Fri 13 Nov</span>
        </div>
      </div>

      {activeTab === "breadth" ? (
        /* ================= 3-COLUMN ASYMMETRIC BENTO GRID (Screenshot 5) ================= */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
          {/* ================= COLUMN 1 (LEFT ~28%): MARKET BREADTH & STAGES ================= */}
          <div className="lg:col-span-3 rounded-2xl bg-card border border-border/80 shadow-xs p-4 sm:p-5 space-y-5">
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-foreground">Market Breadth</h3>
                <span className="text-[10px] text-muted-foreground">Read as of Fri 13 Nov</span>
              </div>
            </div>

            {/* 6 Market Regime Items with bullets & descriptions */}
            <div className="space-y-3.5 text-xs">
              <div>
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                  <span className="font-semibold text-foreground">Momentum</span>
                  <span className="font-bold text-primary ml-auto">Positive</span>
                </div>
                <p className="text-[11px] text-muted-foreground pl-3.5 mt-0.5 leading-relaxed">
                  Buying is strong: about 3 stocks are jumping 4% for every one that drops 4%.
                </p>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                  <span className="font-semibold text-foreground">Short-term</span>
                  <span className="font-bold text-primary ml-auto">Up</span>
                </div>
                <p className="text-[11px] text-muted-foreground pl-3.5 mt-0.5 leading-relaxed">
                  The last few weeks have been strong: most stocks are rising, and new highs far outnumber new lows.
                </p>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-400 shrink-0" />
                  <span className="font-semibold text-foreground">Big trend</span>
                  <span className="font-bold text-muted-foreground ml-auto">Neutral</span>
                </div>
                <p className="text-[11px] text-muted-foreground pl-3.5 mt-0.5 leading-relaxed">
                  The bigger picture is split: neither buyers nor sellers are in control over the long run.
                </p>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                  <span className="font-semibold text-foreground">Breakouts</span>
                  <span className="font-bold text-primary ml-auto">Working</span>
                </div>
                <p className="text-[11px] text-muted-foreground pl-3.5 mt-0.5 leading-relaxed">
                  Breakouts are working: about 5 in 10 new buys are holding up.
                </p>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-400 shrink-0" />
                  <span className="font-semibold text-foreground">Overdone?</span>
                  <span className="font-bold text-muted-foreground ml-auto">Normal</span>
                </div>
                <p className="text-[11px] text-muted-foreground pl-3.5 mt-0.5 leading-relaxed">
                  Not overdone: small caps are within their usual range.
                </p>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-400 shrink-0" />
                  <span className="font-semibold text-foreground">Leadership</span>
                  <span className="font-bold text-muted-foreground ml-auto">Large caps lead</span>
                </div>
                <p className="text-[11px] text-muted-foreground pl-3.5 mt-0.5 leading-relaxed">
                  Big stocks are leading; mid and small caps are lagging behind.
                </p>
              </div>
            </div>

            {/* STAGE ANALYSIS COMPONENT */}
            <div className="pt-4 border-t border-border/50 space-y-2.5">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-bold uppercase tracking-wider text-muted-foreground">
                  Stage Analysis
                </span>
                <span className="text-[10px] text-muted-foreground font-mono">
                  of 1,448 stocks (64+ days)
                </span>
              </div>

              {/* Stacked 4-segment Progress Bar */}
              <div className="w-full h-3 rounded-full overflow-hidden flex bg-slate-100 dark:bg-muted shadow-inner">
                <div style={{ width: "3.7%" }} className="bg-primary h-full" title="Base: 3.7%" />
                <div style={{ width: "38.7%" }} className="bg-amber-500 h-full" title="Uptrend: 38.7%" />
                <div style={{ width: "11.5%" }} className="bg-orange-400 h-full" title="Top: 11.5%" />
                <div style={{ width: "46.1%" }} className="bg-rose-500 h-full" title="Downtrend: 46.1%" />
              </div>

              {/* 4 Stage Metric Badges */}
              <div className="grid grid-cols-4 gap-1.5 pt-1 text-center font-mono">
                <div>
                  <div className="flex items-center justify-center gap-1 text-[10px] text-muted-foreground">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    <span>Base</span>
                  </div>
                  <div className="text-xs font-bold text-foreground mt-0.5">3.7%</div>
                  <div className="text-[9px] text-muted-foreground">-9 1D</div>
                </div>

                <div>
                  <div className="flex items-center justify-center gap-1 text-[10px] text-muted-foreground">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    <span>Uptrend</span>
                  </div>
                  <div className="text-xs font-bold text-foreground mt-0.5">38.7%</div>
                  <div className="text-[9px] text-muted-foreground">-23 1D</div>
                </div>

                <div>
                  <div className="flex items-center justify-center gap-1 text-[10px] text-muted-foreground">
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
                    <span>Top</span>
                  </div>
                  <div className="text-xs font-bold text-foreground mt-0.5">11.5%</div>
                  <div className="text-[9px] text-muted-foreground">+2 1D</div>
                </div>

                <div>
                  <div className="flex items-center justify-center gap-1 text-[10px] text-muted-foreground">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                    <span>Downtrend</span>
                  </div>
                  <div className="text-xs font-bold text-foreground mt-0.5">46.1%</div>
                  <div className="text-[9px] text-muted-foreground">+32 1D</div>
                </div>
              </div>
            </div>
          </div>

          {/* ================= COLUMN 2 (CENTER ~45%): MARKET INTERNALS ================= */}
          <div className="lg:col-span-5 rounded-2xl bg-card border border-border/80 shadow-xs p-4 sm:p-5 space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-border/60">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-foreground">Market internals</span>
                <Info className="h-3.5 w-3.5 text-muted-foreground/70" />
                <span className="text-[10px] text-muted-foreground font-mono">— Nifty 500 (grey line)</span>
              </div>
              <div className="flex items-center gap-1 text-[10px] font-mono">
                {(["20D", "50D", "200D"] as const).map((tf) => (
                  <button
                    key={tf}
                    onClick={() => setParticipationTf(tf)}
                    className={`px-1.5 py-0.5 rounded cursor-pointer ${
                      participationTf === tf
                        ? "bg-primary text-white font-bold"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {tf}
                  </button>
                ))}
              </div>
            </div>

            {/* SECTION 1: PARTICIPATION */}
            <div className="space-y-2">
              <div className="flex items-baseline justify-between text-xs">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                    Participation
                  </span>
                  <div className="flex items-baseline gap-1.5 mt-0.5">
                    <span className="text-base font-extrabold font-mono text-foreground">51%</span>
                    <span className="text-xs font-semibold text-foreground">Mixed</span>
                    <span className="text-[10px] text-primary font-bold font-mono">• better &uarr;</span>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-muted-foreground">13 Nov</span>
              </div>

              {/* Shaded Chart */}
              <div className="h-28 w-full rounded-xl bg-slate-50 dark:bg-muted/30 border border-border/50 p-1 relative overflow-hidden">
                <svg className="w-full h-full" viewBox="0 0 400 100" preserveAspectRatio="none">
                  {/* Bands */}
                  <rect x="0" y="0" width="400" height="25" fill="rgba(239, 68, 68, 0.08)" />
                  <rect x="0" y="75" width="400" height="25" fill="rgba(59, 130, 246, 0.08)" />
                  <line x1="0" y1="50" x2="400" y2="50" stroke="rgba(100, 116, 139, 0.2)" strokeDasharray="3,3" />

                  {/* Benchmark Nifty 500 gray curve */}
                  <path
                    d="M0,60 Q80,58 160,54 T280,48 T360,42 L400,38"
                    fill="none"
                    stroke="#94a3b8"
                    strokeWidth="1.5"
                  />
                  {/* Participation blue curve */}
                  <path
                    d="M0,75 Q60,70 120,60 T220,68 T300,55 L400,35"
                    fill="none"
                    stroke="#2563eb"
                    strokeWidth="2"
                  />
                </svg>
              </div>
              <div className="flex justify-between text-[9px] font-mono text-muted-foreground px-1">
                <span>14 Aug</span>
                <span>29 Sep</span>
                <span>13 Nov</span>
              </div>
            </div>

            {/* SECTION 2: ADVANCE / DECLINE */}
            <div className="space-y-2 pt-3 border-t border-border/50">
              <div className="flex items-baseline justify-between text-xs">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                    Advance / Decline
                  </span>
                  <div className="flex items-baseline gap-1.5 mt-0.5">
                    <span className="text-base font-extrabold font-mono text-foreground">0.98</span>
                    <span className="text-xs font-semibold text-foreground">Balanced</span>
                    <span className="text-[10px] text-primary font-bold font-mono">• better &uarr;</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-muted-foreground">13 Nov • avg 750 up / 768 down</span>
                  <div className="flex items-center gap-1 text-[10px] font-mono">
                    {(["20D", "40D", "A-D line"] as const).map((mode) => (
                      <button
                        key={mode}
                        onClick={() => setAdTf(mode)}
                        className={`px-1.5 py-0.5 rounded cursor-pointer ${
                          adTf === mode
                            ? "bg-primary text-white font-bold"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {mode}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="h-28 w-full rounded-xl bg-slate-50 dark:bg-muted/30 border border-border/50 p-1 relative overflow-hidden">
                <svg className="w-full h-full" viewBox="0 0 400 100" preserveAspectRatio="none">
                  <rect x="0" y="0" width="400" height="20" fill="rgba(59, 130, 246, 0.06)" />
                  <rect x="0" y="80" width="400" height="20" fill="rgba(239, 68, 68, 0.06)" />
                  <line x1="0" y1="50" x2="400" y2="50" stroke="rgba(100, 116, 139, 0.2)" strokeDasharray="3,3" />

                  {/* Advance/Decline curve */}
                  <path
                    d="M0,58 Q80,54 160,65 T260,75 T340,48 L400,42"
                    fill="none"
                    stroke="#2563eb"
                    strokeWidth="2"
                  />
                </svg>
              </div>
              <div className="flex justify-between text-[9px] font-mono text-muted-foreground px-1">
                <span>14 Aug</span>
                <span>29 Sep</span>
                <span>13 Nov</span>
              </div>
            </div>

            {/* SECTION 3: LARGE VS MID VS SMALL */}
            <div className="space-y-2 pt-3 border-t border-border/50">
              <div className="flex items-baseline justify-between text-xs">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                    Large vs Mid vs Small
                  </span>
                  <span className="text-xs font-semibold text-foreground">Large caps lead</span>
                </div>

                <div className="flex items-center gap-2 font-mono text-[10px]">
                  <span className="flex items-center gap-1 text-primary font-bold">
                    <span className="w-2 h-0.5 bg-primary rounded-full" /> N50 +3.2%
                  </span>
                  <span className="flex items-center gap-1 text-amber-500 font-bold">
                    <span className="w-2 h-0.5 bg-amber-500 rounded-full" /> MID150 -3.2%
                  </span>
                  <span className="flex items-center gap-1 text-slate-500 font-bold">
                    <span className="w-2 h-0.5 bg-slate-500 rounded-full" /> SML250 -1.9%
                  </span>
                </div>
              </div>

              <div className="h-28 w-full rounded-xl bg-slate-50 dark:bg-muted/30 border border-border/50 p-1 relative overflow-hidden">
                <svg className="w-full h-full" viewBox="0 0 400 100" preserveAspectRatio="none">
                  {/* Nifty 50 (large) */}
                  <path
                    d="M0,60 Q80,55 160,65 T260,75 T340,48 L400,28"
                    fill="none"
                    stroke="#2563eb"
                    strokeWidth="2"
                  />
                  {/* Midcap 150 */}
                  <path
                    d="M0,60 Q80,58 160,68 T260,82 T340,65 L400,55"
                    fill="none"
                    stroke="#f59e0b"
                    strokeWidth="1.5"
                  />
                  {/* Smallcap 250 */}
                  <path
                    d="M0,60 Q80,62 160,72 T260,88 T340,70 L400,62"
                    fill="none"
                    stroke="#64748b"
                    strokeWidth="1.5"
                  />
                </svg>
              </div>
              <div className="flex justify-between text-[9px] font-mono text-muted-foreground px-1">
                <span>14 Aug</span>
                <span>29 Sep</span>
                <span>13 Nov</span>
              </div>
            </div>
          </div>

          {/* ================= COLUMN 3 (RIGHT ~27%): HIGHS/LOWS, 4% MOVERS & BREAKOUTS ================= */}
          <div className="lg:col-span-4 rounded-2xl bg-card border border-border/80 shadow-xs p-4 sm:p-5 space-y-5">
            {/* Header with Liquid stocks dropdown and timeframe */}
            <div className="flex items-center justify-between pb-3 border-b border-border/60">
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg border border-border bg-slate-50 dark:bg-muted text-xs font-semibold text-foreground">
                <span>Liquid stocks 1,508</span>
                <ChevronDown className="h-3 w-3 text-muted-foreground" />
              </div>

              <div className="flex items-center gap-1 text-[10px] font-mono">
                {(["1M", "3M", "1Y"] as const).map((h) => (
                  <button
                    key={h}
                    onClick={() => setGlobalHorizon(h)}
                    className={`px-1.5 py-0.5 rounded cursor-pointer ${
                      globalHorizon === h
                        ? "bg-primary text-white font-bold"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {h}
                  </button>
                ))}
              </div>
            </div>

            {/* SECTION 1: NET 20D HIGHS - LOWS */}
            <div className="space-y-2">
              <div className="flex items-baseline justify-between text-xs">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                    Net 20D Highs - Lows
                  </span>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="text-base font-extrabold font-mono text-bull">+180</span>
                    <span className="text-xs font-semibold text-foreground">Far more highs than lows</span>
                    <span className="text-[10px] text-primary font-bold font-mono">• better &uarr;</span>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-[10px] font-mono">
                  {(["20D", "52W"] as const).map((tf) => (
                    <button
                      key={tf}
                      onClick={() => setHighsLowsTf(tf)}
                      className={`px-1.5 py-0.5 rounded cursor-pointer ${
                        highsLowsTf === tf
                          ? "bg-primary text-white font-bold"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {tf}
                    </button>
                  ))}
                </div>
              </div>
              <div className="text-[10px] text-muted-foreground font-mono">
                13 Nov • 213 highs / 33 lows
              </div>

              {/* Dual-color Bar Chart */}
              <div className="h-28 w-full rounded-xl bg-slate-50 dark:bg-muted/30 border border-border/50 p-2 flex items-center justify-between gap-1">
                {[-15, -25, -40, -30, -50, -45, -20, 10, 15, 25, 35, 45, 60, 50, 75, 90, 85, 110, 125, 140, 160, 180].map((val, idx) => (
                  <div key={idx} className="flex-1 flex flex-col items-center justify-center h-full">
                    <div className="h-1/2 w-full flex items-end justify-center">
                      {val > 0 && (
                        <div
                          className="w-full max-w-[6px] rounded-xs bg-primary"
                          style={{ height: `${(val / 180) * 100}%` }}
                        />
                      )}
                    </div>
                    <div className="w-full h-px bg-border" />
                    <div className="h-1/2 w-full flex items-start justify-center">
                      {val < 0 && (
                        <div
                          className="w-full max-w-[6px] rounded-xs bg-rose-500"
                          style={{ height: `${(Math.abs(val) / 60) * 100}%` }}
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-[9px] font-mono text-muted-foreground px-1">
                <span>14 Aug</span>
                <span>29 Sep</span>
                <span>13 Nov</span>
              </div>
            </div>

            {/* SECTION 2: 4% MOVERS */}
            <div className="space-y-2 pt-3 border-t border-border/50">
              <div className="flex items-baseline justify-between text-xs">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                    4% Movers
                  </span>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="text-base font-extrabold font-mono text-foreground">-1</span>
                    <span className="text-xs font-semibold text-foreground">Balanced</span>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-[10px] font-mono">
                  {(["Daily", "5D ratio", "10D ratio"] as const).map((m) => (
                    <button
                      key={m}
                      onClick={() => setMoversTf(m)}
                      className={`px-1.5 py-0.5 rounded cursor-pointer ${
                        moversTf === m
                          ? "bg-primary text-white font-bold"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>
              <div className="text-[10px] text-muted-foreground font-mono">
                13 Nov • 52 up / 53 down
              </div>

              {/* 4% Movers Bar Chart */}
              <div className="h-28 w-full rounded-xl bg-slate-50 dark:bg-muted/30 border border-border/50 p-2 flex items-center justify-between gap-1">
                {[10, -5, 15, -20, 25, -10, 30, -15, 12, -8, 22, -18, 35, -12, 28, -14, 40, -10, 32, -15, 52, -53].map((val, idx) => (
                  <div key={idx} className="flex-1 flex flex-col items-center justify-center h-full">
                    <div className="h-1/2 w-full flex items-end justify-center">
                      {val > 0 && (
                        <div
                          className="w-full max-w-[6px] rounded-xs bg-primary"
                          style={{ height: `${(val / 60) * 100}%` }}
                        />
                      )}
                    </div>
                    <div className="w-full h-px bg-border" />
                    <div className="h-1/2 w-full flex items-start justify-center">
                      {val < 0 && (
                        <div
                          className="w-full max-w-[6px] rounded-xs bg-rose-500"
                          style={{ height: `${(Math.abs(val) / 60) * 100}%` }}
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-[9px] font-mono text-muted-foreground px-1">
                <span>14 Aug</span>
                <span>29 Sep</span>
                <span>13 Nov</span>
              </div>
            </div>

            {/* SECTION 3: BREAKOUTS - BREAKDOWNS */}
            <div className="space-y-2 pt-3 border-t border-border/50">
              <div className="flex items-baseline justify-between text-xs">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                    Breakouts - Breakdowns
                  </span>
                  <div className="text-xs font-bold text-foreground mt-0.5">
                    24 held, 16 failed today • 60% held this week
                  </div>
                </div>
              </div>

              {/* Breakout retention histogram */}
              <div className="h-24 w-full rounded-xl bg-slate-50 dark:bg-muted/30 border border-border/50 p-2 flex items-center justify-between gap-1">
                {[14, -8, 18, -10, 22, -12, 19, -9, 25, -11, 28, -14, 21, -8, 24, -16].map((val, idx) => (
                  <div key={idx} className="flex-1 flex flex-col items-center justify-center h-full">
                    <div className="h-1/2 w-full flex items-end justify-center">
                      {val > 0 && (
                        <div
                          className="w-full max-w-[6px] rounded-xs bg-primary"
                          style={{ height: `${(val / 30) * 100}%` }}
                        />
                      )}
                    </div>
                    <div className="w-full h-px bg-border" />
                    <div className="h-1/2 w-full flex items-start justify-center">
                      {val < 0 && (
                        <div
                          className="w-full max-w-[6px] rounded-xs bg-rose-500"
                          style={{ height: `${(Math.abs(val) / 25) * 100}%` }}
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-[9px] font-mono text-muted-foreground px-1">
                <span>29 Sep</span>
                <span>13 Nov</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ================= MAJOR INDICES MULTI-CHART GRID ================= */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {majorIndices.map((idx) => (
            <div
              key={idx.name}
              className="p-5 rounded-2xl bg-card border border-border/80 shadow-xs space-y-4 hover:border-primary/50 transition-all"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-base font-bold text-foreground">{idx.name}</h3>
                  <p className="text-xs text-muted-foreground">{idx.description}</p>
                </div>
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                  {idx.stage}
                </span>
              </div>

              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-black font-mono text-foreground">{idx.price}</span>
                <span className="text-sm font-bold font-mono text-bull">{idx.change}</span>
              </div>

              <div className="h-16 w-full p-1 bg-slate-50 dark:bg-muted/30 rounded-xl border border-border/50">
                <svg className="w-full h-full" viewBox="0 0 200 35" preserveAspectRatio="none">
                  <path d={idx.sparkline} fill="none" stroke="#2563eb" strokeWidth="2" />
                </svg>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/50 text-xs font-mono">
                <div>
                  <span className="text-[10px] text-muted-foreground block">52W Low</span>
                  <span className="font-semibold text-foreground">₹{idx.low52}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-muted-foreground block">52W High</span>
                  <span className="font-semibold text-foreground">₹{idx.high52}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function MarketsPage() {
  return (
    <React.Suspense fallback={<div className="min-h-screen p-6 text-xs text-muted-foreground">Loading Market Breadth...</div>}>
      <MarketsContent />
    </React.Suspense>
  );
}