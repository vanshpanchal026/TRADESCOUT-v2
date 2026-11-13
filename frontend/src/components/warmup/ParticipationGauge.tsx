"use client";

import React from "react";
import { MarketParticipation } from "./types";
import { Activity } from "lucide-react";

interface ParticipationGaugeProps {
  participation: MarketParticipation;
  totalTraded: number;
}

export function ParticipationGauge({ participation, totalTraded }: ParticipationGaugeProps) {
  const pct50 = participation.above_50_sma_pct;
  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (pct50 / 100) * circumference;

  const getColor = (pct: number) => {
    if (pct >= 60) return "#22c55e"; // bull green
    if (pct >= 40) return "#f59e0b"; // neutral yellow
    return "#ef4444"; // bear red
  };

  const currentColor = getColor(pct50);

  return (
    <div className="p-6 rounded-2xl border border-border bg-card shadow-sm space-y-4 flex flex-col justify-between">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-accent/10 text-accent">
            <Activity className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-semibold text-sm tracking-tight">Market Participation</h3>
            <p className="text-xs text-muted-foreground">Stocks above 50-day moving average</p>
          </div>
        </div>
        <span
          className="text-xs font-mono font-semibold px-2 py-0.5 rounded-full border"
          style={{
            borderColor: `${currentColor}40`,
            backgroundColor: `${currentColor}15`,
            color: currentColor,
          }}
        >
          {pct50 >= 50 ? "Expansion" : "Contraction"}
        </span>
      </div>

      {/* Circular Radial Gauge */}
      <div className="flex flex-col items-center justify-center py-2 relative">
        <svg className="w-36 h-36 transform -rotate-90" viewBox="0 0 160 160">
          {/* Background Track */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            stroke="currentColor"
            strokeWidth="12"
            fill="transparent"
            className="text-muted/30"
          />
          {/* Progress Arc */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            stroke={currentColor}
            strokeWidth="12"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Center Percentage Display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold tracking-tight font-mono">{pct50}%</span>
          <span className="text-xs text-muted-foreground font-medium">
            {participation.above_50_sma_count.toLocaleString()} / {totalTraded.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Sub-Pills for 20 SMA and 200 SMA */}
      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/60">
        <div className="bg-muted/40 rounded-lg p-2 text-center">
          <div className="text-[11px] text-muted-foreground font-medium">Above 20 SMA</div>
          <div className="text-sm font-bold font-mono text-foreground flex items-center justify-center gap-1">
            <span>{participation.above_20_sma_pct}%</span>
            <span className="text-[10px] text-muted-foreground font-normal">
              ({participation.above_20_sma_count})
            </span>
          </div>
        </div>

        <div className="bg-muted/40 rounded-lg p-2 text-center">
          <div className="text-[11px] text-muted-foreground font-medium">Above 200 SMA</div>
          <div className="text-sm font-bold font-mono text-foreground flex items-center justify-center gap-1">
            <span>{participation.above_200_sma_pct}%</span>
            <span className="text-[10px] text-muted-foreground font-normal">
              ({participation.above_200_sma_count})
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
