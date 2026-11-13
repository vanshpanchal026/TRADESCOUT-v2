"use client";

import React, { useState } from "react";
import { StockFundamentals } from "@/lib/types";

interface FundamentalsTableProps {
  fundamentals: StockFundamentals;
}

export default function FundamentalsTable({ fundamentals }: FundamentalsTableProps) {
  const [viewMode, setViewMode] = useState<"quarterly" | "annual">("quarterly");
  const quarters = fundamentals.quarterly || [];
  const annuals = fundamentals.annual || [];

  const formatCr = (val?: number | null) => {
    if (val === null || val === undefined) return "—";
    return `₹${val.toLocaleString("en-IN", { maximumFractionDigits: 1 })} Cr`;
  };

  const formatPct = (val?: number | null) => {
    if (val === null || val === undefined) return "—";
    const sign = val > 0 ? "+" : "";
    return `${sign}${val.toFixed(1)}%`;
  };

  const formatNum = (val?: number | null) => {
    if (val === null || val === undefined) return "—";
    return val.toFixed(2);
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Top Valuation & Quality Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800/80 backdrop-blur-md">
          <span className="text-[11px] text-slate-500 uppercase font-semibold tracking-wider block">
            Market Cap
          </span>
          <span className="text-base font-bold text-slate-100 font-mono mt-1 block">
            {formatCr(fundamentals.market_cap)}
          </span>
        </div>

        <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800/80 backdrop-blur-md">
          <span className="text-[11px] text-slate-500 uppercase font-semibold tracking-wider block">
            P/E Ratio
          </span>
          <span className="text-base font-bold text-slate-100 font-mono mt-1 block">
            {formatNum(fundamentals.pe)}
          </span>
        </div>

        <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800/80 backdrop-blur-md">
          <span className="text-[11px] text-slate-500 uppercase font-semibold tracking-wider block">
            ROCE
          </span>
          <span className="text-base font-bold text-emerald-400 font-mono mt-1 block">
            {fundamentals.roce ? `${fundamentals.roce.toFixed(1)}%` : "—"}
          </span>
        </div>

        <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800/80 backdrop-blur-md">
          <span className="text-[11px] text-slate-500 uppercase font-semibold tracking-wider block">
            ROE
          </span>
          <span className="text-base font-bold text-emerald-400 font-mono mt-1 block">
            {fundamentals.roe ? `${fundamentals.roe.toFixed(1)}%` : "—"}
          </span>
        </div>

        <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800/80 backdrop-blur-md">
          <span className="text-[11px] text-slate-500 uppercase font-semibold tracking-wider block">
            Debt / Equity
          </span>
          <span className="text-base font-bold text-slate-100 font-mono mt-1 block">
            {formatNum(fundamentals.debt_to_equity)}
          </span>
        </div>

        <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800/80 backdrop-blur-md">
          <span className="text-[11px] text-slate-500 uppercase font-semibold tracking-wider block">
            Book Value
          </span>
          <span className="text-base font-bold text-slate-100 font-mono mt-1 block">
            ₹{formatNum(fundamentals.book_value)}
          </span>
        </div>
      </div>

      {/* Financials Table Container */}
      <div className="bg-slate-900/60 rounded-xl border border-slate-800/80 overflow-hidden backdrop-blur-md">
        {/* Table Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-b border-slate-800 bg-slate-950/40">
          <div>
            <h3 className="text-base font-semibold text-slate-100">
              Screener-Style Financial Statements
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              5-Year historical reporting horizon · Consolidated figures in ₹ Crores
            </p>
          </div>

          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
            <button
              onClick={() => setViewMode("quarterly")}
              className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                viewMode === "quarterly"
                  ? "bg-cyan-500 text-slate-950 font-bold shadow"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Quarterly ({quarters.length}Q)
            </button>
            <button
              onClick={() => setViewMode("annual")}
              className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                viewMode === "annual"
                  ? "bg-cyan-500 text-slate-950 font-bold shadow"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Annual ({annuals.length}Y)
            </button>
          </div>
        </div>

        {/* Scrollable Data Table */}
        <div className="overflow-x-auto">
          {viewMode === "quarterly" ? (
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-950/60 text-slate-400 border-b border-slate-800 font-sans font-semibold">
                <tr>
                  <th className="py-3 px-4 sticky left-0 bg-slate-950 z-10 w-44 min-w-[170px] border-r border-slate-800/80">
                    Metric
                  </th>
                  {quarters.map((q, idx) => (
                    <th key={idx} className="py-3 px-4 min-w-[110px] text-right font-medium">
                      {q.quarter}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {/* Sales */}
                <tr className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 px-4 font-semibold text-slate-200 sticky left-0 bg-slate-900 border-r border-slate-800/80 font-sans">
                    Sales (Revenue)
                  </td>
                  {quarters.map((q, idx) => (
                    <td key={idx} className="py-3 px-4 text-right font-bold">
                      {q.sales ? `₹${q.sales.toLocaleString("en-IN")}` : "—"}
                    </td>
                  ))}
                </tr>

                {/* Sales YoY */}
                <tr className="hover:bg-slate-800/30 transition-colors bg-slate-950/20">
                  <td className="py-2.5 px-4 text-slate-400 sticky left-0 bg-slate-900 border-r border-slate-800/80 font-sans">
                    Sales YoY %
                  </td>
                  {quarters.map((q, idx) => (
                    <td
                      key={idx}
                      className={`py-2.5 px-4 text-right font-semibold ${
                        (q.sales_yoy || 0) > 0
                          ? "text-emerald-400"
                          : (q.sales_yoy || 0) < 0
                          ? "text-rose-400"
                          : "text-slate-400"
                      }`}
                    >
                      {formatPct(q.sales_yoy)}
                    </td>
                  ))}
                </tr>

                {/* EBITDA */}
                <tr className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 px-4 font-medium text-slate-200 sticky left-0 bg-slate-900 border-r border-slate-800/80 font-sans">
                    EBITDA / Operating Profit
                  </td>
                  {quarters.map((q, idx) => (
                    <td key={idx} className="py-3 px-4 text-right">
                      {q.ebitda ? `₹${q.ebitda.toLocaleString("en-IN")}` : "—"}
                    </td>
                  ))}
                </tr>

                {/* OPM % */}
                <tr className="hover:bg-slate-800/30 transition-colors bg-slate-950/20">
                  <td className="py-2.5 px-4 text-slate-400 sticky left-0 bg-slate-900 border-r border-slate-800/80 font-sans">
                    OPM % (Margin)
                  </td>
                  {quarters.map((q, idx) => (
                    <td key={idx} className="py-2.5 px-4 text-right text-cyan-400">
                      {q.opm ? `${q.opm.toFixed(1)}%` : "—"}
                    </td>
                  ))}
                </tr>

                {/* Net Profit */}
                <tr className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 px-4 font-semibold text-slate-200 sticky left-0 bg-slate-900 border-r border-slate-800/80 font-sans">
                    Net Profit
                  </td>
                  {quarters.map((q, idx) => (
                    <td
                      key={idx}
                      className={`py-3 px-4 text-right font-bold ${
                        (q.net_profit || 0) >= 0 ? "text-slate-100" : "text-rose-400"
                      }`}
                    >
                      {q.net_profit ? `₹${q.net_profit.toLocaleString("en-IN")}` : "—"}
                    </td>
                  ))}
                </tr>

                {/* Net Profit YoY % */}
                <tr className="hover:bg-slate-800/30 transition-colors bg-slate-950/20">
                  <td className="py-2.5 px-4 text-slate-400 sticky left-0 bg-slate-900 border-r border-slate-800/80 font-sans">
                    Net Profit YoY %
                  </td>
                  {quarters.map((q, idx) => (
                    <td
                      key={idx}
                      className={`py-2.5 px-4 text-right font-semibold ${
                        (q.np_yoy || 0) > 0
                          ? "text-emerald-400"
                          : (q.np_yoy || 0) < 0
                          ? "text-rose-400"
                          : "text-slate-400"
                      }`}
                    >
                      {formatPct(q.np_yoy)}
                    </td>
                  ))}
                </tr>

                {/* EPS */}
                <tr className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 px-4 font-semibold text-slate-200 sticky left-0 bg-slate-900 border-r border-slate-800/80 font-sans">
                    EPS in ₹
                  </td>
                  {quarters.map((q, idx) => (
                    <td key={idx} className="py-3 px-4 text-right font-bold text-amber-400">
                      {formatNum(q.eps)}
                    </td>
                  ))}
                </tr>

                {/* EPS YoY % */}
                <tr className="hover:bg-slate-800/30 transition-colors bg-slate-950/20">
                  <td className="py-2.5 px-4 text-slate-400 sticky left-0 bg-slate-900 border-r border-slate-800/80 font-sans">
                    EPS YoY Growth %
                  </td>
                  {quarters.map((q, idx) => (
                    <td
                      key={idx}
                      className={`py-2.5 px-4 text-right font-semibold ${
                        (q.eps_yoy || 0) > 0
                          ? "text-emerald-400"
                          : (q.eps_yoy || 0) < 0
                          ? "text-rose-400"
                          : "text-slate-400"
                      }`}
                    >
                      {formatPct(q.eps_yoy)}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          ) : (
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-950/60 text-slate-400 border-b border-slate-800 font-sans font-semibold">
                <tr>
                  <th className="py-3 px-4 sticky left-0 bg-slate-950 z-10 w-44 border-r border-slate-800/80">
                    Metric
                  </th>
                  {annuals.map((a, idx) => (
                    <th key={idx} className="py-3 px-4 min-w-[120px] text-right font-medium">
                      {a.year}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                <tr className="hover:bg-slate-800/30">
                  <td className="py-3 px-4 font-semibold text-slate-200 sticky left-0 bg-slate-900 border-r border-slate-800 font-sans">
                    Sales
                  </td>
                  {annuals.map((a, idx) => (
                    <td key={idx} className="py-3 px-4 text-right font-bold">
                      {a.sales ? `₹${a.sales.toLocaleString("en-IN")}` : "—"}
                    </td>
                  ))}
                </tr>
                <tr className="hover:bg-slate-800/30 bg-slate-950/20">
                  <td className="py-2.5 px-4 text-slate-400 sticky left-0 bg-slate-900 border-r border-slate-800 font-sans">
                    Sales Growth %
                  </td>
                  {annuals.map((a, idx) => (
                    <td
                      key={idx}
                      className={`py-2.5 px-4 text-right font-semibold ${
                        (a.sales_growth || 0) > 0 ? "text-emerald-400" : "text-rose-400"
                      }`}
                    >
                      {formatPct(a.sales_growth)}
                    </td>
                  ))}
                </tr>
                <tr className="hover:bg-slate-800/30">
                  <td className="py-3 px-4 font-semibold text-slate-200 sticky left-0 bg-slate-900 border-r border-slate-800 font-sans">
                    Net Profit
                  </td>
                  {annuals.map((a, idx) => (
                    <td key={idx} className="py-3 px-4 text-right font-bold">
                      {a.net_profit ? `₹${a.net_profit.toLocaleString("en-IN")}` : "—"}
                    </td>
                  ))}
                </tr>
                <tr className="hover:bg-slate-800/30 bg-slate-950/20">
                  <td className="py-2.5 px-4 text-slate-400 sticky left-0 bg-slate-900 border-r border-slate-800 font-sans">
                    Net Profit Growth %
                  </td>
                  {annuals.map((a, idx) => (
                    <td
                      key={idx}
                      className={`py-2.5 px-4 text-right font-semibold ${
                        (a.np_growth || 0) > 0 ? "text-emerald-400" : "text-rose-400"
                      }`}
                    >
                      {formatPct(a.np_growth)}
                    </td>
                  ))}
                </tr>
                <tr className="hover:bg-slate-800/30">
                  <td className="py-3 px-4 font-semibold text-slate-200 sticky left-0 bg-slate-900 border-r border-slate-800 font-sans">
                    EPS in ₹
                  </td>
                  {annuals.map((a, idx) => (
                    <td key={idx} className="py-3 px-4 text-right font-bold text-amber-400">
                      {formatNum(a.eps)}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
