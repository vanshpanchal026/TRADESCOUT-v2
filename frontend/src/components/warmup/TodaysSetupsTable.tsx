"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Copy, Check, ArrowRight, Sparkles, Filter, ExternalLink } from "lucide-react";

export function TodaysSetupsTable() {
  const [copied, setCopied] = useState(false);

  const setups = [
    {
      symbol: "MMFL",
      name: "MM Forgings Ltd",
      pattern: "Volatility Contraction (VCP)",
      timeframe: "Daily",
      trigger: "Buy Above ₹1,120",
      target: "₹1,280",
      stopLoss: "₹1,065",
      stage: "Stage 2 Markup",
      rsRating: 94,
    },
    {
      symbol: "SANATHAN",
      name: "Sanathan Textiles Ltd",
      pattern: "High Tight Flag Breakout",
      timeframe: "Daily",
      trigger: "Buy Above ₹485",
      target: "₹560",
      stopLoss: "₹455",
      stage: "Stage 2 Markup",
      rsRating: 91,
    },
    {
      symbol: "TCS",
      name: "Tata Consultancy Services",
      pattern: "Bullish Flat Base Pivot",
      timeframe: "Daily",
      trigger: "Buy Above ₹4,200",
      target: "₹4,550",
      stopLoss: "₹4,080",
      stage: "Stage 2 Markup",
      rsRating: 88,
    },
    {
      symbol: "RELIANCE",
      name: "Reliance Industries Ltd",
      pattern: "Cup with Handle Pivot",
      timeframe: "Daily",
      trigger: "Buy Above ₹3,020",
      target: "₹3,300",
      stopLoss: "₹2,920",
      stage: "Stage 2 Markup",
      rsRating: 86,
    },
    {
      symbol: "INFY",
      name: "Infosys Ltd",
      pattern: "20-EMA Pullback Reversal",
      timeframe: "Daily",
      trigger: "Buy Above ₹1,885",
      target: "₹2,050",
      stopLoss: "₹1,820",
      stage: "Stage 2 Markup",
      rsRating: 84,
    },
    {
      symbol: "HDFCBANK",
      name: "HDFC Bank Ltd",
      pattern: "Ascending Triangle Breakout",
      timeframe: "Daily",
      trigger: "Buy Above ₹1,760",
      target: "₹1,920",
      stopLoss: "₹1,710",
      stage: "Stage 2 Markup",
      rsRating: 82,
    },
  ];

  const handleCopyTradingView = () => {
    const symbolsText = setups.map((s) => `NSE:${s.symbol}`).join(", ");
    navigator.clipboard.writeText(symbolsText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-5 rounded-2xl bg-card border border-border shadow-xs space-y-4">
      {/* Header and Action controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground">Today&apos;s Setups</h3>
            <p className="text-[11px] text-muted-foreground">
              Curated stocks forming Volatility Contraction Patterns (VCP) or consolidating near major technical pivots
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopyTradingView}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-semibold shadow-xs transition-colors"
          >
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            <span>{copied ? "Copied to Clipboard!" : "Copy to TradingView"}</span>
          </button>

          <Link
            href="/scanners/trend-template"
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-border bg-background hover:bg-muted text-xs font-semibold text-primary transition-colors"
          >
            <span>Open in Scanner -&gt;</span>
          </Link>
        </div>
      </div>

      {/* Table view */}
      <div className="overflow-x-auto border border-border rounded-xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border bg-muted/40 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              <th className="p-3">Symbol</th>
              <th className="p-3">Pattern</th>
              <th className="p-3">Timeframe</th>
              <th className="p-3">Triggers</th>
              <th className="p-3">Target</th>
              <th className="p-3">RS Rating</th>
              <th className="p-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border text-xs">
            {setups.map((s) => (
              <tr key={s.symbol} className="hover:bg-muted/30 transition-colors">
                <td className="p-3 font-semibold text-foreground">
                  <Link href={`/stock/${s.symbol}`} className="hover:text-primary transition-colors flex items-center gap-1.5 font-mono">
                    <span>{s.symbol}</span>
                    <span className="text-[10px] text-muted-foreground font-sans font-normal truncate max-w-[120px] hidden sm:inline">
                      {s.name}
                    </span>
                  </Link>
                </td>
                <td className="p-3 text-foreground font-medium">
                  <span className="px-2 py-0.5 rounded-md bg-muted text-[11px] font-medium border border-border">
                    {s.pattern}
                  </span>
                </td>
                <td className="p-3 text-muted-foreground font-mono">{s.timeframe}</td>
                <td className="p-3 font-semibold text-bull font-mono">{s.trigger}</td>
                <td className="p-3 text-foreground font-mono">{s.target}</td>
                <td className="p-3 font-mono">
                  <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 font-bold text-[11px]">
                    ★ {s.rsRating}
                  </span>
                </td>
                <td className="p-3 text-right">
                  <Link
                    href={`/stock/${s.symbol}`}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline"
                  >
                    <span>Analyze Chart</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default TodaysSetupsTable;
