"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Activity,
  ArrowRight,
  Compass,
  LayoutGrid,
  LineChart,
  Search,
  Sparkles,
  Star,
  Zap,
} from "lucide-react";

interface CommandItem {
  id: string;
  title: string;
  subtitle: string;
  category: "Navigation" | "Scanners" | "Stocks";
  icon: React.ElementType;
  href: string;
  badge?: string;
}

const COMMAND_ITEMS: CommandItem[] = [
  // Navigation
  {
    id: "nav-warmup",
    title: "The Warmup Cockpit",
    subtitle: "Morning market breadth, SMA participation & RME sentiment",
    category: "Navigation",
    icon: Activity,
    href: "/warmup",
    badge: "Breadth",
  },
  {
    id: "nav-watchlists",
    title: "Watchlists & Journal",
    subtitle: "Personal persistent watchlists and markdown trade notes",
    category: "Navigation",
    icon: Star,
    href: "/watchlists",
    badge: "User Data",
  },
  {
    id: "nav-rrg",
    title: "Relative Rotation Graph (RRG)",
    subtitle: "JdK rotational quadrants & clockwise trailing tails",
    category: "Navigation",
    icon: Compass,
    href: "/rrg",
    badge: "Rotations",
  },
  {
    id: "nav-heatmap",
    title: "Market Cap Treemap Heatmap",
    subtitle: "Hierarchical sector & stock 1D performance weights",
    category: "Navigation",
    icon: LayoutGrid,
    href: "/heatmap",
    badge: "Sectors",
  },

  // Scanners
  {
    id: "scan-trend-template",
    title: "Minervini Trend Template",
    subtitle: "Mark Minervini 8-rule Stage 2 momentum screener",
    category: "Scanners",
    icon: Zap,
    href: "/scanners/trend-template",
    badge: "Stage 2",
  },
  {
    id: "scan-recent-breakout",
    title: "Recent Breakouts",
    subtitle: "Gain >= 2.5% with relative volume >= 1.5x 50 SMA",
    category: "Scanners",
    icon: Zap,
    href: "/scanners/recent-breakout",
    badge: "Volume",
  },
  {
    id: "scan-4pct-breakout",
    title: "4%+ High-Volume Breakouts",
    subtitle: "Institutional thrust candles with strong turnover",
    category: "Scanners",
    icon: Zap,
    href: "/scanners/4pct-breakout",
    badge: "Thrust",
  },
  {
    id: "scan-high-volume",
    title: "High Relative Volume (RVOL >= 2.0)",
    subtitle: "Unusual volume spikes 2x above 50-day average",
    category: "Scanners",
    icon: Zap,
    href: "/scanners/high-volume",
    badge: "RVOL",
  },
  {
    id: "scan-1m-gainers",
    title: "Top 1-Month Momentum Gainers",
    subtitle: "Highest trailing 20-day returns across NSE universe",
    category: "Scanners",
    icon: Zap,
    href: "/scanners/1m-gainers",
    badge: "Returns",
  },

  // Popular Stocks
  {
    id: "stock-reliance",
    title: "RELIANCE — Reliance Industries Ltd",
    subtitle: "Oil & Gas, Retail, Telecom conglomerate",
    category: "Stocks",
    icon: LineChart,
    href: "/stock/RELIANCE",
    badge: "₹1,270.40",
  },
  {
    id: "stock-trent",
    title: "TRENT — Trent Ltd (Tata Retail)",
    subtitle: "Zudio & Westside retail hyper-growth leader",
    category: "Stocks",
    icon: LineChart,
    href: "/stock/TRENT",
    badge: "₹7,140.00",
  },
  {
    id: "stock-dixon",
    title: "DIXON — Dixon Technologies Ltd",
    subtitle: "Electronics manufacturing services (EMS) leader",
    category: "Stocks",
    icon: LineChart,
    href: "/stock/DIXON",
    badge: "₹15,220.00",
  },
  {
    id: "stock-kaynes",
    title: "KAYNES — Kaynes Technology India",
    subtitle: "Semiconductor and defence electronics supplier",
    category: "Stocks",
    icon: LineChart,
    href: "/stock/KAYNES",
    badge: "₹5,420.00",
  },
  {
    id: "stock-tcs",
    title: "TCS — Tata Consultancy Services",
    subtitle: "Information Technology global service giant",
    category: "Stocks",
    icon: LineChart,
    href: "/stock/TCS",
    badge: "₹4,120.00",
  },
  {
    id: "stock-hdfcbank",
    title: "HDFCBANK — HDFC Bank Ltd",
    subtitle: "India's largest private sector banking institution",
    category: "Stocks",
    icon: LineChart,
    href: "/stock/HDFCBANK",
    badge: "₹1,740.00",
  },
  {
    id: "stock-zomato",
    title: "ZOMATO — Zomato Ltd (Blinkit)",
    subtitle: "Quick commerce & food delivery market leader",
    category: "Stocks",
    icon: LineChart,
    href: "/stock/ZOMATO",
    badge: "₹265.00",
  },
];

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const resultsRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const filtered = COMMAND_ITEMS.filter((item) => {
    const q = query.toLowerCase().trim();
    if (!q) return true;
    return (
      item.title.toLowerCase().includes(q) ||
      item.subtitle.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q)
    );
  });

  const handleSelect = React.useCallback((item: CommandItem) => {
    router.push(item.href);
    setIsOpen(false);
    setQuery("");
  }, [router]);

  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener("open-command-palette", handleOpen);
    return () => window.removeEventListener("open-command-palette", handleOpen);
  }, []);

  // Keyboard navigation listener: Cmd+K / Ctrl+K, Arrow keys, Enter, Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      } else if (isOpen) {
        if (e.key === "Escape") {
          e.preventDefault();
          setIsOpen(false);
        } else if (e.key === "ArrowDown") {
          e.preventDefault();
          setSelectedIndex((prev) => (filtered.length > 0 ? (prev + 1) % filtered.length : 0));
        } else if (e.key === "ArrowUp") {
          e.preventDefault();
          setSelectedIndex((prev) => (filtered.length > 0 ? (prev - 1 + filtered.length) % filtered.length : 0));
        } else if (e.key === "Enter") {
          e.preventDefault();
          if (filtered.length > 0 && filtered[selectedIndex]) {
            handleSelect(filtered[selectedIndex]);
          } else if (query.trim()) {
            router.push(`/stock/${query.trim().toUpperCase()}`);
            setIsOpen(false);
            setQuery("");
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, filtered, selectedIndex, query, router, handleSelect]);

  // Keep highlighted item in view during keyboard arrow traversal
  useEffect(() => {
    if (resultsRef.current) {
      const items = resultsRef.current.querySelectorAll<HTMLButtonElement>("[data-command-item]");
      if (items[selectedIndex]) {
        items[selectedIndex].scrollIntoView({ block: "nearest" });
      }
    }
  }, [selectedIndex]);

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (filtered.length > 0 && filtered[selectedIndex]) {
      handleSelect(filtered[selectedIndex]);
      return;
    }
    const q = query.trim().toUpperCase();
    if (q) {
      router.push(`/stock/${q}`);
      setIsOpen(false);
      setQuery("");
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={() => setIsOpen(false)}
    >
      <div
        className="w-full max-w-2xl rounded-2xl border border-border bg-card shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <form
          onSubmit={handleCustomSubmit}
          className="flex items-center gap-3 px-4 py-3.5 border-b border-border bg-card/60"
        >
          <Search className="h-5 w-5 text-accent" />
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Type a stock symbol (e.g. RELIANCE) or navigate tools..."
            autoFocus
            className="flex-1 text-sm bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground/70 font-medium"
          />
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-mono bg-muted/60 px-2 py-0.5 rounded border border-border">
            <span>ESC to close</span>
          </div>
        </form>

        {/* Results List */}
        <div ref={resultsRef} className="max-h-96 overflow-y-auto p-2 space-y-1">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground text-xs">
              <Sparkles className="h-6 w-6 mx-auto mb-2 text-muted-foreground/50" />
              <span>No direct predefined matches for &quot;{query}&quot;.</span>
              <div className="mt-2">
                <button
                  type="button"
                  onClick={() => {
                    const q = query.trim().toUpperCase();
                    if (q) {
                      router.push(`/stock/${q}`);
                      setIsOpen(false);
                    }
                  }}
                  className="px-3 py-1.5 rounded-lg bg-accent/15 text-accent font-semibold hover:bg-accent/25 transition-colors"
                >
                  Open Chart for ₹{query.trim().toUpperCase()} &rarr;
                </button>
              </div>
            </div>
          ) : (
            filtered.map((item, idx) => {
              const Icon = item.icon;
              const isSelected = idx === selectedIndex;
              return (
                <button
                  key={item.id}
                  data-command-item
                  type="button"
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all ${
                    isSelected
                      ? "bg-accent/15 text-accent border border-accent/20"
                      : "hover:bg-muted text-foreground"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-8 w-8 rounded-lg flex items-center justify-center ${
                        isSelected
                          ? "bg-accent text-white shadow-sm"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-foreground">{item.title}</span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-muted text-muted-foreground font-mono">
                          {item.category}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground/80 line-clamp-1">
                        {item.subtitle}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {item.badge && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-card border border-border text-foreground font-semibold">
                        {item.badge}
                      </span>
                    )}
                    <ArrowRight className="h-3.5 w-3.5 text-muted-foreground opacity-60" />
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Footer shortcuts hint */}
        <div className="px-4 py-2 border-t border-border/60 bg-muted/20 flex items-center justify-between text-[10px] text-muted-foreground font-mono">
          <div className="flex items-center gap-3">
            <span>&uarr; &darr; Navigate</span>
            <span>&crarr; Select</span>
          </div>
          <span>TRADESCOUT Command Terminal</span>
        </div>
      </div>
    </div>
  );
}

export default CommandPalette;
