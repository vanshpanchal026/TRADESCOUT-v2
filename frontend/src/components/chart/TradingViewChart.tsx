"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import { getAuthHeaders } from "@/lib/auth";

export interface UserDrawing {
  id: string;
  type: "horizontal_line";
  price: number;
  color: string;
  title: string;
  lineStyle?: "solid" | "dashed" | "dotted";
}

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
  const symClean = (symbol || "").toUpperCase().trim();
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const s10SeriesRef = useRef<ISeriesApi<"Line"> | null>(null);
  const s20SeriesRef = useRef<ISeriesApi<"Line"> | null>(null);
  const s50SeriesRef = useRef<ISeriesApi<"Line"> | null>(null);
  const s200SeriesRef = useRef<ISeriesApi<"Line"> | null>(null);
  const volSeriesRef = useRef<ISeriesApi<"Histogram"> | null>(null);
  const subSeriesRef = useRef<ISeriesApi<"Line"> | null>(null);
  const pivotLineRef = useRef<IPriceLine | null>(null);
  const activePriceLinesRef = useRef<Map<string, IPriceLine>>(new Map());
  const initialFittedRef = useRef<string | null>(null);

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

  // Drawings persistence state
  const [drawings, setDrawings] = useState<UserDrawing[]>([]);
  const [drawingStatus, setDrawingStatus] = useState<string | null>(null);

  // Favourites state & Global 'W' shortcut feedback
  const [isFavourite, setIsFavourite] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

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

  // Check favourite status with user auth headers
  const checkFavourite = useCallback(async () => {
    if (!symClean) return;
    try {
      const res = await fetch("/api/favourites", {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.favourites)) {
          setIsFavourite(data.favourites.includes(symClean));
        }
      }
    } catch {
      // ignore
    }
  }, [symClean]);

  // Sync favourite status on mount, symbol change, and when active user switches
  useEffect(() => {
    checkFavourite();
    const handleUserChanged = () => {
      checkFavourite();
    };
    window.addEventListener("ts-user-changed", handleUserChanged);
    return () => {
      window.removeEventListener("ts-user-changed", handleUserChanged);
    };
  }, [checkFavourite]);

  // 1. Initial Load: Chart Drawings
  useEffect(() => {
    if (!symClean) return;

    let isMounted = true;

    // Load drawings from Cloud API with local fallback
    async function loadSavedDrawings() {
      try {
        const res = await fetch(`/api/stock/${symClean}/drawings`, { headers: getAuthHeaders() });
        if (res.ok) {
          const data = await res.json();
          const list = data.drawing_data || data.drawings || [];
          if (isMounted && Array.isArray(list)) {
            setDrawings(list);
            return;
          }
        }
      } catch {
        // Fallback
      }

      try {
        const local = localStorage.getItem(`stc-drawings-${symClean}`);
        if (local && isMounted) {
          setDrawings(JSON.parse(local));
        }
      } catch {
        // ignore
      }
    }

    loadSavedDrawings();

    return () => {
      isMounted = false;
    };
  }, [symClean]);

  // 2. Main Lightweight Charts Instance Initialization (Mount / Unmount only)
  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const priceLines = activePriceLinesRef.current;
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
          bottom: 0.22,
        },
      },
      timeScale: {
        borderColor: "rgba(51, 65, 85, 0.4)",
        timeVisible: true,
        secondsVisible: false,
      },
    });

    chartRef.current = chart;

    // Candlestick Series (Pane 0)
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
    candleSeriesRef.current = candleSeries;

    // Moving Average Overlays (Pane 0)
    const s10Series = chart.addSeries(
      LineSeries,
      {
        color: "#EAB308",
        lineWidth: 1,
        priceLineVisible: false,
        lastValueVisible: false,
        title: "SMA 10",
      },
      0
    );
    s10SeriesRef.current = s10Series;

    const s20Series = chart.addSeries(
      LineSeries,
      {
        color: "#22C55E",
        lineWidth: 1,
        priceLineVisible: false,
        lastValueVisible: false,
        title: "SMA 20",
      },
      0
    );
    s20SeriesRef.current = s20Series;

    const s50Series = chart.addSeries(
      LineSeries,
      {
        color: "#3B82F6",
        lineWidth: 2,
        priceLineVisible: false,
        lastValueVisible: false,
        title: "SMA 50",
      },
      0
    );
    s50SeriesRef.current = s50Series;

    const s200Series = chart.addSeries(
      LineSeries,
      {
        color: "#EF4444",
        lineWidth: 2,
        priceLineVisible: false,
        lastValueVisible: false,
        title: "SMA 200",
      },
      0
    );
    s200SeriesRef.current = s200Series;

    // Volume Histogram (Pane 0)
    const volSeries = chart.addSeries(
      HistogramSeries,
      {
        priceFormat: { type: "volume" },
        priceScaleId: "volume_scale",
      },
      0
    );
    volSeriesRef.current = volSeries;
    chart.priceScale("volume_scale").applyOptions({
      scaleMargins: {
        top: 0.82,
        bottom: 0,
      },
    });

    // Sub-Pane: RSI / RS (Pane 1)
    const subSeries = chart.addSeries(
      LineSeries,
      {
        color: "#A855F7",
        lineWidth: 2,
        priceScaleId: "sub_scale",
        title: "RSI(14)",
      },
      1
    );
    subSeriesRef.current = subSeries;
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

    // Resize Observer for fluid responsiveness
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
      candleSeriesRef.current = null;
      s10SeriesRef.current = null;
      s20SeriesRef.current = null;
      s50SeriesRef.current = null;
      s200SeriesRef.current = null;
      volSeriesRef.current = null;
      subSeriesRef.current = null;
      pivotLineRef.current = null;
      priceLines.clear();
      initialFittedRef.current = null;
    };
  }, []);

  // 2a. Update Series Data smoothly without tearing down chart or resetting zoom
  useEffect(() => {
    if (!candleSeriesRef.current || !bars || bars.length === 0) return;

    candleSeriesRef.current.setData(bars);
    s10SeriesRef.current?.setData(sma10Data);
    s20SeriesRef.current?.setData(sma20Data);
    s50SeriesRef.current?.setData(sma50Data);
    s200SeriesRef.current?.setData(sma200Data);
    volSeriesRef.current?.setData(volumeData);

    if (subPaneMode === "rsi") {
      subSeriesRef.current?.applyOptions({ color: "#A855F7", title: "RSI(14)" });
      subSeriesRef.current?.setData(rsiData);
    } else {
      subSeriesRef.current?.applyOptions({ color: "#00E5FF", title: "RS vs NIFTY" });
      subSeriesRef.current?.setData(rsLineData);
    }

    if (initialFittedRef.current !== symClean && chartRef.current) {
      chartRef.current.timeScale().fitContent();
      initialFittedRef.current = symClean;
    }
  }, [bars, sma10Data, sma20Data, sma50Data, sma200Data, volumeData, rsiData, rsLineData, subPaneMode, symClean]);

  // 2b. Hardware-accelerated indicator visibility toggles
  useEffect(() => {
    s10SeriesRef.current?.applyOptions({ visible: showSma10 });
    s20SeriesRef.current?.applyOptions({ visible: showSma20 });
    s50SeriesRef.current?.applyOptions({ visible: showSma50 });
    s200SeriesRef.current?.applyOptions({ visible: showSma200 });
    volSeriesRef.current?.applyOptions({ visible: showVolume });
    subSeriesRef.current?.applyOptions({ visible: showSubPane });

    chartRef.current?.priceScale("right").applyOptions({
      scaleMargins: {
        top: 0.1,
        bottom: showVolume ? 0.22 : 0.05,
      },
    });
  }, [showSma10, showSma20, showSma50, showSma200, showVolume, showSubPane]);

  // 2c. Breakout Pivot Price Line
  useEffect(() => {
    if (!candleSeriesRef.current) return;
    if (pivotLineRef.current) {
      try {
        candleSeriesRef.current.removePriceLine(pivotLineRef.current);
      } catch {
        // ignore
      }
      pivotLineRef.current = null;
    }
    if (showPivot && calculatedPivot) {
      pivotLineRef.current = candleSeriesRef.current.createPriceLine({
        price: calculatedPivot,
        color: "#F59E0B",
        lineWidth: 1,
        lineStyle: LineStyle.Dashed,
        axisLabelVisible: true,
        title: `Pivot ₹${calculatedPivot}`,
      });
    }
  }, [showPivot, calculatedPivot]);

  // 2d. Saved Drawings Price Lines
  useEffect(() => {
    if (!candleSeriesRef.current) return;
    const candleSeries = candleSeriesRef.current;
    const currentLines = activePriceLinesRef.current;

    currentLines.forEach((pl) => {
      try {
        candleSeries.removePriceLine(pl);
      } catch {
        // ignore
      }
    });
    currentLines.clear();

    drawings.forEach((d) => {
      try {
        const pl = candleSeries.createPriceLine({
          price: d.price,
          color: d.color || "#00E5FF",
          lineWidth: 1,
          lineStyle: d.lineStyle === "solid" ? LineStyle.Solid : LineStyle.Dashed,
          axisLabelVisible: true,
          title: d.title || `Level ₹${d.price}`,
        });
        currentLines.set(d.id, pl);
      } catch {
        // ignore
      }
    });
  }, [drawings]);

  // 3. Persist Drawing Changes helper
  const persistDrawings = async (updatedList: UserDrawing[]) => {
    setDrawings(updatedList);
    try {
      localStorage.setItem(`stc-drawings-${symClean}`, JSON.stringify(updatedList));
    } catch {
      // ignore
    }

    setDrawingStatus("Syncing drawing...");
    try {
      const res = await fetch(`/api/stock/${symClean}/drawings`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify({ drawing_data: updatedList }),
      });
      if (res.ok) {
        setDrawingStatus("Drawings saved");
        setTimeout(() => setDrawingStatus(null), 2000);
      } else {
        setDrawingStatus("Saved in browser");
        setTimeout(() => setDrawingStatus(null), 2000);
      }
    } catch {
      setDrawingStatus("Saved in browser");
      setTimeout(() => setDrawingStatus(null), 2000);
    }
  };

  // Add horizontal level
  const handleAddDrawing = () => {
    if (!bars || bars.length === 0) return;
    const ltp = bars[bars.length - 1].close;
    const priceStr = window.prompt(`Enter price level for horizontal line (Current LTP: ₹${ltp.toFixed(2)}):`, ltp.toFixed(2));
    if (!priceStr) return;

    const price = parseFloat(priceStr);
    if (isNaN(price) || price <= 0) return;

    const label = window.prompt("Enter label (e.g. Pivot, Resistance, Key Level):", "Key Level") || "Key Level";

    const newDrawing: UserDrawing = {
      id: `draw_${Date.now()}`,
      type: "horizontal_line",
      price,
      color: "#00E5FF",
      title: `${label} ₹${price}`,
      lineStyle: "dashed",
    };

    const nextList = [...drawings, newDrawing];
    persistDrawings(nextList);
  };

  // Clear all drawings
  const handleClearDrawings = () => {
    if (drawings.length === 0) return;
    if (window.confirm("Remove all saved chart drawings for this stock?")) {
      persistDrawings([]);
    }
  };

  // 4. Toggle Favourite and 'W' key action
  const handleToggleFavourite = useCallback(async () => {
    if (!symClean) return;
    try {
      const res = await fetch(`/api/favourites/${symClean}/toggle`, {
        method: "POST",
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        setIsFavourite(data.is_favourite);
        setToastMessage(data.is_favourite ? `★ Added ${symClean} to Favourites` : `☆ Removed ${symClean} from Favourites`);
        setTimeout(() => setToastMessage(null), 2500);
      }
    } catch {
      setIsFavourite((prev) => !prev);
    }
  }, [symClean]);

  // Global 'W' Key listener
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      if (e.key === "w" || e.key === "W") {
        e.preventDefault();
        handleToggleFavourite();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleToggleFavourite]);

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
      {/* Toast notification pill */}
      {toastMessage && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-50 px-4 py-1.5 rounded-full bg-cyan-500 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/30 animate-bounce">
          {toastMessage}
        </div>
      )}

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

          <div className="h-4 w-[1px] bg-slate-800 mx-1" />

          {/* Drawing Tools */}
          <button
            onClick={handleAddDrawing}
            className="px-2.5 py-1 rounded-md transition-all border border-cyan-500/40 bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 font-medium"
            title="Add auto-saved horizontal line"
          >
            + Draw Line
          </button>
          {drawings.length > 0 && (
            <button
              onClick={handleClearDrawings}
              className="px-2 py-1 rounded-md text-[11px] border border-slate-800 bg-slate-900 text-slate-400 hover:text-rose-400"
            >
              Clear ({drawings.length})
            </button>
          )}
          {drawingStatus && (
            <span className="text-[11px] text-slate-400 font-mono italic animate-pulse">
              {drawingStatus}
            </span>
          )}
        </div>

        {/* Right: Star & Range Buttons */}
        <div className="flex items-center gap-2">
          {/* Star Shortcut (Press 'W') */}
          <button
            onClick={handleToggleFavourite}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all border ${
              isFavourite
                ? "bg-amber-500/20 border-amber-500/50 text-amber-400 shadow-sm shadow-amber-500/20"
                : "bg-slate-900 border-slate-800 text-slate-400 hover:text-amber-400"
            }`}
            title="Press 'W' to toggle favourite"
          >
            <span>{isFavourite ? "★" : "☆"}</span>
            <span>{isFavourite ? "Starred" : "Favourite"}</span>
            <kbd className="hidden sm:inline-block px-1 py-0.2 rounded bg-slate-800 text-[10px] text-slate-400">
              W
            </kbd>
          </button>

          {/* Time Range Buttons */}
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
          {drawings.length > 0 && (
            <span className="flex items-center gap-1 text-cyan-400">
              <span className="w-2.5 h-0.5 bg-cyan-400 inline-block" /> {drawings.length} Saved Drawing(s)
            </span>
          )}
        </div>
        <div className="text-slate-500">
          Hardware-accelerated HTML5 Canvas (60 FPS) · Cloud Drawings Auto-Saved
        </div>
      </div>
    </div>
  );
}
