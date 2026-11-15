"use client";

import Link from "next/link";
import { Lock, Sparkles, ShieldCheck, Zap } from "lucide-react";

interface PaywallBlurBannerProps {
  totalMatches: number;
}

export function PaywallBlurBanner({ totalMatches }: PaywallBlurBannerProps) {
  return (
    <div className="relative w-full my-6 overflow-hidden rounded-2xl border border-primary/30 bg-[#141420]/80 backdrop-blur-md p-6 sm:p-8 text-center shadow-[0_0_35px_-5px_rgba(99,102,241,0.18)]">
      {/* Background ambient radial glow */}
      <div
        className="pointer-events-none absolute -top-24 left-1/2 h-48 w-96 -translate-x-1/2 rounded-full bg-primary/15 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative mx-auto flex max-w-xl flex-col items-center">
        {/* Premium Upgrade Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 border border-primary/30 text-primary shadow-[0_0_12px_rgba(99,102,241,0.2)] mb-4">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Institutional Tier Upgrade</span>
        </div>

        <div className="mb-4 flex h-13 w-13 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/20 shadow-inner">
          <Lock className="h-6 w-6" />
        </div>

        <h3 className="text-lg font-bold tracking-tight text-foreground sm:text-xl">
          Showing top 10 results. Upgrade to TRADESCOUT Pro to unlock all{" "}
          <span className="tabular-nums font-extrabold text-primary">
            {totalMatches > 0 ? totalMatches.toLocaleString() : "2,500+"}
          </span>{" "}
          candidates.
        </h3>

        <p className="mt-2 text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-lg">
          You are viewing the free tier preview. There are{" "}
          <span className="font-semibold text-primary tabular-nums">
            {totalMatches > 10 ? totalMatches.toLocaleString() : "hundreds of"}
          </span>{" "}
          qualified breakout setups currently passing this scanner criteria.
        </p>

        {/* Feature Highlights Grid */}
        <div className="my-5 flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5 rounded-lg bg-card/60 px-2.5 py-1 border border-border/50">
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            <span>Full NSE ~2,500 Universe</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-lg bg-card/60 px-2.5 py-1 border border-border/50">
            <Sparkles className="h-4 w-4 text-amber-500" />
            <span>Minervini 8-Rule Stage Analysis</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-lg bg-card/60 px-2.5 py-1 border border-border/50">
            <Zap className="h-4 w-4 text-primary" />
            <span>Real-time RS Ratings & RVOL</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-lg bg-card/60 px-2.5 py-1 border border-border/50">
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            <span>Export to TradingView / CSV</span>
          </div>
        </div>

        {/* Action CTAs */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <Link
            href="/account?sec=billing"
            className="w-full sm:w-auto inline-flex h-10 sm:h-11 items-center justify-center gap-2 rounded-xl bg-primary px-6 text-xs sm:text-sm font-semibold text-primary-foreground shadow-md shadow-primary/25 transition-all duration-150 ease-out hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Sparkles className="h-4 w-4" />
            <span>Unlock Full Scanner (Pro)</span>
          </Link>
          <Link
            href="/login"
            className="w-full sm:w-auto inline-flex h-10 sm:h-11 items-center justify-center rounded-xl border border-border bg-card/60 px-5 text-xs sm:text-sm font-medium text-foreground transition-all duration-150 ease-out hover:bg-white/[0.05] hover:border-zinc-700"
          >
            Sign In with Pro
          </Link>
        </div>

        {/* Educational Note */}
        <p className="mt-5 text-[11px] text-muted-foreground/70">
          TRADESCOUT is an educational research platform, not a SEBI-registered advisory. Market investments are subject to risk.
        </p>
      </div>
    </div>
  );
}

export function BlurredPlaceholderRows() {
  const dummyRows = [
    { symbol: "KAYNES", name: "Kaynes Technology India", cmp: "5,420.00", chg: "+4.80%", rvol: "2.40x", rs: "98", st: "2", sma50: "4,980.00", sma200: "4,120.00", high52: "-2.1%" },
    { symbol: "DIXON", name: "Dixon Technologies Ltd", cmp: "14,890.50", chg: "+3.25%", rvol: "1.92x", rs: "96", st: "2", sma50: "13,650.00", sma200: "11,200.00", high52: "-1.4%" },
    { symbol: "TRENT", name: "Trent Limited", cmp: "7,245.30", chg: "+2.10%", rvol: "1.74x", rs: "97", st: "2", sma50: "6,820.00", sma200: "5,450.00", high52: "-0.8%" },
    { symbol: "POLYCAB", name: "Polycab India Limited", cmp: "6,890.00", chg: "+1.95%", rvol: "1.55x", rs: "94", st: "2", sma50: "6,410.00", sma200: "5,620.00", high52: "-3.2%" },
    { symbol: "BEL", name: "Bharat Electronics Ltd", cmp: "312.40", chg: "+3.60%", rvol: "2.15x", rs: "95", st: "2", sma50: "295.00", sma200: "260.00", high52: "-1.8%" },
    { symbol: "MOTHERSON", name: "Samvardhana Motherson", cmp: "186.75", chg: "+2.45%", rvol: "1.68x", rs: "91", st: "2", sma50: "174.00", sma200: "155.00", high52: "-4.1%" },
  ];

  return (
    <>
      {dummyRows.map((row, idx) => (
        <tr
          key={idx}
          className="border-b border-border/40 select-none pointer-events-none opacity-30 blur-[2.5px] transition-none"
          aria-hidden="true"
        >
          <td className="sticky left-0 bg-[#141420]/90 px-3 py-1.5 text-xs font-semibold">{row.symbol}</td>
          <td className="px-3 py-1.5 text-xs text-muted-foreground">{row.name}</td>
          <td className="sticky left-[110px] bg-[#141420]/90 px-3 py-1.5 text-xs text-right font-mono tabular-nums">₹{row.cmp}</td>
          <td className="px-3 py-1.5 text-xs text-right font-mono font-semibold text-emerald-500 tabular-nums">{row.chg}</td>
          <td className="px-3 py-1.5 text-center">
            <div className="h-3.5 w-14 mx-auto rounded bg-muted/40" />
          </td>
          <td className="px-3 py-1.5 text-xs text-right font-mono tabular-nums">{row.rvol}</td>
          <td className="px-3 py-1.5 text-right font-mono tabular-nums">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              {row.rs}
            </span>
          </td>
          <td className="px-3 py-1.5 text-center">
            <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[11px] font-semibold text-emerald-400 border border-emerald-500/30">
              Stage {row.st}
            </span>
          </td>
          <td className="px-3 py-1.5 text-xs text-right font-mono text-muted-foreground tabular-nums">₹{row.sma50}</td>
          <td className="px-3 py-1.5 text-xs text-right font-mono text-muted-foreground tabular-nums">₹{row.sma200}</td>
          <td className="px-3 py-1.5 text-xs text-right font-mono text-muted-foreground tabular-nums">{row.high52}</td>
        </tr>
      ))}
    </>
  );
}
