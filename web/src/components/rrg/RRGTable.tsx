"use client";

import React, { useState } from "react";
import Link from "next/link";
import { RRGItem } from "./types";
import { ArrowUpDown, ExternalLink, Search } from "lucide-react";

interface RRGTableProps {
  items: RRGItem[];
  highlightSymbol: string | null;
  onHoverSymbol: (sym: string | null) => void;
}

export function RRGTable({ items, highlightSymbol, onHoverSymbol }: RRGTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedQuadrant, setSelectedQuadrant] = useState<string>("all");
  const [sortField, setSortField] = useState<"rs_ratio" | "rs_momentum" | "change_1d">("rs_ratio");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  // Filtering
  const filtered = items.filter((item) => {
    const matchesSearch =
      item.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesQuad =
      selectedQuadrant === "all" || item.quadrant.toLowerCase() === selectedQuadrant.toLowerCase();
    return matchesSearch && matchesQuad;
  });

  // Sorting
  const sorted = [...filtered].sort((a, b) => {
    const vA = a[sortField];
    const vB = b[sortField];
    return sortDirection === "asc" ? vA - vB : vB - vA;
  });

  const toggleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-4">
      {/* Search & Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-border/60">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-sm tracking-tight text-foreground">
            Rotational Rankings ({sorted.length})
          </h3>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Search Box */}
          <div className="relative">
            <Search className="h-3.5 w-3.5 absolute left-3 top-2.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search symbol or sector..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded-lg text-xs bg-muted/40 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent w-48 sm:w-56"
            />
          </div>

          {/* Quadrant Quick Filter Pills */}
          <div className="flex items-center gap-1 p-0.5 rounded-lg bg-muted/30 border border-border/50 text-[11px]">
            {["all", "Leading", "Weakening", "Lagging", "Improving"].map((q) => (
              <button
                key={q}
                onClick={() => setSelectedQuadrant(q)}
                className={`px-2 py-1 rounded-md font-medium capitalize transition-all ${
                  selectedQuadrant === q
                    ? "bg-card text-foreground shadow-sm font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs font-mono">
          <thead>
            <tr className="border-b border-border/60 text-muted-foreground font-semibold font-sans">
              <th className="pb-2">Security / Sector</th>
              <th className="pb-2">Quadrant</th>
              <th
                className="pb-2 text-right cursor-pointer hover:text-foreground transition-colors"
                onClick={() => toggleSort("rs_ratio")}
              >
                <div className="inline-flex items-center gap-1">
                  <span>RS-Ratio</span>
                  <ArrowUpDown className="h-3 w-3" />
                </div>
              </th>
              <th
                className="pb-2 text-right cursor-pointer hover:text-foreground transition-colors"
                onClick={() => toggleSort("rs_momentum")}
              >
                <div className="inline-flex items-center gap-1">
                  <span>RS-Momentum</span>
                  <ArrowUpDown className="h-3 w-3" />
                </div>
              </th>
              <th className="pb-2 text-right">CMP (₹)</th>
              <th
                className="pb-2 text-right cursor-pointer hover:text-foreground transition-colors"
                onClick={() => toggleSort("change_1d")}
              >
                <div className="inline-flex items-center gap-1">
                  <span>1D Change</span>
                  <ArrowUpDown className="h-3 w-3" />
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            {sorted.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-6 text-center text-muted-foreground font-sans">
                  No securities matching current filter criteria.
                </td>
              </tr>
            ) : (
              sorted.map((item) => {
                const isHighlighted = highlightSymbol === item.symbol;
                return (
                  <tr
                    key={item.symbol}
                    onMouseEnter={() => onHoverSymbol(item.symbol)}
                    onMouseLeave={() => onHoverSymbol(null)}
                    className={`hover:bg-muted/30 transition-colors cursor-pointer ${
                      isHighlighted ? "bg-accent/10" : ""
                    }`}
                  >
                    <td className="py-2.5">
                      <div className="flex items-center gap-2">
                        <span
                          className="h-2 w-2 rounded-full flex-shrink-0"
                          style={{ backgroundColor: item.color }}
                        />
                        {item.group === "top-momentum" ? (
                          <Link
                            href={`/stock/${item.symbol}`}
                            className="font-bold text-accent hover:underline flex items-center gap-1"
                          >
                            <span>{item.symbol}</span>
                            <ExternalLink className="h-3 w-3 opacity-60" />
                          </Link>
                        ) : (
                          <span className="font-bold text-foreground">{item.symbol}</span>
                        )}
                        <span className="text-muted-foreground font-sans truncate max-w-[150px] hidden sm:inline">
                          {item.name}
                        </span>
                      </div>
                    </td>

                    <td className="py-2.5 font-sans">
                      <span
                        className="text-[10px] font-bold px-2 py-0.5 rounded-full border"
                        style={{
                          borderColor: `${item.color}50`,
                          backgroundColor: `${item.color}15`,
                          color: item.color,
                        }}
                      >
                        {item.quadrant}
                      </span>
                    </td>

                    <td className="py-2.5 text-right font-bold text-foreground">
                      {item.rs_ratio.toFixed(2)}
                    </td>

                    <td className="py-2.5 text-right font-bold text-foreground">
                      {item.rs_momentum.toFixed(2)}
                    </td>

                    <td className="py-2.5 text-right text-muted-foreground">
                      ₹{item.cmp.toLocaleString()}
                    </td>

                    <td
                      className={`py-2.5 text-right font-bold ${
                        item.change_1d >= 0 ? "text-bull" : "text-bear"
                      }`}
                    >
                      {item.change_1d >= 0 ? "+" : ""}
                      {item.change_1d}%
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
