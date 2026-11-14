"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Newspaper,
  Globe,
  Briefcase,
  Star,
  Search,
  ExternalLink,
} from "lucide-react";

interface NewsEntry {
  id: string;
  stream: "stock" | "global" | "orders" | "watchlist";
  time: string;
  symbol: string;
  headline: string;
  category: "E" | "O" | "C" | "R" | "M";
  badgeType: "Company announcement" | "Proposed" | "High impact";
}

const NEWS_FEED: NewsEntry[] = [
  {
    id: "1",
    stream: "stock",
    time: "20:50",
    symbol: "KERNEX",
    headline: "Kernex grants 25,000 employee stock options; exercise price ₹25.",
    category: "C",
    badgeType: "Company announcement",
  },
  {
    id: "2",
    stream: "stock",
    time: "20:49",
    symbol: "ALGOQUANT",
    headline: "Algoquant approves Q2/H1 FY27 financial results; standard earnings release.",
    category: "E",
    badgeType: "Company announcement",
  },
  {
    id: "3",
    stream: "stock",
    time: "20:43",
    symbol: "JSLL",
    headline: "Board approves Q2 FY2026-27 unaudited financial results.",
    category: "E",
    badgeType: "Company announcement",
  },
  {
    id: "4",
    stream: "stock",
    time: "20:40",
    symbol: "GICL",
    headline: "Globe International Carriers reports Q2 FY27 results; unmodified audit opinion.",
    category: "E",
    badgeType: "Company announcement",
  },
  {
    id: "5",
    stream: "stock",
    time: "20:37",
    symbol: "GUFICBIO",
    headline: "Gufic Biosciences: Q2 FY27; US FDA progress, international expansion.",
    category: "R",
    badgeType: "Company announcement",
  },
  {
    id: "6",
    stream: "stock",
    time: "20:34",
    symbol: "AGL",
    headline: "Allcargo Global Board approves Q2 FY27 financial results.",
    category: "E",
    badgeType: "Company announcement",
  },
  {
    id: "7",
    stream: "stock",
    time: "20:33",
    symbol: "VIKRAMSOLR",
    headline: "IPO proceeds utilized as planned, but project implementation delayed.",
    category: "C",
    badgeType: "Proposed",
  },
  {
    id: "8",
    stream: "stock",
    time: "20:29",
    symbol: "VIKRAMSOLR",
    headline: "Vikram Solar board approves Q2FY27 financial results.",
    category: "E",
    badgeType: "Company announcement",
  },
  {
    id: "9",
    stream: "stock",
    time: "20:09",
    symbol: "SWASTIKAIN",
    headline: "IPO proceeds utilized as planned, no deviation reported.",
    category: "C",
    badgeType: "Proposed",
  },
  {
    id: "10",
    stream: "stock",
    time: "20:07",
    symbol: "KELLTONTEC",
    headline: "Kellton Tech: Q2 FY27 with rising EBITDA margin.",
    category: "E",
    badgeType: "Company announcement",
  },
  {
    id: "11",
    stream: "orders",
    time: "19:45",
    symbol: "BEL",
    headline: "Bharat Electronics secures ₹1,155 Cr order for multi-function radar systems.",
    category: "O",
    badgeType: "Company announcement",
  },
  {
    id: "12",
    stream: "global",
    time: "19:15",
    symbol: "GLOBAL",
    headline: "US Federal Reserve signals pause on rate path amidst softening core PCE.",
    category: "R",
    badgeType: "High impact",
  },
];

