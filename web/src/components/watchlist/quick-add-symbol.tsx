"use client";

import React, { useState } from "react";
import { Plus, Search } from "lucide-react";

interface QuickAddSymbolProps {
  watchlistId: string;
  onSymbolAdded: () => void;
}

const COMMON_SYMBOLS = [
  "RELIANCE",
  "TCS",
  "INFY",
  "HDFCBANK",
  "ICICIBANK",
  "TRENT",
  "DIXON",
  "KAYNES",
  "HAL",
  "BEL",
  "BHARTIARTL",
  "LT",
  "SBIN",
  "TATAMOTORS",
  "BAJFINANCE",
  "TITAN",
  "MARUTI",
  "ZOMATO",
  "BSE",
  "CDSL",
  "ANGELONE",
  "SUZLON",
  "POLYCAB",
  "PERSISTENT",
  "COFORGE",
];

export function QuickAddSymbol({ watchlistId, onSymbolAdded }: QuickAddSymbolProps) {
  const [query, setQuery] = useState("");
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const filteredSuggestions = query.trim()
    ? COMMON_SYMBOLS.filter((s) => s.includes(query.trim().toUpperCase())).slice(0, 6)
    : [];

  const handleAdd = async (symbolToAdd?: string) => {
    const sym = (symbolToAdd || query).trim().toUpperCase();
    if (!sym || !watchlistId) return;

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await fetch(`/api/watchlists/${watchlistId}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symbol: sym,
          notes: note.trim() || undefined,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to add stock symbol");
      }

      setQuery("");
      setNote("");
      setShowSuggestions(false);
      onSymbolAdded();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Error adding symbol");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative flex flex-col gap-2 w-full max-w-xl">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleAdd();
        }}
        className="flex items-center gap-2"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value.toUpperCase());
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            placeholder="Add NSE Symbol (e.g. RELIANCE, TRENT, DIXON)..."
            className="w-full bg-slate-900/90 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-100 placeholder-slate-500 font-mono uppercase focus:outline-none focus:border-cyan-500/70 focus:ring-1 focus:ring-cyan-500/50 transition-all shadow-inner"
          />

          {/* Autocomplete dropdown */}
          {showSuggestions && filteredSuggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-slate-900 border border-slate-800 rounded-lg shadow-xl z-50 overflow-hidden divide-y divide-slate-800/60">
              {filteredSuggestions.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => {
                    setQuery(s);
                    handleAdd(s);
                  }}
                  className="w-full text-left px-3 py-2 text-xs font-mono font-semibold text-slate-200 hover:bg-cyan-500/10 hover:text-cyan-400 transition-colors flex items-center justify-between"
                >
                  <span>{s}</span>
                  <span className="text-[10px] text-slate-500 font-sans">NSE Equities</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <input
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Note / Trigger (optional)"
          className="hidden md:block w-48 bg-slate-900/90 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/70 transition-all"
        />

        <button
          type="submit"
          disabled={!query.trim() || isSubmitting}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-bold text-xs transition-all shadow-sm shadow-cyan-500/20 active:scale-95 shrink-0"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>{isSubmitting ? "Adding..." : "Add Stock"}</span>
        </button>
      </form>

      {errorMsg && <p className="text-[11px] text-rose-400">{errorMsg}</p>}
    </div>
  );
}
