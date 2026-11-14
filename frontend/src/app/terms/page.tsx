"use client";

import React from "react";
import Link from "next/link";
import { FileText, ArrowLeft } from "lucide-react";

export default function TermsPage() {
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
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
          <FileText className="h-3.5 w-3.5" />
          <span>Usage Guidelines</span>
        </div>
        <h1 className="text-3xl font-black tracking-tight text-foreground">
          Terms of Service
        </h1>
        <p className="text-sm text-muted-foreground">
          Platform terms of service, acceptable use, and data redistribution guidelines
        </p>
      </div>

      <div className="space-y-6 text-xs text-foreground/85 leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-foreground">1. Acceptance of Terms</h2>
          <p className="text-muted-foreground">
            By accessing or using Scan The Charts (TRADESCOUT) at scanthecharts.com or its related APIs, you agree to be bound by these Terms of Service. If you do not agree to all terms, please do not use the service.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-foreground">2. Beta Access &amp; Availability</h2>
          <p className="text-muted-foreground">
            The platform is currently operating in a fully unlocked Beta — Free tier. Access is provided on an &quot;as-is&quot; and &quot;as-available&quot; basis without warranties of uninterrupted uptime or error-free calculations during market volatility.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-foreground">3. Restrictions on Automated Scraping &amp; Data Redistribution</h2>
          <p className="text-muted-foreground">
            Users may not deploy automated scrapers, bots, or unauthorized extraction scripts to systematically duplicate the platform&apos;s vectorized calculation engines, Relative Rotation Graph coordinates, or proprietary screening outputs for commercial resale or public redistribution.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-foreground">4. Intellectual Property</h2>
          <p className="text-muted-foreground">
            All code, UI layouts, visual designs, algorithmic formulas, and branding assets are the intellectual property of Scan The Charts / TRADESCOUT, developed and operated from Hoshiarpur, Punjab, India.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-foreground">5. Governing Law</h2>
          <p className="text-muted-foreground">
            These terms are governed by the laws of India, under the jurisdiction of the courts of Punjab.
          </p>
        </section>
      </div>
    </div>
  );
}
