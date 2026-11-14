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

interface WarmupDashboardProps {
  initialData: WarmupData;
}

export function WarmupDashboard({ initialData }: WarmupDashboardProps) {
  const [data, setData] = useState<WarmupData>(initialData);

  return (
    <div className="space-y-4 max-w-[1600px] mx-auto">
      {/* ================= 1. TOP FOLD: 3-COLUMN BENTO GRID ================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch">
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
      <DailyCues />

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
    </div>
  );
}

export default WarmupDashboard;
