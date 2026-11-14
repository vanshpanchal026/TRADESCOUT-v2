import React from "react";
import Link from "next/link";
import { ArrowLeft, Clock, Grid } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { HeatmapDashboard } from "@/components/heatmap/HeatmapDashboard";
import { HeatmapData } from "@/components/heatmap/types";

export const revalidate = 60;

async function getHeatmapData(): Promise<HeatmapData | null> {
  const backendBase =
    process.env.INTERNAL_API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:8000";

  try {
    const res = await fetch(`${backendBase}/api/market/heatmap?index=NIFTY+50`, {
      next: { revalidate: 60 },
      signal: AbortSignal.timeout(3000),
    });

    if (!res.ok) {
      return null;
    }

    return await res.json();
  } catch {
    return null;
  }
}

export default async function HeatmapPage() {
  const initialData = await getHeatmapData();

  if (!initialData) {
    return (
      <main className="min-h-screen p-6 sm:p-12 max-w-7xl mx-auto flex flex-col items-center justify-center space-y-4">
        <h1 className="text-2xl font-bold text-foreground">Market Heatmap Unavailable</h1>
        <p className="text-sm text-muted-foreground">
          Unable to establish connection to the treemap calculation engine.
        </p>
        <Link
          href="/"
          className="px-4 py-2 rounded-lg bg-accent text-white text-xs font-semibold hover:bg-accent/90"
        >
          Return to Platform Home
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-4 sm:p-8 max-w-7xl mx-auto space-y-8">
      {/* Top Header & Navigation */}
      <header className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-border">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="p-2 rounded-xl border border-border bg-card hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                <Grid className="h-6 w-6 text-accent" />
                <span>Market Treemap Heatmap</span>
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-accent/10 border border-accent/30 text-accent">
                Cap-Weighted
              </span>
            </div>
            <p className="text-xs text-muted-foreground font-medium flex items-center gap-2 mt-0.5">
              <span>Hierarchical sector grouping and relative performance sized by Market Capitalization</span>
              <span>•</span>
              <span className="inline-flex items-center gap-1 font-mono">
                <Clock className="h-3 w-3" />
                <span>{initialData.date}</span>
              </span>
            </p>
          </div>
        </div>

        {/* Right Navigation */}
        <div className="flex items-center gap-3">
          <Link
            href="/warmup"
            className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-border bg-card hover:bg-muted/40 transition-colors"
          >
            The Warmup
          </Link>

          <Link
            href="/rrg"
            className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-border bg-card hover:bg-muted/40 transition-colors"
          >
            RRG Rotation
          </Link>

          <ThemeToggle />
        </div>
      </header>

      {/* Main Heatmap Dashboard */}
      <HeatmapDashboard initialData={initialData} />

      {/* Mandatory SEBI Regulatory Disclaimer */}
      <footer className="pt-6 border-t border-border/60 text-center text-xs text-muted-foreground space-y-1">
        <p>
          TRADESCOUT is an educational research platform, not a SEBI-registered advisory. Market investments are subject to risk.
        </p>
        <p className="text-[11px] font-mono text-muted-foreground/80">
          Market Treemap generated using vectorized market capitalization weights and 1D percentage returns.
        </p>
      </footer>
    </main>
  );
}
