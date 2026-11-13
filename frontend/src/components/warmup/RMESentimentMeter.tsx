"use client";

import React from "react";
import { RMESentiment } from "./types";
import { Gauge, ShieldAlert } from "lucide-react";

interface RMESentimentMeterProps {
  rme: RMESentiment;
}

export function RMESentimentMeter({ rme }: RMESentimentMeterProps) {
  const score = Math.max(0, Math.min(100, rme.score));

  // Determine meter styling based on regime
  const getRegimeStyles = (regime: string) => {
    switch (regime) {
      case "Oversold / Washout":
        return {
          textColor: "text-[#00E5FF]",
          badgeBg: "bg-[#00E5FF]/10 border-[#00E5FF]/30 text-[#00E5FF]",
          meterColor: "#00E5FF",
          advice: "Extreme Pessimism. Asymmetric upside for high RS leaders.",
        };
      case "Overextended":
        return {
          textColor: "text-[#EF4444]",
          badgeBg: "bg-[#EF4444]/10 border-[#EF4444]/30 text-[#EF4444]",
          meterColor: "#EF4444",
          advice: "Elevated Risk. Tighten trailing stops, avoid breakout chasing.",
        };
      case "Neutral":
      default:
        return {
          textColor: "text-[#F59E0B]",
          badgeBg: "bg-[#F59E0B]/10 border-[#F59E0B]/30 text-[#F59E0B]",
          meterColor: "#F59E0B",
          advice: "Constructive Equilibrium. Standard position sizing on setups.",
        };
    }
  };

  const style = getRegimeStyles(rme.regime);

  return (
    <div className="p-6 rounded-2xl border border-border bg-card shadow-sm space-y-4 flex flex-col justify-between">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-accent/10 text-accent">
            <Gauge className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-semibold text-sm tracking-tight">RME Sentiment Index</h3>
            <p className="text-xs text-muted-foreground">Risk Management Environment temperature</p>
          </div>
        </div>
        <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${style.badgeBg}`}>
          {rme.regime}
        </span>
      </div>

      {/* Score Big Pill */}
      <div className="flex items-baseline justify-between py-2">
        <div>
          <span className="text-4xl font-extrabold font-mono tracking-tight">{score}</span>
          <span className="text-sm font-semibold text-muted-foreground ml-1">/ 100</span>
        </div>
        <div className="text-right">
          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Regime Bias</div>
          <div className={`text-sm font-bold ${style.textColor}`}>{rme.regime}</div>
        </div>
      </div>

      {/* Segmented Gradient Bar */}
      <div className="space-y-1.5">
        <div className="h-3 w-full bg-muted/40 rounded-full overflow-hidden p-0.5 flex items-center relative border border-border/50">
          {/* Gradient Background Track */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#00E5FF] via-[#F59E0B] to-[#EF4444] opacity-35 rounded-full" />

          {/* Indicator Marker / Needle */}
          <div
            className="h-full w-2.5 bg-foreground rounded-full shadow-md shadow-foreground/40 transition-all duration-700 ease-out relative z-10"
            style={{ left: `calc(${score}% - 5px)` }}
          />
        </div>

        {/* Labels below meter */}
        <div className="flex justify-between text-[10px] text-muted-foreground font-mono px-0.5">
          <span>0 (Washed Out)</span>
          <span>50 (Neutral)</span>
          <span>100 (Overextended)</span>
        </div>
      </div>

      {/* Strategic Risk Guidance Footer */}
      <div className="pt-2 border-t border-border/60 flex items-start gap-2">
        <ShieldAlert className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
        <p className="text-xs text-muted-foreground leading-relaxed">
          {rme.description || style.advice}
        </p>
      </div>
    </div>
  );
}
