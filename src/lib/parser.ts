export interface ParsedBanamexDeposit {
  isValid: boolean;
  rawText: string;
  account?: string;
  operation?: string;
  amount?: number;
  date?: string;
  time?: string;
  error?: string;
}

/**
 * Validates and parses Banamex Payroll Deposit notification.
 * Pattern example:
 * "Depósito a cuenta Banamex ... Se realizó la siguiente operación: Depósito a cuenta o tarjeta JOSE MARQUEZ Tarjeta ***194 Detalle de la operación Monto $ 5158.00 Fecha: 06/11/2026 Hora: 08:42"
 */
export function parseBanamexPayrollNotification(text: string): ParsedBanamexDeposit {
  if (!text || typeof text !== 'string') {
    return { isValid: false, rawText: '', error: 'Texto vacío' };
  }

  const clean = text.replace(/\s+/g, ' ').trim();

  // Strict check: must contain JOSE MARQUEZ and Tarjeta ***194 or 194
  const hasAccount = /JOSE\s+MARQUEZ/i.test(clean) && /(Tarjeta\s+\*{3}194|\*{3}194|cuenta\s+194)/i.test(clean);
  const isDepositOp = /Dep[oó]sito\s+a\s+(cuenta\s+o\s+tarjeta|cuenta\s+Banamex)/i.test(clean);

  if (!hasAccount) {
    return {
      isValid: false,
      rawText: text,
      error: 'La notificación no corresponde a JOSE MARQUEZ Tarjeta ***194.',
    };
  }

  if (!isDepositOp) {
    return {
      isValid: false,
      rawText: text,
      error: 'La operación no es un depósito a cuenta o tarjeta Banamex.',
    };
  }

  // Regex to extract Amount: "Monto $ 5158.00" or "$ 5,158.00" or "Monto: $5158"
  const amountMatch = clean.match(/(?:Monto|Importe|depósito\s+de)?\s*\$\s*([0-9]+(?:,[0-9]{3})*(?:\.[0-9]{2})?)/i);
  let amount: number | undefined;

  if (amountMatch && amountMatch[1]) {
    const sanitizedNumber = amountMatch[1].replace(/,/g, '');
    amount = parseFloat(sanitizedNumber);
  }

  if (!amount || isNaN(amount) || amount <= 0) {
    return {
      isValid: false,
      rawText: text,
      error: 'No se pudo extraer un monto válido de la notificación.',
    };
  }

  // Extract Date if present, e.g. "06/11/2026" or "06-11-2026" or "2026-11-06"
  const dateMatch = clean.match(/(\d{2})[\/\-](\d{2})[\/\-](\d{4})/);
  let dateStr: string | undefined;
  if (dateMatch) {
    // assume DD/MM/YYYY
    const [, d, m, y] = dateMatch;
    dateStr = `${y}-${m}-${d}`;
  } else {
    // default to today ISO date
    dateStr = new Date().toISOString().split('T')[0];
  }

  // Extract Time if present, e.g. "08:42" or "14:20:15"
  const timeMatch = clean.match(/(\d{2}:\d{2})(?::\d{2})?/);
  const timeStr = timeMatch ? timeMatch[1] : new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: false });

  return {
    isValid: true,
    rawText: text,
    account: 'JOSE MARQUEZ Tarjeta ***194',
    operation: 'Depósito a cuenta o tarjeta',
    amount,
    date: dateStr,
    time: timeStr,
  };
}
