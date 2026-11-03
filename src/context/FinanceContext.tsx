'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { FinanceState, Transaction, PayrollRecord, UserSettings, PPRData, Subscription } from '@/types/finance';
import { INITIAL_STATE } from '@/lib/constants';
import { loadStoredState, saveStoredState, exportStateToJson, importStateFromJson } from '@/lib/storage';

interface FinanceContextType {
  state: FinanceState;
  selectedMonth: string;
  setSelectedMonth: (month: string) => void;
  addTransaction: (tx: Omit<Transaction, 'id'>) => void;
  deleteTransaction: (id: string) => void;
  registerPayroll: (payroll: Omit<PayrollRecord, 'id'>) => void;
  updateSettings: (settings: Partial<UserSettings>) => void;
  updatePPR: (ppr: Partial<PPRData>) => void;
  updateUDI: (rate: number) => void;
  toggleSubscription: (id: string) => void;
  resetToDemo: () => void;
  clearData: () => void;
  exportBackup: () => void;
  importBackup: (json: string) => boolean;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<FinanceState>(INITIAL_STATE);
  const [selectedMonth, setSelectedMonth] = useState<string>('2026-11');
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const loaded = loadStoredState();
    setState(loaded);
    setIsInitialized(true);
  }, []);

  const updateStateAndPersist = (updater: (prev: FinanceState) => FinanceState) => {
    setState((prev) => {
      const next = updater(prev);
      saveStoredState(next);
      return next;
    });
  };

  const addTransaction = (txData: Omit<Transaction, 'id'>) => {
    const id = `tx-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newTx: Transaction = { ...txData, id };

    updateStateAndPersist((prev) => {
      const nextWallets = { ...prev.wallets };

      if (newTx.type === 'inflow') {
        if (newTx.tier === 'tier3_estructuras' && newTx.metadata) {
          // Tier 3 engineering split
          const free = newTx.metadata.projectFree || 0;
          const patrimony = newTx.metadata.projectPatrimony || 0;
          nextWallets.banamexLiquid += newTx.amount;
          nextWallets.projectFreeBucket += free;
          nextWallets.investment15Balance += patrimony;
        } else {
          // Regular Banamex or cash inflow
          if (newTx.source === 'banamex_194') {
            nextWallets.banamexLiquid += newTx.amount;
          } else if (newTx.source === 'efectivo') {
            nextWallets.cash += newTx.amount;
          }
        }
      } else {
        // Outflow
        if (newTx.source === 'banamex_194') {
          nextWallets.banamexLiquid -= newTx.amount;
        } else if (newTx.source === 'efectivo') {
          nextWallets.cash -= newTx.amount;
        } else if (newTx.source === 'vale_gasolina') {
          nextWallets.gasolineVoucher = Math.max(0, nextWallets.gasolineVoucher - newTx.amount);
        } else if (newTx.source === 'fondo_vehiculo') {
          nextWallets.vehicleFund = Math.max(0, nextWallets.vehicleFund - newTx.amount);
        }

        // If transfer into 15% investment
        if (newTx.category === 'Inversión Liquidez 15%') {
          nextWallets.investment15Balance += newTx.amount;
        }
      }

      return {
        ...prev,
        wallets: nextWallets,
        transactions: [newTx, ...prev.transactions],
      };
    });
  };

  const deleteTransaction = (id: string) => {
    updateStateAndPersist((prev) => {
      const target = prev.transactions.find((t) => t.id === id);
      if (!target) return prev;

      const nextWallets = { ...prev.wallets };
      // Revert wallet balance
      if (target.type === 'inflow') {
        if (target.tier === 'tier3_estructuras' && target.metadata) {
          const free = target.metadata.projectFree || 0;
          const patrimony = target.metadata.projectPatrimony || 0;
          nextWallets.banamexLiquid -= target.amount;
          nextWallets.projectFreeBucket = Math.max(0, nextWallets.projectFreeBucket - free);
          nextWallets.investment15Balance = Math.max(0, nextWallets.investment15Balance - patrimony);
        } else {
          if (target.source === 'banamex_194') nextWallets.banamexLiquid -= target.amount;
          if (target.source === 'efectivo') nextWallets.cash -= target.amount;
        }
      } else {
        if (target.source === 'banamex_194') nextWallets.banamexLiquid += target.amount;
        if (target.source === 'efectivo') nextWallets.cash += target.amount;
        if (target.source === 'vale_gasolina') nextWallets.gasolineVoucher += target.amount;
        if (target.source === 'fondo_vehiculo') nextWallets.vehicleFund += target.amount;

        // Si era una transferencia a ahorro/inversión 15%, revertir el balance acumulado
        if (target.category === 'Inversión Liquidez 15%' || target.category === 'Ahorro') {
          nextWallets.investment15Balance = Math.max(0, nextWallets.investment15Balance - target.amount);
        }
      }

      return {
        ...prev,
        wallets: nextWallets,
        transactions: prev.transactions.filter((t) => t.id !== id),
      };
    });
  };

  const registerPayroll = (payrollData: Omit<PayrollRecord, 'id'>) => {
    const id = `pay-${Date.now()}`;
    const newPayroll: PayrollRecord = { ...payrollData, id };

    // Auto-create transactions:
    // 1. Inflow: Banamex deposit
    const txDepositId = `tx-pay-dep-${Date.now()}`;
    const txDeposit: Transaction = {
      id: txDepositId,
      date: newPayroll.date,
      timestamp: '09:00',
      type: 'inflow',
      amount: newPayroll.depositAmount,
      concept: `Nómina Banamex Sem. ${newPayroll.weekNumber}`,
      category: 'Nómina',
      tier: 'tier1_nomina',
      source: 'banamex_194',
      metadata: {
        payrollWeekId: id,
        tardinessMinutes: newPayroll.tardinessMinutes,
        tardinessDeduction: newPayroll.tardinessDeduction,
      },
    };

    // 2. Outflow: Comedor retention (Costo Operativo)
    const txComedorId = `tx-pay-com-${Date.now()}`;
    const txComedor: Transaction = {
      id: txComedorId,
      date: newPayroll.date,
      timestamp: '09:01',
      type: 'outflow',
      amount: newPayroll.comedorRetention,
      concept: `Comedor Sem. ${newPayroll.weekNumber} (Retención Nómina)`,
      category: 'Comedor',
      pillar: 'costo_operativo',
      source: 'banamex_194',
      metadata: {
        payrollWeekId: id,
        isAutoReconstructed: true,
      },
    };

    updateStateAndPersist((prev) => {
      const nextWallets = { ...prev.wallets };
      // Increase liquid bank by deposit amount
      nextWallets.banamexLiquid += newPayroll.depositAmount;
      // Increase total accumulated fondo de ahorro (worker + employer match)
      nextWallets.fondoAhorroTotal += newPayroll.fondoAhorroWorker + newPayroll.fondoAhorroCompany;
      // Increase fuel wallet by $500 voucher
      nextWallets.gasolineVoucher += newPayroll.valeGasolina;

      return {
        ...prev,
        wallets: nextWallets,
        payrolls: [newPayroll, ...prev.payrolls],
        transactions: [txDeposit, txComedor, ...prev.transactions],
      };
    });
  };

  const updateSettings = (newSettings: Partial<UserSettings>) => {
    updateStateAndPersist((prev) => ({
      ...prev,
      settings: { ...prev.settings, ...newSettings },
    }));
  };

  const updatePPR = (newPPR: Partial<PPRData>) => {
    updateStateAndPersist((prev) => ({
      ...prev,
      ppr: { ...prev.ppr, ...newPPR },
    }));
  };

  const updateUDI = (rate: number) => {
    updateStateAndPersist((prev) => ({
      ...prev,
      settings: { ...prev.settings, udiExchangeRate: rate },
    }));
  };

  const toggleSubscription = (id: string) => {
    updateStateAndPersist((prev) => ({
      ...prev,
      subscriptions: prev.subscriptions.map((sub) =>
        sub.id === id ? { ...sub, active: !sub.active } : sub
      ),
    }));
  };

  const resetToDemo = () => {
    saveStoredState(INITIAL_STATE);
    setState(INITIAL_STATE);
  };

  const clearData = () => {
    const cleared: FinanceState = {
      version: 1,
      settings: INITIAL_STATE.settings,
      ppr: INITIAL_STATE.ppr,
      subscriptions: INITIAL_STATE.subscriptions,
      wallets: {
        banamexLiquid: 0,
        cash: 0,
        gasolineVoucher: 0,
        vehicleFund: 0,
        projectFreeBucket: 0,
        investment15Balance: 0,
        investment15StartDate: new Date().toISOString().split('T')[0],
        fondoAhorroTotal: 0,
      },
      payrolls: [],
      transactions: [],
    };
    saveStoredState(cleared);
    setState(cleared);
  };

  const exportBackup = () => {
    exportStateToJson(state);
  };

  const importBackup = (json: string): boolean => {
    try {
      const imported = importStateFromJson(json);
      setState(imported);
      return true;
    } catch {
      return false;
    }
  };

  return (
    <FinanceContext.Provider
      value={{
        state,
        selectedMonth,
        setSelectedMonth,
        addTransaction,
        deleteTransaction,
        registerPayroll,
        updateSettings,
        updatePPR,
        updateUDI,
        toggleSubscription,
        resetToDemo,
        clearData,
        exportBackup,
        importBackup,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};

export function useFinance() {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
}

