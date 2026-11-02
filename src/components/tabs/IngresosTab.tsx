'use client';

import React, { useState } from 'react';
import { Plus, Landmark, Compass, ChevronDown, ChevronUp } from 'lucide-react';
import { useFinance } from '@/context/FinanceContext';
import { formatCurrency } from '@/lib/calc';
import { InflowModal } from '@/components/modals/InflowModal';

export const IngresosTab: React.FC = () => {
  const { state, selectedMonth } = useFinance();
  const [isInflowModalOpen, setIsInflowModalOpen] = useState(false);
  const [showDetail, setShowDetail] = useState(false);

  // Filter inflows for selected month
  const monthInflows = state.transactions.filter(
    (tx) => tx.type === 'inflow' && tx.date.startsWith(selectedMonth)
  );

  // Group by Nómina vs Proyectos
  const nominaTxs = monthInflows.filter(
    (tx) =>
      tx.category === 'Nómina' ||
      tx.tier === 'tier1_nomina' ||
      tx.concept.toLowerCase().includes('nómina')
  );

  const proyectosTxs = monthInflows.filter(
    (tx) =>
      tx.category === 'Ingeniería Independiente' ||
      tx.tier === 'tier3_estructuras' ||
      tx.concept.toLowerCase().includes('proyecto') ||
      tx.concept.toLowerCase().includes('cálculo')
  );

  const otherTxs = monthInflows.filter(
    (tx) => !nominaTxs.includes(tx) && !proyectosTxs.includes(tx)
  );

  const totalNomina = nominaTxs.reduce((sum, tx) => sum + tx.amount, 0);
  const totalProyectos = proyectosTxs.reduce((sum, tx) => sum + tx.amount, 0);
  const totalOther = otherTxs.reduce((sum, tx) => sum + tx.amount, 0);
  const totalIncome = totalNomina + totalProyectos + totalOther;

  return (
    <div className="pt-4 pb-24 space-y-4 animate-in fade-in duration-150">
      {/* Header Total */}
      <div className="flex items-center justify-between px-1">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Ingresos del Mes
        </h2>
        <span className="text-xs font-mono font-bold text-[#1E3A8A]">
          Total: {formatCurrency(totalIncome)}
        </span>
      </div>

      {/* Clean 2-Item Counter: Nómina & Proyectos */}
      <div className="space-y-3">
        {/* Nómina */}
        <div className="card-clean p-5 flex items-center justify-between left-bar-navy">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 text-[#1E3A8A] rounded-xl">
              <Landmark strokeWidth={1.75} className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-slate-800">Nómina</div>
              <div className="text-[11px] text-slate-400">
                {nominaTxs.length} {nominaTxs.length === 1 ? 'depósito registrado' : 'depósitos registrados'}
              </div>
            </div>
          </div>
          <div className="text-lg font-black font-mono text-[#1E3A8A]">
            {formatCurrency(totalNomina)}
          </div>
        </div>

        {/* Proyectos */}
        <div className="card-clean p-5 flex items-center justify-between left-bar-blue">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 text-[#2563EB] rounded-xl">
              <Compass strokeWidth={1.75} className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-slate-800">Proyectos</div>
              <div className="text-[11px] text-slate-400">
                {proyectosTxs.length} {proyectosTxs.length === 1 ? 'proyecto registrado' : 'proyectos registrados'}
              </div>
            </div>
          </div>
          <div className="text-lg font-black font-mono text-[#2563EB]">
            {formatCurrency(totalProyectos)}
          </div>
        </div>

        {totalOther > 0 && (
          <div className="card-clean p-4 flex items-center justify-between text-xs">
            <span className="text-slate-600 font-medium">Otros Ingresos / Prestaciones</span>
            <span className="font-mono font-bold text-slate-800">{formatCurrency(totalOther)}</span>
          </div>
        )}
      </div>

      {/* Button: + Registrar Ingreso */}
      <button
        type="button"
        onClick={() => setIsInflowModalOpen(true)}
        className="w-full py-3 bg-white border border-slate-200 hover:bg-slate-50 text-[#1E3A8A] font-semibold text-xs rounded-xl flex items-center justify-center gap-2 shadow-sm active:scale-98 transition-all"
      >
        <Plus strokeWidth={2} className="w-4 h-4 text-[#2563EB]" />
        <span>Registrar Ingreso</span>
      </button>

      {/* Optional Collapsible Detail List */}
      {monthInflows.length > 0 && (
        <div className="pt-2">
          <button
            type="button"
            onClick={() => setShowDetail(!showDetail)}
            className="flex items-center justify-between w-full text-xs text-slate-500 font-semibold px-1 py-1"
          >
            <span>Detalle de movimientos ({monthInflows.length})</span>
            {showDetail ? (
              <ChevronUp strokeWidth={1.75} className="w-4 h-4" />
            ) : (
              <ChevronDown strokeWidth={1.75} className="w-4 h-4" />
            )}
          </button>

          {showDetail && (
            <div className="space-y-2 mt-2">
              {monthInflows.map((tx) => (
                <div key={tx.id} className="card-clean p-3 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-semibold text-slate-800">{tx.concept}</div>
                    <div className="text-[10px] text-slate-400">{tx.date} • {tx.category}</div>
                  </div>
                  <div className="font-mono font-bold text-emerald-700">
                    +{formatCurrency(tx.amount)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Inflow Modal */}
      <InflowModal isOpen={isInflowModalOpen} onClose={() => setIsInflowModalOpen(false)} />
    </div>
  );
};

