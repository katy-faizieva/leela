import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { name, email, phone, lessonType, level, date, timeSlot, message } = data;

    if (!name || !email || !phone || !lessonType || !level || !date || !timeSlot) {
      return NextResponse.json(
        { success: false, message: 'Пожалуйста, заполните все обязательные поля' },
        { status: 400 }
      );
    }

    const booking = await prisma.booking.create({
      data: {
        name,
        email,
        phone,
        lessonType,
        level,
        date: new Date(date),
        timeSlot,
        message: message || '',
        status: 'PENDING',
        paymentStatus: 'PENDING',
      },
    });

    const prices = {
      INDIVIDUAL: 1500,
      PAIR: 1000,
      GROUP: 700,
    };
    const amount = prices[lessonType as keyof typeof prices] ?? 1500;

    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

    if (!stripeSecretKey) {
      return NextResponse.json({
        success: false,
        message: 'Платежная система не настроена. Пожалуйста, свяжитесь с преподавателем.',
        bookingId: booking.id,
      });
    }

    const stripe = require('stripe')(stripeSecretKey);
    const origin = request.headers.get('origin') || 'http://localhost:3000';

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'rub',
            product_data: {
              name: `Урок английского - ${lessonType}`,
              description: `Дата: ${date}, Время: ${timeSlot}`,
            },
            unit_amount: amount * 100,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${origin}/payment/success?session_id={CHECKOUT_SESSION_ID}&booking_id=${booking.id}`,
      cancel_url: `${origin}/payment/cancel?booking_id=${booking.id}`,
      customer_email: email,
      metadata: {
        bookingId: booking.id.toString(),
      },
    });

    await prisma.payment.create({
      data: {
        bookingId: booking.id,
        stripeSessionId: session.id,
        amount,
        currency: 'rub',
        status: 'PENDING',
      },
    });

    return NextResponse.json({
      success: true,
      bookingId: booking.id,
      sessionUrl: session.url,
    });
  } catch (error) {
    console.error('Booking error:', error);
    return NextResponse.json(
      { success: false, message: 'Ошибка при создании бронирования' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const bookings = await prisma.booking.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    return NextResponse.json({ success: true, bookings });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json(
      { success: false, message: 'Ошибка при получении бронирований' },
      { status: 500 }
    );
  }
}
