"use client";

import React, { useMemo, useState } from "react";
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
  const [activeFilter, setActiveFilter] = useState<string>("All");

  const filterOptions = [
    "All",
    "Strong start",
    "Gap up & sustain",
    "Opening range breakout",
    "Recovering from day low",
    "Up 4% on volume",
    "Near 52W high",
  ];

  const sampleGainers = [
    { symbol: "MSTCLTD", name: "MSTC Ltd", ltp: "840.50", change: "+20.00%", chg: "+20.00%", rvol: "8.4x", filter: "Strong start", tags: ["strong-start", "gap-up", "orb", "up-4-high-vol", "near-52w"] },
    { symbol: "ANUP", name: "Anup Engineering", ltp: "3,120.00", change: "+20.00%", chg: "+20.00%", rvol: "9.2x", filter: "Strong start", tags: ["strong-start", "orb", "up-4-high-vol", "near-52w"] },
    { symbol: "ALICON", name: "Alicon Castalloy", ltp: "1,240.00", change: "+17.32%", chg: "+17.32%", rvol: "6.8x", filter: "Strong start", tags: ["strong-start", "gap-up", "up-4-high-vol"] },
    { symbol: "DIXON", name: "Dixon Technologies", ltp: "15,220.00", change: "+8.92%", chg: "+3.8%", rvol: "2.8x", filter: "Opening range breakout", tags: ["orb", "up-4-high-vol", "near-52w", "recovering", "strong-start"] },
    { symbol: "KAYNES", name: "Kaynes Technology", ltp: "5,420.00", change: "+7.84%", chg: "+4.2%", rvol: "2.4x", filter: "Up 4% on volume", tags: ["gap-up", "up-4-high-vol", "near-52w"] },
    { symbol: "TRENT", name: "Trent Limited", ltp: "7,245.30", change: "+2.60%", chg: "+2.6%", rvol: "1.9x", filter: "Near 52W high", tags: ["near-52w"] },
    { symbol: "BEL", name: "Bharat Electronics", ltp: "312.40", change: "+6.40%", chg: "+3.1%", rvol: "2.1x", filter: "Gap up & sustain", tags: ["up-4-high-vol", "recovering", "near-52w", "gap-up"] },
    { symbol: "POLYCAB", name: "Polycab India", ltp: "6,890.00", change: "+2.40%", chg: "+2.4%", rvol: "1.8x", filter: "Opening range breakout", tags: ["orb"] },
    { symbol: "HAL", name: "Hindustan Aeronautics", ltp: "4,680.00", change: "+1.90%", chg: "+1.9%", rvol: "1.7x", filter: "Recovering from day low", tags: ["recovering"] },
  ];

  const sampleLosers = [
    { symbol: "IDEA", name: "Vodafone Idea", ltp: "7.15", change: "-4.20%", chg: "-4.2%", rvol: "2.1x", filter: "Near 52W low", tags: ["recovering", "near-52w"] },
    { symbol: "YESBANK", name: "Yes Bank", ltp: "19.80", change: "-2.80%", chg: "-2.8%", rvol: "1.4x", filter: "Near 52W low", tags: ["near-52w"] },
  ];

  const allSetups = sampleGainers;

  const filteredGainers = useMemo(() => {
    if (activeFilter === "All") return sampleGainers;
    const tagMap: Record<string, string> = {
      "Strong start": "strong-start",
      "Gap up & sustain": "gap-up",
      "Opening range breakout": "orb",
      "Recovering from day low": "recovering",
      "Up 4% on volume": "up-4-high-vol",
      "Near 52W high": "near-52w",
      "Near 52W low": "near-52w",
    };
    const targetTag = tagMap[activeFilter] || activeFilter.toLowerCase();
    return sampleGainers.filter((g) => g.tags?.includes(targetTag) || g.filter === activeFilter);
  }, [activeFilter]);

  const filteredLosers = useMemo(() => {
    if (activeFilter === "All") return sampleLosers;
    return sampleLosers;
  }, [activeFilter]);

  const filteredSetups = filteredGainers;

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

        {/* CARD 2: DYNAMIC INTRADAY SETUPS & HIGH VOLUME */}
        <div className="rounded-2xl bg-card border border-border/80 shadow-xs p-4 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-border/60">
              <div className="flex items-center gap-1.5">
                <h3 className="text-xs font-bold text-foreground">
                  Setups: {activeFilter}
                </h3>
                {activeFilter !== "All" && (
                  <button
                    type="button"
                    onClick={() => setActiveFilter("All")}
                    className="text-[10px] text-primary hover:underline font-mono"
                  >
                    (Clear)
                  </button>
                )}
              </div>
              <span className="text-[10px] text-muted-foreground font-mono tabular-nums">
                {filteredSetups.length} stocks
              </span>
            </div>

            {/* Filter Pills Ribbon */}
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-1">
              {filterOptions.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setActiveFilter(opt)}
                  className={`px-2 py-0.5 rounded-full text-[10px] font-semibold whitespace-nowrap transition-colors ${
                    activeFilter === opt
                      ? "bg-primary text-white"
                      : "bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>

            {/* Dynamic Setups List */}
            {filteredSetups.length > 0 ? (
              <div className="space-y-1.5 pt-1 max-h-[160px] overflow-y-auto no-scrollbar">
                {filteredSetups.map((s) => (
                  <Link
                    key={s.symbol}
                    href={`/stock/${s.symbol}`}
                    className="flex items-center justify-between p-2 rounded-lg bg-zinc-900/50 hover:bg-white/[0.04] border border-border/50 transition-colors"
                  >
                    <div>
                      <span className="font-bold text-xs text-foreground block">{s.symbol}</span>
                      <span className="text-[10px] text-muted-foreground truncate block max-w-[130px]">{s.name}</span>
                    </div>
                    <div className="text-right font-mono">
                      <span className="font-bold text-xs text-foreground block tabular-nums">₹{s.ltp}</span>
                      <span className="text-[10px] font-bold text-emerald-400 block tabular-nums">{s.chg} • {s.rvol}</span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-xs text-muted-foreground">
                No stocks match &quot;{activeFilter}&quot; currently.
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-border/60 space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-foreground flex items-center gap-1">
                <span>High volume day</span>
                <ChevronRight className="h-3 w-3" />
              </h4>
              <span className="text-[10px] text-muted-foreground font-mono">
                {filteredSetups.filter((s) => s.rvol >= "2.0x").length} stocks • up today
              </span>
            </div>
            <div className="text-xs text-muted-foreground font-mono flex items-center justify-between p-1.5 rounded-lg bg-zinc-900/40 border border-border/40">
              <span>Top RVOL Leader</span>
              <span className="text-amber-400 font-bold">DIXON (2.8x)</span>
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
          <div className="text-center py-1 text-xs text-muted-foreground">
            No stocks on this list yet today.
          </div>

          {/* More Screens Section */}
          <div className="pt-2 border-t border-border/60 space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-bold text-foreground mb-1">
              <span>More screens</span>
              <span className="text-[10px] text-muted-foreground">Stocks</span>
            </div>
            {moreScreens.map((screen) => (
              <button
                key={screen.name}
                type="button"
                onClick={() => setActiveFilter(screen.name)}
                className={`w-full flex items-center justify-between text-xs py-1 px-1.5 rounded-lg transition-colors cursor-pointer ${
                  activeFilter === screen.name
                    ? "bg-primary/20 text-primary font-semibold"
                    : "hover:bg-muted/60 text-muted-foreground hover:text-foreground"
                }`}
              >
                <span>{screen.name}</span>
                <div className="flex items-center gap-1 font-mono text-[11px]">
                  <span className="tabular-nums">
                    {allSetups.filter((s) => s.filter === screen.name).length}
                  </span>
                  <ChevronRight className="h-3 w-3" />
                </div>
              </button>
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