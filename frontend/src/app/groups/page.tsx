"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Layers,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  ChevronRight,
  Search,
  Sparkles,
  BarChart3,
  ExternalLink,
  ChevronDown,
} from "lucide-react";

interface ConstituentStock {
  symbol: string;
  name: string;
  ltp: string;
  change: string;
  isUp: boolean;
  stage: string;
  rsScore: number;
}

interface IndustryItem {
  id: string;
  name: string;
  stocksCount: number;
  change1D: string;
  change1W: string;
  change1M: string;
  change3M: string;
  change1Y: string;
  changeYTD: string;
  isUp: boolean;
  constituents: ConstituentStock[];
}

interface GroupItem {
  id: string;
  name: string;
  category: "sector" | "industry" | "theme";
  totalMarketCap: string;
  stocksCount: number;
  rsScore: number;
  stage: string;
  change1D: string;
  change1W: string;
  change1M: string;
  change3M: string;
  change1Y: string;
  changeYTD: string;
  isUp: boolean;
  topStock: string;
  industries: IndustryItem[];
}

const GROUPS_DATA: GroupItem[] = [
  {
    id: "defence-aerospace",
    name: "Defence & Aerospace",
    category: "sector",
    totalMarketCap: "₹6,40,000 Cr",
    stocksCount: 18,
    rsScore: 97,
    stage: "Stage 2 Markup",
    change1D: "+4.85%",
    change1W: "+9.20%",
    change1M: "+18.40%",
    change3M: "+34.50%",
    change1Y: "+88.20%",
    changeYTD: "+72.40%",
    isUp: true,
    topStock: "BEL (+6.4%)",
    industries: [
      {
        id: "def-elec",
        name: "Defence Electronics & Radars",
        stocksCount: 8,
        change1D: "+5.40%",
        change1W: "+11.2%",
        change1M: "+21.0%",
        change3M: "+38.4%",
        change1Y: "+95.0%",
        changeYTD: "+82.0%",
        isUp: true,
        constituents: [
          { symbol: "BEL", name: "Bharat Electronics", ltp: "₹312.40", change: "+6.40%", isUp: true, stage: "Stage 2", rsScore: 97 },
          { symbol: "DATAPATTNS", name: "Data Patterns (India)", ltp: "₹2,640.00", change: "+4.80%", isUp: true, stage: "Stage 2", rsScore: 95 },
          { symbol: "PARAS", name: "Paras Defence & Space", ltp: "₹1,180.00", change: "+3.90%", isUp: true, stage: "Stage 2", rsScore: 92 },
        ],
      },
      {
        id: "aero-struct",
        name: "Aerospace & Aircraft Structures",
        stocksCount: 10,
        change1D: "+4.30%",
        change1W: "+7.8%",
        change1M: "+16.2%",
        change3M: "+31.0%",
        change1Y: "+82.5%",
        changeYTD: "+64.8%",
        isUp: true,
        constituents: [
          { symbol: "HAL", name: "Hindustan Aeronautics", ltp: "₹4,890.00", change: "+4.15%", isUp: true, stage: "Stage 2", rsScore: 94 },
          { symbol: "MTARTECH", name: "MTAR Technologies", ltp: "₹2,120.00", change: "+5.10%", isUp: true, stage: "Stage 2", rsScore: 90 },
          { symbol: "DYNAMATECH", name: "Dynamatic Technologies", ltp: "₹8,450.00", change: "+3.70%", isUp: true, stage: "Stage 2", rsScore: 89 },
        ],
      },
    ],
  },
  {
    id: "ems-hardware",
    name: "EMS & High-Tech Hardware",
    category: "sector",
    totalMarketCap: "₹2,85,000 Cr",
    stocksCount: 14,
    rsScore: 95,
    stage: "Stage 2 Markup",
    change1D: "+4.20%",
    change1W: "+8.15%",
    change1M: "+16.80%",
    change3M: "+29.40%",
    change1Y: "+112.5%",
    changeYTD: "+94.20%",
    isUp: true,
    topStock: "DIXON (+8.9%)",
    industries: [
      {
        id: "ems-mfg",
        name: "Electronics Manufacturing Services",
        stocksCount: 9,
        change1D: "+4.80%",
        change1W: "+9.2%",
        change1M: "+19.5%",
        change3M: "+33.0%",
        change1Y: "+125.0%",
        changeYTD: "+102.0%",
        isUp: true,
        constituents: [
          { symbol: "DIXON", name: "Dixon Technologies", ltp: "₹14,920.00", change: "+8.92%", isUp: true, stage: "Stage 2", rsScore: 98 },
          { symbol: "KAYNES", name: "Kaynes Technology", ltp: "₹5,410.00", change: "+7.84%", isUp: true, stage: "Stage 2", rsScore: 96 },
          { symbol: "SYRMA", name: "Syrma SGS Technology", ltp: "₹540.00", change: "+3.20%", isUp: true, stage: "Stage 2", rsScore: 88 },
        ],
      },
    ],
  },
  {
    id: "power-renewables",
    name: "Power Generation & Grid Infra",
    category: "sector",
    totalMarketCap: "₹14,20,000 Cr",
    stocksCount: 32,
    rsScore: 91,
    stage: "Stage 2 Markup",
    change1D: "+2.95%",
    change1W: "+5.40%",
    change1M: "+11.20%",
    change3M: "+22.80%",
    change1Y: "+74.50%",
    changeYTD: "+61.00%",
    isUp: true,
    topStock: "NTPC (+3.2%)",
    industries: [
      {
        id: "grid-equip",
        name: "Heavy Electrical Equipment & T&D",
        stocksCount: 12,
        change1D: "+3.60%",
        change1W: "+6.8%",
        change1M: "+14.2%",
        change3M: "+27.5%",
        change1Y: "+89.0%",
        changeYTD: "+71.5%",
        isUp: true,
        constituents: [
          { symbol: "BHEL", name: "Bharat Heavy Electricals", ltp: "₹264.80", change: "+4.10%", isUp: true, stage: "Stage 2", rsScore: 93 },
          { symbol: "SIEMENS", name: "Siemens India", ltp: "₹7,420.00", change: "+2.90%", isUp: true, stage: "Stage 2", rsScore: 91 },
          { symbol: "ABB", name: "ABB India", ltp: "₹8,150.00", change: "+3.20%", isUp: true, stage: "Stage 2", rsScore: 90 },
        ],
      },
    ],
  },
  {
    id: "it-software",
    name: "Information Technology & Software",
    category: "sector",
    totalMarketCap: "₹38,50,000 Cr",
    stocksCount: 45,
    rsScore: 86,
    stage: "Stage 2 Uptrend",
    change1D: "+1.85%",
    change1W: "+3.40%",
    change1M: "+7.90%",
    change3M: "+15.20%",
    change1Y: "+38.40%",
    changeYTD: "+31.20%",
    isUp: true,
    topStock: "TCS (+2.4%)",
    industries: [
      {
        id: "tier1-it",
        name: "Tier-1 Global IT Services",
        stocksCount: 8,
        change1D: "+2.10%",
        change1W: "+3.8%",
        change1M: "+8.5%",
        change3M: "+16.8%",
        change1Y: "+41.0%",
        changeYTD: "+33.5%",
        isUp: true,
        constituents: [
          { symbol: "TCS", name: "Tata Consultancy Services", ltp: "₹4,180.00", change: "+2.40%", isUp: true, stage: "Stage 2", rsScore: 88 },
          { symbol: "INFY", name: "Infosys Limited", ltp: "₹1,875.00", change: "+2.15%", isUp: true, stage: "Stage 2", rsScore: 85 },
          { symbol: "HCLTECH", name: "HCL Technologies", ltp: "₹1,810.00", change: "+1.90%", isUp: true, stage: "Stage 2", rsScore: 87 },
        ],
      },
    ],
  },
];

