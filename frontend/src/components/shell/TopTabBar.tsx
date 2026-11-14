"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Search,
  Bell,
  Plus,
  SlidersHorizontal,
  Sparkles,
  Command,
  Layout,
  Activity,
  Zap,
  Calendar,
  LayoutGrid,
  Flame,
  Compass,
  Newspaper,
  ChevronDown,
} from "lucide-react";
import { UserSwitcher } from "@/components/common/UserSwitcher";
import { CommandPalette } from "@/components/common/CommandPalette";

export function TopTabBar() {
  const pathname = usePathname();
  const router = useRouter();
  const [searchSymbol, setSearchSymbol] = useState("");
  const [showNotification, setShowNotification] = useState(false);

  const tabs = [
    { name: "Pages", href: "/" },
    { name: "Warm-up", href: "/warmup" },
    { name: "Intraday", href: "/intraday" },
    { name: "Earnings", href: "/results" },
    { name: "Heatmap", href: "/heatmap" },
    { name: "Leaders", href: "/leaders" },
    { name: "RRG", href: "/rrg" },
    { name: "News", href: "/news" },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const sym = searchSymbol.trim().toUpperCase();
    if (sym) {
      router.push(`/stock/${sym}`);
      setSearchSymbol("");
    }
  };

  const isTabActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-30 w-full border-b border-border bg-card/90 backdrop-blur-md">
      <div className="flex items-center justify-between h-14 px-4 sm:px-6 gap-3">
        {/* Left: Tab Switcher */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-1">
          {tabs.map((tab) => {
            const active = isTabActive(tab.href);
            return (
              <Link
                key={tab.name}
                href={tab.href}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  active
                    ? "bg-primary/10 text-primary font-bold border border-primary/20 shadow-xs"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                }`}
              >
                {tab.name}
              </Link>
            );
          })}

          {/* Explore Scanners button */}
          <button
            type="button"
            onClick={() => router.push("/scanners/trend-template")}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-primary hover:bg-primary/5 transition-colors whitespace-nowrap border border-border"
            title="Explore Scanners"
          >
            <SlidersHorizontal className="h-3 w-3" />
            <span>Explore Scanners</span>
          </button>
        </div>

        {/* Right: Search, Notifications, Tier Badge, User Profile */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Quick Search Bar */}
          <form onSubmit={handleSearch} className="relative hidden md:block">
            <input
              type="text"
              value={searchSymbol}
              onChange={(e) => setSearchSymbol(e.target.value)}
              placeholder="Search ticker (e.g. RELIANCE)..."
              className="w-48 lg:w-60 pl-8 pr-12 py-1.5 text-xs rounded-xl border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-foreground font-mono placeholder:font-sans placeholder:text-muted-foreground/60"
            />
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
            <button
              type="button"
              onClick={() => {
                window.dispatchEvent(new CustomEvent("open-command-palette"));
              }}
              className="absolute right-1.5 top-1.5 px-1.5 py-0.5 rounded text-[10px] font-mono bg-muted text-muted-foreground border border-border hover:text-foreground"
              title="Open Command Palette (Cmd+K)"
            >
              ⌘K
            </button>
          </form>

          {/* Notification Bell */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowNotification(!showNotification)}
              className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted relative transition-colors"
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
                      <span className="text-[10px] text-bull">+₹5,737 Cr</span>
                    </div>
                    <p className="text-muted-foreground mt-0.5">Heavy institutional net cash inflows recorded in today&apos;s session.</p>
                  </div>
                  <div className="p-2 rounded-xl bg-muted/40 border border-border/50 text-[11px]">
                    <div className="flex items-center justify-between font-semibold text-foreground">
                      <span>RVOL Alert: BFUTILITIE</span>
                      <span className="text-[10px] text-primary font-mono">+21,902%</span>
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
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-primary" />
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
