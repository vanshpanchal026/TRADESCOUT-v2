"use client";

import React, { useMemo, useState } from "react";
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
 * Recursive rectangular subdivision algorithm that produces aspect-ratio optimized tiles.
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

export function HeatmapTreemap({ sectors, totalMarketCap }: HeatmapTreemapProps) {
  const router = useRouter();
  const [hoveredStock, setHoveredStock] = useState<{
    stock: HeatmapStock;
    sectorName: string;
    clientX: number;
    clientY: number;
  } | null>(null);

  // Responsive canvas virtual dimensions
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

  // Color mapping function
  const getChangeBg = (change: number): string => {
    if (change >= 3.0) return "#00E5FF"; // Bright Cyan for explosive gainers
    if (change >= 1.5) return "#059669"; // Strong green
    if (change >= 0.5) return "#047857"; // Green
    if (change > 0.0) return "#064e3b"; // Subtle green
    if (change === 0.0) return "#27272a"; // Neutral
    if (change >= -0.5) return "#7f1d1d"; // Subtle red
    if (change >= -1.5) return "#991b1b"; // Medium red
    if (change >= -3.0) return "#b91c1c"; // Red
    return "#EF4444"; // Bright red for sharp decliners
  };

  const getTextColor = (change: number): string => {
    if (change >= 3.0) return "#0a0a0f"; // Dark text on bright cyan
    return "#ffffff";
  };

  return (
    <div className="relative w-full rounded-2xl border border-border bg-card p-3 sm:p-4 shadow-sm overflow-hidden select-none">
      {/* Mobile 2-Column Grid Fallback (< 640px) */}
      <div className="sm:hidden grid grid-cols-2 gap-2 p-1">
        {sectors.flatMap((sec) => sec.stocks.map((stock) => ({ ...stock, sectorName: sec.name }))).map((stock) => (
          <div
            key={stock.symbol}
            onClick={() => router.push(`/stock/${stock.symbol}`)}
            className="p-2.5 rounded-xl border border-border cursor-pointer flex flex-col justify-between"
            style={{ backgroundColor: getChangeBg(stock.change_1d) }}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-white font-mono">{stock.symbol}</span>
              <span className="text-[11px] font-mono font-bold text-white tabular-nums">
                {stock.change_1d >= 0 ? "+" : ""}{stock.change_1d}%
              </span>
            </div>
            <div className="flex items-center justify-between text-[10px] text-zinc-200 mt-1">
              <span className="truncate max-w-[70px]">{stock.sectorName}</span>
              <span className="tabular-nums font-mono font-semibold">₹{stock.cmp.toLocaleString()}</span>
            </div>
          </div>
        ))}
      </div>

      {/* SVG Treemap Canvas (Desktop & Tablets >= 640px) */}
      <svg
        viewBox={`0 0 ${viewWidth} ${viewHeight}`}
        className="hidden sm:block w-full h-auto max-h-[660px] font-sans rounded-xl overflow-hidden bg-background"
        onMouseLeave={() => setHoveredStock(null)}
      >
        {placedSectors.map(({ sector, rect, placedStocks }) => {
          const isLargeSector = rect.w > 60 && rect.h > 40;

          return (
            <g key={sector.name}>
              {/* Sector Outer Boundary */}
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

              {/* Sector Header Label */}
              {isLargeSector && (
                <g>
                  <rect
                    x={rect.x}
                    y={rect.y}
                    width={rect.w}
                    height={Math.min(20, rect.h * 0.2)}
                    fill="#181825"
                    opacity="0.9"
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
                    className={`text-[10px] font-mono font-bold ${
                      sector.change_1d >= 0 ? "fill-bull" : "fill-bear"
                    }`}
                  >
                    {sector.change_1d >= 0 ? "+" : ""}
                    {sector.change_1d}%
                  </text>
                </g>
              )}

              {/* Nested Stock Boxes */}
              {placedStocks.map(({ stock, sectorName, rect: sRect }) => {
                const canShowSymbol = sRect.w >= 28 && sRect.h >= 20;
                const canShowChange = sRect.w >= 36 && sRect.h >= 32;
                const canShowPrice = sRect.w >= 54 && sRect.h >= 46;

                const bg = getChangeBg(stock.change_1d);
                const textColor = getTextColor(stock.change_1d);

                return (
                  <g
                    key={stock.symbol}
                    className="cursor-pointer group"
                    onClick={() => router.push(`/stock/${stock.symbol}`)}
                    onMouseEnter={(e) => {
                      const svgRect = e.currentTarget.ownerSVGElement?.getBoundingClientRect();
                      if (svgRect) {
                        setHoveredStock({
                          stock,
                          sectorName,
                          clientX: e.clientX - svgRect.left,
                          clientY: e.clientY - svgRect.top,
                        });
                      }
                    }}
                    onMouseMove={(e) => {
                      const svgRect = e.currentTarget.ownerSVGElement?.getBoundingClientRect();
                      if (svgRect) {
                        setHoveredStock({
                          stock,
                          sectorName,
                          clientX: e.clientX - svgRect.left,
                          clientY: e.clientY - svgRect.top,
                        });
                      }
                    }}
                  >
                    {/* Stock Tile Box */}
                    <rect
                      x={sRect.x + 0.5}
                      y={sRect.y + 0.5}
                      width={Math.max(0, sRect.w - 1)}
                      height={Math.max(0, sRect.h - 1)}
                      fill={bg}
                      stroke="#0a0a0f"
                      strokeWidth="1"
                      rx="3"
                      className="transition-all duration-150 hover:opacity-85 hover:stroke-foreground"
                    />

                    {/* Stock Symbol Label */}
                    {canShowSymbol && (
                      <text
                        x={sRect.x + sRect.w / 2}
                        y={canShowChange ? sRect.y + sRect.h / 2 - 4 : sRect.y + sRect.h / 2 + 3}
                        textAnchor="middle"
                        fill={textColor}
                        className="text-[10px] font-mono font-bold tracking-tight"
                        style={{ textShadow: "0 1px 2px rgba(0,0,0,0.6)" }}
                      >
                        {stock.symbol}
                      </text>
                    )}

                    {/* Stock 1D Change % */}
                    {canShowChange && (
                      <text
                        x={sRect.x + sRect.w / 2}
                        y={sRect.y + sRect.h / 2 + 9}
                        textAnchor="middle"
                        fill={textColor}
                        className="text-[9px] font-mono font-semibold opacity-90"
                        style={{ textShadow: "0 1px 2px rgba(0,0,0,0.6)" }}
                      >
                        {stock.change_1d >= 0 ? "+" : ""}
                        {stock.change_1d}%
                      </text>
                    )}

                    {/* Stock Price (for larger boxes) */}
                    {canShowPrice && (
                      <text
                        x={sRect.x + sRect.w / 2}
                        y={sRect.y + sRect.h / 2 + 20}
                        textAnchor="middle"
                        fill={textColor}
                        className="text-[8px] font-mono opacity-80"
                      >
                        ₹{stock.cmp.toLocaleString()}
                      </text>
                    )}
                  </g>
                );
              })}
            </g>
          );
        })}
      </svg>

      {/* Floating Hover Tooltip */}
      {hoveredStock && (
        <div
          className="pointer-events-none absolute z-30 w-60 rounded-xl border border-border bg-card/95 p-3 shadow-xl backdrop-blur-md text-xs space-y-2"
          style={{
            left: Math.min(hoveredStock.clientX + 15, viewWidth - 250),
            top: Math.max(hoveredStock.clientY - 95, 10),
          }}
        >
          <div className="flex items-center justify-between border-b border-border/60 pb-1.5">
            <div>
              <div className="font-bold text-sm text-foreground font-mono">
                {hoveredStock.stock.symbol}
              </div>
              <div className="text-[11px] text-muted-foreground truncate max-w-[140px]">
                {hoveredStock.stock.name}
              </div>
            </div>
            <span
              className={`text-xs font-mono font-bold px-2 py-0.5 rounded-full border ${
                hoveredStock.stock.change_1d >= 0
                  ? "bg-bull/10 border-bull/30 text-bull"
                  : "bg-bear/10 border-bear/30 text-bear"
              }`}
            >
              {hoveredStock.stock.change_1d >= 0 ? "+" : ""}
              {hoveredStock.stock.change_1d}%
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
            <div>
              <span className="text-muted-foreground text-[10px] block font-sans">Sector</span>
              <strong className="text-foreground truncate block font-sans">
                {hoveredStock.sectorName}
              </strong>
            </div>
            <div>
              <span className="text-muted-foreground text-[10px] block font-sans">CMP</span>
              <strong className="text-foreground tabular-nums">
                ₹{hoveredStock.stock.cmp.toLocaleString()}
              </strong>
            </div>
            <div>
              <span className="text-muted-foreground text-[10px] block font-sans">Market Cap</span>
              <strong className="text-foreground tabular-nums">
                ₹{hoveredStock.stock.market_cap.toLocaleString()} Cr
              </strong>
            </div>
            <div>
              <span className="text-muted-foreground text-[10px] block font-sans">Index Weight</span>
              <strong className="text-foreground tabular-nums">{hoveredStock.stock.weight_pct}%</strong>
            </div>
          </div>

          <div className="text-[10px] text-accent border-t border-border/40 pt-1 font-semibold flex items-center justify-between">
            <span>Volume: {hoveredStock.stock.volume.toLocaleString()}</span>
            <span>Click to inspect chart →</span>
          </div>
        </div>
      )}
    </div>
  );
}
