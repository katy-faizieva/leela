'use client';

import Image from 'next/image';
import { Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

const reviews = [
  {
    id: 1,
    name: 'Анна Смирнова',
    photo: '/images/54579725-cb1f-44e4-8e7b-b2fbc1154ecd.png',
    rating: 5,
    text: 'Занимаюсь с Екатериной уже полгода. Мой уровень английского значительно вырос! Уроки проходят интересно, материал подаётся доступно. Рекомендую!',
    occupation: 'Студентка',
  },
  {
    id: 2,
    name: 'Дмитрий Петров',
    photo: '/images/070d9b65-2ebc-42fe-8720-f5b0d1549772.png',
    rating: 5,
    text: 'Отличный преподаватель! Готовился к IELTS, сдал на 7.5 баллов. Екатерина помогла структурировать знания и повысить уверенность в говорении.',
    occupation: 'Менеджер',
  },
  {
    id: 3,
    name: 'Мария Козлова',
    photo: '/images/9458d60a-6233-425f-88fa-2638370223ef.png',
    rating: 5,
    text: 'Чудесные уроки! Всёгда боялась говорить на английском, но Екатерина создала комфортную атмосферу. Теперь свободно общаюсь с иностранцами!',
    occupation: 'Школьница',
  },
  {
    id: 4,
    name: 'Алексей Волков',
    photo: '/images/8f4ac27f-1f57-4ccf-8dcc-fe6a20e625c3.png',
    rating: 5,
    text: 'Профессиональный подход к обучению. Уроки всегда хорошо спланированы, много разговорной практики. Прогресс заметен уже через несколько занятий.',
    occupation: 'IT-специалист',
  },
  {
    id: 5,
    name: 'Елена Соколова',
    photo: '/images/2d4b8546-a05d-40d9-a22a-e64bb1a0162f.png',
    rating: 5,
    text: 'Очень довольна занятиями! Екатерина находит подход к каждому ученику. Онлайн-формат очень удобен, можно заниматься из дома.',
    occupation: 'Бухгалтер',
  },
  {
    id: 6,
    name: 'Ольга Новикова',
    photo: '/images/5e994ec7-b618-47aa-97d6-098c0ab232fc.png',
    rating: 5,
    text: 'Занимаюсь в группе с подругами. Очень весёло и продуктивно! Екатерина умеет заинтересовать и мотивировать. Цены адекватные.',
    occupation: 'Маркетолог',
  },
  {
    id: 7,
    name: 'Игорь Морозов',
    photo: '/images/ee68d076-03a4-4a59-b6d8-4e3201b70c08.png',
    rating: 5,
    text: 'Великолепный преподаватель! Помогла подготовиться к собеседованию на английском. Уроки насыщенные, но не перегруженные. Результатом очень доволен!',
    occupation: 'Продавец',
  },
];

export default function ReviewsSection() {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <section ref={ref} className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Отзывы студентов
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Что говорят мои ученики о занятиях
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.map((review, index) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="relative w-16 h-16 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                  <Image
                    src={review.photo}
                    alt={review.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{review.name}</h3>
                  {review.occupation && (
                    <p className="text-sm text-gray-500">{review.occupation}</p>
                  )}
                </div>
              </div>

              <div className="flex gap-1 mb-3">
                {Array.from({ length: review.rating }).map((_, i) => (
                  <Star
                    key={i}
                    className="h-5 w-5 text-yellow-400 fill-yellow-400"
                  />
                ))}
              </div>

              <p className="text-gray-700 text-sm leading-relaxed">{review.text}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
