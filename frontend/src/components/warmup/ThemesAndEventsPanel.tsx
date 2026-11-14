"use client";

import React from "react";
import Link from "next/link";
import { Flame, Calendar, Sparkles, TrendingUp, ArrowRight, Tag } from "lucide-react";

export function ThemesAndEventsPanel() {
  const themes = [
    { name: "Defence Electronics", change: "+7.9%", volumeExpansion: "3.4x", leaders: "BEL, DATAPATTNS, PARAS" },
    { name: "Aerospace", change: "+6.8%", volumeExpansion: "2.8x", leaders: "HAL, APOLLO, DYNAMATECH" },
    { name: "Space Technology", change: "+6.2%", volumeExpansion: "2.6x", leaders: "MTARTECH, CENTUM" },
    { name: "Power Equipment", change: "+4.9%", volumeExpansion: "2.1x", leaders: "BHEL, SIEMENS, ABB" },
    { name: "EMS / Electronics Mfg", change: "+4.4%", volumeExpansion: "1.9x", leaders: "DIXON, KAYNES, SYRMA" },
  ];

  const events = [
    { type: "Earnings", title: "TATA MOTORS Q3 FY27 Results", time: "Today 15:30 IST", badge: "High Impact", color: "text-bull bg-bull/10 border-bull/20" },
    { type: "IPO Subscription", title: "Apex Clean Energy IPO (Day 2)", time: "Sub: 4.8x", badge: "Active IPO", color: "text-primary bg-primary/10 border-primary/20" },
    { type: "Listing", title: "Starlight Tech Secondary Tranche", time: "Today 10:00 IST", badge: "NSE Listing", color: "text-amber-500 bg-amber-500/10 border-amber-500/20" },
    { type: "Earnings", title: "TITAN Co. Quarterly Disclosures", time: "Tomorrow 16:00 IST", badge: "Consumer", color: "text-blue-500 bg-blue-500/10 border-blue-500/20" },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      {/* Themes & Money Flow Card */}
      <div className="p-5 rounded-2xl bg-card border border-border shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
              <Flame className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">Themes &amp; Money Flow</h3>
              <p className="text-[11px] text-muted-foreground">Top outperforming thematic clusters by institutional volume</p>
            </div>
          </div>
          <Link
            href="/groups"
            className="text-[11px] font-semibold text-primary hover:underline flex items-center gap-1"
          >
            <span>View All Groups</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="space-y-2">
          {themes.map((t, idx) => (
            <div
              key={t.name}
              className="p-3 rounded-xl bg-background border border-border/80 flex items-center justify-between hover:border-primary/40 transition-colors"
            >
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-foreground">{t.name}</span>
                  <span className="text-[10px] text-muted-foreground font-mono">Vol: {t.volumeExpansion}</span>
                </div>
                <p className="text-[10px] text-muted-foreground">Leaders: {t.leaders}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold font-mono text-bull">{t.change}</span>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-bull/10 text-bull border border-bull/20 font-bold">
                  Stage 2
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Today's Events Panel */}
      <div className="p-5 rounded-2xl bg-card border border-border shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold">
              <Calendar className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">Today&apos;s Events Panel</h3>
              <p className="text-[11px] text-muted-foreground">Quarterly earnings reports, listings &amp; active IPO windows</p>
            </div>
          </div>
          <Link
            href="/results"
            className="text-[11px] font-semibold text-primary hover:underline flex items-center gap-1"
          >
            <span>Results Calendar</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="space-y-2">
          {events.map((ev, idx) => (
            <div
              key={idx}
              className="p-3 rounded-xl bg-background border border-border/80 flex items-center justify-between hover:border-primary/40 transition-colors"
            >
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${ev.color}`}>
                    {ev.badge}
                  </span>
                  <span className="text-xs font-bold text-foreground">{ev.title}</span>
                </div>
                <p className="text-[10px] text-muted-foreground">{ev.time}</p>
              </div>
              <span className="text-[10px] text-primary font-semibold hover:underline cursor-pointer">
                Details &gt;
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ThemesAndEventsPanel;
