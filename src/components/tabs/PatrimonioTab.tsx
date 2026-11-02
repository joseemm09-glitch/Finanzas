'use client';

import React from 'react';
import { PiggyBank, ShieldCheck } from 'lucide-react';
import { useFinance } from '@/context/FinanceContext';
import { formatCurrency } from '@/lib/calc';

export const PatrimonioTab: React.FC = () => {
  const { state } = useFinance();

  // Ahorro Total (Inversión 15% + Fondo de Ahorro acumulado)
  const totalAhorro = state.wallets.investment15Balance + state.wallets.fondoAhorroTotal;

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

      {/* 1. Ahorro Total */}
      <div className="card-clean p-5 space-y-3 left-bar-emerald">
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

        <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-[10px] text-slate-400 block">Inversión Liquidez 15%:</span>
            <span className="font-mono font-bold text-slate-800">
              {formatCurrency(state.wallets.investment15Balance)}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block">Fondo de Ahorro:</span>
            <span className="font-mono font-bold text-slate-800">
              {formatCurrency(state.wallets.fondoAhorroTotal)}
            </span>
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
