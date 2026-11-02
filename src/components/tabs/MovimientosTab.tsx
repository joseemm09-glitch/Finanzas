'use client';

import React, { useState } from 'react';
import { 
  ArrowLeftRight, 
  Trash2, 
  Tv, 
  Check, 
  Calendar, 
  Layers, 
  Filter,
  CreditCard,
  TrendingDown,
  ArrowDownLeft,
  ArrowUpRight
} from 'lucide-react';
import { useFinance } from '@/context/FinanceContext';
import { formatCurrency, getMonthlyMetrics } from '@/lib/calc';
import { ExpensePillar, Transaction } from '@/types/finance';

export const MovimientosTab: React.FC = () => {
  const { state, selectedMonth, deleteTransaction, toggleSubscription } = useFinance();
  const [viewMode, setViewMode] = useState<'mensual' | 'anual'>('mensual');
  const [subTab, setSubTab] = useState<'movimientos' | 'plataformas'>('movimientos');
  const [selectedPillar, setSelectedPillar] = useState<string>('todos');

  // Filter transactions
  const currentYear = selectedMonth.split('-')[0];
  const filteredByPeriod = state.transactions.filter((tx) => {
    if (viewMode === 'mensual') {
      return tx.date.startsWith(selectedMonth);
    } else {
      return tx.date.startsWith(currentYear);
    }
  });

  const filteredTransactions = filteredByPeriod.filter((tx) => {
    if (selectedPillar === 'todos') return true;
    if (selectedPillar === 'ingresos') return tx.type === 'inflow';
    return tx.pillar === selectedPillar;
  });

  // Calculate category totals for outflows
  const outflowTxs = filteredByPeriod.filter((tx) => tx.type === 'outflow');
  const totalOutflows = outflowTxs.reduce((sum, t) => sum + t.amount, 0);

  const categoryMap = new Map<string, { amount: number; pillar?: ExpensePillar }>();
  outflowTxs.forEach((tx) => {
    const existing = categoryMap.get(tx.category) || { amount: 0, pillar: tx.pillar };
    existing.amount += tx.amount;
    categoryMap.set(tx.category, existing);
  });

  const categoryBreakdown = Array.from(categoryMap.entries()).map(([name, data]) => ({
    name,
    amount: data.amount,
    percentage: totalOutflows > 0 ? Math.round((data.amount / totalOutflows) * 100) : 0,
    pillar: data.pillar,
  })).sort((a, b) => b.amount - a.amount);

  // Subscriptions calculations
  const activeSubs = state.subscriptions.filter((s) => s.active);
  const monthlyBurn = activeSubs.reduce((sum, s) => sum + s.monthlyAmount, 0);
  const annualBurn = monthlyBurn * 12;

  return (
    <div className="space-y-4 pb-24">
      {/* Top Toggle Row */}
      <div className="flex items-center justify-between gap-2">
        {/* Main Tab: Movimientos vs Plataformas */}
        <div className="flex bg-slate-200/80 p-0.5 rounded-xl text-xs font-semibold">
          <button
            type="button"
            onClick={() => setSubTab('movimientos')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              subTab === 'movimientos'
                ? 'bg-white text-[#1E3A8A] shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Ledger
          </button>
          <button
            type="button"
            onClick={() => setSubTab('plataformas')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 ${
              subTab === 'plataformas'
                ? 'bg-white text-[#1E3A8A] shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Tv strokeWidth={1.75} className="w-3.5 h-3.5" />
            <span>Plataformas</span>
          </button>
        </div>

        {/* Mensual vs Anual Toggle */}
        <div className="flex bg-slate-200/80 p-0.5 rounded-xl text-xs font-semibold">
          <button
            type="button"
            onClick={() => setViewMode('mensual')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              viewMode === 'mensual'
                ? 'bg-white text-[#1E3A8A] shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Mensual
          </button>
          <button
            type="button"
            onClick={() => setViewMode('anual')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              viewMode === 'anual'
                ? 'bg-white text-[#1E3A8A] shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Anual
          </button>
        </div>
      </div>

      {subTab === 'movimientos' ? (
        <>
          {/* Exact Category Breakdown Card with Checador style vertical bars */}
          <div className="card-clean p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Distribución por Categoría ({viewMode === 'mensual' ? selectedMonth : currentYear})
              </span>
              <span className="text-xs font-mono font-bold text-slate-800">
                Total: {formatCurrency(totalOutflows)}
              </span>
            </div>

            {categoryBreakdown.length === 0 ? (
              <div className="text-center py-4 text-xs text-slate-400">
                Sin egresos registrados en este periodo.
              </div>
            ) : (
              <div className="space-y-2.5">
                {categoryBreakdown.map((item) => {
                  let barClass = 'border-l-4 border-slate-400';
                  if (item.pillar === 'costo_operativo') barClass = 'border-l-4 border-blue-600';
                  else if (item.pillar === 'discrecional') barClass = 'border-l-4 border-amber-500';
                  else if (item.pillar === 'provisiones') barClass = 'border-l-4 border-purple-500';
                  else if (item.pillar === 'patrimonio_inversion') barClass = 'border-l-4 border-emerald-500';

                  return (
                    <div
                      key={item.name}
                      className={`bg-slate-50/70 p-2.5 rounded-xl pl-3 flex items-center justify-between ${barClass}`}
                    >
                      <div>
                        <div className="text-xs font-bold text-slate-800">{item.name}</div>
                        <div className="text-[10px] text-slate-400 capitalize">
                          {item.pillar ? item.pillar.replace('_', ' ') : 'General'}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-mono font-bold text-slate-900">
                          {formatCurrency(item.amount)}
                        </div>
                        <div className="text-[10px] font-mono text-slate-500 font-medium">
                          {item.percentage}%
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Filter Chips */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 pt-1 no-scrollbar text-xs">
            {[
              { id: 'todos', label: 'Todos' },
              { id: 'ingresos', label: 'Ingresos' },
              { id: 'costo_operativo', label: 'Operativo' },
              { id: 'discrecional', label: 'Discrecional' },
              { id: 'provisiones', label: 'Provisiones' },
              { id: 'patrimonio_inversion', label: 'Patrimonio' },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setSelectedPillar(f.id)}
                className={`px-3 py-1.5 rounded-full whitespace-nowrap font-medium transition-all ${
                  selectedPillar === f.id
                    ? 'bg-[#1E3A8A] text-white shadow-sm'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Transaction Ledger */}
          <div className="space-y-2">
            {filteredTransactions.length === 0 ? (
              <div className="card-clean p-6 text-center text-xs text-slate-400">
                No hay movimientos con el filtro seleccionado.
              </div>
            ) : (
              filteredTransactions.map((tx) => {
                const isInflow = tx.type === 'inflow';
                return (
                  <div
                    key={tx.id}
                    className={`card-clean p-3 flex items-center justify-between ${
                      isInflow ? 'left-bar-emerald' : 'left-bar-crimson'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`p-1.5 rounded-lg ${
                          isInflow ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
                        }`}
                      >
                        {isInflow ? (
                          <ArrowDownLeft strokeWidth={1.75} className="w-4 h-4" />
                        ) : (
                          <ArrowUpRight strokeWidth={1.75} className="w-4 h-4" />
                        )}
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-slate-800 leading-tight">
                          {tx.concept}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1.5">
                          <span>{tx.date}</span>
                          <span>•</span>
                          <span className="font-medium text-slate-600">{tx.category}</span>
                          {tx.tier && (
                            <>
                              <span>•</span>
                              <span className="text-blue-600">{tx.tier.replace('tier', 'Nivel ')}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div
                          className={`text-xs font-bold font-mono ${
                            isInflow ? 'text-emerald-700' : 'text-slate-900'
                          }`}
                        >
                          {isInflow ? '+' : '-'}
                          {formatCurrency(tx.amount)}
                        </div>
                        <div className="text-[10px] text-slate-400 capitalize">
                          {tx.source === 'banamex_194' ? 'Banamex' : tx.source.replace('_', ' ')}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => deleteTransaction(tx.id)}
                        className="text-slate-300 hover:text-red-500 p-1 transition-colors"
                        title="Eliminar movimiento"
                      >
                        <Trash2 strokeWidth={1.75} className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </>
      ) : (
        /* Plataformas y Suscripciones View */
        <div className="space-y-4">
          {/* Burn Rate Summary Card */}
          <div className="card-clean p-4">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Burn Rate de Plataformas
            </div>
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Gasto Mensual</div>
                <div className="text-lg font-black font-mono text-[#1E3A8A] mt-0.5">
                  {formatCurrency(monthlyBurn)}
                </div>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Proyección Anual</div>
                <div className="text-lg font-black font-mono text-red-600 mt-0.5">
                  {formatCurrency(annualBurn)}
                </div>
              </div>
            </div>
          </div>

          {/* Subscriptions List */}
          <div className="card-clean p-4 space-y-3">
            <div className="text-xs font-bold text-[#1E3A8A] pb-2 border-b border-slate-100 flex items-center justify-between">
              <span>Suscripciones Activas ({activeSubs.length})</span>
              <span className="text-[11px] text-slate-400">Cargo automático</span>
            </div>

            <div className="space-y-2">
              {state.subscriptions.map((sub) => (
                <div
                  key={sub.id}
                  className="p-3 bg-slate-50/70 rounded-xl border border-slate-100 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => toggleSubscription(sub.id)}
                      className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all ${
                        sub.active
                          ? 'bg-[#2563EB] border-[#2563EB] text-white'
                          : 'border-slate-300 bg-white text-transparent'
                      }`}
                    >
                      <Check strokeWidth={2.5} className="w-3.5 h-3.5" />
                    </button>
                    <div>
                      <div
                        className={`text-xs font-bold ${
                          sub.active ? 'text-slate-800' : 'text-slate-400 line-through'
                        }`}
                      >
                        {sub.name}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        Día de cobro: {sub.billingDay} • {sub.paymentSource === 'banamex_194' ? 'Banamex ***194' : sub.paymentSource}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs font-bold font-mono text-slate-900">
                      {formatCurrency(sub.monthlyAmount)}
                    </div>
                    <div className="text-[10px] text-slate-400">/ mes</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

