"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Zap,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  ChevronRight,
  Activity,
  Layers,
  Sparkles,
} from "lucide-react";

export default function IntradayPage() {
  const [activeTab, setActiveTab] = useState<"sectors" | "themes">("sectors");

  const indicesMacro = [
    { name: "Nifty 50", ticker: "NIFTY", value: "25,144.30", change: "0.00%", isUp: true },
    { name: "Midcap 150", ticker: "MIDCAP150", value: "22,681.25", change: "0.00%", isUp: true },
    { name: "Smallcap 250", ticker: "SMLCAP250", value: "17,940.55", change: "0.00%", isUp: true },
    { name: "US Oil", ticker: "WTI", value: "68.56 USD", change: "-0.20%", isUp: false },
    { name: "USD/INR", ticker: "USDINR", value: "84.24 INR", change: "+0.21%", isUp: true },
  ];

  const moreScreens = [
    { name: "Strong start", count: 0 },
    { name: "Gap up & sustain", count: 0 },
    { name: "Opening range breakout", count: 0 },
    { name: "Recovering from day low", count: 0 },
    { name: "Up 4% on volume", count: 0 },
    { name: "Near 52W high", count: 0 },
    { name: "Near 52W low", count: 0 },
  ];

  const sectorsCol1 = [
    { name: "Auto & Components", change: "0.00%", upCount: "0/90" },
    { name: "Capital Goods", change: "0.00%", upCount: "0/261" },
    { name: "Chemicals", change: "0.00%", upCount: "0/105" },
    { name: "Construction", change: "0.00%", upCount: "0/53" },
    { name: "Construction Materials", change: "0.00%", upCount: "0/22" },
    { name: "Consumer Durables", change: "0.00%", upCount: "0/81" },
    { name: "Consumer Services", change: "0.00%", upCount: "0/72" },
    { name: "Diversified", change: "0.00%", upCount: "0/5" },
  ];

  const sectorsCol2 = [
    { name: "FMCG", change: "0.00%", upCount: "0/91" },
    { name: "Financial Services", change: "0.00%", upCount: "0/170" },
    { name: "Forest Materials", change: "0.00%", upCount: "0/6" },
    { name: "Healthcare", change: "0.00%", upCount: "0/137" },
    { name: "IT", change: "0.00%", upCount: "0/80" },
    { name: "Media & Entertainment", change: "0.00%", upCount: "0/15" },
    { name: "Metals & Mining", change: "0.00%", upCount: "0/42" },
    { name: "Oil & Gas", change: "0.00%", upCount: "0/37" },
  ];

  const sectorsCol3 = [
    { name: "Power", change: "0.00%", upCount: "0/28" },
    { name: "Realty", change: "0.00%", upCount: "0/40" },
    { name: "Services", change: "0.00%", upCount: "0/62" },
    { name: "Telecom", change: "0.00%", upCount: "0/19" },
    { name: "Textiles", change: "0.00%", upCount: "0/47" },
    { name: "Unclassified", change: "0.00%", upCount: "0/14" },
    { name: "Utilities", change: "0.00%", upCount: "0/8" },
  ];

  return (
    <div className="min-h-screen p-3 sm:p-5 lg:p-6 max-w-[1600px] mx-auto space-y-4">
      {/* ================= TOP 3 BENTO CARDS (Screenshot 10) ================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* CARD 1: INDICES & MACRO */}
        <div className="rounded-2xl bg-card border border-border/80 shadow-xs p-4 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-border/60">
            <h3 className="text-xs font-bold text-foreground">Indices &amp; macro</h3>
            <Link
              href="/markets?tab=major-indices"
              className="text-[11px] font-semibold text-primary hover:underline flex items-center gap-0.5"
            >
              <span>See all</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="space-y-2">
            {indicesMacro.map((idx) => (
              <div key={idx.name} className="flex items-center justify-between text-xs">
                <div>
                  <span className="font-semibold text-foreground block">{idx.name}</span>
                  <span className="text-[10px] text-muted-foreground font-mono">{idx.ticker}</span>
                </div>
                <div className="text-right font-mono">
                  <div className="font-bold text-foreground">{idx.value}</div>
                  <div
                    className={`text-[11px] font-bold ${
                      idx.change.startsWith("+")
                        ? "text-bull"
                        : idx.change.startsWith("-")
                        ? "text-rose-500"
                        : "text-muted-foreground"
                    }`}
                  >
                    {idx.change}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CARD 2: TOP GAINERS & HIGH VOLUME DAY */}
        <div className="rounded-2xl bg-card border border-border/80 shadow-xs p-4 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-border/60">
              <h3 className="text-xs font-bold text-foreground flex items-center gap-1">
                <span>Top gainers</span>
                <ChevronRight className="h-3 w-3" />
              </h3>
              <span className="text-[10px] text-muted-foreground font-mono">0 stocks</span>
            </div>
            <div className="text-center py-6 text-xs text-muted-foreground">
              No stocks on this list yet today.
            </div>
          </div>

          <div className="pt-3 border-t border-border/60 space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-foreground flex items-center gap-1">
                <span>High volume day</span>
                <ChevronRight className="h-3 w-3" />
              </h4>
              <span className="text-[10px] text-muted-foreground font-mono">
                0 stocks • up today, proj. RVol &ge; 200%
              </span>
            </div>
            <div className="text-center py-4 text-xs text-muted-foreground">
              No stocks on this list yet today.
            </div>
          </div>
        </div>

        {/* CARD 3: TOP LOSERS & MORE SCREENS */}
        <div className="rounded-2xl bg-card border border-border/80 shadow-xs p-4 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-border/60">
            <h3 className="text-xs font-bold text-foreground flex items-center gap-1">
              <span>Top losers</span>
              <ChevronRight className="h-3 w-3" />
            </h3>
            <span className="text-[10px] text-muted-foreground font-mono">0 stocks</span>
          </div>
          <div className="text-center py-2 text-xs text-muted-foreground">
            No stocks on this list yet today.
          </div>

          {/* More Screens Section */}
          <div className="pt-2 border-t border-border/60 space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-bold text-foreground mb-1">
              <span>More screens</span>
              <span className="text-[10px] text-muted-foreground">Stocks</span>
            </div>
            {moreScreens.map((screen) => (
              <div
                key={screen.name}
                className="flex items-center justify-between text-xs py-0.5 hover:text-primary transition-colors cursor-pointer"
              >
                <span className="text-muted-foreground hover:text-foreground">{screen.name}</span>
                <div className="flex items-center gap-1 font-mono text-[11px] text-muted-foreground">
                  <span>{screen.count}</span>
                  <ChevronRight className="h-3 w-3" />
                </div>
              </div>
            ))}

            <Link
              href="/scanners/trend-template"
              className="mt-2 block w-full py-2 text-center text-xs font-semibold rounded-xl bg-slate-100 dark:bg-muted/60 text-foreground hover:bg-primary/10 hover:text-primary transition-all border border-border/60"
            >
              All intraday screens &rarr;
            </Link>
          </div>
        </div>
      </div>

      {/* ================= MIDDLE BENTO: BREADTH & WATCHLIST ================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Breadth Card */}
        <div className="md:col-span-2 rounded-2xl bg-card border border-border/80 shadow-xs p-4 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-border/60">
            <span className="text-xs font-bold text-foreground">Breadth</span>
            <span className="text-[10px] font-mono text-muted-foreground">1,486 liquid stocks</span>
          </div>

          <div className="space-y-3 text-xs">
            {/* Advancers vs Decliners */}
            <div className="flex items-center justify-between font-mono text-[11px]">
              <span className="text-primary font-bold">0 Advancers</span>
              <span className="text-rose-500 font-bold">Decliners 0</span>
            </div>

            {/* 20D Highs vs Lows Bar */}
            <div className="space-y-1">
              <div className="flex justify-between font-mono text-[11px]">
                <span className="text-primary font-bold">211 20D highs</span>
                <span className="text-rose-500 font-bold">20D lows 30</span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-muted overflow-hidden flex">
                <div style={{ width: "87.5%" }} className="bg-primary h-full" />
                <div style={{ width: "12.5%" }} className="bg-rose-500 h-full" />
              </div>
            </div>

            {/* VWAP Positioning Bar */}
            <div className="space-y-1">
              <div className="flex justify-between font-mono text-[11px]">
                <span className="text-primary font-bold">568 Above VWAP</span>
                <span className="text-rose-500 font-bold">Below VWAP 917</span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-muted overflow-hidden flex">
                <div style={{ width: "38.2%" }} className="bg-primary h-full" />
                <div style={{ width: "61.8%" }} className="bg-rose-500 h-full" />
              </div>
            </div>
          </div>
        </div>

        {/* Your Watchlist Today Card */}
        <div className="rounded-2xl bg-card border border-border/80 shadow-xs p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-border/60">
              <span className="text-xs font-bold text-foreground">Your watchlist today</span>
              <Link
                href="/watchlists"
                className="text-[11px] font-semibold text-primary hover:underline flex items-center gap-0.5"
              >
                <span>Open</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <p className="text-xs text-muted-foreground pt-4 text-center">
              Star stocks or build a watchlist to see them here.
            </p>
          </div>
        </div>
      </div>

      {/* ================= BOTTOM BENTO: SECTORS TODAY (Screenshot 10) ================= */}
      <div className="rounded-2xl bg-card border border-border/80 shadow-xs p-4 sm:p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-border/60">
          <div>
            <h3 className="text-xs font-bold text-foreground flex items-center gap-1">
              <span>Sectors today</span>
              <ChevronRight className="h-3 w-3" />
            </h3>
            <span className="text-[10px] text-muted-foreground block mt-0.5">
              23 sectors • average of liquid stocks • up / total
            </span>
          </div>

          <div className="flex items-center gap-1 text-[10px] font-mono">
            <button
              onClick={() => setActiveTab("sectors")}
              className={`px-2 py-1 rounded-lg font-semibold transition-all ${
                activeTab === "sectors"
                  ? "bg-primary text-white shadow-xs"
                  : "bg-slate-100 dark:bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              Sectors
            </button>
            <button
              onClick={() => setActiveTab("themes")}
              className={`px-2 py-1 rounded-lg font-semibold transition-all ${
                activeTab === "themes"
                  ? "bg-primary text-white shadow-xs"
                  : "bg-slate-100 dark:bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              Themes
            </button>
          </div>
        </div>

        {/* 3 Columns of 23 Sectors */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono text-xs divide-y md:divide-y-0 md:divide-x divide-border/60">
          {/* Column 1 */}
          <div className="space-y-2 md:pr-4">
            <div className="flex justify-between text-[10px] uppercase font-bold text-muted-foreground pb-1">
              <span>Sector</span>
              <div className="flex gap-4">
                <span>Change</span>
                <span>Up</span>
              </div>
            </div>
            {sectorsCol1.map((s) => (
              <div key={s.name} className="flex items-center justify-between py-1">
                <span className="font-sans text-foreground truncate max-w-[140px]">{s.name}</span>
                <div className="flex items-center gap-4 text-right">
                  <span className="text-muted-foreground">{s.change}</span>
                  <span className="text-muted-foreground text-[11px]">{s.upCount}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Column 2 */}
          <div className="space-y-2 pt-3 md:pt-0 md:px-4">
            <div className="flex justify-between text-[10px] uppercase font-bold text-muted-foreground pb-1">
              <span>Sector</span>
              <div className="flex gap-4">
                <span>Change</span>
                <span>Up</span>
              </div>
            </div>
            {sectorsCol2.map((s) => (
              <div key={s.name} className="flex items-center justify-between py-1">
                <span className="font-sans text-foreground truncate max-w-[140px]">{s.name}</span>
                <div className="flex items-center gap-4 text-right">
                  <span className="text-muted-foreground">{s.change}</span>
                  <span className="text-muted-foreground text-[11px]">{s.upCount}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Column 3 */}
          <div className="space-y-2 pt-3 md:pt-0 md:pl-4">
            <div className="flex justify-between text-[10px] uppercase font-bold text-muted-foreground pb-1">
              <span>Sector</span>
              <div className="flex gap-4">
                <span>Change</span>
                <span>Up</span>
              </div>
            </div>
            {sectorsCol3.map((s) => (
              <div key={s.name} className="flex items-center justify-between py-1">
                <span className="font-sans text-foreground truncate max-w-[140px]">{s.name}</span>
                <div className="flex items-center gap-4 text-right">
                  <span className="text-muted-foreground">{s.change}</span>
                  <span className="text-muted-foreground text-[11px]">{s.upCount}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}