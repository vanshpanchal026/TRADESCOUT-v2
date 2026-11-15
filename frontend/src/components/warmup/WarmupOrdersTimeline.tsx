"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Star, Bookmark } from "lucide-react";

export function WarmupOrdersTimeline() {
  const newsItems = [
    {
      time: "10:00",
      symbol: "BDBL",
      tag: "Expansion",
      headline: "Bhopal shutdown hits Q2 earnings; recovery and new plant underway.",
    },
    {
      time: "10:12",
      symbol: "TEXRAIL",
      tag: "Order",
      headline:
        "Texmaco Rail & Engineering receives order worth ₹88.60 crore from north western railway for supply of 060 sets of area crossing; delivery to be completed by 11th January, 2027.",
    },
    {
      time: "11:17",
      symbol: "SINT",
      tag: "Order",
      headline:
        "SINT India co receives new order worth approx ₹50 million from Canadian global partner for managed services in healthcare; execution period of 2 to 3 years.",
    },
    {
      time: "12:17",
      symbol: "SOLEX",
      tag: "Order",
      headline: "SOLEX receives major commercial order for solar modules.",
    },
    {
      time: "22:12",
      symbol: "REGEAL",
      tag: "Expansion",
      headline: "Regeal Resources: Q2 growth, capacity expansion drives performance.",
    },
    {
      time: "20:00",
      symbol: "PVR",
      tag: "Expansion",
      headline: "Inox Leisure sees revenue growth, major capacity expansion across Tier 2 cities.",
    },
    {
      time: "18:04",
      symbol: "GPL",
      tag: "Expansion",
      headline: "Godavari Power & Ispat Unveils New Brand Identity, Signals Growth.",
    },
  ];

  return (
    <div className="space-y-4">
      {/* ================= YOUR WATCHLIST PLAN CARD ================= */}
      <div className="rounded-2xl bg-card border border-border/80 shadow-stc-card p-4 sm:p-5 transition-all duration-150 ease-out hover:border-brand/40">
        <h4 className="text-xs font-bold text-foreground">Your watchlist plan</h4>
        <div className="flex items-center justify-between text-xs text-muted-foreground mt-2">
          <span>Create a watchlist to see your plan here.</span>
          <Link
            href="/watchlists"
            className="text-primary hover:underline font-semibold flex items-center gap-1"
          >
            <span>Open Watchlists</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>

      {/* ================= ORDERS, EXPANSION & APPROVALS CARD ================= */}
      <div className="rounded-2xl bg-card border border-border/80 shadow-stc-card p-4 sm:p-5 space-y-3 transition-all duration-150 ease-out hover:border-brand/40">
        <div className="flex items-center justify-between pb-2 border-b border-border/60">
          <div>
            <h4 className="text-xs font-bold text-foreground">Orders, expansion &amp; approvals</h4>
            <span className="text-[10px] text-muted-foreground block">Latest company news</span>
          </div>
          <Link
            href="/news"
            className="text-[11px] font-semibold text-primary hover:underline flex items-center gap-1"
          >
            <span>Show more news</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="divide-y divide-border/40 font-sans">
          {newsItems.map((item, idx) => (
            <div key={idx} className="py-2.5 first:pt-1 last:pb-1 flex items-start gap-3 text-xs">
              <span className="font-mono text-[11px] text-muted-foreground shrink-0 pt-0.5">
                {item.time}
              </span>
              <div className="flex-1 space-y-0.5">
                <div className="flex items-center gap-1.5">
                  <Link
                    href={`/stock/${item.symbol}`}
                    className="font-bold font-mono text-[11px] text-foreground hover:text-primary transition-colors"
                  >
                    {item.symbol}
                  </Link>
                  <span
                    className={`px-1.5 py-0.2 rounded text-[9px] font-semibold border ${
                      item.tag === "Order"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200/60 dark:bg-emerald-950/40 dark:text-emerald-300"
                        : "bg-blue-50 text-blue-700 border-blue-200/60 dark:bg-blue-950/40 dark:text-blue-300"
                    }`}
                  >
                    {item.tag}
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  {item.headline}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default WarmupOrdersTimeline;