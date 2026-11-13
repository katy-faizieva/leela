import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const bookings = await prisma.booking.findMany({
      where: {
        status: 'CONFIRMED',
        date: {
          gte: new Date(),
        },
      },
      orderBy: {
        date: 'asc',
      },
      select: {
        id: true,
        name: true,
        date: true,
        timeSlot: true,
        lessonType: true,
        status: true,
      },
    });

    return NextResponse.json({
      success: true,
      bookings,
    });
  } catch (error) {
    console.error('Error fetching schedule:', error);
    return NextResponse.json(
      { success: false, message: 'Ошибка при получении расписания' },
      { status: 500 }
    );
  }
}
