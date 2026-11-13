import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { XCircle } from 'lucide-react';

export default function PaymentCancelPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md text-center">
        <div className="bg-white p-8 rounded-2xl shadow-lg">
          <div className="text-orange-500 mb-4">
            <XCircle className="h-16 w-16 mx-auto" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Оплата отменена
          </h1>
          <p className="text-gray-600 mb-6">
            Вы отменили оплату. Ваше бронирование не было подтверждено.
            Вы можете попробовать снова.
          </p>
          <div className="space-y-3">
            <Link href="/booking" className="block">
              <Button className="w-full">Попробовать снова</Button>
            </Link>
            <Link href="/" className="block">
              <Button variant="outline" className="w-full">
                Вернуться на главную
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
