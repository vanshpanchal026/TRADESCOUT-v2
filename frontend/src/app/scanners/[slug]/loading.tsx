import React from "react";

export default function ScannerLoading() {
  return (
    <div className="min-h-screen bg-background text-foreground animate-pulse">
      {/* Top Header Skeleton */}
      <header className="border-b border-border bg-card/50 backdrop-blur sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <div className="h-3 w-48 bg-muted rounded" />
            <div className="h-7 w-64 bg-muted rounded-lg" />
            <div className="h-3 w-96 bg-muted/60 rounded" />
          </div>
          <div className="h-6 w-28 bg-muted rounded-full" />
        </div>

        {/* Scanner Navigation Tabs Skeleton */}
        <div className="container mx-auto px-4 py-2 flex items-center gap-2 overflow-hidden">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-8 w-28 bg-muted rounded-lg shrink-0" />
          ))}
        </div>
      </header>

      {/* Main Grid Skeleton */}
      <main className="container mx-auto px-4 py-6 space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div className="h-9 w-72 bg-muted rounded-lg" />
          <div className="h-4 w-40 bg-muted/60 rounded" />
        </div>

        {/* Table Skeleton */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="h-10 border-b border-border bg-muted/30" />
          <div className="divide-y divide-border/40">
            {Array.from({ length: 12 }).map((_, idx) => (
              <div key={idx} className="h-12 flex items-center px-4 gap-6">
                <div className="h-4 w-20 bg-muted rounded" />
                <div className="h-4 w-36 bg-muted/60 rounded hidden sm:block" />
                <div className="h-4 w-20 bg-muted rounded ml-auto" />
                <div className="h-4 w-16 bg-muted rounded" />
                <div className="h-4 w-20 bg-muted/40 rounded hidden md:block" />
                <div className="h-4 w-16 bg-muted rounded" />
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
