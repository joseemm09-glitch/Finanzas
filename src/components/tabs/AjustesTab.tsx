'use client';

import React, { useState } from 'react';
import { 
  User, 
  Sliders, 
  Key, 
  Copy, 
  Check, 
  Download, 
  Upload, 
  RotateCcw, 
  Trash2, 
  Mail, 
  ShieldAlert,
  CreditCard,
  ClipboardPaste,
  Code2
} from 'lucide-react';
import { useFinance } from '@/context/FinanceContext';
import { formatCurrency } from '@/lib/calc';
import { PasteNotificationModal } from '@/components/modals/PasteNotificationModal';

export const AjustesTab: React.FC = () => {
  const { state, updateSettings, resetToDemo, clearData, exportBackup, importBackup } = useFinance();
  const [copiedScript, setCopiedScript] = useState(false);
  const [copiedWebhook, setCopiedWebhook] = useState(false);
  const [isPasteModalOpen, setIsPasteModalOpen] = useState(false);
  const [statusNotice, setStatusNotice] = useState<string | null>(null);

  // Editable parameters
  const [tardinessRate, setTardinessRate] = useState(state.settings.tardinessRatePerMin.toString());
  const [fondoAhorro, setFondoAhorro] = useState(state.settings.defaultFondoAhorro.toString());
  const [comedor, setComedor] = useState(state.settings.defaultComedor.toString());
  const [gasolina, setGasolina] = useState(state.settings.defaultGasolinaVale.toString());
  const [weekendCap, setWeekendCap] = useState(state.settings.weekendWeeklyCap.toString());
  const [invest15Target, setInvest15Target] = useState(state.settings.weekly15Target.toString());
  const [pprAccrual, setPprAccrual] = useState(state.settings.pprMonthlyAccrual.toString());

  const handleSaveParameters = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      tardinessRatePerMin: parseFloat(tardinessRate) || 2.1313,
      defaultFondoAhorro: parseFloat(fondoAhorro) || 171.90,
      defaultComedor: parseFloat(comedor) || 116.00,
      defaultGasolinaVale: parseFloat(gasolina) || 500.00,
      weekendWeeklyCap: parseFloat(weekendCap) || 850.00,
      weekly15Target: parseFloat(invest15Target) || 1000.00,
      pprMonthlyAccrual: parseFloat(pprAccrual) || 2418.00,
    });
    setStatusNotice('Parámetros actualizados correctamente.');
    setTimeout(() => setStatusNotice(null), 3000);
  };

  const googleAppsScript = `/**
 * Google Apps Script para joseemm09@gmail.com
 * Ingesta de nómina Banamex Tarjeta ***194
 * Horario garantizado: Miércoles 6:00 PM (18:00 hrs)
 */
function syncBanamexPayroll() {
  const query = 'from:notificaciones@banamex.com "JOSE MARQUEZ" "194" "Depósito a cuenta o tarjeta" is:unread';
  const threads = GmailApp.search(query, 0, 5);
  const endpoint = "https://finanzas-ios.vercel.app/api/webhooks/banamex-payroll";

  threads.forEach(function(thread) {
    thread.getMessages().forEach(function(msg) {
      if (msg.isUnread()) {
        const payload = JSON.stringify({
          text: msg.getPlainBody(),
          secret: "${state.settings.webhookSecret}"
        });
        const res = UrlFetchApp.fetch(endpoint, {
          method: "post",
          contentType: "application/json",
          payload: payload,
          muteHttpExceptions: true
        });
        if (res.getResponseCode() === 200) {
          msg.markRead();
        }
      }
    });
  });
}

/**
 * Ejecutar UNA SOLA VEZ para programar la sincronización
 * automática cada Miércoles a las 6:00 PM (18:00 hrs).
 */
function createWednesdayTrigger() {
  // Elimina triggers previos para evitar duplicados
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(t => ScriptApp.deleteTrigger(t));

  // Programa ejecución semanal cada Miércoles a las 18:00 hrs
  ScriptApp.newTrigger("syncBanamexPayroll")
    .timeBased()
    .onWeekDay(ScriptApp.WeekDay.WEDNESDAY)
    .atHour(18)
    .create();
    
  Logger.log("Trigger configurado: Miércoles 6:00 PM");
}`;

  const copyScriptToClipboard = () => {
    navigator.clipboard.writeText(googleAppsScript);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2500);
  };

  const copyWebhookUrl = () => {
    const url = typeof window !== 'undefined' ? `${window.location.origin}/api/webhooks/banamex-payroll` : 'https://finanzas-ios.vercel.app/api/webhooks/banamex-payroll';
    navigator.clipboard.writeText(url);
    setCopiedWebhook(true);
    setTimeout(() => setCopiedWebhook(false), 2500);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const ok = importBackup(content);
        if (ok) {
          setStatusNotice('Respaldo restaurado con éxito.');
        } else {
          setStatusNotice('Error al restaurar: archivo no compatible.');
        }
        setTimeout(() => setStatusNotice(null), 3000);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-4 pb-24">
      {statusNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
          <Check strokeWidth={2} className="w-4 h-4 text-emerald-600" />
          <span>{statusNotice}</span>
        </div>
      )}

      {/* User Identity Card */}
      <div className="card-clean p-4 space-y-2 left-bar-navy">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-[#1E3A8A] font-bold text-sm">
            JM
          </div>
          <div>
            <div className="text-sm font-bold text-[#1E3A8A]">{state.settings.userName}</div>
            <div className="text-xs text-slate-500">{state.settings.userEmail}</div>
          </div>
        </div>
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
          <span className="text-slate-500">Cuenta de Nómina Asignada:</span>
          <span className="font-mono font-bold text-slate-800">{state.settings.bankAccount}</span>
        </div>
      </div>

      {/* Fixed Parameters Form */}
      <div className="card-clean p-4 space-y-3">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
          <Sliders strokeWidth={1.75} className="w-4 h-4 text-[#1E3A8A]" />
          <h3 className="text-xs font-bold text-[#1E3A8A] uppercase tracking-wider">
            Parámetros Financieros Fijos
          </h3>
        </div>

        <form onSubmit={handleSaveParameters} className="space-y-3">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <label className="text-[10px] font-semibold text-slate-500 block mb-1">
                Tasa Retardo ($/min)
              </label>
              <input
                type="number"
                step="0.0001"
                value={tardinessRate}
                onChange={(e) => setTardinessRate(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-mono text-slate-800"
              />
            </div>

            <div>
              <label className="text-[10px] font-semibold text-slate-500 block mb-1">
                Fondo Ahorro Sem. ($)
              </label>
              <input
                type="number"
                step="0.01"
                value={fondoAhorro}
                onChange={(e) => setFondoAhorro(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-mono text-slate-800"
              />
            </div>

            <div>
              <label className="text-[10px] font-semibold text-slate-500 block mb-1">
                Comedor Sem. ($)
              </label>
              <input
                type="number"
                step="0.01"
                value={comedor}
                onChange={(e) => setComedor(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-mono text-slate-800"
              />
            </div>

            <div>
              <label className="text-[10px] font-semibold text-slate-500 block mb-1">
                Vale Gasolina Sem. ($)
              </label>
              <input
                type="number"
                step="0.01"
                value={gasolina}
                onChange={(e) => setGasolina(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-mono text-slate-800"
              />
            </div>

            <div>
              <label className="text-[10px] font-semibold text-slate-500 block mb-1">
                Tope Fin de Semana ($)
              </label>
              <input
                type="number"
                step="0.01"
                value={weekendCap}
                onChange={(e) => setWeekendCap(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-mono text-slate-800"
              />
            </div>

            <div>
              <label className="text-[10px] font-semibold text-slate-500 block mb-1">
                Meta Semanal 15% ($)
              </label>
              <input
                type="number"
                step="0.01"
                value={invest15Target}
                onChange={(e) => setInvest15Target(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-mono text-slate-800"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2 bg-[#1E3A8A] hover:bg-navy text-white text-xs font-semibold rounded-xl active:scale-98 transition-all"
          >
            Actualizar Parámetros
          </button>
        </form>
      </div>

      {/* Banamex Webhook & Google Apps Script Snippet */}
      <div className="card-clean p-4 space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Mail strokeWidth={1.75} className="w-4 h-4 text-[#2563EB]" />
            <h3 className="text-xs font-bold text-[#1E3A8A] uppercase tracking-wider">
              Ingesta Gmail Banamex (Apps Script)
            </h3>
          </div>
          <button
            type="button"
            onClick={() => setIsPasteModalOpen(true)}
            className="text-[11px] text-[#2563EB] font-semibold hover:underline flex items-center gap-1"
          >
            <ClipboardPaste strokeWidth={1.75} className="w-3 h-3" />
            <span>Probar Ingesta</span>
          </button>
        </div>

        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between p-2 bg-slate-50 rounded-lg border border-slate-100">
            <div>
              <div className="text-[10px] text-slate-400">Endpoint Webhook</div>
              <div className="font-mono text-slate-800 text-[11px] truncate max-w-[220px]">
                /api/webhooks/banamex-payroll
              </div>
            </div>
            <button
              type="button"
              onClick={copyWebhookUrl}
              className="px-2 py-1 bg-white border border-slate-200 rounded text-[10px] font-semibold text-slate-700 flex items-center gap-1"
            >
              {copiedWebhook ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
              <span>{copiedWebhook ? 'Copiado' : 'Copiar'}</span>
            </button>
          </div>

          <div className="flex items-center justify-between p-2 bg-slate-50 rounded-lg border border-slate-100">
            <div>
              <div className="text-[10px] text-slate-400">Token Secreto</div>
              <div className="font-mono text-slate-800 text-[11px]">{state.settings.webhookSecret}</div>
            </div>
          </div>
        </div>

        {/* 1-Click Copy Apps Script */}
        <div className="pt-2">
          <div className="flex items-center justify-between mb-1 text-[11px]">
            <span className="font-semibold text-slate-600 flex items-center gap-1">
              <Code2 strokeWidth={1.75} className="w-3.5 h-3.5 text-blue-600" />
              <span>Código Google Apps Script (1-Click)</span>
            </span>
          </div>

          <div className="relative">
            <pre className="p-3 bg-slate-900 text-slate-200 rounded-xl text-[10px] font-mono overflow-x-auto max-h-44 leading-relaxed">
              {googleAppsScript}
            </pre>
            <button
              type="button"
              onClick={copyScriptToClipboard}
              className="absolute top-2 right-2 px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[10px] font-semibold flex items-center gap-1 shadow-sm transition-colors"
            >
              {copiedScript ? <Check className="w-3 h-3 text-emerald-300" /> : <Copy className="w-3 h-3" />}
              <span>{copiedScript ? 'Copiado' : 'Copiar Script'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Backup & System Reset Actions */}
      <div className="card-clean p-4 space-y-3">
        <h3 className="text-xs font-bold text-[#1E3A8A] uppercase tracking-wider pb-2 border-b border-slate-100">
          Respaldos y Datos
        </h3>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={exportBackup}
            className="p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 flex items-center justify-center gap-1.5 transition-colors"
          >
            <Download strokeWidth={1.75} className="w-4 h-4 text-slate-600" />
            <span>Descargar JSON</span>
          </button>

          <label className="p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 flex items-center justify-center gap-1.5 cursor-pointer transition-colors">
            <Upload strokeWidth={1.75} className="w-4 h-4 text-slate-600" />
            <span>Restaurar JSON</span>
            <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
          </label>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            type="button"
            onClick={resetToDemo}
            className="p-2.5 bg-blue-50/60 hover:bg-blue-100 border border-blue-200 rounded-xl text-xs font-semibold text-[#1E3A8A] flex items-center justify-center gap-1.5 transition-colors"
          >
            <RotateCcw strokeWidth={1.75} className="w-4 h-4 text-blue-600" />
            <span>Cargar Demo Nov 2026</span>
          </button>

          <button
            type="button"
            onClick={clearData}
            className="p-2.5 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl text-xs font-semibold text-red-700 flex items-center justify-center gap-1.5 transition-colors"
          >
            <Trash2 strokeWidth={1.75} className="w-4 h-4 text-red-600" />
            <span>Limpiar Datos</span>
          </button>
        </div>
      </div>

      {/* Paste Notification Modal */}
      <PasteNotificationModal isOpen={isPasteModalOpen} onClose={() => setIsPasteModalOpen(false)} />
    </div>
  );
};

