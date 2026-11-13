import React from "react";

export default function WarmupLoading() {
  return (
    <main className="min-h-screen p-4 sm:p-8 max-w-7xl mx-auto space-y-8 animate-pulse">
      {/* Top Header Skeleton */}
      <header className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-border">
        <div className="flex items-center gap-4">
          <div className="h-9 w-9 rounded-xl bg-muted border border-border" />
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <div className="h-7 w-40 bg-muted rounded-lg" />
              <div className="h-5 w-20 bg-muted rounded-full" />
            </div>
            <div className="h-3 w-56 bg-muted/60 rounded" />
          </div>
        </div>
        <div className="h-9 w-32 bg-muted rounded-lg" />
      </header>

      {/* Summary Cards Skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-24 rounded-2xl border border-border bg-card p-4 space-y-2">
            <div className="h-3 w-16 bg-muted rounded" />
            <div className="h-6 w-24 bg-muted rounded" />
          </div>
        ))}
      </div>

      {/* Main Cockpit Split Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 h-80 rounded-2xl border border-border bg-card p-6" />
        <div className="lg:col-span-4 h-80 rounded-2xl border border-border bg-card p-6" />
      </div>

      {/* Earnings & Cues Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="h-64 rounded-2xl border border-border bg-card" />
        <div className="h-64 rounded-2xl border border-border bg-card" />
      </div>
    </main>
  );
}
