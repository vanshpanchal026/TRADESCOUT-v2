"use client";

import React from "react";
import { Compass, Sparkles, TrendingUp, TrendingDown } from "lucide-react";
import { PreMarketCues } from "./types";

interface DailyCuesProps {
  cues?: PreMarketCues;
}

export function DailyCues({ cues }: DailyCuesProps) {
  // Use cues prop if present, else fallback
  const summaryText =
    cues?.summary ||
    "Gift Nifty trades positive indicating flat-to-positive opening. Tech & Power sectors maintain leading momentum. Crude oil cooling supports domestic margins. Monitor 25,200 resistance pivot on Nifty 50.";

  const sentiment = cues?.sentiment || "Bullish";
  const sentimentIsBullish = sentiment.toLowerCase().includes("bull");
  const sentimentIsBearish = sentiment.toLowerCase().includes("bear");

  const globalIndicators = [
    {
      name: "GIFT NIFTY",
      val: cues?.gift_nifty?.value ? cues.gift_nifty.value.toLocaleString() : "25,185",
      chg: cues?.gift_nifty?.change_pct ? `${cues.gift_nifty.change_pct >= 0 ? "+" : ""}${cues.gift_nifty.change_pct.toFixed(2)}%` : "+0.16%",
      isUp: (cues?.gift_nifty?.change_pct ?? 0.16) >= 0,
    },
    { name: "S&P 500", val: "5,864", chg: "+0.41%", isUp: true },
    { name: "NASDAQ", val: "18,342", chg: "+0.63%", isUp: true },
    { name: "US 10Y YIELD", val: "4.08%", chg: "-0.02%", isUp: false },
    { name: "BRENT CRUDE", val: "$74.20", chg: "-0.85%", isUp: false },
    { name: "USD / INR", val: "₹84.06", chg: "+0.02%", isUp: true },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
      {/* Daily Global Cues Card (8 cols) */}
      <div className="lg:col-span-8 p-3.5 sm:p-4 rounded-xl border border-[#27272a] bg-[#101a33] text-foreground flex flex-col justify-between shadow-stc-card transition-all duration-150 ease-out hover:border-brand/40 hover:bg-white/[0.02]">
        <div className="flex items-center justify-between pb-3 border-b border-[#27272a]/70">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-primary/10 text-primary border border-primary/20 shrink-0">
              <Compass className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-semibold text-xs text-zinc-100 tracking-tight font-sans">Daily Pre-Market Cues</h3>
              <p className="text-[11px] text-zinc-400 font-sans">Overnight global macroeconomic cues & Gift Nifty bias</p>
            </div>
          </div>
          <span
            className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border tabular-nums transition-colors inline-flex items-center gap-1.5 ${
              sentimentIsBullish
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                : sentimentIsBearish
                ? "border-rose-500/30 bg-rose-500/10 text-rose-400"
                : "border-amber-500/30 bg-amber-500/10 text-amber-400"
            }`}
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{
                backgroundColor: sentimentIsBullish ? "#22c55e" : sentimentIsBearish ? "#ef4444" : "#f59e0b",
                boxShadow: `0 0 6px ${sentimentIsBullish ? "#22c55e" : sentimentIsBearish ? "#ef4444" : "#f59e0b"}`,
              }}
            />
            {sentiment} Bias
          </span>
        </div>

        {/* Narrative Strategic Summary */}
        <div className="py-2.5 px-3 my-2.5 rounded-lg bg-zinc-900/60 border border-[#27272a] flex items-start gap-2.5">
          <Sparkles className="h-4 w-4 text-primary mt-0.5 shrink-0" />
          <p className="text-xs text-zinc-300 leading-relaxed font-sans">
            {summaryText}
          </p>
        </div>

        {/* Multi-Asset Ticker Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 pt-1">
          {globalIndicators.map((item) => (
            <div
              key={item.name}
              className="p-2 px-2.5 rounded-lg bg-zinc-900/60 border border-[#27272a] flex flex-col justify-between hover:border-zinc-700/60 transition-colors duration-150"
            >
              <span className="text-[10px] font-mono text-zinc-400 uppercase truncate">
                {item.name}
              </span>
              <div className="flex items-center justify-between gap-1 mt-1">
                <span className="text-xs font-bold text-white tabular-nums font-mono">
                  {item.val}
                </span>
                <span
                  className={`text-[10px] font-mono font-bold tabular-nums inline-flex items-center gap-0.5 ${
                    item.isUp ? "text-emerald-400" : "text-rose-400"
                  }`}
                >
                  {item.isUp ? (
                    <TrendingUp className="h-2.5 w-2.5" />
                  ) : (
                    <TrendingDown className="h-2.5 w-2.5" />
                  )}
                  {item.chg}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Nifty 50 Mini-Chart Bento Card (4 cols) */}
      <div className="lg:col-span-4 p-3.5 sm:p-4 rounded-xl border border-[#27272a] bg-[#101a33] text-foreground flex flex-col justify-between shadow-stc-card transition-all duration-150 ease-out hover:border-brand/40 hover:bg-white/[0.02]">
        <div className="flex items-center justify-between pb-3 border-b border-[#27272a]/70">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-xs text-zinc-100 tracking-tight font-sans">NIFTY 50</h3>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-zinc-800 text-zinc-300 border border-zinc-700/50">
                1D View
              </span>
            </div>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-base font-bold text-white tabular-nums font-mono">25,144.30</span>
              <span className="text-xs font-mono font-semibold text-rose-400 tabular-nums">-25.40 (-0.10%)</span>
            </div>
          </div>
          <span className="text-[11px] font-mono text-zinc-400 tabular-nums">
            ADR: 0.85%
          </span>
        </div>

        {/* Mini Chart Canvas / Sparkline with gradient area */}
        <div className="py-2">
          <svg className="w-full h-16 overflow-visible" viewBox="0 0 200 60" preserveAspectRatio="none">
            <defs>
              <linearGradient id="niftyGradientArea" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0171e4" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#0171e4" stopOpacity="0.0" />
              </linearGradient>
            </defs>
            {/* Soft Gridlines */}
            <line x1="0" y1="15" x2="200" y2="15" stroke="#27272a" strokeWidth="0.8" strokeDasharray="3 3" />
            <line x1="0" y1="45" x2="200" y2="45" stroke="#27272a" strokeWidth="0.8" strokeDasharray="3 3" />

            {/* Mini Chart Area fill */}
            <path
              d="M0,35 Q30,28 60,38 T120,20 T160,25 T200,32 L200,60 L0,60 Z"
              fill="url(#niftyGradientArea)"
            />
            {/* Mini Chart Line */}
            <path
              d="M0,35 Q30,28 60,38 T120,20 T160,25 T200,32"
              fill="none"
              stroke="#0171e4"
              strokeWidth="2"
              strokeLinecap="round"
            />
            {/* Last Price Dot with glowing ring */}
            <circle cx="200" cy="32" r="4" fill="#0171e4" />
            <circle cx="200" cy="32" r="6.5" fill="none" stroke="#0171e4" strokeWidth="1" strokeOpacity="0.6" />
          </svg>
        </div>

        {/* Key Intraday Levels */}
        <div className="pt-2.5 border-t border-[#27272a]/70 grid grid-cols-3 gap-1 text-[10px] font-mono">
          <div className="flex flex-col">
            <span className="text-zinc-500">Day Low</span>
            <span className="text-zinc-300 tabular-nums font-bold">25,082</span>
          </div>
          <div className="flex flex-col text-center">
            <span className="text-zinc-500">Pivot Point</span>
            <span className="text-amber-400 tabular-nums font-bold">25,120</span>
          </div>
          <div className="flex flex-col text-right">
            <span className="text-zinc-500">Day High</span>
            <span className="text-zinc-300 tabular-nums font-bold">25,248</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DailyCues;
