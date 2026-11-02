'use client';

import React, { useState } from 'react';
import { X, MinusCircle, UtensilsCrossed, ShoppingCart, Zap, Tv, Car, Fuel, Check } from 'lucide-react';
import { useFinance } from '@/context/FinanceContext';
import { ExpensePillar, PaymentSource } from '@/types/finance';

interface OutflowModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CategoryOption {
  label: string;
  pillar: ExpensePillar;
  defaultSource?: PaymentSource;
  icon: React.ElementType;
}

const CATEGORIES: CategoryOption[] = [
  { label: 'Comida/Salida', pillar: 'discrecional', icon: UtensilsCrossed },
  { label: 'Despensa', pillar: 'costo_operativo', icon: ShoppingCart },
  { label: 'Servicio', pillar: 'costo_operativo', icon: Zap },
  { label: 'Plataforma', pillar: 'discrecional', icon: Tv },
  { label: 'Vehículo', pillar: 'provisiones', defaultSource: 'fondo_vehiculo', icon: Car },
  { label: 'Gasolina Vale', pillar: 'costo_operativo', defaultSource: 'vale_gasolina', icon: Fuel },
];

export const OutflowModal: React.FC<OutflowModalProps> = ({ isOpen, onClose }) => {
  const { addTransaction, state } = useFinance();
  const [amount, setAmount] = useState<string>('');
  const [concept, setConcept] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryOption>(CATEGORIES[0]);
  const [source, setSource] = useState<PaymentSource>('banamex_194');

  if (!isOpen) return null;

  const handleSelectCategory = (cat: CategoryOption) => {
    setSelectedCategory(cat);
    if (cat.defaultSource) {
      setSource(cat.defaultSource);
    }
    if (!concept || CATEGORIES.some((c) => c.label === concept)) {
      setConcept(cat.label);
    }
  };

  const handleQuickAdd = (value: number) => {
    const current = parseFloat(amount) || 0;
    setAmount((current + value).toFixed(2));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount) || 0;
    if (parsedAmount <= 0) return;

    addTransaction({
      date: new Date().toISOString().split('T')[0],
      timestamp: new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: false }),
      type: 'outflow',
      amount: parsedAmount,
      concept: concept || selectedCategory.label,
      category: selectedCategory.label,
      pillar: selectedCategory.pillar,
      source,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/40 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-2xl p-5 shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-red-50 text-red-600 rounded-lg">
              <MinusCircle strokeWidth={1.75} className="w-5 h-5" />
            </div>
            <h2 className="text-base font-bold text-[#1E3A8A]">Registrar Egreso</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X strokeWidth={1.75} className="w-5 h-5" />
          </button>
        </div>

        {/* Category Chips */}
        <div className="my-3">
          <label className="text-xs font-semibold text-slate-500 block mb-2">Categoría</label>
          <div className="grid grid-cols-3 gap-2">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isSelected = selectedCategory.label === cat.label;
              return (
                <button
                  type="button"
                  key={cat.label}
                  onClick={() => handleSelectCategory(cat)}
                  className={`flex items-center gap-1.5 p-2 rounded-xl border text-xs font-medium transition-all ${
                    isSelected
                      ? 'border-[#2563EB] bg-blue-50 text-[#1E3A8A] font-semibold'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Icon strokeWidth={1.75} className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="truncate">{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Amount Input */}
          <div>
            <label className="text-xs font-semibold text-slate-500 block mb-1">Monto (MXN)</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg font-bold text-slate-400">$</span>
              <input
                type="number"
                step="0.01"
                required
                autoFocus
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full pl-8 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xl font-bold text-[#DC2626] focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500"
              />
            </div>
            {/* Quick Increment Buttons */}
            <div className="flex gap-1.5 mt-2">
              {[50, 100, 200, 500].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => handleQuickAdd(val)}
                  className="flex-1 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-mono font-medium rounded-lg active:scale-95 transition-transform"
                >
                  +{val}
                </button>
              ))}
            </div>
          </div>

          {/* Concept */}
          <div>
            <label className="text-xs font-semibold text-slate-500 block mb-1">Concepto</label>
            <input
              type="text"
              required
              value={concept}
              onChange={(e) => setConcept(e.target.value)}
              placeholder="Descripción breve"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
            />
          </div>

          {/* Payment Source */}
          <div>
            <label className="text-xs font-semibold text-slate-500 block mb-1.5">Cuenta de Origen</label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setSource('banamex_194')}
                className={`p-2 rounded-xl border text-left flex flex-col ${
                  source === 'banamex_194'
                    ? 'border-[#2563EB] bg-blue-50/50 text-[#1E3A8A]'
                    : 'border-slate-200 bg-white text-slate-600'
                }`}
              >
                <span className="font-semibold">Banamex ***194</span>
                <span className="text-[10px] text-slate-500">
                  Disp: ${state.wallets.banamexLiquid.toFixed(2)}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setSource('vale_gasolina')}
                className={`p-2 rounded-xl border text-left flex flex-col ${
                  source === 'vale_gasolina'
                    ? 'border-[#2563EB] bg-blue-50/50 text-[#1E3A8A]'
                    : 'border-slate-200 bg-white text-slate-600'
                }`}
              >
                <span className="font-semibold">Monedero Gasolina</span>
                <span className="text-[10px] text-slate-500">
                  Saldo: ${state.wallets.gasolineVoucher.toFixed(2)}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setSource('fondo_vehiculo')}
                className={`p-2 rounded-xl border text-left flex flex-col ${
                  source === 'fondo_vehiculo'
                    ? 'border-[#2563EB] bg-blue-50/50 text-[#1E3A8A]'
                    : 'border-slate-200 bg-white text-slate-600'
                }`}
              >
                <span className="font-semibold">Fondo Vehículo</span>
                <span className="text-[10px] text-slate-500">
                  Saldo: ${state.wallets.vehicleFund.toFixed(2)}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setSource('efectivo')}
                className={`p-2 rounded-xl border text-left flex flex-col ${
                  source === 'efectivo'
                    ? 'border-[#2563EB] bg-blue-50/50 text-[#1E3A8A]'
                    : 'border-slate-200 bg-white text-slate-600'
                }`}
              >
                <span className="font-semibold">Efectivo</span>
                <span className="text-[10px] text-slate-500">
                  Saldo: ${state.wallets.cash.toFixed(2)}
                </span>
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full py-3 bg-[#2563EB] hover:bg-blue-700 text-white font-semibold rounded-xl flex items-center justify-center gap-2 shadow-sm active:scale-98 transition-all"
          >
            <Check strokeWidth={1.75} className="w-5 h-5" />
            <span>Confirmar Egreso</span>
          </button>
        </form>
      </div>
    </div>
  );
};

