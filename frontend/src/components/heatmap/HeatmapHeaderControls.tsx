"use client";

import React from "react";
import { Layers } from "lucide-react";

interface HeatmapHeaderControlsProps {
  selectedIndex: string;
  onSelectIndex: (idx: string) => void;
  totalMarketCap: number;
  totalStocks: number;
  gainersCount: number;
  declinersCount: number;
}

export function HeatmapHeaderControls({
  selectedIndex,
  onSelectIndex,
  totalMarketCap,
  totalStocks,
  gainersCount,
  declinersCount,
}: HeatmapHeaderControlsProps) {
  const INDICES = ["NIFTY 50", "NIFTY NEXT 50", "NIFTY MIDCAP 100", "NIFTY 500"];

  // Format Market Cap to Lakh Crores
  const mcapLakhCr = (totalMarketCap / 100000).toFixed(2);

  return (
    <div className="space-y-4">
      {/* Index Selector Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-card border border-border">
        {/* Left: Index Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-muted/40 border border-border/60">
          {INDICES.map((idx) => (
            <button
              key={idx}
              onClick={() => onSelectIndex(idx)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedIndex === idx
                  ? "bg-card text-foreground shadow-sm border border-border"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {idx}
            </button>
          ))}
        </div>

        {/* Center/Right: Summary Pills & Color Scale Legend */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Market Cap & Stocks Pill */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/40 border border-border text-xs font-mono font-semibold">
            <span className="text-muted-foreground font-sans">Cap:</span>
            <span className="text-foreground">₹{mcapLakhCr} Lakh Cr</span>
            <span className="text-muted-foreground">({totalStocks} Stocks)</span>
          </div>

          {/* Gainers vs Decliners */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/40 border border-border text-xs font-mono font-semibold">
            <span className="text-bull">+{gainersCount} Gain</span>
            <span className="text-muted-foreground">/</span>
            <span className="text-bear">-{declinersCount} Dec</span>
          </div>

          {/* Color Scale Legend */}
          <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted/40 border border-border text-[11px] font-mono">
            <span className="text-bear font-bold">-3%</span>
            <div className="h-2.5 w-20 rounded-full bg-gradient-to-r from-[#EF4444] via-[#27272a] to-[#00E5FF]" />
            <span className="text-[#00E5FF] font-bold">+3%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
