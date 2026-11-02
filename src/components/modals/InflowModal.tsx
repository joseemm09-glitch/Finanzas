'use client';

import React, { useState } from 'react';
import { X, PlusCircle, Landmark, Compass, Gift, ArrowDownRight, Check } from 'lucide-react';
import { useFinance } from '@/context/FinanceContext';
import { IncomeTier, PaymentSource } from '@/types/finance';
import { splitEngineeringFee } from '@/lib/calc';

interface InflowModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InflowModal: React.FC<InflowModalProps> = ({ isOpen, onClose }) => {
  const { addTransaction, state } = useFinance();
  const [preset, setPreset] = useState<'nomina' | 'proyecto' | 'prestacion' | 'otro'>('nomina');
  const [amount, setAmount] = useState<string>('5158.00');
  const [concept, setConcept] = useState<string>('Nómina Semanal Banamex');
  const [source, setSource] = useState<PaymentSource>('banamex_194');
  const [taxPercent, setTaxPercent] = useState<number>(20);

  if (!isOpen) return null;

  const handleSelectPreset = (p: 'nomina' | 'proyecto' | 'prestacion' | 'otro') => {
    setPreset(p);
    if (p === 'nomina') {
      setAmount('5158.00');
      setConcept('Nómina Semanal Banamex');
      setSource('banamex_194');
    } else if (p === 'proyecto') {
      setAmount('15000.00');
      setConcept('Cálculo Estructural Proyecto');
      setSource('banamex_194');
    } else if (p === 'prestacion') {
      setAmount('10000.00');
      setConcept('Aguinaldo / Prestación de Ley');
      setSource('banamex_194');
    } else {
      setAmount('');
      setConcept('');
    }
  };

  const parsedAmount = parseFloat(amount) || 0;
  const projectSplit = preset === 'proyecto' ? splitEngineeringFee(parsedAmount, taxPercent) : null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (parsedAmount <= 0) return;

    let tier: IncomeTier = 'tier1_nomina';
    let metadata: any = undefined;

    if (preset === 'proyecto' && projectSplit) {
      tier = 'tier3_estructuras';
      metadata = {
        projectTaxReserve: projectSplit.taxReserve,
        projectPatrimony: projectSplit.patrimonyPortion,
        projectFree: projectSplit.lifestyleFreePortion,
      };
    } else if (preset === 'prestacion') {
      tier = 'tier2_prestaciones';
      metadata = {
        projectPatrimony: parsedAmount * 0.5,
        projectFree: parsedAmount * 0.5,
      };
    }

    addTransaction({
      date: new Date().toISOString().split('T')[0],
      timestamp: new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: false }),
      type: 'inflow',
      amount: parsedAmount,
      concept: concept || 'Ingreso',
      category: preset === 'nomina' ? 'Nómina' : preset === 'proyecto' ? 'Ingeniería Independiente' : preset === 'prestacion' ? 'Prestación' : 'Otro Ingreso',
      tier,
      source,
      metadata,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/40 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-2xl p-5 shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
              <PlusCircle strokeWidth={1.75} className="w-5 h-5" />
            </div>
            <h2 className="text-base font-bold text-[#1E3A8A]">Registrar Ingreso</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X strokeWidth={1.75} className="w-5 h-5" />
          </button>
        </div>

        {/* 2-Tap Presets */}
        <div className="grid grid-cols-4 gap-2 my-4">
          <button
            type="button"
            onClick={() => handleSelectPreset('nomina')}
            className={`p-2 rounded-xl text-center flex flex-col items-center gap-1 border transition-all ${
              preset === 'nomina'
                ? 'border-emerald-500 bg-emerald-50/60 text-emerald-800'
                : 'border-slate-200 bg-white text-slate-600'
            }`}
          >
            <Landmark strokeWidth={1.75} className="w-4 h-4 text-emerald-600" />
            <span className="text-[10px] font-semibold">Nómina</span>
          </button>

          <button
            type="button"
            onClick={() => handleSelectPreset('proyecto')}
            className={`p-2 rounded-xl text-center flex flex-col items-center gap-1 border transition-all ${
              preset === 'proyecto'
                ? 'border-blue-500 bg-blue-50/60 text-blue-800'
                : 'border-slate-200 bg-white text-slate-600'
            }`}
          >
            <Compass strokeWidth={1.75} className="w-4 h-4 text-blue-600" />
            <span className="text-[10px] font-semibold">Proyecto</span>
          </button>

          <button
            type="button"
            onClick={() => handleSelectPreset('prestacion')}
            className={`p-2 rounded-xl text-center flex flex-col items-center gap-1 border transition-all ${
              preset === 'prestacion'
                ? 'border-purple-500 bg-purple-50/60 text-purple-800'
                : 'border-slate-200 bg-white text-slate-600'
            }`}
          >
            <Gift strokeWidth={1.75} className="w-4 h-4 text-purple-600" />
            <span className="text-[10px] font-semibold">Prestación</span>
          </button>

          <button
            type="button"
            onClick={() => handleSelectPreset('otro')}
            className={`p-2 rounded-xl text-center flex flex-col items-center gap-1 border transition-all ${
              preset === 'otro'
                ? 'border-slate-800 bg-slate-100 text-slate-900'
                : 'border-slate-200 bg-white text-slate-600'
            }`}
          >
            <ArrowDownRight strokeWidth={1.75} className="w-4 h-4 text-slate-600" />
            <span className="text-[10px] font-semibold">Otro</span>
          </button>
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
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full pl-8 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xl font-bold text-[#1E3A8A] focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
              />
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
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
            />
          </div>

          {/* Independent Engineering Split Display */}
          {preset === 'proyecto' && projectSplit && (
            <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-blue-900">Regla Split Nivel 3</span>
                <span className="text-blue-700 font-mono">Reserva: {taxPercent}%</span>
              </div>
              <div className="grid grid-cols-3 gap-1.5 text-center pt-1">
                <div className="bg-white p-1.5 rounded-lg border border-blue-100">
                  <div className="text-[10px] text-slate-500">Reserva Fiscal</div>
                  <div className="text-xs font-bold text-amber-700">${projectSplit.taxReserve.toFixed(2)}</div>
                </div>
                <div className="bg-white p-1.5 rounded-lg border border-blue-100">
                  <div className="text-[10px] text-slate-500">Patrimonio (50%)</div>
                  <div className="text-xs font-bold text-emerald-700">${projectSplit.patrimonyPortion.toFixed(2)}</div>
                </div>
                <div className="bg-white p-1.5 rounded-lg border border-blue-100">
                  <div className="text-[10px] text-slate-500">Libre (50%)</div>
                  <div className="text-xs font-bold text-blue-700">${projectSplit.lifestyleFreePortion.toFixed(2)}</div>
                </div>
              </div>
            </div>
          )}

          {/* Payment Destination */}
          <div>
            <label className="text-xs font-semibold text-slate-500 block mb-1">Destino de Fondos</label>
            <select
              value={source}
              onChange={(e) => setSource(e.target.value as PaymentSource)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
            >
              <option value="banamex_194">Cuenta Banamex ***194</option>
              <option value="efectivo">Efectivo</option>
            </select>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full py-3 bg-[#10B981] hover:bg-emerald-600 text-white font-semibold rounded-xl flex items-center justify-center gap-2 shadow-sm active:scale-98 transition-all"
          >
            <Check strokeWidth={1.75} className="w-5 h-5" />
            <span>Confirmar Ingreso</span>
          </button>
        </form>
      </div>
    </div>
  );
};