export default function GroupsPage() {
  const [level, setLevel] = useState<"sector" | "industry" | "theme">("sector");
  const [timeframe, setTimeframe] = useState<"1D" | "1W" | "1M" | "3M" | "1Y" | "YTD">("1D");
  const [expandedGroup, setExpandedGroup] = useState<string | null>("defence-aerospace");
  const [searchQuery, setSearchQuery] = useState("");

  const timeframes = ["1D", "1W", "1M", "3M", "1Y", "YTD"] as const;

  const filteredGroups = GROUPS_DATA.filter((g) =>
    g.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getMetricForTimeframe = (g: GroupItem) => {
    switch (timeframe) {
      case "1D": return g.change1D;
      case "1W": return g.change1W;
      case "1M": return g.change1M;
      case "3M": return g.change3M;
      case "1Y": return g.change1Y;
      case "YTD": return g.changeYTD;
    }
  };

  const getIndustryMetric = (ind: IndustryItem) => {
    switch (timeframe) {
      case "1D": return ind.change1D;
      case "1W": return ind.change1W;
      case "1M": return ind.change1M;
      case "3M": return ind.change3M;
      case "1Y": return ind.change1Y;
      case "YTD": return ind.changeYTD;
    }
  };

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Groups / Sectors / Themes
            </h1>
            <span className="text-xs font-mono font-semibold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
              3-Level Drilldown
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Hierarchical market dissection across 23 Core Sectors, 172 Refined Industries, and 96 Focused Thematic Clusters
          </p>
        </div>

        {/* Timeframe Control Pills (1D, 1W, 1M, 3M, 1Y, YTD) */}
        <div className="flex items-center gap-1.5 p-1 bg-muted/60 rounded-2xl border border-border">
          <span className="text-[10px] font-semibold text-muted-foreground px-2">Timeframe:</span>
          {timeframes.map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-3 py-1 rounded-xl text-xs font-mono font-bold transition-all ${
                timeframe === tf
                  ? "bg-primary text-white shadow-xs"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* Hierarchical View Selection Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setLevel("sector")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              level === "sector"
                ? "bg-primary text-white shadow-xs"
                : "bg-card border border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            <Layers className="h-4 w-4" />
            <span>Sectors (23 Core Sectors)</span>
          </button>

          <button
            onClick={() => setLevel("industry")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              level === "industry"
                ? "bg-primary text-white shadow-xs"
                : "bg-card border border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            <BarChart3 className="h-4 w-4" />
            <span>Industries (172 Refined)</span>
          </button>

          <button
            onClick={() => setLevel("theme")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              level === "theme"
                ? "bg-primary text-white shadow-xs"
                : "bg-card border border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            <Sparkles className="h-4 w-4" />
            <span>Themes (96 Clusters)</span>
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search sector, industry, theme..."
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-border bg-background text-foreground font-mono placeholder:font-sans"
          />
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
        </div>
      </div>

      {/* 3-Level Drilldown Workflows List */}
      <div className="space-y-4">
        {filteredGroups.map((group) => {
          const isExpanded = expandedGroup === group.id;
          const perf = getMetricForTimeframe(group);

          return (
            <div
              key={group.id}
              className="rounded-2xl border border-border bg-card shadow-xs overflow-hidden transition-all"
            >
              {/* Level 1: Sector / Group Header Row */}
              <div
                onClick={() => setExpandedGroup(isExpanded ? null : group.id)}
                className="p-5 flex flex-wrap items-center justify-between gap-4 cursor-pointer hover:bg-muted/30 transition-colors select-none"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                    <Layers className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-foreground">{group.name}</h3>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 font-bold">
                        ★ RS {group.rsScore}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-bull/10 text-bull border border-bull/20 font-semibold">
                        {group.stage}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {group.stocksCount} Stocks • MCap: {group.totalMarketCap} • Top: <strong className="text-foreground">{group.topStock}</strong>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="text-[10px] text-muted-foreground block font-mono">{timeframe} Performance</span>
                    <span className="text-base font-extrabold font-mono text-bull flex items-center justify-end">
                      <TrendingUp className="h-4 w-4 mr-0.5" />
                      {perf}
                    </span>
                  </div>
                  <ChevronDown
                    className={`h-5 w-5 text-muted-foreground transition-transform ${
                      isExpanded ? "rotate-180" : ""
                    }`}
                  />
                </div>
              </div>

              {/* Level 2 & 3: Industry Breakdown & Constituent Stocks */}
              {isExpanded && (
                <div className="p-5 pt-0 space-y-4 border-t border-border/70 bg-muted/20 animate-in fade-in duration-150">
                  <div className="pt-3">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
                      Level 2: Industry Breakdown ({group.industries.length} Sub-Industries)
                    </span>

                    <div className="space-y-4">
                      {group.industries.map((ind) => (
                        <div
                          key={ind.id}
                          className="p-4 rounded-xl bg-background border border-border shadow-2xs space-y-3"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="text-xs font-bold text-foreground">{ind.name}</h4>
                              <span className="text-[10px] text-muted-foreground font-mono">
                                {ind.stocksCount} constituent equities
                              </span>
                            </div>
                            <span className="text-xs font-bold font-mono text-bull">
                              {getIndustryMetric(ind)} ({timeframe})
                            </span>
                          </div>

                          {/* Level 3: Individual Constituent Stock Lists */}
                          <div className="border-t border-border/70 pt-2">
                            <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider block mb-1.5">
                              Level 3: Constituent Equities &amp; Live Technical Stage
                            </span>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                              {ind.constituents.map((stk) => (
                                <Link
                                  key={stk.symbol}
                                  href={`/stock/${stk.symbol}`}
                                  className="p-2.5 rounded-lg border border-border/80 bg-card hover:border-primary/40 transition-colors flex items-center justify-between group"
                                >
                                  <div>
                                    <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-foreground group-hover:text-primary transition-colors">
                                      <span>{stk.symbol}</span>
                                      <span className="text-[9px] px-1 py-0.2 rounded bg-primary/10 text-primary">
                                        ★ {stk.rsScore}
                                      </span>
                                    </div>
                                    <span className="text-[10px] text-muted-foreground truncate block max-w-[120px]">
                                      {stk.name}
                                    </span>
                                  </div>
                                  <div className="text-right">
                                    <span className="text-xs font-mono font-semibold text-foreground block">
                                      {stk.ltp}
                                    </span>
                                    <span className="text-[11px] font-mono font-bold text-bull">
                                      {stk.change}
                                    </span>
                                  </div>
                                </Link>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
