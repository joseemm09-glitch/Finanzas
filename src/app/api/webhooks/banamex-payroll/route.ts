import { NextRequest, NextResponse } from 'next/server';
import { parseBanamexPayrollNotification } from '@/lib/parser';
import { reconstructPayroll } from '@/lib/calc';
import { INITIAL_SETTINGS } from '@/lib/constants';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const rawText = body.text || body.body || body.content || '';
    const secret = body.secret || req.headers.get('x-webhook-secret');

    // Optional secret check
    if (secret && secret !== INITIAL_SETTINGS.webhookSecret) {
      return NextResponse.json(
        { success: false, error: 'Token de webhook no válido' },
        { status: 401 }
      );
    }

    if (!rawText) {
      return NextResponse.json(
        { success: false, error: 'El cuerpo de la petición debe incluir "text".' },
        { status: 400 }
      );
    }

    const parsed = parseBanamexPayrollNotification(rawText);

    if (!parsed.isValid || !parsed.amount) {
      return NextResponse.json(
        {
          success: false,
          error: parsed.error || 'Notificación no cumple con los criterios de nómina Banamex ***194.',
          rawSnippet: rawText.substring(0, 150),
        },
        { status: 422 }
      );
    }

    // Reconstruct with user constants
    const reconstruction = reconstructPayroll(
      parsed.amount,
      0, // tardiness minutes
      INITIAL_SETTINGS.tardinessRatePerMin,
      INITIAL_SETTINGS.defaultFondoAhorro,
      INITIAL_SETTINGS.defaultFondoAhorro,
      INITIAL_SETTINGS.defaultComedor,
      INITIAL_SETTINGS.defaultGasolinaVale
    );

    return NextResponse.json({
      success: true,
      message: 'Nómina Banamex procesada exitosamente',
      data: {
        account: parsed.account,
        operation: parsed.operation,
        depositAmount: parsed.amount,
        date: parsed.date,
        time: parsed.time,
        reconstruction: {
          liquidDeposit: parsed.amount,
          comedorExpense: reconstruction.comedorRetention,
          fondoAhorroTotal: reconstruction.totalFondoAhorroWeek,
          valeGasolina: reconstruction.gasolinaVoucher,
          grossEstimate: reconstruction.grossEstimate,
        },
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Error interno al procesar webhook' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'online',
    service: 'Banamex Payroll Webhook Ingestion',
    targetAccount: 'JOSE MARQUEZ Tarjeta ***194',
    timestamp: new Date().toISOString(),
  });
}
