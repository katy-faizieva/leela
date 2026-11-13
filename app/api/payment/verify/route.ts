import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { sessionId, bookingId } = await request.json();

    if (!sessionId || !bookingId) {
      return NextResponse.json(
        { success: false, message: 'Неверные параметры' },
        { status: 400 }
      );
    }

    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

    if (!stripeSecretKey) {
      return NextResponse.json({
        success: false,
        message: 'Платежная система не настроена',
      });
    }

    const stripe = require('stripe')(stripeSecretKey);
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status === 'paid') {
      await prisma.booking.update({
        where: { id: parseInt(bookingId) },
        data: {
          paymentStatus: 'PAID',
          status: 'CONFIRMED',
          paymentId: sessionId,
        },
      });

      const payment = await prisma.payment.findFirst({
        where: { stripeSessionId: sessionId },
      });

      if (payment) {
        await prisma.payment.update({
          where: { id: payment.id },
          data: { status: 'PAID' },
        });
      }

      return NextResponse.json({
        success: true,
        message: 'Оплата подтверждена',
      });
    }

    return NextResponse.json({
      success: false,
      message: 'Оплата не подтверждена',
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    return NextResponse.json(
      { success: false, message: 'Ошибка при проверке платежа' },
      { status: 500 }
    );
  }
}
