'use client';

import { Mail, Send, Phone, Instagram, MessageSquare } from 'lucide-react';

export default function ContactPage() {
  return (
    <div className="bg-cream py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="font-playfair text-4xl text-text-dark mb-4 text-center">Свяжитесь со мной</h1>
        <p className="font-montserrat text-text-dark/70 text-center mb-12">
          Выберите удобный способ связи — отвечу в ближайшее время!
        </p>
        
        <div className="max-w-xl mx-auto">
          {/* Контакты */}
          <div className="bg-white p-8 rounded-2xl border border-olive/20">
            <h2 className="font-playfair text-2xl text-text-dark mb-6 text-center">Мои контакты</h2>
            
            <div className="space-y-4">
              {/* Telegram */}
              <a 
                href="https://t.me/k_f_6666" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-4 bg-olive/5 rounded-xl hover:bg-olive/10 transition group"
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
                className="flex items-center gap-4 p-4 bg-olive/5 rounded-xl hover:bg-olive/10 transition group"
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
                className="flex items-center gap-4 p-4 bg-olive/5 rounded-xl hover:bg-olive/10 transition group"
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
                className="flex items-center gap-4 p-4 bg-olive/5 rounded-xl hover:bg-olive/10 transition group"
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

          {/* CTA */}
          <div className="mt-8 p-6 bg-olive/10 rounded-2xl border border-olive/30">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-olive/20 rounded-xl">
                <MessageSquare className="w-5 h-5 text-olive" />
              </div>
              <div>
                <h3 className="font-playfair text-lg text-text-dark mb-2">Готовы начать?</h3>
                <p className="font-montserrat text-text-dark/70 text-sm mb-4">
                  Запишитесь на бесплатный пробный урок (30 минут) — познакомимся, определим уровень и обсудим план.
                </p>
                <a
                  href="https://t.me/k_f_6666"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-montserrat text-olive hover:text-olive-dark underline"
                >
                  Записаться на пробный урок →
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
