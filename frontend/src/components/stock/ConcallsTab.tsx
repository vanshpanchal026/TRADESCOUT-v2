"use client";

import React from "react";
import { FileText, Headphones, ExternalLink, Calendar } from "lucide-react";

interface ConcallsTabProps {
  symbol?: string;
}

export function ConcallsTab({ symbol }: ConcallsTabProps) {
  const concalls = [
    {
      quarter: "Q2 FY27",
      date: "06 Nov 2026",
      title: "Q2 Earnings Conference Call — Volume expansion and Margin recovery",
      highlights: "Management noted 18% YoY revenue growth driven by tier-2 expansion. Gross margins expanded 140 bps on operational efficiencies.",
      hasAudio: true,
      hasPdf: true,
    },
    {
      quarter: "Q1 FY27",
      date: "04 Aug 2026",
      title: "Q1 FY27 Earnings Call — Supply chain normalization & CapEx update",
      highlights: "Capex for new manufacturing facility on track for Q4 commercial operations. Domestic order book up 24%.",
      hasAudio: true,
      hasPdf: true,
    },
    {
      quarter: "Q4 FY26",
      date: "18 May 2026",
      title: "Q4 FY26 Annual Concall — Full year performance review",
      highlights: "Record annual revenue of ₹3,067 Cr. Net debt reduced to zero. Guidance of 20%+ revenue CAGR over FY27-FY28.",
      hasAudio: true,
      hasPdf: true,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="p-4 rounded-xl border border-[#27272a] bg-[#1c1c2e] text-foreground shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-[#27272a]/60">
          <div>
            <h3 className="font-semibold text-sm text-zinc-100">Conference Calls & Transcripts</h3>
            <p className="text-[11px] text-zinc-400">Quarterly analyst concall audio, investor presentations, and transcripts</p>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">
            {symbol ? `${symbol} Transcripts` : "Concalls"}
          </span>
        </div>

        <div className="overflow-x-auto pt-2">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#27272a] text-zinc-400 font-mono text-[11px]">
                <th className="py-2.5 px-3">Period</th>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Summary & Management Takeaways</th>
                <th className="py-2.5 px-3 text-right">Resources</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#27272a]/40">
              {concalls.map((c) => (
                <tr key={c.quarter} className="hover:bg-white/[0.02]">
                  <td className="py-3 px-3 font-mono font-bold text-indigo-400 whitespace-nowrap">
                    {c.quarter}
                  </td>
                  <td className="py-3 px-3 font-mono text-zinc-400 whitespace-nowrap">
                    {c.date}
                  </td>
                  <td className="py-3 px-3 text-zinc-300">
                    <p className="font-semibold text-zinc-100 mb-0.5">{c.title}</p>
                    <p className="text-[11px] text-zinc-400 leading-relaxed">{c.highlights}</p>
                  </td>
                  <td className="py-3 px-3 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[11px] font-mono transition-colors"
                        title="Open Transcript PDF"
                      >
                        <FileText className="h-3 w-3 text-amber-400" />
                        <span>PDF</span>
                      </button>
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[11px] font-mono transition-colors"
                        title="Listen to Audio Recording"
                      >
                        <Headphones className="h-3 w-3 text-indigo-400" />
                        <span>Audio</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default ConcallsTab;
