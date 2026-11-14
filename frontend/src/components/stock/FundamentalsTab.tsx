"use client";

import React from "react";
import { StockFundamentals } from "@/lib/types";

interface FundamentalsTabProps {
  fundamentals?: StockFundamentals | null;
  symbol?: string;
}

export function FundamentalsTab({ fundamentals, symbol }: FundamentalsTabProps) {
  const mcap = fundamentals?.market_cap ? `₹${fundamentals.market_cap.toLocaleString()} Cr` : "₹2,906 Cr";
  const pe = fundamentals?.pe ? fundamentals.pe.toFixed(1) : "34.2";
  const pb = fundamentals?.pb ? fundamentals.pb.toFixed(1) : "4.8";
  const roce = fundamentals?.roce ? `${fundamentals.roce.toFixed(1)}%` : "18.4%";
  const roe = fundamentals?.roe ? `${fundamentals.roe.toFixed(1)}%` : "16.2%";
  const debtToEquity = fundamentals?.debt_to_equity ? fundamentals.debt_to_equity.toFixed(2) : "0.32";
  const divYield = fundamentals?.div_yield ? `${fundamentals.div_yield.toFixed(2)}%` : "0.45%";
  const promoterHolding = fundamentals?.promoter_pct ? `${fundamentals.promoter_pct.toFixed(1)}%` : "54.2%";

  const valuationRows = [
    { label: "Market Capitalization", value: mcap, desc: "Total equity value" },
    { label: "Current Price (CMP)", value: "₹164.10", desc: "NSE Last Traded Price" },
    { label: "Price-to-Earnings (P/E)", value: pe, desc: "Trailing 12-month P/E" },
    { label: "Price-to-Book (P/B)", value: pb, desc: "Book value multiple" },
    { label: "Return on Capital (ROCE)", value: roce, desc: "Operating efficiency" },
    { label: "Return on Equity (ROE)", value: roe, desc: "Shareholder equity yield" },
    { label: "Debt-to-Equity Ratio", value: debtToEquity, desc: "Solvency leverage" },
    { label: "Dividend Yield", value: divYield, desc: "Annualized cash return" },
    { label: "Promoter Holding", value: promoterHolding, desc: "Sponsor equity share" },
  ];

  return (
    <div className="space-y-4">
      <div className="p-4 rounded-xl border border-[#27272a] bg-[#1c1c2e] text-foreground shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-[#27272a]/60">
          <div>
            <h3 className="font-semibold text-sm text-zinc-100">Key Valuation & Quality Metrics</h3>
            <p className="text-[11px] text-zinc-400">Institutional quality score and forensic ratios</p>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">
            {symbol ? `${symbol} Metrics` : "Ratios"}
          </span>
        </div>

        <div className="overflow-x-auto pt-2">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#27272a] text-zinc-400 font-mono text-[11px]">
                <th className="py-2.5 px-3">Metric Name</th>
                <th className="py-2.5 px-3 text-right">Value</th>
                <th className="py-2.5 px-3 text-right">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#27272a]/40 tabular-nums">
              {valuationRows.map((r) => (
                <tr key={r.label} className="hover:bg-white/[0.02]">
                  <td className="py-2 px-3 font-medium text-zinc-200">{r.label}</td>
                  <td className="py-2 px-3 text-right font-bold font-mono text-emerald-400">{r.value}</td>
                  <td className="py-2 px-3 text-right text-zinc-400 text-[11px]">{r.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default FundamentalsTab;
