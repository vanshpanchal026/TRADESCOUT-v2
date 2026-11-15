"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronUp, TrendingDown, TrendingUp } from "lucide-react";
import { QuarterlyMetric } from "@/lib/types";

interface EarningsStripProps {
  quarterly: QuarterlyMetric[];
}

export default function EarningsStrip({ quarterly }: EarningsStripProps) {
  const [collapsed, setCollapsed] = useState(false);

  if (!quarterly || quarterly.length === 0) return null;

  // Take the most recent 6-8 quarters and sort chronologically (oldest to newest)
  // Assuming the array may be ordered newest first, we reverse it to display like Scan The Chart (Q2 FY26 -> Q2 FY27)
  const isDescending =
    quarterly.length > 1 &&
    quarterly[0].quarter > quarterly[quarterly.length - 1].quarter;

  const quartersToDisplay = (
    isDescending ? [...quarterly].reverse() : [...quarterly]
  ).slice(-7); // Last 7 quarters

  const formatSales = (sales?: number | null) => {
    if (sales === null || sales === undefined) return "—";
    if (sales >= 1000) {
      return `₹${(sales / 1000).toFixed(1)}k Cr`;
    }
    return `₹${sales.toLocaleString("en-IN", { maximumFractionDigits: 0 })} Cr`;
  };

  const formatEPS = (eps?: number | null) => {
    if (eps === null || eps === undefined) return "—";
    return `₹${eps.toFixed(2)}`;
  };

  const renderGrowth = (yoy?: number | null) => {
    if (yoy === null || yoy === undefined) return null;
    const isPositive = yoy >= 0;
    return (
      <span
        className={`inline-flex items-center gap-0.5 text-[10px] font-mono font-bold tabular-nums ml-1.5 ${
          isPositive ? "text-emerald-400" : "text-rose-400"
        }`}
      >
        {isPositive ? "+" : ""}
        {yoy.toFixed(1)}%
      </span>
    );
  };

  return (
    <div className="w-full bg-card rounded-xl border border-border overflow-hidden shadow-xs backdrop-blur-md">
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-muted/40">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setCollapsed(!collapsed)}
            className="flex items-center gap-1.5 text-xs font-bold text-foreground hover:text-primary transition-colors cursor-pointer select-none"
          >
            {collapsed ? (
              <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
            ) : (
              <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" />
            )}
            <span>Earnings & Growth Snapshot</span>
          </button>
          <span className="text-[11px] text-muted-foreground font-medium">
            (Quarterly Performance · Consolidated)
          </span>
        </div>

        <div className="flex items-center gap-4 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-xs bg-emerald-500 inline-block" /> YoY Growth Positive
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-xs bg-rose-500 inline-block" /> YoY Decline
          </span>
        </div>
      </div>

      {/* Collapsible Earnings Table */}
      {!collapsed && (
        <div className="overflow-x-auto w-full no-scrollbar">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-border/80 bg-muted/20 text-muted-foreground font-semibold text-[11px]">
                <th className="py-2 px-4 w-32 font-medium tracking-wider uppercase">
                  Metric
                </th>
                {quartersToDisplay.map((q, idx) => (
                  <th
                    key={q.quarter || idx}
                    className="py-2 px-3 text-right font-mono font-bold text-foreground whitespace-nowrap"
                  >
                    {q.quarter}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40 font-mono text-xs">
              {/* EPS Row */}
              <tr className="hover:bg-white/[0.02] transition-colors">
                <td className="py-2.5 px-4 font-sans font-semibold text-foreground flex items-center gap-1.5">
                  <span className="text-primary font-bold">EPS</span>
                  <span className="text-[10px] text-muted-foreground font-normal">
                    (₹ / Share)
                  </span>
                </td>
                {quartersToDisplay.map((q, idx) => (
                  <td
                    key={q.quarter || idx}
                    className="py-2.5 px-3 text-right tabular-nums whitespace-nowrap"
                  >
                    <span className="font-bold text-foreground">
                      {formatEPS(q.eps)}
                    </span>
                    {renderGrowth(q.eps_yoy)}
                  </td>
                ))}
              </tr>

              {/* Sales Row */}
              <tr className="hover:bg-white/[0.02] transition-colors">
                <td className="py-2.5 px-4 font-sans font-semibold text-foreground flex items-center gap-1.5">
                  <span className="text-primary font-bold">Sales</span>
                  <span className="text-[10px] text-muted-foreground font-normal">
                    (₹ Cr)
                  </span>
                </td>
                {quartersToDisplay.map((q, idx) => (
                  <td
                    key={q.quarter || idx}
                    className="py-2.5 px-3 text-right tabular-nums whitespace-nowrap"
                  >
                    <span className="font-bold text-foreground">
                      {formatSales(q.sales)}
                    </span>
                    {renderGrowth(q.sales_yoy)}
                  </td>
                ))}
              </tr>

              {/* OPM % Row */}
              <tr className="hover:bg-white/[0.02] transition-colors">
                <td className="py-2.5 px-4 font-sans font-semibold text-foreground flex items-center gap-1.5">
                  <span className="text-muted-foreground font-bold">OPM %</span>
                  <span className="text-[10px] text-muted-foreground font-normal">
                    (Margin)
                  </span>
                </td>
                {quartersToDisplay.map((q, idx) => (
                  <td
                    key={q.quarter || idx}
                    className="py-2.5 px-3 text-right tabular-nums whitespace-nowrap"
                  >
                    <span
                      className={`font-semibold ${
                        (q.opm ?? 0) >= 15
                          ? "text-emerald-400"
                          : (q.opm ?? 0) < 0
                          ? "text-rose-400"
                          : "text-foreground"
                      }`}
                    >
                      {q.opm !== null && q.opm !== undefined
                        ? `${q.opm.toFixed(1)}%`
                        : "—"}
                    </span>
                  </td>
                ))}
              </tr>

              {/* Net Profit Row */}
              <tr className="hover:bg-white/[0.02] transition-colors">
                <td className="py-2.5 px-4 font-sans font-semibold text-foreground flex items-center gap-1.5">
                  <span className="text-muted-foreground font-bold">Net Profit</span>
                  <span className="text-[10px] text-muted-foreground font-normal">
                    (₹ Cr)
                  </span>
                </td>
                {quartersToDisplay.map((q, idx) => (
                  <td
                    key={q.quarter || idx}
                    className="py-2.5 px-3 text-right tabular-nums whitespace-nowrap"
                  >
                    <span className="font-semibold text-foreground">
                      {q.net_profit !== null && q.net_profit !== undefined
                        ? `₹${q.net_profit.toLocaleString("en-IN", {
                            maximumFractionDigits: 1,
                          })} Cr`
                        : "—"}
                    </span>
                    {renderGrowth(q.np_yoy)}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
