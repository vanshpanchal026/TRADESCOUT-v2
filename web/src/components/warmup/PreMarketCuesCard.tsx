"use client";

import React from "react";
import { PreMarketCues } from "./types";
import { Compass, Globe, Sparkles } from "lucide-react";

interface PreMarketCuesCardProps {
  cues: PreMarketCues;
}

export function PreMarketCuesCard({ cues }: PreMarketCuesCardProps) {
  const isGiftNiftyPositive = cues.gift_nifty.change_pts >= 0;

  return (
    <div className="p-6 rounded-2xl border border-border bg-card shadow-sm space-y-5">
      {/* Header & Bias Tag */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-border/60">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-accent/10 text-accent">
            <Compass className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-semibold text-sm tracking-tight">Pre-Market Horizon & Cues</h3>
            <p className="text-xs text-muted-foreground">Global market linkages, overnight catalysts, and Gift Nifty bias</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Gift Nifty Pill */}
          <div
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold border ${
              isGiftNiftyPositive
                ? "bg-bull/10 border-bull/30 text-bull"
                : "bg-bear/10 border-bear/30 text-bear"
            }`}
          >
            <span>Gift Nifty: {cues.gift_nifty.value.toLocaleString()}</span>
            <span>
              ({isGiftNiftyPositive ? "+" : ""}
              {cues.gift_nifty.change_pts} / {isGiftNiftyPositive ? "+" : ""}
              {cues.gift_nifty.change_pct}%)
            </span>
          </div>

          {/* Sentiment Badge */}
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-accent/15 border border-accent/30 text-accent">
            {cues.sentiment} Bias
          </span>
        </div>
      </div>

      {/* Strategic Executive Summary */}
      <div className="p-3.5 rounded-xl bg-muted/30 border border-border/60 flex items-start gap-3">
        <Sparkles className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
        <p className="text-xs text-muted-foreground leading-relaxed font-medium">
          {cues.summary}
        </p>
      </div>

      {/* Global Asset & Index Cue Tickers */}
      <div>
        <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
          <Globe className="h-3.5 w-3.5 text-accent" /> Overnight Global Indicators
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {cues.global_markets.map((m) => {
            const isPos = m.change_pct >= 0;
            return (
              <div
                key={m.name}
                className="p-2.5 rounded-xl bg-card border border-border/70 hover:border-accent/40 transition-colors"
              >
                <div className="text-[11px] font-medium text-muted-foreground truncate">{m.name}</div>
                <div className="text-sm font-bold font-mono text-foreground mt-0.5">
                  {m.value.toLocaleString()}
                </div>
                <div
                  className={`text-[10px] font-mono font-semibold flex items-center gap-0.5 ${
                    isPos ? "text-bull" : "text-bear"
                  }`}
                >
                  {isPos ? "+" : ""}
                  {m.change_pct}%
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Macro & Catalysts Feed */}
      <div className="space-y-2 pt-1">
        <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Domestic Macro & Market Catalysts
        </div>
        <ul className="space-y-1.5">
          {cues.macro_catalysts.map((cat, idx) => (
            <li
              key={idx}
              className="text-xs text-muted-foreground flex items-start gap-2 leading-relaxed"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-accent mt-1.5 flex-shrink-0" />
              <span>{cat}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
