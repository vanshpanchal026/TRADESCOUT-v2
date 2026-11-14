"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Flame,
  TrendingUp,
  TrendingDown,
  Layers,
  Copy,
  Download,
  Check,
  Calendar,
  Sparkles,
  ArrowUpRight,
  ExternalLink,
  ChevronRight,
  Search,
  Filter,
} from "lucide-react";

interface LeaderStock {
  symbol: string;
  name: string;
  sector: string;
  price: string;
  change: string;
  isUp: boolean;
  rsScore: number;
  marketCap: string;
  stage: string;
  maStatus: string;
  hveMarker: string;
  eventTag: string;
  financials: {
    quarter: string;
    sales: string;
    salesYoY: string;
    ebitda: string;
    ebitdaMargin: string;
    pat: string;
    patYoY: string;
    eps: string;
  }[];
}

const LEADERS_DATA: LeaderStock[] = [
  {
    symbol: "TRENT",
    name: "Trent Limited",
    sector: "Retail & Apparel",
    price: "₹7,140.00",
    change: "+4.25%",
    isUp: true,
    rsScore: 98,
    marketCap: "₹2,53,800 Cr",
    stage: "Stage 2 Markup",
    maStatus: "Above SMA 10, 20, 50, 200",
    hveMarker: "HVE: Institutional Block Inflow (4.2x Vol)",
    eventTag: "Corporate: Q2 Net Profit +46% YoY",
    financials: [
      { quarter: "Q2 FY27", sales: "₹4,150 Cr", salesYoY: "+39.2%", ebitda: "₹640 Cr", ebitdaMargin: "15.4%", pat: "₹425 Cr", patYoY: "+46.5%", eps: "₹11.95" },
      { quarter: "Q1 FY27", sales: "₹3,880 Cr", salesYoY: "+51.0%", ebitda: "₹590 Cr", ebitdaMargin: "15.2%", pat: "₹392 Cr", patYoY: "+58.0%", eps: "₹11.02" },
      { quarter: "Q4 FY26", sales: "₹3,297 Cr", salesYoY: "+51.1%", ebitda: "₹480 Cr", ebitdaMargin: "14.6%", pat: "₹712 Cr", patYoY: "+112%", eps: "₹20.02" },
      { quarter: "Q3 FY26", sales: "₹3,466 Cr", salesYoY: "+52.5%", ebitda: "₹520 Cr", ebitdaMargin: "15.0%", pat: "₹370 Cr", patYoY: "+139%", eps: "₹10.40" },
      { quarter: "Q2 FY26", sales: "₹2,982 Cr", salesYoY: "+59.0%", ebitda: "₹430 Cr", ebitdaMargin: "14.4%", pat: "₹290 Cr", patYoY: "+150%", eps: "₹8.15" },
    ],
  },
  {
    symbol: "DIXON",
    name: "Dixon Technologies (India)",
    sector: "EMS & Electronics",
    price: "₹14,920.00",
    change: "+3.80%",
    isUp: true,
    rsScore: 96,
    marketCap: "₹89,400 Cr",
    stage: "Stage 2 Markup",
    maStatus: "Above SMA 10, 20, 50, 200",
    hveMarker: "HVE: Mobile Segment Volume Surge (3.8x)",
    eventTag: "Dividend: Interim ₹12.00/sh Announced",
    financials: [
      { quarter: "Q2 FY27", sales: "₹11,530 Cr", salesYoY: "+133%", ebitda: "₹420 Cr", ebitdaMargin: "3.6%", pat: "₹412 Cr", patYoY: "+263%", eps: "₹68.80" },
      { quarter: "Q1 FY27", sales: "₹6,580 Cr", salesYoY: "+101%", ebitda: "₹256 Cr", ebitdaMargin: "3.9%", pat: "₹140 Cr", patYoY: "+109%", eps: "₹23.40" },
      { quarter: "Q4 FY26", sales: "₹4,658 Cr", salesYoY: "+52.1%", ebitda: "₹185 Cr", ebitdaMargin: "4.0%", pat: "₹97 Cr", patYoY: "+21.2%", eps: "₹16.20" },
      { quarter: "Q3 FY26", sales: "₹4,818 Cr", salesYoY: "+100%", ebitda: "₹185 Cr", ebitdaMargin: "3.8%", pat: "₹97 Cr", patYoY: "+86.5%", eps: "₹16.20" },
      { quarter: "Q2 FY26", sales: "₹4,943 Cr", salesYoY: "+27.8%", ebitda: "₹199 Cr", ebitdaMargin: "4.0%", pat: "₹113 Cr", patYoY: "+47.0%", eps: "₹18.90" },
    ],
  },
  {
    symbol: "KAYNES",
    name: "Kaynes Technology India",
    sector: "EMS & Electronics",
    price: "₹5,410.00",
    change: "+5.12%",
    isUp: true,
    rsScore: 95,
    marketCap: "₹34,600 Cr",
    stage: "Stage 2 Markup",
    maStatus: "Above SMA 10, 20, 50, 200",
    hveMarker: "HVE: Semiconductor Facility Groundbreaking",
    eventTag: "Corporate: Orders Inflow +85% YoY",
    financials: [
      { quarter: "Q2 FY27", sales: "₹572 Cr", salesYoY: "+58.5%", ebitda: "₹78 Cr", ebitdaMargin: "13.6%", pat: "₹60 Cr", patYoY: "+86.2%", eps: "₹9.40" },
      { quarter: "Q1 FY27", sales: "₹504 Cr", salesYoY: "+69.7%", ebitda: "₹67 Cr", ebitdaMargin: "13.3%", pat: "₹50 Cr", patYoY: "+106%", eps: "₹7.85" },
      { quarter: "Q4 FY26", sales: "₹637 Cr", salesYoY: "+74.8%", ebitda: "₹88 Cr", ebitdaMargin: "13.8%", pat: "₹65 Cr", patYoY: "96.8%", eps: "₹10.20" },
      { quarter: "Q3 FY26", sales: "₹509 Cr", salesYoY: "+76.2%", ebitda: "₹69 Cr", ebitdaMargin: "13.6%", pat: "₹45 Cr", patYoY: "+97.2%", eps: "₹7.05" },
      { quarter: "Q2 FY26", sales: "₹361 Cr", salesYoY: "+32.1%", ebitda: "₹49 Cr", ebitdaMargin: "13.6%", pat: "₹32 Cr", patYoY: "+55.0%", eps: "₹5.05" },
    ],
  },
  {
    symbol: "BEL",
    name: "Bharat Electronics Ltd",
    sector: "Defence & Aerospace",
    price: "₹312.40",
    change: "+2.85%",
    isUp: true,
    rsScore: 93,
    marketCap: "₹2,28,400 Cr",
    stage: "Stage 2 Markup",
    maStatus: "Above SMA 10, 20, 50, 200",
    hveMarker: "HVE: Defense Radar Procurement Order",
    eventTag: "Corporate: Order Book at All-Time High ₹76K Cr",
    financials: [
      { quarter: "Q2 FY27", sales: "₹4,580 Cr", salesYoY: "+14.8%", ebitda: "₹1,210 Cr", ebitdaMargin: "26.4%", pat: "₹1,090 Cr", patYoY: "+38.4%", eps: "₹1.49" },
      { quarter: "Q1 FY27", sales: "₹4,244 Cr", salesYoY: "+20.1%", ebitda: "₹948 Cr", ebitdaMargin: "22.3%", pat: "₹791 Cr", patYoY: "+46.5%", eps: "₹1.08" },
      { quarter: "Q4 FY26", sales: "₹8,564 Cr", salesYoY: "+32.2%", ebitda: "₹2,380 Cr", ebitdaMargin: "27.8%", pat: "₹1,797 Cr", patYoY: "+30.4%", eps: "₹2.46" },
      { quarter: "Q3 FY26", sales: "₹4,162 Cr", salesYoY: "+0.2%", ebitda: "₹1,072 Cr", ebitdaMargin: "25.8%", pat: "₹860 Cr", patYoY: "+40.2%", eps: "₹1.18" },
      { quarter: "Q2 FY26", sales: "₹3,993 Cr", salesYoY: "+1.2%", ebitda: "₹1,006 Cr", ebitdaMargin: "25.2%", pat: "₹790 Cr", patYoY: "+33.0%", eps: "₹1.08" },
    ],
  },
  {
    symbol: "HAL",
    name: "Hindustan Aeronautics Ltd",
    sector: "Defence & Aerospace",
    price: "₹4,890.00",
    change: "+3.15%",
    isUp: true,
    rsScore: 92,
    marketCap: "₹3,27,000 Cr",
    stage: "Stage 2 Markup",
    maStatus: "Above SMA 10, 20, 50, 200",
    hveMarker: "HVE: Tejas Mk1A Engine Inflow",
    eventTag: "Dividend: Final ₹15.00/sh Ex-Date Passed",
    financials: [
      { quarter: "Q2 FY27", sales: "₹5,976 Cr", salesYoY: "+6.1%", ebitda: "₹1,480 Cr", ebitdaMargin: "24.8%", pat: "₹1,510 Cr", patYoY: "+22.1%", eps: "₹22.58" },
      { quarter: "Q1 FY27", sales: "₹4,348 Cr", salesYoY: "+11.0%", ebitda: "₹994 Cr", ebitdaMargin: "22.9%", pat: "₹1,437 Cr", patYoY: "+76.5%", eps: "₹21.49" },
      { quarter: "Q4 FY26", sales: "₹14,769 Cr", salesYoY: "+18.2%", ebitda: "₹5,100 Cr", ebitdaMargin: "34.5%", pat: "₹4,309 Cr", patYoY: "+52.3%", eps: "₹64.43" },
      { quarter: "Q3 FY26", sales: "₹6,061 Cr", salesYoY: "+7.0%", ebitda: "₹1,430 Cr", ebitdaMargin: "23.6%", pat: "₹1,261 Cr", patYoY: "+9.2%", eps: "₹18.86" },
      { quarter: "Q2 FY26", sales: "₹5,631 Cr", salesYoY: "+9.5%", ebitda: "₹1,320 Cr", ebitdaMargin: "23.4%", pat: "₹1,237 Cr", patYoY: "+1.2%", eps: "₹18.50" },
    ],
  },
];

