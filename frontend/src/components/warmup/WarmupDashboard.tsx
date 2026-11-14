"use client";

import React, { useState } from "react";
import { WarmupData } from "./types";
import { WarmupMarketConditionBento } from "./WarmupMarketConditionBento";
import { TodaysSetupsTable } from "./TodaysSetupsTable";
import { WarmupOrdersTimeline } from "./WarmupOrdersTimeline";
import { ThemesAndEventsPanel } from "./ThemesAndEventsPanel";
import { ParticipationGauge } from "./ParticipationGauge";
import { RMESentimentMeter } from "./RMESentimentMeter";
import { StageDistributionBar } from "./StageDistributionBar";
import { RefreshCw, Zap } from "lucide-react";

interface WarmupDashboardProps {
  initialData: WarmupData;
}

export function WarmupDashboard({ initialData }: WarmupDashboardProps) {
  const [data, setData] = useState<WarmupData>(initialData);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      const res = await fetch("/api/market/warmup");
      if (res.ok) {
        const freshData: WarmupData = await res.json();
        setData(freshData);
      }
    } catch {
      // Keep existing data on error
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="space-y-4 max-w-[1600px] mx-auto">
      {/* ================= TOP BENTO: MARKET CONDITION & INDICES TICKER ================= */}
      <WarmupMarketConditionBento />

      {/* ================= MAIN 2-COLUMN BENTO GRID ================= */}
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

      {/* ================= COMPLEMENTARY DIAGNOSTIC GAUGES ROW ================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
        <ParticipationGauge
          participation={data.market_participation}
          totalTraded={data.total_traded}
        />
        <RMESentimentMeter rme={data.rme_sentiment} />
        <StageDistributionBar
          stages={data.stage_distribution}
          totalTraded={data.total_traded}
        />
      </div>
    </div>
  );
}

export default WarmupDashboard;