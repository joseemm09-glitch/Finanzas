'use client';

import React, { useState } from 'react';
import { useFinance } from '@/context/FinanceContext';
import { getMonthlyMetrics, getMonthSavingsCalendar, formatCurrency } from '@/lib/calc';
import { InflowModal } from '@/components/modals/InflowModal';
import { OutflowModal } from '@/components/modals/OutflowModal';
import { FloatingPieChart } from '@/components/charts/FloatingPieChart';

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
  const [isInflowOpen, setIsInflowOpen] = useState(false);
  const [isOutflowOpen, setIsOutflowOpen] = useState(false);

  const [, month] = selectedMonth.split('-');
  const monthName = MONTH_NAMES[month] || selectedMonth;

  // Current system / demo month is '2026-11'
  const isCurrentMonth = selectedMonth === '2026-11';

  const metrics = getMonthlyMetrics(state.transactions, selectedMonth);
  const savings = getMonthSavingsCalendar(state.transactions, selectedMonth, state.settings.weekly15Target);

  return (
    <div className="pt-6 pb-24 px-2 space-y-6 animate-in fade-in duration-200">
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
      <div className="card-clean p-6 space-y-5">
        {/* Ingresos */}
        <div className="flex items-baseline justify-between border-b border-slate-100 pb-3.5">
          <span className="text-sm font-medium text-slate-500">Ingresos</span>
          <span className="text-xl font-bold font-mono text-[#1E3A8A]">
            {formatCurrency(metrics.inflows)}
          </span>
        </div>

        {/* Egresos */}
        <div className="flex items-baseline justify-between border-b border-slate-100 pb-3.5">
          <span className="text-sm font-medium text-slate-500">Egresos</span>
          <span className="text-xl font-bold font-mono text-slate-800">
            {formatCurrency(metrics.outflows)}
          </span>
        </div>

        {/* Semanas Ahorro */}
        <div className="flex items-baseline justify-between pt-0.5">
          <span className="text-sm font-medium text-slate-500">Semanas Ahorro</span>
          <span className="text-xl font-bold font-mono text-emerald-700">
            {savings.coveredWeeks} / {savings.elapsedWeeks}
          </span>
        </div>
      </div>

      {/* Gráfica de pastel flotante: Balance / Distribución del Mes */}
      {(metrics.inflows > 0 || metrics.outflows > 0) && (
        <div className="space-y-1">
          <div className="px-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Distribución del Mes
          </div>
          <FloatingPieChart
            totalLabel="Flujo Total"
            totalFormatted={formatCurrency(metrics.inflows + metrics.outflows)}
            data={[
              {
                label: 'Ingresos',
                value: metrics.inflows,
                color: '#2563EB',
                secondaryText: formatCurrency(metrics.inflows),
              },
              {
                label: 'Egresos',
                value: metrics.outflows,
                color: '#DC2626',
                secondaryText: formatCurrency(metrics.outflows),
              },
            ]}
          />
        </div>
      )}

      {/* Dos botones grandes en azul con letras blancas en negritas: Ingreso / Egreso */}
      <div className="grid grid-cols-2 gap-3 pt-2">
        <button
          type="button"
          onClick={() => setIsInflowOpen(true)}
          className="w-full py-4 bg-[#2563EB] hover:bg-blue-700 active:scale-98 text-white rounded-2xl font-bold text-base shadow-sm tracking-wide transition-all text-center"
        >
          Ingreso
        </button>

        <button
          type="button"
          onClick={() => setIsOutflowOpen(true)}
          className="w-full py-4 bg-[#2563EB] hover:bg-blue-700 active:scale-98 text-white rounded-2xl font-bold text-base shadow-sm tracking-wide transition-all text-center"
        >
          Egreso
        </button>
      </div>

      {/* Modals for Quick Entry */}
      <InflowModal isOpen={isInflowOpen} onClose={() => setIsInflowOpen(false)} />
      <OutflowModal isOpen={isOutflowOpen} onClose={() => setIsOutflowOpen(false)} />
    </div>
  );
};
