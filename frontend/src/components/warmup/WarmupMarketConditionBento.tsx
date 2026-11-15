"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Info,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

export function WarmupMarketConditionBento() {
  const [showMoreRead, setShowMoreRead] = useState(false);
  const [participationTimeframe, setParticipationTimeframe] = useState<"20D" | "50D" | "200D">("20D");

  const indices = [
    {
      name: "Nifty 50",
      value: "25,144",
      change: "-0.1%",
      isUp: false,
      low52: "24,000",
      high52: "26,277",
      fromHigh: "1.7% from high",
      sparkline: "M0,15 Q15,12 30,18 T60,10 T90,14 T120,8 T150,12",
    },
    {
      name: "Nifty 500",
      value: "23,734",
      change: "-0.05%",
      isUp: false,
      low52: "22,000",
      high52: "24,850",
      fromHigh: "1.7% from high",
      sparkline: "M0,14 Q15,13 30,16 T60,11 T90,12 T120,9 T150,11",
    },
    {
      name: "Midcap 150",
      value: "22,681",
      change: "-0.05%",
      isUp: false,
      low52: "20,000",
      high52: "23,500",
      fromHigh: "2.0% from high",
      sparkline: "M0,16 Q15,14 30,15 T60,10 T90,13 T120,8 T150,10",
    },
    {
      name: "Smallcap 250",
      value: "17,941",
      change: "-0.30%",
      isUp: false,
      low52: "15,000",
      high52: "18,500",
      fromHigh: "3.2% from high",
      sparkline: "M0,18 Q15,16 30,19 T60,14 T90,16 T120,11 T150,15",
    },
    {
      name: "Microcap 250",
      value: "29,778",
      change: "-0.39%",
      isUp: false,
      low52: "26,000",
      high52: "31,000",
      fromHigh: "3.0% from high",
      sparkline: "M0,19 Q15,17 30,20 T60,15 T90,18 T120,13 T150,17",
    },
    {
      name: "USD / INR",
      value: "84.23",
      change: "+0.20%",
      isUp: true,
      low52: "83.50",
      high52: "84.50",
      fromHigh: "₹ per US dollar",
      sparkline: "M0,20 Q15,18 30,14 T60,12 T90,8 T120,6 T150,4",
    },
    {
      name: "Crude oil",
      value: "$68.56",
      change: "-0.38%",
      isUp: false,
      low52: "65.00",
      high52: "85.00",
      fromHigh: "WTI • $ per barrel",
      sparkline: "M0,8 Q15,10 30,12 T60,16 T90,14 T120,18 T150,20",
    },
  ];

  return (
    <div className="space-y-4">
      {/* ================= TOP BENTO: MARKET CONDITION CARD ================= */}
      <div className="rounded-2xl bg-card border border-border/80 shadow-xs p-4 sm:p-5">
        {/* Header Strip */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-4 mb-4 border-b border-border/60">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
            <span className="text-foreground font-bold">Market condition</span>
            <Info className="h-3.5 w-3.5 text-muted-foreground/70" />
          </div>

          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span>Read as of Fri 13 Nov</span>
            <span>•</span>
            <span className="font-mono">1,508 liquid stocks</span>
            <span>•</span>
            <Link
              href="/markets"
              className="text-primary hover:underline font-semibold flex items-center gap-0.5"
            >
              <span>Market breadth</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>

        {/* 3 Columns Inside Market Condition */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 divide-y lg:divide-y-0 lg:divide-x divide-border/60">
          {/* COLUMN 1: MARKET READ */}
          <div className="space-y-3 lg:pr-5">
            <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Market read
            </div>

            <div className="space-y-2.5 text-xs">
              <div>
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                  <span className="font-medium text-foreground">Momentum</span>
                  <span className="font-bold text-primary ml-auto">Positive</span>
                </div>
                <p className="text-[11px] text-muted-foreground pl-3.5 mt-0.5 leading-relaxed">
                  Buying is strong: about 3 stocks are jumping 4% for every one that drops 4%.
                </p>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                  <span className="font-medium text-foreground">Short-term</span>
                  <span className="font-bold text-primary ml-auto">Up</span>
                </div>
                <p className="text-[11px] text-muted-foreground pl-3.5 mt-0.5 leading-relaxed">
                  The last few weeks have been strong: most stocks are rising, and new highs far outnumber new lows.
                </p>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-400 shrink-0" />
                  <span className="font-medium text-foreground">Big trend</span>
                  <span className="font-bold text-muted-foreground ml-auto">Neutral</span>
                </div>
                <p className="text-[11px] text-muted-foreground pl-3.5 mt-0.5 leading-relaxed">
                  The bigger picture is split: neither buyers nor sellers are in control over the long run.
                </p>
              </div>

              {showMoreRead && (
                <div className="space-y-2.5 pt-1 border-t border-border/40 animate-slide duration-160">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                      <span className="font-medium text-foreground">Breakouts</span>
                      <span className="font-bold text-primary ml-auto">Working</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground pl-3.5 mt-0.5">
                      Breakouts are working: about 5 in 10 new buys are holding up.
                    </p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-slate-400 shrink-0" />
                      <span className="font-medium text-foreground">Overdone?</span>
                      <span className="font-bold text-muted-foreground ml-auto">Normal</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground pl-3.5 mt-0.5">
                      Not overdone: small caps are within their usual range.
                    </p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-slate-400 shrink-0" />
                      <span className="font-medium text-foreground">Leadership</span>
                      <span className="font-bold text-muted-foreground ml-auto">Large caps lead</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground pl-3.5 mt-0.5">
                      Big stocks are leading; mid and small caps are lagging behind.
                    </p>
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={() => setShowMoreRead(!showMoreRead)}
                className="text-[11px] text-primary hover:underline font-semibold flex items-center gap-1 pt-1 cursor-pointer"
              >
                <span>{showMoreRead ? "Show less" : "Show 3 more"}</span>
                {showMoreRead ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              </button>
            </div>
          </div>

          {/* COLUMN 2: MARKET PARTICIPATION */}
          <div className="space-y-3 pt-4 lg:pt-0 lg:px-5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-foreground">Breadth participation</span>
              <div className="flex items-center gap-1 text-[10px] font-mono">
                {(["20D", "50D", "200D"] as const).map((tf) => (
                  <button
                    key={tf}
                    onClick={() => setParticipationTimeframe(tf)}
                    className={`px-1.5 py-0.5 rounded ${
                      participationTimeframe === tf
                        ? "bg-primary text-white font-bold"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {tf}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-extrabold font-mono text-foreground">74.4%</span>
                <span className="text-xs font-semibold text-foreground">Broad</span>
                <span className="text-[11px] text-primary font-mono font-bold">+20.6 pts in a week</span>
              </div>
              <span className="text-[10px] text-muted-foreground block mt-0.5">
                Share of stocks above their {participationTimeframe} average, as of Fri 13 Nov
              </span>
            </div>

            {/* Sparkline 1: Stocks above 20D average */}
            <div className="space-y-1">
              <div className="h-16 w-full rounded-lg bg-slate-50 dark:bg-muted/30 border border-border/40 p-1 relative overflow-hidden">
                <svg className="w-full h-full" viewBox="0 0 300 60" preserveAspectRatio="none">
                  {/* Upper/Lower Threshold Bands */}
                  <rect x="0" y="0" width="300" height="15" fill="rgba(239, 68, 68, 0.08)" />
                  <rect x="0" y="45" width="300" height="15" fill="rgba(59, 130, 246, 0.08)" />
                  <line x1="0" y1="15" x2="300" y2="15" stroke="rgba(239, 68, 68, 0.2)" strokeDasharray="2,2" />
                  <line x1="0" y1="45" x2="300" y2="45" stroke="rgba(59, 130, 246, 0.2)" strokeDasharray="2,2" />
                  {/* Participation curve */}
                  <path
                    d="M0,48 Q40,46 80,42 T160,35 T220,28 T270,18 L300,12"
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

            {/* Sub-chart: Stage 2 vs Stage 4 */}
            <div className="space-y-1 pt-1 border-t border-border/40">
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-muted-foreground font-medium">Stage 2 vs Stage 4</span>
                <div className="flex items-center gap-2 font-mono text-[9px]">
                  <span className="flex items-center gap-1 text-primary">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" /> Stage 2 (38.7%)
                  </span>
                  <span className="flex items-center gap-1 text-rose-500">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500" /> Stage 4 (46.1%)
                  </span>
                </div>
              </div>
              <div className="h-10 w-full rounded bg-slate-50 dark:bg-muted/30 border border-border/40 p-1">
                <svg className="w-full h-full" viewBox="0 0 300 40" preserveAspectRatio="none">
                  {/* Stage 2 curve (rising) */}
                  <path
                    d="M0,32 Q60,30 120,25 T200,18 T270,15 L300,14"
                    fill="none"
                    stroke="#2563eb"
                    strokeWidth="1.5"
                  />
                  {/* Stage 4 curve (falling) */}
                  <path
                    d="M0,15 Q60,18 120,22 T200,26 T270,28 L300,30"
                    fill="none"
                    stroke="#f43f5e"
                    strokeWidth="1.5"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* COLUMN 3: FII / DII CASH • LAST 22 SESSIONS */}
          <div className="space-y-3 pt-4 lg:pt-0 lg:pl-5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-foreground uppercase tracking-wider">
                FII / DII Cash • Last 22 Sessions
              </span>
              <span className="text-[10px] font-mono text-muted-foreground">₹ Crore</span>
            </div>

            {/* FII Row */}
            <div className="space-y-1">
              <div className="flex items-baseline justify-between text-xs">
                <span className="font-medium text-foreground">FII</span>
                <div className="flex items-center gap-2 font-mono">
                  <span className="text-[10px] text-muted-foreground">1-month net:</span>
                  <span className="font-bold text-bull text-[11px]">+₹76,933</span>
                  <span className="text-[10px] text-muted-foreground">Fri 13 Nov:</span>
                  <span className="font-bold text-bull text-[11px]">+₹5,737</span>
                </div>
              </div>
              {/* Cash bars representation */}
              <div className="h-5 flex items-center gap-0.5">
                {[4, -2, 6, 8, -3, 5, 10, 7, -1, 4, 8, 12, 6, 9, -2, 5, 8, 11, 4, 7, 9, 14].map((v, i) => (
                  <div
                    key={i}
                    className={`flex-1 rounded-xs transition-all ${
                      v > 0 ? "bg-bull/80 hover:bg-bull h-4" : "bg-rose-500/80 hover:bg-rose-500 h-2"
                    }`}
                    title={`FII Day ${i + 1}: ${v > 0 ? "+" : ""}${v * 500} Cr`}
                  />
                ))}
              </div>
            </div>

            {/* DII Row */}
            <div className="space-y-1 pt-1 border-t border-border/40">
              <div className="flex items-baseline justify-between text-xs">
                <span className="font-medium text-foreground">DII</span>
                <div className="flex items-center gap-2 font-mono">
                  <span className="text-[10px] text-muted-foreground">1-month net:</span>
                  <span className="font-bold text-rose-500 text-[11px]">-₹32,735</span>
                  <span className="text-[10px] text-muted-foreground">Fri 13 Nov:</span>
                  <span className="font-bold text-rose-500 text-[11px]">-₹1,254</span>
                </div>
              </div>
              <div className="h-5 flex items-center gap-0.5">
                {[-2, -3, -4, 2, -1, -5, -6, 3, -4, -2, -5, -4, 2, -3, -4, -6, 1, -2, -4, -3, -5, -2].map((v, i) => (
                  <div
                    key={i}
                    className={`flex-1 rounded-xs transition-all ${
                      v > 0 ? "bg-bull/80 hover:bg-bull h-2" : "bg-rose-500/80 hover:bg-rose-500 h-4"
                    }`}
                    title={`DII Day ${i + 1}: ${v * 500} Cr`}
                  />
                ))}
              </div>
            </div>

            {/* Net 20-Day Highs - Lows Row */}
            <div className="space-y-1 pt-1 border-t border-border/40">
              <div className="flex items-baseline justify-between text-xs">
                <span className="text-[11px] text-muted-foreground font-medium">Net 20-day Highs - Lows</span>
                <div className="flex items-center gap-1.5 font-mono text-[11px]">
                  <span className="font-bold text-bull">+180</span>
                  <span className="text-[10px] text-muted-foreground">Fri 13 Nov • 213 highs / 33 lows</span>
                </div>
              </div>
              <div className="h-6 flex items-center gap-0.5">
                {[-5, -10, -8, 2, 4, 8, 12, 16, 10, 14, 18, 22, 19, 24, 20, 26, 22, 28, 25, 30, 28, 35].map((v, i) => (
                  <div
                    key={i}
                    className={`flex-1 rounded-xs ${
                      v > 0 ? "bg-primary hover:bg-primary/80" : "bg-rose-500 hover:bg-rose-500/80"
                    }`}
                    style={{ height: `${Math.min(Math.abs(v) * 0.7 + 4, 22)}px` }}
                    title={`Net Highs-Lows: ${v}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ================= SECOND BENTO: INDICES TICKER ROW ================= */}
      <div className="rounded-2xl bg-card border border-border/80 shadow-xs p-3.5 sm:p-4">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3 font-medium">
          <span className="text-foreground font-bold">Indices</span>
          <Info className="h-3 w-3 text-muted-foreground/70" />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 sm:gap-4 divide-y sm:divide-y-0 sm:divide-x divide-border/50">
          {indices.map((idx, index) => (
            <div key={idx.name} className={`${index > 0 ? "sm:pl-3.5 pt-2 sm:pt-0" : ""}`}>
              <div className="flex items-baseline justify-between">
                <span className="text-xs font-bold text-foreground truncate">{idx.name}</span>
                <span
                  className={`text-[11px] font-mono font-bold ${
                    idx.isUp ? "text-bull" : "text-rose-500"
                  }`}
                >
                  {idx.change}
                </span>
              </div>

              <div className="text-sm font-extrabold font-mono text-foreground mt-0.5">
                {idx.value}
              </div>

              {/* Sparkline curve */}
              <div className="h-6 w-full my-1">
                <svg className="w-full h-full" viewBox="0 0 150 25" preserveAspectRatio="none">
                  <path
                    d={idx.sparkline}
                    fill="none"
                    stroke={idx.isUp ? "#16a34a" : "#64748b"}
                    strokeWidth="1.5"
                  />
                </svg>
              </div>

              <div className="text-[10px] text-muted-foreground font-mono flex items-center justify-between">
                <span>{idx.fromHigh}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default WarmupMarketConditionBento;