export default function NewsPage() {
  const [activeStream, setActiveStream] = useState<"stock" | "global" | "orders" | "watchlist">("stock");
  const [activeCategory, setActiveCategory] = useState<"All" | "E" | "O" | "C" | "R" | "M">("All");
  const [searchQuery, setSearchQuery] = useState("");

  const streamTabs = [
    { id: "stock", name: "Stock news" },
    { id: "global", name: "Global" },
    { id: "orders", name: "Orders & deals" },
    { id: "watchlist", name: "My watchlist" },
  ] as const;

  const categoryChips = [
    { id: "All", label: "All" },
    { id: "E", label: "E - Earnings" },
    { id: "O", label: "O - Orders" },
    { id: "C", label: "C - Corp action" },
    { id: "R", label: "R - Regulatory" },
    { id: "M", label: "M - Management" },
  ] as const;

  const filtered = NEWS_FEED.filter((item) => {
    const matchStream = item.stream === activeStream;
    const matchCategory = activeCategory === "All" || item.category === activeCategory;
    const matchSearch =
      item.headline.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.symbol.toLowerCase().includes(searchQuery.toLowerCase());
    return matchStream && matchCategory && matchSearch;
  });

  return (
    <div className="min-h-screen p-3 sm:p-5 lg:p-6 max-w-[1400px] mx-auto space-y-4">
      {/* ================= TOP STREAM TABS & CATEGORY FILTERS (Screenshot 4) ================= */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-border/60">
        {/* Stream Tabs */}
        <div className="flex items-center gap-1">
          {streamTabs.map((tab) => {
            const active = activeStream === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveStream(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  active
                    ? "bg-white dark:bg-card text-primary font-bold shadow-xs border border-blue-200/60 dark:border-border"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                }`}
              >
                {tab.name}
              </button>
            );
          })}
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1">
          {categoryChips.map((chip) => {
            const active = activeCategory === chip.id;
            return (
              <button
                key={chip.id}
                onClick={() => setActiveCategory(chip.id)}
                className={`px-2.5 py-1 rounded-md text-xs font-mono transition-all cursor-pointer ${
                  active
                    ? "bg-primary text-white font-bold shadow-xs"
                    : "bg-slate-100 dark:bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                {chip.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Date Header matching Screenshot 4 */}
      <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground pt-1 pl-1 font-mono">
        SAT 14 NOV
      </div>

      {/* ================= TIMELINE FEED CARDS (Screenshot 4) ================= */}
      <div className="relative pl-6 sm:pl-16 space-y-2">
        {/* Vertical timeline line */}
        <div className="absolute left-2.5 sm:left-12 top-2 bottom-2 w-px bg-slate-200 dark:bg-border" />

        {filtered.map((item) => (
          <div key={item.id} className="relative flex items-center gap-3 group">
            {/* Blue timeline dot & timestamp */}
            <div className="absolute -left-6 sm:-left-16 flex items-center gap-2">
              <span className="hidden sm:inline font-mono text-[11px] text-muted-foreground w-10 text-right">
                {item.time}
              </span>
              <span className="w-2 h-2 rounded-full bg-primary ring-4 ring-background" />
            </div>

            {/* Modular News Card */}
            <div className="flex-1 rounded-xl bg-card border border-border/80 shadow-xs p-3 hover:border-primary/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="flex items-start sm:items-center gap-2.5">
                {/* Stock Circle Logo */}
                <div className="h-7 w-7 rounded-full bg-slate-100 dark:bg-muted flex items-center justify-center font-mono font-bold text-[10px] text-foreground shrink-0 border border-border/60">
                  {item.symbol.substring(0, 2)}
                </div>

                <div className="space-y-0.5">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <Link
                      href={`/stock/${item.symbol}`}
                      className="font-mono font-bold text-xs text-foreground hover:text-primary transition-colors"
                    >
                      {item.symbol}
                    </Link>
                    <span className="text-xs text-muted-foreground leading-snug">
                      {item.headline}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Tag Badges */}
              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center font-mono text-[10px]">
                <span
                  className={`px-1.5 py-0.2 rounded-full font-bold border ${
                    item.category === "E"
                      ? "bg-blue-50 text-blue-700 border-blue-200/60 dark:bg-blue-950/40 dark:text-blue-300"
                      : item.category === "O"
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200/60 dark:bg-emerald-950/40 dark:text-emerald-300"
                      : "bg-amber-50 text-amber-700 border-amber-200/60 dark:bg-amber-950/40 dark:text-amber-300"
                  }`}
                >
                  {item.category}
                </span>

                <span
                  className={`px-2 py-0.5 rounded-md font-sans font-semibold border ${
                    item.badgeType === "Proposed"
                      ? "bg-amber-50 text-amber-700 border-amber-200/60 dark:bg-amber-950/40 dark:text-amber-300"
                      : "bg-purple-50 text-purple-700 border-purple-200/60 dark:bg-purple-950/40 dark:text-purple-300"
                  }`}
                >
                  {item.badgeType}
                </span>
              </div>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="text-center py-12 text-xs text-muted-foreground bg-card rounded-2xl border border-border">
            No disclosures found matching current filters.
          </div>
        )}
      </div>

      {/* Bottom status bar */}
      <div className="flex items-center justify-between pt-4 border-t border-border/40 text-[10px] text-muted-foreground font-mono">
        <span>300 of 15,410 headlines</span>
        <span>Latest Sat 14 Nov 20:50 • Data delayed • Disclaimer</span>
      </div>
    </div>
  );
}