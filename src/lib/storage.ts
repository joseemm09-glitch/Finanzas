import { FinanceState } from '@/types/finance';
import { INITIAL_STATE } from '@/lib/constants';

const STORAGE_KEY = 'finanzas_jose_marquez_v3';

export function loadStoredState(): FinanceState {
  if (typeof window === 'undefined') {
    return INITIAL_STATE;
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      saveStoredState(INITIAL_STATE);
      return INITIAL_STATE;
    }
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || !parsed.version) {
      saveStoredState(INITIAL_STATE);
      return INITIAL_STATE;
    }
    return parsed as FinanceState;
  } catch (err) {
    console.error('Error loading stored finance state:', err);
    return INITIAL_STATE;
  }
}

export function saveStoredState(state: FinanceState): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.error('Error saving state to localStorage:', err);
  }
}

export function exportStateToJson(state: FinanceState): void {
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(state, null, 2));
  const downloadAnchor = document.createElement('a');
  const dateStr = new Date().toISOString().split('T')[0];
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute('download', `finanzas_backup_${dateStr}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

export function importStateFromJson(jsonString: string): FinanceState {
  const parsed = JSON.parse(jsonString);
  if (!parsed || !parsed.settings || !parsed.wallets) {
    throw new Error('Archivo JSON no válido para Finanzas.');
  }
  saveStoredState(parsed);
  return parsed;
}

