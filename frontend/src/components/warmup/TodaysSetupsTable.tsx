"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Copy, Check, ArrowRight, CheckSquare, Square } from "lucide-react";

export interface SetupRow {
  symbol: string;
  industry: string;
  pattern: "Near Pivot" | "VCP";
  rs: number;
  close: string;
  toPivot: string;
  perf1m: string;
  perf3m: string;
  from52wHigh: string;
  logoColor?: string;
}

export function TodaysSetupsTable() {
  const [copied, setCopied] = useState(false);
  const [selectedSymbols, setSelectedSymbols] = useState<string[]>([]);

  const setups: SetupRow[] = [
    {
      symbol: "MMFL",
      industry: "Auto Components & Equipments",
      pattern: "Near Pivot",
      rs: 94,
      close: "664.90",
      toPivot: "0.0%",
      perf1m: "+27.1%",
      perf3m: "+10.2%",
      from52wHigh: "-1.4%",
      logoColor: "bg-blue-600",
    },
    {
      symbol: "SANATHAN",
      industry: "Other Textile Products",
      pattern: "VCP",
      rs: 87,
      close: "391.15",
      toPivot: "0.0%",
      perf1m: "+7.8%",
      perf3m: "+23.1%",
      from52wHigh: "-2.8%",
      logoColor: "bg-indigo-600",
    },
    {
      symbol: "SANSERA",
      industry: "Auto Components & Equipments",
      pattern: "Near Pivot",
      rs: 98,
      close: "4,708.40",
      toPivot: "0.0%",
      perf1m: "+12.1%",
      perf3m: "+24.4%",
      from52wHigh: "-2.8%",
      logoColor: "bg-sky-600",
    },
    {
      symbol: "DCBBANK",
      industry: "Private Sector Bank",
      pattern: "Near Pivot",
      rs: 86,
      close: "233.01",
      toPivot: "0.0%",
      perf1m: "+10.6%",
      perf3m: "+24.5%",
      from52wHigh: "-1.1%",
      logoColor: "bg-amber-600",
    },
    {
      symbol: "GROWW",
      industry: "Broking & Allied",
      pattern: "Near Pivot",
      rs: 88,
      close: "224.95",
      toPivot: "1.0%",
      perf1m: "+16.8%",
      perf3m: "+13.6%",
      from52wHigh: "-1.8%",
      logoColor: "bg-emerald-600",
    },
    {
      symbol: "APLAPOLLO",
      industry: "Iron & Steel Products",
      pattern: "Near Pivot",
      rs: 78,
      close: "2,281.60",
      toPivot: "1.3%",
      perf1m: "+4.2%",
      perf3m: "+9.1%",
      from52wHigh: "-2.2%",
      logoColor: "bg-slate-700",
    },
    {
      symbol: "PCBL",
      industry: "Carbon",
      pattern: "Near Pivot",
      rs: 82,
      close: "412.25",
      toPivot: "1.6%",
      perf1m: "+20.6%",
      perf3m: "+10.8%",
      from52wHigh: "-3.0%",
      logoColor: "bg-violet-600",
    },
    {
      symbol: "HONASA",
      industry: "Personal Care",
      pattern: "Near Pivot",
      rs: 92,
      close: "501.95",
      toPivot: "1.6%",
      perf1m: "+9.1%",
      perf3m: "+4.7%",
      from52wHigh: "-2.9%",
      logoColor: "bg-rose-600",
    },
    {
      symbol: "GALAXYEC",
      industry: "Industrial Products",
      pattern: "Near Pivot",
      rs: 95,
      close: "1,246.10",
      toPivot: "1.6%",
      perf1m: "+16.2%",
      perf3m: "+21.0%",
      from52wHigh: "-6.3%",
      logoColor: "bg-teal-600",
    },
    {
      symbol: "PNGJL",
      industry: "Gems, Jewellery & Watches",
      pattern: "Near Pivot",
      rs: 59,
      close: "633.35",
      toPivot: "1.8%",
      perf1m: "+6.1%",
      perf3m: "-0.8%",
      from52wHigh: "-15.4%",
      logoColor: "bg-orange-600",
    },
    {
      symbol: "BANKINDIA",
      industry: "Public Sector Bank",
      pattern: "Near Pivot",
      rs: 68,
      close: "688.35",
      toPivot: "1.9%",
      perf1m: "+10.2%",
      perf3m: "+8.6%",
      from52wHigh: "-21.3%",
      logoColor: "bg-blue-700",
    },
    {
      symbol: "ENGINERSIN",
      industry: "Civil Construction",
      pattern: "VCP",
      rs: 93,
      close: "312.45",
      toPivot: "2.6%",
      perf1m: "+7.8%",
      perf3m: "+29.9%",
      from52wHigh: "-3.5%",
      logoColor: "bg-cyan-700",
    },
    {
      symbol: "DELTACORP",
      industry: "Amusement Parks/Rec",
      pattern: "VCP",
      rs: 86,
      close: "84.36",
      toPivot: "4.0%",
      perf1m: "+3.5%",
      perf3m: "+30.4%",
      from52wHigh: "-4.8%",
      logoColor: "bg-purple-700",
    },
    {
      symbol: "SKYGOLD",
      industry: "Gems, Jewellery & Watches",
      pattern: "VCP",
      rs: 90,
      close: "1,022.10",
      toPivot: "5.7%",
      perf1m: "+5.6%",
      perf3m: "+32.1%",
      from52wHigh: "-3.7%",
      logoColor: "bg-amber-500",
    },
    {
      symbol: "BHEL",
      industry: "Heavy Electrical Equipment",
      pattern: "Near Pivot",
      rs: 87,
      close: "436.30",
      toPivot: "6.0%",
      perf1m: "-0.6%",
      perf3m: "+3.9%",
      from52wHigh: "-5.3%",
      logoColor: "bg-blue-800",
    },
  ];

  const handleSelectAll = () => {
    if (selectedSymbols.length === setups.length) {
      setSelectedSymbols([]);
    } else {
      setSelectedSymbols(setups.map((s) => s.symbol));
    }
  };

  const toggleSelect = (sym: string) => {
    if (selectedSymbols.includes(sym)) {
      setSelectedSymbols(selectedSymbols.filter((s) => s !== sym));
    } else {
      setSelectedSymbols([...selectedSymbols, sym]);
    }
  };

  const handleCopyTradingView = () => {
    const listToCopy = selectedSymbols.length > 0 ? selectedSymbols : setups.map((s) => s.symbol);
    const symbolsText = listToCopy.map((s) => `NSE:${s}`).join(", ");
    navigator.clipboard.writeText(symbolsText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-2xl bg-card border border-border/80 shadow-stc-card overflow-hidden transition-all duration-150 ease-out hover:border-brand/40">
      {/* Top Header & Action Controls */}
      <div className="p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3 border-b border-border/60">
        <div>
          <h3 className="text-sm font-bold text-foreground">Today&apos;s setups</h3>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Curated stocks consolidating in constructive technical bases near actionable pivots
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Copy to TradingView button */}
          <button
            type="button"
            onClick={handleCopyTradingView}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-card border border-border text-foreground hover:bg-muted/60 transition-all shadow-2xs cursor-pointer"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-bull" /> : <Copy className="h-3.5 w-3.5 text-muted-foreground" />}
            <span>{copied ? "Copied!" : "Copy to TradingView"}</span>
          </button>

          {/* Open in Scanner */}
          <Link
            href="/scanners/trend-template"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-primary hover:underline hover:bg-primary/5 transition-all"
          >
            <span>Open in Scanner</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {/* Setups Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-border/60 bg-slate-50/60 dark:bg-muted/20 text-[10px] font-bold uppercase tracking-wider text-muted-foreground select-none">
              <th className="py-2.5 pl-4 pr-2 w-8">
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="text-muted-foreground hover:text-foreground cursor-pointer"
                  title="Select All"
                >
                  {selectedSymbols.length === setups.length ? (
                    <CheckSquare className="h-3.5 w-3.5 text-primary" />
                  ) : (
                    <Square className="h-3.5 w-3.5" />
                  )}
                </button>
              </th>
              <th className="py-2.5 px-3">Stock</th>
              <th className="py-2.5 px-3 text-right">RS</th>
              <th className="py-2.5 px-3 text-right">Close</th>
              <th className="py-2.5 px-3 text-right">To Pivot</th>
              <th className="py-2.5 px-3 text-right">1M %</th>
              <th className="py-2.5 px-3 text-right">3M %</th>
              <th className="py-2.5 pr-4 pl-3 text-right">52W High %</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40 font-mono">
            {setups.map((row) => {
              const isSelected = selectedSymbols.includes(row.symbol);
              return (
                <tr
                  key={row.symbol}
                  className={`hover:bg-slate-50 dark:hover:bg-muted/40 transition-colors ${
                    isSelected ? "bg-primary/5" : ""
                  }`}
                >
                  <td className="py-2.5 pl-4 pr-2">
                    <button
                      type="button"
                      onClick={() => toggleSelect(row.symbol)}
                      className="cursor-pointer text-muted-foreground hover:text-foreground"
                    >
                      {isSelected ? (
                        <CheckSquare className="h-3.5 w-3.5 text-primary" />
                      ) : (
                        <Square className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </td>

                  {/* Stock Symbol, Pattern & Industry */}
                  <td className="py-2 px-3 font-sans">
                    <div className="flex items-center gap-2">
                      <div
                        className={`h-6 w-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold ${
                          row.logoColor || "bg-primary"
                        }`}
                      >
                        {row.symbol.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <Link
                            href={`/stock/${row.symbol}`}
                            className="font-bold font-mono text-xs text-foreground hover:text-primary transition-colors"
                          >
                            {row.symbol}
                          </Link>
                          <span
                            className={`px-1.5 py-0.2 rounded text-[9px] font-semibold border ${
                              row.pattern === "VCP"
                                ? "bg-purple-50 text-purple-700 border-purple-200/60 dark:bg-purple-950/40 dark:text-purple-300"
                                : "bg-blue-50 text-blue-700 border-blue-200/60 dark:bg-blue-950/40 dark:text-blue-300"
                            }`}
                          >
                            {row.pattern}
                          </span>
                        </div>
                        <div className="text-[10px] text-muted-foreground truncate max-w-[190px]">
                          {row.industry}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* RS Rating */}
                  <td className="py-2.5 px-3 text-right">
                    <span
                      className={`font-bold text-[11px] ${
                        row.rs >= 90 ? "text-bull" : row.rs >= 80 ? "text-primary" : "text-foreground"
                      }`}
                    >
                      {row.rs}
                    </span>
                  </td>

                  {/* Close Price */}
                  <td className="py-2.5 px-3 text-right font-medium text-foreground text-xs">
                    ₹{row.close}
                  </td>

                  {/* To Pivot */}
                  <td className="py-2.5 px-3 text-right font-semibold text-xs text-foreground">
                    {row.toPivot}
                  </td>

                  {/* 1M % */}
                  <td
                    className={`py-2.5 px-3 text-right font-semibold text-xs ${
                      row.perf1m.startsWith("+") ? "text-bull" : "text-rose-500"
                    }`}
                  >
                    {row.perf1m}
                  </td>

                  {/* 3M % */}
                  <td
                    className={`py-2.5 px-3 text-right font-semibold text-xs ${
                      row.perf3m.startsWith("+") ? "text-bull" : "text-rose-500"
                    }`}
                  >
                    {row.perf3m}
                  </td>

                  {/* 52W High % */}
                  <td className="py-2.5 pr-4 pl-3 text-right text-muted-foreground text-xs font-medium">
                    {row.from52wHigh}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default TodaysSetupsTable;