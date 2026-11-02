import { FinanceState, PayrollRecord, Transaction } from '@/types/finance';

/**
 * Calculates daily compounded interest for 15% annual yield.
 * Formula: Balance * (1 + 0.15 / 365)^days
 */
export function calculateCompounded15(
  principal: number,
  annualRate: number = 0.15,
  days: number = 30
): {
  finalAmount: number;
  accruedYield: number;
  dailyYield: number;
} {
  const dailyRate = annualRate / 365;
  const finalAmount = principal * Math.pow(1 + dailyRate, days);
  const accruedYield = finalAmount - principal;
  const dailyYield = principal * dailyRate;

  return {
    finalAmount: Math.round(finalAmount * 100) / 100,
    accruedYield: Math.round(accruedYield * 100) / 100,
    dailyYield: Math.round(dailyYield * 100) / 100,
  };
}

/**
 * Reconstructs full payroll breakdown from net Banamex deposit.
 */
export function reconstructPayroll(
  depositAmount: number,
  tardinessMinutes: number,
  tardinessRate: number,
  fondoWorker: number,
  fondoCompany: number,
  comedor: number,
  gasolina: number
): {
  depositAmount: number;
  tardinessDeduction: number;
  totalFondoAhorroWeek: number;
  comedorRetention: number;
  gasolinaVoucher: number;
  grossEstimate: number;
} {
  const tardinessDeduction = Math.round(tardinessMinutes * tardinessRate * 100) / 100;
  const totalFondoAhorroWeek = Math.round((fondoWorker + fondoCompany) * 100) / 100;
  // Estimated gross before withholdings: deposit + worker fondo + comedor + tardiness
  const grossEstimate = Math.round((depositAmount + fondoWorker + comedor + tardinessDeduction) * 100) / 100;

  return {
    depositAmount,
    tardinessDeduction,
    totalFondoAhorroWeek,
    comedorRetention: comedor,
    gasolinaVoucher: gasolina,
    grossEstimate,
  };
}

/**
 * Split independent structural engineering project fee.
 */
export function splitEngineeringFee(
  totalFee: number,
  taxRatePercent: number = 20
): {
  taxReserve: number;
  netAvailable: number;
  patrimonyPortion: number;
  lifestyleFreePortion: number;
} {
  const taxReserve = Math.round(totalFee * (taxRatePercent / 100) * 100) / 100;
  const netAvailable = Math.round((totalFee - taxReserve) * 100) / 100;
  const patrimonyPortion = Math.round((netAvailable * 0.5) * 100) / 100;
  const lifestyleFreePortion = Math.round((netAvailable * 0.5) * 100) / 100;

  return {
    taxReserve,
    netAvailable,
    patrimonyPortion,
    lifestyleFreePortion,
  };
}

/**
 * Calculates current week spending against the weekend/dining cap.
 */
export function getWeeklyCapStatus(
  transactions: Transaction[],
  cap: number = 850,
  referenceDate: Date = new Date()
): {
  spent: number;
  cap: number;
  remaining: number;
  percent: number;
  status: 'safe' | 'warning' | 'exceeded';
} {
  // Find current week range (Monday to Sunday)
  const ref = new Date(referenceDate);
  const day = ref.getDay(); // 0 is Sunday
  const diffToMonday = (day + 6) % 7;
  const monday = new Date(ref);
  monday.setDate(ref.getDate() - diffToMonday);
  monday.setHours(0, 0, 0, 0);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);

  const spent = transactions
    .filter((tx) => {
      if (tx.type !== 'outflow') return false;
      const txDate = new Date(tx.date + 'T12:00:00');
      const isThisWeek = txDate >= monday && txDate <= sunday;
      const isDining =
        tx.category === 'Comida/Salida' ||
        tx.pillar === 'discrecional' ||
        tx.concept.toLowerCase().includes('comida') ||
        tx.concept.toLowerCase().includes('restaurante');
      return isThisWeek && isDining;
    })
    .reduce((sum, tx) => sum + tx.amount, 0);

  const roundedSpent = Math.round(spent * 100) / 100;
  const remaining = Math.max(0, Math.round((cap - roundedSpent) * 100) / 100);
  const percent = Math.min(100, Math.round((roundedSpent / cap) * 100));

  let status: 'safe' | 'warning' | 'exceeded' = 'safe';
  if (roundedSpent > cap) {
    status = 'exceeded';
  } else if (roundedSpent > cap * 0.75) {
    status = 'warning';
  }

  return {
    spent: roundedSpent,
    cap,
    remaining,
    percent,
    status,
  };
}

/**
 * Calculates Monthly Summary Metrics
 */
export function getMonthlyMetrics(
  transactions: Transaction[],
  yearMonth: string // 'YYYY-MM'
): {
  inflows: number;
  outflows: number;
  netSavings: number;
  savingsRate: number;
  pillarBreakdown: Record<string, number>;
  categoryBreakdown: Record<string, number>;
} {
  const monthTransactions = transactions.filter((tx) => tx.date.startsWith(yearMonth));

  let inflows = 0;
  let outflows = 0;
  const pillarBreakdown: Record<string, number> = {
    costo_operativo: 0,
    discrecional: 0,
    provisiones: 0,
    patrimonio_inversion: 0,
  };
  const categoryBreakdown: Record<string, number> = {};

  for (const tx of monthTransactions) {
    if (tx.type === 'inflow') {
      inflows += tx.amount;
    } else {
      outflows += tx.amount;
      if (tx.pillar && pillarBreakdown[tx.pillar] !== undefined) {
        pillarBreakdown[tx.pillar] += tx.amount;
      }
      categoryBreakdown[tx.category] = (categoryBreakdown[tx.category] || 0) + tx.amount;
    }
  }

  const netSavings = Math.round((inflows - outflows) * 100) / 100;
  const savingsRate = inflows > 0 ? Math.round((netSavings / inflows) * 100) : 0;

  return {
    inflows: Math.round(inflows * 100) / 100,
    outflows: Math.round(outflows * 100) / 100,
    netSavings,
    savingsRate,
    pillarBreakdown,
    categoryBreakdown,
  };
}

