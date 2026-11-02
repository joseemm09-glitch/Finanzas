'use client';

import React, { useState } from 'react';
import { PiggyBank, CheckCircle2, Clock, Plus, Calendar, Check, TrendingUp } from 'lucide-react';
import { useFinance } from '@/context/FinanceContext';
import { formatCurrency, getMonthSavingsCalendar } from '@/lib/calc';

export const AhorroTab: React.FC = () => {
  const { state, selectedMonth, addTransaction } = useFinance();
  const [percentBase, setPercentBase] = useState<'nomina' | 'total'>('total');

  // Modal to record savings
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [amount, setAmount] = useState('1000.00');
  const [targetDate, setTargetDate] = useState('2026-11-04');

  const savingsCalendar = getMonthSavingsCalendar(
    state.transactions,
    selectedMonth,
    state.settings.weekly15Target
  );

  // Inflows for percentage calculation
  const monthTxs = state.transactions.filter((tx) => tx.date.startsWith(selectedMonth));
  const totalNomina = monthTxs
    .filter((tx) => tx.type === 'inflow' && (tx.category === 'Nómina' || tx.tier === 'tier1_nomina'))
    .reduce((sum, tx) => sum + tx.amount, 0);

  const totalInflows = monthTxs
    .filter((tx) => tx.type === 'inflow')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const baseIncome = percentBase === 'nomina' ? totalNomina : totalInflows;
  const savingsPercent = baseIncome > 0
    ? ((savingsCalendar.totalSaved / baseIncome) * 100).toFixed(1)
    : '0.0';

  const handleSaveAhorro = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(amount);
    if (!val || val <= 0) return;

    addTransaction({
      date: targetDate,
      timestamp: '18:00',
      type: 'outflow',
      amount: val,
      concept: 'Aporte Semanal Ahorro 15%',
      category: 'Inversión Liquidez 15%',
      pillar: 'patrimonio_inversion',
      source: 'banamex_194',
    });

    setIsRecordModalOpen(false);
  };

  return (
    <div className="pt-4 pb-24 space-y-4 animate-in fade-in duration-150">
      {/* Header and Toggle Base */}
      <div className="flex items-center justify-between pb-1">
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Control de Ahorro
          </h2>
          <div className="text-[11px] text-slate-400">
            Meta: {formatCurrency(state.settings.weekly15Target)} / sem
          </div>
        </div>

        {/* Toggle Button Nómina / Total */}
        <div className="flex items-center bg-slate-200/80 p-0.5 rounded-full text-xs font-semibold">
          <button
            type="button"
            onClick={() => setPercentBase('nomina')}
            className={`px-3 py-1 rounded-full transition-all ${
              percentBase === 'nomina'
                ? 'bg-white text-[#1E3A8A] shadow-sm font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Nómina
          </button>
          <button
            type="button"
            onClick={() => setPercentBase('total')}
            className={`px-3 py-1 rounded-full transition-all ${
              percentBase === 'total'
                ? 'bg-white text-[#1E3A8A] shadow-sm font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Total
          </button>
        </div>
      </div>

      {/* Summary Card */}
      <div className="card-clean p-4 space-y-3 left-bar-emerald">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <PiggyBank strokeWidth={1.75} className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-800">Ahorro del Mes</div>
              <div className="text-[11px] font-mono font-semibold text-emerald-700">
                {savingsPercent}% de {percentBase === 'nomina' ? 'Nómina' : 'Ingreso Total'}
              </div>
            </div>
          </div>
          <div className="text-xl font-black font-mono text-emerald-700">
            {formatCurrency(savingsCalendar.totalSaved)}
          </div>
        </div>

        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Semanas cubiertas:</span>
          <span className="font-mono font-bold text-slate-800">
            {savingsCalendar.coveredWeeks} de {savingsCalendar.totalWeeks} semanas ({savingsCalendar.elapsedWeeks} transcurridas)
          </span>
        </div>
      </div>

      {/* Button: + Anotar Ahorro Semanal */}
      <button
        type="button"
        onClick={() => {
          // Default target date to upcoming wednesday
          if (savingsCalendar.weeks.length > 0) {
            setTargetDate(savingsCalendar.weeks[0].wednesdayDate);
          }
          setIsRecordModalOpen(true);
        }}
        className="w-full py-3 bg-[#2563EB] hover:bg-blue-700 text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-2 shadow-sm active:scale-98 transition-all"
      >
        <Plus strokeWidth={2} className="w-4 h-4 text-white" />
        <span>+ Anotar Ahorro Semanal</span>
      </button>

      {/* Weekly Savings Calendar Cards */}
      <div className="space-y-2.5 pt-1">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Calendario de Ahorro Semanal
          </span>
          <span className="text-[10px] text-slate-400">Depósito miércoles</span>
        </div>

        {savingsCalendar.weeks.map((week) => {
          const isCovered = week.isCovered;
          return (
            <div
              key={week.weekIndex}
              className={`p-3.5 rounded-2xl border transition-all ${
                isCovered
                  ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950 shadow-sm'
                  : 'bg-white border-slate-200 text-slate-800'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center ${
                      isCovered
                        ? 'bg-emerald-500 text-white'
                        : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    {isCovered ? (
                      <Check strokeWidth={2.5} className="w-3.5 h-3.5" />
                    ) : (
                      <Clock strokeWidth={1.75} className="w-3.5 h-3.5" />
                    )}
                  </div>
                  <div>
                    <div className="text-xs font-bold">
                      {week.label}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      Miércoles {week.wednesdayDate.split('-')[2]}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div
                    className={`text-sm font-black font-mono ${
                      isCovered ? 'text-emerald-800' : 'text-slate-600'
                    }`}
                  >
                    {formatCurrency(week.amountSaved)}
                  </div>
                  <div
                    className={`text-[10px] font-semibold ${
                      isCovered ? 'text-emerald-700' : 'text-slate-400'
                    }`}
                  >
                    {isCovered ? 'Cubierta ($1,000+)' : 'Pendiente'}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Record Savings Modal */}
      {isRecordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/40 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-[#1E3A8A]">Anotar Ahorro Semanal</h3>
              <button
                type="button"
                onClick={() => setIsRecordModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveAhorro} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-500 block mb-1">
                  Monto a Ingresar (MXN)
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-lg font-bold font-mono text-emerald-700"
                />
                <div className="flex gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => setAmount('1000.00')}
                    className="flex-1 py-1 text-xs bg-emerald-50 text-emerald-700 font-semibold rounded-lg border border-emerald-200"
                  >
                    $1,000 (Meta)
                  </button>
                  <button
                    type="button"
                    onClick={() => setAmount('1500.00')}
                    className="flex-1 py-1 text-xs bg-slate-100 text-slate-700 font-semibold rounded-lg"
                  >
                    $1,500
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500 block mb-1">
                  Semana / Fecha
                </label>
                <select
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                >
                  {savingsCalendar.weeks.map((w) => (
                    <option key={w.wednesdayDate} value={w.wednesdayDate}>
                      {w.label} (Miércoles {w.wednesdayDate})
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-sm active:scale-98 transition-all"
              >
                Confirmar y Cubrir Semana
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
