"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  TrendingUp,
  ShieldCheck,
  Mail,
  Lock,
  ArrowRight,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { setUserLoginSession, PRESET_USERS } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [keepSignedIn, setKeepSignedIn] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      try {
        setUserLoginSession(PRESET_USERS[0].id, keepSignedIn);
      } catch (err) {
        console.error("Login session failed:", err);
      }
      router.push("/warmup");
    }, 600);
  };

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setResetEmailSent(true);
    setTimeout(() => {
      setShowForgotModal(false);
      setResetEmailSent(false);
    }, 2000);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-card border border-border rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6">
        {/* Brand header */}
        <div className="text-center space-y-2">
          <Link
            href="/"
            className="inline-flex h-12 w-12 rounded-2xl bg-primary text-white items-center justify-center shadow-lg shadow-primary/25 mb-1"
          >
            <TrendingUp className="h-6 w-6" />
          </Link>
          <h1 className="text-2xl font-black tracking-tight text-foreground">
            Sign In to Scan The Charts
          </h1>
          <p className="text-xs text-muted-foreground">
            NSE Equity Terminal • Real-Time Scanners &amp; Breadth Cockpit
          </p>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-bull/10 text-bull border border-bull/20 mt-1">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Beta — Free Tier Active</span>
          </div>
        </div>

        {/* Login form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Email Address</label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="trader@domain.com"
                required
                className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary placeholder:text-muted-foreground/60"
              />
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-foreground">Password</label>
              <button
                type="button"
                onClick={() => setShowForgotModal(true)}
                className="text-xs text-primary font-semibold hover:underline"
              >
                Forgot?
              </button>
            </div>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary placeholder:text-muted-foreground/60"
              />
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            </div>
          </div>

          {/* Persistent session toggle */}
          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={keepSignedIn}
                onChange={(e) => setKeepSignedIn(e.target.checked)}
                className="rounded text-primary focus:ring-primary h-4 w-4 border-border"
              />
              <span className="text-xs text-foreground font-medium">
                Keep me signed in on this device
              </span>
            </label>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 px-4 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-semibold shadow-md shadow-primary/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isLoading ? "Signing In..." : "Sign In to Terminal"}
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        {/* Free Beta Notice */}
        <div className="p-3 rounded-xl bg-muted/40 border border-border/70 text-center space-y-1">
          <span className="text-[11px] font-semibold text-foreground block">
            No subscription or credit card required
          </span>
          <p className="text-[10px] text-muted-foreground">
            All users receive unrestricted access to the complete NSE equity universe and advanced charting during the beta.
          </p>
        </div>

        <div className="text-center pt-1 border-t border-border">
          <Link href="/warmup" className="text-xs font-semibold text-primary hover:underline">
            Continue as Guest Trader &gt;
          </Link>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-card border border-border rounded-2xl p-6 shadow-2xl space-y-4">
            <h2 className="text-base font-bold text-foreground">Password Recovery</h2>
            <p className="text-xs text-muted-foreground">
              Enter your registered email address and we&apos;ll send you an automated password reset link.
            </p>

            {resetEmailSent ? (
              <div className="p-4 rounded-xl bg-bull/10 border border-bull/20 text-center space-y-1">
                <CheckCircle2 className="h-6 w-6 text-bull mx-auto" />
                <span className="text-xs font-bold text-bull block">Reset Link Dispatched</span>
                <p className="text-[11px] text-muted-foreground">Please check your email inbox.</p>
              </div>
            ) : (
              <form onSubmit={handleForgotPassword} className="space-y-3">
                <input
                  type="email"
                  placeholder="name@domain.com"
                  required
                  className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-background text-foreground"
                />
                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="px-3 py-1.5 rounded-lg border border-border text-xs font-medium text-muted-foreground hover:text-foreground"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-semibold"
                  >
                    Send Recovery Email
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
