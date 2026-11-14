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
    <main className="min-h-screen p-3 sm:p-5 lg:p-6 max-w-[1600px] mx-auto space-y-4">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-border/60">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <span>The Warmup</span>
            <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-bull/10 text-bull border border-bull/20">
              {data.market_status}
            </span>
          </h1>
          <span className="text-xs text-muted-foreground font-mono">Session: {data.date}</span>
        </div>
      </div>

      {/* Main Interactive Dashboard matching Screenshot 11 */}
      <WarmupDashboard initialData={data} />
    </main>
  );
}
