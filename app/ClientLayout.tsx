'use client'

import { useEffect } from 'react'
import { useWallet } from '@/contexts/WalletContext'
import NavbarContent from '@/components/NavbarContent'
import WalletComponentsWrapper from '@/components/WalletComponentsWrapper'
import NetworkSwitchAlert from '@/components/NetworkSwitchAlert'
import ConditionalCryptoStatsTicker from '@/components/ConditionalCryptoStatsTicker'
import AutoDisconnectLayer from '@/components/AutoDisconnectLayer'
import WalletDisconnectedAnimation from '@/components/WalletDisconnectedAnimation'

const CustomThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const { theme } = useWallet()

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  return (
    <>
      {children}
      <div 
        className={`fixed inset-0 z-0 transition-opacity duration-300 ease-in-out ${
          theme === 'dark' ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          backgroundImage: "url('/dark-blockchain-background.gif')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
    </>
  )
}

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const { showDisconnectAnimation, setShowDisconnectAnimation } = useWallet()

  return (
    <CustomThemeProvider>
      {/* Stacking Context Container */}
      <div className="relative min-h-screen">
        {/* Fixed Elements */}
        <nav className="fixed top-0 left-0 right-0 h-16 shadow-sm z-30 bg-white dark:bg-[#1A1B26]">
          <NavbarContent />
        </nav>

        {/* Ticker positioned below navbar */}
        {/*<div className="fixed top-16 left-0 right-0 z-10">
          <ConditionalCryptoStatsTicker />
        </div>*/}

        {/* Main Content */}
        <main className="pt-16 relative z-10">
          {children}
        </main>

        {/* Overlays and Alerts */}
        <WalletComponentsWrapper />
        <NetworkSwitchAlert /> {/*This line was added */}
        {showDisconnectAnimation && (
          <WalletDisconnectedAnimation
            onAnimationComplete={() => setShowDisconnectAnimation(false)}
          />
        )}
        <AutoDisconnectLayer />
      </div>
    </CustomThemeProvider>
  )
}

