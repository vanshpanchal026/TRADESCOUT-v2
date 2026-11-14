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
  TrendingUp,
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
      name: "Market Breadth & Indices",
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
      name: "Relative Rotation Graph",
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

  const isItemActive = (item: typeof navigationItems[0]) => {
    if (item.matchPrefix) {
      return pathname.startsWith(item.matchPrefix);
    }
    return pathname === item.href;
  };

  return (
    <aside className="w-14 sm:w-16 shrink-0 border-r border-border bg-card/95 backdrop-blur-md flex flex-col justify-between items-center py-3 z-40 h-screen sticky top-0 select-none">
      {/* Top Brand Logo */}
      <div className="flex flex-col items-center gap-3">
        <Link
          href="/"
          className="h-9 w-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-primary/20 hover:scale-105 transition-all group"
          title="Scan The Charts / TRADESCOUT"
        >
          {/* Stylized 'S' Logo */}
          <span className="font-extrabold text-lg tracking-tighter leading-none select-none">
            S
          </span>
        </Link>

        {/* Global Navigation Anchors */}
        <nav className="flex flex-col items-center gap-1 pt-1">
          {navigationItems.map((item) => {
            const active = isItemActive(item);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                title={item.tooltip}
                className={`relative p-2 rounded-xl transition-all group ${
                  active
                    ? "bg-primary/15 text-primary dark:bg-primary/20 dark:text-primary font-bold shadow-xs"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/70"
                }`}
              >
                <Icon className="h-4.5 w-4.5" />
                {/* Active Indicator dot */}
                {active && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-primary rounded-r-full" />
                )}
                {/* Hover Tooltip */}
                <span className="absolute left-16 px-2.5 py-1 rounded-lg bg-foreground text-background text-[11px] font-medium whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 shadow-md">
                  {item.tooltip}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Control Strip */}
      <div className="flex flex-col items-center gap-2 pt-2 border-t border-border/80 w-full px-2">
        {/* Feedback Drawer Trigger */}
        <button
          type="button"
          onClick={onOpenFeedback}
          className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/70 transition-colors relative group"
          title="Give Feedback (Slide-Over)"
          aria-label="Give Feedback"
        >
          <MessageSquare className="h-4.5 w-4.5" />
          <span className="absolute left-16 px-2.5 py-1 rounded-lg bg-foreground text-background text-[11px] font-medium whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 shadow-md">
            Send Feedback
          </span>
        </button>

        {/* Help Menu Popover */}
        <HelpMenu onReplayTour={onReplayTour} />

        {/* Theme Toggle (Moon/Sun) */}
        <div className="p-0.5">
          <ThemeToggle />
        </div>

        {/* User Profile Avatar with Initials "VP" matching screenshot */}
        <Link
          href="/account?sec=your-data"
          className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-xs transition-all relative group shadow-xs ${
            pathname.startsWith("/account")
              ? "bg-primary text-white ring-2 ring-primary ring-offset-2 ring-offset-card"
              : "bg-blue-600/80 hover:bg-blue-600 text-white"
          }`}
          title="User Profile (VP)"
        >
          <span>VP</span>
          <span className="absolute left-16 px-2.5 py-1 rounded-lg bg-foreground text-background text-[11px] font-medium whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 shadow-md">
            User Profile (VP)
          </span>
        </Link>
      </div>
    </aside>
  );
}

export default Sidebar;
