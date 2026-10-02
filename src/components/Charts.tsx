import React, { useState } from 'react';

// --- BAR CHART ---
interface BarChartProps {
  data: { label: string; value: number; subLabel?: string; color?: string }[];
  height?: number;
  valueSuffix?: string;
}

export const BarChart: React.FC<BarChartProps> = ({
  data,
  height = 200,
  valueSuffix = ''
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return <div className="text-center py-8 text-xs text-slate-400">Tiada data untuk dipaparkan</div>;
  }

  const maxValue = Math.max(...data.map(d => d.value), 1);

  return (
    <div className="w-full">
      <div
        className="flex items-end gap-2 sm:gap-3 w-full pt-6 pb-2"
        style={{ height: `${height}px` }}
      >
        {data.map((item, idx) => {
          const heightPercent = Math.max((item.value / maxValue) * 100, 6);
          const isHovered = hoveredIdx === idx;
          const barColor = item.color || '#4f46e5';

          return (
            <div
              key={idx}
              className="flex-1 flex flex-col items-center h-full justify-end group relative"
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
            >
              {/* Tooltip */}
              {isHovered && (
                <div className="absolute -top-10 z-20 bg-slate-900 text-white text-[11px] font-semibold py-1 px-2.5 rounded shadow-lg whitespace-nowrap pointer-events-none animate-in fade-in-50">
                  {item.label}: {item.value} {valueSuffix}
                </div>
              )}

              {/* Bar */}
              <div className="w-full max-w-[42px] bg-slate-100 rounded-t-lg overflow-hidden flex flex-col justify-end h-full">
                <div
                  className="w-full rounded-t-lg transition-all duration-300 ease-out"
                  style={{
                    height: `${heightPercent}%`,
                    backgroundColor: barColor,
                    opacity: hoveredIdx !== null && !isHovered ? 0.6 : 1,
                  }}
                />
              </div>

              {/* Label */}
              <div className="mt-2 text-center w-full">
                <p className="text-[11px] font-medium text-slate-600 truncate max-w-full">
                  {item.label}
                </p>
                {item.subLabel && (
                  <p className="text-[9px] text-slate-400 truncate">{item.subLabel}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// --- HORIZONTAL BAR CHART ---
interface HorizontalBarChartProps {
  data: { label: string; value: number; total?: number; color?: string; subText?: string }[];
  valueSuffix?: string;
}

export const HorizontalBarChart: React.FC<HorizontalBarChartProps> = ({
  data,
  valueSuffix = ''
}) => {
  const maxValue = Math.max(...data.map(d => d.total || d.value), 1);

  return (
    <div className="space-y-3 w-full">
      {data.map((item, idx) => {
        const percent = Math.round((item.value / maxValue) * 100);
        const barColor = item.color || '#0284c7';

        return (
          <div key={idx} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-800 truncate max-w-[200px]">
                {item.label}
              </span>
              <span className="text-slate-500 font-mono text-[11px]">
                {item.value} {valueSuffix} {item.subText && <span className="text-slate-400">({item.subText})</span>}
              </span>
            </div>
            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500 ease-out"
                style={{
                  width: `${percent}%`,
                  backgroundColor: barColor,
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

// --- DONUT / PIE CHART ---
interface DonutChartProps {
  data: { label: string; value: number; color: string }[];
  size?: number;
  innerRadius?: number;
}

export const DonutChart: React.FC<DonutChartProps> = ({
  data,
  size = 180,
  innerRadius = 55
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const total = data.reduce((acc, curr) => acc + curr.value, 0) || 1;

  const radius = size / 2;
  const strokeWidth = radius - innerRadius;
  const center = radius;

  // Calculate SVG arc segments
  let accumulatedAngle = 0;
  const segments = data.map((item, idx) => {
    const angle = (item.value / total) * 360;
    const startAngle = accumulatedAngle;
    accumulatedAngle += angle;
    return { ...item, idx, angle, startAngle };
  });

  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="rotate-[-90deg]">
          {segments.map((seg) => {
            const circumference = 2 * Math.PI * (radius - strokeWidth / 2);
            const strokeDasharray = `${(seg.angle / 360) * circumference} ${circumference}`;
            const strokeDashoffset = -((seg.startAngle / 360) * circumference);

            return (
              <circle
                key={seg.idx}
                cx={center}
                cy={center}
                r={radius - strokeWidth / 2}
                fill="transparent"
                stroke={seg.color}
                strokeWidth={hoveredIdx === seg.idx ? strokeWidth + 4 : strokeWidth}
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-200 cursor-pointer"
                onMouseEnter={() => setHoveredIdx(seg.idx)}
                onMouseLeave={() => setHoveredIdx(null)}
              />
            );
          })}
        </svg>

        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
          <span className="text-xl font-black text-slate-900">
            {hoveredIdx !== null ? data[hoveredIdx].value : total}
          </span>
          <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">
            {hoveredIdx !== null ? data[hoveredIdx].label : 'Jumlah'}
          </span>
        </div>
      </div>

      {/* Legend */}
      <div className="space-y-1.5 text-xs">
        {data.map((item, idx) => (
          <div
            key={idx}
            className={`flex items-center gap-2 cursor-pointer transition-opacity ${
              hoveredIdx !== null && hoveredIdx !== idx ? 'opacity-40' : 'opacity-100'
            }`}
            onMouseEnter={() => setHoveredIdx(idx)}
            onMouseLeave={() => setHoveredIdx(null)}
          >
            <span
              className="w-3 h-3 rounded-full shrink-0"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-slate-700 font-medium">{item.label}:</span>
            <span className="text-slate-900 font-bold">{item.value}</span>
            <span className="text-slate-400 text-[10px]">
              ({Math.round((item.value / total) * 100)}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
