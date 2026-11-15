"use client";

import React, { useMemo, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { HeatmapSector, HeatmapStock } from "./types";

interface HeatmapTreemapProps {
  sectors: HeatmapSector[];
  totalMarketCap: number;
}

interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface PlacedStock {
  stock: HeatmapStock;
  sectorName: string;
  rect: Rect;
}

interface PlacedSector {
  sector: HeatmapSector;
  rect: Rect;
  placedStocks: PlacedStock[];
}

/**
 * Recursive rectangular subdivision algorithm producing aspect-ratio optimized tiles.
 */
function layoutRectangles<T extends { weight: number }>(
  items: T[],
  x: number,
  y: number,
  w: number,
  h: number
): { item: T; rect: Rect }[] {
  if (items.length === 0) return [];
  if (items.length === 1) {
    return [{ item: items[0], rect: { x, y, w, h } }];
  }

  const totalWeight = items.reduce((sum, it) => sum + Math.max(it.weight, 0.001), 0);
  let accumulated = 0;
  let splitIndex = 0;
  const halfWeight = totalWeight / 2;

  for (let i = 0; i < items.length - 1; i++) {
    accumulated += Math.max(items[i].weight, 0.001);
    if (accumulated >= halfWeight) {
      splitIndex = i + 1;
      break;
    }
  }
  if (splitIndex === 0) splitIndex = 1;

  const groupA = items.slice(0, splitIndex);
  const groupB = items.slice(splitIndex);

  const weightA = groupA.reduce((sum, it) => sum + Math.max(it.weight, 0.001), 0);
  const ratioA = weightA / totalWeight;

  if (w >= h) {
    // Split vertically
    const wA = w * ratioA;
    const wB = w - wA;
    const resA = layoutRectangles(groupA, x, y, wA, h);
    const resB = layoutRectangles(groupB, x + wA, y, wB, h);
    return [...resA, ...resB];
  } else {
    // Split horizontally
    const hA = h * ratioA;
    const hB = h - hA;
    const resA = layoutRectangles(groupA, x, y, w, hA);
    const resB = layoutRectangles(groupB, x, y + hA, w, hB);
    return [...resA, ...resB];
  }
}

/**
 * Formats market cap compactly for tile display.
 */
function formatTileMcap(mcap: number): string {
  if (mcap >= 100000) {
    return `₹${(mcap / 100000).toFixed(1)}L Cr`;
  }
  return `₹${Math.round(mcap).toLocaleString()} Cr`;
}

export function HeatmapTreemap({ sectors }: HeatmapTreemapProps) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);

  const [hoveredStock, setHoveredStock] = useState<{
    stock: HeatmapStock;
    sectorName: string;
    clientX: number;
    clientY: number;
  } | null>(null);

  // Virtual canvas dimensions
  const viewWidth = 1000;
  const viewHeight = 620;

  // Compute Layout for Sectors and Nested Stocks
  const placedSectors: PlacedSector[] = useMemo(() => {
    if (sectors.length === 0) return [];

    const sectorWeights = sectors.map((s) => ({
      sector: s,
      weight: Math.max(s.market_cap, 1.0),
    }));

    // Partition view into sector containers
    const sectorLayout = layoutRectangles(sectorWeights, 0, 0, viewWidth, viewHeight);

    return sectorLayout.map(({ item, rect }) => {
      const sec = item.sector;
      const headerHeight = Math.min(22, rect.h * 0.18);
      const innerX = rect.x + 2;
      const innerY = rect.y + headerHeight + 1;
      const innerW = Math.max(0, rect.w - 4);
      const innerH = Math.max(0, rect.h - headerHeight - 3);

      const stockWeights = sec.stocks.map((stk) => ({
        stock: stk,
        weight: Math.max(stk.market_cap, 1.0),
      }));

      const stockLayout = layoutRectangles(stockWeights, innerX, innerY, innerW, innerH);

      const placedStocks: PlacedStock[] = stockLayout.map((stkLayout) => ({
        stock: stkLayout.item.stock,
        sectorName: sec.name,
        rect: stkLayout.rect,
      }));

      return {
        sector: sec,
        rect,
        placedStocks,
      };
    });
  }, [sectors]);

  // Vibrant green-to-red performance color gradient
  const getChangeBg = (change: number): string => {
    if (change >= 3.0) return "#22c55e"; // Vibrant Emerald Green (+3% and up)
    if (change >= 2.0) return "#16a34a"; // Rich Green (+2% to +3%)
    if (change >= 1.0) return "#15803d"; // Medium Green (+1% to +2%)
    if (change >= 0.25) return "#166534"; // Deep Forest Green (+0.25% to +1%)
    if (change > -0.25) return "#27272a"; // Neutral Flat (~0.0%)
    if (change > -1.0) return "#7f1d1d"; // Deep Crimson (-0.25% to -1%)
    if (change > -2.0) return "#991b1b"; // Medium Red (-1% to -2%)
    if (change > -3.0) return "#dc2626"; // Strong Red (-2% to -3%)
    return "#ef4444"; // Vibrant Bright Red (-3% and lower)
  };

  const getTextColor = (change: number): string => {
    // Ultra high-contrast dark text on bright vibrant green, crisp white elsewhere
    if (change >= 3.0) return "#0a0a0f";
    return "#ffffff";
  };

  const handlePointer = (
    e: React.MouseEvent<SVGElement>,
    stock: HeatmapStock,
    sectorName: string
  ) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setHoveredStock({
      stock,
      sectorName,
      clientX: e.clientX - rect.left,
      clientY: e.clientY - rect.top,
    });
  };

  // Safe tooltip placement within container bounds
  const tooltipStyle = useMemo(() => {
    if (!hoveredStock || !containerRef.current) return { display: "none" };
    const containerWidth = containerRef.current.clientWidth || viewWidth;
    const containerHeight = containerRef.current.clientHeight || viewHeight;

    const tooltipWidth = 260;
    const tooltipHeight = 190;

    let left = hoveredStock.clientX + 16;
    if (left + tooltipWidth > containerWidth - 10) {
      left = Math.max(10, hoveredStock.clientX - tooltipWidth - 16);
    }

    let top = hoveredStock.clientY - 90;
    if (top < 10) {
      top = 10;
    } else if (top + tooltipHeight > containerHeight - 10) {
      top = Math.max(10, containerHeight - tooltipHeight - 10);
    }

    return {
      left: `${left}px`,
      top: `${top}px`,
    };
  }, [hoveredStock]);

  return (
    <div
      ref={containerRef}
      className="relative w-full rounded-2xl border border-border bg-card p-3 sm:p-4 shadow-sm overflow-hidden select-none"
    >
      {/* SVG Treemap Canvas with Responsive ViewBox */}
      <svg
        viewBox={`0 0 ${viewWidth} ${viewHeight}`}
        className="w-full h-auto max-h-[660px] font-sans rounded-xl overflow-hidden bg-background"
        onMouseLeave={() => setHoveredStock(null)}
      >
        {placedSectors.map(({ sector, rect, placedStocks }) => {
          const isLargeSector = rect.w > 60 && rect.h > 40;

          return (
            <g key={sector.name}>
              {/* Sector Outer Boundary Container */}
              <rect
                x={rect.x}
                y={rect.y}
                width={rect.w}
                height={rect.h}
                fill="#141420"
                stroke="#27272a"
                strokeWidth="1.5"
                rx="4"
              />

              {/* Sector Header Label Ribbon */}
              {isLargeSector && (
                <g>
                  <rect
                    x={rect.x}
                    y={rect.y}
                    width={rect.w}
                    height={Math.min(20, rect.h * 0.2)}
                    fill="#181825"
                    opacity="0.95"
                  />
                  <text
                    x={rect.x + 6}
                    y={rect.y + 13}
                    className="text-[10px] font-bold uppercase tracking-wider fill-muted-foreground truncate"
                    style={{ maxWidth: rect.w - 12 }}
                  >
                    {sector.name} ({sector.weight_pct}%)
                  </text>
                  <text
                    x={rect.x + rect.w - 6}
                    y={rect.y + 13}
                    textAnchor="end"
                    className={`text-[10px] font-mono font-bold tabular-nums ${
                      sector.change_1d >= 0 ? "fill-bull" : "fill-bear"
                    }`}
                    style={{ fontVariantNumeric: "tabular-nums" }}
                  >
                    {sector.change_1d >= 0 ? "+" : ""}
                    {sector.change_1d}%
                  </text>
                </g>
              )}

              {/* Nested Stock Boxes */}
              {placedStocks.map(({ stock, sectorName, rect: sRect }) => {
                const canShowSymbol = sRect.w >= 26 && sRect.h >= 18;
                const canShowChange = sRect.w >= 36 && sRect.h >= 30;
                const canShowPrice = sRect.w >= 54 && sRect.h >= 46;
                const canShowMcap = sRect.w >= 72 && sRect.h >= 62;

                const bg = getChangeBg(stock.change_1d);
                const textColor = getTextColor(stock.change_1d);
                const hasDarkText = textColor === "#0a0a0f";

                // Dynamic type scaling based on tile dimension
                const isHeroTile = sRect.w >= 100 && sRect.h >= 75;
                const isMidTile = sRect.w >= 65 && sRect.h >= 50;

                const symbolFontSize = isHeroTile ? 13 : isMidTile ? 11 : 9.5;
                const changeFontSize = isHeroTile ? 11 : isMidTile ? 9.5 : 8.5;

                // Vertical baseline calculation based on number of visible lines
                const centerY = sRect.y + sRect.h / 2;
                let symbolY = centerY + 3;
                let changeY = centerY + 14;
                let priceY = centerY + 24;
                let mcapY = centerY + 34;

                if (canShowMcap) {
                  symbolY = centerY - 14;
                  changeY = centerY - 1;
                  priceY = centerY + 11;
                  mcapY = centerY + 22;
                } else if (canShowPrice) {
                  symbolY = centerY - 9;
                  changeY = centerY + 3;
                  priceY = centerY + 15;
                } else if (canShowChange) {
                  symbolY = centerY - 4;
                  changeY = centerY + 8;
                }

                return (
                  <g
                    key={stock.symbol}
                    className="cursor-pointer group"
                    onClick={() => router.push(`/stock/${stock.symbol}`)}
                    onMouseEnter={(e) => handlePointer(e, stock, sectorName)}
                    onMouseMove={(e) => handlePointer(e, stock, sectorName)}
                  >
                    {/* Stock Tile Box with clean border-[#141420] */}
                    <rect
                      x={sRect.x + 0.5}
                      y={sRect.y + 0.5}
                      width={Math.max(0, sRect.w - 1)}
                      height={Math.max(0, sRect.h - 1)}
                      fill={bg}
                      stroke="#141420"
                      strokeWidth="1.5"
                      rx="3"
                      className="transition-all duration-150 hover:brightness-110 hover:stroke-foreground/60"
                    />

                    {/* Stock Symbol Label */}
                    {canShowSymbol && (
                      <text
                        x={sRect.x + sRect.w / 2}
                        y={symbolY}
                        textAnchor="middle"
                        fill={textColor}
                        fontSize={symbolFontSize}
                        className="font-mono font-bold tracking-tight select-none"
                        style={{
                          textShadow: hasDarkText
                            ? "none"
                            : "0 1px 2px rgba(0,0,0,0.7)",
                        }}
                      >
                        {stock.symbol}
                      </text>
                    )}

                    {/* Stock 1D Change % with tabular-nums */}
                    {canShowChange && (
                      <text
                        x={sRect.x + sRect.w / 2}
                        y={changeY}
                        textAnchor="middle"
                        fill={textColor}
                        fontSize={changeFontSize}
                        className="font-mono font-semibold tabular-nums opacity-95 select-none"
                        style={{
                          fontVariantNumeric: "tabular-nums",
                          textShadow: hasDarkText
                            ? "none"
                            : "0 1px 2px rgba(0,0,0,0.7)",
                        }}
                      >
                        {stock.change_1d >= 0 ? "+" : ""}
                        {stock.change_1d.toFixed(2)}%
                      </text>
                    )}

                    {/* Stock Price (CMP) with tabular-nums */}
                    {canShowPrice && (
                      <text
                        x={sRect.x + sRect.w / 2}
                        y={priceY}
                        textAnchor="middle"
                        fill={textColor}
                        fontSize={8.5}
                        className="font-mono tabular-nums opacity-85 select-none"
                        style={{
                          fontVariantNumeric: "tabular-nums",
                          textShadow: hasDarkText ? "none" : "0 1px 2px rgba(0,0,0,0.7)",
                        }}
                      >
                        ₹{stock.cmp.toLocaleString()}
                      </text>
                    )}

                    {/* Stock Market Cap with tabular-nums (for hero tiles) */}
                    {canShowMcap && (
                      <text
                        x={sRect.x + sRect.w / 2}
                        y={mcapY}
                        textAnchor="middle"
                        fill={textColor}
                        fontSize={7.5}
                        className="font-mono tabular-nums opacity-75 select-none"
                        style={{
                          fontVariantNumeric: "tabular-nums",
                          textShadow: hasDarkText ? "none" : "0 1px 2px rgba(0,0,0,0.7)",
                        }}
                      >
                        {formatTileMcap(stock.market_cap)}
                      </text>
                    )}
                  </g>
                );
              })}
            </g>
          );
        })}
      </svg>

      {/* Floating Hover Tooltip with Institutional Card Styling */}
      {hoveredStock && (
        <div
          className="pointer-events-none absolute z-30 w-64 rounded-xl border border-border bg-[#1c1c2e]/95 p-3.5 shadow-2xl backdrop-blur-md text-xs space-y-2.5 transition-all duration-75"
          style={tooltipStyle}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border/60 pb-2">
            <div className="min-w-0 pr-2">
              <div className="font-bold text-sm text-foreground font-mono flex items-center gap-1.5">
                <span>{hoveredStock.stock.symbol}</span>
              </div>
              <div className="text-[11px] text-muted-foreground truncate max-w-[150px]">
                {hoveredStock.stock.name}
              </div>
            </div>
            <span
              className={`text-xs font-mono font-bold px-2 py-0.5 rounded-full border tabular-nums shrink-0 ${
                hoveredStock.stock.change_1d >= 0
                  ? "bg-bull/10 border-bull/30 text-bull"
                  : "bg-bear/10 border-bear/30 text-bear"
              }`}
              style={{ fontVariantNumeric: "tabular-nums" }}
            >
              {hoveredStock.stock.change_1d >= 0 ? "+" : ""}
              {hoveredStock.stock.change_1d.toFixed(2)}%
            </span>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
            <div>
              <span className="text-muted-foreground text-[10px] block font-sans">Sector</span>
              <strong className="text-foreground truncate block font-sans">
                {hoveredStock.sectorName}
              </strong>
            </div>
            <div>
              <span className="text-muted-foreground text-[10px] block font-sans">CMP</span>
              <strong className="text-foreground tabular-nums" style={{ fontVariantNumeric: "tabular-nums" }}>
                ₹{hoveredStock.stock.cmp.toLocaleString()}
              </strong>
            </div>
            <div>
              <span className="text-muted-foreground text-[10px] block font-sans">Market Cap</span>
              <strong className="text-foreground tabular-nums" style={{ fontVariantNumeric: "tabular-nums" }}>
                ₹{hoveredStock.stock.market_cap.toLocaleString()} Cr
              </strong>
            </div>
            <div>
              <span className="text-muted-foreground text-[10px] block font-sans">Index Weight</span>
              <strong className="text-foreground tabular-nums" style={{ fontVariantNumeric: "tabular-nums" }}>
                {hoveredStock.stock.weight_pct}%
              </strong>
            </div>
            <div>
              <span className="text-muted-foreground text-[10px] block font-sans">Volume</span>
              <strong className="text-foreground tabular-nums" style={{ fontVariantNumeric: "tabular-nums" }}>
                {hoveredStock.stock.volume.toLocaleString()}
              </strong>
            </div>
            <div>
              <span className="text-muted-foreground text-[10px] block font-sans">Cap Tier</span>
              <strong className="text-accent text-[11px] font-sans">
                {formatTileMcap(hoveredStock.stock.market_cap)}
              </strong>
            </div>
          </div>

          {/* Footer Action Hint */}
          <div className="text-[10px] text-accent border-t border-border/40 pt-1.5 font-semibold flex items-center justify-between">
            <span className="text-muted-foreground">Interactive Treemap</span>
            <span>Click to inspect chart →</span>
          </div>
        </div>
      )}
    </div>
  );
}
