"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Calendar,
  Search,
  Filter,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  ExternalLink,
  Sparkles,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

interface EarningsItem {
  symbol: string;
  name: string;
  time: string;
  date: string;
  quality: "Excellent" | "Good" | "Weak";
  price: string;
  change: string;
  isUp: boolean;
  netSales: string;
  salesYoY: string;
  ebitda: string;
  ebitdaMargin: string;
  pat: string;
  patYoY: string;
  eps: string;
  epsYoY: string;
  commentary: string;
}

const EARNINGS_DAYS = [
  {
    dayLabel: "Yesterday (12 Nov)",
    dateKey: "2026-11-12",
    count: 24,
    items: [
      {
        symbol: "TRENT",
        name: "Trent Limited",
        time: "17:15 IST",
        date: "2026-11-12",
        quality: "Excellent" as const,
        price: "₹7,140.00",
        change: "+4.25%",
        isUp: true,
        netSales: "₹4,150 Cr",
        salesYoY: "+39.2%",
        ebitda: "₹640 Cr",
        ebitdaMargin: "15.4%",
        pat: "₹425 Cr",
        patYoY: "+46.5%",
        eps: "₹11.95",
        epsYoY: "+46.0%",
        commentary: "Massive Zudio store additions, same-store sales growth +14% YoY.",
      },
      {
        symbol: "DIXON",
        name: "Dixon Technologies",
        time: "18:00 IST",
        date: "2026-11-12",
        quality: "Excellent" as const,
        price: "₹14,920.00",
        change: "+3.80%",
        isUp: true,
        netSales: "₹11,530 Cr",
        salesYoY: "+133%",
        ebitda: "₹420 Cr",
        ebitdaMargin: "3.6%",
        pat: "₹412 Cr",
        patYoY: "+263%",
        eps: "₹68.80",
        epsYoY: "+260%",
        commentary: "Mobile production capacity ramps to 45M units annually.",
      },
      {
        symbol: "SPARC",
        name: "Sun Pharma Advanced",
        time: "16:45 IST",
        date: "2026-11-12",
        quality: "Weak" as const,
        price: "₹220.10",
        change: "-7.45%",
        isUp: false,
        netSales: "₹42 Cr",
        salesYoY: "-24.5%",
        ebitda: "-₹78 Cr",
        ebitdaMargin: "Negative",
        pat: "-₹85 Cr",
        patYoY: "-38.0%",
        eps: "-₹2.65",
        epsYoY: "-38.0%",
        commentary: "Clinical trial delays and heightened R&D expenditure.",
      },
    ],
  },
  {
    dayLabel: "Today (13 Nov)",
    dateKey: "2026-11-13",
    count: 38,
    isToday: true,
    items: [
      {
        symbol: "KAYNES",
        name: "Kaynes Technology India",
        time: "13:30 IST",
        date: "2026-11-13",
        quality: "Excellent" as const,
        price: "₹5,410.00",
        change: "+5.12%",
        isUp: true,
        netSales: "₹572 Cr",
        salesYoY: "+58.5%",
        ebitda: "₹78 Cr",
        ebitdaMargin: "13.6%",
        pat: "₹60 Cr",
        patYoY: "+86.2%",
        eps: "₹9.40",
        epsYoY: "+85.0%",
        commentary: "Strong industrial & aerospace order book expansion to ₹4,200 Cr.",
      },
      {
        symbol: "BEL",
        name: "Bharat Electronics Ltd",
        time: "14:15 IST",
        date: "2026-11-13",
        quality: "Good" as const,
        price: "₹312.40",
        change: "+2.85%",
        isUp: true,
        netSales: "₹4,580 Cr",
        salesYoY: "+14.8%",
        ebitda: "₹1,210 Cr",
        ebitdaMargin: "26.4%",
        pat: "₹1,090 Cr",
        patYoY: "+38.4%",
        eps: "₹1.49",
        epsYoY: "+38.0%",
        commentary: "Defense radar shipments beat guidance, margins expanded 250 bps.",
      },
      {
        symbol: "TATAMOTORS",
        name: "Tata Motors Ltd",
        time: "15:30 IST",
        date: "2026-11-13",
        quality: "Good" as const,
        price: "₹824.50",
        change: "+1.85%",
        isUp: true,
        netSales: "₹1,01,450 Cr",
        salesYoY: "-0.4%",
        ebitda: "₹11,600 Cr",
        ebitdaMargin: "11.4%",
        pat: "₹3,450 Cr",
        patYoY: "-11.2%",
        eps: "₹9.12",
        epsYoY: "-11.0%",
        commentary: "JLR supply bottlenecks easing; domestic CV commercial demand muted.",
      },
    ],
  },
  {
    dayLabel: "Tomorrow (14 Nov)",
    dateKey: "2026-11-14",
    count: 31,
    items: [
      {
        symbol: "HAL",
        name: "Hindustan Aeronautics",
        time: "12:00 IST",
        date: "2026-11-14",
        quality: "Good" as const,
        price: "₹4,890.00",
        change: "+3.15%",
        isUp: true,
        netSales: "₹5,976 Cr",
        salesYoY: "+6.1%",
        ebitda: "₹1,480 Cr",
        ebitdaMargin: "24.8%",
        pat: "₹1,510 Cr",
        patYoY: "+22.1%",
        eps: "₹22.58",
        epsYoY: "+22.0%",
        commentary: "Tejas deliveries scheduled for H2; order backlog solid at ₹94K Cr.",
      },
      {
        symbol: "TITAN",
        name: "Titan Company Ltd",
        time: "16:00 IST",
        date: "2026-11-14",
        quality: "Weak" as const,
        price: "₹3,240.00",
        change: "-2.10%",
        isUp: false,
        netSales: "₹13,473 Cr",
        salesYoY: "+13.4%",
        ebitda: "₹1,325 Cr",
        ebitdaMargin: "9.8%",
        pat: "₹704 Cr",
        patYoY: "-23.1%",
        eps: "₹7.93",
        epsYoY: "-23.0%",
        commentary: "Gold customs duty impact on inventory values dented net profit.",
      },
    ],
  },
];

