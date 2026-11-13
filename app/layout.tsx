export const dynamic = 'force-dynamic'

import './globals.css'
import { Toaster } from '@/components/ui/sonner'
import { ChunkLoadErrorHandler } from '@/components/chunk-load-error-handler'
import { AuthProvider } from '@/components/auth-provider'
import { ContentProtection } from '@/components/content-protection'

export const metadata = {
  title: 'Leela — Игра Самопознания',
  description: 'Духовная настольная игра Лила — путешествие по 72 клеткам сознания',
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
  },
  openGraph: {
    images: ['/og-image.png'],
  },
  metadataBase: new URL(process.env.NEXTAUTH_URL || 'http://localhost:3000'),
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <head><link rel="stylesheet" href="/fonts/site-fonts.css" /></head>
      <body className="min-h-screen">
        <AuthProvider>
          <ContentProtection>{children}</ContentProtection>
          <Toaster />
          <ChunkLoadErrorHandler />
        </AuthProvider>
      </body>
    </html>
  )
}
