"use client";

import React, { useState } from "react";
import { WarmupData } from "./types";
import { RMEMeter } from "./RMEMeter";
import { BreadthGauge } from "./BreadthGauge";
import { StageDistribution } from "./StageDistribution";
import { DailyCues } from "./DailyCues";
import { TodaysSetupsTable } from "./TodaysSetupsTable";
import { WarmupOrdersTimeline } from "./WarmupOrdersTimeline";
import { ThemesAndEventsPanel } from "./ThemesAndEventsPanel";
import { WarmupMarketConditionBento } from "./WarmupMarketConditionBento";
import { ShieldCheck, Clock, Radio } from "lucide-react";

interface WarmupDashboardProps {
  initialData: WarmupData;
}

export function WarmupDashboard({ initialData }: WarmupDashboardProps) {
  const [data, setData] = useState<WarmupData>(initialData);

  return (
    <div className="space-y-4 max-w-[1600px] mx-auto font-sans">
      {/* ================= HEADER BAR / STATUS RIBBON ================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-1 border-b border-[#27272a]/60">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-white tracking-tight">Pre-Market Warmup</h1>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 tabular-nums">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
              {data.market_status || "PRE-MARKET"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs text-zinc-400 font-mono">
          <div className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-zinc-500" />
            <span className="tabular-nums">Date: {data.date || "15 Nov 2026"}</span>
          </div>
          <span className="text-zinc-600">•</span>
          <div className="flex items-center gap-1.5">
            <Radio className="h-3.5 w-3.5 text-primary" />
            <span className="tabular-nums">Synced: {data.last_synced || "08:45 AM IST"}</span>
          </div>
          <span className="text-zinc-600">•</span>
          <span className="tabular-nums font-semibold text-zinc-300">
            {data.total_traded?.toLocaleString() ?? "1,840"} Universe
          </span>
        </div>
      </div>

      {/* ================= 1. TOP FOLD: 3-COLUMN BENTO GRID ================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch animate-slide">
        <RMEMeter rme={data.rme_sentiment} />
        <BreadthGauge
          participation={data.market_participation}
          totalTraded={data.total_traded}
        />
        <StageDistribution
          stages={data.stage_distribution}
          totalTraded={data.total_traded}
        />
      </div>

      {/* ================= 2. DAILY CUES & NIFTY 50 MINI-CHART ================= */}
      <DailyCues cues={data.pre_market_cues} />

      {/* ================= 3. MARKET CONDITION & INDICES TICKER ================= */}
      <WarmupMarketConditionBento />

      {/* ================= 4. MAIN 2-COLUMN BENTO GRID ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Left Column (~65% width): Today's setups, Watchlist plan, Orders timeline */}
        <div className="lg:col-span-8 space-y-4">
          <TodaysSetupsTable />
          <WarmupOrdersTimeline />
        </div>

        {/* Right Column (~35% width): Where the money is (Themes) & Today's events */}
        <div className="lg:col-span-4 space-y-4">
          <ThemesAndEventsPanel />
        </div>
      </div>

      {/* ================= 5. MANDATORY SEBI REGULATORY FOOTER ================= */}
      <div className="pt-2">
        <div className="p-3 rounded-xl border border-[#27272a] bg-[#141420]/80 text-center flex items-center justify-center gap-2 text-xs text-zinc-400">
          <ShieldCheck className="h-4 w-4 text-zinc-500 shrink-0" />
          <span>
            <strong className="text-zinc-300 font-semibold">Regulatory Notice:</strong> TRADESCOUT is an educational research platform, not a SEBI-registered advisory. Market investments are subject to risk.
          </span>
        </div>
      </div>
    </div>
  );
}

export default WarmupDashboard;
