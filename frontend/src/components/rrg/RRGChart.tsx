"use client";

import React, { useMemo, useState, useRef } from "react";
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
  const containerRef = useRef<HTMLDivElement>(null);

  const [hoveredItem, setHoveredItem] = useState<RRGItem | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);

  // SVG Virtual Dimensions
  const width = 800;
  const height = 600;
  const padding = 65;

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

    // Add 18% breathing room padding
    const bound = Math.ceil(maxDelta * 1.18 * 2) / 2;
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

  // Radius in pixels for 1.0 unit delta from 100
  const unitPixelRadius = Math.abs(scaleX(101.0) - scaleX(100.0));

  const handleNodeClick = (symbol: string, group: string) => {
    if (onSelectSymbol) {
      onSelectSymbol(symbol);
    }
    if (group === "top-momentum") {
      router.push(`/stock/${symbol}`);
    }
  };

  const handlePointerMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  // Safe tooltip placement within card container bounds
  const tooltipStyle = useMemo(() => {
    if (!hoveredItem || !mousePos || !containerRef.current) return { display: "none" };
    const containerWidth = containerRef.current.clientWidth || width;
    const containerHeight = containerRef.current.clientHeight || height;

    const tooltipWidth = 264;
    const tooltipHeight = 195;

    let left = mousePos.x + 16;
    if (left + tooltipWidth > containerWidth - 10) {
      left = Math.max(10, mousePos.x - tooltipWidth - 16);
    }

    let top = mousePos.y - 110;
    if (top < 10) {
      top = 10;
    } else if (top + tooltipHeight > containerHeight - 10) {
      top = Math.max(10, containerHeight - tooltipHeight - 10);
    }

    return {
      left: `${left}px`,
      top: `${top}px`,
    };
  }, [hoveredItem, mousePos]);

  return (
    <div
      ref={containerRef}
      className="relative w-full rounded-2xl border border-border bg-card p-3 sm:p-4 shadow-sm overflow-hidden select-none"
    >
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-auto max-h-[640px] font-sans"
        onMouseMove={handlePointerMove}
        onMouseLeave={() => {
          setHoveredItem(null);
          setMousePos(null);
        }}
      >
        <defs>
          {/* Subtle Quadrant Background Gradients */}
          <radialGradient id="grad-leading" cx="100%" cy="0%" r="90%">
            <stop offset="0%" stopColor="#2563EB" stopOpacity="0.10" />
            <stop offset="70%" stopColor="#2563EB" stopOpacity="0.02" />
            <stop offset="100%" stopColor="#2563EB" stopOpacity="0.0" />
          </radialGradient>
          <radialGradient id="grad-weakening" cx="100%" cy="100%" r="90%">
            <stop offset="0%" stopColor="#D97706" stopOpacity="0.10" />
            <stop offset="70%" stopColor="#D97706" stopOpacity="0.02" />
            <stop offset="100%" stopColor="#D97706" stopOpacity="0.0" />
          </radialGradient>
          <radialGradient id="grad-lagging" cx="0%" cy="100%" r="90%">
            <stop offset="0%" stopColor="#DB2777" stopOpacity="0.10" />
            <stop offset="70%" stopColor="#DB2777" stopOpacity="0.02" />
            <stop offset="100%" stopColor="#DB2777" stopOpacity="0.0" />
          </radialGradient>
          <radialGradient id="grad-improving" cx="0%" cy="0%" r="90%">
            <stop offset="0%" stopColor="#0284C7" stopOpacity="0.10" />
            <stop offset="70%" stopColor="#0284C7" stopOpacity="0.02" />
            <stop offset="100%" stopColor="#0284C7" stopOpacity="0.0" />
          </radialGradient>

          {/* SVG Arrowhead Markers for Each Item's Trail Tail */}
          {items.map((item) => (
            <marker
              key={`arrowhead-${item.symbol}`}
              id={`arrow-${item.symbol}`}
              viewBox="0 0 10 10"
              refX="6"
              refY="5"
              markerWidth="5"
              markerHeight="5"
              orient="auto-start-reverse"
            >
              <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill={item.color} />
            </marker>
          ))}
        </defs>

        {/* 1. Subtle Quadrant Background Tints */}
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

        {/* 2. Concentric Benchmark Distance Orbit Rings (100.0 Center) */}
        {unitPixelRadius > 10 && (
          <>
            <circle
              cx={centerX}
              cy={centerY}
              r={unitPixelRadius * 1.5}
              fill="none"
              stroke="#27272a"
              strokeWidth="1"
              strokeDasharray="2 4"
              opacity="0.6"
            />
            <circle
              cx={centerX}
              cy={centerY}
              r={unitPixelRadius * 3.0}
              fill="none"
              stroke="#27272a"
              strokeWidth="1"
              strokeDasharray="2 4"
              opacity="0.4"
            />
          </>
        )}

        {/* 3. Quadrant Watermark Badges */}
        {/* Leading Badge (Top-Right) */}
        <g>
          <rect
            x={width - padding - 150}
            y={padding + 10}
            width="142"
            height="32"
            rx="6"
            fill="#141420"
            stroke="#2563EB"
            strokeWidth="1"
            strokeOpacity="0.35"
          />
          <text
            x={width - padding - 79}
            y={padding + 24}
            textAnchor="middle"
            className="text-[11px] font-bold font-mono tracking-wider fill-[#60a5fa]"
          >
            LEADING
          </text>
          <text
            x={width - padding - 79}
            y={padding + 36}
            textAnchor="middle"
            className="text-[8.5px] font-mono fill-muted-foreground/80"
          >
            RS &gt; 100 · MOM &gt; 100
          </text>
        </g>

        {/* Weakening Badge (Bottom-Right) */}
        <g>
          <rect
            x={width - padding - 150}
            y={height - padding - 42}
            width="142"
            height="32"
            rx="6"
            fill="#141420"
            stroke="#D97706"
            strokeWidth="1"
            strokeOpacity="0.35"
          />
          <text
            x={width - padding - 79}
            y={height - padding - 28}
            textAnchor="middle"
            className="text-[11px] font-bold font-mono tracking-wider fill-[#fbbf24]"
          >
            WEAKENING
          </text>
          <text
            x={width - padding - 79}
            y={height - padding - 16}
            textAnchor="middle"
            className="text-[8.5px] font-mono fill-muted-foreground/80"
          >
            RS &gt; 100 · MOM &lt; 100
          </text>
        </g>

        {/* Lagging Badge (Bottom-Left) */}
        <g>
          <rect
            x={padding + 10}
            y={height - padding - 42}
            width="142"
            height="32"
            rx="6"
            fill="#141420"
            stroke="#DB2777"
            strokeWidth="1"
            strokeOpacity="0.35"
          />
          <text
            x={padding + 81}
            y={height - padding - 28}
            textAnchor="middle"
            className="text-[11px] font-bold font-mono tracking-wider fill-[#f472b6]"
          >
            LAGGING
          </text>
          <text
            x={padding + 81}
            y={height - padding - 16}
            textAnchor="middle"
            className="text-[8.5px] font-mono fill-muted-foreground/80"
          >
            RS &lt; 100 · MOM &lt; 100
          </text>
        </g>

        {/* Improving Badge (Top-Left) */}
        <g>
          <rect
            x={padding + 10}
            y={padding + 10}
            width="142"
            height="32"
            rx="6"
            fill="#141420"
            stroke="#0284C7"
            strokeWidth="1"
            strokeOpacity="0.35"
          />
          <text
            x={padding + 81}
            y={padding + 24}
            textAnchor="middle"
            className="text-[11px] font-bold font-mono tracking-wider fill-[#38bdf8]"
          >
            IMPROVING
          </text>
          <text
            x={padding + 81}
            y={padding + 36}
            textAnchor="middle"
            className="text-[8.5px] font-mono fill-muted-foreground/80"
          >
            RS &lt; 100 · MOM &gt; 100
          </text>
        </g>

        {/* 4. Clockwise Rotational Guide Circle with Directional Arrows */}
        <g opacity="0.35">
          <circle
            cx={centerX}
            cy={centerY}
            r="85"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeDasharray="4 6"
            className="text-muted-foreground"
          />
          {/* Subtle clockwise arrow chevrons on arc */}
          <path
            d={`M ${centerX + 85} ${centerY} L ${centerX + 82} ${centerY - 6} M ${centerX + 85} ${centerY} L ${centerX + 88} ${centerY - 6}`}
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            className="text-muted-foreground"
          />
          <path
            d={`M ${centerX - 85} ${centerY} L ${centerX - 88} ${centerY + 6} M ${centerX - 85} ${centerY} L ${centerX - 82} ${centerY + 6}`}
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            className="text-muted-foreground"
          />
          <text
            x={centerX}
            y={centerY - 92}
            textAnchor="middle"
            className="text-[9px] font-mono font-bold tracking-wider fill-muted-foreground"
          >
            ↻ CLOCKWISE ROTATION
          </text>
        </g>

        {/* 5. Center Benchmark Crosshairs at (100, 100) */}
        {/* Vertical Axis (RS-Ratio = 100) */}
        <line
          x1={centerX}
          y1={padding}
          x2={centerX}
          y2={height - padding}
          stroke="#3f3f46"
          strokeWidth="1.5"
          strokeDasharray="4 4"
        />
        {/* Horizontal Axis (RS-Momentum = 100) */}
        <line
          x1={padding}
          y1={centerY}
          x2={width - padding}
          y2={centerY}
          stroke="#3f3f46"
          strokeWidth="1.5"
          strokeDasharray="4 4"
        />

        {/* Center Benchmark Origin Pin & Badge */}
        <circle cx={centerX} cy={centerY} r="3.5" fill="#6366f1" stroke="#0a0a0f" strokeWidth="1.5" />
        <g>
          <rect
            x={centerX - 46}
            y={centerY + 6}
            width="92"
            height="17"
            rx="4"
            fill="#141420"
            stroke="#3f3f46"
            strokeWidth="1"
          />
          <text
            x={centerX}
            y={centerY + 18}
            textAnchor="middle"
            className="text-[9px] font-mono font-bold fill-foreground tracking-wider tabular-nums"
            style={{ fontVariantNumeric: "tabular-nums" }}
          >
            BENCHMARK 100.0
          </text>
        </g>

        {/* 6. Clean High-Contrast Axis Direction Labels */}
        {/* X-Axis: RS-Ratio */}
        <text
          x={width - padding}
          y={centerY - 8}
          textAnchor="end"
          className="text-[10px] font-mono font-bold fill-muted-foreground uppercase tracking-wide"
        >
          RS-Ratio &gt; 100 (Outperforming) →
        </text>
        <text
          x={padding}
          y={centerY - 8}
          textAnchor="start"
          className="text-[10px] font-mono font-bold fill-muted-foreground uppercase tracking-wide"
        >
          ← (Underperforming) RS-Ratio &lt; 100
        </text>

        {/* Y-Axis: RS-Momentum */}
        <text
          x={centerX + 8}
          y={padding + 12}
          textAnchor="start"
          className="text-[10px] font-mono font-bold fill-muted-foreground uppercase tracking-wide"
        >
          ↑ RS-Momentum &gt; 100 (Gaining)
        </text>
        <text
          x={centerX + 8}
          y={height - padding - 6}
          textAnchor="start"
          className="text-[10px] font-mono font-bold fill-muted-foreground uppercase tracking-wide"
        >
          ↓ RS-Momentum &lt; 100 (Losing)
        </text>

        {/* Min / Max Range Tick Markers with tabular-nums */}
        <text
          x={padding}
          y={centerY + 16}
          textAnchor="middle"
          className="text-[9px] font-mono tabular-nums fill-muted-foreground/70"
          style={{ fontVariantNumeric: "tabular-nums" }}
        >
          {minVal.toFixed(1)}
        </text>
        <text
          x={width - padding}
          y={centerY + 16}
          textAnchor="middle"
          className="text-[9px] font-mono tabular-nums fill-muted-foreground/70"
          style={{ fontVariantNumeric: "tabular-nums" }}
        >
          {maxVal.toFixed(1)}
        </text>
        <text
          x={centerX - 10}
          y={padding + 5}
          textAnchor="end"
          className="text-[9px] font-mono tabular-nums fill-muted-foreground/70"
          style={{ fontVariantNumeric: "tabular-nums" }}
        >
          {maxVal.toFixed(1)}
        </text>
        <text
          x={centerX - 10}
          y={height - padding}
          textAnchor="end"
          className="text-[9px] font-mono tabular-nums fill-muted-foreground/70"
          style={{ fontVariantNumeric: "tabular-nums" }}
        >
          {minVal.toFixed(1)}
        </text>

        {/* 7. Draw Trailing Tails & Directional Arrowheads for Each Stock */}
        {items.map((item) => {
          const isHighlighted = highlightSymbol === item.symbol;
          const isHovered = hoveredItem?.symbol === item.symbol;
          const activeTrail = item.trail.slice(-trailLength);

          if (activeTrail.length < 2) return null;

          // Trail points coordinates
          const trailCoords = activeTrail.map((pt) => ({
            x: scaleX(pt.rs_ratio),
            y: scaleY(pt.rs_momentum),
          }));

          // Build SVG path
          const pathD = trailCoords
            .map((pt, i) => `${i === 0 ? "M" : "L"} ${pt.x} ${pt.y}`)
            .join(" ");

          const latestPt = trailCoords[trailCoords.length - 1];
          const prevPt = trailCoords[trailCoords.length - 2];

          // Compute angle of the latest vector to draw directional arrowhead
          const deltaX = latestPt.x - prevPt.x;
          const deltaY = latestPt.y - prevPt.y;
          const headAngle = Math.atan2(deltaY, deltaX);

          // Arrowhead geometry pointing towards latest head
          const arrowLength = isHovered || isHighlighted ? 10 : 8;
          const arrowSpread = isHovered || isHighlighted ? 5.5 : 4.5;
          const arrowTipX = latestPt.x - 4 * Math.cos(headAngle);
          const arrowTipY = latestPt.y - 4 * Math.sin(headAngle);

          const arrowLeftX =
            arrowTipX - arrowLength * Math.cos(headAngle) + arrowSpread * Math.sin(headAngle);
          const arrowLeftY =
            arrowTipY - arrowLength * Math.sin(headAngle) - arrowSpread * Math.cos(headAngle);

          const arrowRightX =
            arrowTipX - arrowLength * Math.cos(headAngle) - arrowSpread * Math.sin(headAngle);
          const arrowRightY =
            arrowTipY - arrowLength * Math.sin(headAngle) + arrowSpread * Math.cos(headAngle);

          return (
            <g
              key={item.symbol}
              className="cursor-pointer transition-opacity duration-200"
              opacity={highlightSymbol && !isHighlighted ? 0.22 : isHovered ? 1.0 : 0.88}
              onMouseEnter={() => setHoveredItem(item)}
              onClick={() => handleNodeClick(item.symbol, item.group)}
            >
              {/* Trail Path */}
              <path
                d={pathD}
                fill="none"
                stroke={item.color}
                strokeWidth={isHovered || isHighlighted ? 2.8 : 1.7}
                strokeOpacity={isHovered ? 0.95 : 0.7}
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Directional Arrowhead along vector */}
              <polygon
                points={`${arrowTipX},${arrowTipY} ${arrowLeftX},${arrowLeftY} ${arrowRightX},${arrowRightY}`}
                fill={item.color}
                stroke="#0a0a0f"
                strokeWidth="1"
                opacity={isHovered || isHighlighted ? 1.0 : 0.85}
              />

              {/* Intermediate history bead dots along tail */}
              {trailCoords.slice(0, -1).map((pt, idx) => {
                const stepOpacity = 0.25 + (idx / trailCoords.length) * 0.45;
                return (
                  <circle
                    key={idx}
                    cx={pt.x}
                    cy={pt.y}
                    r={idx === 0 ? 1.5 : 2.2}
                    fill={item.color}
                    opacity={stepOpacity}
                  />
                );
              })}

              {/* Head Pulse Ring (on hover or highlight) */}
              {(isHovered || isHighlighted) && (
                <circle
                  cx={latestPt.x}
                  cy={latestPt.y}
                  r="13"
                  fill="none"
                  stroke={item.color}
                  strokeWidth="1.5"
                  opacity="0.45"
                  className="animate-ping"
                />
              )}

              {/* Current Session Head Circle */}
              <circle
                cx={latestPt.x}
                cy={latestPt.y}
                r={isHovered ? 6.5 : isHighlighted ? 6 : 4.8}
                fill={item.color}
                stroke="#0a0a0f"
                strokeWidth="2"
                className="transition-all duration-150"
              />

              {/* High-Contrast Symbol Label with Crisp Text Halo */}
              <text
                x={latestPt.x + 8}
                y={latestPt.y + 3.5}
                className="text-[10px] font-mono font-bold tracking-tight fill-foreground select-none"
                stroke="#0a0a0f"
                strokeWidth="3.5"
                strokeLinejoin="round"
                style={{
                  paintOrder: "stroke fill",
                }}
              >
                {item.symbol}
              </text>
            </g>
          );
        })}
      </svg>

      {/* 8. Institutional Floating Hover Tooltip */}
      {hoveredItem && mousePos && (
        <div
          className="pointer-events-none absolute z-30 w-64 rounded-xl border border-border bg-[#1c1c2e]/95 p-3.5 shadow-2xl backdrop-blur-md text-xs space-y-2.5 transition-all duration-75"
          style={tooltipStyle}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border/60 pb-2">
            <div className="min-w-0 pr-2">
              <div className="font-bold text-sm text-foreground flex items-center gap-1.5 font-mono">
                <span>{hoveredItem.symbol}</span>
                <span
                  className="h-2.5 w-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: hoveredItem.color }}
                />
              </div>
              <div className="text-[11px] text-muted-foreground truncate max-w-[150px]">
                {hoveredItem.name}
              </div>
            </div>
            <span
              className="text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 uppercase tracking-wider"
              style={{
                borderColor: `${hoveredItem.color}60`,
                backgroundColor: `${hoveredItem.color}25`,
                color: hoveredItem.color,
              }}
            >
              {hoveredItem.quadrant}
            </span>
          </div>

          {/* Numerical Rotation Metrics Grid */}
          <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
            <div>
              <span className="text-muted-foreground text-[10px] block font-sans">JdK RS-Ratio</span>
              <strong className="text-foreground tabular-nums" style={{ fontVariantNumeric: "tabular-nums" }}>
                {hoveredItem.rs_ratio.toFixed(2)}
              </strong>
            </div>
            <div>
              <span className="text-muted-foreground text-[10px] block font-sans">JdK RS-Momentum</span>
              <strong className="text-foreground tabular-nums" style={{ fontVariantNumeric: "tabular-nums" }}>
                {hoveredItem.rs_momentum.toFixed(2)}
              </strong>
            </div>
            <div>
              <span className="text-muted-foreground text-[10px] block font-sans">CMP</span>
              <strong className="text-foreground tabular-nums" style={{ fontVariantNumeric: "tabular-nums" }}>
                ₹{hoveredItem.cmp.toLocaleString()}
              </strong>
            </div>
            <div>
              <span className="text-muted-foreground text-[10px] block font-sans">1D Change</span>
              <strong
                className={`tabular-nums ${hoveredItem.change_1d >= 0 ? "text-bull" : "text-bear"}`}
                style={{ fontVariantNumeric: "tabular-nums" }}
              >
                {hoveredItem.change_1d >= 0 ? "+" : ""}
                {hoveredItem.change_1d.toFixed(2)}%
              </strong>
            </div>
          </div>

          {/* Footer Metadata */}
          <div className="text-[10px] text-muted-foreground border-t border-border/40 pt-1.5 flex items-center justify-between">
            <span>Trail: {trailLength} periods</span>
            {hoveredItem.group === "top-momentum" && (
              <span className="text-accent font-semibold">Click to inspect chart →</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
