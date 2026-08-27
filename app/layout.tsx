import type { Metadata } from 'next'
import { Playfair_Display, DM_Sans } from 'next/font/google'
import { AuthProvider } from '@/context/AuthContext'
import ChatLauncher from '@/components/ui/ChatLauncher'
import './globals.css'

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-playfair',
  display: 'swap',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-dm-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'GlobalReach Scholarship — Study Abroad Excellence',
  description: 'GlobalReach awards merit-based, need-aware scholarships to ambitious students at world-class universities across 40+ countries.',
  keywords: ['scholarship', 'study abroad', 'international education', 'financial aid'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${playfair.variable} ${dmSans.variable}`}>
      <body>
        <AuthProvider>
          {children}
          <ChatLauncher />
        </AuthProvider>
      </body>
    </html>
  )
}
