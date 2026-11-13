"use client";

import { useEffect, useRef } from "react";

interface SparklineProps {
  data?: number[] | null;
  width?: number;
  height?: number;
  isPositive?: boolean;
}

export function Sparkline({
  data,
  width = 80,
  height = 24,
  isPositive,
}: SparklineProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Handle high DPI displays
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, width, height);

    // If no data or too few points, draw subtle reference baseline
    const points = data && data.length >= 2 ? data : [10, 10];
    const min = Math.min(...points);
    const max = Math.max(...points);
    const range = max - min || 1;

    // Determine trend color
    const positive =
      isPositive !== undefined
        ? isPositive
        : points[points.length - 1] >= points[0];
    const strokeColor = positive ? "#22c55e" : "#ef4444";
    const fillColor = positive ? "rgba(34, 197, 94, 0.12)" : "rgba(239, 68, 68, 0.12)";

    const paddingY = 3;
    const drawHeight = height - paddingY * 2;

    const coords: [number, number][] = points.map((val, idx) => {
      const x = (idx / (points.length - 1)) * width;
      const y = height - paddingY - ((val - min) / range) * drawHeight;
      return [x, y];
    });

    // Draw gradient fill under line
    ctx.beginPath();
    ctx.moveTo(coords[0][0], coords[0][1]);
    for (let i = 1; i < coords.length; i++) {
      ctx.lineTo(coords[i][0], coords[i][1]);
    }
    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.closePath();
    ctx.fillStyle = fillColor;
    ctx.fill();

    // Draw line stroke
    ctx.beginPath();
    ctx.moveTo(coords[0][0], coords[0][1]);
    for (let i = 1; i < coords.length; i++) {
      ctx.lineTo(coords[i][0], coords[i][1]);
    }
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 1.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();
  }, [data, width, height, isPositive]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: `${width}px`, height: `${height}px` }}
      className="inline-block shrink-0 align-middle"
    />
  );
}
