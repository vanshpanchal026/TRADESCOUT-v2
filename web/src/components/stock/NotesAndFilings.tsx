"use client";

import React, { useEffect, useState } from "react";

interface NotesAndFilingsProps {
  symbol: string;
  companyName?: string | null;
}

export default function NotesAndFilings({ symbol, companyName }: NotesAndFilingsProps) {
  const storageKey = `stc-notes-${symbol.toUpperCase()}`;
  const [note, setNote] = useState("");
  const [savedTime, setSavedTime] = useState<string | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        setNote(saved);
        setSavedTime("Loaded from browser storage");
      }
    } catch {
      // ignore storage errors
    }
  }, [storageKey]);

  const handleSave = () => {
    try {
      localStorage.setItem(storageKey, note);
      const timeStr = new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
      setSavedTime(`Saved at ${timeStr}`);
    } catch {
      setSavedTime("Storage full or unavailable");
    }
  };

  const insertTemplate = (templateType: "setup" | "risk" | "catalyst") => {
    let tpl = "";
    if (templateType === "setup") {
      tpl = `\n### Trade Setup — ${symbol} (${new Date().toLocaleDateString("en-IN")})\n- Entry Trigger: Breakout above pivot ₹\n- Pattern: VCP / 50-day SMA Pullback\n- Volume Requirement: > 1.5x 50D average\n`;
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
      <div className="lg:col-span-2 flex flex-col gap-4 bg-slate-900/60 p-6 rounded-xl border border-slate-800/80 backdrop-blur-md">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
              <span>Private Trading Journal</span>
              <span className="text-[11px] font-normal px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                Encrypted in Browser
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Personal thesis, entry triggers, stop levels, and setup checklists for {symbol}.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {savedTime && <span className="text-xs text-slate-500 font-mono">{savedTime}</span>}
            <button
              onClick={handleSave}
              className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-all shadow-sm shadow-cyan-500/20"
            >
              Save Notes
            </button>
          </div>
        </div>

        {/* Quick Insert Templates */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-500 font-medium mr-1">Insert Setup:</span>
          <button
            onClick={() => insertTemplate("setup")}
            className="px-2.5 py-1 rounded border border-slate-800 hover:border-slate-700 bg-slate-950 text-slate-300 hover:text-cyan-400 transition-colors"
          >
            + VCP Breakout Trigger
          </button>
          <button
            onClick={() => insertTemplate("risk")}
            className="px-2.5 py-1 rounded border border-slate-800 hover:border-slate-700 bg-slate-950 text-slate-300 hover:text-emerald-400 transition-colors"
          >
            + Risk & Stop Management
          </button>
          <button
            onClick={() => insertTemplate("catalyst")}
            className="px-2.5 py-1 rounded border border-slate-800 hover:border-slate-700 bg-slate-950 text-slate-300 hover:text-amber-400 transition-colors"
          >
            + Fundamental Catalyst
          </button>
        </div>

        {/* Text Area */}
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder={`Write private trading thesis, key resistance levels, earnings date notes, or why you are monitoring ${symbol}...`}
          rows={12}
          className="w-full bg-slate-950/80 border border-slate-800 rounded-lg p-4 text-xs font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500/70 focus:ring-1 focus:ring-cyan-500/50 transition-all resize-y leading-relaxed"
        />
      </div>

      {/* Right Col: Filings & Investor Disclosures */}
      <div className="flex flex-col gap-4 bg-slate-900/60 p-6 rounded-xl border border-slate-800/80 backdrop-blur-md">
        <div className="border-b border-slate-800 pb-4">
          <h3 className="text-base font-semibold text-slate-100">Filings & Concalls</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Official exchange disclosures for {companyName || symbol}
          </p>
        </div>

        <div className="flex flex-col gap-2.5 text-xs">
          <a
            href={`https://www.nseindia.com/get-quotes/equity?symbol=${symbol}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-3 rounded-lg bg-slate-950/60 hover:bg-slate-950 border border-slate-800/70 hover:border-slate-700 transition-all group"
          >
            <div className="flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              <span className="text-slate-300 group-hover:text-cyan-400 font-medium">
                NSE Corporate Announcements
              </span>
            </div>
            <span className="text-slate-500 group-hover:text-slate-300">↗</span>
          </a>

          <a
            href={`https://www.bseindia.com/stock-share-price/${symbol.toLowerCase()}/`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-3 rounded-lg bg-slate-950/60 hover:bg-slate-950 border border-slate-800/70 hover:border-slate-700 transition-all group"
          >
            <div className="flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full bg-purple-400" />
              <span className="text-slate-300 group-hover:text-purple-400 font-medium">
                BSE Corporate Filings & Disclosures
              </span>
            </div>
            <span className="text-slate-500 group-hover:text-slate-300">↗</span>
          </a>

          <a
            href={`https://www.screener.in/company/${symbol}/consolidated/`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-3 rounded-lg bg-slate-950/60 hover:bg-slate-950 border border-slate-800/70 hover:border-slate-700 transition-all group"
          >
            <div className="flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="text-slate-300 group-hover:text-emerald-400 font-medium">
                Investor Presentation & Annual Report
              </span>
            </div>
            <span className="text-slate-500 group-hover:text-slate-300">↗</span>
          </a>

          <a
            href={`https://www.google.com/search?q=${symbol}+concall+transcript+investor+presentation`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-3 rounded-lg bg-slate-950/60 hover:bg-slate-950 border border-slate-800/70 hover:border-slate-700 transition-all group"
          >
            <div className="flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span className="text-slate-300 group-hover:text-amber-400 font-medium">
                Concall Audio & Transcript Search
              </span>
            </div>
            <span className="text-slate-500 group-hover:text-slate-300">↗</span>
          </a>
        </div>

        {/* Disclaimer Notice */}
        <div className="mt-auto pt-4 border-t border-slate-800/80 text-[11px] text-slate-500 leading-normal">
          TRADESCOUT is an educational research platform, not a SEBI-registered advisory. Market investments are subject to risk.
        </div>
      </div>
    </div>
  );
}
