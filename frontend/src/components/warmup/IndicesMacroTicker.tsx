"use client";

import React, { useState } from "react";
import { TrendingUp, TrendingDown, Layers, Activity } from "lucide-react";

export function IndicesMacroTicker() {
  const [activeOverlay, setActiveOverlay] = useState<"none" | "50e" | "200s">("50e");

  const indices = [
    { name: "NIFTY 50", value: "24,150.20", change: "+0.45%", isUp: true, ma50: "Above", ma200: "Above" },
    { name: "NIFTY 500", value: "22,640.85", change: "+0.62%", isUp: true, ma50: "Above", ma200: "Above" },
    { name: "MIDCAP 150", value: "19,820.40", change: "+0.88%", isUp: true, ma50: "Above", ma200: "Above" },
    { name: "SMALLCAP 250", value: "16,410.15", change: "+1.15%", isUp: true, ma50: "Above", ma200: "Above" },
    { name: "MICROCAP 250", value: "23,120.90", change: "+1.42%", isUp: true, ma50: "Above", ma200: "Above" },
    { name: "USD/INR", value: "84.38", change: "-0.08%", isUp: false, ma50: "Below", ma200: "Above" },
    { name: "BRENT CRUDE", value: "$73.80", change: "-0.45%", isUp: false, ma50: "Below", ma200: "Below" },
  ];

  return (
    <div className="p-4 rounded-2xl bg-card border border-border shadow-xs space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-primary" />
          <span className="text-xs font-bold text-foreground tracking-wide uppercase">
            Indices &amp; Macro Ticker Strip
          </span>
          <span className="text-[10px] text-muted-foreground">• Real-time NSE Breadth Tape</span>
        </div>

        {/* Quick-toggle overlays for 50E and 200S */}
        <div className="flex items-center gap-1.5 bg-muted/60 p-1 rounded-xl border border-border">
          <span className="text-[10px] font-semibold text-muted-foreground px-1.5">MA Overlays:</span>
          <button
            type="button"
            onClick={() => setActiveOverlay("none")}
            className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold transition-all ${
              activeOverlay === "none"
                ? "bg-background text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Raw
          </button>
          <button
            type="button"
            onClick={() => setActiveOverlay("50e")}
            className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold transition-all ${
              activeOverlay === "50e"
                ? "bg-primary text-white shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            50E (50 EMA)
          </button>
          <button
            type="button"
            onClick={() => setActiveOverlay("200s")}
            className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold transition-all ${
              activeOverlay === "200s"
                ? "bg-bull text-white shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            200S (200 SMA)
          </button>
        </div>
      </div>

      {/* Scrolling ticker grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
        {indices.map((idx) => {
          const maStatus = activeOverlay === "50e" ? idx.ma50 : idx.ma200;
          return (
            <div
              key={idx.name}
              className="p-2.5 rounded-xl bg-background border border-border/80 flex flex-col justify-between hover:border-primary/40 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-foreground truncate">{idx.name}</span>
                {activeOverlay !== "none" && (
                  <span
                    className={`text-[9px] font-mono px-1 py-0.2 rounded font-semibold ${
                      maStatus === "Above"
                        ? "bg-bull/10 text-bull border border-bull/20"
                        : "bg-bear/10 text-bear border border-bear/20"
                    }`}
                  >
                    &gt; {activeOverlay.toUpperCase()}
                  </span>
                )}
              </div>
              <div className="mt-1 flex items-baseline justify-between">
                <span className="text-xs font-semibold font-mono text-foreground">{idx.value}</span>
                <span
                  className={`text-[11px] font-semibold font-mono flex items-center gap-0.5 ${
                    idx.isUp ? "text-bull" : "text-bear"
                  }`}
                >
                  {idx.isUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  {idx.change}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default IndicesMacroTicker;
