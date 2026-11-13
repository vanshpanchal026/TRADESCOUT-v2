import { ThemeToggle } from "@/components/theme-toggle";
import { Activity, BarChart2, CheckCircle2, Cpu, Database, Server, ShieldCheck, Zap } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col justify-between p-6 sm:p-12 max-w-6xl mx-auto">
      {/* Top Header */}
      <header className="flex items-center justify-between pb-8 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-accent flex items-center justify-center font-bold text-white shadow-lg shadow-accent/20">
            TS
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">TRADESCOUT</h1>
            <p className="text-xs text-muted-foreground font-medium">NSE Technical Screener & Breadth Engine</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* Status Pill with Pulsing Green Dot */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border border-bull/30 bg-bull/10 text-bull">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-bull opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-bull"></span>
            </span>
            <span className="font-semibold">Platform & Infrastructure Active</span>
          </div>
          <ThemeToggle />
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-14 sm:py-20 text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-card border border-border text-muted-foreground">
          <Zap className="h-3.5 w-3.5 text-accent" /> Zero-Scraper Technical Architecture
        </div>
        <h2 className="text-4xl sm:text-6xl font-extrabold tracking-tight">
          Precision market breadth & <br className="hidden sm:inline" />
          <span className="text-accent">high-speed scanners</span> for NSE.
        </h2>
        <p className="max-w-2xl mx-auto text-base sm:text-lg text-muted-foreground">
          Engineered for Indian equity swing traders. Vectorized Polars indicators, pre-computed daily Redis cache,
          and canvas-accelerated TradingView charts with zero latency.
        </p>
      </section>

      {/* Bento Grid - System Status, Engine Architecture, Probes */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-5 py-6">
        {/* Bento Card 1: System Status & Probes */}
        <div className="p-6 rounded-2xl border border-border bg-card space-y-4 hover:border-accent/40 transition-colors">
          <div className="flex items-center justify-between">
            <Server className="h-6 w-6 text-accent" />
            <span className="text-xs font-mono text-bull bg-bull/10 px-2 py-0.5 rounded border border-bull/20">HTTP 200</span>
          </div>
          <div className="space-y-1">
            <h3 className="font-semibold text-lg">System Status & Probes</h3>
            <p className="text-sm text-muted-foreground">
              FastAPI backend skeleton with dual liveness & readiness probes.
            </p>
          </div>
          <ul className="text-xs space-y-2 font-mono text-muted-foreground border-t border-border/60 pt-3">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-bull" />
              <span>GET /healthz (Liveness Probe)</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-bull" />
              <span>GET /readyz (Redis 7 Ping)</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-bull" />
              <span>UUID x-request-id middleware</span>
            </li>
          </ul>
        </div>

        {/* Bento Card 2: Engine Architecture */}
        <div className="p-6 rounded-2xl border border-border bg-card space-y-4 hover:border-accent/40 transition-colors">
          <div className="flex items-center justify-between">
            <Cpu className="h-6 w-6 text-indigo-400" />
            <span className="text-xs font-mono text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">Vectorized</span>
          </div>
          <div className="space-y-1">
            <h3 className="font-semibold text-lg">Engine Architecture</h3>
            <p className="text-sm text-muted-foreground">
              Sub-10ms queries powered by pure Polars without Pandas or NumPy.
            </p>
          </div>
          <ul className="text-xs space-y-2 font-mono text-muted-foreground border-t border-border/60 pt-3">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-bull" />
              <span>Polars LazyFrames & SIMD execution</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-bull" />
              <span>PostgreSQL 16 + Timescale partition</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-bull" />
              <span>Redis 7 in-memory EOD cache</span>
            </li>
          </ul>
        </div>

        {/* Bento Card 3: Scanners & Breadth */}
        <div className="p-6 rounded-2xl border border-border bg-card space-y-4 hover:border-accent/40 transition-colors">
          <div className="flex items-center justify-between">
            <Activity className="h-6 w-6 text-bull" />
            <span className="text-xs font-mono text-bull bg-bull/10 px-2 py-0.5 rounded border border-bull/20">7 Scanners</span>
          </div>
          <div className="space-y-1">
            <h3 className="font-semibold text-lg">The Warmup & Scanners</h3>
            <p className="text-sm text-muted-foreground">
              Market regime gauges, Stage 2 participation ratios, and Minervini templates.
            </p>
          </div>
          <ul className="text-xs space-y-2 font-mono text-muted-foreground border-t border-border/60 pt-3">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-bull" />
              <span>Stage 2 Minervini Trend Template</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-bull" />
              <span>4% Expansion & Volume Surges</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-bull" />
              <span>IBD-Style RS Momentum Ratings</span>
            </li>
          </ul>
        </div>
      </section>

      {/* Footer & Mandatory SEBI Regulatory Disclaimer */}
      <footer className="pt-12 pb-6 border-t border-border text-center space-y-3">
        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <ShieldCheck className="h-4 w-4" />
          <span>Next.js 14 App Router • TypeScript • Tailwind CSS • Hanken Grotesk • Dark Mode</span>
        </div>
        <p className="text-xs text-muted-foreground/80 max-w-2xl mx-auto">
          TRADESCOUT is an educational research platform, not a SEBI-registered advisory. Market investments are subject to risk.
        </p>
      </footer>
    </main>
  );
}
