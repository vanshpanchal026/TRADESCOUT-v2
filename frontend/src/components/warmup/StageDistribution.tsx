"use client";

import React from "react";
import { StageDistribution as StageDistributionType } from "./types";
import { BarChart2, Flame } from "lucide-react";

interface StageDistributionProps {
  stages?: StageDistributionType;
  totalTraded?: number;
}

export function StageDistribution({
  stages = {
    stage_1_count: 340,
    stage_1_pct: 18.5,
    stage_2_count: 703,
    stage_2_pct: 38.2,
    stage_3_count: 260,
    stage_3_pct: 14.1,
    stage_4_count: 537,
    stage_4_pct: 29.2,
    stage_2_to_4_ratio: 1.31,
  },
  totalTraded = 1840,
}: StageDistributionProps) {
  const s1 = stages.stage_1_pct;
  const s2 = stages.stage_2_pct;
  const s3 = stages.stage_3_pct;
  const s4 = stages.stage_4_pct;

  return (
    <div className="p-4 rounded-xl border border-[#27272a] bg-[#1c1c2e] text-foreground flex flex-col justify-between shadow-xs">
      <div className="flex items-center justify-between pb-2 border-b border-[#27272a]/60">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
            <BarChart2 className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-semibold text-xs text-zinc-200 tracking-tight">Weinstein Stage Balance</h3>
            <p className="text-[11px] text-zinc-400">4-Stage market lifecycle breakdown</p>
          </div>
        </div>
        <span className="text-xs font-semibold px-2 py-0.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 tabular-nums">
          S2: {s2}%
        </span>
      </div>

      {/* 4-Stage Horizontal Distribution Bar */}
      <div className="py-2 space-y-2">
        <div className="h-3 w-full rounded-full bg-zinc-900 overflow-hidden flex border border-[#27272a]">
          <div
            style={{ width: `${s1}%` }}
            className="bg-amber-500 transition-all duration-500"
            title={`Stage 1 Base: ${s1}%`}
          />
          <div
            style={{ width: `${s2}%` }}
            className="bg-emerald-500 transition-all duration-500"
            title={`Stage 2 (Markup): ${s2}%`}
          />
          <div
            style={{ width: `${s3}%` }}
            className="bg-amber-600 transition-all duration-500"
            title={`Stage 3 Top: ${s3}%`}
          />
          <div
            style={{ width: `${s4}%` }}
            className="bg-rose-500 transition-all duration-500"
            title={`Stage 4 (Decline): ${s4}%`}
          />
        </div>

        {/* Legend */}
        <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-zinc-400">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              Stage 1 Base
            </span>
            <span className="font-semibold text-zinc-200 tabular-nums">{s1}%</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-zinc-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Stage 2 (Markup)
            </span>
            <span className="font-semibold text-emerald-400 tabular-nums">{s2}%</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-zinc-400">
              <span className="w-2 h-2 rounded-full bg-amber-600" />
              Stage 3 Top
            </span>
            <span className="font-semibold text-zinc-200 tabular-nums">{s3}%</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-zinc-400">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              Stage 4 (Decline)
            </span>
            <span className="font-semibold text-rose-400 tabular-nums">{s4}%</span>
          </div>
        </div>
      </div>

      {/* Breakout Health Ratio Sub-Card */}
      <div className="pt-2 border-t border-[#27272a]/60 flex items-center justify-between text-[11px]">
        <div className="flex items-center gap-1.5 text-zinc-300">
          <Flame className="h-3.5 w-3.5 text-amber-400" />
          <span>Breakout Health Ratio:</span>
        </div>
        <span className="font-semibold text-emerald-400 tabular-nums">
          24 held / 16 failed (60% success)
        </span>
      </div>
    </div>
  );
}

export default StageDistribution;
