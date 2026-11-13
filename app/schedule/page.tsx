'use client';

import { useEffect, useState } from 'react';
import { Calendar, Clock, Loader2 } from 'lucide-react';

type Booking = {
  id: number;
  name: string;
  date: string;
  timeSlot: string;
  lessonType: string;
  status: string;
};

export default function SchedulePage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedWeek, setSelectedWeek] = useState(0);

  useEffect(() => {
    fetchSchedule();
  }, []);

  const fetchSchedule = async () => {
    try {
      const response = await fetch('/api/schedule');
      const result = await response.json();
      if (result.success) {
        setBookings(result.bookings || []);
      }
    } catch (error) {
      console.error('Error fetching schedule:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getWeekDates = (weekOffset: number = 0) => {
    const today = new Date();
    today.setDate(today.getDate() + weekOffset * 7);
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() + 1);

    const weekDates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      weekDates.push(date);
    }
    return weekDates;
  };

  const weekDates = getWeekDates(selectedWeek);

  const getBookingsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return bookings.filter((b) => {
      const bookingDate = new Date(b.date).toISOString().split('T')[0];
      return bookingDate === dateStr && b.status === 'CONFIRMED';
    });
  };

  const lessonTypeLabels: Record<string, string> = {
    INDIVIDUAL: 'Индивидуальный',
    PAIR: 'Парный',
    GROUP: 'Групповой',
  };

  const dayNames = ['Пон', 'Втор', 'Среда', 'Четв', 'Пят', 'Субб', 'Воск'];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-lg text-gray-600">Загрузка расписания...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Расписание занятий
          </h1>
          <p className="text-lg text-gray-600">
            Посмотрите доступные временные слоты для занятий
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => setSelectedWeek(selectedWeek - 1)}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
            >
              ← Предыдущая неделя
            </button>
            <div className="flex items-center gap-2 text-lg font-semibold text-gray-900">
              <Calendar className="h-5 w-5" />
              {weekDates[0]?.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })} -{' '}
              {weekDates[6]?.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}
            </div>
            <button
              onClick={() => setSelectedWeek(selectedWeek + 1)}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
            >
              Следующая неделя →
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
            {weekDates.map((date, index) => {
              const dayBookings = getBookingsForDate(date);
              const isToday =
                date.toDateString() === new Date().toDateString();

              return (
                <div
                  key={index}
                  className={`p-4 rounded-lg border-2 ${
                    isToday ? 'border-primary bg-primary/5' : 'border-gray-200'
                  }`}
                >
                  <div className="text-center mb-3">
                    <div className="text-sm font-medium text-gray-600">
                      {dayNames[index]}
                    </div>
                    <div className={`text-2xl font-bold ${
                      isToday ? 'text-primary' : 'text-gray-900'
                    }`}>
                      {date.getDate()}
                    </div>
                    <div className="text-xs text-gray-500">
                      {date.toLocaleDateString('ru-RU', { month: 'short' })}
                    </div>
                  </div>

                  <div className="space-y-2">
                    {dayBookings.length > 0 ? (
                      dayBookings.map((booking) => (
                        <div
                          key={booking.id}
                          className="bg-gray-50 p-2 rounded text-xs"
                        >
                          <div className="flex items-center gap-1 text-gray-700 mb-1">
                            <Clock className="h-3 w-3" />
                            <span className="font-medium">{booking.timeSlot}</span>
                          </div>
                          <div className="text-gray-600 truncate">
                            {lessonTypeLabels[booking.lessonType]}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center text-xs text-gray-400 py-2">
                        Свободно
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-primary text-white rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">
            Хотите забронировать урок?
          </h2>
          <p className="mb-6 text-white/90">
            Выберите удобное время и запишитесь на занятие
          </p>
          <a href="/booking">
            <button className="px-8 py-3 bg-white text-primary font-semibold rounded-lg hover:bg-gray-100 transition">
              Записаться на урок
            </button>
          </a>
        </div>
      </div>
    </div>
  );
}
