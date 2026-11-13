import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seed...');

  const reviews = [
    {
      name: 'Анна Смирнова',
      photo: '/images/54579725-cb1f-44e4-8e7b-b2fbc1154ecd.png',
      rating: 5,
      text: 'Занимаюсь с Екатериной уже полгода. Мой уровень английского значительно вырос! Уроки проходят интересно, материал подаётся доступно. Рекомендую!',
      occupation: 'Студентка',
    },
    {
      name: 'Дмитрий Петров',
      photo: '/images/070d9b65-2ebc-42fe-8720-f5b0d1549772.png',
      rating: 5,
      text: 'Отличный преподаватель! Готовился к IELTS, сдал на 7.5 баллов. Екатерина помогла структурировать знания и повысить уверенность в говорении.',
      occupation: 'Менеджер',
    },
    {
      name: 'Мария Козлова',
      photo: '/images/9458d60a-6233-425f-88fa-2638370223ef.png',
      rating: 5,
      text: 'Чудесные уроки! Всёгда боялась говорить на английском, но Екатерина создала комфортную атмосферу. Теперь свободно общаюсь с иностранцами!',
      occupation: 'Школьница',
    },
    {
      name: 'Алексей Волков',
      photo: '/images/8f4ac27f-1f57-4ccf-8dcc-fe6a20e625c3.png',
      rating: 5,
      text: 'Профессиональный подход к обучению. Уроки всегда хорошо спланированы, много разговорной практики. Прогресс заметен уже через несколько занятий.',
      occupation: 'IT-специалист',
    },
    {
      name: 'Елена Соколова',
      photo: '/images/2d4b8546-a05d-40d9-a22a-e64bb1a0162f.png',
      rating: 5,
      text: 'Очень довольна занятиями! Екатерина находит подход к каждому ученику. Онлайн-формат очень удобен, можно заниматься из дома.',
      occupation: 'Бухгалтер',
    },
    {
      name: 'Ольга Новикова',
      photo: '/images/5e994ec7-b618-47aa-97d6-098c0ab232fc.png',
      rating: 5,
      text: 'Занимаюсь в группе с подругами. Очень весёло и продуктивно! Екатерина умеет заинтересовать и мотивировать. Цены адекватные.',
      occupation: 'Маркетолог',
    },
    {
      name: 'Игорь Морозов',
      photo: '/images/ee68d076-03a4-4a59-b6d8-4e3201b70c08.png',
      rating: 5,
      text: 'Великолепный преподаватель! Помогла подготовиться к собеседованию на английском. Уроки насыщенные, но не перегруженные. Результатом очень доволен!',
      occupation: 'Продавец',
    },
  ];

  console.log('Seeding reviews...');
  for (const review of reviews) {
    await prisma.review.upsert({
      where: { id: reviews.indexOf(review) + 1 },
      update: {},
      create: review,
    });
  }
  console.log(`${reviews.length} reviews seeded.`);

  const timeSlots = [];
  const times = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'];
  
  for (let day = 1; day <= 5; day++) {
    for (const time of times) {
      timeSlots.push({
        dayOfWeek: day,
        time,
        isAvailable: true,
        maxBookings: 3,
      });
    }
  }

  console.log('Seeding time slots...');
  for (const slot of timeSlots) {
    await prisma.timeSlot.upsert({
      where: {
        dayOfWeek_time: {
          dayOfWeek: slot.dayOfWeek,
          time: slot.time,
        },
      },
      update: {},
      create: slot,
    });
  }
  console.log(`${timeSlots.length} time slots seeded.`);

  console.log('Database seed completed!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
