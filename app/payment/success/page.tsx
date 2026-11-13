'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { CheckCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isVerifying, setIsVerifying] = useState(true);
  const [verificationStatus, setVerificationStatus] = useState<'success' | 'error' | null>(null);

  useEffect(() => {
    const verifyPayment = async () => {
      const sessionId = searchParams?.get('session_id');
      const bookingId = searchParams?.get('booking_id');

      if (!sessionId || !bookingId) {
        setVerificationStatus('error');
        setIsVerifying(false);
        return;
      }

      try {
        const response = await fetch('/api/payment/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId, bookingId }),
        });

        const result = await response.json();

        if (result.success) {
          setVerificationStatus('success');
        } else {
          setVerificationStatus('error');
        }
      } catch (error) {
        console.error('Verification error:', error);
        setVerificationStatus('error');
      } finally {
        setIsVerifying(false);
      }
    };

    verifyPayment();
  }, [searchParams]);

  if (isVerifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-lg text-gray-600">Проверяем оплату...</p>
        </div>
      </div>
    );
  }

  if (verificationStatus === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md text-center">
          <div className="bg-white p-8 rounded-2xl shadow-lg">
            <div className="text-red-500 mb-4">
              <svg className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Ошибка проверки</h1>
            <p className="text-gray-600 mb-6">
              Не удалось подтвердить оплату. Пожалуйста, свяжитесь с преподавателем.
            </p>
            <Link href="/contact">
              <Button>Связаться с нами</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md text-center">
        <div className="bg-white p-8 rounded-2xl shadow-lg">
          <div className="text-green-500 mb-4">
            <CheckCircle className="h-16 w-16 mx-auto" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Оплата успешна!
          </h1>
          <p className="text-gray-600 mb-6">
            Спасибо за бронирование! Ваш урок подтверждён.
            Подробности отправлены на ваш email.
          </p>
          <div className="space-y-3">
            <Link href="/" className="block">
              <Button className="w-full">Вернуться на главную</Button>
            </Link>
            <Link href="/schedule" className="block">
              <Button variant="outline" className="w-full">
                Посмотреть расписание
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
