"use client";

import React from "react";
import { MarketParticipation } from "./types";
import { Activity } from "lucide-react";

interface BreadthGaugeProps {
  participation?: MarketParticipation;
  totalTraded?: number;
}

export function BreadthGauge({
  participation = {
    above_20_sma_count: 998,
    above_20_sma_pct: 54.2,
    above_50_sma_count: 894,
    above_50_sma_pct: 48.6,
    above_200_sma_count: 1137,
    above_200_sma_pct: 61.8,
  },
  totalTraded = 1840,
}: BreadthGaugeProps) {
  const pct50 = Number(participation.above_50_sma_pct.toFixed(1));
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (pct50 / 100) * circumference;

  const getColor = (pct: number) => {
    if (pct >= 55) return "#22c55e"; // bull green
    if (pct >= 45) return "#f59e0b"; // neutral yellow
    return "#ef4444"; // bear red
  };

  const currentColor = getColor(pct50);
  const isExpansion = pct50 >= 50;

  return (
    <div className="p-3.5 sm:p-4 rounded-xl border border-[#27272a] bg-[#101a33] text-foreground flex flex-col justify-between shadow-stc-card transition-all duration-150 ease-out hover:border-brand/40 hover:bg-white/[0.02]">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#27272a]/70">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-primary/10 text-primary border border-primary/20 shrink-0">
            <Activity className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-semibold text-xs text-zinc-100 tracking-tight font-sans">Market Participation</h3>
            <p className="text-[11px] text-zinc-400 font-sans">Stocks above 50-day moving average</p>
          </div>
        </div>
        <span
          className="text-xs font-semibold px-2.5 py-0.5 rounded-full border tabular-nums transition-colors inline-flex items-center gap-1.5"
          style={{
            borderColor: `${currentColor}50`,
            backgroundColor: `${currentColor}15`,
            color: currentColor,
          }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: currentColor, boxShadow: `0 0 6px ${currentColor}` }}
          />
          {isExpansion ? "Expansion" : "Contraction"}
        </span>
      </div>

      {/* Main Radial Circular Gauge & SMA Breakdown */}
      <div className="py-2.5 flex items-center justify-around gap-3">
        <div className="relative flex items-center justify-center shrink-0">
          <svg className="w-24 h-24 transform -rotate-90">
            {/* Background Track Circle */}
            <circle
              cx="48"
              cy="48"
              r={radius}
              strokeWidth="7"
              fill="transparent"
              className="text-zinc-800/80 stroke-current"
            />
            {/* Value Arc */}
            <circle
              cx="48"
              cy="48"
              r={radius}
              strokeWidth="7"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              style={{ stroke: currentColor }}
              className="transition-all duration-350 ease-out"
            />
          </svg>
          <div className="absolute flex flex-col items-center">
            <span className="text-xl font-bold font-sans tabular-nums text-white leading-none">
              {pct50}%
            </span>
            <span className="text-[9px] font-mono text-zinc-400 mt-1">SMA 50</span>
          </div>
        </div>

        {/* 3 Participation Gauges: SMA 20, 50, 200 */}
        <div className="flex flex-col gap-1.5 flex-1 text-xs">
          <div className="flex items-center justify-between p-1.5 px-2.5 rounded-lg bg-zinc-900/60 border border-[#27272a]">
            <span className="text-[11px] text-zinc-400 font-mono">SMA 20</span>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-zinc-500 font-mono tabular-nums">
                ({participation.above_20_sma_count})
              </span>
              <span className="font-bold text-white tabular-nums">{participation.above_20_sma_pct}%</span>
            </div>
          </div>
          <div className="flex items-center justify-between p-1.5 px-2.5 rounded-lg bg-zinc-900/60 border border-[#27272a]">
            <span className="text-[11px] text-zinc-400 font-mono">SMA 50</span>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-zinc-500 font-mono tabular-nums">
                ({participation.above_50_sma_count})
              </span>
              <span className="font-bold text-white tabular-nums">{pct50}%</span>
            </div>
          </div>
          <div className="flex items-center justify-between p-1.5 px-2.5 rounded-lg bg-zinc-900/60 border border-[#27272a]">
            <span className="text-[11px] text-zinc-400 font-mono">SMA 200</span>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-zinc-500 font-mono tabular-nums">
                ({participation.above_200_sma_count})
              </span>
              <span className="font-bold text-white tabular-nums">{participation.above_200_sma_pct}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Sample Information */}
      <div className="pt-2.5 border-t border-[#27272a]/70 flex items-center justify-between text-[11px]">
        <span className="text-zinc-400 font-sans">Universe Sample:</span>
        <span className="font-semibold text-zinc-200 tabular-nums font-mono">
          {totalTraded.toLocaleString()} Stocks
        </span>
      </div>
    </div>
  );
}

export default BreadthGauge;
