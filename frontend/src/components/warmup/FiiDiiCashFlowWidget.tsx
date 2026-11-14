"use client";

import React, { useState } from "react";
import { ArrowUpRight, ArrowDownRight, BarChart2, Info } from "lucide-react";

export function FiiDiiCashFlowWidget() {
  const [hoveredSession, setHoveredSession] = useState<{ day: number; fii: number; dii: number } | null>(null);

  // 22-session institutional cash flow history (in ₹ Cr)
  const sessions = [
    { day: 1, fii: 1250, dii: -400 },
    { day: 2, fii: -890, dii: 1100 },
    { day: 3, fii: 2300, dii: -650 },
    { day: 4, fii: 3100, dii: 450 },
    { day: 5, fii: 1800, dii: -120 },
    { day: 6, fii: -1400, dii: 1850 },
    { day: 7, fii: 4200, dii: -900 },
    { day: 8, fii: 2900, dii: -300 },
    { day: 9, fii: 3800, dii: 600 },
    { day: 10, fii: -500, dii: 950 },
    { day: 11, fii: 5100, dii: -1500 },
    { day: 12, fii: 4600, dii: -1100 },
    { day: 13, fii: 3200, dii: 800 },
    { day: 14, fii: -2100, dii: 2400 },
    { day: 15, fii: 6200, dii: -1800 },
    { day: 16, fii: 4800, dii: -950 },
    { day: 17, fii: 5900, dii: -1400 },
    { day: 18, fii: 7100, dii: -2100 },
    { day: 19, fii: 3400, dii: 500 },
    { day: 20, fii: 6800, dii: -1900 },
    { day: 21, fii: 8200, dii: -2450 },
    { day: 22, fii: 5737, dii: -2254 }, // Current session
  ];

  const maxVal = 9000;

  return (
    <div className="p-5 rounded-2xl bg-card border border-border shadow-xs space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
            <BarChart2 className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground">FII / DII Cash Flow Widget</h3>
            <p className="text-[11px] text-muted-foreground">22-Session Institutional Net Activity</p>
          </div>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-bull/10 text-bull border border-bull/20 font-semibold">
          FII Accumulation Regime
        </span>
      </div>

      {/* Top 3 Summary Cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-3 rounded-xl bg-background border border-border/80">
          <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold block">
            Session FII
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-base font-bold font-mono text-bull">+₹5,737 Cr</span>
            <ArrowUpRight className="h-3.5 w-3.5 text-bull" />
          </div>
          <span className="text-[10px] text-muted-foreground">Net Cash Buying</span>
        </div>

        <div className="p-3 rounded-xl bg-background border border-border/80">
          <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold block">
            1-Month Net Aggregate
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-base font-bold font-mono text-bull">+₹76,933 Cr</span>
            <ArrowUpRight className="h-3.5 w-3.5 text-bull" />
          </div>
          <span className="text-[10px] text-muted-foreground">Rolling 22-Day Net</span>
        </div>

        <div className="p-3 rounded-xl bg-background border border-border/80">
          <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold block">
            Session DII
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-base font-bold font-mono text-bear">-₹2,254 Cr</span>
            <ArrowDownRight className="h-3.5 w-3.5 text-bear" />
          </div>
          <span className="text-[10px] text-muted-foreground">Net Domestic Outflow</span>
        </div>
      </div>

      {/* 22-Session Bar Chart Visualizer */}
      <div className="space-y-2 pt-1">
        <div className="flex items-center justify-between text-[11px] text-muted-foreground">
          <span>Historical 22-Day Net Institutional Flows (FII = Blue, DII = Amber)</span>
          {hoveredSession ? (
            <span className="font-mono text-foreground font-semibold">
              Day {hoveredSession.day}: FII{" "}
              <strong className={hoveredSession.fii >= 0 ? "text-bull" : "text-bear"}>
                {hoveredSession.fii >= 0 ? `+₹${hoveredSession.fii}` : `-₹${Math.abs(hoveredSession.fii)}`} Cr
              </strong>
              {" | "}
              DII{" "}
              <strong className={hoveredSession.dii >= 0 ? "text-bull" : "text-bear"}>
                {hoveredSession.dii >= 0 ? `+₹${hoveredSession.dii}` : `-₹${Math.abs(hoveredSession.dii)}`} Cr
              </strong>
            </span>
          ) : (
            <span className="text-[10px] italic">Hover bars to inspect daily values</span>
          )}
        </div>

        <div className="h-28 flex items-end gap-1.5 p-3 rounded-xl bg-background border border-border/80">
          {sessions.map((s) => {
            const fiiHeight = Math.max(8, (Math.abs(s.fii) / maxVal) * 80);
            const isFiiPositive = s.fii >= 0;
            return (
              <div
                key={s.day}
                onMouseEnter={() => setHoveredSession(s)}
                onMouseLeave={() => setHoveredSession(null)}
                className="flex-1 flex flex-col justify-end items-center h-full group cursor-pointer relative"
              >
                <div
                  style={{ height: `${fiiHeight}%` }}
                  className={`w-full rounded-t transition-all ${
                    isFiiPositive
                      ? "bg-primary group-hover:bg-primary/80"
                      : "bg-bear group-hover:bg-bear/80"
                  } ${s.day === 22 ? "ring-2 ring-primary ring-offset-1 ring-offset-background" : ""}`}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default FiiDiiCashFlowWidget;
