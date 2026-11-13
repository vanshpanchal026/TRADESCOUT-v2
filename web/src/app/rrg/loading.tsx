import React from "react";

export default function RRGLoading() {
  return (
    <main className="min-h-screen p-4 sm:p-8 max-w-7xl mx-auto space-y-8 animate-pulse">
      {/* Top Header Skeleton */}
      <header className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-border">
        <div className="flex items-center gap-4">
          <div className="h-9 w-9 rounded-xl bg-muted border border-border" />
          <div className="space-y-1.5">
            <div className="h-7 w-56 bg-muted rounded-lg" />
            <div className="h-3 w-72 bg-muted/60 rounded" />
          </div>
        </div>
      </header>

      {/* RRG Controls Skeleton */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl border border-border bg-card">
        <div className="flex gap-2">
          <div className="h-8 w-28 bg-muted rounded-lg" />
          <div className="h-8 w-32 bg-muted rounded-lg" />
        </div>
        <div className="h-6 w-40 bg-muted rounded" />
      </div>

      {/* RRG 4-Quadrant Chart Canvas Skeleton */}
      <div className="h-[520px] rounded-2xl border border-border bg-card relative p-6 flex items-center justify-center">
        <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 gap-px bg-border/40 m-6 rounded-xl">
          <div className="bg-muted/10 p-4"><span className="h-4 w-20 bg-muted/40 rounded block" /></div>
          <div className="bg-muted/10 p-4"><span className="h-4 w-20 bg-muted/40 rounded block" /></div>
          <div className="bg-muted/10 p-4"><span className="h-4 w-20 bg-muted/40 rounded block" /></div>
          <div className="bg-muted/10 p-4"><span className="h-4 w-20 bg-muted/40 rounded block" /></div>
        </div>
      </div>
    </main>
  );
}
