"use client";

import React from "react";
import { TrendingUp, ArrowUpRight, ArrowDownRight, Compass, Layers, CheckCircle2 } from "lucide-react";

export function MarketReadAndHighsLows() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      {/* Market Read Card */}
      <div className="p-5 rounded-2xl bg-card border border-border shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-bull/10 text-bull flex items-center justify-center font-bold">
              <Compass className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">Market Read</h3>
              <p className="text-[11px] text-muted-foreground">High-level market health &amp; regime summary</p>
            </div>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-bull/10 text-bull border border-bull/20 font-bold">
            CONFIRMED UPTREND
          </span>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 rounded-xl bg-background border border-border/80 text-center">
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider block font-medium">
              Short-Term Momentum
            </span>
            <span className="text-sm font-bold text-bull mt-1 inline-block">
              Positive
            </span>
          </div>

          <div className="p-3 rounded-xl bg-background border border-border/80 text-center">
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider block font-medium">
              Short-Term Trend
            </span>
            <span className="text-sm font-bold text-bull mt-1 inline-block">
              Up
            </span>
          </div>

          <div className="p-3 rounded-xl bg-background border border-border/80 text-center">
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider block font-medium">
              Big Trend
            </span>
            <span className="text-sm font-bold text-amber-500 mt-1 inline-block">
              Neutral
            </span>
          </div>
        </div>

        {/* 20D Breadth Acceleration Info */}
        <div className="p-3 rounded-xl bg-muted/40 border border-border/60 flex items-center justify-between text-xs">
          <span className="text-muted-foreground">20-Day Moving Average Breadth:</span>
          <span className="font-semibold text-foreground flex items-center gap-1.5 font-mono">
            <span>74.4% Broad</span>
            <span className="text-bull font-bold">(+20.6 pts/wk)</span>
          </span>
        </div>
      </div>

      {/* 20-Day Highs / Lows Ratio Card */}
      <div className="p-5 rounded-2xl bg-card border border-border shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
              <TrendingUp className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">20-Day Highs / Lows Ratio</h3>
              <p className="text-[11px] text-muted-foreground">Gauge of short-term breadth expansion vs contraction</p>
            </div>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 font-bold">
            NET +180
          </span>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 rounded-xl bg-background border border-border/80 text-center">
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider block font-medium">
              20D New Highs
            </span>
            <div className="flex items-baseline justify-center gap-1 mt-1">
              <span className="text-lg font-bold font-mono text-bull">213</span>
              <ArrowUpRight className="h-3.5 w-3.5 text-bull" />
            </div>
            <span className="text-[10px] text-muted-foreground">Expanding</span>
          </div>

          <div className="p-3 rounded-xl bg-background border border-border/80 text-center">
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider block font-medium">
              20D New Lows
            </span>
            <div className="flex items-baseline justify-center gap-1 mt-1">
              <span className="text-lg font-bold font-mono text-bear">33</span>
              <ArrowDownRight className="h-3.5 w-3.5 text-bear" />
            </div>
            <span className="text-[10px] text-muted-foreground">Subdued</span>
          </div>

          <div className="p-3 rounded-xl bg-background border border-border/80 text-center">
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider block font-medium">
              Net Differential
            </span>
            <div className="flex items-baseline justify-center gap-1 mt-1">
              <span className="text-lg font-bold font-mono text-primary">+180</span>
            </div>
            <span className="text-[10px] text-bull font-medium">Strong Expansion</span>
          </div>
        </div>

        {/* Visual Ratio Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-[11px] text-muted-foreground">
            <span className="text-bull font-semibold font-mono">Highs: 86.6%</span>
            <span className="text-bear font-semibold font-mono">Lows: 13.4%</span>
          </div>
          <div className="w-full h-2.5 rounded-full bg-muted overflow-hidden flex">
            <div style={{ width: "86.6%" }} className="bg-bull h-full" />
            <div style={{ width: "13.4%" }} className="bg-bear h-full" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default MarketReadAndHighsLows;
