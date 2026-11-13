# Ekaterina Faizieva — English Teacher (исходный код сайта)

Полностью независимая версия сайта: без привязок к Abacus.AI. Все изображения лежат локально в `public/`.

**Стек:** Next.js 14 (App Router) · React 18 · TypeScript · Tailwind CSS · Prisma + PostgreSQL

Сборка проверена: `npm install` → `npm run build` → `npm start` — все страницы отвечают 200.

---

## 1. Требования

- Node.js **18.18+** (рекомендуется 20 LTS)
- PostgreSQL — нужна только для форм «Запись» и «Контакты». Бесплатно: [neon.tech](https://neon.tech) или [supabase.com](https://supabase.com)

## 2. Быстрый старт

```bash
npm install                # установит зависимости и сгенерирует Prisma-клиент
cp .env.example .env       # затем впишите свой DATABASE_URL
npx prisma db push         # создаст таблицы в базе
npm run build
npm start                  # сайт на http://localhost:3000
```

Для разработки: `npm run dev`.

## 3. Переменные окружения (`.env`)

| Переменная | Обязательно | Назначение |
|---|---|---|
| `DATABASE_URL` | да | Строка подключения PostgreSQL |
| `RESEND_API_KEY` | нет | Email-уведомления с формы контактов ([resend.com](https://resend.com)) |
| `EMAIL_FROM` | нет | Адрес отправителя (по умолчанию `onboarding@resend.dev`) |
| `NOTIFY_EMAIL` | нет | Куда приходят заявки (по умолчанию `efaizieva@mail.ru`) |
| `STRIPE_SECRET_KEY` | нет | Онлайн-оплата при записи. Без ключа заявка сохраняется без оплаты |

## 4. Деплой

### Vercel (бесплатно, проще всего)
1. Загрузите папку в репозиторий GitHub.
2. На [vercel.com](https://vercel.com): **Add New → Project** → выберите репозиторий.
3. В **Environment Variables** добавьте `DATABASE_URL` (и опциональные).
4. **Deploy**. Один раз выполните локально `npx prisma db push` с тем же `DATABASE_URL`.
5. Домен: **Settings → Domains → Add**, затем пропишите DNS-записи у регистратора.

### VPS (Timeweb, Beget, Hetzner и т.п.)
```bash
npm install && npx prisma db push && npm run build
npm install -g pm2
pm2 start npm --name ekaterina -- start
pm2 save && pm2 startup
```
Затем настройте Nginx как reverse proxy на `localhost:3000` и HTTPS через certbot.

### Обычный PHP-хостинг без Node.js
Не подойдёт: сайту нужен Node.js. Выбирайте хостинг с поддержкой Node.js, VPS или Vercel.

## 5. Что изменено относительно версии на Abacus.AI

- Изображения с CDN Abacus скачаны в `public/images/`.
- Удалён служебный скрипт платформы из `app/layout.tsx`.
- Подарочный сертификат PDF: теперь готовый файл `public/gift-certificate-ekaterina.pdf` (кнопка на `/gift` работает как раньше).
- Email-уведомления: вместо API платформы используется Resend (опционально).
- `next.config.js`, `tsconfig.json`, `prisma/schema.prisma`, `package.json` очищены от платформенных настроек.

## 6. Где что редактировать

| Что | Файл |
|---|---|
| Главная | `app/page.tsx`, `components/hero-section.tsx` |
| Обо мне | `app/about/page.tsx` |
| Цены и услуги | `app/services/page.tsx` |
| Запись | `app/booking/page.tsx` |
| Контакты | `app/contact/page.tsx` |
| Сертификат | `app/gift/page.tsx` |
| Шапка / подвал | `components/header.tsx`, `components/footer.tsx` |
| Отзывы | `components/reviews-section.tsx` |
| Цвета и шрифты | `tailwind.config.ts`, `app/globals.css`, `app/layout.tsx` |
| Изображения | `public/` |
