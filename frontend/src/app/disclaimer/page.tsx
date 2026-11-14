"use client";

import React from "react";
import Link from "next/link";
import { ShieldCheck, AlertTriangle, ArrowLeft, CheckCircle2 } from "lucide-react";

export default function DisclaimerPage() {
  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-8">
      {/* Back button */}
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Terminal</span>
        </Link>
      </div>

      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-500 border border-amber-500/20">
          <AlertTriangle className="h-3.5 w-3.5" />
          <span>Regulatory Disclosure</span>
        </div>
        <h1 className="text-3xl font-black tracking-tight text-foreground">
          SEBI &amp; Legal Disclaimers
        </h1>
        <p className="text-sm text-muted-foreground">
          Mandatory regulatory notices, educational use disclosures &amp; market risk guidelines
        </p>
      </div>

      {/* Prominent Callout Banner */}
      <div className="p-6 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-3">
        <div className="flex items-center gap-2.5 text-amber-600 dark:text-amber-400 font-bold text-sm">
          <ShieldCheck className="h-5 w-5" />
          <span>NON-REGISTRATION WITH SEBI NOTICE</span>
        </div>
        <p className="text-xs leading-relaxed text-foreground font-medium">
          TRADESCOUT (operating at scanthecharts.com) is purely an analytical data aggregation, charting, and technical research platform. <strong>Not registered with SEBI as an Investment Adviser (RIA) or Research Analyst (RA).</strong>
        </p>
        <p className="text-xs text-muted-foreground leading-relaxed">
          None of the information, screening templates, candlestick charts, stage classifications, Relative Rotation Graphs (RRG), or financial statement breakdowns provided on this website constitute financial advice, investment recommendations, or an endorsement to buy or sell any security on the National Stock Exchange of India (NSE).
        </p>
      </div>

      {/* Structured Sections */}
      <div className="space-y-6 text-xs text-foreground/85 leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-foreground">1. Purely for Educational and Analytical Purposes</h2>
          <p className="text-muted-foreground">
            All proprietary scanners (including Mark Minervini Trend Template, 4%+ Volume Climax Breakouts, High Relative Volume filters, and Stan Weinstein 4-Stage distributions) are algorithmic expressions designed to assist self-directed traders in scanning publicly available end-of-day market data.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-foreground">2. Substantial Risk of Capital Loss</h2>
          <p className="text-muted-foreground">
            Trading in equities, futures, options, and derivative contracts involves substantial risk of loss and is not suitable for every investor. An investor could potentially lose all or more than the initial investment. Past performance, backtested results, or historical relative strength rankings do not guarantee future returns.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-foreground">3. No Portfolio Management or Execution Services</h2>
          <p className="text-muted-foreground">
            Scan The Charts / TRADESCOUT does not execute trades, manage funds, accept deposits, or route orders to brokers. Users maintain 100% discretion and independent responsibility for all trading decisions made in their personal demat accounts.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-foreground">4. Entity Details &amp; Operational Jurisdiction</h2>
          <p className="text-muted-foreground">
            Developed and operated from Hoshiarpur, Punjab, India. Direct regulatory inquiries and feedback loops should be addressed to <strong className="text-foreground">support@scanthecharts.com</strong>.
          </p>
        </section>
      </div>
    </div>
  );
}