const SECTORS = [
  "All Themes",
  "Media & Gaming",
  "Capital Markets",
  "Hotels & Tourism",
  "Banking",
  "Speciality Chemicals",
  "Defence & Aerospace",
  "EMS & Electronics",
  "Retail & Apparel",
];

export default function LeadersPage() {
  const [selectedSector, setSelectedSector] = useState("All Themes");
  const [selectedStock, setSelectedStock] = useState<LeaderStock>(LEADERS_DATA[0]);
  const [copied, setCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredStocks = LEADERS_DATA.filter((s) => {
    const matchesSector = selectedSector === "All Themes" || s.sector === selectedSector;
    const matchesSearch =
      s.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSector && matchesSearch;
  });

  const handleCopyTable = () => {
    const header = "Quarter\tSales (Cr)\tYoY Sales %\tEBITDA (Cr)\tEBITDA Margin\tNet Profit (PAT)\tYoY PAT %\tEPS\n";
    const rows = selectedStock.financials
      .map((f) => `${f.quarter}\t${f.sales}\t${f.salesYoY}\t${f.ebitda}\t${f.ebitdaMargin}\t${f.pat}\t${f.patYoY}\t${f.eps}`)
      .join("\n");
    navigator.clipboard.writeText(header + rows);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadCsv = () => {
    const header = "Quarter,Sales,Sales_YoY,EBITDA,EBITDA_Margin,Net_Profit,PAT_YoY,EPS\n";
    const rows = selectedStock.financials
      .map((f) => `"${f.quarter}","${f.sales}","${f.salesYoY}","${f.ebitda}","${f.ebitdaMargin}","${f.pat}","${f.patYoY}","${f.eps}"`)
      .join("\n");
    const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${selectedStock.symbol}_Quarterly_Financials.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Market Leaders</h1>
            <span className="text-xs font-mono font-semibold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
              Top 150 Structural Leaders
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Industry-grouped market leaders with interactive OHLC candlestick charts, moving averages &amp; 5-quarter financial trends
          </p>
        </div>

        {/* Sector Quick Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1 max-w-full">
          {SECTORS.map((sec) => (
            <button
              key={sec}
              onClick={() => setSelectedSector(sec)}
              className={`px-3 py-1 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                selectedSector === sec
                  ? "bg-primary text-white font-semibold shadow-xs"
                  : "bg-muted/60 text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              {sec}
            </button>
          ))}
        </div>
      </div>

      {/* Split-Panel Architecture */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ================= Left Navigation Panel (Col 1-4) ================= */}
        <div className="lg:col-span-4 p-4 rounded-2xl bg-card border border-border shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Flame className="h-4 w-4 text-primary" />
              <span>Leading Stocks ({filteredStocks.length})</span>
            </h3>
            <span className="text-[10px] text-muted-foreground font-mono">Ranked by RS Rating</span>
          </div>

          {/* Quick Search */}
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter leaders (e.g. TRENT)..."
              className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-border bg-background text-foreground font-mono placeholder:font-sans"
            />
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
          </div>

          {/* Stock list */}
          <div className="space-y-2 max-h-[700px] overflow-y-auto pr-1">
            {filteredStocks.map((stock) => {
              const isSelected = selectedStock.symbol === stock.symbol;
              return (
                <div
                  key={stock.symbol}
                  onClick={() => setSelectedStock(stock)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                    isSelected
                      ? "border-primary bg-primary/10 shadow-xs ring-1 ring-primary/30"
                      : "border-border hover:border-border/80 hover:bg-muted/40"
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold font-mono text-foreground">{stock.symbol}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-primary/10 text-primary font-bold">
                        ★ {stock.rsScore}
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground truncate max-w-[180px]">{stock.name}</p>
                    <span className="text-[10px] text-muted-foreground/80 block">{stock.sector}</span>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-bold font-mono text-foreground block">{stock.price}</span>
                    <span className="text-xs font-bold font-mono text-bull flex items-center justify-end">
                      <ArrowUpRight className="h-3 w-3" />
                      {stock.change}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ================= Right Interactive Panel (Col 5-12) ================= */}
        <div className="lg:col-span-8 space-y-6">
          {/* Header Card for Selected Stock */}
          <div className="p-5 rounded-2xl bg-card border border-border shadow-xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2.5">
                  <h2 className="text-2xl font-black tracking-tight text-foreground font-mono">
                    {selectedStock.symbol}
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-primary/10 text-primary border border-primary/20">
                    ★ RS {selectedStock.rsScore}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-bull/10 text-bull border border-bull/20">
                    {selectedStock.stage}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {selectedStock.name} • {selectedStock.sector} • Market Cap: {selectedStock.marketCap}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="text-xl font-extrabold font-mono text-foreground block">
                    {selectedStock.price}
                  </span>
                  <span className="text-xs font-bold font-mono text-bull flex items-center justify-end">
                    <ArrowUpRight className="h-3.5 w-3.5" />
                    {selectedStock.change}
                  </span>
                </div>
                <Link
                  href={`/stock/${selectedStock.symbol}`}
                  className="p-2 rounded-xl border border-border bg-background hover:bg-muted text-muted-foreground hover:text-foreground"
                  title="Open Full TradingView Chart Suite"
                >
                  <ExternalLink className="h-4 w-4" />
                </Link>
              </div>
            </div>

            {/* Overlays and Event Tag Badges */}
            <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-border/70 text-xs">
              <span className="text-muted-foreground font-medium">Moving Averages:</span>
              <span className="px-2 py-0.5 rounded-md bg-bull/10 text-bull font-mono font-semibold text-[11px] border border-bull/20">
                {selectedStock.maStatus}
              </span>
              <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary font-medium text-[11px] border border-primary/20">
                {selectedStock.hveMarker}
              </span>
              <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-500 font-medium text-[11px] border border-amber-500/20">
                {selectedStock.eventTag}
              </span>
            </div>

            {/* Candlestick & Volume Simulated Chart */}
            <div className="h-56 w-full p-4 rounded-xl bg-background border border-border flex flex-col justify-between relative">
              <div className="flex items-center justify-between text-[11px] font-mono text-muted-foreground">
                <span>OHLC Daily Candlesticks + SMA 10 (Yellow), 20 (Cyan), 50 (Blue), 200 (Magenta)</span>
                <span className="text-primary font-bold">Volume Climax Marker (HVE)</span>
              </div>
              <svg className="w-full h-36" viewBox="0 0 600 120" preserveAspectRatio="none">
                {/* Candlestick bars */}
                <g stroke="#16A34A" strokeWidth="1">
                  <line x1="30" y1="80" x2="30" y2="105" />
                  <rect x="26" y="85" width="8" height="15" fill="#16A34A" />
                  <line x1="70" y1="75" x2="70" y2="95" />
                  <rect x="66" y="78" width="8" height="12" fill="#16A34A" />
                  <line x1="110" y1="70" x2="110" y2="90" />
                  <rect x="106" y="72" width="8" height="14" fill="#16A34A" />
                  <line x1="150" y1="65" x2="150" y2="85" />
                  <rect x="146" y="68" width="8" height="12" fill="#16A34A" />
                  <line x1="190" y1="60" x2="190" y2="80" />
                  <rect x="186" y="62" width="8" height="15" fill="#16A34A" />
                  <line x1="230" y1="50" x2="230" y2="75" />
                  <rect x="226" y="55" width="8" height="15" fill="#16A34A" />
                  <line x1="270" y1="45" x2="270" y2="70" />
                  <rect x="266" y="48" width="8" height="16" fill="#16A34A" />
                  <line x1="310" y1="40" x2="310" y2="65" />
                  <rect x="306" y="42" width="8" height="18" fill="#16A34A" />
                  <line x1="350" y1="35" x2="350" y2="60" />
                  <rect x="346" y="38" width="8" height="16" fill="#16A34A" />
                  <line x1="390" y1="30" x2="390" y2="55" />
                  <rect x="386" y="32" width="8" height="18" fill="#16A34A" />
                  <line x1="430" y1="25" x2="430" y2="50" />
                  <rect x="426" y="28" width="8" height="17" fill="#16A34A" />
                  <line x1="470" y1="20" x2="470" y2="45" />
                  <rect x="466" y="22" width="8" height="18" fill="#16A34A" />
                  <line x1="510" y1="15" x2="510" y2="40" />
                  <rect x="506" y="18" width="8" height="16" fill="#16A34A" />
                  <line x1="550" y1="10" x2="550" y2="35" />
                  <rect x="546" y="12" width="8" height="18" fill="#16A34A" />
                </g>

                {/* Moving Average curves */}
                <path d="M0,95 Q150,75 300,55 T600,20" fill="none" stroke="#EAB308" strokeWidth="1.5" />
                <path d="M0,100 Q150,85 300,68 T600,32" fill="none" stroke="#06B6D4" strokeWidth="1.5" />
                <path d="M0,105 Q150,92 300,80 T600,45" fill="none" stroke="#3B82F6" strokeWidth="2" />
                <path d="M0,115 Q150,105 300,95 T600,70" fill="none" stroke="#D946EF" strokeWidth="2" />
              </svg>
              <div className="flex items-center justify-between text-[10px] text-muted-foreground font-mono">
                <span>SMA 10: ₹7,020</span>
                <span>SMA 20: ₹6,840</span>
                <span>SMA 50: ₹6,410</span>
                <span>SMA 200: ₹5,120</span>
              </div>
            </div>
          </div>

          {/* Financial Breakdown Grid (5 Quarters) with Data Export Controls */}
          <div className="p-5 rounded-2xl bg-card border border-border shadow-xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-foreground">Quarterly Financial Performance Breakdown</h3>
                <p className="text-xs text-muted-foreground">
                  Institutional quarterly sales growth, operating EBITDA margins, PAT and EPS trajectory
                </p>
              </div>

              {/* Data Export Controls */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyTable}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border bg-background hover:bg-muted text-xs font-semibold text-foreground transition-colors shadow-xs"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-bull" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copied ? "Copied Table!" : "Copy table contents"}</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadCsv}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-semibold transition-colors shadow-xs"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>CSV Export</span>
                </button>
              </div>
            </div>

            {/* Financials Table */}
            <div className="overflow-x-auto border border-border rounded-xl">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-border bg-muted/40 font-semibold text-[11px] text-muted-foreground uppercase tracking-wider">
                    <th className="p-3">Quarter</th>
                    <th className="p-3">Sales (Cr)</th>
                    <th className="p-3">YoY Sales %</th>
                    <th className="p-3">EBITDA (Cr)</th>
                    <th className="p-3">EBITDA Margin</th>
                    <th className="p-3">Net Profit (PAT)</th>
                    <th className="p-3">YoY PAT %</th>
                    <th className="p-3 text-right">EPS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {selectedStock.financials.map((f, idx) => (
                    <tr key={idx} className="hover:bg-muted/30 transition-colors font-mono">
                      <td className="p-3 font-bold text-foreground font-sans">{f.quarter}</td>
                      <td className="p-3 text-foreground font-semibold">{f.sales}</td>
                      <td className="p-3 text-bull font-bold">{f.salesYoY}</td>
                      <td className="p-3 text-foreground">{f.ebitda}</td>
                      <td className="p-3 text-muted-foreground">{f.ebitdaMargin}</td>
                      <td className="p-3 text-foreground font-semibold">{f.pat}</td>
                      <td className="p-3 text-bull font-bold">{f.patYoY}</td>
                      <td className="p-3 text-right font-bold text-primary">{f.eps}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
