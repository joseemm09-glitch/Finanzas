'use client';

import React, { useState } from 'react';
import { 
  Building2, 
  Droplet, 
  Zap, 
  Flame, 
  Wifi, 
  ShoppingCart,
  Car,
  Fuel,
  UtensilsCrossed, 
  Compass, 
  Tv, 
  PiggyBank, 
  ChevronRight, 
  ChevronDown, 
  Plus, 
  Receipt,
  Clock,
  ArrowUpRight
} from 'lucide-react';
import { useFinance } from '@/context/FinanceContext';
import { formatCurrency } from '@/lib/calc';
import { OutflowModal } from '@/components/modals/OutflowModal';
import { TabType } from '@/components/Navigation';

interface EgresosTabProps {
  onNavigateToTab?: (tab: TabType) => void;
}

export const EgresosTab: React.FC<EgresosTabProps> = ({ onNavigateToTab }) => {
  const { state, selectedMonth } = useFinance();
  const [percentBase, setPercentBase] = useState<'nomina' | 'total'>('total');
  const [isOutflowModalOpen, setIsOutflowModalOpen] = useState(false);

  // Expanded sections
  const [expandedSection, setExpandedSection] = useState<'basicos' | 'ocio' | 'movimientos' | null>('basicos');

  // Month transactions (outflows only)
  const monthTxs = state.transactions.filter((tx) => tx.date.startsWith(selectedMonth));
  const monthOutflows = monthTxs.filter((tx) => tx.type === 'outflow');

  // Incomes for percentage calculation
  const nominaInflows = monthTxs.filter(
    (tx) => tx.type === 'inflow' && (tx.category === 'Nómina' || tx.tier === 'tier1_nomina')
  );
  const totalNomina = nominaInflows.reduce((sum, tx) => sum + tx.amount, 0);

  const totalInflows = monthTxs
    .filter((tx) => tx.type === 'inflow')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const baseIncome = percentBase === 'nomina' ? totalNomina : totalInflows;

  const calcPercent = (amount: number): string => {
    if (baseIncome <= 0) return '0%';
    return `${((amount / baseIncome) * 100).toFixed(1)}%`;
  };

  // Helper to sum by matching keywords in category or concept
  const sumItems = (keywords: string[]): number => {
    return monthOutflows
      .filter((tx) => {
        const text = `${tx.category} ${tx.concept}`.toLowerCase();
        return keywords.some((k) => text.includes(k.toLowerCase()));
      })
      .reduce((sum, tx) => sum + tx.amount, 0);
  };

  // Básicos sub-items (Renta fija de $9,500 cada día 9)
  const recordedRent = sumItems(['renta']);
  const fixedRent = state.settings.fixedRentAmount || 9500.00;
  const rentToDisplay = recordedRent > 0 ? recordedRent : fixedRent;

  const basicosItems = [
    { label: 'Renta (Fija Día 9)', icon: Building2, amount: rentToDisplay },
    { label: 'Despensa', icon: ShoppingCart, amount: sumItems(['despensa', 'super', 'mandado', 'walmart', 'heb', 'soriana', 'costco']) },
    { label: 'Servicio', icon: Zap, amount: sumItems(['servicio']) },
    { label: 'Agua', icon: Droplet, amount: sumItems(['agua']) },
    { label: 'Luz', icon: Zap, amount: sumItems(['luz', 'cfe']) },
    { label: 'Gas', icon: Flame, amount: sumItems(['gas']) },
    { label: 'Internet', icon: Wifi, amount: sumItems(['internet', 'wifi', 'fibra', 'totalplay', 'telmex']) },
    { label: 'Gasolina Vale', icon: Fuel, amount: sumItems(['gasolina', 'combustible', 'vale']) },
    { label: 'Vehículo', icon: Car, amount: sumItems(['vehículo', 'vehiculo', 'auto', 'taller', 'mantenimiento']) },
  ];
  const totalBasicos = basicosItems.reduce((sum, item) => sum + item.amount, 0);

  // Ocio sub-items (incluyendo Comida/Salida y Plataforma de Registrar Egreso)
  const ocioItems = [
    { label: 'Comida/Salida', icon: UtensilsCrossed, amount: sumItems(['comida/salida', 'comida', 'restaurante', 'almuerzo', 'cena']) },
    { label: 'Salidas', icon: Compass, amount: sumItems(['salida', 'bar', 'evento', 'concierto', 'cine']) },
    { label: 'Plataforma / Suscripciones', icon: Tv, amount: sumItems(['plataforma', 'suscripción', 'suscripcion', 'spotify', 'netflix', 'icloud', 'youtube', 'chatgpt']) },
  ];
  const totalOcio = ocioItems.reduce((sum, item) => sum + item.amount, 0);

  // Ahorro
  const ahorroAmount = monthTxs
    .filter(
      (tx) =>
        tx.category === 'Inversión Liquidez 15%' ||
        tx.category === 'Ahorro' ||
        tx.pillar === 'patrimonio_inversion'
    )
    .reduce((sum, tx) => sum + tx.amount, 0);

  return (
    <div className="pt-4 pb-24 space-y-4 animate-in fade-in duration-150">
      {/* Top Header with Base Toggle (Nómina vs Total) */}
      <div className="flex items-center justify-between pb-1">
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">Egresos</h2>
          <div className="text-[11px] text-slate-400">
            Base: {formatCurrency(baseIncome)}
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

      {/* 3 Main Pillars: Básicos, Ocio, Ahorro + Pestaña desplegable de Movimientos Recientes */}
      <div className="space-y-3">
        {/* 1. Básicos */}
        <div className="card-clean overflow-hidden left-bar-navy">
          <button
            type="button"
            onClick={() => setExpandedSection(expandedSection === 'basicos' ? null : 'basicos')}
            className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <span className="text-sm font-bold text-slate-900">Básicos</span>
              <span className="text-[11px] font-mono text-slate-500">
                ({calcPercent(totalBasicos)})
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-black font-mono text-[#1E3A8A]">
                {formatCurrency(totalBasicos)}
              </span>
              {expandedSection === 'basicos' ? (
                <ChevronDown strokeWidth={1.75} className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronRight strokeWidth={1.75} className="w-4 h-4 text-slate-400" />
              )}
            </div>
          </button>

          {expandedSection === 'basicos' && (
            <div className="px-4 pb-4 pt-1 border-t border-slate-100 space-y-2 bg-slate-50/50">
              {basicosItems.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="flex items-center justify-between text-xs py-1.5 border-b border-slate-100 last:border-none">
                    <div className="flex items-center gap-2 text-slate-700">
                      <Icon strokeWidth={1.75} className="w-3.5 h-3.5 text-slate-500" />
                      <span className="font-medium">{item.label}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-mono text-slate-400">
                        {calcPercent(item.amount)}
                      </span>
                      <span className="font-mono font-bold text-slate-800">
                        {formatCurrency(item.amount)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 2. Ocio */}
        <div className="card-clean overflow-hidden left-bar-amber">
          <button
            type="button"
            onClick={() => setExpandedSection(expandedSection === 'ocio' ? null : 'ocio')}
            className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <span className="text-sm font-bold text-slate-900">Ocio</span>
              <span className="text-[11px] font-mono text-amber-700 font-semibold">
                ({calcPercent(totalOcio)})
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-black font-mono text-slate-900">
                {formatCurrency(totalOcio)}
              </span>
              {expandedSection === 'ocio' ? (
                <ChevronDown strokeWidth={1.75} className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronRight strokeWidth={1.75} className="w-4 h-4 text-slate-400" />
              )}
            </div>
          </button>

          {expandedSection === 'ocio' && (
            <div className="px-4 pb-4 pt-1 border-t border-slate-100 space-y-2 bg-slate-50/50">
              {ocioItems.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="flex items-center justify-between text-xs py-1.5 border-b border-slate-100 last:border-none">
                    <div className="flex items-center gap-2 text-slate-700">
                      <Icon strokeWidth={1.75} className="w-3.5 h-3.5 text-amber-600" />
                      <span className="font-medium">{item.label}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-mono text-slate-400">
                        {calcPercent(item.amount)}
                      </span>
                      <span className="font-mono font-bold text-slate-800">
                        {formatCurrency(item.amount)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 3. Ahorro (con enlace a pestaña Ahorro) */}
        <div className="card-clean p-4 flex items-center justify-between left-bar-emerald">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <PiggyBank strokeWidth={1.75} className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-900">Ahorro</span>
                <span className="text-[11px] font-mono font-semibold text-emerald-700">
                  ({calcPercent(ahorroAmount)})
                </span>
              </div>
              <button
                type="button"
                onClick={() => onNavigateToTab && onNavigateToTab('ahorro')}
                className="text-[10px] text-[#2563EB] hover:underline font-semibold mt-0.5 flex items-center gap-0.5"
              >
                <span>Ver calendario semanal</span>
                <ChevronRight strokeWidth={1.75} className="w-3 h-3" />
              </button>
            </div>
          </div>
          <div className="text-base font-black font-mono text-emerald-700">
            {formatCurrency(ahorroAmount)}
          </div>
        </div>

        {/* 4. Movimientos Registrados del Mes (Pestaña desplegable / acordeón) */}
        <div className="card-clean overflow-hidden">
          <button
            type="button"
            onClick={() => setExpandedSection(expandedSection === 'movimientos' ? null : 'movimientos')}
            className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 bg-slate-100 text-slate-600 rounded-lg">
                <Receipt strokeWidth={1.75} className="w-4 h-4" />
              </div>
              <div>
                <span className="text-sm font-bold text-slate-900 block">Movimientos del Mes</span>
                <span className="text-[11px] text-slate-400">
                  {monthOutflows.length} {monthOutflows.length === 1 ? 'egreso registrado' : 'egresos registrados'}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500">
                {expandedSection === 'movimientos' ? 'Ocultar' : 'Ver todos'}
              </span>
              {expandedSection === 'movimientos' ? (
                <ChevronDown strokeWidth={1.75} className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronRight strokeWidth={1.75} className="w-4 h-4 text-slate-400" />
              )}
            </div>
          </button>

          {expandedSection === 'movimientos' && (
            <div className="px-4 pb-4 pt-1 border-t border-slate-100 space-y-2 bg-slate-50/50">
              {monthOutflows.length === 0 ? (
                <div className="py-4 text-center text-xs text-slate-400">
                  No hay movimientos de egreso registrados en este mes
                </div>
              ) : (
                monthOutflows.map((tx) => (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between py-2 border-b border-slate-100 last:border-none text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-red-50 text-red-600 flex items-center justify-center flex-shrink-0">
                        <ArrowUpRight strokeWidth={1.75} className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-semibold text-slate-800">{tx.concept}</div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-1.5">
                          <span>{tx.date}</span>
                          {tx.timestamp && (
                            <>
                              <span>•</span>
                              <span className="flex items-center gap-0.5">
                                <Clock strokeWidth={1.75} className="w-2.5 h-2.5" />
                                {tx.timestamp}
                              </span>
                            </>
                          )}
                          <span>•</span>
                          <span className="font-medium text-slate-500">{tx.category}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-bold text-red-600">
                        -{formatCurrency(tx.amount)}
                      </div>
                      <div className="text-[9px] text-slate-400 capitalize">
                        {tx.source.replace('_', ' ')}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Button: + Registrar Egreso */}
      <button
        type="button"
        onClick={() => setIsOutflowModalOpen(true)}
        className="w-full py-3 bg-[#2563EB] hover:bg-blue-700 text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-2 shadow-sm active:scale-98 transition-all"
      >
        <Plus strokeWidth={2} className="w-4 h-4 text-white" />
        <span>Registrar Egreso</span>
      </button>

      {/* Outflow Modal */}
      <OutflowModal isOpen={isOutflowModalOpen} onClose={() => setIsOutflowModalOpen(false)} />
    </div>
  );
};

