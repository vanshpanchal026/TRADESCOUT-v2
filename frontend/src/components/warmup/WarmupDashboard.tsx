"use client";

import React, { useState } from "react";
import { WarmupData } from "./types";
import { ParticipationGauge } from "./ParticipationGauge";
import { RMESentimentMeter } from "./RMESentimentMeter";
import { StageDistributionBar } from "./StageDistributionBar";
import { BreadthSummaryCards } from "./BreadthSummaryCards";
import { PreMarketCuesCard } from "./PreMarketCuesCard";
import { EarningsHorizonTable } from "./EarningsHorizonTable";
import { IndicesMacroTicker } from "./IndicesMacroTicker";
import { FiiDiiCashFlowWidget } from "./FiiDiiCashFlowWidget";
import { MarketReadAndHighsLows } from "./MarketReadAndHighsLows";
import { TodaysSetupsTable } from "./TodaysSetupsTable";
import { ThemesAndEventsPanel } from "./ThemesAndEventsPanel";
import { RefreshCw, Zap, Sparkles } from "lucide-react";

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
    <div className="space-y-6">
      {/* Indices & Macro Ticker Strip with 50E / 200S MA Overlays */}
      <IndicesMacroTicker />

      {/* Action Sub-Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-card border border-border shadow-xs">
        <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
          <Zap className="h-4 w-4 text-primary" />
          <span>
            Universe: <strong className="text-foreground">{data.total_traded.toLocaleString()}</strong> active NSE equities analyzed in real-time.
          </span>
        </div>

        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary/10 border border-primary/30 text-primary hover:bg-primary/20 transition-all disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
          <span>Refresh Breadth Data</span>
        </button>
      </div>

      {/* Market Read Card & 20-Day Highs / Lows Net Ratio */}
      <MarketReadAndHighsLows />

      {/* FII / DII 22-Session Cash Flow Widget */}
      <FiiDiiCashFlowWidget />

      {/* Top Diagnostic Gauges Row (3 Core Cards: Participation, Sentiment, Stages) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
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

      {/* Today's Setups Table (VCP & Pivot Consolidations) */}
      <TodaysSetupsTable />

      {/* Themes & Money Flow + Today's Events Panel */}
      <ThemesAndEventsPanel />

      {/* Breadth Summary Cards Row */}
      <BreadthSummaryCards
        advanceDecline={data.advance_decline}
        highsLows={data.highs_lows_52w}
        volumeBreadth={data.volume_breadth}
      />

      {/* Pre-Market Cues and Catalysts */}
      <PreMarketCuesCard cues={data.pre_market_cues} />

      {/* Earnings Horizon Table */}
      <EarningsHorizonTable earnings={data.earnings_horizon} />
    </div>
  );
}

export default WarmupDashboard;
