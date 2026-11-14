"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Newspaper,
  Globe,
  Briefcase,
  Star,
  Search,
  Clock,
  ExternalLink,
  Tag,
  AlertCircle,
  TrendingUp,
} from "lucide-react";

interface NewsItem {
  id: string;
  stream: "stock" | "global" | "orders" | "watchlist";
  category: "E" | "O" | "C" | "R" | "M";
  categoryLabel: string;
  symbol?: string;
  title: string;
  summary: string;
  source: string;
  timeAgo: string;
  impact: "High" | "Medium" | "Neutral";
}

const NEWS_DATA: NewsItem[] = [
  {
    id: "1",
    stream: "stock",
    category: "O",
    categoryLabel: "Orders (O)",
    symbol: "BEL",
    title: "Bharat Electronics secures ₹1,155 Cr order for multi-function radar systems",
    summary:
      "The contract involves supply of cutting-edge radar electronic subsystems to the Indian Navy with 24-month execution timelines.",
    source: "BSE Disclosures",
    timeAgo: "22 mins ago",
    impact: "High",
  },
  {
    id: "2",
    stream: "stock",
    category: "E",
    categoryLabel: "Earnings (E)",
    symbol: "TRENT",
    title: "Trent reports stellar Q2 PAT surge of 46.5% YoY; plans 100 new stores",
    summary:
      "Operating margins reached 15.4% as Zudio sales momentum continues across tier-2 and tier-3 Indian urban centers.",
    source: "Exchange Filing",
    timeAgo: "45 mins ago",
    impact: "High",
  },
  {
    id: "3",
    stream: "orders",
    category: "O",
    categoryLabel: "Orders (O)",
    symbol: "HAL",
    title: "Hindustan Aeronautics inks multi-year export agreement for aviation spares",
    summary:
      "Contract values exceed $85M with friendly partner nations in Southeast Asia for fleet maintenance and overhaul.",
    source: "Press Release",
    timeAgo: "1 hour ago",
    impact: "Medium",
  },
  {
    id: "4",
    stream: "global",
    category: "R",
    categoryLabel: "Regulatory (R)",
    title: "US Federal Reserve signals pause on interest rate path amidst softening core PCE",
    summary:
      "Global yields compress as Treasury 10-year benchmark declines 6 bps to 4.38%, boosting emerging market risk appetite.",
    source: "Bloomberg",
    timeAgo: "2 hours ago",
    impact: "High",
  },
  {
    id: "5",
    stream: "watchlist",
    category: "C",
    categoryLabel: "Corp Action (C)",
    symbol: "DIXON",
    title: "Dixon Technologies approves interim dividend of ₹12.00 per equity share",
    summary:
      "Record date for payment of dividend fixed as November 24, 2026. Shareholders register updated accordingly.",
    source: "NSE Disclosures",
    timeAgo: "3 hours ago",
    impact: "Neutral",
  },
  {
    id: "6",
    stream: "stock",
    category: "M",
    categoryLabel: "Management (M)",
    symbol: "INFY",
    title: "Infosys appoints new Chief Technology Officer for Enterprise Generative AI",
    summary:
      "Veteran technology executive will lead global client implementations for custom agentic AI pipelines.",
    source: "Company Release",
    timeAgo: "4 hours ago",
    impact: "Medium",
  },
  {
    id: "7",
    stream: "orders",
    category: "O",
    categoryLabel: "Orders (O)",
    symbol: "BHEL",
    title: "BHEL receives letter of award for 2x800 MW supercritical thermal project",
    summary:
      "Turnkey EPC order valued at ₹6,100 Cr won via competitive bidding process from state generation utility.",
    source: "Exchange Filing",
    timeAgo: "5 hours ago",
    impact: "High",
  },
];

