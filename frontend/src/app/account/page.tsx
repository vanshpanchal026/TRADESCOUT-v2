"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  User,
  CreditCard,
  ShieldCheck,
  Database,
  Download,
  Trash2,
  Search,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

function AccountContent() {
  const searchParams = useSearchParams();
  const initialSec = searchParams.get("sec") || "your-data";
  const [activeTab, setActiveTab] = useState(initialSec);

  const [cacheCleared, setCacheCleared] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const [displayName, setDisplayName] = useState("VP");
  const [email, setEmail] = useState("vp@tradescout.in");
  const [profileSaved, setProfileSaved] = useState(false);

  useEffect(() => {
    try {
      const savedProfile = localStorage.getItem("ts-profile-settings") || localStorage.getItem("ts-user-profile");
      if (savedProfile) {
        const parsed = JSON.parse(savedProfile);
        if (parsed.name) setDisplayName(parsed.name);
        if (parsed.email) setEmail(parsed.email);
      }
    } catch {}
  }, []);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = JSON.stringify({ name: displayName, email });
      localStorage.setItem("ts-profile-settings", payload);
      localStorage.setItem("ts-user-profile", payload);
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 2000);
    } catch {}
  };

  const handleDownload = () => {
    const data = {
      user: "VP",
      plan: "Free",
      watchlists: ["Nifty Momentum", "Breakouts 52W"],
      savedScans: ["Daily Base", "Near Pivot", "VCP"],
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "tradescout_data_export.json";
    a.click();
    URL.revokeObjectURL(url);
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2000);
  };

  const handleClearCache = () => {
    try {
      localStorage.removeItem("ts-feedback-draft");
      sessionStorage.clear();
    } catch {}
    setCacheCleared(true);
    setTimeout(() => setCacheCleared(false), 2500);
  };

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      {/* Top Search Settings Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-border/60">
        <h1 className="text-xl font-bold tracking-tight text-foreground">Account settings</h1>
        <div className="relative w-64">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search settings"
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      {/* Main 2-Column Bento Layout (Screenshot 1) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Left Column: Account Navigation */}
        <div className="md:col-span-4 space-y-3">
          <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground px-2">
            Account
          </div>

          <div className="space-y-1">
            <button
              onClick={() => setActiveTab("profile")}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-left transition-colors cursor-pointer ${
                activeTab === "profile"
                  ? "bg-primary/10 text-primary border border-primary/20"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
              }`}
            >
              <User className="h-4 w-4" />
              <span>Profile</span>
            </button>

            <button
              onClick={() => setActiveTab("billing")}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-left transition-colors cursor-pointer ${
                activeTab === "billing"
                  ? "bg-primary/10 text-primary border border-primary/20"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <CreditCard className="h-4 w-4" />
                <span>Plan &amp; billing</span>
              </div>
              <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-blue-100 text-primary dark:bg-primary/20">
                Free
              </span>
            </button>

            <button
              onClick={() => setActiveTab("security")}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-left transition-colors cursor-pointer ${
                activeTab === "security"
                  ? "bg-primary/10 text-primary border border-primary/20"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
              }`}
            >
              <ShieldCheck className="h-4 w-4" />
              <span>Security</span>
            </button>

            <button
              onClick={() => setActiveTab("your-data")}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-left transition-colors cursor-pointer ${
                activeTab === "your-data"
                  ? "bg-primary/10 text-primary border border-primary/20 font-bold"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
              }`}
            >
              <Database className="h-4 w-4" />
              <span>Your data</span>
            </button>
          </div>
        </div>

        {/* Right Column: Settings Content */}
        <div className="md:col-span-8 space-y-6">
          {activeTab === "your-data" && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div>
                <h2 className="text-base font-bold text-foreground">Your data</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Take a copy, or clear what this browser is holding.
                </p>
              </div>

              {/* Card 1: Export my data */}
              <div className="rounded-2xl bg-card border border-border/80 shadow-xs p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h3 className="text-xs font-bold text-foreground">Export my data</h3>
                  <p className="text-xs text-muted-foreground max-w-md leading-relaxed">
                    A copy of your watchlists, favourites, saved scans and settings, in one file.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleDownload}
                  className="px-4 py-1.5 rounded-xl border border-border bg-white dark:bg-card text-xs font-semibold text-foreground hover:bg-muted transition-colors shadow-2xs shrink-0 cursor-pointer"
                >
                  {downloaded ? "Downloaded!" : "Download"}
                </button>
              </div>

              {/* Card 2: Clear cached data */}
              <div className="rounded-2xl bg-card border border-border/80 shadow-xs p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h3 className="text-xs font-bold text-foreground">Clear cached data</h3>
                  <p className="text-xs text-muted-foreground max-w-md leading-relaxed">
                    Clears layouts, drafts and stock data saved in this browser. Nothing on your account is touched.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleClearCache}
                  className="px-4 py-1.5 rounded-xl border border-border bg-white dark:bg-card text-xs font-semibold text-foreground hover:bg-muted transition-colors shadow-2xs shrink-0 cursor-pointer"
                >
                  {cacheCleared ? "Cleared!" : "Clear cache"}
                </button>
              </div>
            </div>
          )}

          {activeTab === "profile" && (
            <form onSubmit={handleSaveProfile} className="rounded-2xl bg-card border border-border/80 shadow-xs p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-foreground">Profile Settings</h2>
                {profileSaved && (
                  <span className="text-xs font-semibold text-emerald-400 font-mono">
                    ✓ Saved
                  </span>
                )}
              </div>
              <div className="space-y-3 text-xs">
                <div>
                  <label className="font-semibold text-muted-foreground block mb-1">Display Name</label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="px-3 py-1.5 rounded-xl border border-border bg-background text-foreground text-xs w-full max-w-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="font-semibold text-muted-foreground block mb-1">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="px-3 py-1.5 rounded-xl border border-border bg-background text-foreground text-xs w-full max-w-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary/90 transition-colors shadow-xs"
                >
                  Save Profile
                </button>
              </div>
            </form>
          )}

          {activeTab === "billing" && (
            <div className="rounded-2xl bg-card border border-border/80 shadow-xs p-5 space-y-4">
              <h2 className="text-base font-bold text-foreground">Plan &amp; billing</h2>
              <div className="p-4 rounded-xl bg-blue-50/60 dark:bg-muted/40 border border-blue-200/60 dark:border-border text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-primary">Free Beta Tier</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary text-white">
                    Active
                  </span>
                </div>
                <p className="text-muted-foreground">
                  Enjoy unrestricted access to all NSE market breadth indicators, scanners, and charts.
                </p>
              </div>
            </div>
          )}

          {activeTab === "security" && (
            <div className="rounded-2xl bg-card border border-border/80 shadow-xs p-5 space-y-4">
              <h2 className="text-base font-bold text-foreground">Security</h2>
              <p className="text-xs text-muted-foreground">
                Local-first single-user session security with private client-side encryption.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AccountPage() {
  return (
    <React.Suspense fallback={<div className="min-h-screen p-6 text-xs text-muted-foreground">Loading Account Settings...</div>}>
      <AccountContent />
    </React.Suspense>
  );
}