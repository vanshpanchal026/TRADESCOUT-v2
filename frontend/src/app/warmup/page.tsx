import React from "react";
import Link from "next/link";
import { ArrowLeft, Clock } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { WarmupDashboard } from "@/components/warmup/WarmupDashboard";
import { WarmupData } from "@/components/warmup/types";

export const revalidate = 60;

async function getWarmupData(): Promise<WarmupData | null> {
  const backendBase =
    process.env.INTERNAL_API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:8000";

  try {
    const res = await fetch(`${backendBase}/api/market/warmup`, {
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      return null;
    }

    return await res.json();
  } catch {
    return null;
  }
}

export default async function WarmupPage() {
  const data = await getWarmupData();

  if (!data) {
    return (
      <main className="min-h-screen p-6 sm:p-12 max-w-7xl mx-auto flex flex-col items-center justify-center space-y-4">
        <h1 className="text-2xl font-bold text-foreground">The Warmup Dashboard Unavailable</h1>
        <p className="text-sm text-muted-foreground">
          Unable to establish connection to the market breadth calculation engine.
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

  const isMarketOpen = data.market_status === "OPEN";
  const isPreMarket = data.market_status === "PRE-MARKET";

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
              <h1 className="text-2xl font-bold tracking-tight text-foreground">The Warmup</h1>
              {/* Market Status Pill */}
              <div
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold border ${
                  isMarketOpen
                    ? "bg-bull/10 border-bull/30 text-bull"
                    : isPreMarket
                    ? "bg-[#F59E0B]/10 border-[#F59E0B]/30 text-[#F59E0B]"
                    : "bg-muted border-border text-muted-foreground"
                }`}
              >
                <span className="relative flex h-2 w-2">
                  <span
                    className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                      isMarketOpen ? "bg-bull" : isPreMarket ? "bg-[#F59E0B]" : "bg-muted-foreground"
                    }`}
                  />
                  <span
                    className={`relative inline-flex rounded-full h-2 w-2 ${
                      isMarketOpen ? "bg-bull" : isPreMarket ? "bg-[#F59E0B]" : "bg-muted-foreground"
                    }`}
                  />
                </span>
                <span>{data.market_status}</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground font-medium flex items-center gap-2 mt-0.5">
              <span>Morning market readiness, breadth diagnostics, and strategic temperature</span>
              <span>•</span>
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>Session: {data.date}</span>
              </span>
            </p>
          </div>
        </div>

        {/* Right Tools: Advance/Decline Pill & Nav Links */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-border bg-card text-xs font-mono font-semibold">
            <span className="text-bull">+{data.advance_decline.advances.toLocaleString()} Adv</span>
            <span className="text-muted-foreground">/</span>
            <span className="text-bear">-{data.advance_decline.declines.toLocaleString()} Dec</span>
          </div>

          <Link
            href="/rrg"
            className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-border bg-card hover:bg-muted/40 transition-colors"
          >
            RRG Rotation
          </Link>

          <Link
            href="/heatmap"
            className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-border bg-card hover:bg-muted/40 transition-colors"
          >
            Treemap
          </Link>

          <ThemeToggle />
        </div>
      </header>

      {/* Main Interactive Dashboard */}
      <WarmupDashboard initialData={data} />

      {/* Mandatory SEBI Regulatory Disclaimer */}
      <footer className="pt-6 border-t border-border/60 text-center text-xs text-muted-foreground space-y-1">
        <p>
          TRADESCOUT is an educational research platform, not a SEBI-registered advisory. Market investments are subject to risk.
        </p>
        <p className="text-[11px] font-mono text-muted-foreground/80">
          Last EOD Sync: {new Date(data.last_synced).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })} IST
        </p>
      </footer>
    </main>
  );
}
