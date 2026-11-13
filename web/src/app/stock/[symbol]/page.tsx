"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Bell,
  Bookmark,
  BookmarkCheck,
  Check,
  ExternalLink,
  Flame,
  LineChart as LineChartIcon,
  PieChart,
  Share2,
  TableProperties,
  TrendingUp,
} from "lucide-react";
import DynamicTradingViewChart from "@/components/chart/TradingViewChartWrapper";
import DynamicRSLineChart from "@/components/chart/RSLineChartWrapper";
import FundamentalsTable from "@/components/stock/FundamentalsTable";
import ShareholdingChart from "@/components/stock/ShareholdingChart";
import NotesAndFilings from "@/components/stock/NotesAndFilings";
import {
  OHLCVBar,
  RSLinePoint,
  RSLineResponse,
  StockDetail,
  StockFundamentals,
} from "@/lib/types";

type TabId = "chart" | "rs" | "fundamentals" | "shareholding" | "notes";

export default function StockDetailPage() {
  const params = useParams();
  const router = useRouter();
  const rawSymbol = params.symbol as string;
  const symbol = (rawSymbol || "").toUpperCase().trim();

  // Active tab state
  const [activeTab, setActiveTab] = useState<TabId>("chart");

  // Data fetching state
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [stock, setStock] = useState<StockDetail | null>(null);
  const [bars, setBars] = useState<OHLCVBar[]>([]);
  const [rsLine, setRsLine] = useState<RSLinePoint[]>([]);
  const [rsMeta, setRsMeta] = useState<RSLineResponse | null>(null);
  const [fundamentals, setFundamentals] = useState<StockFundamentals | null>(null);

  // Watchlist & Share action states
  const [isWatchlisted, setIsWatchlisted] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [alertSet, setAlertSet] = useState(false);

  // Check Watchlist status in localStorage
  useEffect(() => {
    if (!symbol) return;
    try {
      const saved = localStorage.getItem("stc-watchlist");
      if (saved) {
        const list: string[] = JSON.parse(saved);
        setIsWatchlisted(list.includes(symbol));
      }
    } catch {
      // ignore
    }
  }, [symbol]);

  // Load all stock data
  useEffect(() => {
    if (!symbol) return;

    let isMounted = true;
    setLoading(true);
    setNotFound(false);

    async function loadStockData() {
      try {
        // 1. Fetch Overview
        const overviewRes = await fetch(`/api/stock/${symbol}`);
        if (overviewRes.status === 404) {
          if (isMounted) {
            setNotFound(true);
            setLoading(false);
          }
          return;
        }

        if (!overviewRes.ok) {
          throw new Error(`Failed to load stock overview: ${overviewRes.statusText}`);
        }

        const overviewData: StockDetail = await overviewRes.json();

        // 2. Fetch History, RS Line, Fundamentals concurrently
        const [historyRes, rsRes, fundRes] = await Promise.all([
          fetch(`/api/stock/${symbol}/history?days=500`),
          fetch(`/api/stock/${symbol}/rs_line?period=1y`),
          fetch(`/api/stock/${symbol}/fundamentals`),
        ]);

        const historyData: OHLCVBar[] = historyRes.ok ? await historyRes.json() : [];
        const rsData: RSLineResponse | null = rsRes.ok ? await rsRes.json() : null;
        const fundData: StockFundamentals | null = fundRes.ok ? await fundRes.json() : null;

        if (isMounted) {
          setStock(overviewData);
          setBars(historyData);
          if (rsData) {
            setRsMeta(rsData);
            setRsLine(rsData.rs_line || []);
          }
          setFundamentals(fundData);
          setLoading(false);
        }
      } catch {
        if (isMounted) {
          // If network failed but symbol might exist, show error or not found
          setNotFound(true);
          setLoading(false);
        }
      }
    }

    loadStockData();

    return () => {
      isMounted = false;
    };
  }, [symbol]);

  // Toggle Watchlist
  const toggleWatchlist = () => {
    try {
      const saved = localStorage.getItem("stc-watchlist");
      let list: string[] = saved ? JSON.parse(saved) : [];
      if (list.includes(symbol)) {
        list = list.filter((s) => s !== symbol);
        setIsWatchlisted(false);
      } else {
        list.push(symbol);
        setIsWatchlisted(true);
      }
      localStorage.setItem("stc-watchlist", JSON.stringify(list));
    } catch {
      // ignore
    }
  };

  // Share Setup Link
  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  // Trigger Price Alert modal/toast
  const handleSetAlert = () => {
    setAlertSet(true);
    setTimeout(() => setAlertSet(false), 3000);
  };

  // 404 / Error State
  if (notFound) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
        <div className="w-16 h-16 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mb-4 text-slate-500 text-2xl font-bold font-mono">
          ?
        </div>
        <h1 className="text-2xl font-bold text-slate-100 mb-2">
          Stock &apos;{symbol}&apos; Not Found
        </h1>
        <p className="text-sm text-slate-400 max-w-md mb-6 leading-relaxed">
          The requested ticker symbol does not exist in the active NSE 2026 equity universe, or is delisted/suspended.
        </p>
        <div className="flex items-center gap-3">
          <Link
            href="/scanners/trend-template"
            className="px-4 py-2 rounded-lg bg-cyan-500 text-slate-950 font-bold text-xs hover:bg-cyan-400 transition-all shadow-md shadow-cyan-500/20"
          >
            ← Back to Trend Template Scanner
          </Link>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 font-medium text-xs hover:bg-slate-800 transition-all"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Loading Skeleton State
  if (loading || !stock) {
    return (
      <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto px-4 py-6">
        {/* Header Skeleton */}
        <div className="h-24 bg-slate-900/40 rounded-xl border border-slate-800/80 animate-pulse" />
        {/* Tabs Skeleton */}
        <div className="h-10 w-96 bg-slate-900/40 rounded-lg border border-slate-800/80 animate-pulse" />
        {/* Canvas Skeleton */}
        <div className="h-[560px] bg-slate-900/40 rounded-xl border border-slate-800/80 animate-pulse flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-slate-500 font-medium">
            Streaming OHLCV Parquet for {symbol}...
          </span>
        </div>
      </div>
    );
  }

  const isPositive = (stock.day_change || 0) >= 0;

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto px-4 py-6">
      {/* Top Breadcrumb & Action Bar */}
      <div className="flex items-center justify-between gap-4">
        <Link
          href="/scanners/trend-template"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-cyan-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Scanners</span>
        </Link>

        {/* Quick Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleWatchlist}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              isWatchlisted
                ? "bg-emerald-500/15 border-emerald-500/50 text-emerald-400 shadow-sm shadow-emerald-500/20"
                : "bg-slate-900/80 border-slate-800 text-slate-300 hover:text-slate-100 hover:border-slate-700"
            }`}
          >
            {isWatchlisted ? (
              <>
                <BookmarkCheck className="w-3.5 h-3.5" />
                <span>Watchlisted</span>
              </>
            ) : (
              <>
                <Bookmark className="w-3.5 h-3.5" />
                <span>+ Watchlist</span>
              </>
            )}
          </button>

          <button
            onClick={handleSetAlert}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              alertSet
                ? "bg-amber-500/15 border-amber-500/50 text-amber-400"
                : "bg-slate-900/80 border-slate-800 text-slate-300 hover:text-slate-100 hover:border-slate-700"
            }`}
          >
            <Bell className="w-3.5 h-3.5" />
            <span>{alertSet ? "Alert Active!" : "Set Alert"}</span>
          </button>

          <button
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900/80 border border-slate-800 text-slate-300 hover:text-slate-100 hover:border-slate-700 transition-all"
          >
            {copiedLink ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5" />
                <span>Share</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Stock Header Card */}
      <div className="bg-slate-900/70 rounded-2xl border border-slate-800/80 p-6 backdrop-blur-md shadow-lg shadow-black/20 flex flex-wrap items-center justify-between gap-6">
        {/* Left: Identity & Badges */}
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-100 font-sans">
              {stock.symbol}
            </h1>
            <span className="text-xs px-2 py-0.5 rounded font-mono font-bold bg-slate-800 text-slate-400">
              NSE:{stock.series || "EQ"}
            </span>

            {/* Weinstein Stage Badge */}
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold border backdrop-blur-sm ${
                stock.stage === 2
                  ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-400"
                  : stock.stage === 4
                  ? "bg-rose-500/15 border-rose-500/40 text-rose-400"
                  : stock.stage === 1
                  ? "bg-amber-500/15 border-amber-500/40 text-amber-400"
                  : "bg-slate-500/15 border-slate-500/40 text-slate-400"
              }`}
            >
              {stock.stage_name || `Stage ${stock.stage}`}
            </span>

            {/* RS Rating Pill */}
            <span className="px-3 py-1 rounded-full text-xs font-bold border border-cyan-500/40 bg-cyan-500/15 text-cyan-400 shadow-sm shadow-cyan-500/20">
              ★ RS {stock.rs_rating}
            </span>

            {/* Minervini Trend Template Pass Badge */}
            {(stock.conditions_met ?? 0) >= 7 && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border border-emerald-500/40 bg-emerald-500/20 text-emerald-300">
                <Flame className="w-3 h-3 text-emerald-400" /> Minervini Trend Pass (
                {stock.conditions_met}/8)
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
            <span className="font-medium text-slate-300">{stock.name || stock.company_name}</span>
            <span>•</span>
            <span>{stock.industry || "Diversified"}</span>
            <span>•</span>
            <span className="font-mono text-slate-500">{stock.isin}</span>
          </div>
        </div>

        {/* Right: Live Price, Change, 52W Range */}
        <div className="flex flex-wrap items-center gap-6">
          {/* CMP & Change */}
          <div className="flex flex-col items-start sm:items-end">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500" />
              </span>
              <span className="text-2xl sm:text-3xl font-extrabold font-mono text-slate-100 tracking-tight">
                ₹{stock.cmp.toFixed(2)}
              </span>
            </div>

            <div className="flex items-center gap-1.5 mt-0.5">
              <span
                className={`text-sm font-bold font-mono ${
                  isPositive ? "text-emerald-400" : "text-rose-400"
                }`}
              >
                {isPositive ? "+" : ""}
                {stock.change ? stock.change.toFixed(2) : "0.00"} ({isPositive ? "+" : ""}
                {stock.day_change.toFixed(2)}%)
              </span>
              <span className="text-[11px] text-slate-500">1D</span>
            </div>
          </div>

          <div className="hidden sm:block h-10 w-[1px] bg-slate-800" />

          {/* 52-Week Range */}
          <div className="flex flex-col text-xs font-mono">
            <span className="text-[11px] text-slate-500 uppercase tracking-wider font-sans font-semibold mb-1">
              52W Range
            </span>
            <div className="flex items-center gap-2 text-slate-300">
              <span>₹{(stock["52w_low"] || stock.low_52w || 0).toFixed(0)}</span>
              <span className="text-slate-600">—</span>
              <span className="font-bold text-slate-100">
                ₹{(stock["52w_high"] || stock.high_52w || 0).toFixed(0)}
              </span>
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              <span>{stock.from_52w_high ? `${stock.from_52w_high.toFixed(1)}% from High` : ""}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-1 border-b border-slate-800 pb-px overflow-x-auto">
        <button
          onClick={() => setActiveTab("chart")}
          className={`flex items-center gap-2 px-4 py-2.5 border-b-2 text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === "chart"
              ? "border-cyan-400 text-cyan-400 bg-cyan-500/5"
              : "border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700"
          }`}
        >
          <LineChartIcon className="w-4 h-4" />
          <span>Chart View (TradingView LC v4)</span>
        </button>

        <button
          onClick={() => setActiveTab("rs")}
          className={`flex items-center gap-2 px-4 py-2.5 border-b-2 text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === "rs"
              ? "border-cyan-400 text-cyan-400 bg-cyan-500/5"
              : "border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700"
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Relative Strength (RS vs Nifty)</span>
        </button>

        <button
          onClick={() => setActiveTab("fundamentals")}
          className={`flex items-center gap-2 px-4 py-2.5 border-b-2 text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === "fundamentals"
              ? "border-cyan-400 text-cyan-400 bg-cyan-500/5"
              : "border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700"
          }`}
        >
          <TableProperties className="w-4 h-4" />
          <span>Fundamentals (5Y Quarterly)</span>
        </button>

        <button
          onClick={() => setActiveTab("shareholding")}
          className={`flex items-center gap-2 px-4 py-2.5 border-b-2 text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === "shareholding"
              ? "border-cyan-400 text-cyan-400 bg-cyan-500/5"
              : "border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700"
          }`}
        >
          <PieChart className="w-4 h-4" />
          <span>Shareholding (FII / DII)</span>
        </button>

        <button
          onClick={() => setActiveTab("notes")}
          className={`flex items-center gap-2 px-4 py-2.5 border-b-2 text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === "notes"
              ? "border-cyan-400 text-cyan-400 bg-cyan-500/5"
              : "border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700"
          }`}
        >
          <ExternalLink className="w-4 h-4" />
          <span>Notes & Filings</span>
        </button>
      </div>

      {/* Tab Content Display */}
      <div className="w-full">
        {activeTab === "chart" && (
          <DynamicTradingViewChart
            symbol={stock.symbol}
            bars={bars}
            rsLine={rsLine}
            stage={stock.stage}
            stageName={stock.stage_name}
            rsRating={stock.rs_rating}
            pivotPrice={stock["52w_high"] || stock.high_52w}
          />
        )}

        {activeTab === "rs" && (
          <DynamicRSLineChart
            symbol={stock.symbol}
            benchmark={rsMeta?.benchmark || "NIFTY 50"}
            rsLine={rsLine}
            rsRating={stock.rs_rating}
            rsNewHigh={rsMeta?.rs_new_high}
            rsTrend={rsMeta?.rs_trend}
          />
        )}

        {activeTab === "fundamentals" && fundamentals && (
          <FundamentalsTable fundamentals={fundamentals} />
        )}

        {activeTab === "shareholding" && fundamentals && (
          <ShareholdingChart fundamentals={fundamentals} />
        )}

        {activeTab === "notes" && (
          <NotesAndFilings symbol={stock.symbol} companyName={stock.name || stock.company_name} />
        )}
      </div>
    </div>
  );
}
