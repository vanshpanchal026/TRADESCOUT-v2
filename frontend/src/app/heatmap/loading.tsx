import React from "react";

export default function HeatmapLoading() {
  return (
    <main className="min-h-screen p-4 sm:p-8 max-w-7xl mx-auto space-y-8 animate-pulse">
      {/* Top Header Skeleton */}
      <header className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-border">
        <div className="flex items-center gap-4">
          <div className="h-9 w-9 rounded-xl bg-muted border border-border" />
          <div className="space-y-1.5">
            <div className="h-7 w-48 bg-muted rounded-lg" />
            <div className="h-3 w-64 bg-muted/60 rounded" />
          </div>
        </div>
      </header>

      {/* Index Controls Skeleton */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl border border-border bg-card">
        <div className="flex gap-2">
          {["NIFTY 50", "NEXT 50", "MIDCAP 100", "NIFTY 500"].map((n) => (
            <div key={n} className="h-8 w-24 bg-muted rounded-lg" />
          ))}
        </div>
        <div className="h-6 w-48 bg-muted rounded" />
      </div>

      {/* Treemap Grid Skeleton */}
      <div className="h-[600px] rounded-2xl border border-border bg-card p-4 grid grid-cols-12 gap-3">
        <div className="col-span-5 row-span-2 bg-muted/40 rounded-xl" />
        <div className="col-span-4 bg-muted/30 rounded-xl" />
        <div className="col-span-3 bg-muted/30 rounded-xl" />
        <div className="col-span-4 bg-muted/20 rounded-xl" />
        <div className="col-span-3 bg-muted/20 rounded-xl" />
      </div>
    </main>
  );
}
