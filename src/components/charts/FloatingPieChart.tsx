'use client';

import React from 'react';

export interface PieChartSlice {
  label: string;
  value: number;
  color: string;
  secondaryText?: string;
}

interface FloatingPieChartProps {
  data: PieChartSlice[];
  totalLabel?: string;
  totalFormatted?: string;
  size?: number;
  strokeWidth?: number;
  emptyMessage?: string;
}

export const FloatingPieChart: React.FC<FloatingPieChartProps> = ({
  data,
  totalLabel,
  totalFormatted,
  size = 170,
  strokeWidth = 26,
  emptyMessage = 'Sin movimientos registrados',
}) => {
  const validData = data.filter((d) => d.value > 0);
  const total = validData.reduce((acc, cur) => acc + cur.value, 0);

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // Si no hay datos
  if (total <= 0) {
    return (
      <div className="bg-white/95 rounded-2xl p-5 border border-slate-100 shadow-float flex flex-col items-center justify-center text-center space-y-2">
        <div
          className="rounded-full border-4 border-dashed border-slate-200 flex items-center justify-center text-[11px] text-slate-400 font-medium"
          style={{ width: size * 0.75, height: size * 0.75 }}
        >
          {emptyMessage}
        </div>
      </div>
    );
  }

  // Si sólo hay un único dato al 100%
  const isSingle = validData.length === 1;

  let accumulatedPercent = 0;

  return (
    <div className="bg-white/95 rounded-2xl p-4 border border-slate-100 shadow-float transition-all">
      <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
        {/* Gráfica circular SVG Flotante con Donut */}
        <div className="relative flex items-center justify-center flex-shrink-0" style={{ width: size, height: size }}>
          <svg
            width={size}
            height={size}
            viewBox={`0 0 ${size} ${size}`}
            className="transform -rotate-90 filter drop-shadow-sm"
          >
            {/* Background ring */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="transparent"
              stroke="#F1F5F9"
              strokeWidth={strokeWidth}
            />

            {/* Slices */}
            {validData.map((slice, idx) => {
              const ratio = slice.value / total;
              const strokeDasharray = `${circumference * ratio} ${circumference * (1 - ratio)}`;
              const strokeDashoffset = -circumference * accumulatedPercent;
              accumulatedPercent += ratio;

              return (
                <circle
                  key={idx}
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="transparent"
                  stroke={slice.color}
                  strokeWidth={strokeWidth}
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap={isSingle ? 'round' : 'butt'}
                  className="transition-all duration-500 ease-out"
                />
              );
            })}
          </svg>

          {/* Centro flotante con Total */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-2">
            {totalLabel && (
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                {totalLabel}
              </span>
            )}
            {totalFormatted ? (
              <span className="text-sm font-black font-mono text-[#1E3A8A] leading-tight">
                {totalFormatted}
              </span>
            ) : (
              <span className="text-xs font-black font-mono text-[#1E3A8A] leading-tight">
                100%
              </span>
            )}
          </div>
        </div>

        {/* Leyenda interactiva minimalista */}
        <div className="flex flex-col justify-center space-y-2 w-full sm:w-auto">
          {validData.map((slice, idx) => {
            const percent = ((slice.value / total) * 100).toFixed(1);
            return (
              <div key={idx} className="flex items-center justify-between sm:justify-start gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0 shadow-xs"
                    style={{ backgroundColor: slice.color }}
                  />
                  <span className="font-semibold text-slate-700 truncate max-w-[110px]">
                    {slice.label}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 font-mono text-right">
                  <span className="font-bold text-slate-900">{percent}%</span>
                  {slice.secondaryText && (
                    <span className="text-[10px] text-slate-400">({slice.secondaryText})</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

