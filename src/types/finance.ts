export type IncomeTier = 'tier1_nomina' | 'tier2_prestaciones' | 'tier3_estructuras';

export type ExpensePillar = 
  | 'costo_operativo' 
  | 'discrecional' 
  | 'provisiones' 
  | 'patrimonio_inversion';

export type PaymentSource = 
  | 'banamex_194' 
  | 'efectivo' 
  | 'vale_gasolina' 
  | 'fondo_vehiculo';

export interface Transaction {
  id: string;
  date: string; // ISO date 'YYYY-MM-DD'
  timestamp: string; // 'HH:mm'
  type: 'inflow' | 'outflow';
  amount: number;
  concept: string;
  category: string;
  pillar?: ExpensePillar;
  tier?: IncomeTier;
  source: PaymentSource;
  notes?: string;
  metadata?: {
    payrollWeekId?: string;
    tardinessMinutes?: number;
    tardinessDeduction?: number;
    projectTaxReserve?: number;
    projectPatrimony?: number;
    projectFree?: number;
    isAutoReconstructed?: boolean;
    subscriptionId?: string;
  };
}

export interface PayrollRecord {
  id: string;
  weekNumber: number;
  year: number;
  date: string;
  depositAmount: number; // e.g. $5158.00 Banamex
  tardinessMinutes: number;
  tardinessRate: number; // $2.1313
  tardinessDeduction: number; // tardinessMinutes * tardinessRate
  fondoAhorroWorker: number; // $171.90
  fondoAhorroCompany: number; // $171.90 (Total accumulated = $343.80)
  comedorRetention: number; // $116.00
  valeGasolina: number; // $500.00
  grossEstimate: number;
  notes?: string;
  status: 'liquidado' | 'pendiente';
}

export interface Subscription {
  id: string;
  name: string;
  monthlyAmount: number;
  category: string;
  paymentSource: PaymentSource;
  billingDay: number;
  active: boolean;
}

export interface UserSettings {
  userName: string;
  userEmail: string;
  bankAccount: string;
  tardinessRatePerMin: number;
  defaultFondoAhorro: number;
  defaultComedor: number;
  defaultGasolinaVale: number;
  weekendWeeklyCap: number; // default 850
  weekly15Target: number; // default 1000
  annual15YieldRate: number; // default 0.15
  udiExchangeRate: number; // default 8.8658
  pprMonthlyAccrual: number; // default 2418
  webhookSecret: string;
}

export interface PPRData {
  policyNumber: string;
  startDate: string; // '2024-11-26'
  totalYears: number; // 20
  currentYear: number; // 3
  nextDueDate: string; // '2026-11-26'
  annualUdis: number; // 3270.39
  accumulatedUdis: number; // 9811.17
  totalProjectedUdis: number; // 65407.80
  coverageUdis: number; // 80000
}

export interface FinanceState {
  version: number;
  settings: UserSettings;
  ppr: PPRData;
  transactions: Transaction[];
  payrolls: PayrollRecord[];
  subscriptions: Subscription[];
  wallets: {
    banamexLiquid: number;
    cash: number;
    gasolineVoucher: number;
    vehicleFund: number;
    projectFreeBucket: number;
    investment15Balance: number;
    investment15StartDate: string;
    fondoAhorroTotal: number;
  };
}
