'use client';

import React, { useState } from 'react';
import { 
  Plus, 
  Minus, 
  TrendingUp, 
  Fuel, 
  Car, 
  Briefcase, 
  Clock, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Flame,
  ChevronRight,
  ClipboardPaste,
  ShieldCheck
} from 'lucide-react';
import { useFinance } from '@/context/FinanceContext';
import { getMonthlyMetrics, getWeeklyCapStatus, calculateCompounded15, formatCurrency } from '@/lib/calc';
import { InflowModal } from '@/components/modals/InflowModal';
import { OutflowModal } from '@/components/modals/OutflowModal';
import { PasteNotificationModal } from '@/components/modals/PasteNotificationModal';

interface InicioTabProps {
  onNavigateToTab: (tab: any) => void;
}

export const InicioTab: React.FC<InicioTabProps> = ({ onNavigateToTab }) => {
  const { state, selectedMonth } = useFinance();
  const [isInflowOpen, setIsInflowOpen] = useState(false);
  const [isOutflowOpen, setIsOutflowOpen] = useState(false);
  const [isPasteOpen, setIsPasteOpen] = useState(false);

  const monthly = getMonthlyMetrics(state.transactions, selectedMonth);
  const weeklyCap = getWeeklyCapStatus(state.transactions, state.settings.weekendWeeklyCap);
  const yield15 = calculateCompounded15(state.wallets.investment15Balance, state.settings.annual15YieldRate, 1);

  // Recent transactions for the current month
  const recentTransactions = state.transactions
    .filter((tx) => tx.date.startsWith(selectedMonth))
    .slice(0, 4);

  return (
    <div className="space-y-4 pb-24">
      {/* Hero Balance Card */}
      <div className="card-clean p-5 relative overflow-hidden">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Liquidez Disponible
          </span>
          <span className="text-[11px] font-mono text-slate-400">Banamex ***194</span>
        </div>

        <div className="text-3xl font-black text-[#1E3A8A] tracking-tight">
          {formatCurrency(state.wallets.banamexLiquid)}
        </div>

        {/* 3 Compact Metric Pills */}
        <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-slate-100">
          <div className="bg-emerald-50/70 border border-emerald-100 rounded-xl p-2.5">
            <div className="text-[10px] font-semibold text-emerald-800 uppercase tracking-tight">
              Ingresos
            </div>
            <div className="text-xs font-bold font-mono text-emerald-700 mt-0.5">
              +{formatCurrency(monthly.inflows)}
            </div>
          </div>

          <div className="bg-red-50/70 border border-red-100 rounded-xl p-2.5">
            <div className="text-[10px] font-semibold text-red-800 uppercase tracking-tight">
              Egresos
            </div>
            <div className="text-xs font-bold font-mono text-red-700 mt-0.5">
              -{formatCurrency(monthly.outflows)}
            </div>
          </div>

          <div className="bg-blue-50/70 border border-blue-100 rounded-xl p-2.5">
            <div className="text-[10px] font-semibold text-blue-800 uppercase tracking-tight">
              Ahorro Neto
            </div>
            <div className="text-xs font-bold font-mono text-blue-700 mt-0.5">
              {monthly.savingsRate}%
            </div>
          </div>
        </div>
      </div>

      {/* Primary Action Row (Two Large Prominent Buttons) */}
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => setIsInflowOpen(true)}
          className="bg-white border-2 border-emerald-500 hover:bg-emerald-50 text-[#1E3A8A] rounded-2xl p-3.5 shadow-sm flex items-center justify-center gap-2.5 active:scale-97 transition-all"
        >
          <div className="p-1.5 rounded-full bg-emerald-100 text-emerald-700">
            <Plus strokeWidth={2.2} className="w-4 h-4" />
          </div>
          <span className="font-bold text-sm tracking-tight">+ Ingreso</span>
        </button>

        <button
          type="button"
          onClick={() => setIsOutflowOpen(true)}
          className="bg-[#2563EB] hover:bg-blue-700 text-white rounded-2xl p-3.5 shadow-sm border border-blue-600 flex items-center justify-center gap-2.5 active:scale-97 transition-all"
        >
          <div className="p-1.5 rounded-full bg-white/20 text-white">
            <Minus strokeWidth={2.2} className="w-4 h-4" />
          </div>
          <span className="font-bold text-sm tracking-tight">- Egreso</span>
        </button>
      </div>

      {/* Ingesta Rápida Banamex Strip */}
      <button
        type="button"
        onClick={() => setIsPasteOpen(true)}
        className="w-full card-clean p-2.5 flex items-center justify-between text-left hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-blue-50 text-[#2563EB] rounded-lg">
            <ClipboardPaste strokeWidth={1.75} className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-[#1E3A8A]">Pegar Notificación Banamex</div>
            <div className="text-[10px] text-slate-500">Auto-reconstruye nómina, comedor y fondos</div>
          </div>
        </div>
        <ChevronRight strokeWidth={1.75} className="w-4 h-4 text-slate-400" />
      </button>

      {/* Key Monthly Pulse Cards (Compact) */}
      <div className="space-y-3">
        {/* Tope Fin de Semana Card */}
        <div className="card-clean p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <Flame strokeWidth={1.75} className="w-4 h-4 text-amber-500" />
              <span className="text-xs font-bold text-[#1E3A8A]">Tope Semanal (Comidas/Ocio)</span>
            </div>
            <span className="text-xs font-mono font-semibold text-slate-700">
              {formatCurrency(weeklyCap.spent)} / {formatCurrency(weeklyCap.cap)}
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                weeklyCap.status === 'exceeded'
                  ? 'bg-red-500'
                  : weeklyCap.status === 'warning'
                  ? 'bg-amber-500'
                  : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(100, weeklyCap.percent)}%` }}
            />
          </div>

          <div className="flex items-center justify-between mt-2 text-[11px] text-slate-500">
            <span>
              {weeklyCap.status === 'exceeded'
                ? 'Excedido por ' + formatCurrency(weeklyCap.spent - weeklyCap.cap)
                : 'Disponible: ' + formatCurrency(weeklyCap.remaining)}
            </span>
            <span className="font-mono">{weeklyCap.percent}% gastado</span>
          </div>
        </div>

        {/* Ahorro Semanal 15% Liquidez Card */}
        <div className="card-clean p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <TrendingUp strokeWidth={1.75} className="w-4 h-4 text-[#2563EB]" />
              <span className="text-xs font-bold text-[#1E3A8A]">Ahorro Semanal 15%</span>
            </div>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-blue-50 text-[#2563EB] font-semibold">
              Meta: $1,000/sem
            </span>
          </div>

          <div className="flex justify-between items-baseline mt-1">
            <div>
              <div className="text-[10px] text-slate-500 uppercase">Capital en Inversión</div>
              <div className="text-base font-bold font-mono text-slate-900">
                {formatCurrency(state.wallets.investment15Balance)}
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] text-slate-500 uppercase">Rendimiento Diario</div>
              <div className="text-xs font-bold font-mono text-emerald-600">
                +{formatCurrency(yield15.dailyYield)} / día
              </div>
            </div>
          </div>
        </div>

        {/* Fondos Etiquetados Mini-Cards */}
        <div className="grid grid-cols-3 gap-2">
          {/* Vale Gasolina */}
          <div className="card-clean p-3">
            <div className="flex items-center gap-1 text-[10px] font-semibold text-slate-500 mb-1">
              <Fuel strokeWidth={1.75} className="w-3.5 h-3.5 text-blue-600" />
              <span>Gasolina</span>
            </div>
            <div className="text-xs font-bold font-mono text-[#1E3A8A]">
              {formatCurrency(state.wallets.gasolineVoucher)}
            </div>
            <div className="text-[9px] text-slate-400 mt-0.5">Monedero</div>
          </div>

          {/* Fondo Vehículo */}
          <div className="card-clean p-3">
            <div className="flex items-center gap-1 text-[10px] font-semibold text-slate-500 mb-1">
              <Car strokeWidth={1.75} className="w-3.5 h-3.5 text-amber-600" />
              <span>Vehículo</span>
            </div>
            <div className="text-xs font-bold font-mono text-[#1E3A8A]">
              {formatCurrency(state.wallets.vehicleFund)}
            </div>
            <div className="text-[9px] text-slate-400 mt-0.5">Sinking Fund</div>
          </div>

          {/* Bolsa Proyectos 50% Libre */}
          <div className="card-clean p-3">
            <div className="flex items-center gap-1 text-[10px] font-semibold text-slate-500 mb-1">
              <Briefcase strokeWidth={1.75} className="w-3.5 h-3.5 text-emerald-600" />
              <span>Proyectos</span>
            </div>
            <div className="text-xs font-bold font-mono text-[#1E3A8A]">
              {formatCurrency(state.wallets.projectFreeBucket)}
            </div>
            <div className="text-[9px] text-slate-400 mt-0.5">50% Libre</div>
          </div>
        </div>
      </div>

      {/* Recent Movements Preview */}
      <div className="space-y-2 pt-2">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Movimientos Recientes
          </span>
          <button
            type="button"
            onClick={() => onNavigateToTab('movimientos')}
            className="text-xs font-semibold text-[#2563EB] flex items-center gap-0.5"
          >
            <span>Ver todo</span>
            <ChevronRight strokeWidth={1.75} className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-2">
          {recentTransactions.length === 0 ? (
            <div className="card-clean p-4 text-center text-xs text-slate-400">
              Sin movimientos registrados en este mes.
            </div>
          ) : (
            recentTransactions.map((tx) => {
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
                        <span>{tx.category}</span>
                      </div>
                    </div>
                  </div>

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
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Modals */}
      <InflowModal isOpen={isInflowOpen} onClose={() => setIsInflowOpen(false)} />
      <OutflowModal isOpen={isOutflowOpen} onClose={() => setIsOutflowOpen(false)} />
      <PasteNotificationModal isOpen={isPasteOpen} onClose={() => setIsPasteOpen(false)} />
    </div>
  );
};
