"use client";

import React, { useState } from "react";
import { RRGData, RRGItem } from "./types";
import { RRGHeaderControls } from "./RRGHeaderControls";
import { RRGChart } from "./RRGChart";
import { RRGTable } from "./RRGTable";
import { RefreshCw } from "lucide-react";

interface RRGDashboardProps {
  initialData: RRGData;
}

export function RRGDashboard({ initialData }: RRGDashboardProps) {
  const [data, setData] = useState<RRGData>(initialData);
  const [group, setGroup] = useState<"sectors" | "top-momentum">(
    initialData.group === "top-momentum" ? "top-momentum" : "sectors"
  );
  const [benchmark, setBenchmark] = useState<string>(initialData.benchmark || "NIFTY 50");
  const [trailLength, setTrailLength] = useState<5 | 10 | 20>(10);
  const [highlightSymbol, setHighlightSymbol] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchRRGData = async (newGroup: "sectors" | "top-momentum", newBench: string) => {
    try {
      setIsLoading(true);
      const res = await fetch(
        `/api/market/rrg?benchmark=${encodeURIComponent(newBench)}&group=${newGroup}`
      );
      if (res.ok) {
        const fresh: RRGData = await res.json();
        setData(fresh);
      }
    } catch {
      // Keep existing data
    } finally {
      setIsLoading(false);
    }
  };

  const handleGroupChange = (newGroup: "sectors" | "top-momentum") => {
    setGroup(newGroup);
    setHighlightSymbol(null);
    fetchRRGData(newGroup, benchmark);
  };

  const handleBenchmarkChange = (newBench: string) => {
    setBenchmark(newBench);
    fetchRRGData(group, newBench);
  };

  return (
    <div className="space-y-6">
      {/* Interactive Controls & Quadrant Metrics */}
      <RRGHeaderControls
        group={group}
        onGroupChange={handleGroupChange}
        benchmark={benchmark}
        onBenchmarkChange={handleBenchmarkChange}
        trailLength={trailLength}
        onTrailLengthChange={setTrailLength}
        quadrantCounts={data.quadrant_counts}
      />

      {/* Main RRG Interactive Canvas Chart */}
      <div className="relative">
        {isLoading && (
          <div className="absolute inset-0 bg-background/60 backdrop-blur-xs flex items-center justify-center z-20 rounded-2xl">
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-card border border-border shadow-lg">
              <RefreshCw className="h-4 w-4 animate-spin text-accent" />
              <span className="text-xs font-semibold">Calculating Vectorized Rotation...</span>
            </div>
          </div>
        )}

        <RRGChart
          items={data.items}
          trailLength={trailLength}
          highlightSymbol={highlightSymbol}
          onSelectSymbol={setHighlightSymbol}
        />
      </div>

      {/* RRG Rankings Data Table */}
      <RRGTable
        items={data.items}
        highlightSymbol={highlightSymbol}
        onHoverSymbol={setHighlightSymbol}
      />
    </div>
  );
}
