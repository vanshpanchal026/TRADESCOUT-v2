import React from "react";
import Link from "next/link";
import { ShieldCheck, HelpCircle, FileText, Mail, Lock } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full border-t border-border bg-card/60 backdrop-blur-md py-8 px-4 sm:px-8 mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col items-center justify-center text-center space-y-4">
        {/* Brand & Version Badge */}
        <div className="flex items-center justify-center gap-2 text-xs font-semibold text-foreground">
          <ShieldCheck className="h-4 w-4 text-primary" />
          <span>TRADESCOUT (Scan The Charts) • NSE Market Screener & Terminal</span>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
            Beta — Free
          </span>
        </div>

        {/* Legal Disclaimer text required by Indian financial regulations */}
        <p className="text-xs text-muted-foreground max-w-3xl leading-relaxed">
          TRADESCOUT is an educational and analytical tool designed for market research. Not registered with SEBI as an Investment Adviser. Securities trading involves substantial risk of loss. All scanners, charts, stage classifications, and financial metrics are intended purely for educational and analytical purposes, not direct investment advice.
        </p>

        {/* Quick Nav Links */}
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground font-medium pt-1">
          <Link href="/disclaimer" className="hover:text-primary transition-colors flex items-center gap-1">
            <ShieldCheck className="h-3 w-3" />
            <span>SEBI Disclaimer</span>
          </Link>
          <Link href="/terms" className="hover:text-primary transition-colors flex items-center gap-1">
            <FileText className="h-3 w-3" />
            <span>Terms of Use</span>
          </Link>
          <Link href="/privacy" className="hover:text-primary transition-colors flex items-center gap-1">
            <Lock className="h-3 w-3" />
            <span>Privacy Policy (DPDP Act)</span>
          </Link>
          <Link href="/contact" className="hover:text-primary transition-colors flex items-center gap-1">
            <Mail className="h-3 w-3" />
            <span>Contact Support</span>
          </Link>
        </div>

        {/* Entity & Location */}
        <p className="text-[11px] text-muted-foreground/60 font-mono">
          &copy; {new Date().getFullYear()} Scan The Charts / TRADESCOUT. Developed &amp; operated from Hoshiarpur, Punjab, India. Direct support: support@scanthecharts.com
        </p>
      </div>
    </footer>
  );
}

export default Footer;
