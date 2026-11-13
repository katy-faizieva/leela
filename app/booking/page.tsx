'use client';

import { Send, Phone, Instagram, Mail, Gift, Clock, CheckCircle } from 'lucide-react';

export default function BookingPage() {
  return (
    <div className="bg-cream py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="font-playfair text-4xl text-text-dark mb-4 text-center">Записаться на урок</h1>
        <p className="font-montserrat text-text-dark/70 text-center mb-12">
          Напишите мне — обсудим ваши цели и подберём удобное время
        </p>

        <div className="max-w-xl mx-auto">
          {/* Пробный урок */}
          <div className="bg-olive/10 p-8 rounded-2xl border-2 border-olive mb-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-olive rounded-full">
                <Gift className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="font-playfair text-2xl text-text-dark">Пробный урок</h2>
                <p className="font-montserrat text-olive font-semibold">Бесплатно • 30 минут</p>
              </div>
            </div>
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-olive" />
                <span className="font-montserrat text-text-dark/70">Определим ваш уровень</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-olive" />
                <span className="font-montserrat text-text-dark/70">Обсудим цели и пожелания</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-olive" />
                <span className="font-montserrat text-text-dark/70">Познакомимся с форматом уроков</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-olive" />
                <span className="font-montserrat text-text-dark/70">Сделаем мини-практику</span>
              </div>
            </div>
          </div>

          {/* Контакты */}
          <div className="bg-white p-8 rounded-2xl border border-olive/20">
            <h2 className="font-playfair text-xl text-text-dark mb-6 text-center">Выберите удобный способ связи</h2>
            
            <div className="space-y-3">
              {/* Telegram */}
              <a 
                href="https://t.me/k_f_6666" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-4 bg-olive/5 rounded-xl hover:bg-olive/10 transition"
              >
                <div className="p-3 bg-olive/20 rounded-full">
                  <Send className="w-5 h-5 text-olive" />
                </div>
                <div>
                  <p className="font-montserrat font-semibold text-text-dark">Telegram</p>
                  <p className="font-montserrat text-text-dark/60 text-sm">@k_f_6666</p>
                </div>
              </a>

              {/* WhatsApp */}
              <a 
                href="https://wa.me/79500980860" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-4 bg-olive/5 rounded-xl hover:bg-olive/10 transition"
              >
                <div className="p-3 bg-olive/20 rounded-full">
                  <Phone className="w-5 h-5 text-olive" />
                </div>
                <div>
                  <p className="font-montserrat font-semibold text-text-dark">WhatsApp</p>
                  <p className="font-montserrat text-text-dark/60 text-sm">+7 950 098-08-60</p>
                </div>
              </a>

              {/* Instagram */}
              <a 
                href="https://www.instagram.com/katy_affogato?igsh=MXQ3OTIzamk5cDR4MA%3D%3D&utm_source=qr" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-4 bg-olive/5 rounded-xl hover:bg-olive/10 transition"
              >
                <div className="p-3 bg-olive/20 rounded-full">
                  <Instagram className="w-5 h-5 text-olive" />
                </div>
                <div>
                  <p className="font-montserrat font-semibold text-text-dark">Instagram</p>
                  <p className="font-montserrat text-text-dark/60 text-sm">@katty_affogato</p>
                </div>
              </a>

              {/* Email */}
              <a 
                href="mailto:efaizieva@mail.ru"
                className="flex items-center gap-4 p-4 bg-olive/5 rounded-xl hover:bg-olive/10 transition"
              >
                <div className="p-3 bg-olive/20 rounded-full">
                  <Mail className="w-5 h-5 text-olive" />
                </div>
                <div>
                  <p className="font-montserrat font-semibold text-text-dark">Email</p>
                  <p className="font-montserrat text-text-dark/60 text-sm">efaizieva@mail.ru</p>
                </div>
              </a>
            </div>
          </div>

          {/* Инфо о форматах */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-xl border border-olive/20 text-center">
              <Clock className="w-5 h-5 text-olive mx-auto mb-2" />
              <p className="font-montserrat text-text-dark/70 text-sm">Индивидуально</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-olive/20 text-center">
              <Clock className="w-5 h-5 text-olive mx-auto mb-2" />
              <p className="font-montserrat text-text-dark/70 text-sm">В паре</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-olive/20 text-center">
              <Clock className="w-5 h-5 text-olive mx-auto mb-2" />
              <p className="font-montserrat text-text-dark/70 text-sm">Мини-группа</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
