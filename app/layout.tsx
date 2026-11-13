import type { Metadata } from 'next';
import { Playfair_Display, Montserrat, Great_Vibes } from 'next/font/google';
import './globals.css';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { Toaster } from 'sonner';

const playfair = Playfair_Display({ 
  subsets: ['latin', 'cyrillic'],
  variable: '--font-playfair',
  display: 'swap',
});

const montserrat = Montserrat({ 
  subsets: ['latin', 'cyrillic'],
  variable: '--font-montserrat',
  display: 'swap',
});

const greatVibes = Great_Vibes({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-script',
  display: 'swap',
});

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXTAUTH_URL || 'http://localhost:3000'),
  title: 'Ekaterina Faizieva — English Teacher Online',
  description: 'Профессиональный наставник английского языка онлайн. Индивидуальные, парные и групповые уроки. Опытный преподаватель с современными методиками обучения.',
  keywords: 'English teacher, английский онлайн, индивидуальные уроки, групповые занятия, наставник английского',
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
  },
  openGraph: {
    title: 'Ekaterina Faizieva — English Teacher Online',
    description: 'Профессиональный наставник английского языка онлайн. Индивидуальные, парные и групповые уроки.',
    images: ['/og-image.png'],
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru" suppressHydrationWarning className={`${playfair.variable} ${montserrat.variable} ${greatVibes.variable}`}>
      <head>
      </head>
      <body className={montserrat.className}>
        <Header />
        <main className="min-h-screen">{children}</main>
        <Footer />
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
