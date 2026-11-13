"use client";

import React from "react";
import { StageDistribution } from "./types";
import { Layers } from "lucide-react";

interface StageDistributionBarProps {
  stages: StageDistribution;
  totalTraded: number;
}

export function StageDistributionBar({ stages, totalTraded }: StageDistributionBarProps) {
  const ratio = stages.stage_2_to_4_ratio;
  const isHealthy = ratio >= 1.5;

  return (
    <div className="p-6 rounded-2xl border border-border bg-card shadow-sm space-y-4 flex flex-col justify-between">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-accent/10 text-accent">
            <Layers className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-semibold text-sm tracking-tight">Weinstein Stage Balance</h3>
            <p className="text-xs text-muted-foreground">Stan Weinstein 4-Stage market lifecycle</p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-xs text-muted-foreground font-medium">Stage 2 : 4 Ratio</span>
          <div className={`text-sm font-bold font-mono ${isHealthy ? "text-bull" : "text-bear"}`}>
            {ratio}x
          </div>
        </div>
      </div>

      {/* Primary Comparison Metric */}
      <div className="grid grid-cols-2 gap-4 py-1">
        <div className="bg-bull/10 border border-bull/20 rounded-xl p-3">
          <div className="text-[11px] font-semibold text-bull uppercase tracking-wider">
            Stage 2 (Markup)
          </div>
          <div className="text-2xl font-bold font-mono text-foreground mt-0.5">
            {stages.stage_2_pct}%
          </div>
          <div className="text-xs text-muted-foreground font-medium">
            {stages.stage_2_count.toLocaleString()} stocks in uptrend
          </div>
        </div>

        <div className="bg-bear/10 border border-bear/20 rounded-xl p-3">
          <div className="text-[11px] font-semibold text-bear uppercase tracking-wider">
            Stage 4 (Decline)
          </div>
          <div className="text-2xl font-bold font-mono text-foreground mt-0.5">
            {stages.stage_4_pct}%
          </div>
          <div className="text-xs text-muted-foreground font-medium">
            {stages.stage_4_count.toLocaleString()} stocks in downtrend
          </div>
        </div>
      </div>

      {/* Stacked 4-Stage Horizontal Progress Bar */}
      <div className="space-y-1.5">
        <div className="h-4 w-full bg-muted/40 rounded-full overflow-hidden flex p-0.5 border border-border/50">
          {/* Stage 1: Base (Blue) */}
          <div
            style={{ width: `${stages.stage_1_pct}%` }}
            className="bg-[#3B82F6] h-full rounded-l-full transition-all duration-700 relative group"
            title={`Stage 1 (Base): ${stages.stage_1_pct}% (${stages.stage_1_count})`}
          />
          {/* Stage 2: Markup (Green) */}
          <div
            style={{ width: `${stages.stage_2_pct}%` }}
            className="bg-[#22C55E] h-full transition-all duration-700 relative group"
            title={`Stage 2 (Markup): ${stages.stage_2_pct}% (${stages.stage_2_count})`}
          />
          {/* Stage 3: Top (Amber) */}
          <div
            style={{ width: `${stages.stage_3_pct}%` }}
            className="bg-[#F59E0B] h-full transition-all duration-700 relative group"
            title={`Stage 3 (Top): ${stages.stage_3_pct}% (${stages.stage_3_count})`}
          />
          {/* Stage 4: Capitulation (Red) */}
          <div
            style={{ width: `${stages.stage_4_pct}%` }}
            className="bg-[#EF4444] h-full rounded-r-full transition-all duration-700 relative group"
            title={`Stage 4 (Decline): ${stages.stage_4_pct}% (${stages.stage_4_count})`}
          />
        </div>

        {/* Legend */}
        <div className="grid grid-cols-4 gap-1 text-[11px] font-mono text-muted-foreground pt-1">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-[#3B82F6]" />
            <span>S1: {stages.stage_1_pct}%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-[#22C55E]" />
            <span className="font-semibold text-foreground">S2: {stages.stage_2_pct}%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-[#F59E0B]" />
            <span>S3: {stages.stage_3_pct}%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-[#EF4444]" />
            <span className="font-semibold text-foreground">S4: {stages.stage_4_pct}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
