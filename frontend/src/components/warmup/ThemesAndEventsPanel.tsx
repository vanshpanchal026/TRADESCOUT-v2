"use client";

import React from "react";
import Link from "next/link";
import { Info, ArrowRight, Calendar, Sparkles } from "lucide-react";

export function ThemesAndEventsPanel() {
  const leadingThemes = [
    { name: "Defence Electronics", change: "+7.8%", pct: 78 },
    { name: "Aerospace", change: "+6.8%", pct: 68 },
    { name: "Space", change: "+6.2%", pct: 62 },
    { name: "Trading Houses", change: "+6.2%", pct: 62 },
    { name: "Banking", change: "+5.6%", pct: 56 },
  ];

  const laggingThemes = [
    { name: "Refining & OMC", change: "-1.8%", pct: 36 },
    { name: "Food Delivery & QSR", change: "-0.8%", pct: 20 },
    { name: "Leather & Footwear", change: "-0.1%", pct: 8 },
  ];

  const earningsTickers = [
    "KAYNES",
    "BALLFORGE",
    "HEROMOTORS",
    "JSLL",
    "JINDALPOLY",
    "FILCHEM",
  ];

  const calendarEvents = [
    { date: "Tue 17 Nov", title: "Weekly Nifty expiry" },
    { date: "Mon 23 Nov", title: "Monthly Nifty expiry" },
    { date: "Tue 1 Dec", title: "Weekly Nifty expiry" },
  ];

  return (
    <div className="space-y-4">
      {/* ================= WHERE THE MONEY IS ================= */}
      <div className="rounded-2xl bg-card border border-border/80 shadow-xs p-4 sm:p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-border/60">
          <div>
            <h3 className="text-sm font-bold text-foreground">Where the money is</h3>
            <span className="text-[10px] text-muted-foreground block mt-0.5">
              Themes • last 5 sessions to Fri 13 Nov
            </span>
          </div>
          <Link
            href="/groups"
            className="text-[11px] font-semibold text-primary hover:underline flex items-center gap-1"
          >
            <span>Open themes</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {/* LEADING */}
        <div className="space-y-2">
          <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Leading
          </div>
          <div className="space-y-2">
            {leadingThemes.map((theme) => (
              <div key={theme.name} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-foreground">{theme.name}</span>
                  <span className="font-mono font-bold text-bull text-[11px]">{theme.change}</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${theme.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* LAGGING */}
        <div className="space-y-2 pt-2 border-t border-border/40">
          <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Lagging
          </div>
          <div className="space-y-2">
            {laggingThemes.map((theme) => (
              <div key={theme.name} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-foreground">{theme.name}</span>
                  <span className="font-mono font-bold text-rose-500 text-[11px]">{theme.change}</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-rose-500/70"
                    style={{ width: `${theme.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ================= TODAY'S EVENTS ================= */}
      <div className="rounded-2xl bg-card border border-border/80 shadow-xs p-4 sm:p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-border/60">
          <div className="flex items-center gap-1.5">
            <h3 className="text-sm font-bold text-foreground">Today&apos;s events</h3>
            <Info className="h-3 w-3 text-muted-foreground/70" />
          </div>
          <span className="text-[10px] text-muted-foreground">Earnings, IPOs, calendar</span>
        </div>

        {/* EARNINGS */}
        <div className="space-y-1.5">
          <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Earnings
          </div>
          <div className="text-xs">
            <span className="font-semibold text-foreground mr-1.5">Sat 14 Nov</span>
            <div className="inline-flex flex-wrap items-center gap-1.5 mt-1">
              {earningsTickers.map((sym) => (
                <Link
                  key={sym}
                  href={`/stock/${sym}`}
                  className="px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-slate-100 dark:bg-muted hover:bg-primary/10 hover:text-primary transition-colors"
                >
                  {sym}
                </Link>
              ))}
              <Link
                href="/results"
                className="text-[10px] font-mono font-bold text-primary hover:underline ml-1"
              >
                +22 more
              </Link>
            </div>
          </div>
        </div>

        {/* LISTING TODAY */}
        <div className="space-y-1 pt-2 border-t border-border/40 text-xs">
          <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Listing today
          </div>
          <p className="text-[11px] text-muted-foreground">No IPOs today.</p>
        </div>

        {/* UPCOMING IPOS */}
        <div className="space-y-1 pt-2 border-t border-border/40 text-xs">
          <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Upcoming IPOs
          </div>
          <p className="text-[11px] text-muted-foreground">No IPOs open or coming up.</p>
        </div>

        {/* CALENDAR */}
        <div className="space-y-1.5 pt-2 border-t border-border/40 text-xs">
          <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Calendar
          </div>
          <div className="space-y-1 font-mono text-[11px]">
            {calendarEvents.map((ev, i) => (
              <div key={i} className="flex items-center justify-between text-muted-foreground">
                <span className="font-medium text-foreground">{ev.date}</span>
                <span>{ev.title}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ThemesAndEventsPanel;