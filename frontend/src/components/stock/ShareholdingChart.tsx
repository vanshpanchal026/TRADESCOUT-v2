"use client";

import React from "react";
import { StockFundamentals } from "@/lib/types";

interface ShareholdingChartProps {
  fundamentals: StockFundamentals;
}

export default function ShareholdingChart({ fundamentals }: ShareholdingChartProps) {
  const quarters = fundamentals.quarterly || [];
  const latest = quarters.length > 0 ? quarters[0] : null;

  const promoter = latest?.promoter_pct ?? fundamentals.promoter_pct ?? 50.0;
  const fii = latest?.fii_pct ?? fundamentals.fii_pct ?? 18.0;
  const dii = latest?.dii_pct ?? fundamentals.dii_pct ?? 16.0;
  const publicHolding = latest?.public_pct ?? fundamentals.public_pct ?? Math.max(0, 100 - (promoter + fii + dii));
  const institutionalHolding = +(fii + dii).toFixed(2);

  // Take last 8 quarters for trend view
  const recentQuarters = quarters.slice(0, 8);

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Current Shareholding Overview Card */}
      <div className="bg-card p-6 rounded-xl border border-border backdrop-blur-md">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
          <div>
            <h3 className="text-base font-semibold text-foreground">
              Shareholding Pattern & Institutional Footprint
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Latest reported quarter ({latest?.quarter || "Current"}) · Demat ownership distribution
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="px-3 py-1.5 rounded-lg border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 text-xs font-bold">
              Institutional Ownership (FII+DII): {institutionalHolding}%
            </div>
          </div>
        </div>

        {/* Stacked Proportional Bar (CSS-only, Zero SVG) */}
        <div className="w-full h-8 rounded-lg overflow-hidden flex bg-slate-950 border border-border p-1 gap-1">
          <div
            style={{ width: `${promoter}%` }}
            className="h-full bg-cyan-500 rounded flex items-center justify-center text-[11px] font-bold text-slate-950 transition-all duration-500"
            title={`Promoter: ${promoter.toFixed(2)}%`}
          >
            {promoter > 12 && `${promoter.toFixed(1)}%`}
          </div>
          <div
            style={{ width: `${fii}%` }}
            className="h-full bg-emerald-500 rounded flex items-center justify-center text-[11px] font-bold text-slate-950 transition-all duration-500"
            title={`FII: ${fii.toFixed(2)}%`}
          >
            {fii > 10 && `${fii.toFixed(1)}%`}
          </div>
          <div
            style={{ width: `${dii}%` }}
            className="h-full bg-purple-500 rounded flex items-center justify-center text-[11px] font-bold text-white transition-all duration-500"
            title={`DII: ${dii.toFixed(2)}%`}
          >
            {dii > 10 && `${dii.toFixed(1)}%`}
          </div>
          <div
            style={{ width: `${publicHolding}%` }}
            className="h-full bg-slate-600 rounded flex items-center justify-center text-[11px] font-bold text-foreground transition-all duration-500"
            title={`Public: ${publicHolding.toFixed(2)}%`}
          >
            {publicHolding > 10 && `${publicHolding.toFixed(1)}%`}
          </div>
        </div>

        {/* Legend */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
          <div className="p-3 rounded-lg bg-muted/40 border border-border/60">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-500" />
              <span className="text-xs text-muted-foreground font-medium">Promoter</span>
            </div>
            <span className="text-lg font-bold font-mono text-foreground">{promoter.toFixed(2)}%</span>
          </div>

          <div className="p-3 rounded-lg bg-muted/40 border border-border/60">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className="text-xs text-muted-foreground font-medium">FII (Foreign)</span>
            </div>
            <span className="text-lg font-bold font-mono text-emerald-400">{fii.toFixed(2)}%</span>
          </div>

          <div className="p-3 rounded-lg bg-muted/40 border border-border/60">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
              <span className="text-xs text-muted-foreground font-medium">DII (Domestic/MF)</span>
            </div>
            <span className="text-lg font-bold font-mono text-purple-400">{dii.toFixed(2)}%</span>
          </div>

          <div className="p-3 rounded-lg bg-muted/40 border border-border/60">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-500" />
              <span className="text-xs text-muted-foreground font-medium">Public / Retail</span>
            </div>
            <span className="text-lg font-bold font-mono text-foreground">{publicHolding.toFixed(2)}%</span>
          </div>
        </div>
      </div>

      {/* Quarterly Trend History Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden backdrop-blur-md">
        <div className="px-6 py-4 border-b border-border bg-muted/40">
          <h4 className="text-sm font-semibold text-foreground">
            Quarter-over-Quarter Shareholding Progression
          </h4>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-950/60 text-muted-foreground border-b border-border font-sans font-semibold">
              <tr>
                <th className="py-3 px-4">Period</th>
                <th className="py-3 px-4 text-right">Promoter %</th>
                <th className="py-3 px-4 text-right">FII %</th>
                <th className="py-3 px-4 text-right">DII %</th>
                <th className="py-3 px-4 text-right">Public %</th>
                <th className="py-3 px-4 text-right">Institutions (FII+DII)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-foreground">
              {recentQuarters.map((q, idx) => {
                const p = q.promoter_pct ?? promoter;
                const f = q.fii_pct ?? fii;
                const d = q.dii_pct ?? dii;
                const pub = q.public_pct ?? Math.max(0, 100 - (p + f + d));
                const inst = +(f + d).toFixed(2);

                return (
                  <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-4 font-sans font-semibold text-foreground">{q.quarter}</td>
                    <td className="py-3 px-4 text-right text-cyan-400 font-bold">{p.toFixed(2)}%</td>
                    <td className="py-3 px-4 text-right text-emerald-400 font-bold">{f.toFixed(2)}%</td>
                    <td className="py-3 px-4 text-right text-purple-400 font-bold">{d.toFixed(2)}%</td>
                    <td className="py-3 px-4 text-right text-muted-foreground">{pub.toFixed(2)}%</td>
                    <td className="py-3 px-4 text-right font-bold text-foreground">{inst.toFixed(2)}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
