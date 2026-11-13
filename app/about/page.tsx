import Image from 'next/image';
import { Star, Check, GraduationCap, Heart, Target, Users, Globe, Award, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function AboutPage() {
  const studentPhotos = [
    '/photo_2026-02-22_12-56-41.jpg',
    '/photo_2026-02-22_12-56-34.jpg',
    '/photo_2026-02-22_12-56-36.jpg',
    '/photo_2026-02-22_12-56-37.jpg',
    '/photo_2026-02-22_12-56-38.jpg',
    '/photo_2026-02-22_12-56-42.jpg',
  ];

  const forYou = [
    'Beginners — начинающие',
    'Middle level — средний уровень',
    'English for work — для работы',
    'English по школьной программе',
    'English for travel — для путешествий',
    'Business English — деловой английский',
    'Kids and adults — дети и взрослые',
  ];

  return (
    <div className="bg-cream py-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Заголовок */}
        <div className="text-center mb-12">
          <h1 className="font-script text-5xl text-text-dark mb-4">About me</h1>
          <p className="font-montserrat text-text-dark/70">Hi! I&apos;m Ekaterina, English teacher с сертификатом TESOL/TEFL</p>
        </div>

        {/* Немного обо мне - расширенная секция */}
        <div className="bg-white p-8 rounded-2xl border border-olive/20 mb-12">
          <h2 className="font-playfair text-2xl text-text-dark mb-6 flex items-center gap-2">
            <Heart className="w-6 h-6 text-olive" />
            Немного обо мне
          </h2>
          <div className="prose max-w-none">
            <p className="font-montserrat text-text-dark/80 text-lg leading-relaxed mb-6">
              Екатерина — ваш наставник английского с международным сертификатом TESOL/TEFL. 
              Мой путь в преподавании начался во <span className="text-olive font-semibold">Вьетнаме</span>, где я преподавала 2 года и полюбила это дело всем сердцем.
            </p>
            <p className="font-montserrat text-text-dark/80 text-lg leading-relaxed mb-6">
              Сейчас за плечами <span className="text-olive font-semibold">6 лет тьюторства онлайн</span> — я работаю с учениками из разных стран и знаю, 
              как сделать обучение удобным и эффективным, даже если мы на разных концах земного шара.
            </p>
            <p className="font-montserrat text-text-dark/80 text-lg leading-relaxed mb-6">
              Я верю, что учиться должно быть <span className="text-olive font-semibold">интересно и легко</span>, а не стрессово. 
              На уроках вы чувствуете поддержку и спокойствие — здесь можно ошибаться, задавать вопросы и двигаться в своём темпе.
            </p>
            <div className="flex flex-wrap gap-4 mb-6">
              <div className="flex items-center gap-2 bg-olive/10 px-4 py-2 rounded-full">
                <Users className="w-4 h-4 text-olive" />
                <span className="font-montserrat text-text-dark/70 text-sm">Индивидуальные занятия</span>
              </div>
              <div className="flex items-center gap-2 bg-olive/10 px-4 py-2 rounded-full">
                <Heart className="w-4 h-4 text-olive" />
                <span className="font-montserrat text-text-dark/70 text-sm">Парные занятия</span>
              </div>
              <div className="flex items-center gap-2 bg-olive/10 px-4 py-2 rounded-full">
                <Users className="w-4 h-4 text-olive" />
                <span className="font-montserrat text-text-dark/70 text-sm">Мини-группы (3–5 чел.)</span>
              </div>
            </div>
            <p className="font-montserrat text-text-dark/70">
              👩‍🏫 <strong>Возраст учеников:</strong> от 6 лет и без ограничений по возрасту
            </p>
          </div>
        </div>

        {/* Принцип 50/50 */}
        <div className="bg-olive/10 p-8 rounded-2xl border border-olive/30 mb-12">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-olive/20 rounded-xl">
              <Sparkles className="w-6 h-6 text-olive" />
            </div>
            <div>
              <h2 className="font-playfair text-2xl text-text-dark mb-4">Моя философия</h2>
              <p className="font-montserrat text-text-dark/80 text-lg leading-relaxed">
                Достижение результата — это <span className="text-olive font-semibold">50% вклад учителя</span> и <span className="text-olive font-semibold">50% вклад ученика</span>. 
                Я даю структуру, методы и поддержку, а вы — своё время, старание и желание учиться. Вместе мы создаём прогресс!
              </p>
            </div>
          </div>
        </div>

        {/* Experience и My Style */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white p-8 rounded-2xl border border-olive/20">
            <h2 className="font-playfair text-2xl text-text-dark mb-6 flex items-center gap-2">
              <Award className="w-6 h-6 text-olive" />
              Опыт
            </h2>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <Globe className="w-5 h-5 text-olive flex-shrink-0 mt-1" />
                <div>
                  <p className="font-montserrat font-semibold text-text-dark">2 года преподавания во Вьетнаме</p>
                  <p className="font-montserrat text-text-dark/60 text-sm">Работа с учениками разных возрастов и уровней</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Target className="w-5 h-5 text-olive flex-shrink-0 mt-1" />
                <div>
                  <p className="font-montserrat font-semibold text-text-dark">6 лет тьюторства онлайн</p>
                  <p className="font-montserrat text-text-dark/60 text-sm">Ученики из России и других стран</p>
                </div>
              </li>
            </ul>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-olive/20">
            <h2 className="font-playfair text-2xl text-text-dark mb-6 flex items-center gap-2">
              <GraduationCap className="w-6 h-6 text-olive" />
              Образование
            </h2>
            <ul className="space-y-3">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-olive" />
                <span className="font-montserrat text-text-dark/70 text-sm">Высшее педагогическое образование</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-olive" />
                <span className="font-montserrat text-text-dark/70 text-sm">Профессиональная подготовка</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-olive" />
                <span className="font-montserrat text-text-dark/70 text-sm">Сертификат TESOL/TEFL</span>
              </li>
            </ul>
          </div>
        </div>

        {/* My Style */}
        <div className="bg-white p-8 rounded-2xl border border-olive/20 mb-12">
          <h2 className="font-playfair text-2xl text-text-dark mb-6 flex items-center gap-2">
            <Star className="w-6 h-6 text-olive" />
            Мой стиль
          </h2>
          <p className="font-montserrat text-text-dark/80 mb-4">
            Мои уроки — <span className="text-olive font-semibold">понятные</span>, <span className="text-olive font-semibold">структурированные</span> 
            и <span className="text-olive font-semibold">с фокусом на цель</span>, но при этом спокойные и интересные.
          </p>
          <p className="font-montserrat text-text-dark/70 mb-6">
            Со мной обучение комфортное и весёлое. Вы можете говорить спокойно, делать ошибки 
            и постепенно становиться увереннее.
          </p>
        </div>



        {/* Фото с учениками */}
        <div className="mb-12">

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {studentPhotos.map((photo, index) => (
              <div key={index} className="relative aspect-square rounded-2xl overflow-hidden border border-olive/20">
                <Image
                  src={photo}
                  alt={`Ученик ${index + 1}`}
                  fill
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <a href="https://t.me/k_f_6666" target="_blank" rel="noopener noreferrer">
            <Button className="bg-olive hover:bg-olive-dark text-white px-8 py-3">
              Записаться на пробный урок
            </Button>
          </a>
        </div>
      </div>
    </div>
  );
}