export default function ResultsPage() {
  const [selectedStock, setSelectedStock] = useState<EarningsItem>(
    EARNINGS_DAYS[1].items[0]
  );
  const [qualityFilter, setQualityFilter] = useState<"All" | "Excellent" | "Good" | "Weak">("All");
  const [searchQuery, setSearchQuery] = useState("");

  const handleJumpToday = () => {
    setSelectedStock(EARNINGS_DAYS[1].items[0]);
  };

  const getQualityBadge = (quality: "Excellent" | "Good" | "Weak") => {
    switch (quality) {
      case "Excellent":
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-bull/15 text-bull border border-bull/30">
            ★ Excellent
          </span>
        );
      case "Good":
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-500/15 text-blue-500 border border-blue-500/30">
            Good
          </span>
        );
      case "Weak":
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-bear/15 text-bear border border-bear/30">
            Weak
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto space-y-6">
      {/* Top Header & Season Tracker */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Quarterly Earnings Results Calendar
            </h1>
            <span className="text-xs font-mono font-semibold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
              Q2 FY27 Season
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Real-time scorecards, automated quality evaluation badges &amp; YoY/QoQ financial performance matrices
          </p>
        </div>

        {/* Top-Level Earnings Season Tracker */}
        <div className="flex items-center gap-4 p-3 rounded-2xl bg-card border border-border shadow-xs">
          <div>
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-foreground">Q2 FY27 Season Progress</span>
              <span className="font-mono font-bold text-primary ml-4">2,076 / 2,620 Announced</span>
            </div>
            {/* Progress Bar */}
            <div className="w-52 h-2 rounded-full bg-muted overflow-hidden mt-1.5 flex">
              <div style={{ width: "79.2%" }} className="bg-primary h-full" />
            </div>
          </div>
          <button
            type="button"
            onClick={handleJumpToday}
            className="px-3 py-1.5 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5"
          >
            <Clock className="h-3.5 w-3.5" />
            <span>Today</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Calendar Day Columns (Left 8 Cols) + Side Details Panel (Right 4 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ================= Calendar View Grid (8 Cols) ================= */}
        <div className="lg:col-span-7 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              <span>Earnings Calendar Day Columns</span>
            </h2>

            {/* Quality Filter Chips */}
            <div className="flex items-center gap-1.5 text-xs">
              {(["All", "Excellent", "Good", "Weak"] as const).map((q) => (
                <button
                  key={q}
                  onClick={() => setQualityFilter(q)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                    qualityFilter === q
                      ? "bg-primary text-white shadow-xs"
                      : "bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Day Columns */}
          <div className="space-y-4">
            {EARNINGS_DAYS.map((day) => {
              const visibleItems = day.items.filter((item) => {
                const matchQuality = qualityFilter === "All" || item.quality === qualityFilter;
                const matchSearch =
                  item.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  item.name.toLowerCase().includes(searchQuery.toLowerCase());
                return matchQuality && matchSearch;
              });

              if (visibleItems.length === 0) return null;

              return (
                <div
                  key={day.dateKey}
                  className={`p-4 rounded-2xl border transition-all ${
                    day.isToday
                      ? "bg-card border-primary/40 shadow-xs ring-1 ring-primary/20"
                      : "bg-card border-border shadow-2xs"
                  }`}
                >
                  <div className="flex items-center justify-between pb-3 border-b border-border/70">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-extrabold text-foreground">{day.dayLabel}</span>
                      {day.isToday && (
                        <span className="px-2 py-0.2 rounded-full text-[10px] font-mono font-bold bg-bull/10 text-bull border border-bull/20">
                          Active Day
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] font-mono text-muted-foreground">
                      {visibleItems.length} Companies
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3">
                    {visibleItems.map((item) => {
                      const isSelected = selectedStock.symbol === item.symbol;
                      return (
                        <div
                          key={item.symbol}
                          onClick={() => setSelectedStock(item)}
                          className={`p-3.5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between space-y-2 ${
                            isSelected
                              ? "border-primary bg-primary/10 shadow-xs ring-1 ring-primary/40"
                              : "border-border hover:border-border/80 hover:bg-muted/40"
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold font-mono text-foreground">{item.symbol}</span>
                                {getQualityBadge(item.quality)}
                              </div>
                              <span className="text-[11px] text-muted-foreground truncate block max-w-[150px] mt-0.5">
                                {item.name}
                              </span>
                            </div>

                            <span className="text-[10px] font-mono text-muted-foreground">{item.time}</span>
                          </div>

                          <div className="flex items-baseline justify-between pt-1 border-t border-border/60">
                            <div>
                              <span className="text-[10px] text-muted-foreground">Sales YoY</span>
                              <span className="text-xs font-bold font-mono text-foreground block">
                                {item.salesYoY}
                              </span>
                            </div>
                            <div className="text-right">
                              <span className="text-[10px] text-muted-foreground">PAT YoY</span>
                              <span
                                className={`text-xs font-bold font-mono block ${
                                  item.patYoY.startsWith("+") ? "text-bull" : "text-bear"
                                }`}
                              >
                                {item.patYoY}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ================= Side Details Panel (5 Cols) ================= */}
        <div className="lg:col-span-5 p-5 rounded-2xl bg-card border border-border shadow-xs space-y-5 sticky top-20">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-foreground">Scorecard Details Panel</h3>
            <Link
              href={`/stock/${selectedStock.symbol}`}
              className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
            >
              <span>Full Stock Page</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Quick Search Input */}
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search companies (e.g. KAYNES)..."
              className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-border bg-background text-foreground font-mono placeholder:font-sans"
            />
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
          </div>

          {/* Selected Company Header */}
          <div className="p-4 rounded-xl bg-background border border-border space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-xl font-black font-mono text-foreground">{selectedStock.symbol}</h4>
                  {getQualityBadge(selectedStock.quality)}
                </div>
                <p className="text-xs text-muted-foreground">{selectedStock.name}</p>
              </div>

              <div className="text-right">
                <span className="text-base font-bold font-mono text-foreground block">{selectedStock.price}</span>
                <span className="text-xs font-bold font-mono text-bull flex items-center justify-end">
                  <ArrowUpRight className="h-3 w-3" />
                  {selectedStock.change}
                </span>
              </div>
            </div>

            <p className="text-xs text-muted-foreground italic border-t border-border/70 pt-2">
              &quot;{selectedStock.commentary}&quot;
            </p>
          </div>

          {/* Financial Metrics Summary Table */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-foreground uppercase tracking-wider block">
              Q2 FY27 Financial Metrics
            </span>

            <div className="overflow-hidden border border-border rounded-xl">
              <table className="w-full text-left text-xs border-collapse">
                <tbody className="divide-y divide-border">
                  <tr className="p-2.5 hover:bg-muted/30">
                    <td className="p-3 text-muted-foreground">Net Sales (Revenue)</td>
                    <td className="p-3 font-mono font-bold text-foreground text-right">{selectedStock.netSales}</td>
                    <td className="p-3 font-mono font-bold text-bull text-right">{selectedStock.salesYoY}</td>
                  </tr>
                  <tr className="p-2.5 hover:bg-muted/30">
                    <td className="p-3 text-muted-foreground">Operating EBITDA</td>
                    <td className="p-3 font-mono font-bold text-foreground text-right">{selectedStock.ebitda}</td>
                    <td className="p-3 font-mono text-muted-foreground text-right">{selectedStock.ebitdaMargin}</td>
                  </tr>
                  <tr className="p-2.5 hover:bg-muted/30">
                    <td className="p-3 text-muted-foreground">Net Profit (PAT)</td>
                    <td className="p-3 font-mono font-bold text-foreground text-right">{selectedStock.pat}</td>
                    <td
                      className={`p-3 font-mono font-bold text-right ${
                        selectedStock.patYoY.startsWith("+") ? "text-bull" : "text-bear"
                      }`}
                    >
                      {selectedStock.patYoY}
                    </td>
                  </tr>
                  <tr className="p-2.5 hover:bg-muted/30">
                    <td className="p-3 text-muted-foreground">Diluted EPS</td>
                    <td className="p-3 font-mono font-bold text-primary text-right">{selectedStock.eps}</td>
                    <td className="p-3 font-mono font-bold text-bull text-right">{selectedStock.epsYoY}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
