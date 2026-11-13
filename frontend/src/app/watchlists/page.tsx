"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Bookmark, RefreshCw } from "lucide-react";

import { ThemeToggle } from "@/components/theme-toggle";
import { WatchlistHeader } from "@/components/watchlist/watchlist-header";
import { WatchlistGrid } from "@/components/watchlist/watchlist-grid";
import { QuickAddSymbol } from "@/components/watchlist/quick-add-symbol";
import { NewWatchlistModal } from "@/components/watchlist/new-watchlist-modal";
import { WatchlistDetail, WatchlistSummary } from "@/components/watchlist/types";
import { getAuthHeaders } from "@/lib/auth";

export default function WatchlistsDashboardPage() {
  const [watchlists, setWatchlists] = useState<WatchlistSummary[]>([]);
  const [activeId, setActiveId] = useState<string>("");
  const [activeDetail, setActiveDetail] = useState<WatchlistDetail | null>(null);
  const [loadingWatchlists, setLoadingWatchlists] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 1. Fetch Watchlists list
  const loadWatchlists = useCallback(async () => {
    try {
      setLoadingWatchlists(true);
      const res = await fetch("/api/watchlists", { headers: getAuthHeaders() });
      if (res.ok) {
        const data = await res.json();
        const lists: WatchlistSummary[] = data.watchlists || [];
        setWatchlists(lists);

        // Auto-select primary or first list if activeId is empty
        if (lists.length > 0) {
          setActiveId((prev) => {
            if (prev && lists.some((w) => w.id === prev)) return prev;
            const primary = lists.find((w) => w.is_default);
            return primary ? primary.id : lists[0].id;
          });
        }
      }
    } catch {
      // ignore
    } finally {
      setLoadingWatchlists(false);
    }
  }, []);

  useEffect(() => {
    loadWatchlists();
    const handleUserChange = () => {
      loadWatchlists();
    };
    window.addEventListener("ts-user-changed", handleUserChange);
    return () => window.removeEventListener("ts-user-changed", handleUserChange);
  }, [loadWatchlists]);

  // 2. Fetch Active Watchlist Details
  const loadActiveDetail = useCallback(async (id: string) => {
    if (!id) return;
    try {
      setLoadingDetail(true);
      const res = await fetch(`/api/watchlists/${id}`, { headers: getAuthHeaders() });
      if (res.ok) {
        const data: WatchlistDetail = await res.json();
        setActiveDetail(data);
      }
    } catch {
      // ignore
    } finally {
      setLoadingDetail(false);
    }
  }, []);

  useEffect(() => {
    if (activeId) {
      loadActiveDetail(activeId);
    }
  }, [activeId, loadActiveDetail]);

  const handleSymbolAdded = () => {
    if (activeId) {
      loadActiveDetail(activeId);
      loadWatchlists();
    }
  };

  const handleItemRemoved = (symbol: string) => {
    setActiveDetail((prev) => {
      if (!prev) return null;
      const nextItems = prev.items.filter((it) => it.symbol !== symbol);
      return {
        ...prev,
        items: nextItems,
        total_items: nextItems.length,
      };
    });
    loadWatchlists();
  };

  const handleCreated = (newId: string) => {
    loadWatchlists().then(() => {
      setActiveId(newId);
    });
  };

  const handleRenamed = () => {
    loadWatchlists();
    if (activeId) loadActiveDetail(activeId);
  };

  const handleDeleted = () => {
    setActiveId("");
    loadWatchlists();
  };

  // Metrics calculation
  const items = activeDetail?.items || [];
  const gainers = items.filter((it) => it.change_pct > 0).length;
  const losers = items.filter((it) => it.change_pct < 0).length;
  const validRsi = items.map((it) => it.rsi).filter((r): r is number => typeof r === "number");
  const avgRsi = validRsi.length > 0 ? (validRsi.reduce((a, b) => a + b, 0) / validRsi.length).toFixed(1) : "—";

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/scanners/trend-template"
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-slate-100 transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Scanners</span>
            </Link>
            <span className="h-4 w-px bg-slate-800" />
            <div className="flex items-center gap-2">
              <Bookmark className="h-4 w-4 text-cyan-400" />
              <span className="font-bold text-sm tracking-tight text-slate-100">TRADESCOUT</span>
              <span className="text-xs text-slate-500 font-mono">/ Watchlists</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (activeId) loadActiveDetail(activeId);
                loadWatchlists();
              }}
              className="p-1.5 rounded-lg border border-slate-800 hover:bg-slate-900 text-slate-400 hover:text-slate-200 transition-colors"
              title="Refresh Watchlists"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loadingDetail ? "animate-spin text-cyan-400" : ""}`} />
            </button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {loadingWatchlists ? (
          <div className="flex items-center justify-center h-64 text-slate-500 text-sm animate-pulse">
            Loading your watchlists and trade setups...
          </div>
        ) : (
          <>
            {/* Watchlist Selector & Header Actions */}
            <WatchlistHeader
              watchlists={watchlists}
              activeId={activeId}
              activeDetail={activeDetail}
              onSelectWatchlist={(id) => setActiveId(id)}
              onOpenNewModal={() => setIsModalOpen(true)}
              onWatchlistRenamed={handleRenamed}
              onWatchlistDeleted={handleDeleted}
            />

            {/* Quick Add Bar & Stat Strip */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 rounded-xl border border-slate-800/80 bg-slate-900/40 backdrop-blur-md shadow-sm">
              <QuickAddSymbol watchlistId={activeId} onSymbolAdded={handleSymbolAdded} />

              <div className="flex items-center gap-4 text-xs font-mono">
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-500">Total:</span>
                  <span className="font-bold text-slate-200">{items.length}</span>
                </div>
                <div className="h-3 w-px bg-slate-800" />
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-500">Adv/Dec:</span>
                  <span className="text-emerald-400 font-bold">{gainers} ▲</span>
                  <span className="text-slate-600">/</span>
                  <span className="text-rose-400 font-bold">{losers} ▼</span>
                </div>
                <div className="h-3 w-px bg-slate-800" />
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-500">Avg RSI:</span>
                  <span className="font-bold text-cyan-400">{avgRsi}</span>
                </div>
              </div>
            </div>

            {/* Watchlist Grid */}
            {loadingDetail ? (
              <div className="flex items-center justify-center h-64 text-slate-500 text-sm animate-pulse">
                Refreshing market quotes and 20D sparklines...
              </div>
            ) : (
              <WatchlistGrid
                items={items}
                watchlistId={activeId}
                onItemRemoved={handleItemRemoved}
              />
            )}
          </>
        )}
      </main>

      {/* New Watchlist Modal */}
      <NewWatchlistModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreated={handleCreated}
      />

      {/* Compliance Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/60 py-4 text-center text-[11px] text-slate-600">
        TRADESCOUT is an educational research platform, not a SEBI-registered advisory. Market investments are subject to risk.
      </footer>
    </div>
  );
}
