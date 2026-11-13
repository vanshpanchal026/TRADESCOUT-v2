"use client";

import React from "react";
import { AdvanceDecline, HighsLows52W, VolumeBreadth } from "./types";
import { ArrowDownRight, ArrowUpRight, BarChart3, TrendingUp, Volume2 } from "lucide-react";

interface BreadthSummaryCardsProps {
  advanceDecline: AdvanceDecline;
  highsLows: HighsLows52W;
  volumeBreadth: VolumeBreadth;
}

export function BreadthSummaryCards({
  advanceDecline,
  highsLows,
  volumeBreadth,
}: BreadthSummaryCardsProps) {
  const isAdvDominant = advanceDecline.advances > advanceDecline.declines;
  const isHighsDominant = highsLows.new_highs_52w >= highsLows.new_lows_52w;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      {/* Card 1: Advance / Decline Ratio */}
      <div className="p-5 rounded-2xl border border-border bg-card shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <TrendingUp className="h-3.5 w-3.5 text-accent" /> Advance / Decline
          </span>
          <span
            className={`text-xs font-mono font-bold px-2 py-0.5 rounded-full border ${
              isAdvDominant
                ? "bg-bull/10 border-bull/30 text-bull"
                : "bg-bear/10 border-bear/30 text-bear"
            }`}
          >
            {advanceDecline.ratio}x A/D
          </span>
        </div>

        <div className="flex items-baseline justify-between">
          <div className="flex items-center gap-1.5 text-bull">
            <ArrowUpRight className="h-5 w-5" />
            <span className="text-2xl font-bold font-mono">
              {advanceDecline.advances.toLocaleString()}
            </span>
            <span className="text-xs text-muted-foreground font-medium">Adv</span>
          </div>

          <div className="flex items-center gap-1.5 text-bear">
            <ArrowDownRight className="h-5 w-5" />
            <span className="text-2xl font-bold font-mono">
              {advanceDecline.declines.toLocaleString()}
            </span>
            <span className="text-xs text-muted-foreground font-medium">Dec</span>
          </div>

          <div className="text-right">
            <span className="text-xs text-muted-foreground font-mono">
              {advanceDecline.unchanged} Unch
            </span>
          </div>
        </div>

        {/* Advance vs Decline Ratio Bar */}
        <div className="w-full bg-muted/40 h-2 rounded-full overflow-hidden flex">
          <div
            style={{
              width: `${(advanceDecline.advances / Math.max(advanceDecline.advances + advanceDecline.declines, 1)) * 100}%`,
            }}
            className="bg-bull h-full rounded-l-full transition-all duration-500"
          />
          <div
            style={{
              width: `${(advanceDecline.declines / Math.max(advanceDecline.advances + advanceDecline.declines, 1)) * 100}%`,
            }}
            className="bg-bear h-full rounded-r-full transition-all duration-500"
          />
        </div>
      </div>

      {/* Card 2: 52-Week Highs vs Lows */}
      <div className="p-5 rounded-2xl border border-border bg-card shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <BarChart3 className="h-3.5 w-3.5 text-accent" /> 52-Week Highs / Lows
          </span>
          <span
            className={`text-xs font-mono font-bold px-2 py-0.5 rounded-full border ${
              isHighsDominant
                ? "bg-bull/10 border-bull/30 text-bull"
                : "bg-bear/10 border-bear/30 text-bear"
            }`}
          >
            {highsLows.ratio}x High/Low
          </span>
        </div>

        <div className="flex items-baseline justify-between">
          <div className="flex items-center gap-1.5 text-bull">
            <span className="text-2xl font-bold font-mono">
              +{highsLows.new_highs_52w}
            </span>
            <span className="text-xs text-muted-foreground font-medium">New Highs</span>
          </div>

          <div className="flex items-center gap-1.5 text-bear">
            <span className="text-2xl font-bold font-mono">
              -{highsLows.new_lows_52w}
            </span>
            <span className="text-xs text-muted-foreground font-medium">New Lows</span>
          </div>

          <div className="text-right">
            <span
              className={`text-xs font-mono font-bold ${
                highsLows.new_highs_52w - highsLows.new_lows_52w >= 0 ? "text-bull" : "text-bear"
              }`}
            >
              Net {highsLows.new_highs_52w - highsLows.new_lows_52w >= 0 ? "+" : ""}
              {highsLows.new_highs_52w - highsLows.new_lows_52w}
            </span>
          </div>
        </div>

        {/* Visual Balance Bar */}
        <div className="w-full bg-muted/40 h-2 rounded-full overflow-hidden flex">
          <div
            style={{
              width: `${(highsLows.new_highs_52w / Math.max(highsLows.new_highs_52w + highsLows.new_lows_52w, 1)) * 100}%`,
            }}
            className="bg-bull h-full rounded-l-full transition-all duration-500"
          />
          <div
            style={{
              width: `${(highsLows.new_lows_52w / Math.max(highsLows.new_highs_52w + highsLows.new_lows_52w, 1)) * 100}%`,
            }}
            className="bg-bear h-full rounded-r-full transition-all duration-500"
          />
        </div>
      </div>

      {/* Card 3: Average RVOL & Volume Flow */}
      <div className="p-5 rounded-2xl border border-border bg-card shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Volume2 className="h-3.5 w-3.5 text-accent" /> Volume Flow & RVOL
          </span>
          <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full border bg-accent/10 border-accent/30 text-accent">
            {volumeBreadth.avg_rvol}x RVOL
          </span>
        </div>

        <div className="flex items-baseline justify-between">
          <div>
            <div className="text-2xl font-bold font-mono text-foreground">
              {volumeBreadth.up_volume_ratio}x
            </div>
            <div className="text-xs text-muted-foreground font-medium">Up/Down Volume Ratio</div>
          </div>

          <div className="text-right">
            <div className="text-sm font-bold font-mono text-foreground">
              {volumeBreadth.avg_rvol}x
            </div>
            <div className="text-xs text-muted-foreground">Universe Avg RVOL</div>
          </div>
        </div>

        {/* Volume Flow Bar */}
        <div className="w-full bg-muted/40 h-2 rounded-full overflow-hidden flex">
          <div
            style={{
              width: `${Math.min(100, (volumeBreadth.up_volume_ratio / Math.max(volumeBreadth.up_volume_ratio + 1, 1)) * 100)}%`,
            }}
            className="bg-accent h-full rounded-full transition-all duration-500"
          />
        </div>
      </div>
    </div>
  );
}
