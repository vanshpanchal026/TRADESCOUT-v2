"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { RRGItem } from "./types";

interface RRGChartProps {
  items: RRGItem[];
  trailLength: 5 | 10 | 20;
  highlightSymbol?: string | null;
  onSelectSymbol?: (symbol: string) => void;
}

export function RRGChart({
  items,
  trailLength,
  highlightSymbol,
  onSelectSymbol,
}: RRGChartProps) {
  const router = useRouter();
  const [hoveredItem, setHoveredItem] = useState<RRGItem | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);

  // SVG dimensions
  const width = 800;
  const height = 600;
  const padding = 60;

  // Calculate dynamic axis limits centered symmetrically around 100.0
  const { minVal, maxVal, scaleX, scaleY } = useMemo(() => {
    let maxDelta = 3.5; // Minimum range +/- 3.5% from 100

    items.forEach((item) => {
      maxDelta = Math.max(maxDelta, Math.abs(item.rs_ratio - 100.0));
      maxDelta = Math.max(maxDelta, Math.abs(item.rs_momentum - 100.0));

      const activeTrail = item.trail.slice(-trailLength);
      activeTrail.forEach((pt) => {
        maxDelta = Math.max(maxDelta, Math.abs(pt.rs_ratio - 100.0));
        maxDelta = Math.max(maxDelta, Math.abs(pt.rs_momentum - 100.0));
      });
    });

    // Add 15% breathing room padding
    const bound = Math.ceil(maxDelta * 1.15 * 2) / 2;
    const minV = 100.0 - bound;
    const maxV = 100.0 + bound;

    const sX = (val: number) => {
      const ratio = (val - minV) / (maxV - minV);
      return padding + ratio * (width - 2 * padding);
    };

    const sY = (val: number) => {
      // Invert Y so higher momentum is at top
      const ratio = (val - minV) / (maxV - minV);
      return height - padding - ratio * (height - 2 * padding);
    };

    return { minVal: minV, maxVal: maxV, scaleX: sX, scaleY: sY };
  }, [items, trailLength]);

  const centerX = scaleX(100.0);
  const centerY = scaleY(100.0);

  const handleNodeClick = (symbol: string, group: string) => {
    if (onSelectSymbol) {
      onSelectSymbol(symbol);
    }
    if (group === "top-momentum") {
      router.push(`/stock/${symbol}`);
    }
  };

  return (
    <div className="relative w-full rounded-2xl border border-border bg-card p-4 shadow-sm overflow-hidden select-none">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-auto max-h-[620px] font-sans"
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          setMousePos({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
          });
        }}
        onMouseLeave={() => {
          setHoveredItem(null);
          setMousePos(null);
        }}
      >
        <defs>
          {/* Subtle Quadrant Background Gradients with Design Tokens */}
          <radialGradient id="grad-leading" cx="100%" cy="0%" r="90%">
            <stop offset="0%" stopColor="#2563EB" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#2563EB" stopOpacity="0.0" />
          </radialGradient>
          <radialGradient id="grad-weakening" cx="100%" cy="100%" r="90%">
            <stop offset="0%" stopColor="#D97706" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#D97706" stopOpacity="0.0" />
          </radialGradient>
          <radialGradient id="grad-lagging" cx="0%" cy="100%" r="90%">
            <stop offset="0%" stopColor="#DB2777" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#DB2777" stopOpacity="0.0" />
          </radialGradient>
          <radialGradient id="grad-improving" cx="0%" cy="0%" r="90%">
            <stop offset="0%" stopColor="#0284C7" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#0284C7" stopOpacity="0.0" />
          </radialGradient>
        </defs>

        {/* 1. Quadrant Background Tints */}
        {/* Top-Right: Leading */}
        <rect
          x={centerX}
          y={padding}
          width={width - padding - centerX}
          height={centerY - padding}
          fill="url(#grad-leading)"
        />
        {/* Bottom-Right: Weakening */}
        <rect
          x={centerX}
          y={centerY}
          width={width - padding - centerX}
          height={height - padding - centerY}
          fill="url(#grad-weakening)"
        />
        {/* Bottom-Left: Lagging */}
        <rect
          x={padding}
          y={centerY}
          width={centerX - padding}
          height={height - padding - centerY}
          fill="url(#grad-lagging)"
        />
        {/* Top-Left: Improving */}
        <rect
          x={padding}
          y={padding}
          width={centerX - padding}
          height={centerY - padding}
          fill="url(#grad-improving)"
        />

        {/* 2. Quadrant Labels Watermark */}
        <text
          x={width - padding - 15}
          y={padding + 25}
          textAnchor="end"
          className="text-xs font-bold uppercase tracking-widest font-mono fill-[#2563EB] opacity-80"
        >
          Leading (RS+, MOM+)
        </text>
        <text
          x={width - padding - 15}
          y={height - padding - 20}
          textAnchor="end"
          className="text-xs font-bold uppercase tracking-widest font-mono fill-[#D97706] opacity-80"
        >
          Weakening (RS+, MOM-)
        </text>
        <text
          x={padding + 15}
          y={height - padding - 20}
          textAnchor="start"
          className="text-xs font-bold uppercase tracking-widest font-mono fill-[#DB2777] opacity-80"
        >
          Lagging (RS-, MOM-)
        </text>
        <text
          x={padding + 15}
          y={padding + 25}
          textAnchor="start"
          className="text-xs font-bold uppercase tracking-widest font-mono fill-[#0284C7] opacity-80"
        >
          Improving (RS-, MOM+)
        </text>

        {/* Clockwise Rotation Indicator Arc */}
        <path
          d={`M ${centerX + 70} ${centerY - 70} A 99 99 0 0 1 ${centerX + 70} ${centerY + 70}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeDasharray="4 4"
          className="text-muted-foreground/30"
        />
        <text
          x={centerX + 85}
          y={centerY}
          textAnchor="start"
          className="text-[9px] font-mono fill-muted-foreground/40"
        >
          ↻ Clockwise
        </text>

        {/* 3. Center Crosshairs at (100, 100) */}
        {/* Vertical Axis (RS-Ratio = 100) */}
        <line
          x1={centerX}
          y1={padding}
          x2={centerX}
          y2={height - padding}
          stroke="currentColor"
          strokeWidth="1.5"
          strokeDasharray="4 4"
          className="text-border"
        />
        {/* Horizontal Axis (RS-Momentum = 100) */}
        <line
          x1={padding}
          y1={centerY}
          x2={width - padding}
          y2={centerY}
          stroke="currentColor"
          strokeWidth="1.5"
          strokeDasharray="4 4"
          className="text-border"
        />

        {/* Center Origin Benchmark Marker */}
        <circle cx={centerX} cy={centerY} r="3" className="fill-muted-foreground" />
        <rect
          x={centerX - 24}
          y={centerY + 6}
          width="48"
          height="14"
          rx="3"
          className="fill-background stroke stroke-border"
        />
        <text
          x={centerX}
          y={centerY + 16}
          textAnchor="middle"
          className="text-[9px] font-mono font-semibold fill-muted-foreground"
        >
          100.0
        </text>

        {/* 4. Axis Coordinate Ticks and Labels */}
        {/* X-Axis: JdK RS-Ratio */}
        <text
          x={width - padding}
          y={centerY - 8}
          textAnchor="end"
          className="text-[10px] font-mono font-bold fill-muted-foreground uppercase"
        >
          JdK RS-Ratio →
        </text>
        <text
          x={padding}
          y={centerY - 8}
          textAnchor="start"
          className="text-[10px] font-mono font-bold fill-muted-foreground uppercase"
        >
          ← Underperforming
        </text>

        {/* Y-Axis: JdK RS-Momentum */}
        <text
          x={centerX + 8}
          y={padding + 10}
          textAnchor="start"
          className="text-[10px] font-mono font-bold fill-muted-foreground uppercase"
        >
          ↑ JdK RS-Momentum
        </text>
        <text
          x={centerX + 8}
          y={height - padding - 5}
          textAnchor="start"
          className="text-[10px] font-mono font-bold fill-muted-foreground uppercase"
        >
          ↓ Negative Momentum
        </text>

        {/* Min / Max Tick Labels */}
        <text
          x={padding}
          y={centerY + 15}
          textAnchor="middle"
          className="text-[9px] font-mono fill-muted-foreground/60"
        >
          {minVal.toFixed(1)}
        </text>
        <text
          x={width - padding}
          y={centerY + 15}
          textAnchor="middle"
          className="text-[9px] font-mono fill-muted-foreground/60"
        >
          {maxVal.toFixed(1)}
        </text>
        <text
          x={centerX - 10}
          y={padding + 5}
          textAnchor="end"
          className="text-[9px] font-mono fill-muted-foreground/60"
        >
          {maxVal.toFixed(1)}
        </text>
        <text
          x={centerX - 10}
          y={height - padding}
          textAnchor="end"
          className="text-[9px] font-mono fill-muted-foreground/60"
        >
          {minVal.toFixed(1)}
        </text>

        {/* 5. Draw Trailing Tails for Each Item */}
        {items.map((item) => {
          const isHighlighted = highlightSymbol === item.symbol;
          const isHovered = hoveredItem?.symbol === item.symbol;
          const activeTrail = item.trail.slice(-trailLength);

          if (activeTrail.length < 2) return null;

          // Build SVG path for the trail
          const pathD = activeTrail
            .map((pt, i) => {
              const x = scaleX(pt.rs_ratio);
              const y = scaleY(pt.rs_momentum);
              return `${i === 0 ? "M" : "L"} ${x} ${y}`;
            })
            .join(" ");

          const latestPt = activeTrail[activeTrail.length - 1];
          const currX = scaleX(latestPt.rs_ratio);
          const currY = scaleY(latestPt.rs_momentum);

          return (
            <g
              key={item.symbol}
              className="cursor-pointer transition-opacity duration-200"
              opacity={highlightSymbol && !isHighlighted ? 0.25 : isHovered ? 1.0 : 0.85}
              onMouseEnter={() => setHoveredItem(item)}
              onClick={() => handleNodeClick(item.symbol, item.group)}
            >
              {/* Trail Path */}
              <path
                d={pathD}
                fill="none"
                stroke={item.color}
                strokeWidth={isHovered || isHighlighted ? 2.5 : 1.5}
                strokeOpacity={isHovered ? 0.9 : 0.6}
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Smaller history bead dots along tail */}
              {activeTrail.slice(0, -1).map((pt, idx) => {
                const stepOpacity = 0.2 + (idx / activeTrail.length) * 0.4;
                return (
                  <circle
                    key={idx}
                    cx={scaleX(pt.rs_ratio)}
                    cy={scaleY(pt.rs_momentum)}
                    r={idx === 0 ? 1.5 : 2}
                    fill={item.color}
                    opacity={stepOpacity}
                  />
                );
              })}

              {/* Current Head Pulse Ring (on hover or highlight) */}
              {(isHovered || isHighlighted) && (
                <circle
                  cx={currX}
                  cy={currY}
                  r="12"
                  fill="none"
                  stroke={item.color}
                  strokeWidth="1.5"
                  opacity="0.4"
                  className="animate-ping"
                />
              )}

              {/* Head Circle */}
              <circle
                cx={currX}
                cy={currY}
                r={isHovered ? 6 : 4.5}
                fill={item.color}
                stroke="#0a0a0f"
                strokeWidth="1.5"
                className="transition-all duration-150"
              />

              {/* Symbol Label Text */}
              <text
                x={currX + 8}
                y={currY + 3.5}
                className="text-[10px] font-mono font-bold tracking-tight fill-foreground"
                style={{
                  textShadow: "0 1px 3px rgba(0,0,0,0.8)",
                }}
              >
                {item.symbol}
              </text>
            </g>
          );
        })}
      </svg>

      {/* 6. High-Contrast Interactive Floating Tooltip */}
      {hoveredItem && mousePos && (
        <div
          className="pointer-events-none absolute z-30 w-64 rounded-xl border border-border bg-card/95 p-3.5 shadow-xl backdrop-blur-md text-xs space-y-2 transition-all"
          style={{
            left: Math.min(mousePos.x + 15, width - 260),
            top: Math.max(mousePos.y - 120, 10),
          }}
        >
          <div className="flex items-center justify-between border-b border-border/60 pb-1.5">
            <div>
              <div className="font-bold text-sm text-foreground flex items-center gap-1.5 font-mono">
                <span>{hoveredItem.symbol}</span>
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: hoveredItem.color }}
                />
              </div>
              <div className="text-[11px] text-muted-foreground truncate max-w-[150px]">
                {hoveredItem.name}
              </div>
            </div>
            <span
              className="text-[10px] font-bold px-2 py-0.5 rounded-full border"
              style={{
                borderColor: `${hoveredItem.color}50`,
                backgroundColor: `${hoveredItem.color}20`,
                color: hoveredItem.color,
              }}
            >
              {hoveredItem.quadrant}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
            <div>
              <span className="text-muted-foreground text-[10px] block">RS-Ratio</span>
              <strong className="text-foreground">{hoveredItem.rs_ratio.toFixed(2)}</strong>
            </div>
            <div>
              <span className="text-muted-foreground text-[10px] block">RS-Momentum</span>
              <strong className="text-foreground">{hoveredItem.rs_momentum.toFixed(2)}</strong>
            </div>
            <div>
              <span className="text-muted-foreground text-[10px] block">CMP</span>
              <strong className="text-foreground">₹{hoveredItem.cmp.toLocaleString()}</strong>
            </div>
            <div>
              <span className="text-muted-foreground text-[10px] block">1D Change</span>
              <strong
                className={hoveredItem.change_1d >= 0 ? "text-bull" : "text-bear"}
              >
                {hoveredItem.change_1d >= 0 ? "+" : ""}
                {hoveredItem.change_1d}%
              </strong>
            </div>
          </div>

          <div className="text-[10px] text-muted-foreground border-t border-border/40 pt-1 flex items-center justify-between">
            <span>Tail: {trailLength} sessions</span>
            {hoveredItem.group === "top-momentum" && (
              <span className="text-accent font-semibold">Click to inspect →</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
