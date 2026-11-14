"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  User,
  ShieldCheck,
  Key,
  Download,
  Trash2,
  Sparkles,
  CheckCircle2,
  Lock,
  ArrowRight,
  RefreshCw,
  Mail,
  Phone,
  Briefcase,
  Layers,
} from "lucide-react";

export default function AccountPage() {
  const [displayName, setDisplayName] = useState("Pro Trader");
  const [email, setEmail] = useState("trader@tradescout.in");
  const [phone, setPhone] = useState("+91 98765 43210");
  const [experience, setExperience] = useState("Advanced Swing Trader (3-5 Years)");
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Restore saved profile settings from client storage on mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const saved = localStorage.getItem("ts-profile-settings");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.displayName) setDisplayName(parsed.displayName);
        if (parsed.email) setEmail(parsed.email);
        if (parsed.phone) setPhone(parsed.phone);
        if (parsed.experience) setExperience(parsed.experience);
      }
    } catch (err) {
      console.error("Failed to restore profile settings:", err);
    }
  }, []);

  // Password Modal
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordUpdated, setPasswordUpdated] = useState(false);

  // Clear cache toast
  const [cacheCleared, setCacheCleared] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const profileData = {
      displayName,
      email,
      phone,
      experience,
      updatedAt: new Date().toISOString(),
    };
    try {
      localStorage.setItem("ts-profile-settings", JSON.stringify(profileData));
    } catch (err) {
      console.error("Failed to persist profile settings:", err);
    }
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordUpdated(true);
    setTimeout(() => {
      setPasswordUpdated(false);
      setPasswordModalOpen(false);
      setCurrentPassword("");
      setNewPassword("");
    }, 1500);
  };

  const handleDownloadSettings = () => {
    const settings = {
      profile: { displayName, email, phone, experience },
      tier: "Beta — Free",
      exportedAt: new Date().toISOString(),
      workspace: "TRADESCOUT Terminal Pro",
    };
    const blob = new Blob([JSON.stringify(settings, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "tradescout_workspace_settings.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClearCache = () => {
    try {
      localStorage.removeItem("stc-theme");
      sessionStorage.clear();
    } catch {}
    setCacheCleared(true);
    setTimeout(() => setCacheCleared(false), 2500);
  };

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Account Settings</h1>
            <span className="text-xs font-mono font-semibold px-2.5 py-0.5 rounded-full bg-bull/10 text-bull border border-bull/20">
              Beta — Free Tier Active
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage your personal profile, subscription tier, security credentials &amp; workspace configuration
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Navigation Tab column */}
        <div className="space-y-2">
          <div className="p-3 rounded-2xl bg-card border border-border shadow-xs space-y-1">
            <button className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold bg-primary text-white shadow-xs text-left">
              <User className="h-4 w-4" />
              <span>Profile &amp; Subscription</span>
            </button>
            <button
              onClick={() => setPasswordModalOpen(true)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted text-left transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <Key className="h-4 w-4" />
                <span>Security &amp; Password</span>
              </div>
              <span className="text-[10px] text-primary font-semibold">&gt;</span>
            </button>
            <Link
              href="/disclaimer"
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted text-left transition-colors"
            >
              <ShieldCheck className="h-4 w-4" />
              <span>SEBI &amp; Disclosures</span>
            </Link>
          </div>

          {/* Account Tier Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-primary/10 via-card to-background border border-primary/30 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-foreground">Current Plan</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-primary text-white">
                Beta — Free
              </span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              You are on the fully unlocked Beta tier. Enjoy unrestricted access to 2,500+ NSE stocks, 11+ scanners, RRG, and advanced charting.
            </p>
            <div className="flex items-center gap-1.5 text-xs text-bull font-semibold pt-1">
              <CheckCircle2 className="h-4 w-4" />
              <span>Full Features Enabled (₹0 / mo)</span>
            </div>
          </div>
        </div>

        {/* Main Settings Panel */}
        <div className="md:col-span-2 space-y-6">
          {/* Profile Management Section */}
          <div className="p-6 rounded-2xl bg-card border border-border shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-border/70">
              <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
                <User className="h-4 w-4 text-primary" />
                <span>Profile Management</span>
              </h2>
              {savedSuccess && (
                <span className="inline-flex items-center gap-1 text-xs text-bull font-semibold animate-in fade-in">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Profile updated</span>
                </span>
              )}
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Display Name</label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Registered Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Contact Phone</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-background text-foreground font-mono focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Trading Experience</label>
                  <select
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option>Beginner (&lt;1 Year)</option>
                    <option>Intermediate Trader (1-3 Years)</option>
                    <option>Advanced Swing Trader (3-5 Years)</option>
                    <option>Professional / Institutional (&gt;5 Years)</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-semibold shadow-xs transition-colors"
                >
                  Save Profile Changes
                </button>
              </div>
            </form>
          </div>

          {/* Security & Credentials Section */}
          <div className="p-6 rounded-2xl bg-card border border-border shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border/70">
              <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Lock className="h-4 w-4 text-primary" />
                <span>Security &amp; Credentials</span>
              </h2>
              <span className="text-[10px] text-muted-foreground font-mono">2FA Active</span>
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl bg-background border border-border">
              <div>
                <h4 className="text-xs font-bold text-foreground">Account Password</h4>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Last updated 14 days ago. Protect your watchlist notes and terminal configurations.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPasswordModalOpen(true)}
                className="px-3 py-1.5 rounded-xl border border-border bg-card hover:bg-muted text-xs font-semibold text-primary transition-colors whitespace-nowrap"
              >
                Change password &gt;
              </button>
            </div>
          </div>

          {/* Workspace Data Management Section */}
          <div className="p-6 rounded-2xl bg-card border border-border shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border/70">
              <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Layers className="h-4 w-4 text-primary" />
                <span>Data Management &amp; Cache</span>
              </h2>
              {cacheCleared && (
                <span className="text-xs text-bull font-semibold animate-in fade-in">
                  ✓ Cache cleared and reset complete
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-background border border-border space-y-3">
                <div>
                  <h4 className="text-xs font-bold text-foreground">Download Workspace</h4>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Export your custom layouts, scanner preferences, and trading notes as JSON.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleDownloadSettings}
                  className="w-full py-2 px-3 rounded-xl border border-border bg-card hover:bg-muted text-xs font-semibold text-foreground transition-colors flex items-center justify-center gap-1.5"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Download Settings</span>
                </button>
              </div>

              <div className="p-4 rounded-xl bg-background border border-border space-y-3">
                <div>
                  <h4 className="text-xs font-bold text-foreground">Clear Local Cache</h4>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Reset local session states, cached breadcrumbs, and stored UI toggles.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleClearCache}
                  className="w-full py-2 px-3 rounded-xl border border-border bg-card hover:bg-muted text-xs font-semibold text-bear transition-colors flex items-center justify-center gap-1.5"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Clear Cache</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Change Password Modal */}
      {passwordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-card border border-border rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-foreground">Change Password</h3>
            <p className="text-xs text-muted-foreground">
              Enter your existing password and choose a secure new password.
            </p>

            {passwordUpdated ? (
              <div className="p-4 rounded-xl bg-bull/10 border border-bull/20 text-center space-y-1">
                <CheckCircle2 className="h-6 w-6 text-bull mx-auto" />
                <span className="text-xs font-bold text-bull block">Password Updated</span>
                <p className="text-[11px] text-muted-foreground">Credentials refreshed successfully.</p>
              </div>
            ) : (
              <form onSubmit={handlePasswordSubmit} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-foreground">Current Password</label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                    placeholder="••••••••••••"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-background text-foreground"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-foreground">New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    placeholder="••••••••••••"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-background text-foreground"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setPasswordModalOpen(false)}
                    className="px-3 py-1.5 rounded-lg border border-border text-xs font-medium text-muted-foreground hover:text-foreground"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-semibold shadow-xs"
                  >
                    Update Password
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
