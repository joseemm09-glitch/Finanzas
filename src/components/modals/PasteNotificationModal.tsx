'use client';

import React, { useState } from 'react';
import { X, ClipboardPaste, Check, AlertCircle, Sparkles } from 'lucide-react';
import { useFinance } from '@/context/FinanceContext';
import { parseBanamexPayrollNotification } from '@/lib/parser';
import { reconstructPayroll } from '@/lib/calc';

interface PasteNotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PasteNotificationModal: React.FC<PasteNotificationModalProps> = ({ isOpen, onClose }) => {
  const { registerPayroll, state } = useFinance();
  const [inputText, setInputText] = useState<string>('');
  const [tardinessMin, setTardinessMin] = useState<number>(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const parsed = parseBanamexPayrollNotification(inputText);
  const amount = parsed.amount || 0;

  const reconstruction = amount > 0
    ? reconstructPayroll(
        amount,
        tardinessMin,
        state.settings.tardinessRatePerMin,
        state.settings.defaultFondoAhorro,
        state.settings.defaultFondoAhorro,
        state.settings.defaultComedor,
        state.settings.defaultGasolinaVale
      )
    : null;

  const handlePasteSample = () => {
    setInputText(
      'Depósito a cuenta Banamex: Se realizó la siguiente operación: Depósito a cuenta o tarjeta JOSE MARQUEZ Tarjeta ***194 Detalle de la operación Monto $ 5158.00 Fecha: 06/11/2026 Hora: 08:30'
    );
    setErrorMsg(null);
  };

  const handleConfirm = () => {
    if (!parsed.isValid || !parsed.amount || !reconstruction) {
      setErrorMsg('El texto ingresado no es válido para Banamex ***194.');
      return;
    }

    // Determine week number based on date
    const d = new Date(parsed.date || new Date().toISOString().split('T')[0]);
    const firstDayOfYear = new Date(d.getFullYear(), 0, 1);
    const pastDaysOfYear = (d.getTime() - firstDayOfYear.getTime()) / 86400000;
    const weekNumber = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);

    registerPayroll({
      weekNumber,
      year: d.getFullYear(),
      date: parsed.date || new Date().toISOString().split('T')[0],
      depositAmount: parsed.amount,
      tardinessMinutes: tardinessMin,
      tardinessRate: state.settings.tardinessRatePerMin,
      tardinessDeduction: reconstruction.tardinessDeduction,
      fondoAhorroWorker: state.settings.defaultFondoAhorro,
      fondoAhorroCompany: state.settings.defaultFondoAhorro,
      comedorRetention: state.settings.defaultComedor,
      valeGasolina: state.settings.defaultGasolinaVale,
      grossEstimate: reconstruction.grossEstimate,
      notes: `Ingesta Banamex ***194 (${parsed.time || '09:00'})`,
      status: 'liquidado',
    });

    onClose();
    setInputText('');
    setTardinessMin(0);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/40 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-2xl p-5 shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-50 text-[#2563EB] rounded-lg">
              <ClipboardPaste strokeWidth={1.75} className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#1E3A8A]">Ingesta Banamex</h2>
              <p className="text-[11px] text-slate-500">Pegar texto de notificación o SMS</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X strokeWidth={1.75} className="w-5 h-5" />
          </button>
        </div>

        <div className="my-4 space-y-3">
          <div className="flex justify-between items-center">
            <label className="text-xs font-semibold text-slate-700">Texto de Notificación</label>
            <button
              type="button"
              onClick={handlePasteSample}
              className="text-[11px] text-[#2563EB] hover:underline font-medium flex items-center gap-1"
            >
              <span>Pegar formato ejemplo</span>
            </button>
          </div>

          <textarea
            rows={3}
            value={inputText}
            onChange={(e) => {
              setInputText(e.target.value);
              setErrorMsg(null);
            }}
            placeholder="Pegue aquí el texto recibido por correo o notificación Banamex..."
            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
          />

          {inputText && !parsed.isValid && (
            <div className="p-2.5 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2 text-xs text-red-700">
              <AlertCircle strokeWidth={1.75} className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-600" />
              <span>{parsed.error || 'Formato no coincide con depósito JOSE MARQUEZ Tarjeta ***194'}</span>
            </div>
          )}

          {parsed.isValid && reconstruction && (
            <div className="p-3 bg-slate-50 border border-emerald-200 rounded-xl space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-emerald-800 flex items-center gap-1">
                  <Check strokeWidth={1.75} className="w-4 h-4 text-emerald-600" />
                  Notificación Válida
                </span>
                <span className="text-xs font-mono font-bold text-[#1E3A8A]">
                  ${parsed.amount?.toFixed(2)} MXN
                </span>
              </div>

              {/* Tardiness adjustment */}
              <div>
                <div className="flex justify-between text-xs text-slate-600 mb-1">
                  <span>Minutos tarde esta semana:</span>
                  <span className="font-mono font-semibold">
                    ${(tardinessMin * state.settings.tardinessRatePerMin).toFixed(2)} MXN
                  </span>
                </div>
                <input
                  type="number"
                  min="0"
                  value={tardinessMin}
                  onChange={(e) => setTardinessMin(Math.max(0, parseInt(e.target.value) || 0))}
                  placeholder="0 min"
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono text-slate-800 focus:outline-none"
                />
              </div>

              {/* Automatic Payroll Reconstruction Preview */}
              <div className="pt-2 border-t border-slate-200 space-y-1.5 text-[11px]">
                <div className="text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                  Reconstrucción Automática
                </div>
                <div className="flex justify-between text-slate-700">
                  <span>Abono Líquido Banamex ***194:</span>
                  <span className="font-mono font-bold text-emerald-600">+${reconstruction.depositAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-700">
                  <span>Gasto Operativo Comedor (Auto-log):</span>
                  <span className="font-mono font-bold text-slate-800">-${reconstruction.comedorRetention.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-700">
                  <span>Fondo de Ahorro (Obrero + Empresa):</span>
                  <span className="font-mono font-bold text-blue-600">+${reconstruction.totalFondoAhorroWeek.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-700">
                  <span>Monedero Gasolina (Especie):</span>
                  <span className="font-mono font-bold text-blue-600">+${reconstruction.gasolinaVoucher.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="text-xs text-red-600 font-medium">{errorMsg}</div>
          )}

          <button
            type="button"
            disabled={!parsed.isValid}
            onClick={handleConfirm}
            className={`w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all ${
              parsed.isValid
                ? 'bg-[#2563EB] hover:bg-blue-700 text-white shadow-sm active:scale-98'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            <Check strokeWidth={1.75} className="w-5 h-5" />
            <span>Confirmar Ingesta</span>
          </button>
        </div>
      </div>
    </div>
  );
};
