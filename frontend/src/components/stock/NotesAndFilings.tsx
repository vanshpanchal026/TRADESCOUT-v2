"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { getAuthHeaders } from "@/lib/auth";

interface NotesAndFilingsProps {
  symbol: string;
  companyName?: string | null;
}

export default function NotesAndFilings({ symbol, companyName }: NotesAndFilingsProps) {
  const symClean = (symbol || "").toUpperCase().trim();
  const storageKey = `stc-notes-${symClean}`;
  const [note, setNote] = useState("");
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [savedTime, setSavedTime] = useState<string | null>(null);
  const initialLoadDone = useRef(false);
  const lastSavedContent = useRef<string>("");

  // 1. Initial Load: Fetch from cloud API with localStorage fallback
  useEffect(() => {
    if (!symClean) return;

    let isMounted = true;
    initialLoadDone.current = false;

    async function loadNotes() {
      try {
        const res = await fetch(`/api/stock/${symClean}/notes`, { headers: getAuthHeaders() });
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.content) {
            setNote(data.content);
            lastSavedContent.current = data.content;
            setSavedTime(
              data.updated_at
                ? `Synced ${new Date(data.updated_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}`
                : "Synced with Cloud"
            );
            initialLoadDone.current = true;
            return;
          }
        }
      } catch {
        // Fallback to local storage if API is unreachable
      }

      // Local storage fallback
      try {
        const local = localStorage.getItem(storageKey);
        if (local && isMounted) {
          setNote(local);
          lastSavedContent.current = local;
          setSavedTime("Loaded from local storage");
        }
      } catch {
        // ignore
      }
      if (isMounted) {
        initialLoadDone.current = true;
      }
    }

    loadNotes();

    return () => {
      isMounted = false;
    };
  }, [symClean, storageKey]);

  // Persist helper
  const persistNotes = useCallback(
    async (content: string) => {
      if (!symClean) return;
      setSaveStatus("saving");

      try {
        localStorage.setItem(storageKey, content);
      } catch {
        // ignore local storage quota errors
      }

      try {
        const res = await fetch(`/api/stock/${symClean}/notes`, {
          method: "POST",
          headers: { "Content-Type": "application/json", ...getAuthHeaders() },
          body: JSON.stringify({ content }),
        });

        if (res.ok) {
          lastSavedContent.current = content;
          setSaveStatus("saved");
          const timeStr = new Date().toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          });
          setSavedTime(`Auto-saved at ${timeStr}`);
        } else {
          setSaveStatus("error");
          setSavedTime("Saved locally (cloud offline)");
        }
      } catch {
        setSaveStatus("error");
        setSavedTime("Saved locally (cloud offline)");
      }
    },
    [symClean, storageKey]
  );

  // 2. Auto-save Debounce: 1000ms delay after typing stops
  useEffect(() => {
    if (!initialLoadDone.current) return;
    if (note === lastSavedContent.current) return;

    setSaveStatus("saving");
    const timer = setTimeout(() => {
      persistNotes(note);
    }, 1000);

    return () => clearTimeout(timer);
  }, [note, persistNotes]);

  // Manual save trigger
  const handleManualSave = () => {
    persistNotes(note);
  };

  const insertTemplate = (templateType: "setup" | "risk" | "catalyst") => {
    let tpl = "";
    if (templateType === "setup") {
      tpl = `\n### Trade Setup — ${symClean} (${new Date().toLocaleDateString("en-IN")})\n- Entry Trigger: Breakout above pivot ₹\n- Pattern: VCP / 50-day SMA Pullback\n- Volume Requirement: > 1.5x 50D average\n`;
    } else if (templateType === "risk") {
      tpl = `\n### Risk & Position Sizing\n- Stop Loss: ₹ (max -5.0% from entry)\n- Target 1: ₹ (Risk-Reward 2.5:1)\n- Position Size: % of portfolio\n`;
    } else {
      tpl = `\n### Catalyst & Business Notes\n- Earnings Surprise: Sales +% YoY, Profit +% YoY\n- Institutional Activity: FII / DII net buying\n- Management Commentary:\n`;
    }
    setNote((prev) => prev + tpl);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
      {/* Left 2 Cols: Notes Area */}
      <div className="lg:col-span-2 flex flex-col gap-4 bg-card p-6 rounded-xl border border-border backdrop-blur-md">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
          <div>
            <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
              <span>Private Trading Journal</span>
              <span className="text-[11px] font-normal px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                Cloud Auto-Sync Active
              </span>
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Personal thesis, entry triggers, stop levels, and setup checklists for {symClean}.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {savedTime && (
              <span
                className={`text-xs font-mono transition-colors ${
                  saveStatus === "saving"
                    ? "text-amber-400 animate-pulse"
                    : saveStatus === "error"
                    ? "text-muted-foreground"
                    : "text-muted-foreground"
                }`}
              >
                {saveStatus === "saving" ? "Auto-saving..." : savedTime}
              </span>
            )}
            <button
              onClick={handleManualSave}
              className="px-3.5 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-all shadow-sm shadow-cyan-500/20 active:scale-95"
            >
              Save Now
            </button>
          </div>
        </div>

        {/* Quick Insert Templates */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-muted-foreground font-medium mr-1 select-none">Quick Template:</span>
          <button
            onClick={() => insertTemplate("setup")}
            className="px-2.5 py-1 rounded border border-border hover:border-slate-700 bg-slate-950 text-foreground hover:text-cyan-400 transition-colors"
          >
            + VCP Breakout Trigger
          </button>
          <button
            onClick={() => insertTemplate("risk")}
            className="px-2.5 py-1 rounded border border-border hover:border-slate-700 bg-slate-950 text-foreground hover:text-emerald-400 transition-colors"
          >
            + Risk & Stop Management
          </button>
          <button
            onClick={() => insertTemplate("catalyst")}
            className="px-2.5 py-1 rounded border border-border hover:border-slate-700 bg-slate-950 text-foreground hover:text-amber-400 transition-colors"
          >
            + Fundamental Catalyst
          </button>
        </div>

        {/* Text Area */}
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder={`Write private trading thesis, key resistance levels, earnings date notes, or why you are monitoring ${symClean}... (Auto-saves continuously)`}
          rows={12}
          className="w-full bg-slate-950/80 border border-border rounded-lg p-4 text-xs font-mono text-foreground placeholder-slate-600 focus:outline-none focus:border-cyan-500/70 focus:ring-1 focus:ring-cyan-500/50 transition-all resize-y leading-relaxed"
        />
      </div>

      {/* Right Col: Filings & Investor Disclosures */}
      <div className="flex flex-col gap-4 bg-card p-6 rounded-xl border border-border backdrop-blur-md">
        <div className="border-b border-border pb-4">
          <h3 className="text-base font-semibold text-foreground">Filings & Concalls</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Official exchange disclosures for {companyName || symClean}
          </p>
        </div>

        <div className="flex flex-col gap-2.5 text-xs">
          <a
            href={`https://www.nseindia.com/get-quotes/equity?symbol=${symClean}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-3 rounded-lg bg-slate-950/60 hover:bg-slate-950 border border-border/70 hover:border-slate-700 transition-all group"
          >
            <div className="flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              <span className="text-foreground group-hover:text-cyan-400 font-medium">
                NSE Corporate Announcements
              </span>
            </div>
            <span className="text-muted-foreground group-hover:text-foreground">↗</span>
          </a>

          <a
            href={`https://www.bseindia.com/stock-share-price/${symClean.toLowerCase()}/`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-3 rounded-lg bg-slate-950/60 hover:bg-slate-950 border border-border/70 hover:border-slate-700 transition-all group"
          >
            <div className="flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full bg-purple-400" />
              <span className="text-foreground group-hover:text-purple-400 font-medium">
                BSE Corporate Filings & Disclosures
              </span>
            </div>
            <span className="text-muted-foreground group-hover:text-foreground">↗</span>
          </a>

          <a
            href={`https://www.screener.in/company/${symClean}/consolidated/`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-3 rounded-lg bg-slate-950/60 hover:bg-slate-950 border border-border/70 hover:border-slate-700 transition-all group"
          >
            <div className="flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="text-foreground group-hover:text-emerald-400 font-medium">
                Investor Presentation & Annual Report
              </span>
            </div>
            <span className="text-muted-foreground group-hover:text-foreground">↗</span>
          </a>

          <a
            href={`https://www.google.com/search?q=${symClean}+concall+transcript+investor+presentation`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-3 rounded-lg bg-slate-950/60 hover:bg-slate-950 border border-border/70 hover:border-slate-700 transition-all group"
          >
            <div className="flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span className="text-foreground group-hover:text-amber-400 font-medium">
                Concall Audio & Transcript Search
              </span>
            </div>
            <span className="text-muted-foreground group-hover:text-foreground">↗</span>
          </a>
        </div>

        {/* Disclaimer Notice */}
        <div className="mt-auto pt-4 border-t border-border text-[11px] text-muted-foreground leading-normal">
          TRADESCOUT is an educational research platform, not a SEBI-registered advisory. Market investments are subject to risk.
        </div>
      </div>
    </div>
  );
}
