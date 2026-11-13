"use client";

import React from "react";
import { Download, Edit2, Plus, Trash2 } from "lucide-react";
import { WatchlistDetail, WatchlistSummary } from "./types";
import { getAuthHeaders } from "@/lib/auth";

interface WatchlistHeaderProps {
  watchlists: WatchlistSummary[];
  activeId: string;
  activeDetail: WatchlistDetail | null;
  onSelectWatchlist: (id: string) => void;
  onOpenNewModal: () => void;
  onWatchlistRenamed: () => void;
  onWatchlistDeleted: () => void;
}

export function WatchlistHeader({
  watchlists,
  activeId,
  activeDetail,
  onSelectWatchlist,
  onOpenNewModal,
  onWatchlistRenamed,
  onWatchlistDeleted,
}: WatchlistHeaderProps) {
  const activeWatchlist = watchlists.find((w) => w.id === activeId);

  // Rename watchlist prompt
  const handleRename = async () => {
    if (!activeWatchlist) return;
    const newName = window.prompt("Rename watchlist:", activeWatchlist.name);
    if (!newName || newName.trim() === activeWatchlist.name) return;

    try {
      const res = await fetch(`/api/watchlists/${activeId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify({ name: newName.trim() }),
      });
      if (res.ok) {
        onWatchlistRenamed();
      }
    } catch {
      // ignore
    }
  };

  // Delete watchlist
  const handleDelete = async () => {
    if (!activeWatchlist) return;
    if (activeWatchlist.is_default) {
      alert("The Primary Watchlist cannot be deleted.");
      return;
    }
    if (
      !window.confirm(
        `Are you sure you want to delete "${activeWatchlist.name}" and all its saved symbols?`
      )
    ) {
      return;
    }

    try {
      const res = await fetch(`/api/watchlists/${activeId}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        onWatchlistDeleted();
      }
    } catch {
      // ignore
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    if (!activeDetail || activeDetail.items.length === 0) {
      alert("No stocks in active watchlist to export.");
      return;
    }

    const headers = [
      "Symbol",
      "Company_Name",
      "CMP",
      "Change_Pct",
      "RSI",
      "RS_Rating",
      "Stage",
      "From_52W_High_Pct",
      "Notes",
    ];

    const rows = activeDetail.items.map((it) => [
      it.symbol,
      `"${(it.name || "").replace(/"/g, '""')}"`,
      it.cmp || "",
      it.change_pct || "",
      it.rsi || "",
      it.rs_rating || "",
      it.stage || "",
      it.from_52w_high || "",
      `"${(it.notes || "").replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    const fileName = `${(activeWatchlist?.name || "watchlist").replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.csv`;
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col gap-4 border-b border-slate-800 pb-5">
      {/* Top Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-100">
              {activeWatchlist?.name || "Watchlists"}
            </h1>
            {activeWatchlist?.is_default && (
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                Primary
              </span>
            )}
            <span className="text-xs text-slate-500 font-mono">
              ({activeDetail?.total_items ?? activeWatchlist?.item_count ?? 0} symbols)
            </span>
          </div>
          {activeWatchlist?.description && (
            <p className="text-xs text-slate-400 mt-1">{activeWatchlist.description}</p>
          )}
        </div>

        {/* Right utility buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-slate-300 hover:text-slate-100 transition-colors shadow-sm"
            title="Download active watchlist as CSV"
          >
            <Download className="h-3.5 w-3.5 text-cyan-400" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handleRename}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-800 bg-slate-900 hover:bg-slate-800 text-xs text-slate-400 hover:text-slate-200 transition-colors"
            title="Rename active watchlist"
          >
            <Edit2 className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Rename</span>
          </button>

          {activeWatchlist && !activeWatchlist.is_default && (
            <button
              onClick={handleDelete}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-800 bg-slate-900 hover:bg-rose-500/10 hover:border-rose-500/30 text-xs text-slate-400 hover:text-rose-400 transition-colors"
              title="Delete active watchlist"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Delete</span>
            </button>
          )}

          <button
            onClick={onOpenNewModal}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-all shadow-sm shadow-cyan-500/20 active:scale-95"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>New Watchlist</span>
          </button>
        </div>
      </div>

      {/* Watchlist Tabs / Pills bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {watchlists.map((w) => {
          const isActive = w.id === activeId;
          return (
            <button
              key={w.id}
              onClick={() => onSelectWatchlist(w.id)}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all border ${
                isActive
                  ? "bg-cyan-500/15 border-cyan-500/50 text-cyan-400 shadow-sm shadow-cyan-500/20 font-bold"
                  : "bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-900"
              }`}
            >
              <span>{w.name}</span>
              <span
                className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                  isActive ? "bg-cyan-500/20 text-cyan-300" : "bg-slate-800 text-slate-500"
                }`}
              >
                {w.item_count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
