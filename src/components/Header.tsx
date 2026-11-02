'use client';

import React from 'react';
import { Calendar, ChevronDown, CheckCircle2 } from 'lucide-react';
import { useFinance } from '@/context/FinanceContext';

export const Header: React.FC = () => {
  const { selectedMonth, setSelectedMonth } = useFinance();

  const months = [
    { value: '2026-09', label: 'Septiembre 2026' },
    { value: '2026-10', label: 'Octubre 2026' },
    { value: '2026-11', label: 'Noviembre 2026' },
    { value: '2026-12', label: 'Diciembre 2026' },
  ];

  return (
    <header className="sticky top-0 z-30 bg-app-bg/90 backdrop-blur-md pt-[max(12px,env(safe-area-inset-top))] px-4 pb-3 border-b border-slate-200/60">
      <div className="max-w-md mx-auto flex items-center justify-between">
        {/* Month Selector Pill */}
        <div className="relative">
          <label htmlFor="month-select" className="sr-only">Seleccionar mes</label>
          <div className="flex items-center gap-1.5 bg-white border border-[#E2E8F0] shadow-sm rounded-full px-3 py-1.5 cursor-pointer active:scale-98 transition-transform">
            <Calendar strokeWidth={1.75} className="w-4 h-4 text-[#1E3A8A]" />
            <select
              id="month-select"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="appearance-none bg-transparent text-sm font-semibold text-[#1E3A8A] pr-4 cursor-pointer focus:outline-none"
            >
              {months.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
            <ChevronDown strokeWidth={1.75} className="w-3.5 h-3.5 text-slate-400 -ml-3 pointer-events-none" />
          </div>
        </div>

        {/* Status Pill */}
        <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200/80 rounded-full px-2.5 py-1 text-[11px] font-medium text-emerald-800">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>Activo</span>
        </div>
      </div>
    </header>
  );
};
