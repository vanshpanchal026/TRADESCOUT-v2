"use client";

import React from "react";
import Link from "next/link";
import { Lock, ArrowLeft, ShieldCheck } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-8">
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
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-bull/10 text-bull border border-bull/20">
          <ShieldCheck className="h-3.5 w-3.5" />
          <span>DPDP Act 2023 Compliant</span>
        </div>
        <h1 className="text-3xl font-black tracking-tight text-foreground">
          Privacy Policy
        </h1>
        <p className="text-sm text-muted-foreground">
          Data protection disclosures under India&apos;s Digital Personal Data Protection Act 2023 &amp; IT Act 2000
        </p>
      </div>

      <div className="space-y-6 text-xs text-foreground/85 leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-foreground">1. Commitment to Trader Privacy</h2>
          <p className="text-muted-foreground">
            Scan The Charts / TRADESCOUT prioritizes data minimization. We do not sell trader telemetry, watchlist symbols, or search histories to third-party brokerages or algorithmic market makers.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-foreground">2. Compliance with Digital Personal Data Protection (DPDP) Act 2023</h2>
          <p className="text-muted-foreground">
            In compliance with the Digital Personal Data Protection Act 2023 of India, we collect only necessary identifying information (e.g. email address, voluntary display name) solely for authentication, workspace persistence, and customer support.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-foreground">3. Local Storage &amp; Cookies</h2>
          <p className="text-muted-foreground">
            We utilize persistent local browser storage solely to remember user display preferences (light/dark theme toggles, active watchlist tab selections, and dismissed onboarding modals).
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-foreground">4. Data Deletion &amp; Right to Erasure</h2>
          <p className="text-muted-foreground">
            Users retain the full right to delete their personal accounts, clear stored watchlists, and reset cached state at any time via the Account Settings page or by contacting <strong className="text-foreground">support@scanthecharts.com</strong>.
          </p>
        </section>
      </div>
    </div>
  );
}
