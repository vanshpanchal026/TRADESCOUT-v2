"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Sparkles,
  ArrowRight,
  X,
  Activity,
  Zap,
  Compass,
  LayoutGrid,
  ShieldCheck,
  Check,
} from "lucide-react";

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WelcomeModal({ isOpen, onClose }: WelcomeModalProps) {
  const [tourStep, setTourStep] = useState<number | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setTourStep(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const tourSteps = [
    {
      title: "1. The Warmup Cockpit",
      subtitle: "Pre-market & live breadth command center",
      description:
        "Real-time market participation (% > 20/50/200 SMA), 22-session FII/DII cash flow tracking, Weinstein Stage 2 vs Stage 4 distribution, and today's VCP setups.",
      icon: Activity,
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
      link: "/warmup",
      linkText: "Visit The Warmup",
    },
    {
      title: "2. Technical Scanners Hub",
      subtitle: "11+ Curated Minervini & momentum presets",
      description:
        "Instant vectorized screening across 2,500+ NSE stocks in under 15ms. Split-pane workspace with live OHLC chart and financial overlays.",
      icon: Zap,
      color: "text-primary",
      bgColor: "bg-primary/10",
      link: "/scanners/trend-template",
      linkText: "Launch Scanners",
    },
    {
      title: "3. Rotational Graphs & Sector Heatmaps",
      subtitle: "4-Quadrant RRG and market cap treemap",
      description:
        "Track institutional sector rotation with Leading, Improving, Weakening, and Lagging quadrants plus dynamic hierarchical market cap heatmaps.",
      icon: Compass,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      link: "/rrg",
      linkText: "Explore RRG",
    },
  ];

  const handleDismiss = () => {
    try {
      localStorage.setItem("stc-welcome-shown", "true");
    } catch {}
    onClose();
  };

  const handleStartTour = () => {
    setTourStep(0);
  };

  const handleNextTourStep = () => {
    if (tourStep !== null && tourStep < tourSteps.length - 1) {
      setTourStep(tourStep + 1);
    } else {
      handleDismiss();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-card border border-border rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6 animate-in zoom-in-95 duration-200">
        {/* Close button */}
        <button
          onClick={handleDismiss}
          className="absolute right-5 top-5 p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          aria-label="Close modal"
        >
          <X className="h-5 w-5" />
        </button>

        {tourStep === null ? (
          /* Initial Welcome View */
          <>
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Beta — Free Tier Unlocked</span>
              </div>
              <h2 className="text-3xl font-extrabold tracking-tight text-foreground">
                Namaste! 🙏
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Welcome to <span className="font-semibold text-foreground">Scan The Charts</span> (TRADESCOUT) — an all-in-one equity market analytics, technical stock scanning, institutional cash-flow tracking, and market breadth platform engineered specifically for Indian National Stock Exchange (NSE) traders.
              </p>
            </div>

            {/* Quick feature list */}
            <div className="grid grid-cols-2 gap-3 py-2">
              <div className="p-3 rounded-2xl bg-muted/50 border border-border/80 flex items-center gap-2.5">
                <Activity className="h-4 w-4 text-primary shrink-0" />
                <span className="text-xs font-medium text-foreground">Live Market Breadth</span>
              </div>
              <div className="p-3 rounded-2xl bg-muted/50 border border-border/80 flex items-center gap-2.5">
                <Zap className="h-4 w-4 text-amber-500 shrink-0" />
                <span className="text-xs font-medium text-foreground">11+ Technical Scanners</span>
              </div>
              <div className="p-3 rounded-2xl bg-muted/50 border border-border/80 flex items-center gap-2.5">
                <Compass className="h-4 w-4 text-blue-500 shrink-0" />
                <span className="text-xs font-medium text-foreground">Sector RRG Rotations</span>
              </div>
              <div className="p-3 rounded-2xl bg-muted/50 border border-border/80 flex items-center gap-2.5">
                <LayoutGrid className="h-4 w-4 text-bull shrink-0" />
                <span className="text-xs font-medium text-foreground">Market Cap Treemap</span>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <button
                onClick={handleDismiss}
                className="w-full sm:w-1/2 py-2.5 px-4 rounded-xl border border-border bg-background hover:bg-muted text-xs font-semibold text-foreground transition-all"
              >
                Explore on my own
              </button>
              <button
                onClick={handleStartTour}
                className="w-full sm:w-1/2 py-2.5 px-4 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-semibold shadow-md shadow-primary/20 flex items-center justify-center gap-1.5 transition-all"
              >
                <span>Show me around</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </>
        ) : (
          /* Guided Tour View */
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                Guided Tour ({tourStep + 1} of {tourSteps.length})
              </span>
              <div className="flex items-center gap-1">
                {tourSteps.map((_, idx) => (
                  <div
                    key={idx}
                    className={`h-1.5 rounded-full transition-all ${
                      idx === tourStep ? "w-6 bg-primary" : "w-2 bg-muted-foreground/30"
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Tour card item */}
            <div className="p-5 rounded-2xl border border-border bg-muted/30 space-y-3">
              <div className="flex items-center gap-3">
                <div
                  className={`h-10 w-10 rounded-xl ${tourSteps[tourStep].bgColor} ${tourSteps[tourStep].color} flex items-center justify-center`}
                >
                  {React.createElement(tourSteps[tourStep].icon, { className: "h-5 w-5" })}
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground">
                    {tourSteps[tourStep].title}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {tourSteps[tourStep].subtitle}
                  </p>
                </div>
              </div>
              <p className="text-xs text-foreground/80 leading-relaxed">
                {tourSteps[tourStep].description}
              </p>
              <Link
                href={tourSteps[tourStep].link}
                onClick={handleDismiss}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline pt-1"
              >
                <span>{tourSteps[tourStep].linkText}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {/* Step navigation buttons */}
            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                onClick={handleDismiss}
                className="text-xs font-medium text-muted-foreground hover:text-foreground"
              >
                Skip Tour
              </button>
              <button
                onClick={handleNextTourStep}
                className="py-2.5 px-5 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-semibold shadow-md shadow-primary/20 flex items-center gap-1.5"
              >
                <span>{tourStep === tourSteps.length - 1 ? "Finish Tour" : "Next Step"}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default WelcomeModal;