/**
 * Calculates Total Net Worth
 */
export function calculateNetWorth(state: FinanceState): {
  total: number;
  inversion15: number;
  fondoAhorro: number;
  proyectosLibre: number;
  pprMxn: number;
  banamexLiquid: number;
  vehicleFund: number;
} {
  const pprMxn = Math.round(state.ppr.accumulatedUdis * state.settings.udiExchangeRate * 100) / 100;
  const inversion15 = state.wallets.investment15Balance;
  const fondoAhorro = state.wallets.fondoAhorroTotal;
  const proyectosLibre = state.wallets.projectFreeBucket;
  const banamexLiquid = state.wallets.banamexLiquid;
  const vehicleFund = state.wallets.vehicleFund;

  const total = Math.round(
    (inversion15 + fondoAhorro + proyectosLibre + pprMxn + banamexLiquid + vehicleFund) * 100
  ) / 100;

  return {
    total,
    inversion15,
    fondoAhorro,
    proyectosLibre,
    pprMxn,
    banamexLiquid,
    vehicleFund,
  };
}

/**
 * Formats MXN currency cleanly with no emojis
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export interface MonthWeekSaving {
  weekIndex: number;
  label: string;
  wednesdayDate: string;
  startDate: string;
  endDate: string;
  amountSaved: number;
  isCovered: boolean;
  isElapsed: boolean;
}

/**
 * Calculates weekly savings calendar for the given month.
 * Identifies each Wednesday of the month and tracks if at least $1,000 MXN was saved.
 */
export function getMonthSavingsCalendar(
  transactions: Transaction[],
  yearMonth: string, // 'YYYY-MM'
  targetPerWeek: number = 1000
): {
  weeks: MonthWeekSaving[];
  coveredWeeks: number;
  elapsedWeeks: number;
  totalWeeks: number;
  totalSaved: number;
} {
  const [yearStr, monthStr] = yearMonth.split('-');
  const year = parseInt(yearStr);
  const month = parseInt(monthStr) - 1; // 0-indexed

  // Today reference (for 2026 or current clock)
  const todayStr = '2026-11-02'; // or current system date

  // Find all Wednesdays in the month
  const wednesdays: Date[] = [];
  const cur = new Date(year, month, 1, 12, 0, 0);

  while (cur.getMonth() === month) {
    if (cur.getDay() === 3) { // 3 is Wednesday
      wednesdays.push(new Date(cur));
    }
    cur.setDate(cur.getDate() + 1);
  }

  // Savings transactions for this month
  const savingsTxs = transactions.filter(
    (tx) =>
      tx.category === 'Inversión Liquidez 15%' ||
      tx.category === 'Ahorro' ||
      tx.pillar === 'patrimonio_inversion' ||
      tx.concept.toLowerCase().includes('ahorro') ||
      tx.concept.toLowerCase().includes('inversión')
  );

  let totalSaved = 0;
  const weeks: MonthWeekSaving[] = wednesdays.map((wed, idx) => {
    // Week bounds: Monday (Wed - 2) to Sunday (Wed + 4)
    const mon = new Date(wed);
    mon.setDate(wed.getDate() - 2);
    const sun = new Date(wed);
    sun.setDate(wed.getDate() + 4);

    const monStr = mon.toISOString().split('T')[0];
    const sunStr = sun.toISOString().split('T')[0];
    const wedStr = wed.toISOString().split('T')[0];

    // Find txs within this week
    const weekTxs = savingsTxs.filter((tx) => {
      return tx.date >= monStr && tx.date <= sunStr;
    });

    const amountSaved = Math.round(weekTxs.reduce((sum, tx) => sum + tx.amount, 0) * 100) / 100;
    totalSaved += amountSaved;

    const isCovered = amountSaved >= targetPerWeek;
    // Week is elapsed if current date is past Monday of this week, or if viewing past month
    const isPastMonth = yearMonth < '2026-11';
    const isElapsed = isPastMonth || todayStr >= monStr;

    return {
      weekIndex: idx + 1,
      label: `Semana ${idx + 1}`,
      wednesdayDate: wedStr,
      startDate: monStr,
      endDate: sunStr,
      amountSaved,
      isCovered,
      isElapsed,
    };
  });

  const coveredWeeks = weeks.filter((w) => w.isCovered).length;
  // Elapsed weeks is at least 1 if in current month
  let elapsedWeeks = weeks.filter((w) => w.isElapsed).length;
  if (elapsedWeeks === 0 && weeks.length > 0) elapsedWeeks = 1;

  return {
    weeks,
    coveredWeeks,
    elapsedWeeks: Math.min(elapsedWeeks, weeks.length),
    totalWeeks: weeks.length,
    totalSaved: Math.round(totalSaved * 100) / 100,
  };
}


