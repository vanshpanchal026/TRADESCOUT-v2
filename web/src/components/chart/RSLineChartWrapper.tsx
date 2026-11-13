"use client";

import dynamic from "next/dynamic";
import React from "react";

const DynamicRSLineChart = dynamic(() => import("./RSLineChart"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center w-full min-h-[500px] bg-slate-900/40 rounded-xl border border-slate-800">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs text-slate-400 font-medium">Mounting RS Line Canvas...</span>
      </div>
    </div>
  ),
});

export default DynamicRSLineChart;
