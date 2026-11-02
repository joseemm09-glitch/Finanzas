'use client';

import React, { useState } from 'react';
import { 
  Landmark, 
  Clock, 
  Fuel, 
  PiggyBank, 
  Utensils, 
  Plus, 
  CheckCircle2, 
  AlertTriangle,
  ChevronDown,
  TrendingDown,
  Gift
} from 'lucide-react';
import { useFinance } from '@/context/FinanceContext';
import { formatCurrency, reconstructPayroll } from '@/lib/calc';
import { PasteNotificationModal } from '@/components/modals/PasteNotificationModal';

export const NominaTab: React.FC = () => {
  const { state, registerPayroll } = useFinance();
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [isPasteOpen, setIsPasteOpen] = useState(false);

  // Manual Payroll State
  const [weekNumber, setWeekNumber] = useState<number>(46);
  const [date, setDate] = useState<string>('2026-11-13');
  const [depositAmount, setDepositAmount] = useState<string>('5158.00');
  const [tardinessMinutes, setTardinessMinutes] = useState<number>(0);

  // Annual Totals
  const totalNetDeposits = state.payrolls.reduce((sum, p) => sum + p.depositAmount, 0);
  const totalFondoAccumulated = state.payrolls.reduce(
    (sum, p) => sum + p.fondoAhorroWorker + p.fondoAhorroCompany,
    0
  );
  const totalGasolinaVouchers = state.payrolls.reduce((sum, p) => sum + p.valeGasolina, 0);
  const totalBenefits = totalFondoAccumulated + totalGasolinaVouchers;
  const totalTardinessLoss = state.payrolls.reduce((sum, p) => sum + p.tardinessDeduction, 0);
  const totalTardinessMinutes = state.payrolls.reduce((sum, p) => sum + p.tardinessMinutes, 0);

  const parsedDeposit = parseFloat(depositAmount) || 0;
  const reconstruction = reconstructPayroll(
    parsedDeposit,
    tardinessMinutes,
    state.settings.tardinessRatePerMin,
    state.settings.defaultFondoAhorro,
    state.settings.defaultFondoAhorro,
    state.settings.defaultComedor,
    state.settings.defaultGasolinaVale
  );

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (parsedDeposit <= 0) return;

    registerPayroll({
      weekNumber,
      year: parseInt(date.split('-')[0]) || 2026,
      date,
      depositAmount: parsedDeposit,
      tardinessMinutes,
      tardinessRate: state.settings.tardinessRatePerMin,
      tardinessDeduction: reconstruction.tardinessDeduction,
      fondoAhorroWorker: state.settings.defaultFondoAhorro,
      fondoAhorroCompany: state.settings.defaultFondoAhorro,
      comedorRetention: state.settings.defaultComedor,
      valeGasolina: state.settings.defaultGasolinaVale,
      grossEstimate: reconstruction.grossEstimate,
      notes: `Nómina Semana ${weekNumber} Banamex ***194`,
      status: 'liquidado',
    });

    setIsManualModalOpen(false);
  };

  return (
    <div className="space-y-4 pb-24">
      {/* Annual Audit Counter Header */}
      <div className="card-clean p-4 space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-50 text-[#1E3A8A] rounded-lg">
              <Landmark strokeWidth={1.75} className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xs font-bold text-[#1E3A8A] uppercase tracking-wider">
                Auditoría Anual Nómina
              </h2>
              <div className="text-[10px] text-slate-400">JOSE MARQUEZ • Tarjeta ***194</div>
            </div>
          </div>
          <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
            {state.payrolls.length} Semanas
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center pt-1">
          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
            <div className="text-[10px] text-slate-400 font-semibold uppercase">Neto Cobrado</div>
            <div className="text-xs font-black font-mono text-emerald-700 mt-0.5">
              {formatCurrency(totalNetDeposits)}
            </div>
          </div>

          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
            <div className="text-[10px] text-slate-400 font-semibold uppercase">Prestaciones</div>
            <div className="text-xs font-black font-mono text-blue-700 mt-0.5">
              {formatCurrency(totalBenefits)}
            </div>
          </div>

          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
            <div className="text-[10px] text-slate-400 font-semibold uppercase">Fricción Retardo</div>
            <div className="text-xs font-black font-mono text-red-600 mt-0.5">
              -{formatCurrency(totalTardinessLoss)}
            </div>
          </div>
        </div>

        {totalTardinessLoss > 0 && (
          <div className="p-2 bg-amber-50/60 border border-amber-200 rounded-xl flex items-center justify-between text-[11px] text-amber-800">
            <div className="flex items-center gap-1.5">
              <Clock strokeWidth={1.75} className="w-3.5 h-3.5 text-amber-600" />
              <span>Minutos acumulados de retardo:</span>
            </div>
            <span className="font-mono font-bold">{totalTardinessMinutes} min ({state.settings.tardinessRatePerMin} MXN/min)</span>
          </div>
        )}
      </div>

      {/* Action Buttons: Registrar Nómina & Ingesta Banamex */}
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => setIsManualModalOpen(true)}
          className="card-clean p-3 flex items-center justify-center gap-2 hover:bg-blue-50/50 text-[#1E3A8A] border-blue-200 transition-colors"
        >
          <Plus strokeWidth={2} className="w-4 h-4 text-[#2563EB]" />
          <span className="text-xs font-bold">+ Registrar Nómina</span>
        </button>

        <button
          type="button"
          onClick={() => setIsPasteOpen(true)}
          className="card-clean p-3 flex items-center justify-center gap-2 hover:bg-slate-50 text-slate-700 transition-colors"
        >
          <Landmark strokeWidth={1.75} className="w-4 h-4 text-emerald-600" />
          <span className="text-xs font-bold">Pegar Banamex</span>
        </button>
      </div>

      {/* Payrolls List - Checador Style */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Control Semanal de Pagos
          </span>
          <span className="text-[11px] text-slate-400">Depósito miércoles (6:00 PM)</span>
        </div>

        {state.payrolls.length === 0 ? (
          <div className="card-clean p-6 text-center text-xs text-slate-400">
            No hay nóminas registradas.
          </div>
        ) : (
          state.payrolls.map((payroll) => {
            const hasTardiness = payroll.tardinessMinutes > 0;
            return (
              <div
                key={payroll.id}
                className="card-clean p-4 space-y-3 left-bar-navy"
              >
                {/* Header Row */}
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-[#1E3A8A]">
                        Semana {payroll.weekNumber}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
                        Liquidado
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{payroll.date}</div>
                  </div>

                  <div className="text-right">
                    <div className="text-base font-black font-mono text-emerald-700">
                      +{formatCurrency(payroll.depositAmount)}
                    </div>
                    <div className="text-[10px] text-slate-400">Depósito Líquido</div>
                  </div>
                </div>

                {/* Sub-breakdown Details */}
                <div className="bg-slate-50/80 p-2.5 rounded-xl space-y-1.5 text-xs">
                  {/* Retención Fondo Ahorro */}
                  <div className="flex items-center justify-between text-slate-600">
                    <span className="flex items-center gap-1.5 text-[11px]">
                      <PiggyBank strokeWidth={1.75} className="w-3.5 h-3.5 text-blue-600" />
                      <span>Fondo de Ahorro (Obrero $171.90 + Patronal $171.90):</span>
                    </span>
                    <span className="font-mono font-bold text-blue-700">
                      +{formatCurrency(payroll.fondoAhorroWorker + payroll.fondoAhorroCompany)}
                    </span>
                  </div>

                  {/* Comedor Nómina */}
                  <div className="flex items-center justify-between text-slate-600">
                    <span className="flex items-center gap-1.5 text-[11px]">
                      <Utensils strokeWidth={1.75} className="w-3.5 h-3.5 text-amber-600" />
                      <span>Retención Comedor (Costo Operativo):</span>
                    </span>
                    <span className="font-mono font-bold text-slate-700">
                      -{formatCurrency(payroll.comedorRetention)}
                    </span>
                  </div>

                  {/* Vale Gasolina */}
                  <div className="flex items-center justify-between text-slate-600">
                    <span className="flex items-center gap-1.5 text-[11px]">
                      <Fuel strokeWidth={1.75} className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Vale Gasolina (Especie):</span>
                    </span>
                    <span className="font-mono font-bold text-emerald-700">
                      +{formatCurrency(payroll.valeGasolina)}
                    </span>
                  </div>

                  {/* Tardiness */}
                  <div className="flex items-center justify-between text-slate-600 pt-1 border-t border-slate-200">
                    <span className="flex items-center gap-1.5 text-[11px]">
                      <Clock strokeWidth={1.75} className="w-3.5 h-3.5 text-red-500" />
                      <span>Retardo ({payroll.tardinessMinutes} min @ ${payroll.tardinessRate}/min):</span>
                    </span>
                    <span
                      className={`font-mono font-bold ${
                        hasTardiness ? 'text-red-600' : 'text-slate-400'
                      }`}
                    >
                      {hasTardiness ? `-${formatCurrency(payroll.tardinessDeduction)}` : '$0.00'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Manual Entry Modal */}
      {isManualModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/40 backdrop-blur-sm p-0 sm:p-4">
          <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-2xl p-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-base font-bold text-[#1E3A8A]">Registrar Nómina Semanal</h2>
              <button
                type="button"
                onClick={() => setIsManualModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleManualSubmit} className="space-y-4 my-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-500 block mb-1">Semana #</label>
                  <input
                    type="number"
                    required
                    value={weekNumber}
                    onChange={(e) => setWeekNumber(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono text-slate-800"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 block mb-1">Fecha</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500 block mb-1">
                  Monto Depósito Banamex Líquido (MXN)
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-lg font-bold font-mono text-emerald-700"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1 text-xs">
                  <span className="font-semibold text-slate-500">Minutos de Retardo</span>
                  <span className="font-mono text-red-600 font-semibold">
                    -${reconstruction.tardinessDeduction.toFixed(2)} MXN
                  </span>
                </div>
                <input
                  type="number"
                  min="0"
                  value={tardinessMinutes}
                  onChange={(e) => setTardinessMinutes(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono text-slate-800"
                />
              </div>

              {/* Automatic Items Preview */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5 text-xs">
                <div className="text-[10px] font-semibold uppercase text-slate-400">
                  Valores Fijos Pre-configurados
                </div>
                <div className="flex justify-between text-slate-700">
                  <span>Fondo Ahorro (Obrero + Empresa):</span>
                  <span className="font-mono font-bold text-blue-700">
                    +${reconstruction.totalFondoAhorroWeek.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-slate-700">
                  <span>Retención Comedor:</span>
                  <span className="font-mono font-bold text-slate-700">
                    -${reconstruction.comedorRetention.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-slate-700">
                  <span>Monedero Gasolina:</span>
                  <span className="font-mono font-bold text-emerald-700">
                    +${reconstruction.gasolinaVoucher.toFixed(2)}
                  </span>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#2563EB] hover:bg-blue-700 text-white font-semibold rounded-xl active:scale-98 transition-all"
              >
                Confirmar y Reconstruir
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Paste Notification Modal */}
      <PasteNotificationModal isOpen={isPasteOpen} onClose={() => setIsPasteOpen(false)} />
    </div>
  );
};

