"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  TrendingUp,
  X,
  ArrowRight,
  Flame,
  LineChart,
} from "lucide-react";
import { searchStockUniverse, StockUniverseItem } from "@/lib/stock-universe";

interface StockSearchBarProps {
  placeholder?: string;
  className?: string;
  variant?: "default" | "compact";
}

export function StockSearchBar({
  placeholder = "Search stock (e.g. RELIANCE, TRENT)...",
  className = "",
  variant = "default",
}: StockSearchBarProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  // Filter stocks
  const suggestions = searchStockUniverse(query, 8);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setActiveIndex(-1);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Listen to Cmd+K / Ctrl+K to focus search input
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
        setIsOpen(true);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleSelect = (symbol: string) => {
    const symClean = symbol.trim().toUpperCase();
    if (!symClean) return;
    router.push(`/stock/${symClean}`);
    setQuery("");
    setIsOpen(false);
    setActiveIndex(-1);
    inputRef.current?.blur();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) {
      if (e.key === "ArrowDown" || e.key === "Enter") {
        setIsOpen(true);
        return;
      }
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => {
        const next = prev + 1 >= suggestions.length ? 0 : prev + 1;
        scrollIntoView(next);
        return next;
      });
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => {
        const next = prev - 1 < 0 ? suggestions.length - 1 : prev - 1;
        scrollIntoView(next);
        return next;
      });
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeIndex >= 0 && activeIndex < suggestions.length) {
        handleSelect(suggestions[activeIndex].symbol);
      } else if (query.trim()) {
        handleSelect(query.trim());
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      setIsOpen(false);
      setActiveIndex(-1);
      inputRef.current?.blur();
    }
  };

  const scrollIntoView = (index: number) => {
    if (listRef.current) {
      const items = listRef.current.children;
      if (items[index]) {
        (items[index] as HTMLElement).scrollIntoView({
          block: "nearest",
          behavior: "smooth",
        });
      }
    }
  };

  const handleClear = () => {
    setQuery("");
    setActiveIndex(-1);
    inputRef.current?.focus();
  };

  const widthClasses =
    variant === "compact"
      ? "w-44 sm:w-56 md:w-64"
      : "w-52 sm:w-64 md:w-72 lg:w-80";

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Search Input Bar */}
      <div className={`relative flex items-center ${widthClasses}`}>
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onFocus={() => setIsOpen(true)}
          onClick={() => setIsOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
            setActiveIndex(-1);
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoComplete="off"
          spellCheck="false"
          className="w-full pl-8 pr-14 py-1.5 text-xs rounded-xl border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-foreground font-mono placeholder:font-sans placeholder:text-muted-foreground/60 transition-all shadow-xs"
        />

        {/* Clear (X) or Shortcut Badge */}
        <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {query ? (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              title="Clear search"
            >
              <X className="h-3 w-3" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                inputRef.current?.focus();
                setIsOpen(true);
              }}
              className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-muted text-muted-foreground border border-border hover:text-foreground hidden sm:inline-block"
              title="Search shortcut (Cmd+K)"
            >
              ⌘K
            </button>
          )}
        </div>
      </div>

      {/* Predictive Dropdown Suggestions */}
      {isOpen && (
        <div className="absolute left-0 mt-2 w-72 sm:w-80 md:w-96 rounded-2xl border border-border bg-card shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150 backdrop-blur-md">
          {/* Header label */}
          <div className="flex items-center justify-between px-2.5 py-1.5 border-b border-border/80 mb-1">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              {query ? (
                <>
                  <Search className="h-3 w-3 text-primary" />
                  Matching Stocks ({suggestions.length})
                </>
              ) : (
                <>
                  <Flame className="h-3 w-3 text-amber-500" />
                  Trending & Top Traded Stocks
                </>
              )}
            </span>
            <span className="text-[10px] text-muted-foreground font-mono hidden sm:inline">
              ↑↓ Navigate · Enter View
            </span>
          </div>

          {/* List of Predictions */}
          {suggestions.length > 0 ? (
            <ul ref={listRef} className="max-h-80 overflow-y-auto space-y-1 pr-0.5">
              {suggestions.map((item, idx) => {
                const isSelected = idx === activeIndex;
                return (
                  <li key={item.symbol}>
                    <button
                      type="button"
                      onClick={() => handleSelect(item.symbol)}
                      onMouseEnter={() => setActiveIndex(idx)}
                      className={`w-full flex items-center justify-between p-2 rounded-xl text-xs transition-colors cursor-pointer text-left ${
                        isSelected
                          ? "bg-primary/10 text-primary border border-primary/25 font-medium"
                          : "hover:bg-muted text-foreground"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={`h-7 w-7 rounded-lg flex items-center justify-center shrink-0 ${
                            isSelected
                              ? "bg-primary text-primary-foreground font-bold"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          <LineChart className="h-3.5 w-3.5" />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono font-bold text-foreground text-xs">
                              {item.symbol}
                            </span>
                            {item.tag && (
                              <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded-full bg-primary/10 text-primary border border-primary/20">
                                {item.tag}
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-muted-foreground truncate max-w-[180px] sm:max-w-[220px]">
                            {item.name}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col items-end shrink-0 pl-2">
                        {item.typicalPrice && (
                          <span className="font-mono font-bold text-[11px] text-foreground">
                            ₹{item.typicalPrice.toLocaleString("en-IN")}
                          </span>
                        )}
                        <span className="text-[9px] text-muted-foreground flex items-center gap-1">
                          View Chart
                          <ArrowRight className="h-2.5 w-2.5" />
                        </span>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="p-4 text-center">
              <p className="text-xs text-muted-foreground">
                No matching presets for &quot;{query}&quot;
              </p>
              <button
                type="button"
                onClick={() => handleSelect(query)}
                className="mt-2 w-full py-2 px-3 rounded-xl bg-primary text-primary-foreground font-semibold text-xs flex items-center justify-center gap-1.5 hover:bg-primary/90 transition-colors shadow-sm"
              >
                <span>Open Custom Ticker &quot;{query.toUpperCase()}&quot;</span>
                <ArrowRight className="h-3 w-3" />
              </button>
            </div>
          )}

          {/* Direct Custom Ticker Search Option */}
          {query.trim() && suggestions.length > 0 && (
            <div className="mt-1 pt-1.5 border-t border-border/80 px-1">
              <button
                type="button"
                onClick={() => handleSelect(query)}
                className="w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-[11px] text-muted-foreground hover:text-foreground hover:bg-muted transition-colors font-mono"
              >
                <span>Jump directly to &quot;{query.toUpperCase()}&quot;</span>
                <ArrowRight className="h-3 w-3" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default StockSearchBar;
