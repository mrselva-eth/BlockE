import './globals.css'
import type { Metadata } from 'next'
import { WalletProvider } from '@/contexts/WalletContext'
import NavbarContent from '@/components/NavbarContent'
import NetworkWarningModal from '@/components/NetworkWarningModal'
import WalletConnectedAnimation from '@/components/WalletConnectedAnimation'
import { useWallet } from '@/contexts/WalletContext'

export const metadata: Metadata = {
  title: 'BlockE',
  description: 'Web 3.0 Analytics Platform',
}

function AnimationWrapper() {
  const { showSuccessAnimation, setShowSuccessAnimation } = useWallet()

  return showSuccessAnimation ? (
    <WalletConnectedAnimation onAnimationComplete={() => setShowSuccessAnimation(false)} />
  ) : null
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="font-sans antialiased">
        <WalletProvider>
          <nav className="fixed top-0 left-0 right-0 h-16 bg-white shadow-sm z-50">
            <NavbarContent />
          </nav>
          <NetworkWarningModal />
          <AnimationWrapper />
          <main className="pt-16">
            {children}
          </main>
        </WalletProvider>
      </body>
    </html>
  )
}

