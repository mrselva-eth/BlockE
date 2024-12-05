import './globals.css'
import type { Metadata } from 'next'
import { Inter, Poppins } from 'next/font/google'
import { WalletProvider } from '@/contexts/WalletContext'
import NavbarContent from '@/components/NavbarContent'
import WalletComponentsWrapper from '@/components/WalletComponentsWrapper'

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

const poppins = Poppins({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-poppins',
})

export const metadata: Metadata = {
  title: 'BlockE',
  description: 'Web 3.0 Analytics Platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable}`}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="font-sans antialiased">
        <WalletProvider>
          <nav className="fixed top-0 left-0 right-0 h-16 bg-white shadow-sm z-50">
            <NavbarContent />
          </nav>
          <WalletComponentsWrapper />
          <main className="pt-16">
            {children}
          </main>
        </WalletProvider>
      </body>
    </html>
  )
}

