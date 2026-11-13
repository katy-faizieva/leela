import Image from 'next/image';
import Link from 'next/link';
import { MessageCircle, Sparkles, Heart, Target, Send, Phone, Instagram } from 'lucide-react';

export default function Home() {
  const benefits = [
    {
      icon: MessageCircle,
      title: 'Спокойная атмосфера',
      description: 'Здесь можно ошибаться — это часть процесса. Без стресса и давления.',
    },
    {
      icon: Sparkles,
      title: 'Много практики',
      description: 'Будем говорить с первого урока, даже если пока знаете только "hello"',
    },
    {
      icon: Heart,
      title: 'Поддержка и фидбек',
      description: 'Мягко подскажу, где подправить, и порадуюсь вашим успехам вместе с вами',
    },
    {
      icon: Target,
      title: 'Под ваши цели',
      description: 'Программа строится под вас — ваши интересы, темп и задачи',
    },
  ];

  const stats = [
    { number: '✓', label: 'Сертификат TESOL/TEFL' },
    { number: '2', label: 'года во Вьетнаме' },
    { number: '6', label: 'лет тьюторства онлайн' },
  ];

  return (
    <div className="min-h-screen bg-cream">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <p className="font-montserrat text-olive-dark uppercase tracking-widest text-sm mb-4">
                Online English Teacher
              </p>
              <h1 className="font-script text-4xl sm:text-5xl lg:text-6xl text-text-dark leading-tight mb-6 whitespace-nowrap">
                Hello, I&apos;m Katy!
              </h1>
              <p className="font-montserrat text-text-dark/70 text-lg mb-8 max-w-lg">
                Помогаю овладеть английским языком — уверенно, свободно и без внутреннего напряжения. Обучение проходит в атмосфере комфорта и внимания к деталям: структурно, элегантно и с бережной поддержкой на каждом этапе.
              </p>
              <a
                href="https://t.me/k_f_6666"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex px-8 py-4 bg-olive text-white font-montserrat font-medium rounded-full hover:bg-olive-dark transition-all transform hover:scale-105"
              >
                Записаться на пробный урок
              </a>
            </div>
            <div className="order-1 lg:order-2 relative">
              <div className="relative aspect-[3/4] max-w-md mx-auto">
                <div className="absolute inset-0 bg-olive/20 rounded-3xl transform rotate-3"></div>
                <div className="relative h-full rounded-3xl overflow-hidden border-4 border-white shadow-xl">
                  <Image
                    src="/hero-photo.png"
                    alt="Ekaterina — English Teacher"
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 border-y border-olive/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-playfair text-3xl text-center text-olive-dark mb-12">
            Немного обо мне
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center p-6 bg-white rounded-2xl border border-olive/20">
                <span className="font-playfair text-4xl font-bold text-olive block mb-2">
                  {stat.number}
                </span>
                <span className="font-montserrat text-text-dark/70 text-sm">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tagline */}
      <section className="py-12 bg-olive/5">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="font-montserrat text-text-dark/60 text-lg">
            Английский, который тебе действительно нужен
          </p>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-playfair text-4xl lg:text-5xl text-center text-text-dark mb-4">
            Как проходят занятия
          </h2>
          <p className="font-montserrat text-text-dark/60 text-center mb-16 max-w-2xl mx-auto">
            Комфортно, понятно и с результатом
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <div
                  key={index}
                  className="group p-8 bg-white rounded-2xl border border-olive/20 hover:border-olive/40 hover:shadow-lg transition-all"
                >
                  <div className="flex items-start gap-5">
                    <div className="p-3 bg-olive/10 rounded-xl group-hover:bg-olive/20 transition-colors">
                      <Icon className="h-6 w-6 text-olive-dark" />
                    </div>
                    <div>
                      <h3 className="font-playfair text-xl font-semibold text-text-dark mb-2">
                        {benefit.title}
                      </h3>
                      <p className="font-montserrat text-text-dark/70 leading-relaxed">
                        {benefit.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="text-center mt-12">
            <a
              href="https://t.me/k_f_6666"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex px-8 py-4 bg-olive text-white font-montserrat font-medium rounded-full hover:bg-olive-dark transition-all"
            >
              Написать мне
            </a>
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-script text-5xl text-center text-text-dark mb-12">
            А сколько стоит?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-cream rounded-2xl border-2 border-olive text-center relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 px-4 py-1 bg-olive text-white text-xs font-montserrat rounded-full">
                Популярный
              </div>
              <span className="text-2xl mb-2 block">✦</span>
              <h3 className="font-playfair text-xl text-text-dark mb-2">Английский для себя</h3>
              <p className="font-montserrat text-text-dark/60 text-sm mb-4">50 минут</p>
              <p className="font-playfair text-2xl font-bold text-olive mb-4">от 2200 ₽</p>
              <Link
                href="/services"
                className="inline-flex px-6 py-2 bg-olive text-white font-montserrat text-sm font-medium rounded-full hover:bg-olive-dark transition-colors"
              >
                Подробнее
              </Link>
            </div>

            <div className="p-6 bg-cream rounded-2xl border border-olive/20 text-center">
              <span className="text-2xl mb-2 block">◆</span>
              <h3 className="font-playfair text-xl text-text-dark mb-2">Школьная программа</h3>
              <p className="font-montserrat text-text-dark/60 text-sm mb-4">45 минут</p>
              <p className="font-playfair text-2xl font-bold text-olive mb-4">от 1400 ₽</p>
              <Link
                href="/services"
                className="inline-flex px-6 py-2 bg-olive/10 text-olive font-montserrat text-sm font-medium rounded-full hover:bg-olive/20 transition-colors"
              >
                Подробнее
              </Link>
            </div>

            <div className="p-6 bg-cream rounded-2xl border border-olive/20 text-center">
              <span className="text-2xl mb-2 block">▸</span>
              <h3 className="font-playfair text-xl text-text-dark mb-2">Business English</h3>
              <p className="font-montserrat text-text-dark/60 text-sm mb-4">60 минут</p>
              <p className="font-playfair text-2xl font-bold text-olive mb-4">от 2400 ₽</p>
              <Link
                href="/services"
                className="inline-flex px-6 py-2 bg-olive/10 text-olive font-montserrat text-sm font-medium rounded-full hover:bg-olive/20 transition-colors"
              >
                Подробнее
              </Link>
            </div>
          </div>

          {/* Пробное занятие */}
          <div className="mt-8 p-6 bg-olive/10 rounded-2xl border border-olive/30 text-center">
            <div className="flex flex-col md:flex-row items-center justify-center gap-4">
              <span className="text-3xl text-olive">★</span>
              <div>
                <h3 className="font-playfair text-xl text-text-dark">Пробное занятие — бесплатно</h3>
                <p className="font-montserrat text-text-dark/60 text-sm">30 минут: познакомимся, определим уровень и обсудим ваши цели</p>
              </div>
              <a
                href="https://t.me/k_f_6666"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex px-6 py-3 bg-olive text-white font-montserrat text-sm font-medium rounded-full hover:bg-olive-dark transition-colors"
              >
                Записаться
              </a>
            </div>
          </div>

          <div className="text-center mt-8">
            <Link
              href="/services"
              className="font-montserrat text-olive hover:text-olive-dark underline"
            >
              Смотреть все тарифы →
            </Link>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 border-t border-olive/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-playfair text-3xl text-center text-text-dark mb-8">
            Свяжитесь со мной
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <a 
              href="https://t.me/k_f_6666" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex flex-col items-center gap-2 p-4 bg-white rounded-xl border border-olive/20 hover:border-olive/40 transition"
            >
              <Send className="w-6 h-6 text-olive" />
              <span className="font-montserrat text-text-dark/70 text-sm">Telegram</span>
            </a>
            <a 
              href="https://wa.me/79500980860" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex flex-col items-center gap-2 p-4 bg-white rounded-xl border border-olive/20 hover:border-olive/40 transition"
            >
              <Phone className="w-6 h-6 text-olive" />
              <span className="font-montserrat text-text-dark/70 text-sm">WhatsApp</span>
            </a>
            <a 
              href="https://www.instagram.com/katy_affogato?igsh=MXQ3OTIzamk5cDR4MA%3D%3D&utm_source=qr" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex flex-col items-center gap-2 p-4 bg-white rounded-xl border border-olive/20 hover:border-olive/40 transition"
            >
              <Instagram className="w-6 h-6 text-olive" />
              <span className="font-montserrat text-text-dark/70 text-sm">Instagram</span>
            </a>
            <a 
              href="mailto:efaizieva@mail.ru"
              className="flex flex-col items-center gap-2 p-4 bg-white rounded-xl border border-olive/20 hover:border-olive/40 transition"
            >
              <MessageCircle className="w-6 h-6 text-olive" />
              <span className="font-montserrat text-text-dark/70 text-sm">Email</span>
            </a>
          </div>
        </div>
      </section>

      {/* Students Photo Section */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-2xl overflow-hidden">
            <Image
              src="/students-photo-v3.jpg"
              alt="Урок с учениками во Вьетнаме"
              width={1200}
              height={800}
              className="w-full h-auto object-cover rounded-2xl"
            />
          </div>

        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-olive">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-script text-5xl lg:text-6xl text-white mb-6">
            Давайте начнём?
          </h2>
          <p className="font-montserrat text-white/80 text-lg mb-10 max-w-2xl mx-auto">
            Напишите мне — расскажу подробнее и подберём удобное время для пробного урока
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://t.me/k_f_6666"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex px-8 py-4 bg-white text-olive-dark font-montserrat font-medium rounded-full hover:bg-cream transition-colors"
            >
              Написать в Telegram
            </a>
            <Link
              href="/contact"
              className="inline-flex px-8 py-4 border-2 border-white text-white font-montserrat font-medium rounded-full hover:bg-white/10 transition-colors"
            >
              Все контакты
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
