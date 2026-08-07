import { useId } from "react";

interface SparklineProps {
  points: number[];
  color: string;
  height?: number;
}

/** 纯 SVG 迷你面积趋势图，零依赖 */
export default function Sparkline({ points, color, height = 44 }: SparklineProps) {
  const gradientId = useId();
  if (points.length < 2) return null;

  const width = 120;
  const max = Math.max(...points);
  const min = Math.min(...points);
  const range = max - min || 1;
  const step = width / (points.length - 1);
  const coords = points.map(
    (point, index) => [index * step, height - 4 - ((point - min) / range) * (height - 8)] as const,
  );
  const line = coords.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const area = `0,${height} ${line} ${width},${height}`;

  return (
    <svg
      aria-hidden
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      style={{ display: "block", width: "100%", height, marginTop: 12 }}
    >
      <title>趋势迷你图</title>
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.28} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <polygon points={area} fill={`url(#${gradientId})`} />
      <polyline
        points={line}
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
