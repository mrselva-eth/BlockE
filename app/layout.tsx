import './globals.css'
import type { Metadata } from 'next'
import { Inter, Space_Grotesk, Roboto_Mono, Poppins } from 'next/font/google'
import { WalletProvider } from '@/contexts/WalletContext'
import ClientLayout from './ClientLayout'

if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', event => {
    console.error('Unhandled rejection (promise: ', event.promise, ', reason: ', event.reason, ').')
  })
}

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

const spaceGrotesk = Space_Grotesk({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-space-grotesk',
})

const robotoMono = Roboto_Mono({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-roboto-mono',
})

export const metadata: Metadata = {
  title: 'BlockE',
  description: 'Web 3.0 Analytics Platform',
  icons: {
    icon: [
      {
        url: '/blocke-logo.png',
        sizes: '32x32',
        type: 'image/png',
      },
      {
        url: '/blocke-logo.png',
        sizes: '16x16',
        type: 'image/png',
      }
    ],
    apple: {
      url: '/blocke-logo.png',
      sizes: '180x180',
      type: 'image/png',
    },
    shortcut: '/blocke-logo.png',
  },
  manifest: '/manifest.json'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable} ${poppins.variable} ${robotoMono.variable}`}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/blocke-logo.png" sizes="any" />
      </head>
      <body className={`${spaceGrotesk.variable} font-space-grotesk antialiased`}>
        <WalletProvider>
          <ClientLayout>
            {children}
          </ClientLayout>
        </WalletProvider>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.ETHERSCAN_API_KEY = "${process.env.NEXT_PUBLIC_ETHERSCAN_API_KEY}";
              window.INFURA_PROJECT_ID = "${process.env.NEXT_PUBLIC_INFURA_PROJECT_ID}";
            `,
          }}
        />
        <script dangerouslySetInnerHTML={{
          __html: `
            window.onload = function() {
              window.scrollTo(0, 0);
            }
          `
        }} />
      </body>
    </html>
  )
}