export default function NewsPage() {
  const [activeStream, setActiveStream] = useState<"stock" | "global" | "orders" | "watchlist">("stock");
  const [activeCategory, setActiveCategory] = useState<"All" | "E" | "O" | "C" | "R" | "M">("All");
  const [searchQuery, setSearchQuery] = useState("");

  const streamTabs = [
    { id: "stock", name: "Stock news", icon: Newspaper },
    { id: "global", name: "Global", icon: Globe },
    { id: "orders", name: "Orders & deals", icon: Briefcase },
    { id: "watchlist", name: "My watchlist", icon: Star },
  ] as const;

  const categoryChips = [
    { id: "All", label: "All" },
    { id: "E", label: "Earnings (E)" },
    { id: "O", label: "Orders (O)" },
    { id: "C", label: "Corp Action (C)" },
    { id: "R", label: "Regulatory (R)" },
    { id: "M", label: "Management (M)" },
  ] as const;

  const filteredNews = NEWS_DATA.filter((n) => {
    const matchStream = n.stream === activeStream;
    const matchCategory = activeCategory === "All" || n.category === activeCategory;
    const matchSearch =
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (n.symbol && n.symbol.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchStream && matchCategory && matchSearch;
  });

  const getImpactBadge = (impact: "High" | "Medium" | "Neutral") => {
    switch (impact) {
      case "High":
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-bull/15 text-bull border border-bull/30">High Impact</span>;
      case "Medium":
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-primary/15 text-primary border border-primary/30">Medium</span>;
      case "Neutral":
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-muted text-muted-foreground border border-border">Neutral</span>;
    }
  };

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Market News Feed</h1>
            <span className="text-xs font-mono font-semibold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
              Direct Exchange Feeds
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Real-time categorized corporate disclosures, order wins, financial results &amp; macro regulatory wires
          </p>
        </div>

        {/* Quick Search */}
        <div className="relative w-full sm:w-64">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search news & filings..."
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-border bg-background text-foreground font-mono placeholder:font-sans"
          />
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 p-1 bg-muted/60 rounded-2xl border border-border">
          {streamTabs.map((tab) => {
            const Icon = tab.icon;
            const active = activeStream === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveStream(tab.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  active
                    ? "bg-card text-primary shadow-xs border border-border font-bold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </div>

        {/* Category Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1">
          {categoryChips.map((chip) => {
            const active = activeCategory === chip.id;
            return (
              <button
                key={chip.id}
                onClick={() => setActiveCategory(chip.id)}
                className={`px-2.5 py-1 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                  active
                    ? "bg-primary text-white font-bold shadow-xs"
                    : "bg-muted/40 text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                {chip.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* News Cards Feed */}
      <div className="space-y-3">
        {filteredNews.length === 0 ? (
          <div className="p-12 rounded-2xl border border-dashed border-border text-center space-y-2">
            <Newspaper className="h-8 w-8 text-muted-foreground mx-auto" />
            <h3 className="text-sm font-semibold text-foreground">No news matching filter</h3>
            <p className="text-xs text-muted-foreground">Try clearing search terms or switching category chips.</p>
          </div>
        ) : (
          filteredNews.map((item) => (
            <div
              key={item.id}
              className="p-5 rounded-2xl bg-card border border-border shadow-xs hover:border-primary/40 transition-colors space-y-2.5"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  {item.symbol && (
                    <Link
                      href={`/stock/${item.symbol}`}
                      className="px-2 py-0.5 rounded-md font-mono text-xs font-bold bg-primary/10 text-primary border border-primary/20 hover:underline"
                    >
                      {item.symbol}
                    </Link>
                  )}
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold bg-muted text-foreground border border-border">
                    {item.categoryLabel}
                  </span>
                  {getImpactBadge(item.impact)}
                </div>

                <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
                  <span>{item.source}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {item.timeAgo}
                  </span>
                </div>
              </div>

              <h2 className="text-base font-bold text-foreground leading-snug hover:text-primary transition-colors cursor-pointer">
                {item.title}
              </h2>

              <p className="text-xs text-muted-foreground leading-relaxed">
                {item.summary}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
