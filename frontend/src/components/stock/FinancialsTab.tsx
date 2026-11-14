"use client";

import React, { useState } from "react";
import { StockFundamentals } from "@/lib/types";

interface FinancialsTabProps {
  fundamentals?: StockFundamentals | null;
  symbol?: string;
}

export function FinancialsTab({ fundamentals, symbol }: FinancialsTabProps) {
  const [viewStandalone, setViewStandalone] = useState(false);

  // Quarters mock/real data matching ScanTheCharts
  const quarters = [
    { period: "Dec 2024", sales: 591, exp: 480, op: 112, opm: "19%", oinc: 1.2, int: 18, dep: 26, pbt: 69, tax: "26%", pat: 51, eps: 1.48 },
    { period: "Mar 2025", sales: 499, exp: 441, op: 58, opm: "12%", oinc: 1.9, int: 21, dep: 28, pbt: 10, tax: "38%", pat: 6.4, eps: 0.19 },
    { period: "Jun 2025", sales: 632, exp: 545, op: 87, opm: "14%", oinc: 0.9, int: 23, dep: 32, pbt: 33, tax: "26%", pat: 25, eps: 0.71 },
    { period: "Sep 2025", sales: 709, exp: 623, op: 85, opm: "12%", oinc: 1.1, int: 28, dep: 38, pbt: 21, tax: "18%", pat: 17, eps: 0.50 },
    { period: "Dec 2025", sales: 929, exp: 756, op: 174, opm: "19%", oinc: 32.0, int: 22, dep: 46, pbt: 138, tax: "26%", pat: 103, eps: 2.92 },
    { period: "Mar 2026", sales: 797, exp: 688, op: 109, opm: "14%", oinc: 4.1, int: 24, dep: 67, pbt: 22, tax: "22%", pat: 18, eps: 0.50 },
    { period: "Jun 2026", sales: 997, exp: 858, op: 140, opm: "14%", oinc: 1.0, int: 25, dep: 64, pbt: 52, tax: "19%", pat: 42, eps: 1.15 },
    { period: "Sep 2026", sales: 906, exp: 785, op: 120, opm: "13%", oinc: 2.5, int: 30, dep: 68, pbt: 25, tax: "27%", pat: 18, eps: 0.50 },
  ];

  // Annual P&L data
  const annuals = [
    { year: "Mar 2021", sales: 539, exp: 490, op: 49, opm: "9%", oinc: 23, int: 16, dep: 6.7, pat: 16 },
    { year: "Mar 2022", sales: 629, exp: 565, op: 65, opm: "10%", oinc: 16, int: 19, dep: 7.5, pat: 22 },
    { year: "Mar 2023", sales: 839, exp: 755, op: 84, opm: "10%", oinc: 6.7, int: 21, dep: 8.2, pat: 34 },
    { year: "Mar 2024", sales: 1165, exp: 1017, op: 148, opm: "13%", oinc: 7.5, int: 24, dep: 9.1, pat: 68 },
    { year: "Mar 2025", sales: 1885, exp: 1627, op: 258, opm: "14%", oinc: 7.0, int: 28, dep: 10.5, pat: 122 },
    { year: "Mar 2026", sales: 3067, exp: 2612, op: 456, opm: "15%", oinc: 10.0, int: 32, dep: 12.0, pat: 240 },
    { year: "TTM", sales: 3629, exp: 3086, op: 543, opm: "15%", oinc: 40.0, int: 35, dep: 14.2, pat: 285 },
  ];

  return (
    <div className="space-y-6">
      {/* Quarterly Results Table */}
      <div className="p-4 rounded-xl border border-[#27272a] bg-[#1c1c2e] text-foreground shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#27272a]/60">
          <div>
            <h3 className="font-semibold text-sm text-zinc-100">Quarterly Results</h3>
            <p className="text-[11px] text-zinc-400">
              Consolidated Figures in ₹ Crore /{" "}
              <button
                type="button"
                onClick={() => setViewStandalone(!viewStandalone)}
                className="text-primary hover:underline font-medium"
              >
                {viewStandalone ? "View Consolidated" : "View Standalone"}
              </button>
            </p>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">
            {symbol ? `${symbol} Financials` : "NSE Equity"}
          </span>
        </div>

        <div className="overflow-x-auto no-scrollbar pt-2">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#27272a] text-zinc-400 font-mono text-[11px]">
                <th className="py-2.5 px-3 sticky left-0 bg-[#1c1c2e] z-10">Metric</th>
                {quarters.map((q) => (
                  <th key={q.period} className="py-2.5 px-3 text-right whitespace-nowrap">
                    {q.period}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#27272a]/40 tabular-nums font-mono text-[11px]">
              <tr className="hover:bg-white/[0.02]">
                <td className="py-2 px-3 sticky left-0 bg-[#1c1c2e] z-10 font-sans font-medium text-zinc-200">Sales</td>
                {quarters.map((q) => <td key={q.period} className="py-2 px-3 text-right font-bold text-white">{q.sales}</td>)}
              </tr>
              <tr className="hover:bg-white/[0.02]">
                <td className="py-2 px-3 sticky left-0 bg-[#1c1c2e] z-10 font-sans text-zinc-400">Expenses</td>
                {quarters.map((q) => <td key={q.period} className="py-2 px-3 text-right text-zinc-300">{q.exp}</td>)}
              </tr>
              <tr className="hover:bg-white/[0.02] bg-zinc-900/40">
                <td className="py-2 px-3 sticky left-0 bg-[#1c1c2e] z-10 font-sans font-semibold text-zinc-100">Operating Profit</td>
                {quarters.map((q) => <td key={q.period} className="py-2 px-3 text-right font-bold text-emerald-400">{q.op}</td>)}
              </tr>
              <tr className="hover:bg-white/[0.02]">
                <td className="py-2 px-3 sticky left-0 bg-[#1c1c2e] z-10 font-sans text-zinc-400">OPM %</td>
                {quarters.map((q) => <td key={q.period} className="py-2 px-3 text-right text-zinc-300">{q.opm}</td>)}
              </tr>
              <tr className="hover:bg-white/[0.02]">
                <td className="py-2 px-3 sticky left-0 bg-[#1c1c2e] z-10 font-sans text-zinc-400">Other Income</td>
                {quarters.map((q) => <td key={q.period} className="py-2 px-3 text-right text-zinc-400">{q.oinc}</td>)}
              </tr>
              <tr className="hover:bg-white/[0.02]">
                <td className="py-2 px-3 sticky left-0 bg-[#1c1c2e] z-10 font-sans text-zinc-400">Interest</td>
                {quarters.map((q) => <td key={q.period} className="py-2 px-3 text-right text-zinc-400">{q.int}</td>)}
              </tr>
              <tr className="hover:bg-white/[0.02]">
                <td className="py-2 px-3 sticky left-0 bg-[#1c1c2e] z-10 font-sans text-zinc-400">Depreciation</td>
                {quarters.map((q) => <td key={q.period} className="py-2 px-3 text-right text-zinc-400">{q.dep}</td>)}
              </tr>
              <tr className="hover:bg-white/[0.02]">
                <td className="py-2 px-3 sticky left-0 bg-[#1c1c2e] z-10 font-sans text-zinc-300">Profit before tax</td>
                {quarters.map((q) => <td key={q.period} className="py-2 px-3 text-right text-zinc-200">{q.pbt}</td>)}
              </tr>
              <tr className="hover:bg-white/[0.02]">
                <td className="py-2 px-3 sticky left-0 bg-[#1c1c2e] z-10 font-sans text-zinc-400">Tax %</td>
                {quarters.map((q) => <td key={q.period} className="py-2 px-3 text-right text-zinc-400">{q.tax}</td>)}
              </tr>
              <tr className="hover:bg-white/[0.02] bg-indigo-500/10">
                <td className="py-2 px-3 sticky left-0 bg-[#1c1c2e] z-10 font-sans font-bold text-indigo-300">Net Profit</td>
                {quarters.map((q) => (
                  <td key={q.period} className={`py-2 px-3 text-right font-bold ${q.pat >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                    {q.pat}
                  </td>
                ))}
              </tr>
              <tr className="hover:bg-white/[0.02]">
                <td className="py-2 px-3 sticky left-0 bg-[#1c1c2e] z-10 font-sans font-semibold text-zinc-200">EPS in ₹</td>
                {quarters.map((q) => <td key={q.period} className="py-2 px-3 text-right font-bold text-white">{q.eps}</td>)}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Profit & Loss Table */}
      <div className="p-4 rounded-xl border border-[#27272a] bg-[#1c1c2e] text-foreground shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#27272a]/60">
          <div>
            <h3 className="font-semibold text-sm text-zinc-100">Profit & Loss (Annual)</h3>
            <p className="text-[11px] text-zinc-400">Consolidated Figures in ₹ Crore</p>
          </div>
        </div>

        <div className="overflow-x-auto no-scrollbar pt-2">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#27272a] text-zinc-400 font-mono text-[11px]">
                <th className="py-2.5 px-3 sticky left-0 bg-[#1c1c2e] z-10">Metric</th>
                {annuals.map((a) => (
                  <th key={a.year} className="py-2.5 px-3 text-right whitespace-nowrap">
                    {a.year}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#27272a]/40 tabular-nums font-mono text-[11px]">
              <tr className="hover:bg-white/[0.02]">
                <td className="py-2 px-3 sticky left-0 bg-[#1c1c2e] z-10 font-sans font-medium text-zinc-200">Sales</td>
                {annuals.map((a) => <td key={a.year} className="py-2 px-3 text-right font-bold text-white">{a.sales}</td>)}
              </tr>
              <tr className="hover:bg-white/[0.02]">
                <td className="py-2 px-3 sticky left-0 bg-[#1c1c2e] z-10 font-sans text-zinc-400">Expenses</td>
                {annuals.map((a) => <td key={a.year} className="py-2 px-3 text-right text-zinc-300">{a.exp}</td>)}
              </tr>
              <tr className="hover:bg-white/[0.02] bg-zinc-900/40">
                <td className="py-2 px-3 sticky left-0 bg-[#1c1c2e] z-10 font-sans font-semibold text-zinc-100">Operating Profit</td>
                {annuals.map((a) => <td key={a.year} className="py-2 px-3 text-right font-bold text-emerald-400">{a.op}</td>)}
              </tr>
              <tr className="hover:bg-white/[0.02]">
                <td className="py-2 px-3 sticky left-0 bg-[#1c1c2e] z-10 font-sans text-zinc-400">OPM %</td>
                {annuals.map((a) => <td key={a.year} className="py-2 px-3 text-right text-zinc-300">{a.opm}</td>)}
              </tr>
              <tr className="hover:bg-white/[0.02] bg-indigo-500/10">
                <td className="py-2 px-3 sticky left-0 bg-[#1c1c2e] z-10 font-sans font-bold text-indigo-300">Net Profit</td>
                {annuals.map((a) => <td key={a.year} className="py-2 px-3 text-right font-bold text-emerald-400">{a.pat}</td>)}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default FinancialsTab;
