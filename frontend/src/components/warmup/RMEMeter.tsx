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
  const score = Math.max(0, Math.min(100, Math.round(rme.score)));

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
    ? "#ef4444" // Overextended / caution
    : "#f59e0b"; // Neutral

  const statusBadgeBg = isWashedOut
    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
    : isStretched
    ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
    : "bg-amber-500/10 text-amber-400 border-amber-500/20";

  return (
    <div className="p-3.5 sm:p-4 rounded-xl border border-[#27272a] bg-[#101a33] text-foreground flex flex-col justify-between shadow-stc-card transition-all duration-150 ease-out hover:border-brand/40 hover:bg-white/[0.02]">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#27272a]/70">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-primary/10 text-primary border border-primary/20 shrink-0">
            <Gauge className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-semibold text-xs text-zinc-100 tracking-tight font-sans">RME Sentiment Index</h3>
            <p className="text-[11px] text-zinc-400 font-sans">Risk Management Environment temperature</p>
          </div>
        </div>
        <span
          className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border tabular-nums transition-colors inline-flex items-center gap-1.5 ${statusBadgeBg}`}
        >
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: statusColor, boxShadow: `0 0 6px ${statusColor}` }}
          />
          {regimeDisplay}
        </span>
      </div>

      {/* Meter Bar Section */}
      <div className="py-3.5 space-y-2.5">
        <div className="flex justify-between items-baseline">
          <span className="text-zinc-400 font-mono text-[11px] uppercase tracking-wider">Dial Reading</span>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold font-sans text-white tabular-nums tracking-tight">{score}</span>
            <span className="text-xs font-mono text-zinc-400 tabular-nums">/100</span>
          </div>
        </div>

        {/* Visual Progress Bar with markers and glowing indicator pip */}
        <div className="relative h-2.5 w-full bg-zinc-900 rounded-full border border-[#27272a]">
          {/* Progress Fill */}
          <div
            className="absolute top-0 bottom-0 left-0 transition-all duration-350 ease-out rounded-full"
            style={{
              width: `${score}%`,
              backgroundColor: statusColor,
            }}
          />
          {/* Position indicator pip */}
          <div
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-white border-2 shadow-[0_0_8px_rgba(255,255,255,0.6)] transition-all duration-350 ease-out"
            style={{
              left: `${score}%`,
              borderColor: statusColor,
            }}
          />
          {/* Subtle demarcation ticks at 35% and 65% */}
          <div className="absolute top-0 bottom-0 left-[35%] w-px bg-zinc-700/60" />
          <div className="absolute top-0 bottom-0 left-[65%] w-px bg-zinc-700/60" />
        </div>

        {/* 3 Zones Legend */}
        <div className="flex justify-between text-[10px] font-mono text-zinc-400 pt-0.5">
          <span className={isWashedOut ? "text-emerald-400 font-bold" : "text-zinc-500"}>
            Washed Out (&lt;35)
          </span>
          <span className={!isWashedOut && !isStretched ? "text-amber-400 font-bold" : "text-zinc-500"}>
            Neutral (35-65)
          </span>
          <span className={isStretched ? "text-rose-400 font-bold" : "text-zinc-500"}>
            Overextended (&gt;65)
          </span>
        </div>
      </div>

      {/* Footer Status */}
      <div className="pt-2.5 border-t border-[#27272a]/70 flex items-center justify-between text-[11px]">
        <span className="text-zinc-400 font-sans">Regime Status:</span>
        <span className="font-semibold text-zinc-200 tabular-nums font-sans truncate max-w-[220px]">
          {rme.description || (isWashedOut ? "Contrarian Accumulation Bias" : isStretched ? "Distribution & Caution Bias" : "Equilibrium")}
        </span>
      </div>
    </div>
  );
}

export default RMEMeter;
