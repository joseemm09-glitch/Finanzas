'use client';

import React from 'react';
import { PiggyBank, ShieldCheck } from 'lucide-react';
import { useFinance } from '@/context/FinanceContext';
import { formatCurrency } from '@/lib/calc';

export const PatrimonioTab: React.FC = () => {
  const { state } = useFinance();

  // Ahorro Total (Inversión 15% + Fondo de Ahorro acumulado)
  const totalAhorro = state.wallets.investment15Balance + state.wallets.fondoAhorroTotal;

  // Fondo de Emergencia (Meta: 3 meses de gastos sanos = $45,000 MXN)
  const emergencyTarget = state.settings.emergencyFundTarget || 45000.00;
  const emergencyPercent = Math.min(100, Math.round((totalAhorro / emergencyTarget) * 100));
  const monthsCovered = (totalAhorro / (emergencyTarget / 3)).toFixed(1);

  // PPR Prudential
  const udiRate = state.settings.udiExchangeRate;
  const pprMxn = state.ppr.accumulatedUdis * udiRate;

  return (
    <div className="pt-4 pb-24 space-y-4 animate-in fade-in duration-150">
      <div className="px-1 pb-1">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Patrimonio
        </h2>
      </div>

      {/* 1. Ahorro Total & Fondo de Emergencia */}
      <div className="card-clean p-5 space-y-3.5 left-bar-emerald">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <PiggyBank strokeWidth={1.75} className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-tight">
                Ahorro Total Acumulado
              </div>
              <div className="text-2xl font-black font-mono text-[#1E3A8A] mt-0.5">
                {formatCurrency(totalAhorro)}
              </div>
            </div>
          </div>
        </div>

        {/* Fondo de Emergencia Progress */}
        <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-100 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-700">Fondo de Emergencia Sano</span>
            <span className="font-mono font-bold text-emerald-700">{emergencyPercent}%</span>
          </div>

          <div className="w-full bg-slate-200/70 rounded-full h-2 overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-300"
              style={{ width: `${emergencyPercent}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500">
            <span>{monthsCovered} de 3 meses cubiertos</span>
            <span>Meta: {formatCurrency(emergencyTarget)}</span>
          </div>
        </div>
      </div>

      {/* 2. PPR Prudential */}
      <div className="card-clean p-5 space-y-3 left-bar-navy">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 text-[#1E3A8A] rounded-xl">
            <ShieldCheck strokeWidth={1.75} className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-tight">
              PPR Prudential (Póliza #{state.ppr.policyNumber})
            </div>
            <div className="text-2xl font-black font-mono text-[#1E3A8A] mt-0.5">
              {formatCurrency(pprMxn)}
            </div>
          </div>
        </div>

        <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-[10px] text-slate-400 block">Años Aportados:</span>
            <span className="font-mono font-bold text-slate-800">
              {state.ppr.currentYear} de {state.ppr.totalYears} años
            </span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block">Cantidad Aportada:</span>
            <span className="font-mono font-bold text-slate-800">
              {state.ppr.accumulatedUdis.toLocaleString('es-MX')} UDIs
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
