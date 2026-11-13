'use client';

import Image from 'next/image';
import { Gift, Heart, Sparkles } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

export default function GiftCertificatePage() {
  const photos = [
    '/photo_2026-02-22_12-56-34.jpg',
    '/photo_2026-02-22_12-56-36.jpg',
    '/photo_2026-02-22_12-56-37.jpg',
    '/photo_2026-02-22_12-56-38.jpg',
  ];

  return (
    <div className="min-h-screen bg-cream py-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="font-script text-5xl lg:text-6xl text-text-dark mb-4">
            Gift Certificate
          </h1>
          <p className="font-montserrat text-text-dark/70 text-lg max-w-2xl mx-auto">
            Подарите близким возможность заговорить на английском! Идеальный подарок для тех, кто мечтает учить язык.
          </p>
        </div>

        {/* Certificate Preview */}
        <div className="max-w-2xl mx-auto mb-16">
          <div className="relative bg-[#3A5A40] rounded-3xl overflow-hidden shadow-2xl">
            {/* Top part - dark green with name */}
            <div className="px-8 pt-10 pb-8 text-center">
              <p className="font-script text-5xl text-white/90 mb-2">
                Ekaterina Faizieva
              </p>
              <p className="font-montserrat text-white/60 text-sm tracking-widest uppercase">
                English Teacher
              </p>
            </div>

            {/* Certificate body */}
            <div className="bg-cream mx-4 mb-4 rounded-2xl p-8">
              <div className="text-center mb-6">
                <h2 className="font-script text-4xl text-[#3A5A40] mb-1">
                  Gift Certificate
                </h2>
                <div className="w-24 h-[1px] bg-[#3A5A40]/30 mx-auto mt-2"></div>
              </div>

              <div className="space-y-4 mb-6">
                <div className="border-b border-olive/20 pb-2">
                  <span className="font-montserrat text-text-dark/50 text-sm">на сумму / услугу:</span>
                  <div className="h-6"></div>
                </div>
                <div className="border-b border-olive/20 pb-2">
                  <span className="font-montserrat text-text-dark/50 text-sm">для:</span>
                  <div className="h-6"></div>
                </div>
                <div className="border-b border-olive/20 pb-2">
                  <span className="font-montserrat text-text-dark/50 text-sm">дата:</span>
                  <div className="h-6"></div>
                </div>
              </div>

              <div className="flex items-end justify-between">
                <div>
                  <p className="font-montserrat text-text-dark/50 text-xs">Telegram: @k_f_6666</p>
                  <p className="font-montserrat text-text-dark/50 text-xs">efaizieva@mail.ru</p>
                </div>
                <div className="flex flex-col items-center">
                  <QRCodeSVG
                    value="https://t.me/k_f_6666"
                    size={80}
                    fgColor="#3A5A40"
                    bgColor="transparent"
                    level="M"
                  />
                  <p className="font-montserrat text-text-dark/40 text-[10px] mt-1">Telegram</p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-olive/10">
                <p className="font-montserrat text-text-dark/40 text-[10px] text-center">
                  Сертификат действителен 3 месяца со дня приобретения. Не подлежит возврату и обмену на денежные средства.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Why gift section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <div className="bg-white p-6 rounded-2xl border border-olive/20 text-center">
            <div className="p-3 bg-olive/10 rounded-xl w-fit mx-auto mb-4">
              <Gift className="w-6 h-6 text-olive" />
            </div>
            <h3 className="font-script text-2xl text-text-dark mb-2">Оригинальный подарок</h3>
            <p className="font-montserrat text-text-dark/70 text-sm">
              Уникальный и полезный подарок, который запомнится надолго
            </p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-olive/20 text-center">
            <div className="p-3 bg-olive/10 rounded-xl w-fit mx-auto mb-4">
              <Heart className="w-6 h-6 text-olive" />
            </div>
            <h3 className="font-script text-2xl text-text-dark mb-2">Для родных и близких</h3>
            <p className="font-montserrat text-text-dark/70 text-sm">
              Подарите маме, другу, коллеге или ребёнку возможность учить английский
            </p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-olive/20 text-center">
            <div className="p-3 bg-olive/10 rounded-xl w-fit mx-auto mb-4">
              <Sparkles className="w-6 h-6 text-olive" />
            </div>
            <h3 className="font-script text-2xl text-text-dark mb-2">Гибкий формат</h3>
            <p className="font-montserrat text-text-dark/70 text-sm">
              Любое количество уроков — от одного до полного пакета
            </p>
          </div>
        </div>

        {/* Photos */}
        <div className="mb-16">
          <h2 className="font-script text-4xl text-text-dark text-center mb-8">Мои ученики</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {photos.map((photo, index) => (
              <div key={index} className="relative aspect-square rounded-2xl overflow-hidden border border-olive/20">
                <Image
                  src={photo}
                  alt={`Ученики ${index + 1}`}
                  fill
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="bg-[#3A5A40] p-8 rounded-2xl text-center">
          <h2 className="font-script text-4xl text-white mb-4">Хотите приобрести?</h2>
          <p className="font-montserrat text-white/70 mb-6">
            Напишите мне в Telegram — подберём нужный вариант и оформим красивый сертификат
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://t.me/k_f_6666"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex px-8 py-4 bg-white text-[#3A5A40] font-montserrat font-medium rounded-full hover:bg-cream transition-colors"
            >
              Написать в Telegram
            </a>
            <a
              href="/api/gift-certificate-pdf"
              className="inline-flex px-8 py-4 border-2 border-white text-white font-montserrat font-medium rounded-full hover:bg-white/10 transition-colors"
            >
              Скачать сертификат PDF
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
