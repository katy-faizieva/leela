import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { name, email, phone, message } = data;

    if (!name || !email || !message) {
      return NextResponse.json(
        { success: false, message: 'Пожалуйста, заполните все обязательные поля' },
        { status: 400 }
      );
    }

    await prisma.contactMessage.create({
      data: {
        name,
        email,
        phone: phone || '',
        message,
        status: 'NEW',
      },
    });

    const htmlBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333; border-bottom: 2px solid #4F46E5; padding-bottom: 10px;">
          Новое сообщение с сайта
        </h2>
        <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 10px 0;"><strong>Имя:</strong> ${name}</p>
          <p style="margin: 10px 0;"><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
          ${phone ? `<p style="margin: 10px 0;"><strong>Телефон:</strong> ${phone}</p>` : ''}
          <p style="margin: 10px 0;"><strong>Сообщение:</strong></p>
          <div style="background: white; padding: 15px; border-radius: 4px; border-left: 4px solid #4F46E5;">
            ${message}
          </div>
        </div>
        <p style="color: #666; font-size: 12px;">
          Отправлено: ${new Date().toLocaleString('ru-RU')}
        </p>
      </div>
    `;

    const resendKey = process.env.RESEND_API_KEY;
    if (resendKey) {
      try {
        const emailResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${resendKey}`,
          },
          body: JSON.stringify({
            from: process.env.EMAIL_FROM || 'onboarding@resend.dev',
            to: process.env.NOTIFY_EMAIL || 'efaizieva@mail.ru',
            subject: `Новое сообщение от ${name}`,
            html: htmlBody,
          }),
        });
        if (!emailResponse.ok) {
          console.error('Ошибка отправки email:', await emailResponse.text());
        }
      } catch (emailError) {
        console.error('Email sending error:', emailError);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Сообщение успешно отправлено',
    });
  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json(
      { success: false, message: 'Ошибка при отправке сообщения' },
      { status: 500 }
    );
  }
}
