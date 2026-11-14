"use client";

import React from "react";
import { Compass, Globe, Sparkles, TrendingUp, TrendingDown } from "lucide-react";

export function DailyCues() {
  const globalIndicators = [
    { name: "GIFT NIFTY", val: "25,185", chg: "+0.16%", isUp: true },
    { name: "S&P 500", val: "5,864", chg: "+0.41%", isUp: true },
    { name: "NASDAQ", val: "18,342", chg: "+0.63%", isUp: true },
    { name: "US 10Y YIELD", val: "4.08%", chg: "-0.02%", isUp: false },
    { name: "BRENT CRUDE", val: "$74.20", chg: "-0.85%", isUp: false },
    { name: "USD / INR", val: "₹84.06", chg: "+0.02%", isUp: true },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
      {/* Daily Global Cues Card (8 cols) */}
      <div className="lg:col-span-8 p-4 rounded-xl border border-[#27272a] bg-[#1c1c2e] text-foreground flex flex-col justify-between shadow-xs">
        <div className="flex items-center justify-between pb-2 border-b border-[#27272a]/60">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
              <Compass className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-semibold text-xs text-zinc-200 tracking-tight">Daily Pre-Market Cues</h3>
              <p className="text-[11px] text-zinc-400">Overnight global macroeconomic cues & Gift Nifty bias</p>
            </div>
          </div>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
            Mild Bullish Bias
          </span>
        </div>

        {/* Narrative Strategic Summary */}
        <div className="py-2.5 px-3 my-2 rounded-lg bg-zinc-900/60 border border-[#27272a] flex items-start gap-2.5">
          <Sparkles className="h-3.5 w-3.5 text-indigo-400 mt-0.5 shrink-0" />
          <p className="text-xs text-zinc-300 leading-relaxed">
            Gift Nifty trades positive indicating flat-to-positive opening. Tech & Power sectors maintain leading momentum. Crude oil cooling supports domestic margins. Monitor 25,200 resistance on Nifty 50.
          </p>
        </div>

        {/* Multi-Asset Ticker Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 pt-1">
          {globalIndicators.map((item) => (
            <div
              key={item.name}
              className="p-2 rounded-lg bg-zinc-900/50 border border-[#27272a] flex flex-col justify-between"
            >
              <span className="text-[10px] font-mono text-zinc-400 uppercase truncate">
                {item.name}
              </span>
              <div className="flex items-center justify-between gap-1 mt-1">
                <span className="text-xs font-bold text-white tabular-nums">
                  {item.val}
                </span>
                <span
                  className={`text-[10px] font-mono font-bold tabular-nums ${
                    item.isUp ? "text-emerald-400" : "text-rose-400"
                  }`}
                >
                  {item.chg}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Nifty 50 Mini-Chart Bento Card (4 cols) */}
      <div className="lg:col-span-4 p-4 rounded-xl border border-[#27272a] bg-[#1c1c2e] text-foreground flex flex-col justify-between shadow-xs">
        <div className="flex items-center justify-between pb-2 border-b border-[#27272a]/60">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-xs text-zinc-200 tracking-tight">NIFTY 50</h3>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300">
                1D View
              </span>
            </div>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-base font-bold text-white tabular-nums">25,144.30</span>
              <span className="text-xs font-mono font-semibold text-rose-400 tabular-nums">-25.40 (-0.10%)</span>
            </div>
          </div>
          <span className="text-[11px] font-mono text-zinc-400 tabular-nums">
            ADR: 0.85%
          </span>
        </div>

        {/* Mini Chart Canvas / Sparkline */}
        <div className="py-2">
          <svg className="w-full h-16 overflow-visible" viewBox="0 0 200 60" preserveAspectRatio="none">
            {/* Soft Gridlines */}
            <line x1="0" y1="15" x2="200" y2="15" stroke="#27272a" strokeWidth="0.8" strokeDasharray="3 3" />
            <line x1="0" y1="45" x2="200" y2="45" stroke="#27272a" strokeWidth="0.8" strokeDasharray="3 3" />
            
            {/* Mini Chart Area fill */}
            <path
              d="M0,35 Q30,28 60,38 T120,20 T160,25 T200,32 L200,60 L0,60 Z"
              fill="rgba(99, 102, 241, 0.12)"
            />
            {/* Mini Chart Line */}
            <path
              d="M0,35 Q30,28 60,38 T120,20 T160,25 T200,32"
              fill="none"
              stroke="#6366f1"
              strokeWidth="2"
              strokeLinecap="round"
            />
            {/* Last Price Dot */}
            <circle cx="200" cy="32" r="3" fill="#6366f1" />
          </svg>
        </div>

        {/* Key Intraday Levels */}
        <div className="pt-2 border-t border-[#27272a]/60 grid grid-cols-3 gap-1 text-[10px] font-mono">
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
