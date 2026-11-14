"use client";

import React from "react";
import { RMESentiment } from "./types";
import { Gauge } from "lucide-react";

interface RMEMeterProps {
  rme?: RMESentiment;
}

export function RMEMeter({
  rme = {
    score: 48,
    regime: "Neutral",
    description: "Equilibrium between distribution and accumulation.",
  },
}: RMEMeterProps) {
  const score = Math.max(0, Math.min(100, rme.score));

  // Determine sentiment state (Washed Out / Oversold -> Neutral -> Stretched / Overextended)
  const isWashedOut = score < 35 || rme.regime.includes("Oversold") || rme.regime.includes("Washout");
  const isStretched = score > 65 || rme.regime.includes("Overextended") || rme.regime.includes("Stretched");

  const regimeDisplay = isWashedOut
    ? "Oversold / Washout"
    : isStretched
    ? "Overextended"
    : "Neutral";

  const statusColor = isWashedOut
    ? "#22c55e" // Bullish contrarian setup
    : isStretched
    ? "#ef4444" // Overextended / danger
    : "#f59e0b"; // Neutral

  return (
    <div className="p-4 rounded-xl border border-[#27272a] bg-[#1c1c2e] text-foreground flex flex-col justify-between shadow-xs">
      <div className="flex items-center justify-between pb-2 border-b border-[#27272a]/60">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
            <Gauge className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-semibold text-xs text-zinc-200 tracking-tight">RME Sentiment Index</h3>
            <p className="text-[11px] text-zinc-400">Risk Management Environment temperature</p>
          </div>
        </div>
        <span
          className="text-xs font-semibold px-2 py-0.5 rounded-full border tabular-nums"
          style={{
            borderColor: `${statusColor}50`,
            backgroundColor: `${statusColor}15`,
            color: statusColor,
          }}
        >
          {regimeDisplay}
        </span>
      </div>

      {/* Washed Out -> Neutral -> Stretched Meter Bar */}
      <div className="py-3 space-y-2">
        <div className="flex justify-between items-center text-xs">
          <span className="text-zinc-400 font-mono text-[11px]">Dial Gauge</span>
          <span className="text-base font-bold text-white tabular-nums">{score}/100</span>
        </div>

        {/* Visual Gradient Multi-Segment Scale */}
        <div className="relative h-2.5 w-full bg-zinc-900 rounded-full overflow-hidden border border-[#27272a]">
          <div
            className="absolute top-0 bottom-0 left-0 transition-all duration-500 rounded-full"
            style={{
              width: `${score}%`,
              backgroundColor: statusColor,
            }}
          />
        </div>

        {/* 3 Zones legend */}
        <div className="flex justify-between text-[10px] font-mono text-zinc-400 pt-1">
          <span className={isWashedOut ? "text-emerald-400 font-bold" : ""}>Washed Out (0-35)</span>
          <span className={!isWashedOut && !isStretched ? "text-amber-400 font-bold" : ""}>Neutral (36-65)</span>
          <span className={isStretched ? "text-rose-400 font-bold" : ""}>Stretched (66-100)</span>
        </div>
      </div>

      <div className="pt-2 border-t border-[#27272a]/60 flex items-center justify-between text-[11px]">
        <span className="text-zinc-400">Regime Status:</span>
        <span className="font-semibold text-zinc-200 tabular-nums">{rme.description || "Equilibrium"}</span>
      </div>
    </div>
  );
}

export default RMEMeter;
