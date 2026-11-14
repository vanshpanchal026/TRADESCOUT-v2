"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  Zap,
  BarChart3,
  SlidersHorizontal,
  Flame,
  LayoutGrid,
  Compass,
  Layers,
  Calendar,
  Newspaper,
  Star,
  MessageSquare,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { HelpMenu } from "@/components/shell/HelpMenu";

interface SidebarProps {
  onOpenFeedback: () => void;
  onReplayTour: () => void;
}

export function Sidebar({ onOpenFeedback, onReplayTour }: SidebarProps) {
  const pathname = usePathname();

  const navigationItems = [
    {
      name: "The Warm-up",
      href: "/warmup",
      icon: Activity,
      tooltip: "The Warm-up Cockpit",
      matchPrefix: "/warmup",
    },
    {
      name: "Intraday Screener",
      href: "/intraday",
      icon: Zap,
      tooltip: "3-Column Intraday Screener",
      matchPrefix: "/intraday",
    },
    {
      name: "Market Breadth",
      href: "/markets",
      icon: BarChart3,
      tooltip: "Market Breadth & Major Indices",
      matchPrefix: "/markets",
    },
    {
      name: "Technical Scanners",
      href: "/scanners/trend-template",
      icon: SlidersHorizontal,
      tooltip: "11+ Technical Scanners Hub",
      matchPrefix: "/scanners",
    },
    {
      name: "Market Leaders",
      href: "/leaders",
      icon: Flame,
      tooltip: "Top 150 Sector Leaders",
      matchPrefix: "/leaders",
    },
    {
      name: "Sector Treemap",
      href: "/heatmap",
      icon: LayoutGrid,
      tooltip: "Market Cap Sector Heatmap",
      matchPrefix: "/heatmap",
    },
    {
      name: "Relative Rotation (RRG)",
      href: "/rrg",
      icon: Compass,
      tooltip: "Relative Rotation Graph (RRG)",
      matchPrefix: "/rrg",
    },
    {
      name: "Groups & Themes",
      href: "/groups",
      icon: Layers,
      tooltip: "Sectors, Industries & Themes",
      matchPrefix: "/groups",
    },
    {
      name: "Earnings Results",
      href: "/results",
      icon: Calendar,
      tooltip: "Quarterly Results Calendar",
      matchPrefix: "/results",
    },
    {
      name: "News Feed",
      href: "/news",
      icon: Newspaper,
      tooltip: "Categorized Market News Feed",
      matchPrefix: "/news",
    },
    {
      name: "Watchlists & Terminal",
      href: "/watchlists",
      icon: Star,
      tooltip: "Watchlists & Trader Journal",
      matchPrefix: "/watchlists",
    },
  ];

  const isItemActive = (item: (typeof navigationItems)[0]) => {
    if (item.matchPrefix) {
      return pathname.startsWith(item.matchPrefix);
    }
    return pathname === item.href;
  };

  return (
    <aside className="hidden lg:flex w-[240px] shrink-0 border-r border-border bg-[#141420] text-foreground flex-col justify-between py-3 px-3 z-40 h-screen sticky top-0 select-none">
      {/* Top Brand Logo & App Identity */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between px-1">
          <Link
            href="/"
            className="flex items-center gap-2.5 group"
            title="Scan The Charts / TRADESCOUT"
          >
            <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white shadow-md shadow-primary/20 group-hover:scale-105 transition-all">
              <span className="font-extrabold text-base tracking-tighter leading-none select-none">
                S
              </span>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-sm tracking-tight text-white leading-tight">
                TRADESCOUT
              </span>
              <span className="text-[10px] text-zinc-400 font-mono tracking-wider">
                NSE ANALYTICS
              </span>
            </div>
          </Link>
          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-primary/20 text-indigo-300 border border-primary/30 font-mono">
            v2.0
          </span>
        </div>

        {/* Global Navigation List with Icons & Labels */}
        <nav className="flex flex-col gap-1 pt-1 overflow-y-auto no-scrollbar max-h-[calc(100vh-220px)]">
          {navigationItems.map((item) => {
            const active = isItemActive(item);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                title={item.tooltip}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all group ${
                  active
                    ? "bg-primary/20 text-white font-semibold border border-primary/30 shadow-xs"
                    : "text-zinc-400 hover:text-white hover:bg-white/[0.04]"
                }`}
              >
                <Icon
                  className={`h-4 w-4 shrink-0 transition-colors ${
                    active ? "text-indigo-400" : "text-zinc-400 group-hover:text-zinc-200"
                  }`}
                />
                <span className="truncate">{item.name}</span>
                {active && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Control & Profile Strip */}
      <div className="flex flex-col gap-2 pt-2 border-t border-border/80 w-full">
        {/* Quick Utility Action Bar */}
        <div className="flex items-center justify-between px-1">
          {/* Feedback Trigger */}
          <button
            type="button"
            onClick={onOpenFeedback}
            className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs font-medium text-zinc-400 hover:text-white hover:bg-white/[0.05] transition-colors"
            title="Give Feedback (Slide-Over)"
            aria-label="Give Feedback"
          >
            <MessageSquare className="h-3.5 w-3.5" />
            <span>Feedback</span>
          </button>

          <div className="flex items-center gap-1">
            {/* Help Menu */}
            <HelpMenu onReplayTour={onReplayTour} />
            {/* Theme Toggle */}
            <ThemeToggle />
          </div>
        </div>

        {/* User Profile Card */}
        <Link
          href="/account?sec=your-data"
          className={`flex items-center gap-2.5 p-2 rounded-xl transition-all border ${
            pathname.startsWith("/account")
              ? "bg-primary/20 border-primary/40 text-white"
              : "bg-white/[0.02] border-white/[0.05] hover:bg-white/[0.05] text-zinc-300"
          }`}
          title="User Profile (VP)"
        >
          <div className="h-7 w-7 rounded-full bg-gradient-to-tr from-indigo-600 to-blue-500 flex items-center justify-center font-bold text-xs text-white shrink-0 shadow-xs">
            <span>VP</span>
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-semibold text-white truncate leading-tight">
              Alpha Trader
            </span>
            <span className="text-[10px] text-zinc-400 truncate">
              Pro Account
            </span>
          </div>
        </Link>
      </div>
    </aside>
  );
}

export default Sidebar;
