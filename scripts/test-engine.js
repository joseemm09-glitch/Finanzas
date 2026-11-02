const assert = require('assert');

// Test 1: Parser
const sampleBanamexEmail = `
Banamex Notificaciones
Depósito a cuenta Banamex
Se realizó la siguiente operación:
Depósito a cuenta o tarjeta JOSE MARQUEZ Tarjeta ***194
Detalle de la operación
Monto $ 5,158.00
Fecha: 06/11/2026
Hora: 08:42:10
`;

function parseBanamexPayrollNotification(text) {
  if (!text || typeof text !== 'string') {
    return { isValid: false, error: 'Texto vacío' };
  }
  const clean = text.replace(/\s+/g, ' ').trim();
  const hasAccount = /JOSE\s+MARQUEZ/i.test(clean) && /(Tarjeta\s+\*{3}194|\*{3}194|cuenta\s+194)/i.test(clean);
  const isDepositOp = /Dep[oó]sito\s+a\s+(cuenta\s+o\s+tarjeta|cuenta\s+Banamex)/i.test(clean);

  if (!hasAccount) return { isValid: false, error: 'No cuenta' };
  if (!isDepositOp) return { isValid: false, error: 'No deposito' };

  const amountMatch = clean.match(/(?:Monto|Importe|depósito\s+de)?\s*\$\s*([0-9]+(?:,[0-9]{3})*(?:\.[0-9]{2})?)/i);
  let amount;
  if (amountMatch && amountMatch[1]) {
    amount = parseFloat(amountMatch[1].replace(/,/g, ''));
  }
  return { isValid: true, amount };
}

const parsed = parseBanamexPayrollNotification(sampleBanamexEmail);
assert.strictEqual(parsed.isValid, true);
assert.strictEqual(parsed.amount, 5158.00);
console.log('✔ Test 1: Banamex parser passed with amount 5158.00');

// Test 2: Payroll Reconstruction
function reconstructPayroll(depositAmount, tardinessMinutes, tardinessRate, fondoWorker, fondoCompany, comedor, gasolina) {
  const tardinessDeduction = Math.round(tardinessMinutes * tardinessRate * 100) / 100;
  const totalFondoAhorroWeek = Math.round((fondoWorker + fondoCompany) * 100) / 100;
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

const recon = reconstructPayroll(5158.00, 8, 2.1313, 171.90, 171.90, 116.00, 500.00);
assert.strictEqual(recon.tardinessDeduction, 17.05);
assert.strictEqual(recon.totalFondoAhorroWeek, 343.80);
assert.strictEqual(recon.comedorRetention, 116.00);
assert.strictEqual(recon.gasolinaVoucher, 500.00);
console.log('✔ Test 2: Payroll reconstruction passed (Total fondo: $343.80, Gasolina: $500.00, Tardiness: $17.05)');

// Test 3: Compound 15% Interest
function calculateCompounded15(principal, annualRate = 0.15, days = 30) {
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

const yieldRes = calculateCompounded15(24000, 0.15, 30);
assert(yieldRes.dailyYield > 9.8 && yieldRes.dailyYield < 9.9); // ~9.86
console.log(`✔ Test 3: Daily 15% compounding calculation passed ($${yieldRes.dailyYield}/day, 30d yield: $${yieldRes.accruedYield})`);

// Test 4: Negative case for Banamex parser (other account)
const fakeEmail = 'Depósito a cuenta Banamex: Depósito a cuenta o tarjeta JUAN PEREZ Tarjeta ***999 Monto $ 1000.00';
const badParsed = parseBanamexPayrollNotification(fakeEmail);
assert.strictEqual(badParsed.isValid, false);
console.log('✔ Test 4: Strict filter rejected non-matching account');

console.log('ALL TESTS PASSED WITH 0 ERRORS.');
