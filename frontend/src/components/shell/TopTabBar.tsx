"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Bell,
  SlidersHorizontal,
  Search,
  LayoutDashboard,
  Flame,
  Clock,
  Calendar,
  LayoutGrid,
  Trophy,
  Compass,
  Newspaper,
} from "lucide-react";
import { UserSwitcher } from "@/components/common/UserSwitcher";
import { CommandPalette } from "@/components/common/CommandPalette";
import { StockSearchBar } from "@/components/common/StockSearchBar";

export function TopTabBar() {
  const pathname = usePathname();
  const router = useRouter();
  const [showNotification, setShowNotification] = useState(false);

  const tabs = [
    { name: "Pages", href: "/", icon: LayoutDashboard },
    { name: "Warm-up", href: "/warmup", icon: Flame },
    { name: "Intraday", href: "/intraday", icon: Clock },
    { name: "Earnings", href: "/results", icon: Calendar },
    { name: "Heatmap", href: "/heatmap", icon: LayoutGrid },
    { name: "Leaders", href: "/leaders", icon: Trophy },
    { name: "RRG", href: "/rrg", icon: Compass },
    { name: "News", href: "/news", icon: Newspaper },
  ];

  const isTabActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  const isScannersActive = pathname.startsWith("/scanners");

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#cce0fc] dark:border-[#27272a] bg-gradient-to-r from-[#d6e5fb]/90 via-[#e0ecfc]/85 to-[#dbe8fc]/90 dark:from-[#141420]/95 dark:via-[#141420]/95 dark:to-[#141420]/95 backdrop-blur-md">
      <div className="flex items-center justify-between h-13 px-3 sm:px-5 gap-3">
        {/* Left: Tab Switcher Strip */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-1">
          {tabs.map((tab) => {
            const active = isTabActive(tab.href);
            const Icon = tab.icon;
            return (
              <Link
                key={tab.name}
                href={tab.href}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-150 ease-out ${
                  active
                    ? "bg-white dark:bg-[#1c1c2e] text-primary shadow-xs border border-blue-200/80 dark:border-primary/40 shadow-[0_0_12px_rgba(99,102,241,0.12)]"
                    : "text-slate-700 dark:text-muted-foreground hover:text-foreground hover:bg-white/60 dark:hover:bg-[#1c1c2e]/60 border border-transparent"
                }`}
              >
                <Icon className={`h-3.5 w-3.5 shrink-0 ${active ? "text-primary" : "text-slate-500 dark:text-muted-foreground"}`} />
                <span>{tab.name}</span>
              </Link>
            );
          })}

          {/* Explore Scanners button */}
          <button
            type="button"
            onClick={() => router.push("/scanners/trend-template")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-150 ease-out cursor-pointer ${
              isScannersActive
                ? "bg-white dark:bg-[#1c1c2e] text-primary shadow-xs border border-blue-200/80 dark:border-primary/40 shadow-[0_0_12px_rgba(99,102,241,0.12)]"
                : "text-slate-700 dark:text-muted-foreground hover:text-primary hover:bg-white/60 dark:hover:bg-primary/10 border border-blue-200/50 dark:border-[#27272a] bg-white/40 dark:bg-[#1c1c2e]/40"
            }`}
            title="Explore Scanners"
          >
            <SlidersHorizontal className="h-3.5 w-3.5 text-primary shrink-0" />
            <span>Explore Scanners</span>
          </button>
        </div>

        {/* Right: Search, Notifications, Tier Badge, User Profile */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Quick Search Bar with Predictive Dropdown */}
          <div className="hidden md:block">
            <StockSearchBar placeholder="Search ticker (e.g. RELIANCE)..." />
          </div>

          {/* Command Palette Trigger */}
          <button
            type="button"
            onClick={() => window.dispatchEvent(new CustomEvent("open-command-palette"))}
            title="Command Palette (Ctrl+K)"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-700 dark:text-muted-foreground hover:text-foreground hover:bg-white/60 dark:hover:bg-muted/60 transition-all duration-150 ease-out border border-blue-200/50 dark:border-border bg-white/40 dark:bg-card/40 cursor-pointer"
          >
            <Search className="h-3.5 w-3.5" />
            <kbd className="hidden lg:inline text-[10px] font-mono px-1 rounded bg-slate-100 dark:bg-muted">Ctrl+K</kbd>
          </button>

          {/* Notification Bell */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowNotification(!showNotification)}
              className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted relative transition-all duration-150 ease-out"
              title="Notifications"
            >
              <Bell className="h-4 w-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary ring-2 ring-card" />
            </button>

            {showNotification && (
              <div className="absolute right-0 top-11 z-50 w-72 rounded-2xl border border-border bg-card shadow-2xl p-3 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between pb-2 border-b border-border/80">
                  <span className="text-xs font-semibold text-foreground">Market Notifications</span>
                  <span className="text-[10px] text-bull font-medium">Market Open</span>
                </div>
                <div className="py-2.5 space-y-2">
                  <div className="p-2 rounded-xl bg-muted/40 border border-border/50 text-[11px]">
                    <div className="flex items-center justify-between font-semibold text-foreground">
                      <span>FII Institutional Surge</span>
                      <span className="text-[10px] text-bull font-mono tabular-nums">+₹5,737 Cr</span>
                    </div>
                    <p className="text-muted-foreground mt-0.5">Heavy institutional net cash inflows recorded in today&apos;s session.</p>
                  </div>
                  <div className="p-2 rounded-xl bg-muted/40 border border-border/50 text-[11px]">
                    <div className="flex items-center justify-between font-semibold text-foreground">
                      <span>RVOL Alert: BFUTILITIE</span>
                      <span className="text-[10px] text-primary font-mono tabular-nums">+21,902%</span>
                    </div>
                    <p className="text-muted-foreground mt-0.5">Exceptional relative volume spike detected on 15m intraday breakout.</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Tier Badge */}
          <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border border-primary/20 bg-primary/10 text-primary">
            <span className="relative flex h-1.5 w-1.5">
              <span className="inline-flex rounded-full h-1.5 w-1.5 bg-primary shadow-[0_0_6px_rgba(1,113,228,0.8)]" />
            </span>
            <span>Beta — Free</span>
          </div>

          {/* User Account / Identity */}
          <UserSwitcher />
        </div>
      </div>
      <CommandPalette />
    </header>
  );
}

export default TopTabBar;
