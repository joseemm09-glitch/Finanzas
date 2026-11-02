import { FinanceState, UserSettings, PPRData, Subscription } from '@/types/finance';

export const INITIAL_SETTINGS: UserSettings = {
  userName: 'José Ramón Márquez Montes',
  userEmail: 'joseemm09@gmail.com',
  bankAccount: 'JOSE MARQUEZ Tarjeta ***194',
  tardinessRatePerMin: 2.1313,
  defaultFondoAhorro: 171.90,
  defaultComedor: 116.00,
  defaultGasolinaVale: 500.00,
  weekendWeeklyCap: 850.00,
  weekly15Target: 1000.00,
  annual15YieldRate: 0.15,
  udiExchangeRate: 8.8658,
  pprMonthlyAccrual: 2418.00,
  fixedRentAmount: 9500.00,
  fixedRentDay: 9,
  emergencyFundTarget: 45000.00, // 3 meses de gastos operativos/básicos sanos ($15k/mes)
  webhookSecret: 'banamex_sec_jm09_2026',
};

export const INITIAL_PPR: PPRData = {
  policyNumber: '93041',
  startDate: '2024-11-26',
  totalYears: 20,
  currentYear: 3,
  nextDueDate: '2026-11-26',
  annualUdis: 3270.39,
  accumulatedUdis: 9811.17,
  totalProjectedUdis: 65407.80,
  coverageUdis: 80000,
};

export const INITIAL_SUBSCRIPTIONS: Subscription[] = [
  {
    id: 'sub-1',
    name: 'Spotify Premium',
    monthlyAmount: 129.00,
    category: 'Plataforma',
    paymentSource: 'banamex_194',
    billingDay: 8,
    active: true,
  },
  {
    id: 'sub-2',
    name: 'iCloud+ 50GB',
    monthlyAmount: 17.00,
    category: 'Plataforma',
    paymentSource: 'banamex_194',
    billingDay: 14,
    active: true,
  },
  {
    id: 'sub-3',
    name: 'YouTube Premium',
    monthlyAmount: 139.00,
    category: 'Plataforma',
    paymentSource: 'banamex_194',
    billingDay: 21,
    active: true,
  },
  {
    id: 'sub-4',
    name: 'ChatGPT Plus / IA Tools',
    monthlyAmount: 400.00,
    category: 'Plataforma',
    paymentSource: 'banamex_194',
    billingDay: 28,
    active: true,
  },
];

export const INITIAL_STATE: FinanceState = {
  version: 5,
  settings: INITIAL_SETTINGS,
  ppr: INITIAL_PPR,
  subscriptions: INITIAL_SUBSCRIPTIONS,
  wallets: {
    banamexLiquid: 0.00,
    cash: 0.00,
    gasolineVoucher: 0.00,
    vehicleFund: 0.00,
    projectFreeBucket: 0.00,
    investment15Balance: 17347.51, // Ahorro inicial real
    investment15StartDate: '2026-11-02',
    fondoAhorroTotal: 0.00,
  },
  payrolls: [],
  transactions: [
    {
      id: 'tx-agua-today',
      date: '2026-11-02',
      timestamp: '10:00',
      type: 'outflow',
      amount: 732.00,
      concept: 'Agua',
      category: 'Agua',
      pillar: 'costo_operativo',
      source: 'banamex_194',
    },
    {
      id: 'tx-gas-today',
      date: '2026-11-02',
      timestamp: '11:30',
      type: 'outflow',
      amount: 445.00,
      concept: 'Gas',
      category: 'Gas',
      pillar: 'costo_operativo',
      source: 'banamex_194',
    },
  ],
};
