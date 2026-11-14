"use client";

import React from "react";
import { Filter, Layers, Zap } from "lucide-react";

interface RRGHeaderControlsProps {
  group: "sectors" | "top-momentum";
  onGroupChange: (group: "sectors" | "top-momentum") => void;
  benchmark: string;
  onBenchmarkChange: (benchmark: string) => void;
  trailLength: 5 | 10 | 20;
  onTrailLengthChange: (len: 5 | 10 | 20) => void;
  quadrantCounts: {
    Leading: number;
    Weakening: number;
    Lagging: number;
    Improving: number;
  };
}

export function RRGHeaderControls({
  group,
  onGroupChange,
  benchmark,
  trailLength,
  onTrailLengthChange,
  quadrantCounts,
}: RRGHeaderControlsProps) {
  return (
    <div className="space-y-4">
      {/* Control Pills Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-card border border-border">
        {/* Left: View Mode Toggle (Sectors vs Top Momentum) */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-muted/40 border border-border/60">
          <button
            onClick={() => onGroupChange("sectors")}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              group === "sectors"
                ? "bg-card text-foreground shadow-sm border border-border"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Layers className="h-3.5 w-3.5 text-accent" />
            <span>Sectors Rotation</span>
          </button>
          <button
            onClick={() => onGroupChange("top-momentum")}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              group === "top-momentum"
                ? "bg-card text-foreground shadow-sm border border-border"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Zap className="h-3.5 w-3.5 text-accent" />
            <span>Top Liquid Momentum</span>
          </button>
        </div>

        {/* Right: Benchmark & Tail Length Selectors */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Benchmark Indicator */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-semibold bg-muted/40 border border-border">
            <span className="text-muted-foreground font-sans">Benchmark:</span>
            <span className="text-foreground">{benchmark}</span>
          </div>

          {/* Tail Length Selector */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-muted/40 border border-border/60">
            <span className="text-[11px] font-medium text-muted-foreground px-2 flex items-center gap-1">
              <Filter className="h-3 w-3" /> Tail:
            </span>
            {([5, 10, 20] as const).map((len) => (
              <button
                key={len}
                onClick={() => onTrailLengthChange(len)}
                className={`px-2.5 py-1 rounded-md text-xs font-mono font-semibold transition-all ${
                  trailLength === len
                    ? "bg-accent text-white shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {len}D
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Quadrant Count Metric Badges with Design Tokens */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Leading (Blue) */}
        <div className="p-3 rounded-xl border border-[#2563EB]/30 bg-[#2563EB]/5 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-[#2563EB] uppercase tracking-wider">
              Leading
            </div>
            <div className="text-[10px] text-muted-foreground">RS ≥ 100 • MOM ≥ 100</div>
          </div>
          <div className="text-2xl font-extrabold font-mono text-[#2563EB]">
            {quadrantCounts.Leading}
          </div>
        </div>

        {/* Weakening (Yellow/Amber) */}
        <div className="p-3 rounded-xl border border-[#D97706]/30 bg-[#D97706]/5 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-[#D97706] uppercase tracking-wider">
              Weakening
            </div>
            <div className="text-[10px] text-muted-foreground">RS ≥ 100 • MOM &lt; 100</div>
          </div>
          <div className="text-2xl font-extrabold font-mono text-[#D97706]">
            {quadrantCounts.Weakening}
          </div>
        </div>

        {/* Lagging (Pink) */}
        <div className="p-3 rounded-xl border border-[#DB2777]/30 bg-[#DB2777]/5 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-[#DB2777] uppercase tracking-wider">
              Lagging
            </div>
            <div className="text-[10px] text-muted-foreground">RS &lt; 100 • MOM &lt; 100</div>
          </div>
          <div className="text-2xl font-extrabold font-mono text-[#DB2777]">
            {quadrantCounts.Lagging}
          </div>
        </div>

        {/* Improving (Light Blue) */}
        <div className="p-3 rounded-xl border border-[#0284C7]/30 bg-[#0284C7]/5 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-[#0284C7] uppercase tracking-wider">
              Improving
            </div>
            <div className="text-[10px] text-muted-foreground">RS &lt; 100 • MOM ≥ 100</div>
          </div>
          <div className="text-2xl font-extrabold font-mono text-[#0284C7]">
            {quadrantCounts.Improving}
          </div>
        </div>
      </div>
    </div>
  );
}
