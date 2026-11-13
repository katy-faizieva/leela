import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Check, Clock, Leaf, GraduationCap, Target, Briefcase, Users, Heart, Gift } from 'lucide-react';

export default function ServicesPage() {
  const services = [
    {
      icon: Leaf,
      emoji: '✦',
      title: 'Английский для себя / путешествий',
      description: 'Уверенное общение в путешествиях, аэропорту, отеле, ресторанах. Также подходит тем, кто переезжает за границу',
      duration: '50 минут',
      prices: [
        { label: '1 занятие', price: '2200' },
        { label: 'Пакет 8', price: '17100' },
        { label: 'Пакет 12', price: '22900' },
      ],
    },
    {
      icon: GraduationCap,
      emoji: '◆',
      title: 'Школьная программа',
      description: 'Помощь с домашними заданиями, подготовка к контрольным, улучшение оценок',
      duration: '45 минут',
      prices: [
        { label: '1 занятие', price: '1400' },
        { label: 'Пакет 8', price: '9000' },
        { label: 'Пакет 12', price: '12000' },
      ],
    },
    {
      icon: Briefcase,
      emoji: '▸',
      title: 'Business English / работа',
      description: 'Деловая переписка, встречи, презентации, профессиональная лексика',
      duration: '60 минут',
      prices: [
        { label: '1 занятие', price: '2400' },
        { label: 'Пакет 8', price: '19300' },
        { label: 'Пакет 12', price: '25600' },
      ],
    },
    {
      icon: Heart,
      emoji: '♡',
      title: 'Парные занятия',
      description: 'Занятия с другом или коллегой — веселее и выгоднее',
      duration: '60 минут',
      prices: [
        { label: '1 занятие (за человека)', price: '1000' },
      ],
    },
    {
      icon: Users,
      emoji: '◇',
      title: 'Мини-группа',
      description: 'Групповые занятия 3–5 человек, дружелюбная атмосфера',
      duration: '50 минут',
      prices: [
        { label: 'За человека', price: '1300' },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-cream py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="font-script text-5xl text-text-dark mb-12 text-center">А сколько стоит?</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, index) => (
            <div 
              key={index} 
              className="bg-white p-6 rounded-2xl border border-olive/20 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">{service.emoji}</span>
                <h2 className="font-playfair text-xl text-text-dark">{service.title}</h2>
              </div>
              <p className="font-montserrat text-text-dark/70 text-sm mb-4">{service.description}</p>
              <div className="flex items-center gap-2 mb-4 text-text-dark/60">
                <Clock className="w-4 h-4" />
                <span className="font-montserrat text-sm">Длительность — {service.duration}</span>
              </div>
              <div className="space-y-2 pt-4 border-t border-olive/10">
                {service.prices.map((priceItem, i) => (
                  <div key={i} className="flex justify-between items-center">
                    <span className="font-montserrat text-text-dark/70 text-sm">{priceItem.label}</span>
                    <span className="font-montserrat font-semibold text-olive">{priceItem.price} ₽</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Пробное занятие */}
        <div className="mt-12 bg-olive/10 p-8 rounded-2xl border-2 border-olive">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <span className="text-4xl text-olive">★</span>
              <div>
                <h2 className="font-playfair text-2xl text-text-dark">Пробное занятие</h2>
                <p className="font-montserrat text-olive font-semibold text-xl">Бесплатно</p>
                <p className="font-montserrat text-text-dark/70 text-sm">Длительность — 30 минут</p>
              </div>
            </div>
            <div className="text-left md:text-right">
              <p className="font-montserrat text-text-dark/70 mb-4">На пробном занятии мы:</p>
              <ul className="space-y-1">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-olive" />
                  <span className="font-montserrat text-text-dark/70 text-sm">Определим уровень</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-olive" />
                  <span className="font-montserrat text-text-dark/70 text-sm">Обсудим цели</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-olive" />
                  <span className="font-montserrat text-text-dark/70 text-sm">Познакомимся с форматом</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-olive" />
                  <span className="font-montserrat text-text-dark/70 text-sm">Сделаем мини-практику</span>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-6 text-center">
            <a href="https://t.me/k_f_6666" target="_blank" rel="noopener noreferrer">
              <Button className="bg-olive hover:bg-olive-dark text-white px-8">
                Записаться на пробный урок
              </Button>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
