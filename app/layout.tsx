import type { Metadata } from 'next'
import { Playfair_Display, DM_Sans } from 'next/font/google'
import { AuthProvider } from '@/context/AuthContext'
import ChatLauncher from '@/components/ui/ChatLauncher'
import { atlasStats } from '@/lib/data'
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
  title: 'GlobalReach — World University Atlas',
  description: `Explore ${atlasStats.universities} universities that welcome international students across ${atlasStats.countries} countries, and find the scholarships to get you there.`,
  keywords: ['university atlas', 'study abroad', 'international universities', 'international education', 'scholarships'],
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
