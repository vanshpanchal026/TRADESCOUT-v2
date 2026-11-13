"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  CandlestickSeries,
  ColorType,
  CrosshairMode,
  HistogramSeries,
  LineSeries,
  LineStyle,
  createChart,
  type IChartApi,
  type IPriceLine,
  type ISeriesApi,
} from "lightweight-charts";
import { OHLCVBar, RSLinePoint } from "@/lib/types";

interface TradingViewChartProps {
  symbol: string;
  bars: OHLCVBar[];
  rsLine?: RSLinePoint[];
  stage?: number;
  stageName?: string;
  rsRating?: number;
  pivotPrice?: number | null;
}

export default function TradingViewChart({
  symbol,
  bars,
  rsLine = [],
  stage = 2,
  stageName = "Stage 2 (Markup)",
  rsRating = 88,
  pivotPrice = null,
}: TradingViewChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);

  // Indicators toggle state
  const [showSma10, setShowSma10] = useState(true);
  const [showSma20, setShowSma20] = useState(true);
  const [showSma50, setShowSma50] = useState(true);
  const [showSma200, setShowSma200] = useState(true);
  const [showVolume, setShowVolume] = useState(true);
  const [showSubPane, setShowSubPane] = useState(true);
  const [subPaneMode, setSubPaneMode] = useState<"rsi" | "rs">("rsi");
  const [showPivot, setShowPivot] = useState(true);

  // Time range selector
  const [selectedRange, setSelectedRange] = useState<"1M" | "3M" | "6M" | "1Y" | "ALL">("1Y");

  // Pre-calculate technical indicator series
  const { sma10Data, sma20Data, sma50Data, sma200Data, volumeData, rsiData, rsLineData, calculatedPivot } =
    useMemo(() => {
      if (!bars || bars.length === 0) {
        return {
          sma10Data: [],
          sma20Data: [],
          sma50Data: [],
          sma200Data: [],
          volumeData: [],
          rsiData: [],
          rsLineData: [],
          calculatedPivot: null,
        };
      }

      const s10: { time: string; value: number }[] = [];
      const s20: { time: string; value: number }[] = [];
      const s50: { time: string; value: number }[] = [];
      const s200: { time: string; value: number }[] = [];
      const vols: { time: string; value: number; color: string }[] = [];
      const rsi: { time: string; value: number }[] = [];

      // 50-day moving average of volume for spike detection
      const volWindow: number[] = [];
      let pivotHigh = 0;

      for (let i = 0; i < bars.length; i++) {
        const bar = bars[i];
        const close = bar.close;

        // Track 52W / recent pivot high
        if (i >= bars.length - 120 && bar.high > pivotHigh) {
          pivotHigh = bar.high;
        }

        // SMA 10
        if (i >= 9) {
          let sum = 0;
          for (let k = i - 9; k <= i; k++) sum += bars[k].close;
          s10.push({ time: bar.time, value: +(sum / 10).toFixed(2) });
        }

        // SMA 20
        if (i >= 19) {
          let sum = 0;
          for (let k = i - 19; k <= i; k++) sum += bars[k].close;
          s20.push({ time: bar.time, value: +(sum / 20).toFixed(2) });
        }

        // SMA 50
        if (i >= 49) {
          let sum = 0;
          for (let k = i - 49; k <= i; k++) sum += bars[k].close;
          s50.push({ time: bar.time, value: +(sum / 50).toFixed(2) });
        }

        // SMA 200
        if (i >= 199) {
          let sum = 0;
          for (let k = i - 199; k <= i; k++) sum += bars[k].close;
          s200.push({ time: bar.time, value: +(sum / 200).toFixed(2) });
        }

        // Volume Spikes detection (> 2.0x 50D avg)
        volWindow.push(bar.volume);
        if (volWindow.length > 50) volWindow.shift();
        const avgVol = volWindow.reduce((a, b) => a + b, 0) / volWindow.length;
        const isSpike = avgVol > 0 && bar.volume >= 2.0 * avgVol;

        // Bullish cyan / Bearish slate, high volume spike purple/magenta
        let volColor = close >= bar.open ? "rgba(0, 229, 255, 0.45)" : "rgba(100, 116, 139, 0.45)";
        if (isSpike) {
          volColor = close >= bar.open ? "#D946EF" : "#F43F5E";
        }
        vols.push({ time: bar.time, value: bar.volume, color: volColor });

        // Wilder RSI (14)
        if (i >= 14) {
          let gains = 0;
          let losses = 0;
          for (let k = i - 13; k <= i; k++) {
            const diff = bars[k].close - bars[k - 1].close;
            if (diff >= 0) gains += diff;
            else losses += Math.abs(diff);
          }
          const avgGain = gains / 14;
          const avgLoss = losses / 14;
          const rsVal = avgGain / (avgLoss || 0.001);
          const rsiVal = +(100 - 100 / (1 + rsVal)).toFixed(1);
          rsi.push({ time: bar.time, value: rsiVal });
        }
      }

      const rsFormatted = rsLine.map((p) => ({
        time: p.time || p.date || "",
        value: p.value,
      }));

      return {
        sma10Data: s10,
        sma20Data: s20,
        sma50Data: s50,
        sma200Data: s200,
        volumeData: vols,
        rsiData: rsi,
        rsLineData: rsFormatted,
        calculatedPivot: pivotPrice || (pivotHigh > 0 ? +pivotHigh.toFixed(2) : null),
      };
    }, [bars, rsLine, pivotPrice]);

  useEffect(() => {
    if (!containerRef.current || !bars || bars.length === 0) return;

    // 1. Initialize Canvas Chart
    const container = containerRef.current;
    const chart = createChart(container, {
      width: container.clientWidth,
      height: container.clientHeight || 560,
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: "#94A3B8",
        fontSize: 12,
        fontFamily: "'Hanken Grotesk', system-ui, sans-serif",
      },
      grid: {
        vertLines: { color: "rgba(51, 65, 85, 0.25)", style: LineStyle.Dotted },
        horzLines: { color: "rgba(51, 65, 85, 0.25)", style: LineStyle.Dotted },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: {
          color: "#00E5FF",
          width: 1,
          style: LineStyle.Dashed,
          labelBackgroundColor: "#0F172A",
        },
        horzLine: {
          color: "#00E5FF",
          width: 1,
          style: LineStyle.Dashed,
          labelBackgroundColor: "#0F172A",
        },
      },
      rightPriceScale: {
        borderColor: "rgba(51, 65, 85, 0.4)",
        scaleMargins: {
          top: 0.1,
          bottom: showVolume ? 0.22 : 0.05,
        },
      },
      timeScale: {
        borderColor: "rgba(51, 65, 85, 0.4)",
        timeVisible: true,
        secondsVisible: false,
      },
    });

    chartRef.current = chart;

    // 2. Candlestick Series (Bullish Cyan #00E5FF, Bearish Slate #64748B)
    const candleSeries = chart.addSeries(
      CandlestickSeries,
      {
        upColor: "#00E5FF",
        downColor: "#64748B",
        borderVisible: false,
        wickUpColor: "#00E5FF",
        wickDownColor: "#64748B",
        priceLineVisible: true,
        lastValueVisible: true,
      },
      0
    );
    candleSeries.setData(bars);

    // 3. Breakout Pivot Dashed Line
    let pivotLine: IPriceLine | null = null;
    if (showPivot && calculatedPivot) {
      pivotLine = candleSeries.createPriceLine({
        price: calculatedPivot,
        color: "#F59E0B",
        lineWidth: 1,
        lineStyle: LineStyle.Dashed,
        axisLabelVisible: true,
        title: `Pivot ₹${calculatedPivot}`,
      });
    }

    // 4. Moving Average Overlays (in pane 0)
    let s10Series: ISeriesApi<"Line"> | null = null;
    if (showSma10 && sma10Data.length > 0) {
      s10Series = chart.addSeries(
        LineSeries,
        {
          color: "#EAB308", // Yellow
          lineWidth: 1,
          priceLineVisible: false,
          lastValueVisible: false,
          title: "SMA 10",
        },
        0
      );
      s10Series.setData(sma10Data);
    }

    let s20Series: ISeriesApi<"Line"> | null = null;
    if (showSma20 && sma20Data.length > 0) {
      s20Series = chart.addSeries(
        LineSeries,
        {
          color: "#22C55E", // Green
          lineWidth: 1,
          priceLineVisible: false,
          lastValueVisible: false,
          title: "SMA 20",
        },
        0
      );
      s20Series.setData(sma20Data);
    }

    let s50Series: ISeriesApi<"Line"> | null = null;
    if (showSma50 && sma50Data.length > 0) {
      s50Series = chart.addSeries(
        LineSeries,
        {
          color: "#3B82F6", // Blue
          lineWidth: 2,
          priceLineVisible: false,
          lastValueVisible: false,
          title: "SMA 50",
        },
        0
      );
      s50Series.setData(sma50Data);
    }

    let s200Series: ISeriesApi<"Line"> | null = null;
    if (showSma200 && sma200Data.length > 0) {
      s200Series = chart.addSeries(
        LineSeries,
        {
          color: "#EF4444", // Red
          lineWidth: 2,
          priceLineVisible: false,
          lastValueVisible: false,
          title: "SMA 200",
        },
        0
      );
      s200Series.setData(sma200Data);
    }

    // 5. Volume Histogram Sub-Overlay (at bottom of pane 0)
    let volSeries: ISeriesApi<"Histogram"> | null = null;
    if (showVolume && volumeData.length > 0) {
      volSeries = chart.addSeries(
        HistogramSeries,
        {
          priceFormat: { type: "volume" },
          priceScaleId: "volume_scale",
        },
        0
      );
      volSeries.setData(volumeData);
      chart.priceScale("volume_scale").applyOptions({
        scaleMargins: {
          top: 0.82,
          bottom: 0,
        },
      });
    }

    // 6. Sub-Pane: RSI (14) or IBD Relative Strength Line in pane 1
    let subSeries: ISeriesApi<"Line"> | null = null;
    if (showSubPane) {
      if (subPaneMode === "rsi" && rsiData.length > 0) {
        subSeries = chart.addSeries(
          LineSeries,
          {
            color: "#A855F7",
            lineWidth: 2,
            priceScaleId: "sub_scale",
            title: "RSI(14)",
          },
          1
        );
        subSeries.setData(rsiData);
        subSeries.createPriceLine({
          price: 70,
          color: "rgba(239, 68, 68, 0.7)",
          lineWidth: 1,
          lineStyle: LineStyle.Dotted,
          axisLabelVisible: true,
          title: "70",
        });
        subSeries.createPriceLine({
          price: 30,
          color: "rgba(16, 185, 129, 0.7)",
          lineWidth: 1,
          lineStyle: LineStyle.Dotted,
          axisLabelVisible: true,
          title: "30",
        });
      } else if (subPaneMode === "rs" && rsLineData.length > 0) {
        subSeries = chart.addSeries(
          LineSeries,
          {
            color: "#00E5FF",
            lineWidth: 2,
            priceScaleId: "sub_scale",
            title: "RS vs NIFTY",
          },
          1
        );
        subSeries.setData(rsLineData);
        subSeries.createPriceLine({
          price: 100,
          color: "rgba(148, 163, 184, 0.5)",
          lineWidth: 1,
          lineStyle: LineStyle.Dotted,
          axisLabelVisible: true,
          title: "100.0 Base",
        });
      }
    }

    // Fit content
    chart.timeScale().fitContent();

    // 7. Auto-Resize Observer
    const resizeObserver = new ResizeObserver((entries) => {
      if (!entries || entries.length === 0 || !entries[0].contentRect) return;
      const { width, height } = entries[0].contentRect;
      if (width > 0 && height > 0) {
        chart.applyOptions({ width, height });
      }
    });

    resizeObserver.observe(container);

    // 8. Strict Cleanup (Prevent Canvas Memory Leaks)
    return () => {
      resizeObserver.disconnect();
      if (pivotLine && candleSeries) {
        candleSeries.removePriceLine(pivotLine);
      }
      chart.remove();
      chartRef.current = null;
    };
  }, [
    bars,
    sma10Data,
    sma20Data,
    sma50Data,
    sma200Data,
    volumeData,
    rsiData,
    rsLineData,
    showSma10,
    showSma20,
    showSma50,
    showSma200,
    showVolume,
    showSubPane,
    subPaneMode,
    showPivot,
    calculatedPivot,
  ]);

  // Handle Range Selection
  const handleRangeChange = (range: "1M" | "3M" | "6M" | "1Y" | "ALL") => {
    setSelectedRange(range);
    if (!chartRef.current || !bars || bars.length === 0) return;

    if (range === "ALL") {
      chartRef.current.timeScale().fitContent();
      return;
    }

    const rangeDaysMap = {
      "1M": 22,
      "3M": 65,
      "6M": 130,
      "1Y": 252,
    };

    const count = rangeDaysMap[range];
    const startIndex = Math.max(0, bars.length - count);
    const fromTime = bars[startIndex].time;
    const toTime = bars[bars.length - 1].time;

    chartRef.current.timeScale().setVisibleRange({
      from: fromTime,
      to: toTime,
    });
  };

  const getStageColor = (st: number) => {
    switch (st) {
      case 2:
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
      case 4:
        return "bg-rose-500/10 text-rose-400 border-rose-500/30";
      case 1:
        return "bg-amber-500/10 text-amber-400 border-amber-500/30";
      default:
        return "bg-slate-500/10 text-slate-400 border-slate-500/30";
    }
  };

  return (
    <div className="relative flex flex-col w-full h-full bg-slate-900/60 rounded-xl border border-slate-800/80 overflow-hidden backdrop-blur-md">
      {/* Top Controls Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-b border-slate-800 bg-slate-950/40">
        {/* Left: Indicator Toggles */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs font-medium">
          <span className="text-slate-500 mr-1 select-none">Overlays:</span>
          <button
            onClick={() => setShowSma10(!showSma10)}
            className={`px-2.5 py-1 rounded-md transition-all border ${
              showSma10
                ? "bg-yellow-500/15 border-yellow-500/50 text-yellow-400 font-semibold shadow-sm shadow-yellow-500/20"
                : "bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-400"
            }`}
          >
            SMA 10
          </button>
          <button
            onClick={() => setShowSma20(!showSma20)}
            className={`px-2.5 py-1 rounded-md transition-all border ${
              showSma20
                ? "bg-green-500/15 border-green-500/50 text-green-400 font-semibold shadow-sm shadow-green-500/20"
                : "bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-400"
            }`}
          >
            SMA 20
          </button>
          <button
            onClick={() => setShowSma50(!showSma50)}
            className={`px-2.5 py-1 rounded-md transition-all border ${
              showSma50
                ? "bg-blue-500/15 border-blue-500/50 text-blue-400 font-semibold shadow-sm shadow-blue-500/20"
                : "bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-400"
            }`}
          >
            SMA 50
          </button>
          <button
            onClick={() => setShowSma200(!showSma200)}
            className={`px-2.5 py-1 rounded-md transition-all border ${
              showSma200
                ? "bg-rose-500/15 border-rose-500/50 text-rose-400 font-semibold shadow-sm shadow-rose-500/20"
                : "bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-400"
            }`}
          >
            SMA 200
          </button>
          <button
            onClick={() => setShowVolume(!showVolume)}
            className={`px-2.5 py-1 rounded-md transition-all border ${
              showVolume
                ? "bg-cyan-500/15 border-cyan-500/50 text-cyan-400 font-semibold"
                : "bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-400"
            }`}
          >
            Volume
          </button>
          {calculatedPivot && (
            <button
              onClick={() => setShowPivot(!showPivot)}
              className={`px-2.5 py-1 rounded-md transition-all border ${
                showPivot
                  ? "bg-amber-500/15 border-amber-500/50 text-amber-400 font-semibold"
                  : "bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-400"
              }`}
            >
              Pivot (₹{calculatedPivot})
            </button>
          )}

          <div className="h-4 w-[1px] bg-slate-800 mx-1" />

          {/* Sub-Pane Indicator Switch */}
          <button
            onClick={() => {
              if (!showSubPane) setShowSubPane(true);
              setSubPaneMode(subPaneMode === "rsi" ? "rs" : "rsi");
            }}
            className={`px-2.5 py-1 rounded-md transition-all border ${
              showSubPane
                ? "bg-purple-500/15 border-purple-500/50 text-purple-300 font-semibold"
                : "bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-400"
            }`}
          >
            Sub-Pane: {subPaneMode.toUpperCase()}
          </button>
        </div>

        {/* Right: Time Range Buttons */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
          {(["1M", "3M", "6M", "1Y", "ALL"] as const).map((rng) => (
            <button
              key={rng}
              onClick={() => handleRangeChange(rng)}
              className={`px-2.5 py-1 rounded font-medium transition-all ${
                selectedRange === rng
                  ? "bg-cyan-500 text-slate-950 font-bold shadow"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {rng}
            </button>
          ))}
        </div>
      </div>

      {/* Weinstein Stage & Setup Floating Header Banner */}
      <div className="absolute top-16 left-4 z-10 flex flex-wrap items-center gap-2 pointer-events-none">
        <div
          className={`px-2.5 py-1 rounded-full text-xs font-semibold border backdrop-blur-md shadow-md ${getStageColor(
            stage
          )}`}
        >
          {stageName}
        </div>
        <div className="px-2.5 py-1 rounded-full text-xs font-semibold border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 backdrop-blur-md shadow-md">
          RS {rsRating}
        </div>
        {bars.length > 0 && (
          <div className="px-2.5 py-1 rounded-full text-xs font-medium border border-slate-700/60 bg-slate-950/70 text-slate-300 backdrop-blur-md">
            LTP: ₹{bars[bars.length - 1].close.toFixed(2)}
          </div>
        )}
      </div>

      {/* Canvas Mount Container */}
      <div ref={containerRef} className="flex-1 w-full min-h-[520px]" />

      {/* High Volume Spikes Legend */}
      <div className="flex items-center justify-between px-4 py-2 border-t border-slate-800/80 bg-slate-950/40 text-[11px] text-slate-500">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-sm bg-cyan-400 inline-block" /> Bullish Candle
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-sm bg-slate-500 inline-block" /> Bearish Candle
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-sm bg-fuchsia-500 inline-block" /> High-Vol Spike (&gt;2.0× 50D)
          </span>
        </div>
        <div className="text-slate-500">
          Hardware-accelerated HTML5 Canvas (60 FPS) · {bars.length} sessions
        </div>
      </div>
    </div>
  );
}
