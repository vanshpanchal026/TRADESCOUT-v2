"use client";

import React, { useEffect, useRef } from "react";
import {
  ColorType,
  CrosshairMode,
  LineSeries,
  LineStyle,
  createChart,
  type IChartApi,
} from "lightweight-charts";
import { RSLinePoint } from "@/lib/types";
import { useTheme } from "@/components/theme-provider";

interface RSLineChartProps {
  symbol: string;
  benchmark?: string;
  rsLine: RSLinePoint[];
  rsRating?: number;
  rsNewHigh?: boolean;
  rsTrend?: string;
}

export default function RSLineChart({

  symbol,
  benchmark = "NIFTY 50",
  rsLine,
  rsRating = 88,
  rsNewHigh = false,
  rsTrend = "up",
}: RSLineChartProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);

  useEffect(() => {
    if (!containerRef.current || !rsLine || rsLine.length === 0) return;

    const container = containerRef.current;
    const chart = createChart(container, {
      width: container.clientWidth,
      height: container.clientHeight || 500,
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: isDark ? "#94A3B8" : "#334155",
        fontSize: 12,
        fontFamily: "'Hanken Grotesk', system-ui, sans-serif",
      },
      grid: {
        vertLines: { color: isDark ? "rgba(51, 65, 85, 0.25)" : "rgba(226, 232, 240, 0.8)", style: LineStyle.Dotted },
        horzLines: { color: isDark ? "rgba(51, 65, 85, 0.25)" : "rgba(226, 232, 240, 0.8)", style: LineStyle.Dotted },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: {
          color: isDark ? "#00E5FF" : "#4F46E5",
          width: 1,
          style: LineStyle.Dashed,
        },
        horzLine: {
          color: isDark ? "#00E5FF" : "#4F46E5",
          width: 1,
          style: LineStyle.Dashed,
        },
      },
      rightPriceScale: {
        borderColor: isDark ? "rgba(51, 65, 85, 0.4)" : "#E2E8F0",
        scaleMargins: {
          top: 0.1,
          bottom: 0.1,
        },
      },
      timeScale: {
        borderColor: isDark ? "rgba(51, 65, 85, 0.4)" : "#E2E8F0",
        timeVisible: true,
      },
    });

    chartRef.current = chart;

    // Relative Strength Line Series (Electric Cyan)
    const lineSeries = chart.addSeries(
      LineSeries,
      {
        color: isDark ? "#00E5FF" : "#2563EB",
        lineWidth: 2,
        priceLineVisible: true,
        lastValueVisible: true,
        title: `${symbol} / ${benchmark} (Base 100)`,
      },
      0
    );

    const formattedData = rsLine.map((pt) => ({
      time: pt.time || pt.date || "",
      value: pt.value,
    }));
    lineSeries.setData(formattedData);

    // 100.0 Base Parity Price Line
    lineSeries.createPriceLine({
      price: 100.0,
      color: "rgba(148, 163, 184, 0.6)",
      lineWidth: 1,
      lineStyle: LineStyle.Dashed,
      axisLabelVisible: true,
      title: "Parity (100.0)",
    });

    // New High Price Line if applicable
    const values = rsLine.map((p) => p.value);
    const maxVal = Math.max(...values);
    if (rsNewHigh || values[values.length - 1] >= maxVal - 0.1) {
      lineSeries.createPriceLine({
        price: maxVal,
        color: "#10B981",
        lineWidth: 1,
        lineStyle: LineStyle.Dashed,
        axisLabelVisible: true,
        title: "52W RS High",
      });
    }

    chart.timeScale().fitContent();

    const resizeObserver = new ResizeObserver((entries) => {
      if (!entries || entries.length === 0 || !entries[0].contentRect) return;
      const { width, height } = entries[0].contentRect;
      if (width > 0 && height > 0) {
        chart.applyOptions({ width, height });
      }
    });

    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
      chart.remove();
      chartRef.current = null;
    };
  }, [symbol, benchmark, rsLine, rsNewHigh, isDark]);

  const latestValue = rsLine.length > 0 ? rsLine[rsLine.length - 1].value : 100.0;
  const isOutperforming = latestValue >= 100.0;

  return (
    <div className="flex flex-col w-full h-full bg-card rounded-2xl border border-border overflow-hidden shadow-sm backdrop-blur-md">
      {/* RS Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-4 border-b border-border bg-muted/40">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-foreground">
              Relative Strength (RS) Line vs {benchmark}
            </h3>
            {rsNewHigh && (
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 animate-pulse">
                ★ RS NEW HIGH
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Normalized 252-session comparative ratio:{" "}
            <code className="text-primary font-mono">
              RS_t = (Stock_t / Stock_0) / (Nifty_t / Nifty_0) × 100
            </code>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-[11px] text-muted-foreground block uppercase font-medium">Current Ratio</span>
            <span
              className={`text-lg font-bold font-mono ${
                isOutperforming ? "text-emerald-400" : "text-rose-400"
              }`}
            >
              {latestValue.toFixed(2)}
            </span>
          </div>

          <div className="h-8 w-[1px] bg-border" />

          <div className="text-right">
            <span className="text-[11px] text-muted-foreground block uppercase font-medium">Trend (20D)</span>
            <span
              className={`text-sm font-semibold capitalize ${
                rsTrend === "up"
                  ? "text-emerald-400"
                  : rsTrend === "down"
                  ? "text-rose-400"
                  : "text-muted-foreground"
              }`}
            >
              {rsTrend === "up" ? "▲ Upward" : rsTrend === "down" ? "▼ Downward" : "— Flat"}
            </span>
          </div>

          <div className="px-3 py-1.5 rounded-lg border border-cyan-500/30 bg-cyan-500/10 text-primary text-xs font-bold">
            RS Rating {rsRating}
          </div>
        </div>
      </div>

      {/* Canvas container */}
      <div ref={containerRef} className="w-full min-h-[500px] flex-1" />

      {/* Analytical Footer Note */}
      <div className="px-6 py-3 border-t border-slate-800/80 bg-slate-950/40 flex items-center justify-between text-xs text-muted-foreground">
        <div>
          <span className="font-semibold text-foreground">Minervini Rule:</span> Upward sloping RS line during index consolidation or correction is the #1 institutional accumulation footprint.
        </div>
        <div className="text-muted-foreground font-mono text-[11px]">
          {rsLine.length} points plotted
        </div>
      </div>
    </div>
  );
}
