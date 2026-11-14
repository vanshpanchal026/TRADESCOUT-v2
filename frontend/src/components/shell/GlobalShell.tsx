"use client";

import React, { useState, useEffect } from "react";
import { Sidebar } from "@/components/shell/Sidebar";
import { TopTabBar } from "@/components/shell/TopTabBar";
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
    <div className="flex min-h-screen bg-background text-foreground antialiased">
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
    </div>
  );
}

export default GlobalShell;
