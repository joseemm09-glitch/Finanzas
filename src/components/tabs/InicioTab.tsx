'use client';

import React from 'react';
import { useFinance } from '@/context/FinanceContext';
import { getMonthlyMetrics, getMonthSavingsCalendar, formatCurrency } from '@/lib/calc';

const MONTH_NAMES: Record<string, string> = {
  '01': 'Enero',
  '02': 'Febrero',
  '03': 'Marzo',
  '04': 'Abril',
  '05': 'Mayo',
  '06': 'Junio',
  '07': 'Julio',
  '08': 'Agosto',
  '09': 'Septiembre',
  '10': 'Octubre',
  '11': 'Noviembre',
  '12': 'Diciembre',
};

export const InicioTab: React.FC = () => {
  const { state, selectedMonth } = useFinance();

  const [year, month] = selectedMonth.split('-');
  const monthName = MONTH_NAMES[month] || selectedMonth;

  // Current system / demo month is '2026-11'
  const isCurrentMonth = selectedMonth === '2026-11';

  const metrics = getMonthlyMetrics(state.transactions, selectedMonth);
  const savings = getMonthSavingsCalendar(state.transactions, selectedMonth, state.settings.weekly15Target);

  return (
    <div className="pt-8 pb-24 px-2 space-y-10 animate-in fade-in duration-200">
      {/* Greeting Header */}
      <div className="space-y-1">
        <h1 className="text-3xl font-normal text-slate-800 tracking-tight">
          Hola José,
        </h1>
        <p className="text-2xl text-slate-700 tracking-tight">
          {isCurrentMonth ? (
            <>
              Así vamos en <strong className="font-bold text-[#1E3A8A]">{monthName}</strong>
            </>
          ) : (
            <>
              Así estuvo <strong className="font-bold text-[#1E3A8A]">{monthName}</strong>
            </>
          )}
        </p>
      </div>

      {/* 3 Core Minimalist Metrics */}
      <div className="card-clean p-6 space-y-6">
        {/* Ingresos */}
        <div className="flex items-baseline justify-between border-b border-slate-100 pb-4">
          <span className="text-sm font-medium text-slate-500">Ingresos</span>
          <span className="text-xl font-bold font-mono text-[#1E3A8A]">
            {formatCurrency(metrics.inflows)}
          </span>
        </div>

        {/* Egresos */}
        <div className="flex items-baseline justify-between border-b border-slate-100 pb-4">
          <span className="text-sm font-medium text-slate-500">Egresos</span>
          <span className="text-xl font-bold font-mono text-slate-800">
            {formatCurrency(metrics.outflows)}
          </span>
        </div>

        {/* Semanas Ahorro */}
        <div className="flex items-baseline justify-between pt-1">
          <span className="text-sm font-medium text-slate-500">Semanas Ahorro</span>
          <span className="text-xl font-bold font-mono text-emerald-700">
            {savings.coveredWeeks} / {savings.elapsedWeeks}
          </span>
        </div>
      </div>
    </div>
  );
};
