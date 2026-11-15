import Link from "next/link";
import { notFound } from "next/navigation";
import { Activity, Flame, TrendingUp, Volume2, Zap, Sparkles, ChevronDown } from "lucide-react";

import { ScannerApiResponse } from "@/lib/types";
import { ScannerGrid } from "@/components/scanner/scanner-grid";

export const revalidate = 60;

const SCANNER_TABS = [
  {
    slug: "trend-template",
    name: "Trend Template",
    icon: TrendingUp,
    badge: "326 stocks",
    description: "Strict Mark Minervini trend template alignment rules.",
  },
  {
    slug: "stage-2-breakout",
    name: "Stage 2 Breakout",
    icon: Flame,
    badge: "66 stocks",
    description: "Emerging from Stage 1 consolidation bases into Stage 2 uptrends.",
  },
  {
    slug: "recent-breakout",
    name: "Recent Breakout",
    icon: Flame,
    badge: "12 stocks",
    description: "Cleared key resistance within the past 3 trading sessions.",
  },
  {
    slug: "4pct-breakout",
    name: "4% Breakout",
    icon: Zap,
    badge: "38 stocks",
    description: "Daily gain exceeding +4% backed by above-average volume.",
  },
  {
    slug: "20-sma-pullback",
    name: "20-SMA Pullback",
    icon: Activity,
    badge: "0 stocks",
    description: "Orderly pullbacks to the rising 20-day Simple Moving Average.",
  },
  {
    slug: "high-volume",
    name: "High Volume",
    icon: Volume2,
    badge: "28 stocks",
    description: "Extraordinary daily volume relative to the 20-day average.",
  },
  {
    slug: "1m-gainers",
    name: "1M Gainers",
    icon: Activity,
    badge: "36 stocks",
    description: "Top outperforming equities over a rolling 30-day window.",
  },
  {
    slug: "3m-gainers",
    name: "3M Gainers",
    icon: TrendingUp,
    badge: "70 stocks",
    description: "Leading gainers over a rolling 90-day performance window.",
  },
  {
    slug: "outperformers",
    name: "Outperformers",
    icon: Zap,
    badge: "29 stocks",
    description: "Demonstrating persistent relative strength versus the Nifty 500 baseline.",
  },
  {
    slug: "doublers",
    name: "Doublers",
    icon: Flame,
    badge: "56 stocks",
    description: "Equities that have appreciated by 100%+ over trailing 52 weeks.",
  },
  {
    slug: "new-listing-ipo",
    name: "New Listing IPO",
    icon: Sparkles,
    badge: "135 stocks",
    description: "Public listings with short historical data footprints (<2 years).",
  },
];

export function generateStaticParams() {
  return SCANNER_TABS.map((tab) => ({
    slug: tab.slug,
  }));
}

async function getScannerData(slug: string): Promise<ScannerApiResponse | null> {
  const backendBase =
    process.env.INTERNAL_API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:8000";

  try {
    let res = await fetch(`${backendBase}/api/scanners/${slug}`, {
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      // Fallback to trend-template data if this slug is a client preset
      res = await fetch(`${backendBase}/api/scanners/trend-template`, {
        next: { revalidate: 60 },
      });
    }

    if (!res.ok) {
      return null;
    }

    return await res.json();
  } catch (error) {
    console.error(`Error loading scanner '${slug}':`, error);
    return null;
  }
}

interface PageProps {
  params: {
    slug: string;
  };
}

export default async function ScannerPage({ params }: PageProps) {
  const { slug } = params;
  const currentTab = SCANNER_TABS.find((t) => t.slug === slug);

  if (!currentTab) {
    notFound();
  }

  const result = await getScannerData(slug);

  // Fallback defaults if backend is launching or offline
  const fallbackMetadata = {
    slug,
    title: currentTab.name,
    description: `High-conviction ${currentTab.name} setups for Indian equities.`,
    last_updated: new Date().toISOString().split("T")[0],
    total_matches: 0,
    returned: 0,
    offset: 0,
    limit: 50,
    sort_by: "rs_rating",
    direction: "desc" as const,
    is_truncated: true,
  };

  const metadata = result?.metadata || fallbackMetadata;
  const stocks = result?.data || [];

  return (
    <div className="min-h-screen bg-background text-foreground w-full">
      {/* Top Navigation Bar / Breadcrumb */}
      <header className="border-b border-border bg-card/50 backdrop-blur sticky top-0 z-40 w-full">
        <div className="w-full px-3 sm:px-6 py-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground mb-1">
              <Link href="/" className="hover:text-foreground transition-colors">
                TRADESCOUT
              </Link>
              <span>/</span>
              <span className="text-foreground">Scanners</span>
              <span>/</span>
              <span className="text-primary font-semibold">{currentTab.name}</span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-foreground sm:text-3xl">
              {metadata.title}
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5 max-w-2xl">
              {metadata.description}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-500 ring-1 ring-emerald-500/20">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live EOD Engine
            </span>
          </div>
        </div>

        {/* Scanner Navigation Tabs */}
        <div className="w-full px-3 sm:px-6">
          <div className="flex items-center gap-2 overflow-x-auto py-2 scrollbar-none">
            {SCANNER_TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = tab.slug === slug;

              return (
                <Link
                  key={tab.slug}
                  href={`/scanners/${tab.slug}`}
                  className={`flex items-center gap-2 whitespace-nowrap rounded-lg px-3.5 py-2 text-xs font-medium transition-all ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{tab.name}</span>
                  <span
                    className={`rounded-full px-1.5 py-0.2 text-[10px] ${
                      isActive
                        ? "bg-primary-foreground/20 text-primary-foreground"
                        : "bg-background text-muted-foreground"
                    }`}
                  >
                    {tab.badge}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="w-full px-3 sm:px-6 py-4">
        <ScannerGrid initialStocks={stocks} metadata={metadata} />
      </main>

      {/* Regulatory SEBI Educational Notice */}
      <footer className="border-t border-border/40 py-4 text-center text-xs text-muted-foreground w-full px-3 sm:px-6">
        <p>
          TRADESCOUT is an educational research platform, not a SEBI-registered advisory. Market
          investments are subject to risk.
        </p>
      </footer>
    </div>
  );
}
