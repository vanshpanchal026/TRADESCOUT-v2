"use client";

import React, { useState, useEffect } from "react";
import { Sidebar } from "@/components/shell/Sidebar";
import { TopTabBar } from "@/components/shell/TopTabBar";
import { MobileNav } from "@/components/shell/MobileNav";
import { FeedbackDrawer } from "@/components/shell/FeedbackDrawer";
import { WelcomeModal } from "@/components/shell/WelcomeModal";

interface GlobalShellProps {
  children: React.ReactNode;
}

export function GlobalShell({ children }: GlobalShellProps) {
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [welcomeOpen, setWelcomeOpen] = useState(false);

  useEffect(() => {
    try {
      const isAutomated = typeof navigator !== "undefined" && navigator.webdriver;
      const shown = localStorage.getItem("stc-welcome-shown");
      // Only auto-show for human visitors on warmup if not previously dismissed
      if (!shown && !isAutomated && window.location.pathname === "/warmup") {
        setWelcomeOpen(true);
      }
    } catch {}

    const handleFeedbackEvent = () => setFeedbackOpen(true);
    const handleWelcomeEvent = () => setWelcomeOpen(true);
    if (typeof window !== "undefined" && (window as any).__feedbackDrawerPending) {
      setFeedbackOpen(true);
      (window as any).__feedbackDrawerPending = false;
    }
    window.addEventListener("open-feedback-drawer", handleFeedbackEvent);
    window.addEventListener("open-welcome-modal", handleWelcomeEvent);
    return () => {
      window.removeEventListener("open-feedback-drawer", handleFeedbackEvent);
      window.removeEventListener("open-welcome-modal", handleWelcomeEvent);
    };
  }, []);

  return (
    <div className="flex min-h-screen bg-background text-foreground antialiased pb-14 lg:pb-0">
      {/* Left Vertical Icon Sidebar */}
      <Sidebar
        onOpenFeedback={() => setFeedbackOpen(true)}
        onReplayTour={() => setWelcomeOpen(true)}
      />

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Horizontal Tab Bar */}
        <TopTabBar />

        {/* Dynamic Page Content */}
        <div className="flex-1 min-w-0">
          {children}
        </div>
      </div>

      {/* Mobile Fixed Bottom Nav */}
      <MobileNav />

      {/* Right Slide-Over Feedback Drawer */}
      <FeedbackDrawer
        isOpen={feedbackOpen}
        onClose={() => setFeedbackOpen(false)}
      />

      {/* Onboarding Welcome Modal */}
      <WelcomeModal
        isOpen={welcomeOpen}
        onClose={() => setWelcomeOpen(false)}
      />

      {/* Floating Bottom-Right Action Widgets (Matching screenshots) */}
      <div className="fixed bottom-5 right-5 z-40 flex flex-col items-center gap-2 select-none">
        {/* Top 4-dot widget launcher button */}
        <button
          type="button"
          onClick={() => setWelcomeOpen(true)}
          className="h-9 w-9 rounded-full bg-slate-900/90 dark:bg-card border border-slate-700/60 shadow-lg text-white hover:scale-105 active:scale-95 transition-all flex items-center justify-center cursor-pointer group"
          title="Quick Tour & Navigation"
          aria-label="Quick Tour & Navigation"
        >
          <div className="grid grid-cols-2 gap-0.5">
            <span className="w-1.5 h-1.5 rounded-xs bg-white/90" />
            <span className="w-1.5 h-1.5 rounded-xs bg-white/90" />
            <span className="w-1.5 h-1.5 rounded-xs bg-white/90" />
            <span className="w-1.5 h-1.5 rounded-xs bg-white/90" />
          </div>
          <span className="absolute right-11 px-2.5 py-1 rounded-lg bg-foreground text-background text-[11px] font-medium whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 shadow-md">
            Product Tour
          </span>
        </button>

        {/* Bottom AI Bot / Feedback trigger button */}
        <button
          type="button"
          onClick={() => setFeedbackOpen(true)}
          className="h-10 w-10 rounded-full bg-slate-900 dark:bg-card border-2 border-indigo-500/40 shadow-xl text-white hover:scale-105 active:scale-95 transition-all flex items-center justify-center cursor-pointer group relative"
          title="Send Feedback & AI Assistant"
          aria-label="Send Feedback & AI Assistant"
        >
          <span className="relative flex h-2.5 w-2.5 items-center justify-center">
            {/* Cute robot face eyes */}
            <span className="flex items-center gap-1">
              <span className="w-1 h-2 rounded-full bg-indigo-300" />
              <span className="w-1 h-2 rounded-full bg-indigo-300" />
            </span>
          </span>
          <span className="absolute right-11 px-2.5 py-1 rounded-lg bg-foreground text-background text-[11px] font-medium whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 shadow-md">
            Feedback &amp; Help
          </span>
        </button>
      </div>
    </div>
  );
}

export default GlobalShell;
