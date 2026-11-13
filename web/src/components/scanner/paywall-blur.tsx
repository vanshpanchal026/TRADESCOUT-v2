"use client";

import Link from "next/link";
import { Lock, Sparkles, ShieldCheck } from "lucide-react";

interface PaywallBlurBannerProps {
  totalMatches: number;
}

export function PaywallBlurBanner({ totalMatches }: PaywallBlurBannerProps) {
  return (
    <div className="relative w-full my-6 overflow-hidden rounded-xl border border-primary/30 bg-gradient-to-b from-background/90 via-background/95 to-background p-8 text-center shadow-2xl backdrop-blur-md">
      <div className="mx-auto flex max-w-xl flex-col items-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/20">
          <Lock className="h-7 w-7" />
        </div>

        <h3 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
          Showing top 10 results. Upgrade to TRADESCOUT Pro to unlock all 2,500+ candidates.
        </h3>

        <p className="mt-2 text-sm text-muted-foreground">
          You are viewing the free tier preview. There are{" "}
          <span className="font-semibold text-primary">
            {totalMatches > 10 ? totalMatches.toLocaleString() : "hundreds of"}
          </span>{" "}
          qualified breakout setups currently passing this scanner criteria.
        </p>

        <div className="my-5 flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            <span>Full NSE ~2,500 Universe</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Sparkles className="h-4 w-4 text-amber-500" />
            <span>Minervini 8-Rule Stage Analysis</span>
          </div>
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            <span>Export to TradingView / CSV</span>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Link
            href="/signup?plan=pro"
            className="inline-flex h-11 items-center justify-center rounded-lg bg-primary px-6 text-sm font-semibold text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Unlock Full Scanner (Pro)
          </Link>
          <Link
            href="/login"
            className="inline-flex h-11 items-center justify-center rounded-lg border border-border bg-background/50 px-5 text-sm font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            Sign In with Pro
          </Link>
        </div>
      </div>
    </div>
  );
}

export function BlurredPlaceholderRows() {
  const dummyRows = [
    { symbol: "KAYNES", name: "Kaynes Technology India", cmp: "5,420.00", chg: "+4.8%", rvol: "2.4x", rs: "98", st: "2" },
    { symbol: "DIXON", name: "Dixon Technologies Ltd", cmp: "14,890.50", chg: "+3.2%", rvol: "1.9x", rs: "96", st: "2" },
    { symbol: "TRENT", name: "Trent Limited", cmp: "7,245.30", chg: "+2.1%", rvol: "1.7x", rs: "97", st: "2" },
    { symbol: "POLYCAB", name: "Polycab India Limited", cmp: "6,890.00", chg: "+1.9%", rvol: "1.5x", rs: "94", st: "2" },
    { symbol: "BEL", name: "Bharat Electronics Ltd", cmp: "312.40", chg: "+3.6%", rvol: "2.1x", rs: "95", st: "2" },
  ];

  return (
    <>
      {dummyRows.map((row, idx) => (
        <tr
          key={idx}
          className="border-b border-border/40 select-none pointer-events-none opacity-40 transition-none"
          style={{ filter: "blur(5px)" }}
          aria-hidden="true"
        >
          <td className="sticky left-0 bg-background/90 px-4 py-3 font-semibold">{row.symbol}</td>
          <td className="px-4 py-3 text-muted-foreground">{row.name}</td>
          <td className="sticky left-[120px] bg-background/90 px-4 py-3 text-right font-mono">₹{row.cmp}</td>
          <td className="px-4 py-3 text-right font-medium text-emerald-500">{row.chg}</td>
          <td className="px-4 py-3 text-center">
            <div className="h-5 w-16 mx-auto rounded bg-muted/50" />
          </td>
          <td className="px-4 py-3 text-right font-mono">{row.rvol}</td>
          <td className="px-4 py-3 text-right font-mono">{row.rs}</td>
          <td className="px-4 py-3 text-center">
            <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-500">
              Stage {row.st}
            </span>
          </td>
          <td className="px-4 py-3 text-right font-mono">₹{row.cmp}</td>
          <td className="px-4 py-3 text-right font-mono">₹{row.cmp}</td>
          <td className="px-4 py-3 text-right font-mono">-2.4%</td>
        </tr>
      ))}
    </>
  );
}
