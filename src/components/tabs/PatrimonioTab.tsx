'use client';

import React, { useState } from 'react';
import { 
  TrendingUp, 
  ShieldCheck, 
  PiggyBank, 
  Briefcase, 
  Calendar, 
  Calculator, 
  ChevronRight,
  Info,
  RefreshCw,
  Clock
} from 'lucide-react';
import { useFinance } from '@/context/FinanceContext';
import { calculateNetWorth, calculateCompounded15, formatCurrency } from '@/lib/calc';

export const PatrimonioTab: React.FC = () => {
  const { state, updateUDI } = useFinance();
  const [editingUdi, setEditingUdi] = useState(false);
  const [udiInput, setUdiInput] = useState(state.settings.udiExchangeRate.toString());
  const [simDays, setSimDays] = useState<number>(30);

  const netWorth = calculateNetWorth(state);
  const yieldDaily = calculateCompounded15(state.wallets.investment15Balance, state.settings.annual15YieldRate, 1);
  const yieldSim = calculateCompounded15(state.wallets.investment15Balance, state.settings.annual15YieldRate, simDays);
  const yieldAnnual = calculateCompounded15(state.wallets.investment15Balance, state.settings.annual15YieldRate, 365);

  // PPR Calculations
  const udiRate = state.settings.udiExchangeRate;
  const pprAccumulatedMxn = state.ppr.accumulatedUdis * udiRate;
  const pprAnnualPaymentMxn = state.ppr.annualUdis * udiRate;
  const pprCoverageMxn = state.ppr.coverageUdis * udiRate;
  const pprProgressPercent = Math.round((state.ppr.currentYear / state.ppr.totalYears) * 100);

  // Days until next PPR payment (26 Nov 2026)
  const dueDate = new Date('2026-11-26T00:00:00');
  const today = new Date('2026-11-02T12:00:00'); // current simulated time
  const daysRemaining = Math.max(0, Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));

  const handleSaveUDI = () => {
    const val = parseFloat(udiInput);
    if (val > 0) {
      updateUDI(val);
      setEditingUdi(false);
    }
  };

  return (
    <div className="space-y-4 pb-24">
      {/* Total Net Worth Card */}
      <div className="card-clean p-5 relative overflow-hidden left-bar-navy">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Patrimonio Neto Consolidado
          </span>
          <span className="text-[11px] font-mono font-bold text-[#1E3A8A]">
            15% Activo
          </span>
        </div>

        <div className="text-3xl font-black text-[#1E3A8A] tracking-tight">
          {formatCurrency(netWorth.total)}
        </div>

        <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-100 text-xs">
          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
            <div className="text-[10px] text-slate-400 font-semibold uppercase">Inversión 15%</div>
            <div className="text-sm font-bold font-mono text-slate-800 mt-0.5">
              {formatCurrency(netWorth.inversion15)}
            </div>
          </div>

          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
            <div className="text-[10px] text-slate-400 font-semibold uppercase">Fondo de Ahorro</div>
            <div className="text-sm font-bold font-mono text-blue-700 mt-0.5">
              {formatCurrency(netWorth.fondoAhorro)}
            </div>
          </div>

          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
            <div className="text-[10px] text-slate-400 font-semibold uppercase">Prudential Retiro</div>
            <div className="text-sm font-bold font-mono text-purple-700 mt-0.5">
              {formatCurrency(netWorth.pprMxn)}
            </div>
          </div>

          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
            <div className="text-[10px] text-slate-400 font-semibold uppercase">Bolsa Proyectos (50%)</div>
            <div className="text-sm font-bold font-mono text-emerald-700 mt-0.5">
              {formatCurrency(netWorth.proyectosLibre)}
            </div>
          </div>
        </div>
      </div>

      {/* 15% Daily Compounding Card */}
      <div className="card-clean p-4 space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-50 text-[#2563EB] rounded-lg">
              <TrendingUp strokeWidth={1.75} className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-[#1E3A8A] uppercase tracking-wider">
                Inversión Liquidez 15% Anual
              </h3>
              <div className="text-[10px] text-slate-400">Interés Compuesto Diario • Meta $1,000/sem</div>
            </div>
          </div>
          <span className="text-[11px] font-mono font-bold text-emerald-700 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-100">
            15.0% Anual
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-slate-50 p-2 rounded-xl">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Generación Diaria</div>
            <div className="text-xs font-bold font-mono text-emerald-600 mt-0.5">
              +{formatCurrency(yieldDaily.dailyYield)}
            </div>
          </div>

          <div className="bg-slate-50 p-2 rounded-xl">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Rend. Mensual (30d)</div>
            <div className="text-xs font-bold font-mono text-blue-700 mt-0.5">
              +{formatCurrency(yieldSim.accruedYield)}
            </div>
          </div>

          <div className="bg-slate-50 p-2 rounded-xl">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Proyección 1 Año</div>
            <div className="text-xs font-bold font-mono text-emerald-700 mt-0.5">
              +{formatCurrency(yieldAnnual.accruedYield)}
            </div>
          </div>
        </div>

        {/* Compound Interest Formula Note */}
        <div className="p-2.5 bg-blue-50/50 rounded-xl border border-blue-100 text-[11px] text-slate-600 space-y-1">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-blue-900">Fórmula de capitalización:</span>
            <span className="font-mono text-[10px] text-blue-700">Balance × (1 + 0.15/365)^d</span>
          </div>
          <div className="text-slate-500 text-[10px]">
            Capital actual: {formatCurrency(state.wallets.investment15Balance)} MXN
          </div>
        </div>
      </div>

      {/* Prudential PPR Retiro Vida 20 Card */}
      <div className="card-clean p-4 space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-purple-50 text-purple-600 rounded-lg">
              <ShieldCheck strokeWidth={1.75} className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-[#1E3A8A] uppercase tracking-wider">
                Prudential PPR Retiro Vida 20
              </h3>
              <div className="text-[10px] text-slate-400">Póliza #{state.ppr.policyNumber} • Retiro en UDIs</div>
            </div>
          </div>
          <span className="text-[11px] font-mono font-bold text-purple-700 px-2 py-0.5 rounded-full bg-purple-50 border border-purple-100">
            Año 3 / 20
          </span>
        </div>

        {/* UDI Exchange Rate Bar */}
        <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-600">Valor UDI Actual:</span>
            {editingUdi ? (
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  step="0.0001"
                  value={udiInput}
                  onChange={(e) => setUdiInput(e.target.value)}
                  className="w-24 px-2 py-1 bg-white border border-blue-400 rounded text-xs font-mono font-bold text-slate-900"
                />
                <button
                  type="button"
                  onClick={handleSaveUDI}
                  className="px-2 py-1 bg-blue-600 text-white rounded text-xs font-semibold"
                >
                  Guardar
                </button>
              </div>
            ) : (
              <span className="text-xs font-mono font-bold text-slate-900">
                ${udiRate.toFixed(4)} MXN
              </span>
            )}
          </div>

          {!editingUdi && (
            <button
              type="button"
              onClick={() => setEditingUdi(true)}
              className="text-[11px] text-[#2563EB] hover:underline font-semibold"
            >
              Editar
            </button>
          )}
        </div>

        {/* Progress in UDIs */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-baseline text-xs">
            <span className="text-slate-500">Valor Acumulado:</span>
            <span className="font-mono font-bold text-slate-900">
              {state.ppr.accumulatedUdis.toLocaleString('es-MX')} UDIs ({formatCurrency(pprAccumulatedMxn)})
            </span>
          </div>

          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div
              className="h-full bg-purple-600 rounded-full transition-all duration-300"
              style={{ width: `${pprProgressPercent}%` }}
            />
          </div>

          <div className="flex justify-between text-[10px] text-slate-400">
            <span>Inicio: 26/11/2024</span>
            <span>Meta: {state.ppr.totalProjectedUdis.toLocaleString('es-MX')} UDIs (20 años)</span>
          </div>
        </div>

        {/* Next Annual Payment Tracker */}
        <div className="p-3 bg-purple-50/60 rounded-xl border border-purple-100 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-purple-900 flex items-center gap-1.5">
              <Calendar strokeWidth={1.75} className="w-3.5 h-3.5 text-purple-700" />
              <span>3er Pago Anual: 26 Nov 2026</span>
            </span>
            <span className="font-mono font-bold text-purple-700">
              {daysRemaining} días restantes
            </span>
          </div>

          <div className="flex justify-between items-baseline text-xs pt-1 border-t border-purple-100">
            <span className="text-slate-600">Aportación Requerida:</span>
            <div className="text-right">
              <span className="font-mono font-bold text-slate-900">
                {state.ppr.annualUdis.toLocaleString('es-MX')} UDIs
              </span>
              <span className="text-[11px] text-slate-500 block">
                (~{formatCurrency(pprAnnualPaymentMxn)})
              </span>
            </div>
          </div>

          <div className="flex justify-between items-baseline text-xs">
            <span className="text-slate-600">Provisión Mensual Sugerida:</span>
            <span className="font-mono font-bold text-slate-800">
              {formatCurrency(state.settings.pprMonthlyAccrual)} / mes
            </span>
          </div>
        </div>

        {/* Coverage */}
        <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl text-xs">
          <span className="text-slate-600">Suma Asegurada Vida / Invalidez:</span>
          <span className="font-mono font-bold text-slate-800">
            {state.ppr.coverageUdis.toLocaleString('es-MX')} UDIs ({formatCurrency(pprCoverageMxn)})
          </span>
        </div>
      </div>
    </div>
  );
};
