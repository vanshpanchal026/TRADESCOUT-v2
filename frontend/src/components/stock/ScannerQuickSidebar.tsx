"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, X, SlidersHorizontal, ChevronRight } from "lucide-react";
import { getAuthHeaders } from "@/lib/auth";

interface StockCandidate {
  symbol: string;
  name?: string;
  cmp: number;
  day_change?: number;
  rs_rating?: number;
  stage?: number;
}

interface ScannerQuickSidebarProps {
  currentSymbol: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function ScannerQuickSidebar({
  currentSymbol,
  isOpen,
  onClose,
}: ScannerQuickSidebarProps) {
  const router = useRouter();
  const [candidates, setCandidates] = useState<StockCandidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    let isMounted = true;
    async function loadCandidates() {
      try {
        const res = await fetch("/api/scanners/trend-template", {
          headers: getAuthHeaders(),
        });
        if (res.ok) {
          const json = await res.json();
          const items: StockCandidate[] = json.data || json.results || [];
          if (isMounted) {
            setCandidates(items);
            setLoading(false);
          }
        }
      } catch (err) {
        console.error("Failed to load scanner candidates:", err);
        if (isMounted) setLoading(false);
      }
    }

    if (isOpen) {
      loadCandidates();
    }

    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const filtered = candidates.filter((c) => {
    if (!searchQuery) return true;
    const q = searchQuery.toUpperCase();
    return (
      c.symbol.toUpperCase().includes(q) ||
      (c.name && c.name.toUpperCase().includes(q))
    );
  });

  return (
    <aside className="w-64 sm:w-72 shrink-0 bg-card rounded-xl border border-border flex flex-col h-[750px] shadow-sm overflow-hidden select-none">
      {/* Header */}
      <div className="p-3 border-b border-border bg-muted/40 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <SlidersHorizontal className="w-3.5 h-3.5 text-primary" />
          <span className="text-xs font-bold text-foreground">Scan Results</span>
          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-muted text-muted-foreground border border-border">
            {candidates.length}
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          title="Close results sidebar"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Search Input */}
      <div className="p-2 border-b border-border bg-background/50">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Filter stocks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-card border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
          />
        </div>
      </div>

      {/* Table Header */}
      <div className="grid grid-cols-12 px-3 py-1.5 border-b border-border text-[10px] font-semibold uppercase text-muted-foreground bg-muted/20">
        <span className="col-span-5">Symbol</span>
        <span className="col-span-4 text-right">Last Price</span>
        <span className="col-span-3 text-right">RS</span>
      </div>

      {/* Stock Rows */}
      <div className="flex-1 overflow-y-auto no-scrollbar divide-y divide-border/40 font-mono text-xs">
        {loading ? (
          <div className="p-6 text-center text-xs text-muted-foreground">
            Loading candidates...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-6 text-center text-xs text-muted-foreground">
            No stocks found
          </div>
        ) : (
          filtered.map((stock) => {
            const isActive =
              stock.symbol.toUpperCase() === currentSymbol.toUpperCase();
            const isPos = (stock.day_change ?? 0) >= 0;

            return (
              <button
                key={stock.symbol}
                type="button"
                onClick={() => router.push(`/stock/${stock.symbol}`)}
                className={`w-full grid grid-cols-12 px-3 py-2 items-center text-left transition-colors cursor-pointer ${
                  isActive
                    ? "bg-primary/15 border-l-2 border-primary text-primary font-bold"
                    : "hover:bg-muted/50 text-foreground"
                }`}
              >
                <div className="col-span-5 flex flex-col min-w-0">
                  <span className="font-sans font-bold truncate">
                    {stock.symbol}
                  </span>
                  {stock.day_change !== undefined && (
                    <span
                      className={`text-[10px] tabular-nums ${
                        isPos ? "text-emerald-400" : "text-rose-400"
                      }`}
                    >
                      {isPos ? "+" : ""}
                      {stock.day_change.toFixed(1)}%
                    </span>
                  )}
                </div>

                <div className="col-span-4 text-right tabular-nums font-semibold">
                  ₹{stock.cmp ? stock.cmp.toFixed(1) : "—"}
                </div>

                <div className="col-span-3 text-right">
                  <span
                    className={`inline-block px-1.5 py-0.2 rounded text-[10px] font-bold tabular-nums ${
                      (stock.rs_rating ?? 0) >= 80
                        ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {stock.rs_rating ?? "—"}
                  </span>
                </div>
              </button>
            );
          })
        )}
      </div>

      {/* Footer */}
      <div className="p-2 border-t border-border bg-muted/30 text-[10px] text-muted-foreground flex items-center justify-between">
        <span>Trend Template</span>
        <span className="font-semibold">{filtered.length} visible</span>
      </div>
    </aside>
  );
}
