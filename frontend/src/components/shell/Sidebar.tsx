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
  Bookmark,
  MessageSquare,
  User,
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
      icon: Bookmark,
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
    <aside className="w-16 shrink-0 border-r border-border bg-card/95 backdrop-blur-md flex flex-col justify-between items-center py-4 z-40 h-screen sticky top-0">
      {/* Top Brand Logo */}
      <div className="flex flex-col items-center gap-4">
        <Link
          href="/"
          className="h-10 w-10 rounded-2xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/25 hover:scale-105 transition-all group"
          title="Scan The Charts / TRADESCOUT"
        >
          <TrendingUp className="h-5 w-5 group-hover:rotate-6 transition-transform" />
        </Link>

        {/* Global Navigation Anchors */}
        <nav className="flex flex-col items-center gap-1.5 pt-2">
          {navigationItems.map((item) => {
            const active = isItemActive(item);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                title={item.tooltip}
                className={`relative p-2.5 rounded-xl transition-all group ${
                  active
                    ? "bg-primary text-white shadow-md shadow-primary/25 font-semibold"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/70"
                }`}
              >
                <Icon className="h-5 w-5" />
                {/* Active Indicator dot */}
                {active && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-4 bg-primary rounded-r-full" />
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
          className="p-2.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/70 transition-colors relative group"
          title="Give Feedback (Slide-Over)"
          aria-label="Give Feedback"
        >
          <MessageSquare className="h-5 w-5" />
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

        {/* User Account Link */}
        <Link
          href="/account?sec=profile"
          className={`p-2.5 rounded-xl transition-all relative group ${
            pathname.startsWith("/account")
              ? "bg-primary text-white shadow-md shadow-primary/25"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/70"
          }`}
          title="Account & Subscription"
        >
          <User className="h-5 w-5" />
          <span className="absolute left-16 px-2.5 py-1 rounded-lg bg-foreground text-background text-[11px] font-medium whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 shadow-md">
            Account & Subscription
          </span>
        </Link>
      </div>
    </aside>
  );
}

export default Sidebar;
