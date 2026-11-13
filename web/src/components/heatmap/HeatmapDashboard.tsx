"use client";

import React, { useMemo, useState } from "react";
import { HeatmapData } from "./types";
import { HeatmapHeaderControls } from "./HeatmapHeaderControls";
import { HeatmapTreemap } from "./HeatmapTreemap";
import { RefreshCw } from "lucide-react";

interface HeatmapDashboardProps {
  initialData: HeatmapData;
}

export function HeatmapDashboard({ initialData }: HeatmapDashboardProps) {
  const [data, setData] = useState<HeatmapData>(initialData);
  const [selectedIndex, setSelectedIndex] = useState<string>(initialData.index || "NIFTY 50");
  const [isLoading, setIsLoading] = useState(false);

  // Compute gainers vs decliners across all constituent stocks
  const { totalStocks, gainersCount, declinersCount } = useMemo(() => {
    let total = 0;
    let gainers = 0;
    let decliners = 0;

    data.sectors.forEach((sec) => {
      sec.stocks.forEach((stk) => {
        total++;
        if (stk.change_1d > 0) gainers++;
        else if (stk.change_1d < 0) decliners++;
      });
    });

    return { totalStocks: total, gainersCount: gainers, declinersCount: decliners };
  }, [data]);

  const handleSelectIndex = async (newIndex: string) => {
    if (newIndex === selectedIndex) return;
    setSelectedIndex(newIndex);
    try {
      setIsLoading(true);
      const res = await fetch(`/api/market/heatmap?index=${encodeURIComponent(newIndex)}`);
      if (res.ok) {
        const fresh: HeatmapData = await res.json();
        setData(fresh);
      }
    } catch {
      // Keep existing data on error
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Index Controls & Legend Bar */}
      <HeatmapHeaderControls
        selectedIndex={selectedIndex}
        onSelectIndex={handleSelectIndex}
        totalMarketCap={data.total_market_cap}
        totalStocks={totalStocks}
        gainersCount={gainersCount}
        declinersCount={declinersCount}
      />

      {/* Main Treemap Canvas */}
      <div className="relative">
        {isLoading && (
          <div className="absolute inset-0 bg-background/60 backdrop-blur-xs flex items-center justify-center z-20 rounded-2xl">
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-card border border-border shadow-lg">
              <RefreshCw className="h-4 w-4 animate-spin text-accent" />
              <span className="text-xs font-semibold">Generating Treemap Hierarchy...</span>
            </div>
          </div>
        )}

        <HeatmapTreemap
          sectors={data.sectors}
          totalMarketCap={data.total_market_cap}
        />
      </div>

      {/* Sector Performance Leaderboard Ribbon */}
      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-3">
        <h3 className="font-semibold text-sm tracking-tight text-foreground">
          Sector Market Weights & Performance
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {data.sectors.map((sec) => {
            const isPos = sec.change_1d >= 0;
            return (
              <div
                key={sec.name}
                className="p-3 rounded-xl border border-border/70 bg-muted/20 hover:border-accent/40 transition-colors"
              >
                <div className="text-[11px] font-bold text-foreground truncate" title={sec.name}>
                  {sec.name}
                </div>
                <div className="text-xs text-muted-foreground font-mono mt-0.5">
                  Weight: {sec.weight_pct}%
                </div>
                <div
                  className={`text-sm font-bold font-mono mt-1 ${
                    isPos ? "text-bull" : "text-bear"
                  }`}
                >
                  {isPos ? "+" : ""}
                  {sec.change_1d}%
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
