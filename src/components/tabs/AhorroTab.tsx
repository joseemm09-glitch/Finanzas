'use client';

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Check, Plus, PiggyBank, Sparkles } from 'lucide-react';
import { useFinance } from '@/context/FinanceContext';
import { formatCurrency } from '@/lib/calc';

export const AhorroTab: React.FC = () => {
  const { state, selectedMonth, setSelectedMonth, addTransaction } = useFinance();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Month parsing
  const [yearStr, monthStr] = selectedMonth.split('-');
  const year = parseInt(yearStr);
  const month = parseInt(monthStr) - 1; // 0-indexed

  // Month navigation
  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const handlePrevMonth = () => {
    const prevDate = new Date(year, month - 1, 1);
    const y = prevDate.getFullYear();
    const m = String(prevDate.getMonth() + 1).padStart(2, '0');
    setSelectedMonth(`${y}-${m}`);
  };

  const handleNextMonth = () => {
    const nextDate = new Date(year, month + 1, 1);
    const y = nextDate.getFullYear();
    const m = String(nextDate.getMonth() + 1).padStart(2, '0');
    setSelectedMonth(`${y}-${m}`);
  };

  // 20% Exacto de nómina de la semana
  const sortedPayrolls = [...state.payrolls].sort((a, b) => b.date.localeCompare(a.date));
  const latestPayroll = sortedPayrolls[0];
  const previousPayroll = sortedPayrolls[1];

  const basePayrollAmount = latestPayroll ? latestPayroll.depositAmount : 5158.00;
  const exact20Percent = Math.round(basePayrollAmount * 0.20 * 100) / 100;

  // Amount input for modal
  const [amountInput, setAmountInput] = useState(exact20Percent.toFixed(2));
  const [selectedDayToSave, setSelectedDayToSave] = useState(4); // Default to Wednesday Nov 4

  // Build Calendar Matrix (Sunday to Saturday)
  const firstDayWeekday = new Date(year, month, 1).getDay(); // 0 is Sunday
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Find all savings transactions for this month
  const savingsTxs = state.transactions.filter(
    (tx) =>
      tx.category === 'Inversión Liquidez 15%' ||
      tx.category === 'Ahorro' ||
      tx.pillar === 'patrimonio_inversion' ||
      tx.concept.toLowerCase().includes('ahorro') ||
      tx.concept.toLowerCase().includes('inversión')
  );

  interface CalendarDay {
    dayNumber: number;
    dateStr: string; // 'YYYY-MM-DD'
    isWednesday: boolean;
  }

  interface CalendarWeek {
    weekIndex: number;
    days: (CalendarDay | null)[];
    amountSaved: number;
    isCovered: boolean;
    wednesdayDay?: number;
  }

  const weeks: CalendarWeek[] = [];
  let currentWeekDays: (CalendarDay | null)[] = [];

  // Pad beginning with empty slots
  for (let i = 0; i < firstDayWeekday; i++) {
    currentWeekDays.push(null);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const weekday = new Date(year, month, day).getDay();
    currentWeekDays.push({
      dayNumber: day,
      dateStr,
      isWednesday: weekday === 3,
    });

    if (currentWeekDays.length === 7 || day === daysInMonth) {
      // If last week and less than 7, pad with nulls
      while (currentWeekDays.length < 7) {
        currentWeekDays.push(null);
      }

      // Check savings for this week
      const validDays = currentWeekDays.filter((d): d is CalendarDay => d !== null);
      const minDate = validDays[0].dateStr;
      const maxDate = validDays[validDays.length - 1].dateStr;

      const weekSavingsTxs = savingsTxs.filter((tx) => tx.date >= minDate && tx.date <= maxDate);
      const amountSaved = Math.round(weekSavingsTxs.reduce((sum, t) => sum + t.amount, 0) * 100) / 100;
      const isCovered = amountSaved >= exact20Percent || amountSaved >= 1000.00;

      const wednesdayDay = validDays.find((d) => d.isWednesday)?.dayNumber;

      weeks.push({
        weekIndex: weeks.length + 1,
        days: currentWeekDays,
        amountSaved,
        isCovered,
        wednesdayDay,
      });

      currentWeekDays = [];
    }
  }

  const coveredWeeksCount = weeks.filter((w) => w.isCovered).length;

  const handleSaveAhorro = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(amountInput);
    if (!val || val <= 0) return;

    const dateToRecord = `${year}-${String(month + 1).padStart(2, '0')}-${String(selectedDayToSave).padStart(2, '0')}`;

    addTransaction({
      date: dateToRecord,
      timestamp: '18:00',
      type: 'outflow',
      amount: val,
      concept: `Ahorro Semanal 20% Nómina`,
      category: 'Inversión Liquidez 15%',
      pillar: 'patrimonio_inversion',
      source: 'banamex_194',
    });

    setIsModalOpen(false);
  };

  return (
    <div className="pt-4 pb-24 space-y-4 animate-in fade-in duration-150">
      {/* 20% Exacto Nómina Semanal Card */}
      <div className="card-clean p-4 left-bar-emerald space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
              <PiggyBank strokeWidth={1.75} className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-tight">
                20% Exacto Nómina Semanal
              </div>
              <div className="text-xl font-black font-mono text-[#1E3A8A]">
                {formatCurrency(exact20Percent)}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] text-slate-400">Base Nómina Miércoles</div>
            <div className="text-xs font-bold font-mono text-slate-700">
              {formatCurrency(basePayrollAmount)}
            </div>
          </div>
        </div>

        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <span>Semanas cubiertas en el mes:</span>
          <span className="font-mono font-bold text-emerald-700">
            {coveredWeeksCount} de {weeks.length} semanas
          </span>
        </div>
      </div>

      {/* Month Navigator Header Bar (Checador Style) */}
      <div className="card-clean px-4 py-3 flex items-center justify-between">
        <button
          type="button"
          onClick={handlePrevMonth}
          className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
        >
          <ChevronLeft strokeWidth={2} className="w-5 h-5" />
        </button>

        <h3 className="text-base font-bold text-[#1E3A8A]">
          {monthNames[month]} {year}
        </h3>

        <button
          type="button"
          onClick={handleNextMonth}
          className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
        >
          <ChevronRight strokeWidth={2} className="w-5 h-5" />
        </button>
      </div>

      {/* Full Monthly Calendar Container (Checador Style) */}
      <div className="card-clean p-4 space-y-3">
        {/* Days of Week Header */}
        <div className="grid grid-cols-7 text-center text-xs font-bold text-[#1E3A8A] pb-2 border-b border-slate-100">
          <span>Dom</span>
          <span>Lun</span>
          <span>Mar</span>
          <span>Mié</span>
          <span>Jue</span>
          <span>Vie</span>
          <span>Sáb</span>
        </div>

        {/* Calendar Rows: Each week covered in a single continuous green strip */}
        <div className="space-y-2">
          {weeks.map((week) => {
            const isCovered = week.isCovered;

            return (
              <div
                key={week.weekIndex}
                className={`relative rounded-2xl transition-all ${
                  isCovered
                    ? 'bg-emerald-500 shadow-sm'
                    : 'bg-transparent'
                }`}
              >
                {/* 7 Days Row */}
                <div className="grid grid-cols-7 text-center">
                  {week.days.map((day, idx) => {
                    if (!day) {
                      return <div key={`empty-${idx}`} className="h-11" />;
                    }

                    // Styling for continuous band
                    const isFirstInRow = idx === 0 || week.days[idx - 1] === null;
                    const isLastInRow = idx === 6 || week.days[idx + 1] === null;

                    return (
                      <div
                        key={day.dayNumber}
                        onClick={() => {
                          setSelectedDayToSave(day.dayNumber);
                          setAmountInput(exact20Percent.toFixed(2));
                          setIsModalOpen(true);
                        }}
                        className={`h-11 flex flex-col items-center justify-center cursor-pointer transition-colors ${
                          isCovered
                            ? 'text-white font-bold'
                            : 'text-[#1E3A8A] hover:bg-slate-50'
                        } ${
                          !isCovered
                            ? 'border border-[#E2E8F0] rounded-xl m-0.5 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.03)]'
                            : ''
                        } ${
                          isCovered && isFirstInRow ? 'rounded-l-2xl' : ''
                        } ${
                          isCovered && isLastInRow ? 'rounded-r-2xl' : ''
                        }`}
                      >
                        <span className="text-xs leading-none">
                          {day.dayNumber}
                        </span>
                        {/* Dot indicator */}
                        <span
                          className={`w-1 h-1 rounded-full mt-1 ${
                            isCovered
                              ? 'bg-white'
                              : day.isWednesday
                              ? 'bg-[#2563EB]'
                              : 'bg-slate-200'
                          }`}
                        />
                      </div>
                    );
                  })}
                </div>

                {/* Sub-label for week if covered */}
                {isCovered && (
                  <div className="px-3 py-1 flex items-center justify-between text-[10px] text-emerald-100 font-mono border-t border-emerald-400/40">
                    <span className="flex items-center gap-1 font-sans">
                      <Check strokeWidth={2.5} className="w-3 h-3 text-white" />
                      Semana {week.weekIndex} cubierta (20% nómina)
                    </span>
                    <span className="font-bold text-white">
                      +{formatCurrency(week.amountSaved)}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Simbología del Calendario (Checador Style) */}
        <div className="pt-3 border-t border-slate-100 space-y-1.5 text-xs">
          <div className="text-[11px] font-bold text-[#1E3A8A]">
            Simbología del Calendario:
          </div>
          <div className="flex items-center gap-2 text-slate-600 text-[11px]">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 flex-shrink-0" />
            <span>Franja Verde: Semana con ahorro del 20% nómina cubierto</span>
          </div>
          <div className="flex items-center gap-2 text-slate-600 text-[11px]">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-300 flex-shrink-0" />
            <span>Casilla Blanca: Semana pendiente de ahorro</span>
          </div>
          <div className="flex items-center gap-2 text-slate-600 text-[11px]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB] flex-shrink-0 ml-0.5" />
            <span>Punto Azul: Miércoles de corte y depósito de nómina</span>
          </div>
        </div>
      </div>

      {/* Button: + Anotar Ahorro Semanal */}
      <button
        type="button"
        onClick={() => {
          setAmountInput(exact20Percent.toFixed(2));
          setIsModalOpen(true);
        }}
        className="w-full py-3.5 bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-sm active:scale-98 transition-all"
      >
        <Plus strokeWidth={2.5} className="w-4 h-4" />
        <span>+ Anotar Ahorro Semanal (20%)</span>
      </button>

      {/* Modal to Record Weekly Savings */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/40 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-[#1E3A8A]">Anotar Ahorro Semanal</h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveAhorro} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-500 block mb-1">
                  Monto de Ahorro (MXN)
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={amountInput}
                  onChange={(e) => setAmountInput(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-lg font-bold font-mono text-emerald-700"
                />

                <div className="flex gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => setAmountInput(exact20Percent.toFixed(2))}
                    className="flex-1 py-1.5 text-xs bg-emerald-50 text-emerald-700 font-bold rounded-lg border border-emerald-200"
                  >
                    20% ({formatCurrency(exact20Percent)})
                  </button>
                  <button
                    type="button"
                    onClick={() => setAmountInput('1000.00')}
                    className="flex-1 py-1.5 text-xs bg-slate-100 text-slate-700 font-semibold rounded-lg"
                  >
                    $1,000.00
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500 block mb-1">
                  Día / Miércoles de Nómina
                </label>
                <select
                  value={selectedDayToSave}
                  onChange={(e) => setSelectedDayToSave(parseInt(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                >
                  {weeks.map((w) => {
                    const d = w.wednesdayDay || w.days.find((x) => x !== null)?.dayNumber || 1;
                    return (
                      <option key={w.weekIndex} value={d}>
                        Semana {w.weekIndex} (Día {d} de {monthNames[month]})
                      </option>
                    );
                  })}
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm active:scale-98 transition-all"
              >
                Confirmar y Cubrir Franja Semanal
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
