"use client";

import React, { useState } from "react";
import Link from "next/link";
import { EarningsHorizonItem } from "./types";
import { Calendar, Filter } from "lucide-react";

interface EarningsHorizonTableProps {
  earnings: EarningsHorizonItem[];
}

export function EarningsHorizonTable({ earnings }: EarningsHorizonTableProps) {
  const [filterLargeCap, setFilterLargeCap] = useState(false);

  const displayedEarnings = filterLargeCap
    ? earnings.filter((e) => e.market_cap_cr >= 25000)
    : earnings;

  return (
    <div className="p-6 rounded-2xl border border-border bg-card shadow-sm space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-border/60">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-accent/10 text-accent">
            <Calendar className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-semibold text-sm tracking-tight">Earnings Horizon</h3>
            <p className="text-xs text-muted-foreground">Upcoming quarterly results & consensus reporting window</p>
          </div>
        </div>

        {/* Filter Toggle */}
        <button
          onClick={() => setFilterLargeCap(!filterLargeCap)}
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
            filterLargeCap
              ? "bg-accent text-white border-accent"
              : "bg-muted/40 border-border text-muted-foreground hover:text-foreground"
          }`}
        >
          <Filter className="h-3 w-3" />
          <span>{filterLargeCap ? "Large-Caps Only (>₹25k Cr)" : "All Market Caps"}</span>
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-border/60 text-muted-foreground font-semibold">
              <th className="pb-2">Symbol</th>
              <th className="pb-2">Company Name</th>
              <th className="pb-2">Report Date</th>
              <th className="pb-2 text-right">Market Cap (₹ Cr)</th>
              <th className="pb-2 text-right">Timing</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40 font-mono">
            {displayedEarnings.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-6 text-center text-muted-foreground font-sans">
                  No earnings reports matching active filters.
                </td>
              </tr>
            ) : (
              displayedEarnings.map((item) => (
                <tr
                  key={item.symbol}
                  className="hover:bg-muted/30 transition-colors group"
                >
                  <td className="py-2.5 font-bold">
                    <Link
                      href={`/stock/${item.symbol}`}
                      className="text-accent hover:underline flex items-center gap-1"
                    >
                      {item.symbol}
                    </Link>
                  </td>
                  <td className="py-2.5 font-sans font-medium text-foreground truncate max-w-[200px]">
                    {item.company_name}
                  </td>
                  <td className="py-2.5 text-muted-foreground">{item.report_date}</td>
                  <td className="py-2.5 text-right font-semibold text-foreground">
                    ₹{item.market_cap_cr.toLocaleString()}
                  </td>
                  <td className="py-2.5 text-right">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-sans font-semibold border ${
                        item.timing === "Before Market"
                          ? "bg-bull/10 border-bull/30 text-bull"
                          : "bg-muted border-border text-muted-foreground"
                      }`}
                    >
                      {item.timing}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
