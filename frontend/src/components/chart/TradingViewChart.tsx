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
import { cachedFetch } from "@/lib/cache";
import { useTheme } from "@/components/theme-provider";

function getChartThemeColors(isDark: boolean) {
  return {
    textColor: isDark ? "#a1a1aa" : "#475569",
    gridColor: isDark ? "rgba(39, 39, 42, 0.35)" : "rgba(226, 232, 240, 0.6)",
    crosshairColor: isDark ? "rgba(99, 102, 241, 0.75)" : "rgba(79, 70, 229, 0.75)",
    crosshairLabelBg: isDark ? "#141420" : "#0f172a",
    borderColor: isDark ? "#27272a" : "#e2e8f0",
    upColor: isDark ? "#22c55e" : "#16a34a",
    downColor: isDark ? "#ef4444" : "#dc2626",
    wickUpColor: isDark ? "#22c55e" : "#16a34a",
    wickDownColor: isDark ? "#ef4444" : "#dc2626",
    s10Color: isDark ? "#f59e0b" : "#d97706",
    s20Color: isDark ? "#10b981" : "#059669",
    e21Color: isDark ? "#06b6d4" : "#0891b2",
    s50Color: isDark ? "#3b82f6" : "#2563eb",
    s150Color: isDark ? "#a855f7" : "#7c3aed",
    s200Color: isDark ? "#f43f5e" : "#e11d48",
    rsiColor: isDark ? "#c084fc" : "#7c3aed",
    rsLineColor: isDark ? "#6366f1" : "#4f46e5",
    pivotColor: "#f59e0b",
  };
}


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
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const symClean = (symbol || "").toUpperCase().trim();
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const s10SeriesRef = useRef<ISeriesApi<"Line"> | null>(null);
  const s20SeriesRef = useRef<ISeriesApi<"Line"> | null>(null);
  const e21SeriesRef = useRef<ISeriesApi<"Line"> | null>(null);
  const s50SeriesRef = useRef<ISeriesApi<"Line"> | null>(null);
  const s150SeriesRef = useRef<ISeriesApi<"Line"> | null>(null);
  const s200SeriesRef = useRef<ISeriesApi<"Line"> | null>(null);
  const volSeriesRef = useRef<ISeriesApi<"Histogram"> | null>(null);
  const subSeriesRef = useRef<ISeriesApi<"Line"> | null>(null);
  const pivotLineRef = useRef<IPriceLine | null>(null);
  const activePriceLinesRef = useRef<Map<string, IPriceLine>>(new Map());
  const initialFittedRef = useRef<string | null>(null);

  // Indicators toggle state
  const [showSma10, setShowSma10] = useState(true);
  const [showSma20, setShowSma20] = useState(true);
  const [showEma21, setShowEma21] = useState(false);
  const [showSma50, setShowSma50] = useState(true);
  const [showSma150, setShowSma150] = useState(false);
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
  const { sma10Data, sma20Data, ema21Data, sma50Data, sma150Data, sma200Data, volumeData, rsiData, rsLineData, calculatedPivot } =
    useMemo(() => {
      if (!bars || bars.length === 0) {
        return {
          sma10Data: [],
          sma20Data: [],
          ema21Data: [],
          sma50Data: [],
          sma150Data: [],
          sma200Data: [],
          volumeData: [],
          rsiData: [],
          rsLineData: [],
          calculatedPivot: null,
        };
      }

      const s10: { time: string; value: number }[] = [];
      const s20: { time: string; value: number }[] = [];
      const e21: { time: string; value: number }[] = [];
      const s50: { time: string; value: number }[] = [];
      const s150: { time: string; value: number }[] = [];
      const s200: { time: string; value: number }[] = [];
      const vols: { time: string; value: number; color: string }[] = [];
      const rsi: { time: string; value: number }[] = [];

      const volWindow: number[] = [];
      let pivotHigh = 0;
      let currentEma21 = 0;

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

        // EMA 21
        if (i === 20) {
          let sum = 0;
          for (let k = 0; k <= 20; k++) sum += bars[k].close;
          currentEma21 = sum / 21;
          e21.push({ time: bar.time, value: +(currentEma21).toFixed(2) });
        } else if (i > 20) {
          const k = 2 / 22;
          currentEma21 = bar.close * k + currentEma21 * (1 - k);
          e21.push({ time: bar.time, value: +(currentEma21).toFixed(2) });
        }

        // SMA 50
        if (i >= 49) {
          let sum = 0;
          for (let k = i - 49; k <= i; k++) sum += bars[k].close;
          s50.push({ time: bar.time, value: +(sum / 50).toFixed(2) });
        }

        // SMA 150
        if (i >= 149) {
          let sum = 0;
          for (let k = i - 149; k <= i; k++) sum += bars[k].close;
          s150.push({ time: bar.time, value: +(sum / 150).toFixed(2) });
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

        let volColor = isDark
          ? close >= bar.open
            ? "rgba(0, 229, 255, 0.45)"
            : "rgba(100, 116, 139, 0.45)"
          : close >= bar.open
          ? "rgba(22, 163, 74, 0.45)"
          : "rgba(220, 38, 38, 0.35)";

        if (isSpike) {
          volColor = isDark
            ? close >= bar.open
              ? "#D946EF"
              : "#F43F5E"
            : close >= bar.open
            ? "#9333EA"
            : "#DC2626";
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
        ema21Data: e21,
        sma50Data: s50,
        sma150Data: s150,
        sma200Data: s200,
        volumeData: vols,
        rsiData: rsi,
        rsLineData: rsFormatted,
        calculatedPivot: pivotPrice || (pivotHigh > 0 ? +pivotHigh.toFixed(2) : null),
      };
    }, [bars, rsLine, pivotPrice, isDark]);

  // Check favourite status with user auth headers
  const checkFavourite = useCallback(async () => {
    if (!symClean) return;
    try {
      const data = await cachedFetch<{ favourites: string[] }>(
        "/api/favourites",
        { headers: getAuthHeaders() },
        15_000
      );
      if (data && Array.isArray(data.favourites)) {
        setIsFavourite(data.favourites.includes(symClean));
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
    const tc = getChartThemeColors(isDark);
    const chart = createChart(container, {
      width: container.clientWidth,
      height: container.clientHeight || 560,
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: tc.textColor,
        fontSize: 11,
        fontFamily: "'Hanken Grotesk', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      },
      grid: {
        vertLines: { color: tc.gridColor, style: LineStyle.Dotted },
        horzLines: { color: tc.gridColor, style: LineStyle.Dotted },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: {
          color: tc.crosshairColor,
          width: 1,
          style: LineStyle.Dashed,
          visible: true,
          labelVisible: true,
          labelBackgroundColor: tc.crosshairLabelBg,
        },
        horzLine: {
          color: tc.crosshairColor,
          width: 1,
          style: LineStyle.Dashed,
          visible: true,
          labelVisible: true,
          labelBackgroundColor: tc.crosshairLabelBg,
        },
      },
      rightPriceScale: {
        borderColor: tc.borderColor,
        scaleMargins: {
          top: 0.08,
          bottom: 0.22,
        },
        borderVisible: true,
        alignLabels: true,
      },
      timeScale: {
        borderColor: tc.borderColor,
        timeVisible: true,
        secondsVisible: false,
        borderVisible: true,
        rightOffset: 6,
        barSpacing: 6,
        minBarSpacing: 2,
      },
    });

    chartRef.current = chart;

    // Candlestick Series (Pane 0)
    const candleSeries = chart.addSeries(
      CandlestickSeries,
      {
        upColor: tc.upColor,
        downColor: tc.downColor,
        borderVisible: false,
        wickUpColor: tc.wickUpColor,
        wickDownColor: tc.wickDownColor,
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
        color: tc.s10Color,
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
        color: tc.s20Color,
        lineWidth: 1,
        priceLineVisible: false,
        lastValueVisible: false,
        title: "SMA 20",
      },
      0
    );
    s20SeriesRef.current = s20Series;

    const e21Series = chart.addSeries(
      LineSeries,
      {
        color: tc.e21Color,
        lineWidth: 1,
        lineStyle: LineStyle.Dotted,
        priceLineVisible: false,
        lastValueVisible: false,
        title: "EMA 21",
      },
      0
    );
    e21SeriesRef.current = e21Series;

    const s50Series = chart.addSeries(
      LineSeries,
      {
        color: tc.s50Color,
        lineWidth: 2,
        priceLineVisible: false,
        lastValueVisible: false,
        title: "SMA 50",
      },
      0
    );
    s50SeriesRef.current = s50Series;

    const s150Series = chart.addSeries(
      LineSeries,
      {
        color: tc.s150Color,
        lineWidth: 1,
        priceLineVisible: false,
        lastValueVisible: false,
        title: "SMA 150",
      },
      0
    );
    s150SeriesRef.current = s150Series;

    const s200Series = chart.addSeries(
      LineSeries,
      {
        color: tc.s200Color,
        lineWidth: 2,
        priceLineVisible: false,
        lastValueVisible: false,
        title: "SMA 200",
      },
      0
    );
    s200SeriesRef.current = s200Series;

    // Volume Histogram (Pane 0 - aligned in bottom 22% without overlapping price axis)
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
        top: 0.78,
        bottom: 0,
      },
      visible: false,
    });

    // Sub-Pane: RSI / RS (Pane 1)
    const subSeries = chart.addSeries(
      LineSeries,
      {
        color: tc.rsiColor,
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

    // Resize Observer for fluid responsiveness with requestAnimationFrame debouncing
    let rafId: number;
    const resizeObserver = new ResizeObserver((entries) => {
      if (!entries || entries.length === 0 || !entries[0].contentRect) return;
      const { width, height } = entries[0].contentRect;
      if (width > 0 && height > 0) {
        cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(() => {
          if (chartRef.current) {
            chartRef.current.applyOptions({ width, height });
          }
        });
      }
    });
    resizeObserver.observe(container);

    return () => {
      cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
      chart.remove();
      chartRef.current = null;
      candleSeriesRef.current = null;
      s10SeriesRef.current = null;
      s20SeriesRef.current = null;
      e21SeriesRef.current = null;
      s50SeriesRef.current = null;
      s150SeriesRef.current = null;
      s200SeriesRef.current = null;
      volSeriesRef.current = null;
      subSeriesRef.current = null;
      pivotLineRef.current = null;
      priceLines.clear();
      initialFittedRef.current = null;
    };
  }, []);

  // 2a. Reactively update Chart theme when theme toggles (Dark <-> Light)
  useEffect(() => {
    if (!chartRef.current) return;
    const tc = getChartThemeColors(isDark);

    chartRef.current.applyOptions({
      layout: {
        textColor: tc.textColor,
      },
      grid: {
        vertLines: { color: tc.gridColor, style: LineStyle.Dotted },
        horzLines: { color: tc.gridColor, style: LineStyle.Dotted },
      },
      crosshair: {
        vertLine: {
          color: tc.crosshairColor,
          labelBackgroundColor: tc.crosshairLabelBg,
        },
        horzLine: {
          color: tc.crosshairColor,
          labelBackgroundColor: tc.crosshairLabelBg,
        },
      },
      rightPriceScale: {
        borderColor: tc.borderColor,
      },
      timeScale: {
        borderColor: tc.borderColor,
      },
    });

    candleSeriesRef.current?.applyOptions({
      upColor: tc.upColor,
      downColor: tc.downColor,
      wickUpColor: tc.wickUpColor,
      wickDownColor: tc.wickDownColor,
    });

    s10SeriesRef.current?.applyOptions({ color: tc.s10Color });
    s20SeriesRef.current?.applyOptions({ color: tc.s20Color });
    e21SeriesRef.current?.applyOptions({ color: tc.e21Color });
    s50SeriesRef.current?.applyOptions({ color: tc.s50Color });
    s150SeriesRef.current?.applyOptions({ color: tc.s150Color });
    s200SeriesRef.current?.applyOptions({ color: tc.s200Color });

    if (subSeriesRef.current) {
      subSeriesRef.current.applyOptions({
        color: subPaneMode === "rsi" ? tc.rsiColor : tc.rsLineColor,
      });
    }

    if (volSeriesRef.current && volumeData.length > 0) {
      volSeriesRef.current.setData(volumeData);
    }
  }, [isDark, volumeData, subPaneMode]);

  // 2b. Update Series Data smoothly without tearing down chart or resetting zoom
  useEffect(() => {
    if (!candleSeriesRef.current || !bars || bars.length === 0) return;

    candleSeriesRef.current.setData(bars);
    s10SeriesRef.current?.setData(sma10Data);
    s20SeriesRef.current?.setData(sma20Data);
    e21SeriesRef.current?.setData(ema21Data);
    s50SeriesRef.current?.setData(sma50Data);
    s150SeriesRef.current?.setData(sma150Data);
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
  }, [bars, sma10Data, sma20Data, ema21Data, sma50Data, sma150Data, sma200Data, volumeData, rsiData, rsLineData, subPaneMode, symClean]);

  // 2b. Hardware-accelerated indicator visibility toggles
  useEffect(() => {
    s10SeriesRef.current?.applyOptions({ visible: showSma10 });
    s20SeriesRef.current?.applyOptions({ visible: showSma20 });
    e21SeriesRef.current?.applyOptions({ visible: showEma21 });
    s50SeriesRef.current?.applyOptions({ visible: showSma50 });
    s150SeriesRef.current?.applyOptions({ visible: showSma150 });
    s200SeriesRef.current?.applyOptions({ visible: showSma200 });
    volSeriesRef.current?.applyOptions({ visible: showVolume });
    subSeriesRef.current?.applyOptions({ visible: showSubPane });

    chartRef.current?.priceScale("right").applyOptions({
      scaleMargins: {
        top: 0.1,
        bottom: showVolume ? 0.22 : 0.05,
      },
    });
  }, [showSma10, showSma20, showEma21, showSma50, showSma150, showSma200, showVolume, showSubPane]);

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
        color: "#f59e0b",
        lineWidth: 1,
        lineStyle: LineStyle.Dashed,
        axisLabelVisible: true,
        title: `Pivot ₹${calculatedPivot.toFixed(2)}`,
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
    <div className="relative flex flex-col w-full h-full bg-card rounded-xl border border-border overflow-hidden shadow-xs backdrop-blur-md">
      {/* Toast notification pill */}
      {toastMessage && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-50 px-4 py-1.5 rounded-full bg-primary text-primary-foreground font-bold text-xs shadow-lg shadow-primary/20 animate-bounce">
          {toastMessage}
        </div>
      )}

      {/* Top Controls Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 border-b border-border bg-muted/30">
        {/* Left: Indicator Toggles */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs font-medium">
          <span className="text-muted-foreground mr-1 text-[11px] font-semibold uppercase tracking-wider select-none">
            Indicators:
          </span>
          <button
            type="button"
            onClick={() => setShowSma10(!showSma10)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all duration-150 border cursor-pointer active:scale-95 select-none ${
              showSma10
                ? "bg-amber-500/15 border-amber-500/40 text-amber-400 font-semibold shadow-xs"
                : "bg-card border-border/80 text-muted-foreground hover:text-foreground hover:bg-white/[0.03]"
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-xs shadow-amber-400/50" />
            <span>SMA 10</span>
          </button>
          <button
            type="button"
            onClick={() => setShowSma20(!showSma20)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all duration-150 border cursor-pointer active:scale-95 select-none ${
              showSma20
                ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-400 font-semibold shadow-xs"
                : "bg-card border-border/80 text-muted-foreground hover:text-foreground hover:bg-white/[0.03]"
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-xs shadow-emerald-400/50" />
            <span>SMA 20</span>
          </button>
          <button
            type="button"
            onClick={() => setShowEma21(!showEma21)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all duration-150 border cursor-pointer active:scale-95 select-none ${
              showEma21
                ? "bg-cyan-500/20 border-cyan-500/50 text-cyan-300 font-bold shadow-xs shadow-cyan-500/20 ring-1 ring-cyan-500/30"
                : "bg-card border-border/80 text-muted-foreground hover:text-foreground hover:bg-white/[0.03]"
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-xs shadow-cyan-400/60" />
            <span>EMA 21</span>
          </button>
          <button
            type="button"
            onClick={() => setShowSma50(!showSma50)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all duration-150 border cursor-pointer active:scale-95 select-none ${
              showSma50
                ? "bg-blue-500/15 border-blue-500/40 text-blue-400 font-semibold shadow-xs"
                : "bg-card border-border/80 text-muted-foreground hover:text-foreground hover:bg-white/[0.03]"
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shadow-xs shadow-blue-400/50" />
            <span>SMA 50</span>
          </button>
          <button
            type="button"
            onClick={() => setShowSma150(!showSma150)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all duration-150 border cursor-pointer active:scale-95 select-none ${
              showSma150
                ? "bg-purple-500/20 border-purple-500/50 text-purple-300 font-bold shadow-xs shadow-purple-500/20 ring-1 ring-purple-500/30"
                : "bg-card border-border/80 text-muted-foreground hover:text-foreground hover:bg-white/[0.03]"
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400 shadow-xs shadow-purple-400/60" />
            <span>SMA 150</span>
          </button>
          <button
            type="button"
            onClick={() => setShowSma200(!showSma200)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all duration-150 border cursor-pointer active:scale-95 select-none ${
              showSma200
                ? "bg-rose-500/15 border-rose-500/40 text-rose-400 font-semibold shadow-xs"
                : "bg-card border-border/80 text-muted-foreground hover:text-foreground hover:bg-white/[0.03]"
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shadow-xs shadow-rose-400/50" />
            <span>SMA 200</span>
          </button>
          <button
            type="button"
            onClick={() => setShowVolume(!showVolume)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all duration-150 border cursor-pointer active:scale-95 select-none ${
              showVolume
                ? "bg-primary/20 border-primary/50 text-primary font-bold shadow-xs shadow-primary/20"
                : "bg-card border-border/80 text-muted-foreground hover:text-foreground hover:bg-white/[0.03]"
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            <span>Volume</span>
          </button>
          {calculatedPivot && (
            <button
              type="button"
              onClick={() => setShowPivot(!showPivot)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all duration-150 border cursor-pointer active:scale-95 select-none ${
                showPivot
                  ? "bg-amber-500/20 border-amber-500/50 text-amber-400 font-bold shadow-xs shadow-amber-500/20 ring-1 ring-amber-500/30"
                  : "bg-card border-border/80 text-muted-foreground hover:text-foreground hover:bg-white/[0.03]"
              }`}
            >
              <span className="w-2.5 h-0.5 border-b border-dashed border-amber-400" />
              <span>Pivot (₹{calculatedPivot.toFixed(2)})</span>
            </button>
          )}

          <div className="h-4 w-[1px] bg-border mx-1" />

          {/* Sub-Pane Indicator Switch */}
          <button
            type="button"
            onClick={() => {
              if (!showSubPane) setShowSubPane(true);
              setSubPaneMode(subPaneMode === "rsi" ? "rs" : "rsi");
            }}
            className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all duration-150 border cursor-pointer active:scale-95 select-none ${
              showSubPane
                ? "bg-purple-500/15 border-purple-500/40 text-purple-300 font-semibold shadow-xs"
                : "bg-card border-border/80 text-muted-foreground hover:text-foreground hover:bg-white/[0.03]"
            }`}
          >
            Sub-Pane: {subPaneMode.toUpperCase()}
          </button>

          <div className="h-4 w-[1px] bg-border mx-1" />

          {/* Drawing Tools */}
          <button
            type="button"
            onClick={handleAddDrawing}
            className="px-2.5 py-1 rounded-lg transition-all border border-primary/30 bg-primary/10 text-primary hover:bg-primary/20 text-[11px] font-medium cursor-pointer"
            title="Add auto-saved horizontal level line"
          >
            + Level Line
          </button>
          {drawings.length > 0 && (
            <button
              type="button"
              onClick={handleClearDrawings}
              className="px-2 py-1 rounded-lg text-[11px] border border-border bg-card text-muted-foreground hover:text-rose-500 hover:border-rose-500/40 transition-colors cursor-pointer"
            >
              Clear ({drawings.length})
            </button>
          )}
          {drawingStatus && (
            <span className="text-[11px] text-muted-foreground font-mono italic animate-pulse">
              {drawingStatus}
            </span>
          )}
        </div>

        {/* Right: Star & Range Buttons */}
        <div className="flex items-center gap-2">
          {/* Star Shortcut (Press 'W') */}
          <button
            type="button"
            onClick={handleToggleFavourite}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all border cursor-pointer ${
              isFavourite
                ? "bg-amber-500/15 border-amber-500/40 text-amber-600 dark:text-amber-400 shadow-xs"
                : "bg-card border-border text-muted-foreground hover:text-amber-500"
            }`}
            title="Press 'W' to toggle favourite"
          >
            <span>{isFavourite ? "★" : "☆"}</span>
            <span>{isFavourite ? "Starred" : "Favourite"}</span>
            <kbd className="hidden sm:inline-block px-1 py-0.2 rounded bg-muted text-[10px] text-muted-foreground border border-border font-mono">
              W
            </kbd>
          </button>

          {/* Time Range Buttons */}
          <div className="flex items-center gap-0.5 bg-muted/60 p-0.5 rounded-lg border border-border text-xs">
            {(["1M", "3M", "6M", "1Y", "ALL"] as const).map((rng) => (
              <button
                key={rng}
                type="button"
                onClick={() => handleRangeChange(rng)}
                className={`px-2 py-1 rounded text-xs font-medium transition-all cursor-pointer ${
                  selectedRange === rng
                    ? "bg-primary text-primary-foreground font-bold shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
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
        <div className="px-2.5 py-1 rounded-full text-xs font-semibold border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 backdrop-blur-md shadow-md tabular-nums">
          RS {rsRating}
        </div>
        {bars.length > 0 && (
          <div className="px-2.5 py-1 rounded-full text-xs font-semibold border border-border bg-card/90 text-foreground backdrop-blur-md shadow-xs tabular-nums">
            LTP: ₹{bars[bars.length - 1].close.toFixed(2)}
          </div>
        )}
      </div>

      {/* Canvas Mount Container */}
      <div ref={containerRef} className="flex-1 w-full min-h-[560px] lg:min-h-[640px]" />

      {/* High Volume Spikes Legend */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 border-t border-border bg-muted/30 text-[11px] text-muted-foreground">
        <div className="flex flex-wrap items-center gap-3">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-emerald-500 inline-block shadow-xs shadow-emerald-500/20" /> Bullish Candle
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-rose-500 inline-block shadow-xs shadow-rose-500/20" /> Bearish Candle
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-fuchsia-500 inline-block shadow-xs shadow-fuchsia-500/20" /> Volume Spike (&gt;2.0× 50D)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-amber-500 inline-block border-b border-dashed border-amber-400" /> Pivot Line
          </span>
          {drawings.length > 0 && (
            <span className="flex items-center gap-1.5 text-primary font-medium">
              <span className="w-2.5 h-0.5 bg-emerald-500 inline-block" /> {drawings.length} Saved Level(s)
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 text-[10px] text-muted-foreground/80 font-mono">
          <span>Educational research platform · Real-time OHLCV</span>
        </div>
      </div>
    </div>
  );
}
