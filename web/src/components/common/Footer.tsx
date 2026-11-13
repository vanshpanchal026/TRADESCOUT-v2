import React from "react";
import { ShieldCheck } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full border-t border-border bg-card/60 backdrop-blur-md py-6 px-4 sm:px-8 mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col items-center justify-center text-center space-y-3">
        <div className="flex items-center justify-center gap-2 text-xs font-semibold text-muted-foreground">
          <ShieldCheck className="h-4 w-4 text-accent" />
          <span>TRADESCOUT v1.0.0 • High-Performance Market Screener</span>
        </div>
        <p className="text-xs text-muted-foreground/90 max-w-3xl leading-relaxed">
          TRADESCOUT is an educational and analytical tool designed for market research. Not registered with SEBI as an Investment Adviser. Securities trading involves substantial risk of loss.
        </p>
        <p className="text-[11px] text-muted-foreground/60 font-mono">
          &copy; {new Date().getFullYear()} TRADESCOUT. All rights reserved. Zero-Scraper Vectorized Architecture.
        </p>
      </div>
    </footer>
  );
}

export default Footer;
